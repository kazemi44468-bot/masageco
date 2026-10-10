(() => {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');
  const backTop = document.querySelector('.back-top');
  const header = document.querySelector('.site-header');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const updateScrollState = () => {
    const scrolled = window.scrollY > 45;
    if (header) header.classList.toggle('is-scrolled', scrolled);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* Massage photography gallery: horizontal slider + accessible lightbox */
(() => {
 const tracks=document.querySelectorAll('.massage-gallery-track');
 tracks.forEach(track=>{
  const section=track.closest('.massage-gallery-section');
  section?.querySelector('.gallery-prev')?.addEventListener('click',()=>track.scrollBy({left:track.scrollWidth/Math.max(track.children.length,1)*-2,behavior:'smooth'}));
  section?.querySelector('.gallery-next')?.addEventListener('click',()=>track.scrollBy({left:track.scrollWidth/Math.max(track.children.length,1)*2,behavior:'smooth'}));
 });
 let lightbox=document.querySelector('.massage-lightbox');
 if(!lightbox){lightbox=document.createElement('div');lightbox.className='massage-lightbox';lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label','نمایش تصویر');lightbox.innerHTML='<button type="button" class="massage-lightbox-close" aria-label="بستن تصویر">×</button><button type="button" class="massage-lightbox-backdrop" aria-label="بستن تصویر"></button><figure><img alt=""><figcaption></figcaption></figure>';document.body.appendChild(lightbox);}
 const img=lightbox.querySelector('img'),caption=lightbox.querySelector('figcaption');
 const close=()=>{lightbox.classList.remove('open');document.body.classList.remove('lightbox-open');img.src='';};
 document.querySelectorAll('.massage-photo-card,.knowledge-image-button').forEach(card=>card.addEventListener('click',()=>{img.src=card.dataset.lightboxSrc;img.alt=card.dataset.lightboxAlt||'';caption.textContent=img.alt;lightbox.classList.add('open');document.body.classList.add('lightbox-open');lightbox.querySelector('.massage-lightbox-close').focus();}));
 lightbox.querySelectorAll('.massage-lightbox-close,.massage-lightbox-backdrop').forEach(b=>b.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();
