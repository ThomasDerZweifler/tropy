'use strict'

const { call, put, select } = require('redux-saga/effects')
const { Command } = require('./command')
const { TAG } = require('../constants')
const mod = require('../models')
const act = require('../actions')


class Load extends Command {
  static get action() { return TAG.LOAD }

  *exec() {
    return (yield call(mod.tag.load, this.options.db, this.action.payload))
  }
}


class Create extends Command {
  static get action() { return TAG.CREATE }

  *exec() {
    const { db } = this.options
    const { items, ...data } = this.action.payload

    const hasItems = (items && items.length > 0)
    if (data.id != null) data['tag_id'] = data.id

    const tag = yield call(db.transaction, async tx => {
      const tg = await mod.tag.create(tx, data)

      if (hasItems) {
        await mod.item.tags.add(tx, items.map(id => ({ id, tag: tg.id })))
      }

      return tg
    })

    if (hasItems) {
      yield put(act.item.tags.insert({ id: items, tags: [tag.id] }))
    }

    this.undo = act.tag.delete(tag.id)

    return tag
  }
}

class Save extends Command {
  static get action() { return TAG.SAVE }

  *exec() {
    const { db } = this.options
    const { id, name } = this.action.payload

    this.original = yield select(({ tags }) => tags[id])

    yield put(act.tag.update({ id, name }))
    yield call(mod.tag.save, db, { id, name })

    this.undo = act.tag.save(this.original)
  }

  *abort() {
    if (this.original) {
      yield put(act.tag.update(this.original))
    }
  }
}


class Delete extends Command {
  static get action() { return TAG.DELETE }

  *exec() {
    const { db } = this.options
    const id = this.action.payload

    const items = yield call(mod.tag.items, db, id)
    const tag = yield select(({ tags }) => tags[id])

    yield call(mod.tag.delete, db, [id])

    if (items.length > 0) {
      yield put(act.item.tags.remove({ id: items, tags: [id] }))
    }

    this.undo = act.tag.create({ ...tag, items })

    return id
  }
}


module.exports = {
  Create,
  Delete,
  Load,
  Save
}
