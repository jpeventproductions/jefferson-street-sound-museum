const header = document.querySelector('.site-header');
const drawer = document.querySelector('.menu-drawer');
const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.menu-close');
let lastY = window.scrollY;
let activeMenuTrigger = menuButton;
let scrollFrame = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const embeddedPanel = window.self !== window.top;
const panelPages = new Set(['museum.html', 'legacy.html', 'community.html', 'visit.html', 'events.html', 'founders-letter.html']);
const currentPage = window.location.pathname.split('/').pop();
const isHomepage = currentPage === 'index.html' || currentPage === '';

if (embeddedPanel) document.body.classList.add('is-embedded-panel');
if (!embeddedPanel && !isHomepage && panelPages.has(currentPage)) {
  window.location.replace(`index.html?panel=${encodeURIComponent(currentPage)}`);
}

function getNextSaturday() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  return date;
}

const nextSaturday = getNextSaturday();
document.querySelectorAll('[data-next-event-long]').forEach((item) => {
  item.textContent = nextSaturday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
});
document.querySelectorAll('[data-next-event-day]').forEach((item) => { item.textContent = String(nextSaturday.getDate()); });

document.querySelectorAll('[data-mini-calendar]').forEach((calendar) => {
  const year = nextSaturday.getFullYear();
  const month = nextSaturday.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const monthLabel = calendar.querySelector('[data-calendar-month]');
  const days = calendar.querySelector('[data-calendar-days]');
  monthLabel.textContent = nextSaturday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  for (let blank = 0; blank < firstDay; blank += 1) days.insertAdjacentHTML('beforeend', '<span class="is-empty" aria-hidden="true"></span>');
  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const isSaturday = date.getDay() === 6;
    const isNext = day === nextSaturday.getDate();
    days.insertAdjacentHTML('beforeend', `<span class="${isSaturday ? 'is-event-day' : ''} ${isNext ? 'is-next-event' : ''}"${isNext ? ' aria-current="date"' : ''}>${day}</span>`);
  }
});

if (embeddedPanel) {
  document.querySelectorAll('a[href="index.html"], a[href="#top"]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    window.parent.postMessage({ type: 'jssm-close-panel' }, window.location.origin);
  }));
}

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

if (!embeddedPanel && isHomepage) {
  const panel = document.createElement('div');
  panel.className = 'page-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `<div class="page-panel-backdrop" data-panel-close></div><section class="page-panel-window" role="dialog" aria-modal="true" aria-label="Museum page"><div class="page-panel-bar"><span>Jefferson Street Sound Museum</span><button type="button" data-panel-close aria-label="Close page and return to the homepage">Close ×</button></div><iframe class="page-panel-frame" title="Museum page"></iframe></section>`;
  document.body.append(panel);
  const panelFrame = panel.querySelector('.page-panel-frame');
  const panelWindow = panel.querySelector('.page-panel-window');
  const panelClose = panel.querySelector('.page-panel-bar button');
  let panelOpener = null;

  function closePanel(updateHistory = true) {
    if (!panel.classList.contains('is-open')) return;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('panel-open');
    panelFrame.removeAttribute('src');
    if (updateHistory) history.pushState({}, '', `${window.location.pathname}${window.location.hash || ''}`);
    panelOpener?.focus();
  }

  function openPanel(filename, opener = null, updateHistory = true) {
    if (!panelPages.has(filename)) return;
    panelOpener = opener;
    panelFrame.src = filename;
    panelFrame.title = opener?.textContent?.trim() || 'Jefferson Street Sound Museum page';
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('panel-open');
    if (updateHistory) history.pushState({ panel: filename }, '', `?panel=${encodeURIComponent(filename)}`);
    window.setTimeout(() => panelClose.focus(), 80);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, window.location.href);
    const filename = url.pathname.split('/').pop();
    if (url.origin === window.location.origin && panelPages.has(filename)) {
      event.preventDefault();
      if (drawer.classList.contains('is-open')) setMenu(false);
      openPanel(filename, link);
    }
  });

  panel.querySelectorAll('[data-panel-close]').forEach((button) => button.addEventListener('click', () => closePanel()));
  panelWindow.addEventListener('click', (event) => event.stopPropagation());
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && panel.classList.contains('is-open')) closePanel(); });
  window.addEventListener('message', (event) => { if (event.origin === window.location.origin && event.data?.type === 'jssm-close-panel') closePanel(); });
  window.addEventListener('popstate', () => {
    const requested = new URLSearchParams(window.location.search).get('panel');
    if (requested && panelPages.has(requested)) openPanel(requested, null, false); else closePanel(false);
  });

  const requestedPanel = new URLSearchParams(window.location.search).get('panel');
  if (requestedPanel && panelPages.has(requestedPanel)) openPanel(requestedPanel, null, false);
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.14, rootMargin: '0px 0px -7%' });
  document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
} else {
  document.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
}
