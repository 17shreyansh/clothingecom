import React from 'react';
import SalesLineChart from './SalesLineChart';
import TopProductsChart from './TopProductsChart';
import PaymentMethodsChart from './PaymentMethodsChart';
import TrafficAreaChart from './TrafficAreaChart';
import './Charts.css';

const DashboardAnalytics = ({ timeRange }) => {
  return (
    <div className="dashboard-analytics">
      <div className="analytics-grid">
        <div className="analytics-item analytics-item-full">
          <SalesLineChart timeRange={timeRange} />
        </div>
        <div className="analytics-item">
          <TopProductsChart />
        </div>
        <div className="analytics-item">
          <PaymentMethodsChart />
        </div>
        <div className="analytics-item analytics-item-full">
          <TrafficAreaChart timeRange={timeRange} />
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;