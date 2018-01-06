var fs = require('fs')
var path = require('path')
var browserify = require('browserify')
var yoyoify = require('yo-yoify')
var uglifyify = require('uglifyify')
var mkdirp = require('mkdirp')
var loadFeeds = require('./load-feeds')

const FROM = path.join(__dirname, '../src/index.js')
const TO = path.join(__dirname, `../dist/bundle.js`)

loadFeeds()

mkdirp.sync('dist')

fs.writeFileSync(path.join(__dirname, '../dist/index.html'), fs.readFileSync(path.join(__dirname, '../src/index.html')))

var b = browserify(FROM)
  .transform('loose-envify')
  .transform(yoyoify)
  .transform(uglifyify)

b.bundle()
  .on('error', done)
  .on('end', done)
  .pipe(fs.createWriteStream(TO))

function done (err) {
  if (err) throw new Error(err)
  console.log('done!')
}
