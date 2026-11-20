import argparse
import sys

from app.core.config import settings
from app.services.email import EmailDeliveryError, send_otp_email


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Send a standalone MediKart Gmail SMTP test message."
    )
    parser.add_argument(
        "recipient",
        nargs="?",
        help="Email address to receive the test message (prompted if omitted).",
    )
    args = parser.parse_args()
    recipient = args.recipient or input("Test recipient email: ").strip()

    missing = [
        name
        for name, value in (
            ("SMTP_HOST", settings.SMTP_HOST),
            ("SMTP_PORT", settings.SMTP_PORT),
            ("SMTP_EMAIL", settings.SMTP_EMAIL),
            ("SMTP_PASSWORD", settings.SMTP_PASSWORD),
        )
        if not value
    ]
    if missing:
        print(
            f"SMTP is not configured. Set {', '.join(missing)} in backend/.env.",
            file=sys.stderr,
        )
        return 1
    if not recipient:
        print("A recipient email address is required.", file=sys.stderr)
        return 2

    try:
        send_otp_email(recipient, "123456")
    except EmailDeliveryError as error:
        print(f"Email test failed: {error}", file=sys.stderr)
        return 1

    print(f"SMTP test email sent to {recipient}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
