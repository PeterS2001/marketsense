import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  data: {
    Date: string;
    Close: number;
  }[];
  predictions: {
    Date: string;
    Predicted_Close: number;
  }[];
  symbol: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, predictions, symbol }) => {
  const chartData = {
    labels: [...data.map(item => new Date(item.Date).toLocaleDateString()), 
             ...predictions.map(item => new Date(item.Date).toLocaleDateString())],
    datasets: [
      {
        label: 'Historical Price',
        data: [...data.map(item => item.Close), ...Array(predictions.length).fill(null)],
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Predicted Price',
        data: [...Array(data.length).fill(null), ...predictions.map(item => item.Predicted_Close)],
        borderColor: 'rgb(249, 115, 22)', // Orange
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#f1f5f9', // Light text for dark mode
        },
      },
      title: {
        display: true,
        text: `${symbol} Stock Price History and Predictions`,
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: '600',
        },
        color: '#f1f5f9', // Light text for dark mode
        padding: {
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)', // Dark background
        titleColor: '#f1f5f9', // Light text
        bodyColor: '#94a3b8', // Lighter gray text
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: '600',
        },
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        border: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          },
          font: {
            family: "'Inter', sans-serif",
          },
          color: '#94a3b8', // Light gray text
        },
      },
      x: {
        border: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "'Inter', sans-serif",
          },
          color: '#94a3b8', // Light gray text
        },
      },
    },
  };

  return (
    <div style={{ height: '500px', backgroundColor: 'rgba(30, 41, 59, 1)' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};
