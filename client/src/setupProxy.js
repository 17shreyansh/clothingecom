const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for /api
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://bhuvicreations.com',
      changeOrigin: true,
      secure: true,
      headers: {
        Origin: 'https://bhuvicreations.com'
      }
    })
  );

  // Proxy for /uploads
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'https://api.bhuvicreations.com',
      changeOrigin: true,
      secure: true,
      headers: {
        Origin: 'https://bhuvicreations.com'
      }
    })
  );
};
