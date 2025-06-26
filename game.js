// Herný engine pre FF-like hru

const GAME_BG_SRC = 'background.png'; // Môžeš nahradiť vlastným obrázkom
const PLAYER_RADIUS = 32;
const PLAYER_COLOR = '#00ffcc';
const DEBUG_COLOR = '#ff00cc';

const gameRoot = document.getElementById('game-root');
const errorRoot = document.getElementById('error-root');

function showError(err) {
  errorRoot.innerHTML = `<h2 class="text-xl font-bold mb-2">Chyba v hre</h2><pre class="whitespace-pre-wrap">${err.stack || err}</pre>`;
  errorRoot.classList.remove('hidden');
  gameRoot.innerHTML = '';
}

function hideError() {
  errorRoot.classList.add('hidden');
}

async function main() {
  hideError();
  // Canvas setup
  const canvas = document.createElement('canvas');
  canvas.className = 'block w-full h-full';
  canvas.tabIndex = 0;
  gameRoot.innerHTML = '';
  gameRoot.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // Načítanie pozadia
  const bgImg = new window.Image();
  bgImg.src = GAME_BG_SRC;
  await new Promise((resolve, reject) => {
    bgImg.onload = resolve;
    bgImg.onerror = () => reject(new Error('Nepodarilo sa načítať obrázok pozadia: ' + GAME_BG_SRC));
  });

  // Herný stav
  let player = {
    x: bgImg.width / 2,
    y: bgImg.height / 2,
    speed: 5,
  };

  // Ovládanie
  const keys = {};
  window.addEventListener('keydown', e => { keys[e.key] = true; });
  window.addEventListener('keyup', e => { keys[e.key] = false; });

  // Touch ovládanie (veľmi jednoduché)
  let touchStart = null;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });
  canvas.addEventListener('touchend', () => { touchStart = null; });
  canvas.addEventListener('touchmove', e => {
    if (!touchStart || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) keys['ArrowRight'] = true;
        else keys['ArrowLeft'] = true;
      } else {
        if (dy > 0) keys['ArrowDown'] = true;
        else keys['ArrowUp'] = true;
      }
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setTimeout(() => { keys['ArrowRight'] = keys['ArrowLeft'] = keys['ArrowUp'] = keys['ArrowDown'] = false; }, 100);
    }
  });

  // Resizovanie canvasu
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Výpočet offsetu pozadia podľa pozície hráča
  function getBgOffset() {
    let offsetX = 0, offsetY = 0;
    // Horizontálne
    if (bgImg.width <= canvas.width) {
      offsetX = (canvas.width - bgImg.width) / 2;
    } else {
      const leftLimit = canvas.width / 2;
      const rightLimit = bgImg.width - canvas.width / 2;
      if (player.x < leftLimit) offsetX = 0;
      else if (player.x > rightLimit) offsetX = canvas.width - bgImg.width;
      else offsetX = leftLimit - player.x;
    }
    // Vertikálne
    if (bgImg.height <= canvas.height) {
      offsetY = (canvas.height - bgImg.height) / 2;
    } else {
      const topLimit = canvas.height / 2;
      const bottomLimit = bgImg.height - canvas.height / 2;
      if (player.y < topLimit) offsetY = 0;
      else if (player.y > bottomLimit) offsetY = canvas.height - bgImg.height;
      else offsetY = topLimit - player.y;
    }
    return { offsetX, offsetY };
  }

  // Herný loop
  function gameLoop() {
    // Pohyb hráča
    if (keys['ArrowUp']) player.y -= player.speed;
    if (keys['ArrowDown']) player.y += player.speed;
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;
    // Ochrana proti pohybu mimo mapu
    player.x = Math.max(PLAYER_RADIUS, Math.min(bgImg.width - PLAYER_RADIUS, player.x));
    player.y = Math.max(PLAYER_RADIUS, Math.min(bgImg.height - PLAYER_RADIUS, player.y));

    // Výpočet offsetu
    const { offsetX, offsetY } = getBgOffset();

    // Vykreslenie pozadia
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, offsetX, offsetY, bgImg.width, bgImg.height);

    // Vykreslenie hráča
    const px = player.x + offsetX;
    const py = player.y + offsetY;
    ctx.beginPath();
    ctx.arc(px, py, PLAYER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = DEBUG_COLOR;
    ctx.stroke();

    // Debug info
    ctx.font = '16px monospace';
    ctx.fillStyle = DEBUG_COLOR;
    ctx.fillText(`x: ${player.x.toFixed(1)} y: ${player.y.toFixed(1)}`, px + PLAYER_RADIUS + 8, py);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 40, py);
    ctx.strokeStyle = DEBUG_COLOR;
    ctx.stroke();

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

// Spustenie hry s error handlingom
(async () => {
  try {
    await main();
  } catch (err) {
    showError(err);
  }
})(); 