var fs = require('fs')
var path = require('path')

module.exports = function () {
  var src = '../data/feeds'
  process.env.sources = fs.readFileSync(path.join(__dirname, src)).toString()
}
