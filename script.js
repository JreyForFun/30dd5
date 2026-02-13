const hexInput = document.getElementById('hexInput');
const colorPicker = document.getElementById('colorPicker');
const generateBtn = document.getElementById('generateBtn');
const tabButtons = document.querySelectorAll('[role="tab"]');
const swatchesContainer = document.getElementById('swatchesContainer');
const copyAllBtn = document.getElementById('copyAllBtn');
const exportCssBtn = document.getElementById('exportCssBtn');
const toast = document.getElementById('toast');

let currentHex = '#3A86FF';
let currentMode = 'complementary';
let currentPalette = [];

function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  r /= 255;
  g /= 255;
  b /= 255;

  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
}

function generatePalette(hex, mode) {
  const { h, s, l } = hexToHsl(hex);
  let palette = [];

  switch (mode) {
    case 'complementary':
      const compH = (h + 180) % 360;
      palette = [
        hex,
        hslToHex(h, s, Math.max(10, l - 20)),
        hslToHex(h, s, Math.min(95, l + 20)),
        hslToHex(compH, s, l),
        hslToHex(compH, s, Math.min(95, l + 20))
      ];
      break;

    case 'analogous':
      palette = [
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex((h - 15 + 360) % 360, s, l),
        hex,
        hslToHex((h + 15) % 360, s, l),
        hslToHex((h + 30) % 360, s, l)
      ];
      break;

    case 'triadic':
      const tri1 = (h + 120) % 360;
      const tri2 = (h + 240) % 360;
      palette = [
        hex,
        hslToHex(tri1, s, l),
        hslToHex(tri2, s, l),
        hslToHex(tri1, s, Math.min(95, l + 20)),
        hslToHex(tri2, s, Math.min(95, l - 20))
      ];
      break;

    case 'monochromatic':
      palette = [
        hslToHex(h, s, Math.max(10, l - 30)),
        hslToHex(h, s, Math.max(10, l - 15)),
        hex,
        hslToHex(h, s, Math.min(95, l + 15)),
        hslToHex(h, s, Math.min(95, l + 30))
      ];
      break;
  }

  return palette;
}

function updateUI() {
  currentPalette = generatePalette(currentHex, currentMode);

  currentPalette.forEach((color, index) => {
    const swatchEl = document.getElementById(`swatchColor${index + 1}`);
    const hexEl = document.getElementById(`swatchHex${index + 1}`);
    const copyBtn = document.querySelector(`[data-copy-target="swatchHex${index + 1}"]`);

    swatchEl.style.backgroundColor = color;
    hexEl.textContent = color.toUpperCase();
  });
}

function setActiveTab(mode) {
  tabButtons.forEach(btn => {
    const isSelected = btn.dataset.mode === mode;
    btn.setAttribute('aria-selected', isSelected);
    if (isSelected) {
      btn.classList.add('tab-active');
      btn.classList.remove('opacity-60');
    } else {
      btn.classList.remove('tab-active');
      btn.classList.add('opacity-60');
    }
  });
  currentMode = mode;
  updateUI();
}

function showToast() {
  toast.classList.add('toast-show');
  setTimeout(() => {
    toast.classList.remove('toast-show');
  }, 2000);
}

hexInput.addEventListener('input', (e) => {
  let val = e.target.value;
  if (!val.startsWith('#')) val = '#' + val;
  if (/^#[0-9A-F]{6}$/i.test(val)) {
    currentHex = val;
    colorPicker.value = val;
    updateUI();
  }
});

colorPicker.addEventListener('input', (e) => {
  currentHex = e.target.value;
  hexInput.value = currentHex;
  updateUI();
});

generateBtn.addEventListener('click', () => {
  updateUI();
});

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveTab(btn.dataset.mode);
  });
});

document.querySelectorAll('[data-copy-target]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const targetId = e.target.dataset.copyTarget;
    const textToCopy = document.getElementById(targetId).textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast();
    });
  });
});

copyAllBtn.addEventListener('click', () => {
  const allHex = currentPalette.join(', ').toUpperCase();
  navigator.clipboard.writeText(allHex).then(() => {
    showToast();
  });
});

exportCssBtn.addEventListener('click', () => {
  let cssContent = `:root {\n`;
  currentPalette.forEach((color, i) => {
    cssContent += `  --color-${i + 1}: ${color.toUpperCase()};\n`;
  });
  cssContent += `}`;
  navigator.clipboard.writeText(cssContent).then(() => {
    showToast();
  });
});

hexInput.value = currentHex;
setActiveTab('complementary');
updateUI();
