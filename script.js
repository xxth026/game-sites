const app = document.getElementById('app');
const START_BALANCE = 11991;
const BALANCE_KEY = 'game_balance';
const CLAIMED_KEY = 'game_claimed';
const SHOW_RECEIVED_KEY = 'game_show_received';

function getBalance() {
  const saved = Number(localStorage.getItem(BALANCE_KEY));
  return Number.isFinite(saved) ? saved : START_BALANCE;
}
function setBalance(value) {
  const safe = Math.max(0, Math.floor(Number(value) || 0));
  localStorage.setItem(BALANCE_KEY, String(safe));
  renderBalanceTexts();
}
function renderBalanceTexts() {
  document.querySelectorAll('[data-balance]').forEach(el => el.textContent = getBalance());
}
function isLocalFile() {
  return location.protocol === 'file:';
}
function go(path) {
  if (isLocalFile()) {
    location.hash = path;
    render();
    return;
  }
  history.pushState({}, '', path);
  render();
}
function currentRoute() {
  if (isLocalFile()) {
    return location.hash.replace('#', '') || '/glavnaya';
  }
  const p = location.pathname.replace(/\/$/, '');
  if (!p || p === '') return '/glavnaya';
  return p;
}
function asset(name) { return `assets/${name}.png`; }
function imgButton(cls, src, alt, onClick) {
  const btn = document.createElement('button');
  btn.className = `abs btn-img ${cls}`;
  btn.type = 'button';
  btn.innerHTML = `<img src="${asset(src)}" alt="${alt}">`;
  btn.addEventListener('click', onClick);
  return btn;
}
function screen(className) {
  const el = document.createElement('section');
  el.className = `screen ${className}`;
  return el;
}

function renderGlavnaya() {
  const s = screen('glavnaya');
  s.appendChild(imgButton('balance-top', 'balans1', 'Баланс', () => go('/vivod1')));
  const balance = document.createElement('div');
  balance.className = 'balance-value balance-main';
  balance.dataset.balance = 'true';
  s.appendChild(balance);
  s.appendChild(imgButton('kub-main', 'kub1', 'Куб', () => { sessionStorage.removeItem(SHOW_RECEIVED_KEY); go('/kubstr'); }));
  app.replaceChildren(s);
  renderBalanceTexts();
}

function renderKubstr() {
  const s = screen('kubstr');
  if (sessionStorage.getItem(SHOW_RECEIVED_KEY) === '1') s.classList.add('claimed');
  s.appendChild(imgButton('exit1', 'vihod1', 'Выход', () => go('/glavnaya')));
  s.appendChild(imgButton('take', 'knopkazabrat', 'Забрать', () => go('/kubstr2')));
  const received = document.createElement('img');
  received.src = asset('polucheno');
  received.alt = 'Получено';
  received.className = 'abs received';
  s.appendChild(received);
  app.replaceChildren(s);
}

function renderKubstr2() {
  const s = screen('kubstr2');
  const bgClick = document.createElement('button');
  bgClick.type = 'button';
  bgClick.className = 'bg-button';
  bgClick.style.display = 'none';
  bgClick.addEventListener('click', () => { sessionStorage.setItem(SHOW_RECEIVED_KEY, '1'); go('/kubstr'); });
  s.appendChild(bgClick);

  const wrap = document.createElement('div');
  wrap.className = 'abs cube-wrap';
  wrap.innerHTML = `<img class="cube-closed" src="${asset('kub2')}" alt="Куб">`;
  s.appendChild(wrap);

  const cubeOpen = document.createElement('img');
  cubeOpen.className = 'abs cube-open';
  cubeOpen.src = asset('kub3');
  cubeOpen.alt = 'Открытый куб';
  s.appendChild(cubeOpen);

  const prem = document.createElement('img');
  prem.className = 'abs premium';
  prem.src = asset('tgprem');
  prem.alt = 'Telegram Premium';
  s.appendChild(prem);

  const tg = document.createElement('img');
  tg.className = 'abs telegram-text';
  tg.src = asset('telegramm');
  tg.alt = 'Telegram Premium на 3 месяца';
  s.appendChild(tg);

  const touch = imgButton('kosnites', 'kosnites', 'Коснитесь, чтобы открыть', () => {
    s.classList.add('opened');
    localStorage.setItem(CLAIMED_KEY, '1');
    setTimeout(() => { bgClick.style.display = 'block'; }, 3600);
  });
  s.appendChild(touch);
  app.replaceChildren(s);
}

function renderVivod1() {
  let input = '';
  const s = screen('vivod1');
  s.innerHTML = `<img class="abs vivod-panel" src="${asset('vivodzvezd')}" alt="Вывод в звезды">`;
  s.appendChild(imgButton('exit2', 'vihod2', 'Выход', () => go('/glavnaya')));

  const bal = document.createElement('div');
  bal.className = 'balance-value vivod-title-balance';
  bal.dataset.balance = 'true';
  s.appendChild(bal);

  const inputEl = document.createElement('div');
  inputEl.className = 'abs input-window';
  inputEl.textContent = '';
  s.appendChild(inputEl);

  const keypad = document.createElement('div');
  keypad.className = 'keypad';
  [1,2,3,4,5,6,7,8,9,0].forEach(n => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn-img digit ${n === 0 ? 'zero' : ''}`;
    btn.innerHTML = `<img src="${asset('knopka' + n)}" alt="${n}">`;
    btn.addEventListener('click', () => {
      if (input.length >= 10) return;
      if (input === '' && n === 0) input = '0';
      else input = input === '0' ? String(n) : input + String(n);
      inputEl.textContent = input;
    });
    keypad.appendChild(btn);
  });
  s.appendChild(keypad);

  const withdraw = imgButton('withdraw', 'knopkavivod', 'Вывести', () => {});
  let longDone = false;
  let timer = null;
  function clearInput() { input = ''; inputEl.textContent = ''; }
  function amount() { return Math.floor(Number(input) || 0); }
  function subtract() {
    const n = amount();
    if (!n) return;
    setBalance(getBalance() - n);
    clearInput();
  }
  function add() {
    const n = amount();
    if (!n) return;
    setBalance(getBalance() + n);
    clearInput();
  }
  withdraw.addEventListener('pointerdown', () => {
    longDone = false;
    timer = setTimeout(() => { longDone = true; add(); }, 750);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt => {
    withdraw.addEventListener(evt, () => { if (timer) clearTimeout(timer); });
  });
  withdraw.addEventListener('click', (e) => {
    e.preventDefault();
    if (!longDone) subtract();
  });
  s.appendChild(withdraw);
  app.replaceChildren(s);
  renderBalanceTexts();
}

function render() {
  const route = currentRoute();
  if (window.Telegram?.WebApp) window.Telegram.WebApp.expand();
  if (route === '/kubstr') return renderKubstr();
  if (route === '/kubstr2') return renderKubstr2();
  if (route === '/vivod1') return renderVivod1();
  return renderGlavnaya();
}
window.addEventListener('popstate', render);
render();
