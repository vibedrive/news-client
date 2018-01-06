var path = require('path')
var budo = require('budo')
var loadFeeds = require('./load-feeds')

loadFeeds()

var b = budo('src/index.js:bundle.js', {
  dir: ['dist', 'assets'],
  port: 1111,
  live: true,
  ssl: true,
  pushstate: true,
  stream: process.stdout,
  watchGlob: 'src/**/*.{js}',
  browserify: {
    transform: 'loose-envify'
  }
})

b.on('watch', (e, file) => {
  switch (path.extname(file)) {
    case '.js':
      loadFeeds()
      b.reload()
      break
    default:
      break
  }
})
