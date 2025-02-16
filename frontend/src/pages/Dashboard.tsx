import React, { useState } from 'react';
import { StockChart } from '../components/StockChart';
import axios from 'axios';

interface TechnicalIndicators {
  ma20: number;
  rsi: number;
  macd: number;
  signal_line: number;
  trend: string;
  rsi_signal: string;
  macd_signal: string;
}

export const Dashboard: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStockData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError('');
    
    try {
      const [infoResponse, historyResponse] = await Promise.all([
        axios.get(`http://localhost:8000/stocks/${symbol}`),
        axios.get(`http://localhost:8000/stocks/${symbol}/history`)
      ]);

      setStockData(infoResponse.data);
      setHistoricalData(historyResponse.data.data);
      setPredictions(historyResponse.data.predictions);
      setTechnicalIndicators(historyResponse.data.technical_indicators);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-100">MarketSense</h1>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="input-search"
              />
              <button
                onClick={fetchStockData}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {stockData && (
          <>
            {/* Stock Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card stats-card">
                <span className="stats-label">Current Price</span>
                <div className="stats-value">
                  ${stockData.current_price?.toFixed(2)}
                  <span className={`text-sm ml-2 ${stockData.change_percent >= 0 ? 'trend-up' : 'trend-down'}`}>
                    ({stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent?.toFixed(2)}%)
                  </span>
                </div>
              </div>
              
              <div className="card stats-card">
                <span className="stats-label">Volume</span>
                <div className="stats-value">{formatLargeNumber(stockData.volume)}</div>
              </div>
              
              <div className="card stats-card">
                <span className="stats-label">Market Cap</span>
                <div className="stats-value">${formatLargeNumber(stockData.market_cap)}</div>
              </div>
              
              <div className="card stats-card">
                <span className="stats-label">Company</span>
                <div className="stats-value">{stockData.company_name}</div>
              </div>
            </div>

            {/* Chart Section */}
            {historicalData.length > 0 && (
              <div className="chart-container">
                <h2 className="section-title">Price History & Predictions</h2>
                <StockChart 
                  data={historicalData} 
                  predictions={predictions}
                  symbol={symbol} 
                />
              </div>
            )}

            {/* Technical Analysis */}
            {technicalIndicators && (
              <div className="card">
                <h2 className="section-title">Technical Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <span className="stats-label">Moving Average (20-day)</span>
                    <div className="stats-value">${technicalIndicators.ma20?.toFixed(2)}</div>
                    <span className={`indicator-badge ${technicalIndicators.trend.toLowerCase()}`}>
                      {technicalIndicators.trend}
                    </span>
                  </div>
                  
                  <div>
                    <span className="stats-label">RSI (14-day)</span>
                    <div className="stats-value">{technicalIndicators.rsi?.toFixed(2)}</div>
                    <span className={`indicator-badge ${technicalIndicators.rsi_signal.toLowerCase()}`}>
                      {technicalIndicators.rsi_signal}
                    </span>
                  </div>
                  
                  <div>
                    <span className="stats-label">MACD</span>
                    <div className="stats-value">{technicalIndicators.macd?.toFixed(2)}</div>
                    <span className={`indicator-badge ${technicalIndicators.macd_signal.toLowerCase() === 'buy' ? 'bullish' : 'bearish'}`}>
                      {technicalIndicators.macd_signal}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
