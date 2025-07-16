const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
    },
  },
  devServer: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* chrome-extension:; worker-src 'self' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com chrome-extension:; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: chrome-extension:; connect-src 'self' http: https: ws: wss: chrome-extension:; frame-src 'self' chrome-extension:;"
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
        next();
      });

      return middlewares;
    }
  }
};
