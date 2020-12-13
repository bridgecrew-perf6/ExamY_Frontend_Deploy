const {createProxyMiddleware} = require('http-proxy-middleware')
module.exports = function(app){
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://server-jik.herokuapp.com/',
      changeOrigin: true,
    })
  )
}