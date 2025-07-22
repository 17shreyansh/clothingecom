const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://clothingecom.onrender.com',
      changeOrigin: true,
      secure: false,
      headers: {
        'Origin': 'https://clothingecom.vercel.app'
      }
    })
  );
};