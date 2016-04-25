'use strict'

require('shelljs/make')

const assert = require('assert')
const pkg = require('../package')
const log = require('./log')
const moment = require('moment')

const { resolve, join, dirname } = require('path')
const { assign } = Object
const { Database } = require('../lib/common/db')
const { Migration } = require('../lib/common/migration')

const home = resolve(__dirname, '..')
const DB = join(home, 'db', 'db.sqlite')


target.create = (args = []) => {
  return create(args[0])
    .tap((db) => info(`created as ${db.path}`))
    .call('close')
}

target.migrate = () => {
  const tmp = join(home, 'tmp.db')

  rm('-f', tmp)
  rm('-f', Database.schema)

  const db = new Database(tmp)

  return db
    .migrate()
    .then(() => db.version())
    .then(version => {
      (`--
-- This file is auto-generated by executing all current
-- migrations. Instead of editing this file, please create
-- migrations to incrementally modify the database, and
-- then regenerate this schema file.
--
-- To create a new empty migration, run:
--   npm run db -- migration -- [name] [sql|js]
--
-- To re-generate this file, run:
--   npm run db -- migrate
--

-- Save the current migration number
PRAGMA user_version=${version};

-- Load sqlite3 .dump
`
      ).to(Database.schema)

      exec(`sqlite3 ${tmp} .dump >> ${Database.schema}`)
      'PRAGMA foreign_keys=ON;'.toEnd(Database.schema)

      return [Database.schema, version]
    })

    .tap(([schema, version]) => {
      info(`schema migrated to #${version}`)
      info(`schema written to #${schema}`)
    })

    .finally(() => db.close())
    .finally(() => rm(tmp))
}

target.viz = (args = []) => {
  const sql = args[0] || DB
  const pdf = args[1] || join(home, 'doc', 'db.pdf')
  const viz = join(home, 'node_modules', '.bin', 'sqleton')

  assert(test('-f', sql), `${sql} not found: run \`npm run db -- create\``)
  mkdir('-p', dirname(pdf))

  const db = new Database(sql)

  return db
    .version()
    .then(v => {
      exec([
        viz,
        `-t "${pkg.productName} #${v}"`,
        '-f "Helvetica Neue"',
        `-o ${pdf}`,
        sql
      ].join(' '))

      return [pdf, v]
    })

    .tap(() => info(`visual written to ${pdf}`))

    .finally(() => db.close())
}

target.migration = (args = []) => {
  if (args.length < 2) args.push('sql')

  const [type, name] = args.reverse()
  const file = migration(name, type)

  const content = (type === 'sql') ?  '' : `'use strict'
exports.up = function ${name}$up(tx) {
  // Return a promise here!
}`

  content.to(join(Migration.root, file))
  info(`migration ${file} created...`)
}

target.all = () =>
  target.migrate()
    .then(() => target.create())
    .then(() => target.viz())


target.rules = () => {
  for (let rule in target) info(rule)
}


function info(msg) {
  log.info(msg, { tag: 'db' })
}

function create(file) {
  file = file || DB
  rm('-f', file)

  return new Database(file).read(Database.schema)
}

function migration(name, type) {
  assert(type === 'sql' || type === 'js',
      `migration type '${type}' not supported`)

  return [moment().format('YYMMDDHHmm'), name, type]
    .filter(x => x)
    .join('.')
}


module.exports = assign({}, target)