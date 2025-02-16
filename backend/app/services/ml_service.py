import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict
import pandas as pd
from sklearn.linear_model import LinearRegression

def calculate_technical_indicators(data: List[Dict]) -> Dict:
    df = pd.DataFrame(data)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    
    # Calculate 20-day moving average
    df['MA20'] = df['Close'].rolling(window=20).mean()
    
    # Calculate RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Calculate MACD
    exp1 = df['Close'].ewm(span=12, adjust=False).mean()
    exp2 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp1 - exp2
    df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
    
    latest = df.iloc[-1]
    
    return {
        'ma20': float(latest['MA20']) if not pd.isna(latest['MA20']) else None,
        'rsi': float(latest['RSI']) if not pd.isna(latest['RSI']) else None,
        'macd': float(latest['MACD']) if not pd.isna(latest['MACD']) else None,
        'signal_line': float(latest['Signal_Line']) if not pd.isna(latest['Signal_Line']) else None,
        'trend': 'Bullish' if latest['Close'] > latest['MA20'] else 'Bearish',
        'rsi_signal': 'Oversold' if latest['RSI'] < 30 else 'Overbought' if latest['RSI'] > 70 else 'Neutral',
        'macd_signal': 'Buy' if latest['MACD'] > latest['Signal_Line'] else 'Sell'
    }

def predict_next_days(data: List[Dict], days: int = 7) -> List[Dict]:
    df = pd.DataFrame(data)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date')
    
    # Create features (use last 30 days of data)
    X = np.arange(len(df[-30:])).reshape(-1, 1)
    y = df['Close'].values[-30:]
    
    # Fit linear regression
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next days
    future_dates = pd.date_range(
        start=df['Date'].iloc[-1] + pd.Timedelta(days=1),
        periods=days,
        freq='D'
    )
    
    X_future = np.arange(len(df[-30:]), len(df[-30:]) + days).reshape(-1, 1)
    predictions = model.predict(X_future)
    
    return [
        {
            'Date': date.strftime('%Y-%m-%d'),
            'Predicted_Close': float(pred)
        }
        for date, pred in zip(future_dates, predictions)
    ]
