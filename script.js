const welcomeScreen = document.getElementById('welcomeScreen');
const heroScreen = document.getElementById('heroScreen');
const nameForm = document.getElementById('nameForm');
const nameInput = document.getElementById('nameInput');
const nameError = document.getElementById('nameError');
const visitorName = document.getElementById('visitorName');
const backButton = document.getElementById('backButton');
const restartButton = document.getElementById('restartButton');
const musicButton = document.getElementById('musicButton');
const musicLabel = document.getElementById('musicLabel');
const diwaliSong = document.getElementById('diwaliSong');

function createParticles(container, count, hero = false) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = reducedMotion ? Math.min(count, 12) : count;
  for (let i = 0; i < total; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.setProperty('--size', `${Math.random() * (hero ? 5 : 4) + 2}px`);
    particle.style.setProperty('--duration', `${Math.random() * 9 + 8}s`);
    particle.style.setProperty('--delay', `${Math.random() * -18}s`);
    particle.style.setProperty('--opacity', `${Math.random() * .55 + .25}`);
    container.appendChild(particle);
  }
}

createParticles(document.getElementById('welcomeParticles'), 40);
createParticles(document.getElementById('heroParticles'), 55, true);

function switchScreen(showHero) {
  welcomeScreen.classList.toggle('active', !showHero);
  heroScreen.classList.toggle('active', showHero);
  welcomeScreen.setAttribute('aria-hidden', String(showHero));
  heroScreen.setAttribute('aria-hidden', String(!showHero));
  if (showHero) {
    requestAnimationFrame(() => {
      resizeCanvas();
      startFireworks();
    });
  }
}

async function playSong() {
  try {
    await diwaliSong.play();
    musicButton.setAttribute('aria-pressed', 'true');
    musicLabel.textContent = 'Pause Song';
  } catch (error) {
    musicButton.setAttribute('aria-pressed', 'false');
    musicLabel.textContent = 'Play Song';
  }
}

nameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const cleanName = nameInput.value.trim().replace(/\s+/g, ' ').slice(0, 80);
  if (!cleanName) {
    nameError.textContent = 'Please enter your beautiful name.';
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.focus();
    return;
  }
  nameError.textContent = '';
  nameInput.setAttribute('aria-invalid', 'false');
  visitorName.textContent = cleanName;
  switchScreen(true);
  playSong();
});

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) {
    nameError.textContent = '';
    nameInput.setAttribute('aria-invalid', 'false');
  }
});

function returnToWelcome() {
  clearInterval(burstTimer);
  particles = [];
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  diwaliSong.pause();
  musicButton.setAttribute('aria-pressed', 'false');
  musicLabel.textContent = 'Play Song';
  switchScreen(false);
  nameInput.focus();
}

backButton.addEventListener('click', returnToWelcome);
restartButton.addEventListener('click', () => {
  nameInput.value = '';
  visitorName.textContent = '';
  returnToWelcome();
});

musicButton.addEventListener('click', () => {
  if (diwaliSong.paused) playSong();
  else {
    diwaliSong.pause();
    musicButton.setAttribute('aria-pressed', 'false');
    musicLabel.textContent = 'Play Song';
  }
});

const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(heroScreen.clientWidth, window.innerWidth || 0);
  const height = Math.max(heroScreen.clientHeight, window.innerHeight || 0);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', () => requestAnimationFrame(resizeCanvas));
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 150));
resizeCanvas();

class Spark {
  constructor(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * (window.innerWidth < 600 ? 2.1 : 2.8) + .8;
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * .018 + .012;
    this.color = Math.random() > .5 ? '#ffd978' : '#ff9f43';
  }
  update() { this.x += this.vx; this.y += this.vy; this.vy += .018; this.life -= this.decay; }
  draw() { ctx.globalAlpha = Math.max(this.life, 0); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, window.innerWidth < 600 ? 1.8 : 1.6, 0, Math.PI * 2); ctx.fill(); }
}

const crackerLayer = document.getElementById('crackerLayer');

function burstDom(x, y) {
  const burst = document.createElement('span');
  burst.className = 'cracker-burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  const total = window.innerWidth < 600 ? 18 : 28;
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 * i / total) + Math.random() * .25;
    const distance = (window.innerWidth < 600 ? 45 : 72) + Math.random() * 55;
    const pixel = document.createElement('i');
    pixel.className = 'cracker-pixel';
    pixel.style.setProperty('--tx', `${(Math.cos(angle) * distance).toFixed(1)}px`);
        pixel.style.setProperty('--ty', `${(Math.sin(angle) * distance).toFixed(1)}px`);
    pixel.style.setProperty('--pixel-color', i % 3 === 0 ? '#fff3a6' : (i % 2 === 0 ? '#ffd978' : '#ff9f43'));
    burst.appendChild(pixel);
  }
  crackerLayer.appendChild(burst);
  setTimeout(() => burst.remove(), 1150);
}

function burst() {
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  const x = Math.random() * width;
  const y = Math.random() * height * .55;
  const count = window.innerWidth < 600 ? 24 : 38;
  for (let i = 0; i < count; i++) particles.push(new Spark(x, y));
  burstDom(x, y);
}

function animateFireworks() {
  if (document.hidden || !heroScreen.classList.contains('active')) {
    animationId = null;
    return;
  }
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  particles.forEach((spark) => { spark.update(); spark.draw(); });
  particles = particles.filter((spark) => spark.life > 0);
  ctx.globalAlpha = 1;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animationId = requestAnimationFrame(animateFireworks);
  } else {
    animationId = null;
  }
}

let burstTimer = null;
function startFireworks() {
  clearInterval(burstTimer);
  resizeCanvas();
  burst();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    burstTimer = setInterval(() => {
      if (heroScreen.classList.contains('active') && !document.hidden) burst();
    }, window.innerWidth < 600 ? 2600 : 2200);
    if (!animationId) animateFireworks();
  }
}

heroScreen.addEventListener('pointerdown', (event) => {
  if (!heroScreen.classList.contains('active')) return;
  if (event.target.closest('button')) return;
  const rect = heroScreen.getBoundingClientRect();
  burstDom(event.clientX - rect.left, event.clientY - rect.top);
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && heroScreen.classList.contains('active') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !animationId) animateFireworks();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && heroScreen.classList.contains('active')) returnToWelcome();
});
