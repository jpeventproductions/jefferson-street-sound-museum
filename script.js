const header = document.querySelector('.site-header');
const drawer = document.querySelector('.menu-drawer');
const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.menu-close');
let lastY = window.scrollY;

function setMenu(open) {
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) closeButton.focus(); else menuButton.focus();
}

menuButton.addEventListener('click', () => setMenu(true));
closeButton.addEventListener('click', () => setMenu(false));
drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) setMenu(false); });

window.addEventListener('scroll', () => {
  const nextY = window.scrollY;
  header.classList.toggle('is-hidden', nextY > lastY && nextY > 140 && !drawer.classList.contains('is-open'));
  lastY = nextY;
}, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.14, rootMargin: '0px 0px -7%' });
  document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
}
