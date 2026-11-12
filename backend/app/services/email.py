import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    pass


def send_otp_email(receiver_email: str, otp: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = "MediKart - Your OTP"
    message["From"] = settings.SMTP_EMAIL
    message["To"] = receiver_email

    expiry = settings.OTP_EXPIRE_MINUTES
    message.attach(MIMEText(
        f"Your MediKart verification code is {otp}. "
        f"It expires in {expiry} minutes. If you did not request this code, ignore this email.",
        "plain",
        "utf-8",
    ))
    message.attach(MIMEText(
        "<html><body>"
        "<p>Your MediKart verification code is:</p>"
        f'<p style="font-size:24px;font-weight:bold;letter-spacing:4px">{otp}</p>'
        f"<p>This code expires in {expiry} minutes.</p>"
        "<p>If you did not request this code, you can ignore this email.</p>"
        "</body></html>",
        "html",
        "utf-8",
    ))

    try:
        context = ssl.create_default_context()
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(
                settings.SMTP_HOST,
                settings.SMTP_PORT,
                timeout=15,
                context=context,
            ) as server:
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(message)
        else:
            with smtplib.SMTP(
                settings.SMTP_HOST,
                settings.SMTP_PORT,
                timeout=15,
            ) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
                server.send_message(message)
    except (OSError, smtplib.SMTPException, ssl.SSLError) as error:
        logger.exception("MediKart OTP email delivery failed for %s", receiver_email)
        raise EmailDeliveryError("OTP email delivery failed") from error
