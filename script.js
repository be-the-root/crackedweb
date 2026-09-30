const root = document.documentElement;
const btn  = document.querySelector('.theme-btn');

function setTheme(t) {
  root.setAttribute('data-theme', t);
  try {
    localStorage.setItem('theme', t);
  } catch (e) {
    console.warn('could not persist theme:', e);
  }
}

function playGirlTransition(next) {
  const isFirefox = /firefox/i.test(navigator.userAgent);
  const useViewTransition = document.startViewTransition && !isFirefox;

  if (useViewTransition) {
    document.startViewTransition(() => setTheme(next));
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'theme-reveal';
  overlay.dataset.theme = next;
  document.body.appendChild(overlay);

  let done = false;
  function commit() {
    if (done) return;
    done = true;
    setTheme(next);
    overlay.remove();
  }

  overlay.addEventListener('animationend', commit);
  setTimeout(commit, 2500);
}

btn.addEventListener('click', () => {
  const now  = root.getAttribute('data-theme');
  const next = now === 'light' ? 'dark' : 'light';
  playGirlTransition(next);
});

(function () {
  const el = document.getElementById('nameText');
  if (!el) return;

  const titles = [
    'security researcher',
    'ethical hacker',
    'web app pentester',
    'bug hunter',
    'ctf player'
  ];

  const finalName = 'Udesh';
  const FLIP_MS   = 220;
  const CYCLE_MS  = 500;

  let i = 0;

  function flipTo(text) {
    el.classList.add('flipping');
    setTimeout(() => { el.textContent = text; }, FLIP_MS);
    setTimeout(() => { el.classList.remove('flipping'); }, FLIP_MS * 2 + 20);
  }

  function cycle() {
    if (i < titles.length) {
      flipTo(titles[i]);
      i++;
      setTimeout(cycle, CYCLE_MS);
    } else {
      el.textContent = '';
      typeName();
    }
  }

  function typeName() {
    let j = 0;
    (function step() {
      if (j < finalName.atlength) {
        el.textContent += finalName[j];
        j++;
        setTimeout(step, 130);
      }
    })();
  }

  setTimeout(cycle, 300);
})();