import React from 'react';
import './Charts.css';

const ChartLoader = ({ height = 300 }) => {
  return (
    <div className="chart-loader" style={{ height: `${height}px` }}>
      <div className="shimmer-wave"></div>
    </div>
  );
};

export default ChartLoader;