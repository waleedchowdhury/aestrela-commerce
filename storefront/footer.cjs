const links = require('./social-links.json');
const icons = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
  facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.5A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v8" fill="currentColor" stroke="none"/>',
  whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4.1Z"/><path d="M8 7.5c-.5 0-1 1-1 1.5 0 3 4 7 7 7 .5 0 1.5-.5 1.5-1l-2.5-1.5-1 1a8 8 0 0 1-3-3l1-1Z"/>',
  tiktok: '<path d="M14 3v12.5a4.5 4.5 0 1 1-4-4.5v3a1.6 1.6 0 1 0 1 1.5V3h3c.3 2.8 2 4.5 5 4.7v3A9 9 0 0 1 14 9" fill="currentColor" stroke="none"/>'
};
const names = {instagram:'Instagram',facebook:'Facebook',whatsapp:'WhatsApp',tiktok:'TikTok'};
function footerLinks() {
  const socials = Object.entries(links).filter(([,url])=>url).map(([key,url])=>{
    const parsed = new URL(url);
    if(parsed.protocol !== 'https:' || !icons[key]) throw new Error('Invalid footer social link');
    const href = parsed.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
    return `<a class="social-icon" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="AESTRÉLA on ${names[key]} (opens in a new tab)" title="${names[key]}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key]}</svg></a>`;
  }).join('');
  return `<nav class="footer-connect" aria-label="About and social links"><a class="footer-about" href="/about/">About us</a>${socials?`<div class="footer-socials">${socials}</div>`:''}</nav>`;
}
module.exports = {footerLinks};
