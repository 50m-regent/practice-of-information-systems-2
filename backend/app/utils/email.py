import smtplib
from email.mime.text import MIMEText
from app.config import settings

def send_otp_email(to_email: str, otp_code: str):
    from_email = settings.email_address
    password = settings.email_password
    subject = "あなたのワンタイムパスワード"
    body = f"あなたのワンタイムパスワードは: {otp_code} です。"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(from_email, password)
        server.send_message(msg)