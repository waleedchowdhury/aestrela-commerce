(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AestrelaCheckout=api;})(typeof window==='undefined'?globalThis:window,()=>{
  function sessions(value){return Array.isArray(value)?value.filter(o=>o&&/^AE-[A-F0-9]{24}$/.test(o.id)&&/^[a-f0-9]{64}$/.test(o.token)).slice(0,50):[];}
  function selection(query,catalog,bag){
    const direct=query.has('product');
    const source=direct?[{id:query.get('product'),size:query.get('size'),quantity:Number(query.get('quantity')||1)}]:bag;
    if(!Array.isArray(source)||!source.length)throw Error('Your bag is empty. Choose a tee to get started.');
    const items=[];
    for(const entry of source){
      const product=catalog.find(p=>p.id===entry?.id);
      if(!product||!Number.isInteger(entry.quantity)||entry.quantity<1||entry.quantity>10)throw Error('This selection is invalid. Return to the product and choose a quantity from 1 to 10.');
      const size=typeof entry.size==='string'?entry.size:'';
      if(direct&&!product.sizes.includes(size))throw Error('Choose a size on the product page before checking out.');
      const existing=items.find(i=>i.id===entry.id&&i.size===size);
      if(existing){existing.quantity+=entry.quantity;if(existing.quantity>10)throw Error('Please limit each size to 10 pieces.');}
      else items.push({...product,quantity:entry.quantity,size});
    }
    if(items.reduce((n,i)=>n+i.quantity,0)>30)throw Error('Please limit your order to 30 pieces.');
    return {direct,items};
  }
  function remainingBag(bag,items,direct){
    if(!Array.isArray(bag))return [];
    const result=bag.filter(i=>i&&typeof i.id==='string'&&typeof i.size==='string'&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=10).map(i=>({...i}));
    if(direct)return result;
    for(const item of items){let remaining=item.quantity;for(const entry of result){if(entry.id===item.id&&entry.size===item.size){const removed=Math.min(entry.quantity,remaining);entry.quantity-=removed;remaining-=removed;}}}
    return result.filter(i=>i.quantity>0);
  }
  return {sessions,selection,remainingBag};
});
