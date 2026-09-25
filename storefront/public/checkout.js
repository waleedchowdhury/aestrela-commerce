'use strict';
(() => {
  const root = document.querySelector('[data-checkout]');
  if (!root) return;
  const message = document.querySelector('[data-checkout-message]');
  const form = document.querySelector('#checkout-form');
  const receipt = document.querySelector('[data-order-receipt]');
  const statusNames = { awaiting_payment: 'Order saved — payment needed', awaiting_verification: 'Payment awaiting verification', paid: 'Payment verified', payment_rejected: 'Payment could not be verified — contact support' };
  const money = n => 'BDT ' + n.toFixed(2);
  const el = (tag, text) => { const e = document.createElement(tag); e.textContent = text; return e; };
  let settings, items = [], session;
  try { session = JSON.parse(localStorage.getItem('aestrela:order') || 'null'); } catch {}
  let requestId = sessionStorage.getItem('aestrela:checkout-request');
  if (!/^[a-f0-9]{32}$/.test(requestId || '')) {
    requestId = [...crypto.getRandomValues(new Uint8Array(16))].map(n => n.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('aestrela:checkout-request', requestId);
  }
  async function api(data) {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json().catch(() => ({ error: 'Checkout is temporarily unavailable. Please try again.' }));
    if (!response.ok) throw Error(result.error);
    return result;
  }
  function show(order) {
    form.hidden = true; receipt.hidden = false; receipt.replaceChildren();
    receipt.append(el('h2', statusNames[order.status]), el('p', 'Order ' + order.id));
    order.items.forEach(i => receipt.append(el('p', `${i.name} / ${i.size} × ${i.quantity} — ${money(i.price * i.quantity)}`)));
    receipt.append(el('p', 'Total: ' + money(order.total) + (order.testMode ? ' · Payment test only — no shipment' : ' · Free home delivery')));
    if (order.status === 'awaiting_payment') {
      const method = order.method === 'bkash' ? 'bKash' : 'Nagad';
      receipt.append(el('h3', 'Send Money with ' + method), el('p', `In your ${method} app, choose Send Money. Enter the personal account below and send exactly ${money(order.total)}. Check the recipient and amount in the app before confirming.`));
      const number = el('p', order.paymentNumber); number.className = 'payment-number'; receipt.append(number);
      receipt.append(el('p', 'Enter your PIN only inside the official payment app. We never ask for a PIN or OTP. If you have already sent this payment, do not send it again.'));
      const txForm = document.createElement('form'); txForm.className = 'checkout-form';
      const label = el('label', 'Transaction ID from your receipt');
      const input = document.createElement('input'); input.name = 'transactionId'; input.required = true; input.minLength = 6; input.maxLength = 30; input.pattern = '[A-Za-z0-9]{6,30}'; label.append(input);
      const submit = el('button', 'Submit payment for verification'); submit.className = 'button'; submit.type = 'submit';
      txForm.append(label, submit); receipt.append(txForm);
      txForm.addEventListener('submit', async e => { e.preventDefault(); submit.disabled = true; message.textContent = 'Saving payment details…';
        try { const result = await api({ action: 'submit', ...session, transactionId: input.value.trim() }); show(result.order); message.textContent = 'Transaction saved. Payment will be checked manually.'; }
        catch (error) { message.textContent = error.message; submit.disabled = false; }
      });
    } else {
      receipt.append(el('p', 'Transaction ID: ' + (order.transactionId || '—')));
      if (order.status === 'awaiting_verification') receipt.append(el('p', 'Your transaction reference is saved. This is not yet proof of payment. AESTRÉLA will check receipt in the payment account before confirming your order.'));
    }
    const refresh = el('button', 'Refresh order status'); refresh.className = 'text-button'; receipt.append(refresh);
    refresh.onclick = async () => { refresh.disabled = true; try { show((await api({ action: 'status', ...session })).order); message.textContent = ''; } catch (error) { message.textContent = error.message; refresh.disabled = false; } };
    if (order.supportEmail) { const support = el('a', 'Contact support about this order'); support.href = 'mailto:' + order.supportEmail + '?subject=' + encodeURIComponent(order.id); receipt.append(support); }
    receipt.append(el('p', 'Keep this order number and your payment receipt. Order access is saved in this browser; clearing browser data removes that access.'));
    if (['paid','payment_rejected'].includes(order.status)) {
      const next = el('button', 'Start a new order'); next.className = 'text-button'; receipt.append(next);
      next.onclick = () => { localStorage.removeItem('aestrela:order'); sessionStorage.removeItem('aestrela:checkout-request'); location.reload(); };
    }
  }
  form.addEventListener('submit', async e => {
    e.preventDefault(); const submit = form.querySelector('button[type=submit]'); submit.disabled = true; message.textContent = 'Saving your order…';
    const fields = new FormData(form);
    try {
      // Persist the access session before revealing payment instructions.
      localStorage.setItem('aestrela:storage-check', '1'); localStorage.removeItem('aestrela:storage-check');
      const result = await api({ action: 'create', requestId, method: fields.get('method'), customer: { name: fields.get('name'), phone: fields.get('phone'), address: fields.get('address'), district: fields.get('district') }, items: items.map((i, index) => ({ id: i.id, quantity: i.quantity, size: fields.get('size-' + index) })) });
      session = { id: result.order.id, token: result.token };
      localStorage.setItem('aestrela:order', JSON.stringify(session));
      show(result.order); message.textContent = 'Your order is saved. Follow the payment instructions below.';
    } catch (error) { message.textContent = error.message; submit.disabled = false; }
  });
  async function start() {
    try {
      settings = await api({ action: 'config' });
      if (!settings.enabled) throw Error('Checkout setup is in progress. Please return later; do not send payment yet.');
      if (session?.id && session?.token) { show((await api({action:'status',...session})).order); message.textContent = ''; return; }
      const catalog = await fetch('/catalog.json').then(r => { if (!r.ok) throw Error('Products could not load.'); return r.json(); });
      let bag; try { bag = JSON.parse(localStorage.getItem('aestrela:bag') || '[]'); } catch { bag = []; }
      if (settings.testMode) {
        bag = [{id:'be-cool',quantity:1,size:'Payment test — no shipment'}];
        form.querySelector('h2').textContent = 'BDT 10.00 payment test — no shipment';
        form.querySelectorAll('h2')[1].textContent = 'Test payer details';
        for (const name of ['address','district']) { const input=form.elements[name];input.required=false;input.closest('label').hidden=true; }
        form.querySelector('button[type=submit]').textContent='Create Tk10 test order & view payment instructions';
      }
      if (!Array.isArray(bag) || !bag.length) throw Error('Your bag is empty. Add a tee before checkout.');
      items = bag.map(i => { const p = catalog.find(p => p.id === i.id); if (!p || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10) throw Error('Update your bag before checkout.'); return { ...p, quantity: i.quantity, size: i.size }; });
      const summary = form.querySelector('[data-checkout-items]');
      items.forEach((item, index) => {
        const row = document.createElement('div'); row.className = 'checkout-line'; row.append(el('p', `${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`));
        const label = el('label', 'Size for ' + item.name), select = document.createElement('select'); select.name = 'size-' + index; select.required = true;
        const placeholder = el('option','Choose size'); placeholder.value = ''; select.append(placeholder);
        (settings.testMode ? ['Payment test — no shipment'] : (item.sizes.length ? item.sizes : settings.sizes)).forEach(size => { const option = el('option', size); option.value = size; option.selected = size === item.size; select.append(option); });
        label.append(select); row.append(label); summary.append(row);
      });
      summary.append(el('p', 'Total: ' + money(items.reduce((n, i) => n + i.price * i.quantity, 0)) + (settings.testMode ? ' · Real Tk10 transfer for testing; no tee will be shipped.' : ' · Free home delivery')));
      form.hidden = false; message.textContent = settings.testMode ? 'Payment testing is open. Regular product ordering will open after sizes and delivery details are confirmed. Your shopping bag is unchanged.' : '1. Delivery details → 2. Send Money → 3. Submit transaction ID';
    } catch (error) { message.textContent = error.message; }
  }
  start();
})();
