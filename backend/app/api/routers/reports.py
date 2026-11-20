from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database.database import get_db
from app.models.order import Order
from app.models.user import User

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])


def build_date_filters(start_date: date | None, end_date: date | None):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="start_date must be on or before end_date.",
        )

    filters = []
    if start_date:
        filters.append(func.date(Order.created_at) >= start_date.isoformat())
    if end_date:
        filters.append(func.date(Order.created_at) <= end_date.isoformat())
    return filters


@router.get("/sales")
def get_sales_report(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    filters = build_date_filters(start_date, end_date)
    daily_totals = (
        db.query(
            func.date(Order.created_at).label("date"),
            func.count(Order.id).label("orders"),
            func.coalesce(func.sum(Order.total_amount), 0).label("sales"),
        )
        .filter(*filters)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    statuses = (
        db.query(Order.status, func.count(Order.id))
        .filter(*filters)
        .group_by(Order.status)
        .all()
    )
    return {
        "start_date": start_date,
        "end_date": end_date,
        "orders_count": sum(row.orders for row in daily_totals),
        "gross_sales": round(sum(float(row.sales) for row in daily_totals), 2),
        "daily": [
            {
                "date": row.date,
                "orders": row.orders,
                "sales": round(float(row.sales), 2),
            }
            for row in daily_totals
        ],
        "orders_by_status": {
            status or "Unknown": count for status, count in statuses
        },
    }
