var sources = process.env.sources
var request = require('request-promise-native')
var choo = require('choo')
var html = require('choo/html')
const dateOpts = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}

var Spinner = require('bytespin')
var spinner = Spinner()
var app = choo()

app.route('*', mainView)
app.use(function (state, emitter) {
  state.sources = sources.split('\n').filter(x => x)
  state.fetching = true
  state.entries = []
  state.error = ''

  emitter.on('DOMContentLoaded', function () {
    fetchFeeds()
  })

  async function fetchFeeds () {
    try {
      state.entries = await request.post({
        url: 'https://mulberry-entrance.glitch.me/entries',
        body: { sources: state.sources },
        json: true
      })
    } catch (err) {
      console.error(err)
      state.error = `Couldn't fetch feeds :(`
      emitter.emit('render')
      return
    }

    state.fetching = false

    emitter.emit('render')
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
        ${state.entries.map(entryEl)}
      </ul>
    </main>`
}

function entryEl (entry) {
  return html`
    <li class="list mb3">
      <a href=${entry.link}>${entry.title}</a>
      <br>
      ${new Date(entry.date).toLocaleDateString('en-CA', dateOpts)}
    </li>`
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
