import smtplib
from email.mime.text import MIMEText
from app.config import settings

def send_otp_email(to_email: str, otp_code: str):
    try:
        from_email = settings.email_address
        password = settings.email_password
        
        # 邮件配置が設定されていない場合はスキップ
        if not from_email or not password:
            print("Email configuration not set, skipping email send")
            return
            
        subject = "あなたのワンタイムパスワード"
        body = f"あなたのワンタイムパスワードは: {otp_code} です。"
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(from_email, password)
            server.send_message(msg)
            print(f"OTP email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send OTP email: {e}")
        # 邮件发送失败时不抛出异常，让登录流程继续
        pass