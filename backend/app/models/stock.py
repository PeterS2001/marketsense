from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    company_name = Column(String)
    current_price = Column(Float)
    change_percent = Column(Float)
    volume = Column(Integer)
    market_cap = Column(Float)
    last_updated = Column(DateTime)

class StockAnalysis(Base):
    __tablename__ = "stock_analysis"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    sentiment_score = Column(Float)
    technical_score = Column(Float)
    recommendation = Column(String)
    analysis_date = Column(DateTime)
