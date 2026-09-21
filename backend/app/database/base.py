from app.database.database import Base

# ------------------------------------------------------------
# Import all models so SQLAlchemy knows about them
# ------------------------------------------------------------

from app.models.user import User
from app.models.password_reset import PasswordResetOTP
from app.models.address import Address
from app.models.newsletter import Newsletter
from app.models.card import Card
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
