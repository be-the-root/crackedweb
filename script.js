const root = document.documentElement;
const btn  = document.querySelector('.theme-btn');

function setTheme(t) {
  root.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}

function playGirlTransition(next) {
  
  if (document.startViewTransition) {
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