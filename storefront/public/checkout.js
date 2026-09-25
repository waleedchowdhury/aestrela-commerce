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
  let requestId;
  try { requestId = sessionStorage.getItem('aestrela:checkout-request:v2'); } catch {}
  if (!/^[a-f0-9]{32}$/.test(requestId || '')) {
    requestId = [...crypto.getRandomValues(new Uint8Array(16))].map(n => n.toString(16).padStart(2, '0')).join('');
    try { sessionStorage.setItem('aestrela:checkout-request:v2', requestId); } catch {}
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
    if (order.items.some(i => i.sizeNeedsConfirmation)) receipt.append(el('p', 'Your requested sizes are saved. Availability will be confirmed by phone before dispatch.'));
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
    const next = el('a', 'Continue shopping'); next.className = 'text-link'; next.href='/shop/'; receipt.append(next);
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
      let history; try { history=JSON.parse(localStorage.getItem('aestrela:orders') || '[]'); } catch { history=[]; }
      if(!Array.isArray(history)) history=[];
      localStorage.setItem('aestrela:orders',JSON.stringify([session,...history.filter(o=>o?.id!==session.id)].slice(0,50)));
      try { sessionStorage.removeItem('aestrela:checkout-request:v2'); } catch {}
      // Remove only the purchased quantities; preserve other/new selections.
      let currentBag; try { currentBag=JSON.parse(localStorage.getItem('aestrela:bag') || '[]'); } catch { currentBag=[]; }
      if(Array.isArray(currentBag)) {
        items.forEach(item=>{const entry=currentBag.find(i=>i.id===item.id && i.size===item.size);if(entry)entry.quantity-=item.quantity;});
        currentBag=currentBag.filter(i=>i.quantity>0);localStorage.setItem('aestrela:bag',JSON.stringify(currentBag));
        document.querySelectorAll('[data-bag-count]').forEach(node=>node.textContent=currentBag.reduce((n,i)=>n+i.quantity,0));
      }
      show(result.order); message.textContent = 'Your order is saved. Follow the payment instructions below.';
    } catch (error) { message.textContent = error.message; submit.disabled = false; }
  });
  async function start() {
    try {
      settings = await api({ action: 'config' });
      if (!settings.enabled) throw Error('Checkout setup is in progress. Please return later; do not send payment yet.');
      let previous; try { previous=JSON.parse(localStorage.getItem('aestrela:orders') || '[]'); } catch { previous=[]; }
      if(!Array.isArray(previous)) previous=[];
      if(session?.id && session?.token && !previous.some(o=>o.id===session.id)) previous.unshift(session);
      if(previous.length) {
        const history=document.createElement('details');history.append(el('summary','Your previous orders'));
        previous.filter(o=>o?.id&&o?.token).forEach(saved=>{
          const button=el('button',saved.id);button.className='text-button';history.append(button);
          button.onclick=async()=>{button.disabled=true;try{const result=await api({action:'status',...saved});session=saved;show(result.order);message.textContent='Previous order — do not pay twice.';}catch(error){message.textContent=error.message;}finally{button.disabled=false;}};
        });root.insertBefore(history,form);
      }
      const catalog = await fetch('/catalog.json').then(r => { if (!r.ok) throw Error('Products could not load.'); return r.json(); });
      let bag; try { bag = JSON.parse(localStorage.getItem('aestrela:bag') || '[]'); } catch { bag = []; }
      if (!Array.isArray(bag) || !bag.length) throw Error('Your bag is empty. Add a tee before checkout.');
      items = bag.map(i => { const p = catalog.find(p => p.id === i.id); if (!p || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 10) throw Error('Update your bag before checkout.'); return { ...p, quantity: i.quantity, size: i.size }; });
      const summary = form.querySelector('[data-checkout-items]');
      items.forEach((item, index) => {
        const row = document.createElement('div'); row.className = 'checkout-line'; row.append(el('p', `${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`));
        const sizes=item.sizes.length ? item.sizes : settings.sizes;
        const label = el('label', (sizes.length ? 'Size for ' : 'Requested size for ') + item.name), input = document.createElement(sizes.length ? 'select':'input');input.name='size-'+index;input.required=true;
        if(sizes.length){const placeholder=el('option','Choose size');placeholder.value='';input.append(placeholder);sizes.forEach(size=>{const option=el('option',size);option.value=size;option.selected=size===item.size;input.append(option);});}
        else { input.maxLength=20;input.pattern='[a-zA-Z0-9][a-zA-Z0-9 .\\-]{0,19}';input.placeholder='Enter your requested size';if(item.size!=='To be confirmed')input.value=item.size; }
        label.append(input); row.append(label);
        if(!sizes.length)row.append(el('p','Size availability will be confirmed by phone before dispatch.'));
        summary.append(row);
      });
      summary.append(el('p', 'Total: ' + money(items.reduce((n, i) => n + i.price * i.quantity, 0)) + ' · Free home delivery'));
      form.hidden = false; message.textContent = '1. Delivery details → 2. Send Money → 3. Submit transaction ID';
    } catch (error) { message.textContent = error.message; }
  }
  start();
})();
