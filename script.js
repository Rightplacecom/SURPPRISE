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
  startFireworks();
});

nameInput.addEventListener('input', () => {
  if (nameInput.value.trim()) {
    nameError.textContent = '';
    nameInput.setAttribute('aria-invalid', 'false');
  }
});

function returnToWelcome() {
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
  const ratio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Spark {
  constructor(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2.8 + 0.8;
    this.x = x; this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1;
    this.decay = Math.random() * .018 + .012;
    this.color = Math.random() > .5 ? '#ffd978' : '#ff9f43';
  }
  update() { this.x += this.vx; this.y += this.vy; this.vy += .018; this.life -= this.decay; }
  draw() { ctx.globalAlpha = Math.max(this.life, 0); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 1.6, 0, Math.PI * 2); ctx.fill(); }
}

function burst() {
  const x = Math.random() * canvas.clientWidth;
  const y = Math.random() * canvas.clientHeight * .55;
  const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 12 : 38;
  for (let i = 0; i < count; i++) particles.push(new Spark(x, y));
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  particles.forEach((spark) => { spark.update(); spark.draw(); });
  particles = particles.filter((spark) => spark.life > 0);
  ctx.globalAlpha = 1;
  if (heroScreen.classList.contains('active') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animationId = requestAnimationFrame(animateFireworks);
  } else {
    animationId = null;
  }
}

let burstTimer = null;
function startFireworks() {
  clearInterval(burstTimer);
  burst();
  burstTimer = setInterval(() => {
    if (heroScreen.classList.contains('active')) burst();
  }, 2200);
  if (!animationId) animateFireworks();
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && heroScreen.classList.contains('active')) returnToWelcome();
});
