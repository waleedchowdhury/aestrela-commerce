'use strict';
(() => {
  const form = document.querySelector('#owner-login'); if (!form) return;
  const list = document.querySelector('[data-owner-orders]'), message = document.querySelector('[data-owner-message]');
  let key = '', offset = 0;
  const el = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
  async function api(data) { const r = await fetch('/api/orders', {method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},body:JSON.stringify(data)}); const dataOut = await r.json(); if(!r.ok) throw Error(dataOut.error); return dataOut; }
  async function load() {
    message.textContent = 'Loading orders…';
    try { const result = await api({action:'list',offset}); list.replaceChildren();
      result.orders.forEach(order => {
        const article = document.createElement('article'); article.className = 'owner-order';
        article.append(el('h2',order.id),el('p',order.status+' · '+order.createdAt),el('p',order.customer.name+' · '+order.customer.phone),el('p',order.customer.address+', '+order.customer.district));
        order.items.forEach(i => article.append(el('p',`${i.name} / ${i.size} × ${i.quantity}`)));
        article.append(el('p',`${order.method} · BDT ${order.total.toFixed(2)} · Transaction: ${order.transactionId || 'Not submitted'}`));
        if(order.status === 'awaiting_verification') {
          const label = el('label','I checked this transaction in the receiving payment account, including amount and sender.'); const check = document.createElement('input'); check.type='checkbox'; label.prepend(check); article.append(label);
          for(const [status,text] of [['paid','Confirm received payment'],['payment_rejected','Reject payment reference']]) {
            const button = el('button',text); button.className='button'; button.disabled=true; check.addEventListener('change',()=>button.disabled=!check.checked);
            button.onclick=async()=>{ button.disabled=true; try{await api({action:'review',id:order.id,status,confirmed:check.checked}); await load();}catch(error){message.textContent=error.message;button.disabled=false;} }; article.append(button);
          }
        }
        list.append(article);
      });
      const previous = el('button','Previous orders'); previous.disabled=offset===0;previous.onclick=()=>{offset=Math.max(0,offset-50);load();};list.append(previous);
      if(result.nextOffset!==null){const next=el('button','More orders');next.onclick=()=>{offset=result.nextOffset;load();};list.append(next);}
      message.textContent=result.orders.length+' orders on this page. No automatic payment verification.';
    }catch(error){message.textContent=error.message;}
  }
  form.onsubmit=e=>{e.preventDefault();key=form.elements.key.value;form.reset();load();};
  document.querySelector('[data-owner-logout]').onclick=()=>{key='';list.replaceChildren();message.textContent='Signed out.';};
})();
