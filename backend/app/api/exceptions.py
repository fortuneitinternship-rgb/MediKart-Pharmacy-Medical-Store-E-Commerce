"""Central exception handling (BE-047).

Every error the API returns has the same JSON shape:

    {
      "detail":  "<human readable text>"  or  [ {field errors} ] (422 only),
      "message": "<short human readable text>",
      "code":    "<machine readable code, e.g. http_404, validation_error>"
    }

`detail` is kept for backward compatibility: the React app reads it.
"""
import logging

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings

logger = logging.getLogger("medikart.errors")


def _body(detail, message: str, code: str) -> dict:
    return {"detail": detail, "message": message, "code": code}


def _validation_message(errors: list[dict]) -> str:
    parts = []
    for error in errors[:3]:
        location = [str(p) for p in error.get("loc", []) if p not in ("body", "query", "path")]
        field = ".".join(location)
        text = error.get("msg", "Invalid value")
        parts.append(f"{field}: {text}" if field else text)
    return "; ".join(parts) or "Validation failed."


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    message = detail if isinstance(detail, str) else "Request failed."
    return JSONResponse(
        status_code=exc.status_code,
        content=_body(detail, message, f"http_{exc.status_code}"),
        headers=getattr(exc, "headers", None),
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in jsonable_encoder(exc.errors(), custom_encoder={Exception: str}):
        message = str(error.get("msg", "Invalid value"))
        if message.startswith("Value error, "):
            message = message[len("Value error, "):]
        # Never echo the submitted value back (it can contain passwords).
        errors.append({"type": error.get("type"), "loc": error.get("loc"), "msg": message})
    return JSONResponse(
        status_code=422,
        content=_body(errors, _validation_message(errors), "validation_error"),
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    logger.warning("Integrity error on %s %s: %s", request.method, request.url.path, exc.orig)
    message = "This record conflicts with existing data."
    return JSONResponse(status_code=409, content=_body(message, message, "integrity_error"))


async def database_error_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database error on %s %s", request.method, request.url.path)
    unavailable = isinstance(exc, OperationalError)
    message = (
        "The database is temporarily unavailable. Please try again."
        if unavailable
        else "A database error occurred. Please try again."
    )
    if settings.APP_ENV == "development":
        message = f"{message} [{type(exc).__name__}: {getattr(exc, 'orig', exc)}]"
    return JSONResponse(
        status_code=503 if unavailable else 500,
        content=_body(message, message, "database_error"),
    )


async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    message = "Internal server error. Please try again later."
    if settings.APP_ENV == "development":
        message = f"{message} [{type(exc).__name__}: {exc}]"
    return JSONResponse(status_code=500, content=_body(message, message, "internal_error"))


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(SQLAlchemyError, database_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
