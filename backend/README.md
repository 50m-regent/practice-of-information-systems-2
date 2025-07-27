# ワンタイムパスワード送信設定方法

このシステムでは、ユーザにワンタイムパスワード（OTP）をメールで送信するために、SMTP を利用しています。  
そのため、以下の環境変数を `.env` ファイルに設定してください。

## .env ファイルの設定例（Gmail）

```env
EMAIL_ADDRESS=あなたのGmailアドレス
EMAIL_PASSWORD=Gmailのアプリパスワード（16桁の英数字）
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///test.db
```

## 🚀 **Team Setup Instructions**

### **Quick Setup for New Team Members:**

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up database (IMPORTANT):**
   ```bash
   python setup_database.py
   ```

3. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### **Detailed Setup Guide:**
See `SETUP.md` for comprehensive setup instructions and troubleshooting.

### **Key Features:**
- ✅ AI-powered health chat assistant
- ✅ Goal management (create, update, delete)
- ✅ Health data logging and tracking
- ✅ OTP-based authentication
- ✅ Real-time chat with conversation history