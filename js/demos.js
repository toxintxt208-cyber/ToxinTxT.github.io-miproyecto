/* ==========================================================================
   Demostraciones conceptuales — interacciones compartidas
   ========================================================================== */

'use strict';

const STORAGE_KEY = 'portfolio-lang';
const SUPPORTED = ['es', 'en'];

const uiText = {
  es: {
    added: 'Añadido al carrito',
    cart: 'Carrito',
    remove: 'Quitar una unidad de',
    increase: 'Añadir una unidad de',
    period: 'Últimos {days} días'
  },
  en: {
    added: 'Added to cart',
    cart: 'Cart',
    remove: 'Remove one unit of',
    increase: 'Add one unit of',
    period: 'Last {days} days'
  }
};

let lang = 'es';
const description = document.querySelector('meta[name="description"]');
const descriptionEs = description?.content;
try {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED.includes(saved)) lang = saved;
} catch (error) {
  /* Se mantiene el idioma por defecto. */
}

function t(key) {
  return (uiText[lang] && uiText[lang][key]) || key;
}

function applyLang(next) {
  lang = SUPPORTED.includes(next) ? next : 'es';
  document.documentElement.lang = lang;
  if (description) {
    description.content = (lang === 'en' && description.dataset.enDescription) || descriptionEs;
  }

  document.querySelectorAll('[data-es]').forEach((el) => {
    const value = el.dataset[lang];
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-es-aria]').forEach((el) => {
    const value = el.dataset[lang + 'Aria'];
    if (typeof value === 'string') el.setAttribute('aria-label', value);
  });

  document.querySelectorAll('[data-es-alt]').forEach((el) => {
    const value = el.dataset[lang + 'Alt'];
    if (typeof value === 'string') el.setAttribute('alt', value);
  });

  document.querySelectorAll('[data-demo-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.demoLang === lang));
  });

  if (document.body.dataset['title' + (lang === 'es' ? 'Es' : 'En')]) {
    document.title = document.body.dataset['title' + (lang === 'es' ? 'Es' : 'En')];
  }

  const cartLabel = document.querySelector('[data-cart-label]');
  if (cartLabel) cartLabel.textContent = t('cart');

  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (error) {
    /* Sin persistencia el cambio de idioma sigue funcionando. */
  }
  document.dispatchEvent(new Event('demo-language-change'));
}

/* ---------- Notificación ---------- */
let toastTimer = null;

function toast(message) {
  const box = document.getElementById('demo-toast');
  const text = document.getElementById('demo-toast-text');
  if (!box || !text) return;

  text.textContent = message;
  box.classList.add('is-on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => box.classList.remove('is-on'), 2800);
}

/* ---------- Aparición al desplazarse ---------- */
function initReveal() {
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    items.forEach((item) => item.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.03 }
  );

  document.documentElement.classList.add('has-reveal');
  items.forEach((item) => observer.observe(item));
}

