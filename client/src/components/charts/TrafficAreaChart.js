import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import ChartLoader from './ChartLoader';
import api from '../../services/api';
import './Charts.css';

const TrafficAreaChart = ({ timeRange = '7d' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrafficData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/admin/traffic-analytics?timeRange=${timeRange}`);
        if (response.data.success) {
          setData(response.data.trafficData);
        }
      } catch (error) {
        console.error('Error fetching traffic data:', error);
        // Use sample data if API fails
        setData(getSampleData(timeRange));
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
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
        visitors: Math.floor(Math.random() * 500) + 100,
        pageViews: Math.floor(Math.random() * 1500) + 300,
        conversion: Math.floor(Math.random() * 50) + 10
      });
    }
    
    return result;
  };

  if (loading) {
    return <ChartLoader height={300} />;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Site Traffic</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--info-color)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--info-color)" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success-color)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--success-color)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-primary)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Area 
            type="monotone" 
            dataKey="visitors" 
            name="Visitors" 
            stroke="var(--primary-color)" 
            fillOpacity={1}
            fill="url(#colorVisitors)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Area 
            type="monotone" 
            dataKey="pageViews" 
            name="Page Views" 
            stroke="var(--info-color)" 
            fillOpacity={1}
            fill="url(#colorPageViews)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Area 
            type="monotone" 
            dataKey="conversion" 
            name="Conversions" 
            stroke="var(--success-color)" 
            fillOpacity={1}
            fill="url(#colorConversion)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficAreaChart;