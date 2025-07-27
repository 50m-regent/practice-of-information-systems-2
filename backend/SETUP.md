# 🚀 **Project Setup Guide for Team Members**

## 📋 **Prerequisites**
- Python 3.11+
- Node.js 18+ (for frontend)
- OpenAI API key

## 🔧 **Backend Setup**

### 1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### 2. **Environment Variables**
Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///test.db
```

### 3. **Database Setup**
**⚠️ IMPORTANT: Follow these steps exactly to avoid migration issues**

```bash
# Run the database setup script (safely handles existing data)
python setup_database.py
```

**What this script does:**
- ✅ **Preserves existing data** - Never deletes your database
- ✅ **Checks current state** - Sees what's already set up
- ✅ **Adds missing tables** - Only creates what's needed
- ✅ **Fixes migration issues** - Handles conflicts automatically

### 4. **Start Backend Server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📱 **Frontend Setup**

### 1. **Install Dependencies**
```bash
cd frontend
npm install
```

### 2. **Start Frontend**
```bash
npx expo start
```

## 🧪 **Testing the Setup**

### 1. **Backend Health Check**
```bash
curl http://localhost:8000/health
```

### 2. **Database Tables Check**
```bash
python -c "
import sqlite3
conn = sqlite3.connect('test.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\"')
tables = [row[0] for row in cursor.fetchall()]
print('Database tables:', tables)
conn.close()
"
```

## 🚨 **Common Issues & Solutions**

### **Migration Error: "duplicate column name"**
```bash
# Solution: Run the safe setup script
python setup_database.py
```

### **Chat Tables Missing**
```bash
# Solution: Run the setup script (it will create missing tables)
python setup_database.py
```

### **Database Locked or Corrupted**
```bash
# Only if absolutely necessary - backup your data first!
# Solution: Restart the application and run setup script
python setup_database.py
```

## 📊 **Project Structure**
```