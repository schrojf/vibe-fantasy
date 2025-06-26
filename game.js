// Herný engine pre FF-like hru

const GAME_BG_SRC = 'background.png'; // Môžeš nahradiť vlastným obrázkom
const PLAYER_RADIUS = 32;
const PLAYER_COLOR = '#00ffcc';
const DEBUG_COLOR = '#ff00cc';

const gameRoot = document.getElementById('game-root');
const errorRoot = document.getElementById('error-root');

// ====== KONFIGURÁCIA REGIÓNOV ======
const REGIONS_SRC = 'regions.json'; // Export z editora
let regions = [];
let triggers = [];

// ====== TEXTOVÉ OKNO ======
let textBoxActive = false;
let textBoxQueue = [];
let textBoxCurrent = '';
let textBoxIndex = 0;
let textBoxChar = 0;
let textBoxElement = null;
let textBoxResolve = null;
let lastTriggerTime = {}; // Debounce pre triggery
let playerInTrigger = {}; // Sledovanie či je hráč v triggeri

function showError(err) {
  errorRoot.innerHTML = `<h2 class="text-xl font-bold mb-2">Chyba v hre</h2><pre class="whitespace-pre-wrap">${err.stack || err}</pre>`;
  errorRoot.classList.remove('hidden');
  gameRoot.innerHTML = '';
}

function hideError() {
  errorRoot.classList.add('hidden');
}

// Pomocná funkcia: bod v polygóne (ray-casting algorithm)
function pointInPolygon(point, polygon) {
  let {x, y} = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x, yi = polygon[i].y;
    let xj = polygon[j].x, yj = polygon[j].y;
    let intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function createTextBox() {
  if (!textBoxElement) {
    textBoxElement = document.createElement('div');
    textBoxElement.className = 'fixed left-1/2 bottom-8 max-w-3xl w-[95vw] -translate-x-1/2 z-50 select-none';
    textBoxElement.style.fontFamily = 'monospace';
    textBoxElement.style.fontSize = '18px';
    textBoxElement.style.lineHeight = '1.4';
    textBoxElement.style.letterSpacing = '0.5px';
    textBoxElement.style.pointerEvents = 'auto';
    textBoxElement.tabIndex = 0;
    
    // FF7 štýl pozadie a orámovanie
    textBoxElement.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)';
    textBoxElement.style.border = '3px solid #444';
    textBoxElement.style.borderRadius = '8px';
    textBoxElement.style.padding = '20px 25px';
    textBoxElement.style.boxShadow = '0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)';
    textBoxElement.style.color = '#e0e0e0';
    textBoxElement.style.textShadow = '1px 1px 2px #000';
    
    document.body.appendChild(textBoxElement);
    textBoxElement.addEventListener('click', nextTextBox);
    window.addEventListener('keydown', e => {
      if (textBoxActive && (e.key === ' ' || e.key === 'Enter' || e.key === 'z' || e.key === 'x')) {
        e.preventDefault();
        nextTextBox();
      }
    });
  }
}

function showTextBox(texts) {
  createTextBox();
  textBoxActive = true;
  textBoxQueue = Array.isArray(texts) ? texts : [texts];
  textBoxIndex = 0;
  textBoxChar = 0;
  textBoxCurrent = '';
  textBoxElement.style.display = '';
  textBoxElement.focus();
  renderTextBox();
  return new Promise(resolve => { textBoxResolve = resolve; });
}

function renderTextBox() {
  const fullText = textBoxQueue[textBoxIndex] || '';
  textBoxCurrent = fullText.slice(0, textBoxChar);
  
  // FF7 štýl text s jemným kurzorom
  const cursor = textBoxChar < fullText.length ? 
    '<span style="color: #ffd700; animation: blink 0.8s infinite;">█</span>' : 
    '<span style="color: #ffd700; animation: blink 1.2s infinite;">▶</span>';
  
  textBoxElement.innerHTML = textBoxCurrent.replace(/\n/g, '<br>') + cursor;
  
  if (textBoxChar < fullText.length) {
    setTimeout(() => {
      textBoxChar += 1;
      renderTextBox();
    }, 25); // Rýchlejšie ako predtým
  }
}

