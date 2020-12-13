const {createProxyMiddleware} = require('http-proxy-middleware')
module.exports = function(app){
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://13.209.224.207:5000/api/',
      changeOrigin: true,
    })
  )
}