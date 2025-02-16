from fastapi import APIRouter, HTTPException
from typing import List, Optional
import requests
from datetime import datetime
import os
from dotenv import load_dotenv
from app.services.ml_service import calculate_technical_indicators, predict_next_days

load_dotenv()

router = APIRouter()
API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
BASE_URL = "https://www.alphavantage.co/query"

@router.get("/{symbol}")
async def get_stock_data(symbol: str):
    try:
        # Get quote data
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": API_KEY
        }
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        quote_data = response.json()

        # Get company overview
        overview_params = {
            "function": "OVERVIEW",
            "symbol": symbol,
            "apikey": API_KEY
        }
        overview_response = requests.get(BASE_URL, params=overview_params)
        overview_response.raise_for_status()
        overview_data = overview_response.json()

        if "Global Quote" not in quote_data or not quote_data["Global Quote"]:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")

        quote = quote_data["Global Quote"]
        
        return {
            "symbol": symbol,
            "company_name": overview_data.get("Name", "Unknown"),
            "current_price": float(quote.get("05. price", 0)),
            "change_percent": float(quote.get("10. change percent", "0").rstrip('%')),
            "volume": int(quote.get("06. volume", 0)),
            "market_cap": float(overview_data.get("MarketCapitalization", 0)),
            "last_updated": datetime.now().isoformat()
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching stock data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching data for {symbol}: {str(e)}")

@router.get("/{symbol}/history")
async def get_stock_history(symbol: str, period: Optional[str] = "1mo"):
    try:
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "apikey": API_KEY,
            "outputsize": "compact"
        }
        
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

        if "Time Series (Daily)" not in data:
            raise HTTPException(status_code=404, detail=f"No historical data found for {symbol}")

        daily_data = data["Time Series (Daily)"]
        
        historical_data = [
            {
                "Date": date,
                "Open": float(values["1. open"]),
                "High": float(values["2. high"]),
                "Low": float(values["3. low"]),
                "Close": float(values["4. close"]),
                "Volume": int(values["5. volume"])
            }
            for date, values in daily_data.items()
        ]

        # Sort by date
        historical_data.sort(key=lambda x: x["Date"])
        
        # Calculate technical indicators
        technical_indicators = calculate_technical_indicators(historical_data)
        
        # Make predictions
        predictions = predict_next_days(historical_data)
        
        return {
            "symbol": symbol,
            "data": historical_data,
            "technical_indicators": technical_indicators,
            "predictions": predictions
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching stock history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching history for {symbol}: {str(e)}")
