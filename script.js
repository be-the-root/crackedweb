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

function splitIntoChars(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  const tokens = [];
  textNodes.forEach(node => {
    const text = node.nodeValue;
    if (!text) return;
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      if (ch === ' ' || ch === '\n' || ch === '\t') {
        frag.appendChild(document.createTextNode(ch === ' ' ? ' ' : ch));
      } else {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        frag.appendChild(span);
        tokens.push(span);
      }
    }
    node.parentNode.replaceChild(frag, node);
  });

  return tokens;
}

function splitIntoWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  const tokens = [];
  textNodes.forEach(node => {
    const text = node.nodeValue;
    if (!text) return;
    const frag = document.createDocumentFragment();
    const parts = text.split(/(\s+)/);
    parts.forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = part;
        frag.appendChild(span);
        tokens.push(span);
      }
    });
    node.parentNode.replaceChild(frag, node);
  });

  return tokens;
}

function splitContent(el) {
  return el.textContent.trim().length < 100
    ? splitIntoChars(el)
    : splitIntoWords(el);
}

const introBlocks = [];
document.querySelectorAll('.badge, main p, main h2, footer span, .tag').forEach(el => {
  introBlocks.push({ el, tokens: splitContent(el) });
});

function runNameAnimation() {
  const el = document.getElementById('nameText');
  if (!el) return;

  el.textContent = '';

  const titles = [
    'security researcher',
    'ethical hacker',
    'web app pentester',
    'bug hunter',
    'ctf player'
  ];

  const finalName = 'udesh';
  const FLIP_MS   = 220;
  const CYCLE_MS  = 520;

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
      if (j < finalName.length) {
        el.textContent += finalName[j];
        j++;
        setTimeout(step, 130);
      }
    })();
  }

  setTimeout(cycle, 200);
}

function startReveal() {
  runNameAnimation();

  let delay = 0.55;
  introBlocks.forEach(({ tokens }) => {
    const long     = tokens.length > 30;
    const perToken = long ? 0.008 : 0.018;
    const cap      = long ? 0.35  : 0.85;
    const gap      = long ? 0.14  : 0.22;

    tokens.forEach((tok, i) => {
      tok.style.transitionDelay = (delay + i * perToken) + 's';
      tok.classList.add('shown');
    });
    delay += Math.min(tokens.length * perToken, cap) + gap;
  });
}

function finishIntro() {
  const intro = document.getElementById('intro');
  if (intro) intro.remove();
  if (!document.body.classList.contains('intro-done')) {
    document.body.classList.add('intro-done');
    setTimeout(startReveal, 250);
  }
}

function tornadoAnimation(done) {
  const letters = document.querySelectorAll('.logo-letter');
  if (!letters.length) { done(); return; }

  const animations = [];

  letters.forEach((letter, i) => {
    const startAngle  = Math.random() * Math.PI * 2;
    const startRadius = 700 + Math.random() * 500;
    const swirl       = (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 1.6 + Math.random() * Math.PI);
    const spin        = (Math.random() > 0.5 ? 1 : -1) * (900 + Math.random() * 900);

    const STEPS = 10;
    const keyframes = [];

    for (let s = 0; s <= STEPS; s++) {
      const p = s / STEPS;
      const eased = 1 - Math.pow(1 - p, 2.6);
      const angle = startAngle + swirl * eased;
      const radius = startRadius * (1 - eased);
      const rot = spin * (1 - eased);
      const scale = 0.25 + 0.75 * eased;
      const blur = 26 * (1 - eased);
      const opacity = Math.min(1, p * 2.4);

      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;

      keyframes.push({
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
        opacity: opacity,
        filter: `blur(${blur}px)`,
        offset: p
      });
    }

    const anim = letter.animate(keyframes, {
      duration: 1600,
      delay: 150 + i * 90,
      easing: 'linear',
      fill: 'both'
    });

    animations.push(anim.finished);
  });

  Promise.all(animations).then(() => {
    const logo = document.getElementById('introLogo');
    if (logo) logo.classList.add('settle');

    setTimeout(done, 550);
  });
}

(function runIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (calm) {
    document.getElementById('nameText').textContent = 'udesh';
    introBlocks.forEach(({ tokens }) => tokens.forEach(t => t.classList.add('shown')));
    finishIntro();
    return;
  }

  setTimeout(() => {
    tornadoAnimation(() => {
      intro.classList.add('flash');
      setTimeout(() => {
        intro.classList.add('done');
        setTimeout(finishIntro, 950);
      }, 200);
    });
  }, 300);
})();
