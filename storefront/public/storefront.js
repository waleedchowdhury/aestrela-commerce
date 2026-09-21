if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target)}}),{threshold:.08});document.querySelectorAll('[data-reveal]').forEach(el=>{if(el.getBoundingClientRect().top>=innerHeight){el.classList.add('reveal-ready');observer.observe(el)}});}
const bannerVideo=document.getElementById('banner-video');
const videoToggle=document.querySelector('.video-toggle');
if(bannerVideo&&videoToggle){
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let userPaused=false;
 videoToggle.hidden=false;
 const sync=()=>{videoToggle.textContent=bannerVideo.paused?'Play video':'Pause video';videoToggle.setAttribute('aria-label',videoToggle.textContent)};
 const play=()=>{bannerVideo.play().catch(sync)};
 bannerVideo.addEventListener('play',sync);bannerVideo.addEventListener('pause',sync);
 videoToggle.addEventListener('click',()=>{if(bannerVideo.paused){userPaused=false;play()}else{userPaused=true;bannerVideo.pause()}});
 if(!motion.matches&&!navigator.connection?.saveData)play();
 motion.addEventListener('change',()=>{if(motion.matches)bannerVideo.pause()});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)bannerVideo.pause();else if(!userPaused&&!motion.matches&&!navigator.connection?.saveData)play()},{threshold:.1}).observe(bannerVideo);
 bannerVideo.addEventListener('error',()=>{videoToggle.hidden=true});
 sync();
}
