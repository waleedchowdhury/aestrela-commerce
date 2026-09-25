'use strict';
let pool, initialized;
async function ready() {
  if (!pool) {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 8000, statement_timeout: 10000 });
  }
  if (!initialized) initialized = pool.query(`
    CREATE TABLE IF NOT EXISTS aestrela_manual_orders (
      id text PRIMARY KEY, document jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS aestrela_manual_transaction_unique
      ON aestrela_manual_orders ((document->>'method'), (document->>'transactionId'))
      WHERE document->>'transactionId' IS NOT NULL;
    CREATE TABLE IF NOT EXISTS aestrela_order_limits (key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
  `).catch(error => { initialized = null; throw error; });
  await initialized;
  return pool;
}
module.exports = {
  async ping() { await (await ready()).query('SELECT 1'); },
  async rate(key) {
    const p = await ready();
    const result = await p.query(`INSERT INTO aestrela_order_limits AS r (key,count,expires_at) VALUES ($1,1,now()+interval '1 hour')
      ON CONFLICT (key) DO UPDATE SET count=CASE WHEN r.expires_at < now() THEN 1 ELSE r.count+1 END,
      expires_at=CASE WHEN r.expires_at < now() THEN now()+interval '1 hour' ELSE r.expires_at END RETURNING count`, [key]);
    await p.query("DELETE FROM aestrela_order_limits WHERE expires_at < now() - interval '1 day'");
    return result.rows[0].count;
  },
  async create(order) {
    const p = await ready();
    await p.query('INSERT INTO aestrela_manual_orders (id,document) VALUES ($1,$2::jsonb) ON CONFLICT (id) DO NOTHING', [order.id, JSON.stringify(order)]);
    return this.get(order.id);
  },
  async get(id) { return (await (await ready()).query('SELECT document FROM aestrela_manual_orders WHERE id=$1', [id])).rows[0]?.document; },
  async list(offset) { return (await (await ready()).query('SELECT document FROM aestrela_manual_orders ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET $1', [offset])).rows.map(r => r.document); },
  async submit(id, tx, now) {
    try {
      const r = await (await ready()).query(`UPDATE aestrela_manual_orders SET document=document || $2::jsonb
        WHERE id=$1 AND document->>'status'='awaiting_payment' RETURNING document`, [id, JSON.stringify({transactionId:tx,status:'awaiting_verification',submittedAt:now})]);
      if (r.rows[0]) return r.rows[0].document;
      const current = await this.get(id);
      return current?.transactionId === tx ? current : 'LOCKED';
    } catch (error) { if (error.code === '23505') return 'DUPLICATE'; throw error; }
  },
  async review(id, status, now) {
    const r = await (await ready()).query(`UPDATE aestrela_manual_orders SET document=document || $2::jsonb
      WHERE id=$1 AND document->>'status'='awaiting_verification' RETURNING document`, [id, JSON.stringify({status,reviewedAt:now})]);
    return r.rows[0]?.document || 'LOCKED';
  }
};
