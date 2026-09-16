(() => {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');
  const backTop = document.querySelector('.back-top');

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  if (backTop) {
    const update = () => backTop.classList.toggle('visible', window.scrollY > 500);
    window.addEventListener('scroll', update, { passive: true });
    update();
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();
