import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_otp_email(receiver_email: str, otp: str):

    message = EmailMessage()

    message["Subject"] = "MediKart - Your OTP"
    message["From"] = settings.SMTP_EMAIL
    message["To"] = receiver_email

    message.set_content(
        f"""
Hello,

Your MediKart verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
MediKart Team
"""
    )

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:

        server.starttls()

        server.login(
            settings.SMTP_EMAIL,
            settings.SMTP_PASSWORD
        )

        server.send_message(message)