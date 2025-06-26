// Herný engine pre FF-like hru

const MAPS_CONFIG = 'maps.json';
const PLAYER_RADIUS = 32;
const PLAYER_COLOR = '#00ffcc';
const DEBUG_COLOR = '#ff00cc';

const gameRoot = document.getElementById('game-root');
const errorRoot = document.getElementById('error-root');

// ====== KONFIGURÁCIA REGIÓNOV ======
let regions = [];
let triggers = [];

// ====== MAPY ======
let maps = {};
let currentMap = null;
let currentMapId = null;

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

// ====== MOBILNÝ GAMEPAD ======
let gamepadElement = null;
let isTouchDevice = false;
let joystickActive = false;
let joystickCenter = { x: 0, y: 0 };
let joystickCurrent = { x: 0, y: 0 };
let keys = {}; // Presuniem na globálnu úroveň

// ====== HRÁČ ======
let player = {
  x: 100,
  y: 100,
  speed: 5,
};

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

function createGamepad() {
  if (gamepadElement) return;
  
  isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;
  
  gamepadElement = document.createElement('div');
  gamepadElement.className = 'fixed inset-0 pointer-events-none z-40';
  gamepadElement.innerHTML = `
    <!-- Joystick (ľavá strana) -->
    <div id="joystick-container" class="absolute bottom-8 left-8 w-24 h-24 pointer-events-auto">
      <div class="relative w-full h-full">
        <!-- Joystick pozadie -->
        <div class="w-full h-full bg-white/10 rounded-full border border-white/50 backdrop-blur-sm"></div>
        <!-- Joystick handle -->
        <div id="joystick-handle" class="absolute top-1/2 left-1/2 w-8 h-8 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 border border-white/25 shadow-lg backdrop-blur-sm"></div>
      </div>
    </div>
    
    <!-- Akčné tlačidlá (pravá strana) -->
    <div class="absolute bottom-8 right-8 flex gap-4 pointer-events-auto">
      <button id="btn-a" class="w-14 h-14 bg-green-500/40 rounded-full border border-white/50 flex items-center justify-center text-white/80 font-bold text-sm shadow-lg backdrop-blur-sm hover:bg-green-500/60 transition-all duration-200">
        A
      </button>
      <button id="btn-b" class="w-14 h-14 bg-red-500/40 rounded-full border border-white/50 flex items-center justify-center text-white/80 font-bold text-sm shadow-lg backdrop-blur-sm hover:bg-red-500/60 transition-all duration-200">
        B
      </button>
    </div>
  `;
  
  document.body.appendChild(gamepadElement);
  
  // Joystick ovládanie
  const joystickContainer = document.getElementById('joystick-container');
  const joystickHandle = document.getElementById('joystick-handle');
  const joystickRadius = 48; // Polomer joysticku
  
  function updateJoystick(x, y) {
    const rect = joystickContainer.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    
    const deltaX = x - joystickCenter.x;
    const deltaY = y - joystickCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > joystickRadius) {
      const angle = Math.atan2(deltaY, deltaX);
      joystickCurrent.x = joystickCenter.x + Math.cos(angle) * joystickRadius;
      joystickCurrent.y = joystickCenter.y + Math.sin(angle) * joystickRadius;
    } else {
      joystickCurrent.x = x;
      joystickCurrent.y = y;
    }
    
    // Aktualizuj pozíciu handle
    const handleX = joystickCurrent.x - joystickCenter.x;
    const handleY = joystickCurrent.y - joystickCenter.y;
    joystickHandle.style.transform = `translate(${handleX}px, ${handleY}px)`;
    
    // Nastav pohyb hráča
    const deadzone = 10;
    keys['ArrowUp'] = handleY < -deadzone;
    keys['ArrowDown'] = handleY > deadzone;
    keys['ArrowLeft'] = handleX < -deadzone;
    keys['ArrowRight'] = handleX > deadzone;
  }
  
  function resetJoystick() {
    joystickCurrent = { x: joystickCenter.x, y: joystickCenter.y };
    joystickHandle.style.transform = 'translate(-50%, -50%)';
    keys['ArrowUp'] = keys['ArrowDown'] = keys['ArrowLeft'] = keys['ArrowRight'] = false;
  }
  
  // Touch events pre joystick
  joystickContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickActive = true;
    updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
  });
  
  joystickContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (joystickActive) {
      updateJoystick(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
  
  joystickContainer.addEventListener('touchend', (e) => {
    e.preventDefault();
    joystickActive = false;
    resetJoystick();
  });
  
  // Mouse events pre desktop testovanie
  joystickContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    joystickActive = true;
    updateJoystick(e.clientX, e.clientY);
  });
  
  joystickContainer.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (joystickActive) {
      updateJoystick(e.clientX, e.clientY);
    }
  });
  
  joystickContainer.addEventListener('mouseup', (e) => {
    e.preventDefault();
    joystickActive = false;
    resetJoystick();
  });
  
  // Event listeners pre akčné tlačidlá
  document.getElementById('btn-a').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (textBoxActive) nextTextBox();
  });
  document.getElementById('btn-b').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (textBoxActive) nextTextBox();
  });
  
  // Mouse events pre desktop testovanie
  document.getElementById('btn-a').addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (textBoxActive) nextTextBox();
  });
  document.getElementById('btn-b').addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (textBoxActive) nextTextBox();
  });
}

