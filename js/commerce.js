(() => {
  'use strict';

  const locale = (es, en) => document.documentElement.lang === 'en' ? en : es;
  const money = (amount) => 'Bs ' + new Intl.NumberFormat(locale('es-BO', 'en-US')).format(amount);
  const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
  const nameOf = (item) => item.querySelector('[data-product-name]').textContent.trim();

  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }

  function initFilters(items) {
    const filters = document.querySelector('.filters');
    const search = filters.querySelector('[data-search]');
    const category = filters.querySelector('[data-category]');
    const price = filters.querySelector('[data-price-limit]');
    const status = document.querySelector('[data-filter-status]');
    const empty = document.querySelector('[data-filter-empty]');

    const update = () => {
      const terms = normalize(search?.value || '').split(/\s+/).filter(Boolean);
      const max = price && price.value !== 'all' ? Number(price.value) : Infinity;
      let visible = 0;

      for (const item of items) {
        const text = [...item.querySelectorAll('[data-product-name], [data-product-description], [data-spec]')]
          .map((part) => [part.dataset.es, part.dataset.en].join(' ')).join(' ');
        const index = normalize(text);
        const matches = (category.value === 'all' || item.dataset.categoryItem === category.value) &&
          (max === Infinity || Number(item.dataset.price) <= max) &&
          terms.every((term) => index.includes(term));
        item.hidden = !matches;
        if (matches) visible++;
      }

      status.textContent = locale(
        visible === 1 ? '1 resultado' : `${visible} resultados`,
        visible === 1 ? '1 result' : `${visible} results`
      );
      empty.hidden = visible !== 0;
    };

    filters.addEventListener('input', update);
    filters.querySelector('[data-clear-filters]').addEventListener('click', () => {
      if (search) search.value = '';
      category.value = 'all';
      if (price) price.value = 'all';
      update();
    });
    document.addEventListener('demo-language-change', update);
    update();
  }

  function initBooking() {
    const form = document.getElementById('booking-form');
    const status = document.getElementById('booking-status');
    const date = form.elements.date;
    const time = form.elements.time;
    const guests = form.elements.guests;
    let booking = null;

    function futureDate(days) {
      const point = new Date();
      point.setDate(point.getDate() + days);
      return [point.getFullYear(), point.getMonth() + 1, point.getDate()]
        .map((part) => String(part).padStart(2, '0')).join('-');
    }

    const setDateRange = () => {
      date.min = futureDate(1);
      date.max = futureDate(90);
    };

    function showStatus() {
      if (!booking) {
        status.textContent = '';
        return;
      }
      const dateLabel = new Intl.DateTimeFormat(locale('es-BO', 'en-US'), {
        dateStyle: 'long'
      }).format(new Date(booking.date + 'T12:00:00'));
      status.textContent = locale(
        `Simulación confirmada para ${booking.guests} ${booking.guests === '1' ? 'persona' : 'personas'} el ${dateLabel} a las ${booking.time}. No se realizó una reserva real.`,
        `Simulation confirmed for ${booking.guests} on ${dateLabel} at ${booking.time}. No actual reservation was made.`
      );
    }

    form.addEventListener('input', () => {
      booking = null;
      showStatus();
    });
    date.addEventListener('focus', setDateRange);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      setDateRange();
      if (!form.reportValidity()) return;
      booking = { date: date.value, time: time.value, guests: guests.value };
      showStatus();
    });
    document.addEventListener('demo-language-change', showStatus);
    setDateRange();
  }

  function initBasket(products) {
    const basket = document.querySelector('.basket');
    if (!basket) return;

    const mode = document.body.dataset.commerce;
    const storageKey = mode === 'distrito' ? 'portfolio-distrito-bag-v1' : null;
    const catalog = new Map(products.map((item) => [item.dataset.product, item]));
    const rows = new Map();
    const list = basket.querySelector('[data-basket-items]');
    const empty = basket.querySelector('[data-basket-empty]');
    const total = basket.querySelector('[data-basket-total]');
    const checkout = basket.querySelector('[data-checkout]');
    const status = basket.querySelector('[data-checkout-status]');
    const counter = document.querySelector('[data-basket-count]');
    let lastAction = null;

    function allowed(id, size) {
      const item = catalog.get(id);
      if (!item) return false;
      const select = item.querySelector('[data-size]');
      return select ? Boolean(size) && [...select.options].some((option) => option.value === size) : size === '';
    }

    const rowKey = (id, size) => id + '|' + size;
    if (storageKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (Array.isArray(saved)) {
          for (const row of saved) {
            if (row && allowed(row.id, row.size) && Number.isInteger(row.quantity) && row.quantity > 0 && row.quantity <= 9) {
              rows.set(rowKey(row.id, row.size), row);
            }
          }
        }
      } catch {
        // The bag still works in this tab if storage is unavailable.
      }
    }

    function save() {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify([...rows.values()]));
      } catch {
        // In-memory state remains usable.
      }
    }

    function showStatus() {
      if (!lastAction) {
        status.textContent = '';
      } else if (lastAction.type === 'added') {
        status.textContent = locale(
          `Añadido: ${nameOf(catalog.get(lastAction.id))}.`,
          `Added: ${nameOf(catalog.get(lastAction.id))}.`
        );
      } else if (lastAction.type === 'limit') {
        status.textContent = locale('El máximo es de 9 unidades por variante.', 'The limit is 9 units per variant.');
      } else {
        const bill = money(lastAction.amount);
        const count = lastAction.count;
        const units = locale(count === 1 ? 'unidad' : 'unidades', count === 1 ? 'item' : 'items');
        status.textContent = mode === 'origen'
          ? locale(`Pedido simulado: ${count} ${units}, ${bill}. No se envió ningún pedido.`, `Order simulated: ${count} ${units}, ${bill}. No order was sent.`)
          : locale(`Compra simulada: ${count} ${units}, ${bill}. No se realizó ningún pago.`, `Purchase simulated: ${count} ${units}, ${bill}. No payment was made.`);
      }
    }

    function render() {
      let amount = 0;
      let count = 0;
      const fragment = document.createDocumentFragment();

      for (const [key, row] of rows) {
        const item = catalog.get(row.id);
        const name = nameOf(item);
        const subtotal = row.quantity * Number(item.dataset.price);
        amount += subtotal;
        count += row.quantity;

        const line = node('li');
        const copy = node('div');
        copy.append(node('b', row.size ? `${name} · ${row.size}` : name), node('p', money(subtotal)));
        const controls = node('div', undefined, 'quantity-actions');
        const minus = quantityButton(key, -1, name, row.size);
        const plus = quantityButton(key, 1, name, row.size);
        plus.disabled = row.quantity === 9;
        controls.append(minus, node('span', String(row.quantity)), plus);
        line.append(copy, controls);
        fragment.append(line);
      }

      list.replaceChildren(fragment);
      total.textContent = money(amount);
      counter.textContent = `(${count})`;
      empty.hidden = count > 0;
      checkout.disabled = count === 0;
      if (checkout.disabled) checkout.dataset.total = '';
      else checkout.dataset.total = String(amount);
      showStatus();
    }

    function quantityButton(key, step, name, size) {
      const button = node('button', step === 1 ? '+' : '−');
      button.type = 'button';
      button.dataset.row = key;
      button.dataset.step = step;
      const variant = size ? `${name} (${size})` : name;
      button.setAttribute('aria-label', step === 1
        ? locale(`Añadir una unidad de ${variant}`, `Add one unit of ${variant}`)
        : locale(`Quitar una unidad de ${variant}`, `Remove one unit of ${variant}`));
      button.addEventListener('click', () => {
        const row = rows.get(key);
        const quantity = row.quantity + step;
        if (quantity <= 0) rows.delete(key);
        else row.quantity = quantity;
        lastAction = null;
        save();
        render();
        const matching = [...list.querySelectorAll('button')].filter((control) => control.dataset.row === key);
        const next = matching.find((control) => Number(control.dataset.step) === step && !control.disabled)
          || matching[0] || list.querySelector('button') || catalog.get(row.id).querySelector('[data-buy] button');
        next?.focus();
      });
      return button;
    }

    for (const item of products) {
      item.querySelector('[data-buy]').addEventListener('submit', (event) => {
        event.preventDefault();
        const id = item.dataset.product;
        const size = item.querySelector('[data-size]')?.value || '';
        const quantity = Number(item.querySelector('[data-quantity]')?.value || 1);
        if (!allowed(id, size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 9) return;
        const key = rowKey(id, size);
        const next = (rows.get(key)?.quantity || 0) + quantity;
        if (next > 9) {
          lastAction = { type: 'limit' };
        } else {
          rows.set(key, { id, size, quantity: next });
          lastAction = { type: 'added', id };
          save();
        }
        render();
      });
    }

    checkout.addEventListener('click', () => {
      if (!rows.size) return;
      lastAction = {
        type: 'checkout',
        count: [...rows.values()].reduce((sum, row) => sum + row.quantity, 0),
        amount: Number(checkout.dataset.total)
      };
      rows.clear();
      save();
      render();
      status.setAttribute('tabindex', '-1');
      status.focus({ preventScroll: true });
    });
    document.addEventListener('demo-language-change', render);
    render();
  }

  function initComparison(products) {
    const wrap = document.querySelector('[data-compare-table]');
    if (!wrap) return;
    const status = document.querySelector('[data-compare-status]');
    const selected = new Set();
    let atLimit = false;

    function render() {
      wrap.replaceChildren();
      wrap.hidden = selected.size < 2;
      status.textContent = atLimit
        ? locale('Puedes comparar hasta tres productos. Desmarca uno para añadir otro.', 'You can compare up to three products. Uncheck one to add another.')
        : locale(`${selected.size} de 3 seleccionados`, `${selected.size} of 3 selected`);

      if (selected.size < 2) return;

      const table = node('table');
      table.append(node('caption', locale('Comparación de productos', 'Product comparison'), 'sr-only'));
      const header = table.createTHead().insertRow();
      for (const title of [locale('Producto', 'Product'), locale('Especificaciones', 'Specifications'), locale('Precio', 'Price')]) {
        const cell = node('th', title);
        cell.scope = 'col';
        header.append(cell);
      }
      const body = table.createTBody();
      for (const product of selected) {
        const line = body.insertRow();
        const label = node('th', nameOf(product));
        label.scope = 'row';
        line.append(label, node('td', product.querySelector('[data-spec]').textContent), node('td', money(Number(product.dataset.price))));
      }
      wrap.append(table);
      wrap.tabIndex = 0;
    }

    for (const product of products) {
      const input = product.querySelector('[data-compare]');
      input.addEventListener('change', () => {
        atLimit = input.checked && selected.size === 3;
        if (atLimit) input.checked = false;
        else if (input.checked) selected.add(product);
        else selected.delete(product);
        render();
      });
    }
    document.addEventListener('demo-language-change', render);
    render();
  }

  const items = [...document.querySelectorAll('[data-category-item]')];
  const products = items.filter((item) => item.hasAttribute('data-product'));
  initFilters(items);
  if (document.body.dataset.commerce === 'brasa') initBooking();
  initBasket(products);
  initComparison(products);
  document.querySelectorAll('fieldset[data-enhance]').forEach((fieldset) => {
    fieldset.disabled = false;
  });
})();
