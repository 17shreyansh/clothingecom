import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, LabelList 
} from 'recharts';
import ChartLoader from './ChartLoader';
import api from '../../services/api';
import './Charts.css';

const TopProductsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/top-products');
        if (response.data.success) {
          // Process data to fit chart format
          const chartData = response.data.products.map(product => ({
            name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
            sales: product.soldCount,
            fullName: product.name,
            _id: product._id
          }));
          setData(chartData);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
        // Use sample data if API fails
        setData(getSampleData());
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  // Sample data generator for fallback
  const getSampleData = () => {
    return [
      { name: 'Premium Cotton Shirt', sales: 42, fullName: 'Premium Cotton Shirt' },
      { name: 'Slim Fit Jeans', sales: 38, fullName: 'Slim Fit Jeans' },
      { name: 'Casual Hoodie', sales: 34, fullName: 'Casual Hoodie' },
      { name: 'Summer Dress', sales: 29, fullName: 'Summer Dress' },
      { name: 'Leather Jacket', sales: 25, fullName: 'Leather Jacket' }
    ];
  };

  const colors = [
    'var(--primary-color)',
    'var(--success-color)',
    'var(--info-color)',
    'var(--warning-color)',
    'var(--error-color)'
  ];

  if (loading) {
    return <ChartLoader height={300} />;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top Selling Products</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
          <XAxis 
            type="number"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-color)' }}
            tickLine={{ stroke: 'var(--border-color)' }}
            width={100}
          />
          <Tooltip 
            formatter={(value, name, props) => [`${value} units`, 'Sales']}
            labelFormatter={(label) => props => props.payload.fullName || label}
            contentStyle={{ 
              backgroundColor: 'var(--bg-primary)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Bar 
            dataKey="sales" 
            animationDuration={1500}
            animationEasing="ease-out"
            radius={[0, 4, 4, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
            <LabelList dataKey="sales" position="right" fill="var(--text-primary)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;