/* ---------- Tienda ---------- */
function initStore() {
  const grid = document.getElementById('store-grid');
  if (!grid) return;

  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const products = Array.from(grid.querySelectorAll('[data-cat]'));
  const cartButton = document.getElementById('cart-button');
  const dialog = document.getElementById('cart-dialog');
  const cartCount = document.getElementById('cart-count');
  const list = dialog.querySelector('[data-cart-items]');
  const empty = dialog.querySelector('[data-cart-empty]');
  const total = dialog.querySelector('[data-cart-total]');
  const basket = new Map();

  function renderCart() {
    const active = document.activeElement;
    const activeRow = active.closest('[data-cart-row]');
    const activeAction = active.dataset.cartAction;
    const currency = new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US', {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0
    });
    let count = 0;
    let amount = 0;
    list.replaceChildren();

    for (const [product, quantity] of basket) {
      const heading = product.querySelector('h3');
      const name = heading.dataset[lang] || heading.textContent;
      const price = Number(product.querySelector('[data-price]').dataset.price);
      count += quantity;
      amount += price * quantity;

      const item = document.createElement('li');
      item.dataset.cartRow = String(products.indexOf(product));
      const details = document.createElement('div');
      const title = document.createElement('b');
      title.textContent = name;
      const subtotal = document.createElement('p');
      subtotal.textContent = currency.format(price * quantity);
      details.append(title, subtotal);
      const controls = document.createElement('div');
      controls.className = 'basket-quantity';
      const units = document.createElement('span');
      units.textContent = String(quantity);
      controls.append(
        quantityButton(product, name, -1), units, quantityButton(product, name, 1)
      );
      item.append(details, controls);
      list.append(item);
    }

    cartCount.textContent = String(count);
    total.textContent = currency.format(amount);
    empty.hidden = count > 0;
    if (activeRow) {
      const matching = list.querySelector(
        `[data-cart-row="${activeRow.dataset.cartRow}"] [data-cart-action="${activeAction}"]`
      );
      (matching || list.querySelector('button') || dialog.querySelector('button')).focus();
    }
  }

  function changeQuantity(product, step) {
    const quantity = (basket.get(product) || 0) + step;
    if (quantity > 0) basket.set(product, quantity);
    else basket.delete(product);
    renderCart();
  }

  function quantityButton(product, name, step) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'basket-control';
    button.dataset.cartAction = String(step);
    button.textContent = step < 0 ? '−' : '+';
    button.setAttribute('aria-label', `${t(step < 0 ? 'remove' : 'increase')} ${name}`);
    button.addEventListener('click', () => changeQuantity(product, step));
    return button;
  }

  cartButton.addEventListener('click', () => dialog.showModal());
  document.addEventListener('demo-language-change', renderCart);
  renderCart();

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filters.forEach((btn) =>
        btn.setAttribute('aria-pressed', String(btn === button))
      );
      products.forEach((product) => {
        const show = filter === 'all' || product.dataset.cat === filter;
        product.hidden = !show;
      });
    });
  });

  grid.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      changeQuantity(button.closest('[data-cat]'), 1);
      toast(t('added'));
    });
  });
}

/* ---------- Dashboard ---------- */
const dashData = {
  '7d': {
    kpis: { revenue: 18420, orders: 412, conversion: 0.038, churn: 0.012 },
    deltas: { revenue: 0.082, orders: 0.041, conversion: -0.004, churn: 0.001 },
    bars: [38, 52, 44, 66, 58, 72, 61, 78, 63, 84, 71, 92],
    previous: [27, 44, 48, 37, 54, 48, 67, 58, 63, 71, 69, 77]
  },
  '30d': {
    kpis: { revenue: 72860, orders: 1684, conversion: 0.041, churn: 0.009 },
    deltas: { revenue: 0.124, orders: 0.096, conversion: 0.006, churn: -0.002 },
    bars: [42, 58, 51, 70, 64, 78, 59, 82, 74, 88, 79, 96],
    previous: [32, 40, 45, 54, 47, 61, 55, 61, 66, 73, 70, 83]
  },
  '90d': {
    kpis: { revenue: 214300, orders: 4912, conversion: 0.044, churn: 0.008 },
    deltas: { revenue: 0.189, orders: 0.142, conversion: 0.009, churn: -0.001 },
    bars: [50, 46, 62, 58, 74, 69, 81, 76, 87, 83, 94, 99],
    previous: [37, 42, 37, 49, 53, 58, 59, 67, 80, 67, 79, 86]
  }
};

