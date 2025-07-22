import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip, Sector 
} from 'recharts';
import ChartLoader from './ChartLoader';
import api from '../../services/api';
import './Charts.css';

const PaymentMethodsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/payment-analytics');
        if (response.data.success) {
          setData(response.data.paymentData);
        }
      } catch (error) {
        console.error('Error fetching payment data:', error);
        // Use sample data if API fails
        setData(getSampleData());
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // Sample data generator for fallback
  const getSampleData = () => {
    return [
      { name: 'Credit Card', value: 45, color: 'var(--primary-color)' },
      { name: 'UPI', value: 30, color: 'var(--success-color)' },
      { name: 'Net Banking', value: 15, color: 'var(--info-color)' },
      { name: 'Cash on Delivery', value: 10, color: 'var(--warning-color)' }
    ];
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderActiveShape = (props) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="var(--text-primary)" className="pie-center-text">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="var(--text-secondary)" className="pie-center-value">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (loading) {
    return <ChartLoader height={300} />;
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Payment Methods</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || `var(--${['primary', 'success', 'info', 'warning', 'error'][index % 5]}-color)`} 
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{ 
              backgroundColor: 'var(--bg-primary)', 
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: 20 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentMethodsChart;