'use strict'

const tmpdir = require('../support/tmpdir')

const { join } = require('path')
const { unlinkAsync: rm } = require('fs')
const { using } = require('bluebird')

describe('Database', () => {
  const { Database, Connection } = __require('common/db')

  describe('given a database file', () => {
    let db
    const dbFile = join(tmpdir, 'db_test.sqlite')

    before(() => {
      db = new Database(dbFile)

      sinon.spy(db.pool, 'acquire')
      sinon.spy(db.pool, 'release')
    })

    after(() =>
      db.close().then(() => rm(dbFile)))

    afterEach(() => {
      db.pool.acquire.reset()
      db.pool.release.reset()
    })

    describe('constructor', () => {
      it('creates an empty connection pool', () => {
        expect(db.size).to.be.zero
      })
    })


    describe('#acquire()', () => {
      it('returns a disposable connection', () => (
        using(db.acquire(), c => {
          expect(db.pool.acquire).to.have.been.called
          expect(db.pool.release).not.to.have.been.called

          expect(c).to.be.instanceof(Connection)
        })
          .then(() => {
            expect(db.pool.release).to.have.been.called
          })
      ))

      it('draws from the connection pool', () => {
        let count = db.ready

        return using(db.acquire(), c1 => {
          expect(db.ready).to.be.below(count)

          return using(db.acquire(), c2 => {
            expect(db.size).to.be.at.least(2)
            expect(c1).not.to.equal(c2)
          })
        })
      })

      it('rejects on error', () => (
        expect(
          using(db.acquire(), () => { throw 'error' })
        ).to.eventually.be.rejected
      ))

      it('releases on error', () => (
        using(db.acquire(), () => { throw 'error' })
          .catch(() => expect(db.pool.release).to.have.been.called)
      ))
    })

    describe('#exec()', () => {
      it('executes arbitrary sql', () => (
        expect(
          db.exec('SELECT * FROM sqlite_master;')
        ).to.eventually.be.fulfilled
      ))

      it('rejects on error', () => (
        expect(
          db.exec('SELECT foobar FROM sqlite_master;')
        ).to.eventually.be.rejected
      ))

      it('acquires connection for every call', () => {
        expect(db.busy).to.eql(0)
        db.exec('SELECT * FROM sqlite_master;')
        expect(db.busy).to.eql(1)
        db.exec('SELECT * FROM sqlite_master;')
        expect(db.busy).to.eql(2)
      })

      it('re-uses connections if possible', () => (
        expect((async function () {
          expect(db.busy).to.eql(0)
          await db.exec('CREATE TABLE exec (a);')
          expect(db.busy).to.eql(0)
          await db.exec('DROP TABLE exec;')
          expect(db.busy).to.eql(0)
        })()).to.eventually.be.fulfilled
      ))

      it('ignores comments', () => (
        expect(db.exec(
          `-- A comment
          SELECT * FROM sqlite_master; -- Another comment`
        )).to.eventually.be.fulfilled
      ))
    })

    describe('#seq()', () => {
      it('exposes a connection', () => (
        expect(db.seq(c => {
          expect(db.busy).to.eql(1)
          c.run('SELECT * FROM sqlite_master')
          c.run('SELECT * FROM sqlite_master')
          expect(db.busy).to.eql(1)
        })).to.eventually.be.fulfilled
      ))

      it('rejects on error', () => (
        expect(db.seq(() => { throw 'error' })).to.eventually.be.rejected
      ))

      it('does not roll back on error', () => (
        expect(
          db.seq(async function (c) {
            await c.run('CREATE TABLE s1 (a)')
            await c.run('XNSERT INTO s1 (a) VALUES (1)')

          })
            .catch(() => db.run('INSERT INTO s1 (a) VALUES (2)'))
            .finally(() => db.run('DROP TABLE s1'))

        ).to.eventually.be.fulfilled
      ))
    })

    describe('#transaction()', () => {
      it('rejects on error', () => (
        expect(
          db.transaction(() => { throw 'error' })
        ).to.eventually.be.rejected
      ))

      it('rolls back on error', () => (
        expect(
          db.transaction(async function (tx) {
            await tx.run('CREATE TABLE t1 (a)')
            await tx.run('XNSERT INTO t1 (a) VALUES (1)')

          })
            .catch(() => db.run('INSERT INTO t1 (a) VALUES (2)'))

        ).to.eventually.be.rejected
      ))

      it('commits on success', () => (
        expect(
          db.transaction(async function (tx) {
            await tx.run('CREATE TABLE t1 (a)')
            await tx.run('INSERT INTO t1 (a) VALUES (42)')

            await expect(db.get('SELECT a FROM t1'))
              .to.eventually.be.rejected

          }).then(() => db.get('SELECT a FROM t1'))

        ).to.eventually.be.fulfilled
          .and.have.property('a', 42)
      ))
    })
  })
})