function nextTextBox() {
  const fullText = textBoxQueue[textBoxIndex] || '';
  if (textBoxChar < fullText.length) {
    textBoxChar = fullText.length;
    renderTextBox();
    return;
  }
  textBoxIndex++;
  textBoxChar = 0;
  if (textBoxIndex < textBoxQueue.length) {
    renderTextBox();
  } else {
    textBoxElement.style.display = 'none';
    textBoxActive = false;
    if (textBoxResolve) textBoxResolve();
  }
}

// Pridaj CSS animáciu pre kurzor
const style = document.createElement('style');
style.textContent = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;
document.head.appendChild(style);

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

  // Načítanie regiónov a triggerov
  try {
    const resp = await fetch(REGIONS_SRC);
    if (resp.ok) {
      const data = await resp.json();
      regions = (data.regions || []).map(poly => poly.map(pt => ({x: pt.x, y: pt.y})));
      triggers = (data.triggers || []).map(trig => ({
        polygon: trig.polygon.map(pt => ({x: pt.x, y: pt.y})),
        text: trig.text
      }));
      // Inicializuj debounce pre každý trigger
      triggers.forEach((_, index) => {
        lastTriggerTime[index] = 0;
        playerInTrigger[index] = false;
      });
    }
  } catch (e) {
    regions = [];
    triggers = [];
  }

  // Herný loop
  async function gameLoop() {
    // Ak je aktívne textové okno, pauzni hru
    if (textBoxActive) {
      requestAnimationFrame(gameLoop);
      return;
    }
    // Pohyb hráča s kolíziou
    let nextX = player.x;
    let nextY = player.y;
    if (keys['ArrowUp']) nextY -= player.speed;
    if (keys['ArrowDown']) nextY += player.speed;
    if (keys['ArrowLeft']) nextX -= player.speed;
    if (keys['ArrowRight']) nextX += player.speed;
    // Ochrana proti pohybu mimo mapu
    nextX = Math.max(PLAYER_RADIUS, Math.min(bgImg.width - PLAYER_RADIUS, nextX));
    nextY = Math.max(PLAYER_RADIUS, Math.min(bgImg.height - PLAYER_RADIUS, nextY));
    // Kontrola kolízie s regiónmi (stred hráča)
    let collision = false;
    for (const poly of regions) {
      if (pointInPolygon({x: nextX, y: nextY}, poly)) {
        collision = true;
        break;
      }
    }
    if (!collision) {
      player.x = nextX;
      player.y = nextY;
    }
    // Trigger na textové okno s debounce
    const currentTime = Date.now();
    const DEBOUNCE_TIME = 2000; // 2 sekundy
    
    for (let i = 0; i < triggers.length; i++) {
      const trig = triggers[i];
      const isInTrigger = pointInPolygon({x: player.x, y: player.y}, trig.polygon);
      
      if (isInTrigger) {
        // Ak hráč vstúpil do triggeru
        if (!playerInTrigger[i]) {
          playerInTrigger[i] = true;
          // Ak uplynul dostatočný čas od posledného spustenia
          if (currentTime - lastTriggerTime[i] > DEBOUNCE_TIME) {
            lastTriggerTime[i] = currentTime;
            await showTextBox(trig.text);
          }
        }
      } else {
        // Ak hráč opustil trigger
        playerInTrigger[i] = false;
      }
    }

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

    // Debug: vykresli regióny
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ff0000';
    for (const poly of regions) {
      if (poly.length > 2) {
        ctx.beginPath();
        ctx.moveTo(poly[0].x + offsetX, poly[0].y + offsetY);
        for (let i = 1; i < poly.length; ++i) ctx.lineTo(poly[i].x + offsetX, poly[i].y + offsetY);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

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