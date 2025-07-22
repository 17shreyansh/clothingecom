import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TestConnection = () => {
  const [status, setStatus] = useState('Testing connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/health');
        setStatus(`Connection successful! Server responded: ${JSON.stringify(response.data)}`);
      } catch (err) {
        setError(`Error connecting to API: ${err.message}`);
        console.error('Connection test error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Connection Test</h2>
      {status && <div style={{ marginBottom: '10px' }}>{status}</div>}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
    </div>
  );
};

export default TestConnection;