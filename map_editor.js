// Editor nepriechodných regiónov pre FF-like hru

const BG_SRC = 'background.png';
const canvas = document.getElementById('map-canvas');
const ctx = canvas.getContext('2d');
const exportOutput = document.getElementById('export-output');

let bgImg = new window.Image();
let scale = 1;
let offsetX = 0, offsetY = 0;

let regions = [];
let currentRegion = [];
let mode = 'region'; // 'region', 'trigger', alebo 'select'
let triggers = [];
let currentTriggerText = '';
let selectedObject = null; // { type: 'region'|'trigger', index: number }

function fitImageToCanvas() {
  // Zmenši obrázok tak, aby sa vošiel do canvasu (max 90vw x 70vh)
  const maxW = window.innerWidth * 0.9;
  const maxH = window.innerHeight * 0.7;
  scale = Math.min(maxW / bgImg.width, maxH / bgImg.height, 1);
  canvas.width = Math.round(bgImg.width * scale);
  canvas.height = Math.round(bgImg.height * scale);
  offsetX = 0;
  offsetY = 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  // Vykresli regióny (červené)
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#ff0000';
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    if (region.length > 2) {
      ctx.beginPath();
      ctx.moveTo(region[0].x, region[0].y);
      for (let j = 1; j < region.length; ++j) ctx.lineTo(region[j].x, region[j].y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
  // Vykresli triggery (fialové)
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#a21caf';
  for (let i = 0; i < triggers.length; i++) {
    const trig = triggers[i];
    if (trig.polygon.length > 2) {
      ctx.beginPath();
      ctx.moveTo(trig.polygon[0].x, trig.polygon[0].y);
      for (let j = 1; j < trig.polygon.length; ++j) ctx.lineTo(trig.polygon[j].x, trig.polygon[j].y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
  // Body aktuálneho regiónu
  if (currentRegion.length > 0) {
    ctx.save();
    ctx.strokeStyle = mode === 'region' ? '#00ffcc' : '#a21caf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentRegion[0].x, currentRegion[0].y);
    for (let i = 1; i < currentRegion.length; ++i) ctx.lineTo(currentRegion[i].x, currentRegion[i].y);
    ctx.stroke();
    ctx.restore();
    // Body
    for (const pt of currentRegion) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = mode === 'region' ? '#00ffcc' : '#a21caf';
      ctx.fill();
    }
  }
  // Body regiónov
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    for (const pt of region) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff0000';
      ctx.fill();
    }
  }
  // Body triggerov
  for (let i = 0; i < triggers.length; i++) {
    const trig = triggers[i];
    for (const pt of trig.polygon) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#a21caf';
      ctx.fill();
    }
  }
  // Zvýraznenie vybraného objektu
  if (selectedObject) {
    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    if (selectedObject.type === 'region') {
      const region = regions[selectedObject.index];
      if (region.length > 2) {
        ctx.beginPath();
        ctx.moveTo(region[0].x, region[0].y);
        for (let i = 1; i < region.length; ++i) ctx.lineTo(region[i].x, region[i].y);
        ctx.closePath();
        ctx.stroke();
      }
    } else if (selectedObject.type === 'trigger') {
      const trig = triggers[selectedObject.index];
      if (trig.polygon.length > 2) {
        ctx.beginPath();
        ctx.moveTo(trig.polygon[0].x, trig.polygon[0].y);
        for (let i = 1; i < trig.polygon.length; ++i) ctx.lineTo(trig.polygon[i].x, trig.polygon[i].y);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function canvasToMap(x, y) {
  // Prevod z canvasu na súradnice mapy
  return { x: Math.round(x / scale), y: Math.round(y / scale) };
}
function mapToCanvas(x, y) {
  // Prevod zo súradníc mapy na canvas
  return { x: Math.round(x * scale), y: Math.round(y * scale) };
}

function updateStatusBar() {
  // Aktualizuj režim
  const modeNames = {
    'region': 'Nepriechodné regióny',
    'trigger': 'Textové triggery', 
    'select': 'Výber a mazanie'
  };
  const modeColors = {
    'region': 'bg-blue-600',
    'trigger': 'bg-purple-600',
    'select': 'bg-orange-600'
  };
  document.getElementById('current-mode').textContent = modeNames[mode];
  document.getElementById('current-mode').className = `ml-2 px-2 py-1 rounded text-sm font-medium ${modeColors[mode]}`;
  
  // Aktualizuj počty
  document.getElementById('region-count').textContent = regions.length;
  document.getElementById('trigger-count').textContent = triggers.length;
  
  // Aktualizuj vybraný objekt
  const selectedInfo = document.getElementById('selected-info');
  const selectedType = document.getElementById('selected-type');
  if (selectedObject) {
    const typeNames = {
      'region': 'Nepriechodný región',
      'trigger': 'Textový trigger'
    };
    const typeColors = {
      'region': 'bg-red-600',
      'trigger': 'bg-purple-600'
    };
    selectedType.textContent = typeNames[selectedObject.type];
    selectedType.className = `ml-2 px-2 py-1 rounded text-sm font-medium ${typeColors[selectedObject.type]}`;
    selectedInfo.classList.remove('hidden');
  } else {
    selectedInfo.classList.add('hidden');
  }
}

function setMode(newMode) {
  mode = newMode;
  // Aktualizuj vizuálny stav tlačidiel
  document.getElementById('btn-mode-region').classList.toggle('ring-2', mode === 'region');
  document.getElementById('btn-mode-trigger').classList.toggle('ring-2', mode === 'trigger');
  document.getElementById('btn-delete-selected').classList.toggle('ring-2', mode === 'select');
  selectedObject = null;
  updateStatusBar();
  draw();
}

document.getElementById('btn-mode-region').onclick = () => setMode('region');
document.getElementById('btn-mode-trigger').onclick = () => setMode('trigger');
document.getElementById('btn-delete-selected').onclick = () => {
  if (selectedObject) {
    // Ak je už niečo vybrané, vymaž to
    const typeNames = {
      'region': 'nepriechodný región',
      'trigger': 'textový trigger'
    };
    if (confirm(`Naozaj chceš vymazať tento ${typeNames[selectedObject.type]}?`)) {
      if (selectedObject.type === 'region') {
        regions.splice(selectedObject.index, 1);
      } else if (selectedObject.type === 'trigger') {
        triggers.splice(selectedObject.index, 1);
      }
      selectedObject = null;
      updateStatusBar();
      draw();
    }
  } else {
    // Ak nie je nič vybrané, prepni do režimu výberu
    setMode('select');
  }
};
setMode('region');

// Funkcia na kontrolu, či je bod blízko bodu polygónu
function isPointNearPolygonPoint(mouseX, mouseY, polygon, threshold = 8) {
  for (let i = 0; i < polygon.length; i++) {
    const pt = polygon[i];
    const dist = Math.sqrt((mouseX - pt.x) ** 2 + (mouseY - pt.y) ** 2);
    if (dist <= threshold) {
      return i;
    }
  }
  return -1;
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (mode === 'select') {
    // Skontroluj triggery
    for (let i = 0; i < triggers.length; i++) {
      const pointIndex = isPointNearPolygonPoint(x, y, triggers[i].polygon);
      if (pointIndex >= 0) {
        selectedObject = { type: 'trigger', index: i };
        updateStatusBar();
        draw();
        return;
      }
    }
    // Skontroluj regióny
    for (let i = 0; i < regions.length; i++) {
      const pointIndex = isPointNearPolygonPoint(x, y, regions[i]);
      if (pointIndex >= 0) {
        selectedObject = { type: 'region', index: i };
        updateStatusBar();
        draw();
        return;
      }
    }
    // Ak klikol mimo, zruš výber
    selectedObject = null;
    updateStatusBar();
    draw();
    return;
  }
  
  currentRegion.push({ x, y });
  updateStatusBar();
  draw();
});

canvas.addEventListener('dblclick', async e => {
  if (currentRegion.length > 2) {
    if (mode === 'region') {
      regions.push([...currentRegion]);
    } else if (mode === 'trigger') {
      let text = prompt('Zadaj text pre tento trigger (použi \\n pre nový riadok):', currentTriggerText || '');
      if (text) {
        triggers.push({ polygon: [...currentRegion], text });
        currentTriggerText = text;
      }
    }
    currentRegion = [];
    updateStatusBar();
    draw();
  }
});

document.getElementById('btn-new-region').onclick = () => {
  if (currentRegion.length > 2) {
    if (mode === 'region') {
      regions.push([...currentRegion]);
    } else if (mode === 'trigger') {
      let text = prompt('Zadaj text pre tento trigger (použi \\n pre nový riadok):', currentTriggerText || '');
      if (text) {
        triggers.push({ polygon: [...currentRegion], text });
        currentTriggerText = text;
      }
    }
  }
  currentRegion = [];
  updateStatusBar();
  draw();
};

document.getElementById('btn-undo').onclick = () => {
  currentRegion.pop();
  updateStatusBar();
  draw();
};

document.getElementById('btn-clear').onclick = () => {
  if (confirm('Naozaj chceš vymazať všetky regióny a triggery?')) {
    regions = [];
    triggers = [];
    currentRegion = [];
    selectedObject = null;
    updateStatusBar();
    draw();
    exportOutput.value = '';
  }
};

document.getElementById('btn-export').onclick = () => {
  // Exportuj regióny a triggery v súradniciach mapy
  const exportData = {
    regions: regions.map(region => region.map(pt => canvasToMap(pt.x, pt.y))),
    triggers: triggers.map(trig => ({
      polygon: trig.polygon.map(pt => canvasToMap(pt.x, pt.y)),
      text: trig.text
    }))
  };
  exportOutput.value = JSON.stringify(exportData, null, 2);
};

document.getElementById('import-json').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const data = JSON.parse(evt.target.result);
      if (Array.isArray(data)) {
        // starý formát: len regions
        regions = data;
        triggers = [];
      } else {
        regions = data.regions || [];
        triggers = data.triggers || [];
      }
      // Preveď na canvas súradnice
      regions = regions.map(region => region.map(pt => mapToCanvas(pt.x, pt.y)));
      triggers = triggers.map(trig => ({
        polygon: trig.polygon.map(pt => mapToCanvas(pt.x, pt.y)),
        text: trig.text
      }));
      updateStatusBar();
      draw();
    } catch (err) {
      alert('Chyba pri načítaní JSON: ' + err);
    }
  };
  reader.readAsText(file);
};

// Načítanie obrázka a inicializácia
bgImg.onload = () => {
  fitImageToCanvas();
  updateStatusBar();
  draw();
};
bgImg.onerror = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText('Nepodarilo sa načítať background.png', 20, 40);
};
bgImg.src = BG_SRC;

window.addEventListener('resize', () => {
  if (bgImg.complete && bgImg.naturalWidth) {
    fitImageToCanvas();
    draw();
  }
});

// Pri načítaní editora sa pokús načítať regions.json
fetch('regions.json').then(resp => resp.ok ? resp.json() : null).then(data => {
  if (!data) return;
  regions = (data.regions || []).map(region => region.map(pt => mapToCanvas(pt.x, pt.y)));
  triggers = (data.triggers || []).map(trig => ({
    polygon: trig.polygon.map(pt => mapToCanvas(pt.x, pt.y)),
    text: trig.text
  }));
  updateStatusBar();
  draw();
});

// Inicializácia status baru
updateStatusBar(); 