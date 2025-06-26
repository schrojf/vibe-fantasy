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
  // Vykresli všetky regióny
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#ff0000';
  for (const region of regions) {
    if (region.length > 2) {
      ctx.beginPath();
      ctx.moveTo(region[0].x, region[0].y);
      for (let i = 1; i < region.length; ++i) ctx.lineTo(region[i].x, region[i].y);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
  // Aktuálny región
  if (currentRegion.length > 0) {
    ctx.save();
    ctx.strokeStyle = '#00ffcc';
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
      ctx.fillStyle = '#00ffcc';
      ctx.fill();
    }
  }
  // Body regiónov
  for (const region of regions) {
    for (const pt of region) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff0000';
      ctx.fill();
    }
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

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  currentRegion.push({ x, y });
  draw();
});

canvas.addEventListener('dblclick', e => {
  if (currentRegion.length > 2) {
    regions.push([...currentRegion]);
    currentRegion = [];
    draw();
  }
});

document.getElementById('btn-new-region').onclick = () => {
  if (currentRegion.length > 2) regions.push([...currentRegion]);
  currentRegion = [];
  draw();
};

document.getElementById('btn-undo').onclick = () => {
  currentRegion.pop();
  draw();
};

document.getElementById('btn-clear').onclick = () => {
  regions = [];
  currentRegion = [];
  draw();
  exportOutput.value = '';
};

document.getElementById('btn-export').onclick = () => {
  // Exportuj regióny v súradniciach mapy
  const exportData = regions.map(region => region.map(pt => canvasToMap(pt.x, pt.y)));
  exportOutput.value = JSON.stringify(exportData, null, 2);
};

// Načítanie obrázka a inicializácia
bgImg.onload = () => {
  fitImageToCanvas();
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