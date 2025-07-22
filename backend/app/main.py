from fastapi import FastAPI
import uvicorn

from app.routers import auth, user, friends, vital_data, objectives, chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Health Tracking API", 
    description="健康管理アプリケーションAPI", 
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(friends.router)
app.include_router(vital_data.router)
app.include_router(objectives.router)
app.include_router(chat.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 或指定你的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Health Tracking API is running"}

def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()