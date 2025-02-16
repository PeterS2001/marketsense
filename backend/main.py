from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stocks
import uvicorn

app = FastAPI(title="MarketSense API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stocks.router, prefix="/stocks", tags=["stocks"])

@app.get("/")
async def root():
    return {"message": "Welcome to MarketSense API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
