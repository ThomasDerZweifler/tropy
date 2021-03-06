'use strict'

const {
  createStore, applyMiddleware, combineReducers, compose
} = require('redux')

const { default: thunk } = require('redux-thunk')
const { default: createSagaMiddleware } = require('redux-saga')

const { log: logger, warn, debug } = require('../common/log')
const { seq, debounce, throttle, log } = require('../middleware')

const {
  intl,
  nav,
  ui,
  activities,
  columns,
  edit,
  photos,
  project,
  properties,
  qr,
  keymap,
  lists,
  notes,
  items,
  metadata,
  tags,
  history,
  vocab
} = require('../reducers')

const dev = (ARGS.dev || ARGS.debug)

module.exports = {
  create(init = {}) {

    const saga = createSagaMiddleware({
      logger,
      onError(error) {
        warn(`unhandled error in saga middleware: ${error.message}`)
        debug(error.stack)
      }
    })

    const reducer = combineReducers({
      intl,
      nav,
      ui,
      activities,
      columns,
      edit,
      photos,
      project,
      properties,
      qr,
      keymap,
      lists,
      notes,
      items,
      metadata,
      tags,
      history,
      vocab
    })

    const middleware = applyMiddleware(
      debounce,
      throttle,
      thunk,
      seq,
      log,
      saga
    )

    const enhancer = (dev && window.__REDUX_DEVTOOLS_EXTENSION__) ?
      compose(middleware, window.__REDUX_DEVTOOLS_EXTENSION__()) :
      middleware

    const store = createStore(reducer, init, enhancer)

    return { ...store, saga }
  }
}
