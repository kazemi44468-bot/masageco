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
