const header = document.querySelector('.site-header');
const drawer = document.querySelector('.menu-drawer');
const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.menu-close');
let lastY = window.scrollY;
let activeMenuTrigger = menuButton;
let scrollFrame = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const floatingRecord = document.createElement('div');
floatingRecord.className = 'floating-record-nav';
floatingRecord.innerHTML = `
  <button class="floating-record-button" type="button" aria-label="Open the museum menu" aria-controls="museum-menu" aria-expanded="false">
    <img src="images/jssm-tree-logo.webp" alt="">
    <span>Menu</span>
  </button>
  <a class="floating-home-link" href="${document.body.classList.contains('inner-page') ? 'index.html' : '#top'}" aria-label="Back to the Jefferson Street Sound Museum homepage">Home <b aria-hidden="true">&#8593;</b></a>
`;
document.body.append(floatingRecord);

const floatingButton = floatingRecord.querySelector('.floating-record-button');
const heroPoster = document.querySelector('.front-poster');
const heroRecord = document.querySelector('.poster-hero .mini-record');
if (heroRecord) heroRecord.classList.add('hero-scroll-record');

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
function paintPointerLight(event) {
  if (!finePointer.matches || reduceMotion.matches) return;
  document.documentElement.style.setProperty('--mouse-x', `${(event.clientX / window.innerWidth) * 100}%`);
  document.documentElement.style.setProperty('--mouse-y', `${(event.clientY / window.innerHeight) * 100}%`);
}
window.addEventListener('pointermove', paintPointerLight, { passive: true });
window.addEventListener('pointerout', (event) => {
  if (!event.relatedTarget) {
    document.documentElement.style.setProperty('--mouse-x', '50%');
    document.documentElement.style.setProperty('--mouse-y', '42%');
  }
}, { passive: true });

function setMenu(open) {
  drawer.classList.toggle('is-open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  floatingButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) closeButton.focus(); else activeMenuTrigger.focus();
}

menuButton.addEventListener('click', () => { activeMenuTrigger = menuButton; setMenu(true); });
floatingButton.addEventListener('click', () => { activeMenuTrigger = floatingButton; setMenu(true); });
closeButton.addEventListener('click', () => setMenu(false));
drawer.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && drawer.classList.contains('is-open')) setMenu(false); });

function paintScrollMotion() {
  const nextY = window.scrollY;
  header.classList.toggle('is-hidden', nextY > lastY && nextY > 140 && !drawer.classList.contains('is-open'));
  floatingRecord.classList.toggle('is-visible', nextY > 110);

  const spin = reduceMotion.matches ? 0 : nextY * .32;
  floatingRecord.style.setProperty('--floating-record-spin', `${spin}deg`);
  document.documentElement.style.setProperty('--page-texture-shift', `${reduceMotion.matches ? 0 : Math.min(nextY * .018, 18)}px`);
  document.documentElement.style.setProperty('--page-hero-shift', `${reduceMotion.matches ? 0 : Math.min(nextY * .055, 42)}px`);
  document.documentElement.style.setProperty('--ambient-strength', String(reduceMotion.matches ? .12 : .14 + ((Math.sin(nextY / 330) + 1) * .07)));

  if (heroPoster && heroRecord) {
    const distance = Math.max(window.innerHeight * .72, 520);
    const progress = Math.min(Math.max(nextY / distance, 0), 1);
    const activeProgress = reduceMotion.matches ? 0 : progress;
    heroPoster.style.setProperty('--poster-shift', `${activeProgress * 54}px`);
    heroPoster.style.setProperty('--poster-scale', String(1 + activeProgress * .035));
    heroRecord.style.setProperty('--hero-record-spin', `${activeProgress * 250}deg`);
    heroRecord.style.setProperty('--hero-record-shift', `${activeProgress * -64}px`);
    heroRecord.style.setProperty('--hero-record-scale', String(1 - activeProgress * .18));
    heroRecord.style.setProperty('--hero-record-opacity', String(1 - activeProgress * .82));
  }

  lastY = nextY;
  scrollFrame = 0;
}

function queueScrollMotion() {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(paintScrollMotion);
}

paintScrollMotion();
window.addEventListener('scroll', queueScrollMotion, { passive: true });
window.addEventListener('resize', queueScrollMotion, { passive: true });
reduceMotion.addEventListener?.('change', queueScrollMotion);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.14, rootMargin: '0px 0px -7%' });
  document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
}
