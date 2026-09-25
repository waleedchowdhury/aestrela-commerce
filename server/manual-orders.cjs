'use strict';
const crypto = require('node:crypto');
const products = require('../storefront/catalog.json');

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function config() {
  const e = process.env;
  const sizes = (e.STORE_SIZES || '').split(',').map(s => s.trim()).filter(Boolean);
  const url = e.DATABASE_POSTGRES_URL || e.DATABASE_URL;
  const number = e.MANUAL_PAYMENT_NUMBER || '';
  const email = e.STORE_SUPPORT_EMAIL || '';
  const secret = e.ORDER_TOKEN_SECRET || e.ADMIN_COOKIE_SECRET || '';
  const adminHash = e.ORDER_ADMIN_KEY_SHA256 || (e.ADMIN_PASSWORD ? sha(e.ADMIN_PASSWORD) : '');
  const ready = e.MANUAL_CHECKOUT_ENABLED === 'true' && /^postgres(?:ql)?:\/\//.test(url || '') && /^01[3-9]\d{8}$/.test(number) && secret.length >= 32 && /^[a-f0-9]{64}$/.test(adminHash);
  return { ready: Boolean(ready), url, number, email, secret, adminHash, sizes };
}
function text(value, label, max, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max || /[\u0000-\u001f]/.test(value)) fail(`Enter a valid ${label}.`);
  return value.trim();
}
function normalizeOrder(body, c = config()) {
  if (!['bkash', 'nagad'].includes(body.method)) fail('Choose bKash or Nagad.');
  const customer = body.customer || {};
  const name = text(customer.name, 'name', 100, 2);
  const phone = text(customer.phone, 'Bangladesh mobile number', 14).replace(/^\+88/, '');
  if (!/^01[3-9]\d{8}$/.test(phone)) fail('Enter a valid Bangladesh mobile number.');
  const address = text(customer.address, 'delivery address', 400, 10);
  const district = text(customer.district, 'district', 80, 2);
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) fail('Your bag must contain 1–30 selections.');
  const items = [];
  for (const item of body.items) {
    const p = products.find(p => p.id === item?.id);
    if (!p || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) fail('Your bag contains an invalid item or quantity.');
    const sizes = p.sizes.length ? p.sizes : c.sizes;
    const size = text(item.size, 'requested size', 20);
    if (sizes.length ? !sizes.includes(size) : !/^[a-zA-Z0-9][a-zA-Z0-9 .-]{0,19}$/.test(size)) fail(`Enter a valid requested size for ${p.name}.`);
    if (items.some(i => i.id === p.id && i.size === size)) fail('Duplicate product selections. Please update your bag.');
    items.push({ id: p.id, name: p.name, size, sizeNeedsConfirmation: !sizes.length, quantity: item.quantity, price: p.price });
  }
  if (items.reduce((n, i) => n + i.quantity, 0) > 30) fail('Please limit an order to 30 pieces.');
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  return { customer: { name, phone, address, district }, items, method: body.method, subtotal, shipping: 0, total: subtotal, currency: 'BDT', testMode: false };
}
function publicOrder(order, c) {
  return { id: order.id, status: order.status, items: order.items, method: order.method, subtotal: order.subtotal, shipping: 0, total: order.total, currency: 'BDT', testMode: order.testMode, transactionId: order.transactionId || null, createdAt: order.createdAt, supportEmail: c.email,
    paymentNumber: order.status === 'awaiting_payment' ? c.number : undefined };
}
function safeEqual(a, b) { const x = Buffer.from(a || ''), y = Buffer.from(b || ''); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function makeHandler(db = require('./order-store.cjs')) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); fail('Use POST.', 405); }
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) fail('Use JSON.', 415);
      if (req.headers.origin && req.headers.origin !== (process.env.STORE_ORIGIN || 'https://www.aestrelaglobal.com')) fail('Origin not allowed.', 403);
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || JSON.stringify(body).length > 16000) fail('Invalid request.');
      const c = config();
      if (body.action === 'config') {
        if (c.ready) await db.ping();
        return res.status(200).json({ enabled: c.ready, sizes: c.ready ? c.sizes : [], testMode: false, supportEmail: c.ready ? c.email : null });
      }
      if (!c.ready) fail('Checkout setup is still in progress. No payment has been requested. Please return later.', 503);
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
      const limit = await db.rate(sha(ip));
      if (limit > 120) fail('Too many requests. Please try again later.', 429);
      const now = new Date().toISOString();
      if (body.action === 'create') {
        if (!/^[a-f0-9]{32}$/.test(body.requestId || '')) fail('Invalid checkout session. Please refresh.');
        const details = normalizeOrder(body, c);
        const id = 'AE-' + crypto.createHmac('sha256', c.secret).update('id:' + body.requestId).digest('hex').slice(0, 24).toUpperCase();
        const token = crypto.createHmac('sha256', c.secret).update('access:' + body.requestId).digest('hex');
        const fingerprint = sha(JSON.stringify(details));
        const order = { ...details, id, tokenHash: sha(token), fingerprint, status: 'awaiting_payment', createdAt: now };
        const result = await db.create(order);
        if (result.fingerprint !== fingerprint) fail('This checkout session already has an order. Resume it or start a new checkout.', 409);
        return res.status(200).json({ order: publicOrder(result, c), token });
      }
      if (['list', 'review'].includes(body.action)) {
        const key = String(req.headers.authorization || '').replace(/^Bearer /, '');
        if (!safeEqual(sha(key), c.adminHash)) fail('Owner sign-in required.', 401);
        if (body.action === 'list') {
          const offset = Number.isInteger(body.offset) && body.offset >= 0 ? body.offset : 0;
          const orders = await db.list(offset);
          return res.status(200).json({ orders: orders.map(o => { const clean = {...o}; delete clean.tokenHash; delete clean.fingerprint; return clean; }), nextOffset: orders.length === 50 ? offset + 50 : null });
        }
        if (!/^AE-[A-F0-9]{24}$/.test(body.id || '') || !['paid', 'payment_rejected'].includes(body.status) || body.confirmed !== true) fail('Confirm the payment review.');
        const result = await db.review(body.id, body.status, now);
        if (['MISSING', 'LOCKED'].includes(result)) fail('This order is not awaiting verification.', 409);
        return res.status(200).json({ order: publicOrder(result, c) });
      }
      if (!['status', 'submit'].includes(body.action)) fail('Unknown action.');
      if (!/^AE-[A-F0-9]{24}$/.test(body.id || '') || !/^[a-f0-9]{64}$/.test(body.token || '')) fail('Order access required.', 401);
      const raw = await db.get(body.id);
      if (!raw || !safeEqual(raw.tokenHash, sha(body.token))) fail('Order not found or access expired.', 404);
      let order = raw;
      if (body.action === 'submit') {
        const tx = text(body.transactionId, 'transaction ID', 30, 6).toUpperCase();
        if (!/^[A-Z0-9]{6,30}$/.test(tx)) fail('Enter the transaction ID from your payment receipt.');
        const result = await db.submit(order.id, tx, now);
        if (result === 'DUPLICATE') fail('This transaction ID has already been submitted for another order.', 409);
        if (['MISSING', 'LOCKED'].includes(result)) fail('This order has already been submitted. Contact support if you need a correction.', 409);
        order = result;
      }
      return res.status(200).json({ order: publicOrder(order, c) });
    } catch (error) {
      const status = error.status || (error instanceof SyntaxError ? 400 : 503);
      return res.status(status).json({ error: error.status ? error.message : 'Order service is temporarily unavailable. Please try again. No payment is automatically confirmed.' });
    }
  };
}
module.exports = { makeHandler, normalizeOrder, config };