// Funkcia na načítanie mapy
async function loadMap(mapId) {
  try {
    const mapConfig = maps[mapId];
    if (!mapConfig) {
      throw new Error(`Mapa '${mapId}' neexistuje`);
    }
    
    currentMapId = mapId;
    currentMap = mapConfig;
    
    // Načítanie pozadia
    const bgImg = new window.Image();
    bgImg.src = mapConfig.background;
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = () => reject(new Error('Nepodarilo sa načítať obrázok pozadia: ' + mapConfig.background));
    });
    
    // Načítanie regiónov a triggerov
    try {
      const resp = await fetch(mapConfig.regions);
      if (resp.ok) {
        const data = await resp.json();
        regions = (data.regions || []).map(poly => poly.map(pt => ({x: pt.x, y: pt.y})));
        triggers = (data.triggers || []).map(trig => ({
          polygon: trig.polygon.map(pt => ({x: pt.x, y: pt.y})),
          text: trig.text,
          action: trig.action || null // Nové pole pre akcie (napr. prechod mapy)
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
    
    return { bgImg, mapConfig };
  } catch (err) {
    throw new Error(`Chyba pri načítaní mapy '${mapId}': ${err.message}`);
  }
}

// Funkcia na spracovanie trigger akcií
async function processTriggerAction(trigger) {
  if (!trigger.action) return;
  
  const action = trigger.action;
  
  // Portal prechod na inú mapu
  if (action.type === 'portal') {
    console.log(`Portal: presun na mapu '${action.mapId}' na pozíciu (${action.playerX}, ${action.playerY})`);
    
    // Načítaj novú mapu
    let { bgImg } = await loadMap(action.mapId);
    
    // Reset pozície hráča na novú mapu
    player.x = action.playerX || 100;
    player.y = action.playerY || 100;
    
    // Ochrana proti pozícii mimo mapu
    player.x = Math.max(PLAYER_RADIUS, Math.min(bgImg.width - PLAYER_RADIUS, player.x));
    player.y = Math.max(PLAYER_RADIUS, Math.min(bgImg.height - PLAYER_RADIUS, player.y));
    
    return bgImg;
  }
  
  // Zachovám starú podporu pre changeMap (pre kompatibilitu)
  if (action.type === 'changeMap') {
    console.log(`ChangeMap: presun na mapu '${action.mapId}' na pozíciu (${action.playerX}, ${action.playerY})`);
    
    const { bgImg } = await loadMap(action.mapId);
    player.x = action.playerX || 100;
    player.y = action.playerY || 100;
    
    // Ochrana proti pozícii mimo mapu
    player.x = Math.max(PLAYER_RADIUS, Math.min(bgImg.width - PLAYER_RADIUS, player.x));
    player.y = Math.max(PLAYER_RADIUS, Math.min(bgImg.height - PLAYER_RADIUS, player.y));
    
    return bgImg;
  }
  
  return null;
}

async function main() {
  hideError();
  
  // Načítanie konfigurácie máp
  try {
    const mapsResp = await fetch(MAPS_CONFIG);
    if (mapsResp.ok) {
      const mapsData = await mapsResp.json();
      maps = mapsData.maps;
      const defaultMapId = mapsData.defaultMap || Object.keys(maps)[0];
      
      // Načítanie predvolenej mapy
      let { bgImg } = await loadMap(defaultMapId);
      
      // Canvas setup
      const canvas = document.createElement('canvas');
      canvas.className = 'block w-full h-full';
      canvas.tabIndex = 0;
      gameRoot.innerHTML = '';
      gameRoot.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      // Inicializácia hráča na stred mapy
      player.x = bgImg.width / 2;
      player.y = bgImg.height / 2;
      player.speed = 5;

      // Ovládanie (keys už je definované globálne)
      window.addEventListener('keydown', e => { keys[e.key] = true; });
      window.addEventListener('keyup', e => { keys[e.key] = false; });

      // Vytvor gamepad pre mobilné zariadenia
      createGamepad();

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

      // Zisti, či je debug mód podľa URL
      const debugMode = window.location.search.includes('debug');

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
                
                // Spracuj akciu triggeru (ak existuje)
                const newBgImg = await processTriggerAction(trig);
                if (newBgImg) {
                  bgImg = newBgImg;
                  continue; // Pokračuj s novou mapou
                }
                
                // Zobraz textové okno (ak nie je akcia)
                if (trig.text) {
                  await showTextBox(trig.text);
                }
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

        // Debug: vykresli regióny a triggery
        if (debugMode) {
          // Vykresli regióny (červené)
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

          // Vykresli triggery (fialové pre textové, zelené pre portály)
          ctx.save();
          ctx.globalAlpha = 0.4;
          for (const trig of triggers) {
            ctx.fillStyle = trig.action && trig.action.type === 'portal' ? '#00ff00' : '#a21caf';
            if (trig.polygon.length > 2) {
              ctx.beginPath();
              ctx.moveTo(trig.polygon[0].x + offsetX, trig.polygon[0].y + offsetY);
              for (let i = 1; i < trig.polygon.length; ++i) ctx.lineTo(trig.polygon[i].x + offsetX, trig.polygon[i].y + offsetY);
              ctx.closePath();
              ctx.fill();
            }
          }
          ctx.restore();

          // Debug info
          ctx.font = '16px monospace';
          ctx.fillStyle = DEBUG_COLOR;
          ctx.fillText(`x: ${player.x.toFixed(1)} y: ${player.y.toFixed(1)}`, px + PLAYER_RADIUS + 8, py);
          ctx.fillText(`Mapa: ${currentMap.name}`, px + PLAYER_RADIUS + 8, py + 20);
          ctx.fillText(`Regióny: ${regions.length} | Triggery: ${triggers.length}`, px + PLAYER_RADIUS + 8, py + 40);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + 40, py);
          ctx.strokeStyle = DEBUG_COLOR;
          ctx.stroke();
        }

        requestAnimationFrame(gameLoop);
      }

      gameLoop();
    } else {
      throw new Error('Nepodarilo sa načítať maps.json');
    }
  } catch (err) {
    showError(err);
  }
}

// Spustenie hry s error handlingom
(async () => {
  try {
    await main();
  } catch (err) {
    showError(err);
  }
})(); 