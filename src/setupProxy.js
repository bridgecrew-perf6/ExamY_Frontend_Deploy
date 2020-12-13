const {createProxyMiddleware} = require('http-proxy-middleware')
module.exports = function(app){
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://examy-server.herokuapp.com',
      changeOrigin: true,
    })
  )
}