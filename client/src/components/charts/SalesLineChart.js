import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import ChartLoader from './ChartLoader';
import api from '../../services/api';
import './Charts.css';

const SalesLineChart = ({ timeRange = '7d' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/admin/sales-analytics?timeRange=${timeRange}`);
        if (response.data.success) {
          setData(response.data.salesData);
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Use sample data if API fails
        setData(getSampleData(timeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange]);

  // Sample data generator for fallback
  const getSampleData = (range) => {
    const days = range === '7d' ? 7 : 30;
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return result;
  };

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString()}`;
  };

  if (loading) {
    return <ChartLoader height={300} />;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Sales Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
          />
          <Tooltip 
            formatter={value => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: 'var(--bg-primary)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Line 
            type="monotone" 
            dataKey="sales" 
            name="Revenue" 
            stroke="var(--primary-color)" 
            strokeWidth={2}
            dot={{ fill: 'var(--primary-color)', r: 4 }}
            activeDot={{ r: 6, fill: 'var(--primary-color)', stroke: 'white', strokeWidth: 2 }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesLineChart;