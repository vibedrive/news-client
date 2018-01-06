var parser = require('rss-parser')
var sources = process.env.sources
var parallel = require('run-parallel')

var choo = require('choo')
var html = require('choo/html')

var app = choo()

app.route('*', mainView)
app.use(function (state, emitter) {
  state.fetching = true
  state.entries = []

  emitter.on('DOMContentLoaded', function () {
    fetchFeeds()
  })

  function fetchFeeds () {
    var jobs = sources.split('\n').map(fetchingJob)

    parallel(jobs, function () {
      state.entries.sort(sortByDate)
      state.fetching = false

      emitter.emit('render')
    })
  }

  function fetchingJob (source) {
    return function (done) {
      parser.parseURL(source, function (err, parsed) {
        if (err) return console.error(err)
        parsed.feed.entries.forEach(entry => {
          state.entries.push(entry)
        })

        done()
      })
    }
  }
})

app.mount('body')

function mainView (state, emit) {
  return html`
    <body>
      <p>news</p>
      ${state.fetching ? 'fetching...' : ''}
      ${state.entries.map(entryEl)}
    </body>`
}

function entryEl (entry) {
  return html`
    <p>
      ${entry.pubDate}
      <br>
      <a href=${entry.link}>${entry.title}</a>
    </p>`
}

function sortByDate (a, b) {
  var date1 = new Date(a.isoDate)
  var date2 = new Date(b.isoDate)
  if (date1 > date2) return -1
  if (date1 < date2) return 1
  return 0
}