function initDashboard() {
  const rangeWrap = document.querySelector('[data-range-group]');
  if (!rangeWrap) return;

  const buttons = Array.from(rangeWrap.querySelectorAll('[data-range]'));
  const bars = Array.from(document.querySelectorAll('[data-bars] span'));
  const period = document.querySelector('[data-period]');
  const line = document.querySelector('[data-revenue-line]');
  const area = document.querySelector('[data-revenue-area]');
  const previous = document.querySelector('[data-revenue-previous]');
  const links = Array.from(document.querySelectorAll('.dash-nav a'));
  let activeRange = '30d';

  function updateNav() {
    const hash = window.location.hash || '#demo-main';
    links.forEach((link) => {
      const active = link.hash === hash;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  const update = (range) => {
    const data = dashData[range];
    if (!data) return;
    const locale = lang === 'es' ? 'es-BO' : 'en-US';
    const currency = new Intl.NumberFormat(locale, {
      style: 'currency', currency: 'USD', maximumFractionDigits: 0
    });
    const whole = new Intl.NumberFormat(locale);
    const percentOptions = { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 };
    const percent = new Intl.NumberFormat(locale, percentOptions);
    const delta = new Intl.NumberFormat(locale, { ...percentOptions, signDisplay: 'exceptZero' });
    const formatters = { revenue: currency, orders: whole, conversion: percent, churn: percent };

    Object.entries(data.kpis).forEach(([key, value]) => {
      const el = document.querySelector(`[data-kpi="${key}"]`);
      if (el) el.textContent = formatters[key].format(value);
    });

    Object.entries(data.deltas).forEach(([key, value]) => {
      const el = document.querySelector(`[data-kpi-delta="${key}"]`);
      if (el) {
        el.textContent = delta.format(value);
        const isDown = value < 0;
        const isUnfavorable = key === 'churn' ? !isDown : isDown;
        el.parentElement.classList.toggle('is-down', isUnfavorable);
        el.parentElement.querySelector('svg')?.classList.toggle('trend-down', isDown);
      }
    });

    bars.forEach((bar, index) => {
      bar.style.setProperty('--h', `${data.bars[index] || 60}%`);
    });
    period.textContent = t('period').replace('{days}', range.slice(0, -1));
    const chartPath = (series) => series.map((value, index) =>
      `${index === 0 ? 'M' : 'L'}${Math.round(index * 640 / (series.length - 1))} ${Math.round(210 - value * 1.65)}`
    ).join(' ');
    const currentPath = chartPath(data.bars);
    line.setAttribute('d', currentPath);
    area.setAttribute('d', `${currentPath} L640 210 L0 210 Z`);
    previous.setAttribute('d', chartPath(data.previous));
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) =>
        btn.setAttribute('aria-pressed', String(btn === button))
      );
      activeRange = button.dataset.range;
      update(activeRange);
    });
  });
  document.addEventListener('demo-language-change', () => update(activeRange));
  window.addEventListener('hashchange', updateNav);
  updateNav();
  update(activeRange);
}

/* ---------- Escenarios de Northline ---------- */
function initScenarios() {
  const quotes = Array.from(document.querySelectorAll('.corp-scenario'));
  if (quotes.length < 2) return;

  const next = document.querySelector('[data-quote-next]');
  const prev = document.querySelector('[data-quote-prev]');
  const position = document.querySelector('[data-quote-position]');
  let index = 0;

  const show = (nextIndex) => {
    index = (nextIndex + quotes.length) % quotes.length;
    quotes.forEach((quote, i) => quote.classList.toggle('is-active', i === index));
    position.textContent = `${index + 1} / ${quotes.length}`;
  };

  if (next) next.addEventListener('click', () => show(index + 1));
  if (prev) prev.addEventListener('click', () => show(index - 1));
}

/* ---------- Galería creativa ---------- */
function initLightbox() {
  const dialog = document.getElementById('lightbox');
  if (!dialog) return;

  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('[data-lightbox-caption]');
  const close = dialog.querySelector('[data-lightbox-close]');
  const error = dialog.querySelector('[data-lightbox-error]');
  const items = Array.from(document.querySelectorAll('.cr-item'));
  let index = 0;

  function show(next) {
    index = (next + items.length) % items.length;
    const item = items[index];
    error.hidden = true;
    image.hidden = false;
    image.alt = item.dataset[lang + 'Alt'] || '';
    image.src = item.dataset.full;
    const title = item.dataset[lang === 'es' ? 'captionEs' : 'captionEn'];
    caption.textContent = `${index + 1} / ${items.length} · ${title}`;
  }

  items.forEach((item, itemIndex) => {
    item.addEventListener('click', () => {
      show(itemIndex);
      dialog.showModal();
    });
  });
  dialog.querySelectorAll('[data-lightbox-step]').forEach((button) => {
    button.addEventListener('click', () => show(index + Number(button.dataset.lightboxStep)));
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  image.addEventListener('error', () => {
    image.hidden = true;
    error.hidden = false;
  });

  close.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

/* ---------- Inicio ---------- */
function init() {
  if (new URLSearchParams(window.location.search).has('preview')) {
    document.body.classList.add('is-preview');
  }

  document.querySelectorAll('[data-demo-lang]').forEach((button) => {
    button.addEventListener('click', () => applyLang(button.dataset.demoLang));
  });

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  applyLang(lang);
  initReveal();
  initStore();
  initDashboard();
  initScenarios();
  initLightbox();
}

init();
