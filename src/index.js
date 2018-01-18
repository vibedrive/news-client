var sources = process.env.sources
var parser = require('rss-parser')
var parallel = require('run-parallel')
var choo = require('choo')
var html = require('choo/html')
const dateOpts = {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}

var Spinner = require('bytespin')
var spinner = Spinner()
var app = choo()

app.route('*', mainView)
app.use(function (state, emitter) {
  state.sources = sources.split('\n').filter(x => x)
  state.fetching = true
  state.entries = []

  emitter.on('DOMContentLoaded', function () {
    fetchFeeds()
  })

  function fetchFeeds () {
    var jobs = state.sources.map(fetchingJob)

    parallel(jobs, function () {
      state.entries.sort(sortByDate)
      state.fetching = false

      emitter.emit('render')
    })
  }

  function fetchingJob (source) {
    return function (done) {
      try {
        var url = new URL(source)
        parser.parseURL(url.href, function (err, parsed) {
          if (err) return console.error(err)
          parsed.feed.entries.forEach(entry => {
            entry.date = new Date(entry.isoDate)
            state.entries.push(entry)
          })

          done()
        })
      } catch (err) {
        console.info(err)
      }
    }
  }
})

app.mount('main')

function mainView (state, emit) {
  return html`
    <main class="pa3">
      ${sidebar(state, emit)}
      <p>News</p>
      ${spinner.render(state.fetching)}
      <ul class="pl0">
        ${state.entries.slice(0, 50).map(entryEl)}
      </ul>
    </main>`
}

function entryEl (entry) {
  return html`
    <li class="list mb3">
      <a href=${entry.link}>${entry.title}</a>
      <br>
      ${entry.date.toLocaleDateString('en-CA', dateOpts)}
    </li>`
}

function sortByDate (a, b) {
  if (a.date > b.date) return -1
  if (a.date < b.date) return 1
  return 0
}

function sidebar (state, emit) {
  return html`
    <div class="fixed top-0 right-0 h-100 bl b--black pa3 w-40">
      <p>Sources</p>
      <ul>
        ${state.sources.map(source => html`<li>${source}</li>`)}
      </ul>
    </div>`
}