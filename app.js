(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const menu = $('#menuToggle'), nav = $('#nav');
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); }));
  $('#year').textContent = new Date().getFullYear();
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), { threshold: .12 });
    revealEls.forEach(el => observer.observe(el));
  } else revealEls.forEach(el => el.classList.add('visible'));
  const glow = $('#cursorGlow');
  if (glow && matchMedia('(pointer:fine)').matches) window.addEventListener('pointermove', e => { glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; }, { passive: true });
  const box = $('#lightbox'), boxImg = $('#lightboxImage');
  document.querySelectorAll('[data-image]').forEach(btn => btn.addEventListener('click', () => { boxImg.src = btn.dataset.image; box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }));
  function closeBox() { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  $('#lightboxClose')?.addEventListener('click', closeBox); box?.addEventListener('click', e => { if (e.target === box) closeBox(); }); window.addEventListener('keydown', e => { if (e.key === 'Escape') closeBox(); });
  fetch('/api/content').then(r => r.ok ? r.json() : null).then(data => {
    if (!data) return;
    const map = { name: ['.brand-name'], eyebrow: ['#eyebrow'], headline: ['#headline'], bio: ['#bio'], location: ['#location'], education: ['#education'], tagline: ['#tagline'] };
    for (const [key, selectors] of Object.entries(map)) if (data[key]) selectors.forEach(sel => { const el = $(sel); if (el) el.textContent = data[key]; });
    if (data.instagram) { const link = $('#instagramLink'); link.href = data.instagram; const handle = data.instagram.match(/instagram\.com\/([^/?]+)/i)?.[1]; if (handle) $('#instagramHandle').textContent = '@' + handle; }
  }).catch(() => {});
})();
