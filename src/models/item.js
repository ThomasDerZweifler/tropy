'use strict'

module.exports = {

  async all(db) {
    return await db.all(`
      SELECT id AS id, created_at AS created, updated_ad AS modified
      FROM subjects JOIN items USING (id)
      WHERE id NOT IN (SELECT id FROM trash)
      LIMIT 100`
    )
  },

  async deleted(db) {
    return await db.all(`
      SELECT id AS id, created_at AS created, updated_ad AS modified
      FROM subjects JOIN trash USING (id)
      LIMIT 100`
    )
  },

  async create(db, template) {
    const { id } = await db.run(`
      INSERT INTO subjects (template_id) VALUES (?);
      INSERT INTO items (id) VALUES (last_insert_rowid())`,
      template
    )

    return { id }
  },

  async delete(db, id) {
    return await db.run(
      'INSERT INTO trash (id) VALUES (?)', id
    )
  },

  async restore(db, id) {
    return await db.run(
      'DELETE FROM trash WHERE id = ?', id
    )
  },

  async prune(db) {
    return await db.run(`
      DELETE FROM subjects
      WHERE id IN (
        SELECT id
        FROM trash JOIN items USING (id)
        WHERE deleted_at < datetime("now", "-1 month"))`
    )
  }
}