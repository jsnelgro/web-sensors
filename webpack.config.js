// webpack.config.js
var path = require('path')

module.exports = {
  entry: ['./test/index.js'], // file extension after index is optional for .js files
  output: {
    path: path.join(__dirname, 'test'),
    filename: 'index.build.js'
  },
  devServer: {
    contentBase: path.join(__dirname),
    port: 8080
  }
}
