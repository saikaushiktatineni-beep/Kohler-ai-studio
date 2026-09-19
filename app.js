let catalog = [];
let currentTiers = {}; 
let currentSpace = {};
let currentBaseCost = 0; 

// --- VIEWPORT STATE VARIABLES ---
let canvasImg = null;
let vX = 0, vY = 0, vScale = 1, vAngle = 0;
let isDragging = false, startX, startY;

// --- 3D RENDER DICTIONARY (27 IMAGES) ---
const renderImages = {
  "6x8": {
    "Minimalist Modern": { "Value": "mod6.8.png", "Balanced": "mod26.8.png", "Premium": "mod36.8.png" },
    "Japanese Zen":      { "Value": "zen1.6.8.png", "Balanced": "zen2.6.8.png", "Premium": "zen3.6.8.png" },
    "Classic Luxury":    { "Value": "lux18.10.png", "Balanced": "lux28.10.png", "Premium": "lux38.10.png"  } 
  },
  "8x10": {
    "Minimalist Modern": { "Value": "mod1.png.png", "Balanced": "mod2.png.png", "Premium": "mod3.png.png" },
    "Japanese Zen":      { "Value": "zen1.8.10.png", "Balanced": "zen28.10.png", "Premium": "zen3.8.10.png" },
    "Classic Luxury":    { "Value": "lux1.png.png", "Balanced": "lux2.png.png", "Premium": "lux3.png.png" }
  },
  "10x12": {
    "Minimalist Modern": { "Value": "mod110.12.png", "Balanced": "mod210.12.png", "Premium": "mod310.12.png" },
    "Japanese Zen":      { "Value": "zen1.png.png", "Balanced": "zen2.png.png", "Premium": "zen3.png.png" }, 
    "Classic Luxury":    { "Value": "lux10.12.png", "Balanced": "lux210.12.png", "Premium": "lux310.12.png" }
  }
};

// --- SMART ADD-ONS DICTIONARY ---
const addonsCatalog = [
  { id: "a1", name: "Smart Privacy Glass", desc: "Instantly shifts from clear to frosted opaque with a tap.", price: 950, img: "smartglass.png" },
  { id: "a2", name: "Smart Ambient Lighting", desc: "Voice-controlled LED lighting with dynamic color modes.", price: 300, img: "ambientlighting.png" },
  { id: "a3", name: "Interactive Smart Mirror", desc: "Touchscreen interface, weather updates, and auto-defog.", price: 650, img: "smartmirror.png" },
  { id: "a4", name: "Digital Smart Shower", desc: "Precision temp control, digital presets, and usage tracking.", price: 1400, img: "smartshower.png" }
];

// UI Listeners
document.getElementById('budget').addEventListener('input', e => document.getElementById('valBudget').innerText = '$' + Number(e.target.value).toLocaleString());

// Music Volume Listener
document.getElementById('bgm-volume').addEventListener('input', e => {
  const bgm = document.getElementById('ambient-music');
  if (bgm) bgm.volume = e.target.value;
});

function startApp() {
  const landing = document.getElementById('landing-page');
  const app = document.getElementById('app-container');
  const logoTrans = document.getElementById('logo-transition');
  
  const bgm = document.getElementById('ambient-music');
  const volSlider = document.getElementById('bgm-volume');
  if (bgm) { 
    bgm.volume = volSlider ? volSlider.value : 0.5; 
    bgm.play().catch(e => console.log("Audio blocked until interaction")); 
  }
  
  landing.classList.add('fade-out');
  
  setTimeout(() => {
    landing.style.display = 'none';
    
    if (logoTrans) {
      logoTrans.classList.remove('hidden');
      void logoTrans.offsetWidth; 
      logoTrans.classList.add('active');
      
      setTimeout(() => {
        logoTrans.classList.add('zoom');
        
        app.classList.remove('hidden');
        app.style.opacity = '0';
        void app.offsetWidth;
        app.style.transition = 'opacity 1.2s ease-in-out';
        app.style.opacity = '1';
        
        const aiToggle = document.getElementById('ai-chat-toggle');
        if (aiToggle) aiToggle.classList.remove('hidden');
        
        generateTiers();
        
        setTimeout(() => {
          logoTrans.style.display = 'none';
        }, 1500);
        
      }, 700); 
    } else {
      app.classList.remove('hidden');
      app.style.opacity = '1';
      generateTiers();
    }
  }, 800); 
}

// Fetch Catalog
fetch('products.json')
  .then(res => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  })
  .then(data => { catalog = data; })
  .catch(err => alert("ERROR: Could not load products.json."));

function generateTiers() {
  if (catalog.length === 0) return;

  const loader = document.getElementById('ai-loader');
  const loaderText = document.getElementById('loader-text');
  if (loader) loader.classList.remove('hidden');

  const aiPhrases = [
    "Analyzing spatial constraints...",
    "Calculating clearance zones...",
    "Rendering virtual environment..."
  ];
  let phraseIndex = 0;
  if (loaderText) loaderText.innerText = aiPhrases[0];
  
  const textCycle = setInterval(() => {
    phraseIndex++;
    if (phraseIndex < aiPhrases.length && loaderText) {
      loaderText.innerText = aiPhrases[phraseIndex];
    }
  }, 600);

  setTimeout(() => {
    clearInterval(textCycle);

    const dimVal = document.getElementById('roomDimensions').value;
    const actualDimVal = renderImages[dimVal] ? dimVal : "8x10";
    const [width, length] = actualDimVal.split('x').map(Number);
    
    const budget = parseFloat(document.getElementById('budget').value);
    const theme = document.getElementById('theme').value;

    currentSpace = { width, length, theme, dimString: actualDimVal };
    
    const metaText = `${width} × ${length} ft · ${theme}`;
    const leftMeta = document.getElementById('meta-summary-left');
    const rightMeta = document.getElementById('meta-summary-right');
    if (leftMeta) leftMeta.innerText = metaText;
    if (rightMeta) rightMeta.innerText = metaText;

    let themeProducts = catalog.filter(p => p.style === theme);
    const getSorted = (cat) => themeProducts.filter(p => p.category === cat).sort((a,b) => a.price - b.price);
    
    const faucets = getSorted('faucet');
    const toilets = getSorted('toilet');
    const showers = getSorted('shower');
    const vanities = getSorted('vanity');

    const sizeMultipliers = { "6x8": 0.85, "8x10": 1.00, "10x12": 1.40 };
    const multiplier = sizeMultipliers[actualDimVal] || 1;

    const buildBundle = (tierIndex) => {
      const safeGet = (arr, idx) => arr[Math.min(idx, arr.length - 1)];
      let b = {
        faucet: { ...safeGet(faucets, tierIndex) },
        toilet: { ...safeGet(toilets, tierIndex) },
        shower: { ...safeGet(showers, tierIndex) },
        vanity: { ...safeGet(vanities, tierIndex) }
      };
      
      let cost = 0;
      Object.values(b).forEach(item => { 
        if(item && item.price) { 
          item.price = Math.round(item.price * multiplier);
          cost += item.price; 
        } 
      });
      b.totalCost = cost;
      return b;
    };

    currentTiers = { Value: buildBundle(0), Balanced: buildBundle(1), Premium: buildBundle(2) };
    
    renderTierNav(budget);

    if (loader) loader.classList.add('hidden');

  }, 1800);
}

function renderTierNav(maxBudget) {
  const navDiv = document.getElementById('tier-buttons');
  if (!navDiv) return;
  navDiv.innerHTML = '';
  let firstValidTier = null;

  ['Value', 'Balanced', 'Premium'].forEach(tierName => {
    const bundle = currentTiers[tierName];
    const overBudget = bundle.totalCost > maxBudget;
    
    const btn = document.createElement('button');
    btn.className = 'tier-btn';
    btn.innerHTML = `${tierName} <br><span style="font-size:0.8rem; color:#888; font-weight:300;">$${bundle.totalCost.toLocaleString()}</span>`;
    
    if (overBudget) {
      btn.disabled = true;
    } else {
      btn.onclick = () => selectTier(tierName, btn);
      if (!firstValidTier) firstValidTier = { name: tierName, btn: btn };
    }
    navDiv.appendChild(btn);
  });

  if (firstValidTier) {
      selectTier(firstValidTier.name, firstValidTier.btn);
  }
}

function selectTier(tierName, activeBtn) {
  document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
  activeBtn.classList.add('active');

  const bundle = currentTiers[tierName];
  const bundleDiv = document.getElementById('bundle-cards');
  if (!bundleDiv) return;
  
  bundleDiv.innerHTML = '';

  Object.values(bundle).forEach(item => {
    if (!item || typeof item !== 'object' || !item.name) return;
    let sizeText = `${item.dimensions?.width || 0}' × ${item.dimensions?.depth || 0}'`;
    if ((item.dimensions?.width || 0) === 0) sizeText = "Wall Mounted";

    let ecoColor = item.water_saver ? '#5cb85c' : '#777';
    let ecoText = item.water_saver ? '✓ Eco Water-Saver' : 'Standard Flow';

    let safeName = item.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

    bundleDiv.innerHTML += `
      <div class="product-card" onclick="openProductModal('${safeName}')">
        <div class="card-category">${item.category.toUpperCase()}</div>
        <h3>${item.name}</h3>
        <span class="price">$${item.price.toLocaleString()}</span>
        <p class="meta-text">Size: ${sizeText}</p>
        <div class="card-divider"></div>
        <p class="meta-text" style="color: ${ecoColor};">${ecoText}</p>
      </div>
    `;
  });

  drawFloorPlan(currentSpace.width, currentSpace.length, tierName, currentSpace.theme);
  
  currentBaseCost = bundle.totalCost;
  
  renderAddons();
  updateGrandTotal();
}

function drawFloorPlan(roomWidth, roomLength, tierName, theme) {
  if (!currentSpace.dimString || !renderImages[currentSpace.dimString]) return;
  const imgUrl = renderImages[currentSpace.dimString][theme][tierName];
  const img = new Image();
  
  img.onerror = function() {
    const canvas = document.getElementById('floorplan');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#220000';
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
    ctx.fillStyle = '#FF4444';
    ctx.font = '16px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText("⚠️ Image Not Found", canvas.width / 2, canvas.height / 2 - 10);
  };

  img.onload = () => {
    canvasImg = img;
    resetViewport(); 
  };
  
  img.src = imgUrl;
}

function updateCanvas() {
  const canvas = document.getElementById('floorplan');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#dddddd' : '#1a1a1a'; 
  ctx.lineWidth = 1;
  const gridScale = 20;
  for(let x = 0; x <= canvas.width; x += gridScale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for(let y = 0; y <= canvas.height; y += gridScale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  if (!canvasImg) return;

  ctx.save();
  ctx.translate(canvas.width / 2 + vX, canvas.height / 2 + vY);
  ctx.scale(vScale, vScale);
  ctx.rotate((vAngle * Math.PI) / 180);

  const padding = 80;
  const maxImgSize = Math.min(canvas.width, canvas.height) - (padding * 2);
  const imgRatio = canvasImg.width / canvasImg.height;
  let finalWidth = maxImgSize * imgRatio;
  let finalHeight = maxImgSize;

  ctx.drawImage(canvasImg, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);

  ctx.fillStyle = '#FFFFFF'; 
  ctx.strokeStyle = '#555555'; 
  ctx.font = '500 12px Outfit'; 
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle';
  
  let startY = -finalHeight / 2;
  let startX = -finalWidth / 2;
  
  ctx.beginPath(); ctx.moveTo(startX, startY + finalHeight + 20); ctx.lineTo(startX + finalWidth, startY + finalHeight + 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(startX, startY + finalHeight + 15); ctx.lineTo(startX, startY + finalHeight + 25); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(startX + finalWidth, startY + finalHeight + 15); ctx.lineTo(startX + finalWidth, startY + finalHeight + 25); ctx.stroke();
  ctx.fillText(`${currentSpace.width} FT`, 0, startY + finalHeight + 35);

  ctx.beginPath(); ctx.moveTo(startX - 20, startY); ctx.lineTo(startX - 20, startY + finalHeight); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(startX - 15, startY); ctx.lineTo(startX - 25, startY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(startX - 15, startY + finalHeight); ctx.lineTo(startX - 25, startY + finalHeight); ctx.stroke();
  
  ctx.save();
  ctx.translate(startX - 35, 0);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${currentSpace.length} FT`, 0, 0);
  ctx.restore();
  ctx.restore();
}

function rotateViewport(deg) { vAngle += deg; updateCanvas(); }
function zoomViewport(amt) { vScale = Math.max(0.3, Math.min(4, vScale + amt)); updateCanvas(); }
function resetViewport() { vX = 0; vY = 0; vScale = 1; vAngle = 0; updateCanvas(); }

window.addEventListener('DOMContentLoaded', () => {
  const fpCanvas = document.getElementById('floorplan');
  if (fpCanvas) {
    fpCanvas.style.cursor = "grab";
    
    fpCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomViewport(e.deltaY < 0 ? 0.1 : -0.1);
    });

    fpCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - vX;
      startY = e.clientY - vY;
      fpCanvas.style.cursor = "grabbing";
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      vX = e.clientX - startX;
      vY = e.clientY - startY;
      updateCanvas();
    });

    window.addEventListener('mouseup', () => { isDragging = false; fpCanvas.style.cursor = "grab"; });
    fpCanvas.addEventListener('mouseleave', () => { isDragging = false; fpCanvas.style.cursor = "grab"; });
  }
});

function renderAddons() {
  const container = document.getElementById('addons-container');
  if (!container || container.children.length > 0) return; 

  addonsCatalog.forEach(addon => {
    const card = document.createElement('div');
    card.className = 'addon-card';
    card.onclick = () => {
      card.classList.toggle('selected');
      const checkbox = card.querySelector('.addon-checkbox');
      checkbox.checked = !checkbox.checked;
      updateGrandTotal();
    };

    card.innerHTML = `
      <img src="${addon.img}" class="addon-img" alt="${addon.name}">
      <div class="addon-info">
        <h4>${addon.name}</h4>
        <p>${addon.desc}</p>
        <span class="addon-price">+$${addon.price.toLocaleString()}</span>
      </div>
      <input type="checkbox" class="addon-checkbox" value="${addon.price}" style="display:none;">
    `;
    container.appendChild(card);
  });
}

function toggleSmartCatalog() {
  const mode = document.getElementById('upgradeMode').value;
  const container = document.getElementById('addons-container');
  if (!container) return;
  
  if (mode === 'automated') {
    renderAddons(); 
    container.style.display = 'grid';
    setTimeout(() => container.style.opacity = '1', 10); 
  } else {
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.display = 'none';
      document.querySelectorAll('.addon-checkbox').forEach(box => box.checked = false);
      document.querySelectorAll('.addon-card').forEach(card => card.classList.remove('selected'));
      updateGrandTotal();
    }, 300);
  }
}

function updateGrandTotal() {
  let addOnTotal = 0;
  let selectedAddons = [];
  
  const upgradeSelect = document.getElementById('upgradeMode');
  if (upgradeSelect && upgradeSelect.value === 'automated') {
    const checkboxes = document.querySelectorAll('.addon-checkbox');
    checkboxes.forEach((box, index) => {
      if (box.checked) {
        let price = parseFloat(box.value);
        addOnTotal += price;
        selectedAddons.push({ name: addonsCatalog[index].name, price: price });
      }
    });
  }
  
  const grandTotal = currentBaseCost + addOnTotal;
  
  const summaryPanel = document.getElementById('config-summary-panel');
  if (summaryPanel) {
    let activeTierBtn = document.querySelector('.tier-btn.active');
    let tierName = activeTierBtn ? activeTierBtn.innerHTML.split('<br>')[0].trim() : "Selected Tier";
    
    let html = `
      <div class="summary-header">
        <h3>Configuration Summary</h3>
      </div>
      <div class="summary-body">
        <div class="summary-row">
          <span><strong>Base Fixtures (${tierName})</strong></span>
          <span>$${currentBaseCost.toLocaleString()}</span>
        </div>
    `;
    
    if (selectedAddons.length > 0) {
      selectedAddons.forEach(addon => {
        html += `
          <div class="summary-row addon-row">
            <span>+ ${addon.name}</span>
            <span>$${addon.price.toLocaleString()}</span>
          </div>
        `;
      });
    }
    
    html += `
        <div class="summary-divider"></div>
        <div class="summary-row grand-total-row">
          <span><strong>Grand Total</strong></span>
          <span><strong>$${grandTotal.toLocaleString()}</strong></span>
        </div>
      </div>
    `;
    
    summaryPanel.innerHTML = html;
  }
}

window.addEventListener('scroll', () => {
  const scrollPx = document.documentElement.scrollTop || document.body.scrollTop;
  const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = winHeightPx > 0 ? (scrollPx / winHeightPx) * 100 : 0;
  const indicator = document.getElementById('scroll-indicator');
  if (indicator) {
    indicator.style.height = scrolled + '%';
    indicator.style.opacity = scrolled >= 99 ? '0' : '1';
  }
});

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeToggle.innerText = document.body.classList.contains('light-mode') ? '🌙 Dark Mode' : '☀️ Light Mode';
  });
}

const exportBtn = document.getElementById('export-btn');
if (exportBtn) exportBtn.addEventListener('click', () => window.print());

const chatToggle = document.getElementById('ai-chat-toggle');
const chatWindow = document.getElementById('ai-chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const chatHistory = document.getElementById('chat-history');

if (chatToggle && chatWindow) {
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.remove('hidden');
    chatToggle.style.transform = 'scale(0)';
  });
  
  closeChat.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    chatToggle.style.transform = 'scale(1)';
  });

  const processChat = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-msg');
    chatInput.value = '';

    const typingId = 'typing-' + Date.now();
    appendMessage('...', 'ai-msg', typingId);

    setTimeout(() => {
      const typingMsg = document.getElementById(typingId);
      if (typingMsg) typingMsg.remove();
      
      const response = generateAIResponse(text.toLowerCase());
      appendMessage(response, 'ai-msg');
    }, 800); 
  };

  sendChat.addEventListener('click', processChat);
  chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') processChat(); });
}

function appendMessage(text, className, id = '') {
  const msg = document.createElement('div');
  msg.className = `chat-msg ${className}`;
  msg.innerHTML = text;
  if (id) msg.id = id;
  chatHistory.appendChild(msg);
  chatHistory.scrollTop = chatHistory.scrollHeight; 
}

function generateAIResponse(input) {
  const lowerInput = input.toLowerCase();

  const budgetMatch = lowerInput.match(/\$?\b(\d{1,3}(?:,\d{3})*|\d{3,6})\b/);
  const dimMatch = lowerInput.match(/(\d+)\s*(?:x|by|[*])\s*(\d+)/);
  
  const wantsGlass = lowerInput.includes('privacy') || lowerInput.includes('glass');
  const wantsMirror = lowerInput.includes('mirror');
  const wantsLight = lowerInput.includes('light');
  const wantsShower = lowerInput.includes('shower'); 

  const wantsZen = lowerInput.includes('imperial') || lowerInput.includes('japanese') || lowerInput.includes('zen');
  const wantsModern = lowerInput.includes('minimalist') || lowerInput.includes('modern');
  const wantsLuxury = lowerInput.includes('luxurious') || lowerInput.includes('old money') || lowerInput.includes('classic') || lowerInput.includes('luxury');

  if (budgetMatch || dimMatch || wantsGlass || wantsMirror || wantsLight || wantsShower || wantsZen || wantsModern || wantsLuxury) {
    
    let customBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : parseInt(document.getElementById('budget').value);
    let w = dimMatch ? parseInt(dimMatch[1]) : 8;
    let l = dimMatch ? parseInt(dimMatch[2]) : 10;
    let area = w * l;
    let customDim = `${w} by ${l}`;
    
    let multiplier = 1.0;
    if (area <= 50) multiplier = 0.85; 
    else if (area >= 120) multiplier = 1.40;
    
    let addonTotal = 0;
    let addOnText = "";
    if (wantsGlass) { addonTotal += 950; addOnText += `• Smart Privacy Glass (+$950)<br>`; }
    if (wantsShower) { addonTotal += 1400; addOnText += `• Digital Smart Shower (+$1,400)<br>`; }
    if (wantsMirror) { addonTotal += 650; addOnText += `• Interactive Mirror (+$650)<br>`; }
    if (wantsLight) { addonTotal += 300; addOnText += `• Ambient Lighting (+$300)<br>`; }
    if (addonTotal === 0) addOnText = `• None selected<br>`;

    let allowedThemes = [];
    if (wantsZen) allowedThemes.push("Japanese Zen");
    if (wantsModern) allowedThemes.push("Minimalist Modern");
    if (wantsLuxury) allowedThemes.push("Classic Luxury");
    
    if (allowedThemes.length === 0) {
       allowedThemes = ["Minimalist Modern", "Japanese Zen", "Classic Luxury"];
    }

    const tiers = [
      { name: "Value Tier", theme: "Minimalist Modern", cost: 1350 * multiplier },
      { name: "Balanced Tier", theme: "Japanese Zen", cost: 4300 * multiplier },
      { name: "Premium Tier", theme: "Classic Luxury", cost: 10250 * multiplier }
    ];

    let response = `<strong>✨ KOHLER AI Blueprint ✨</strong><br><br>`;
    
    response += `<strong>Parameters Assessed:</strong><br>`;
    response += `• Space: ${customDim} feet<br>`;
    response += `• Target Budget: $${customBudget.toLocaleString()}<br>`;
    response += `• Upgrades Selected: $${addonTotal.toLocaleString()}<br><br>`;
    
    let validOptions = 0;
    let optionsText = "";

    tiers.forEach(tier => {
      if (allowedThemes.includes(tier.theme)) {
        let grandTotal = tier.cost + addonTotal;
        if (grandTotal <= customBudget) {
          validOptions++;
          optionsText += `<strong>Option ${validOptions}: ${tier.name}</strong><br>`;
          optionsText += `• Architecture: ${tier.theme}<br>`;
          optionsText += `• Fixtures Cost: $${tier.cost.toLocaleString()}<br>`;
          optionsText += `• Grand Total: $${grandTotal.toLocaleString()}<br><br>`;
        }
      }
    });

    if (validOptions === 0) {
        response += `<em>Analysis: ❌ Budget limit exceeded. None of our configurations fit this request within a $${customBudget.toLocaleString()} budget. I recommend increasing your budget or dropping a smart upgrade.</em>`;
    } else {
        response += `<strong>Qualifying System Configurations:</strong><br><br>` + optionsText;
        response += `<em>Analysis: Found ${validOptions} configuration(s) safely under your target budget.</em>`;
    }

    return response;
  }

  const budget = document.getElementById('budget').value;
  const theme = document.getElementById('theme').value;
  
  if (lowerInput.includes('budget') || lowerInput.includes('cost') || lowerInput.includes('price')) {
    return `Your maximum budget is currently set to $${Number(budget).toLocaleString()}.`;
  } else if (lowerInput.includes('theme') || lowerInput.includes('style') || lowerInput.includes('aesthetic')) {
    return `You've selected the ${theme} theme. I've curated fixtures with clean lines and specific finishes to match this vibe perfectly.`;
  } else if (lowerInput.includes('water') || lowerInput.includes('eco') || lowerInput.includes('sustain')) {
    return `Excellent focus! Kohler is deeply committed to sustainability. Our Eco Water-Saver fixtures use up to 30% less water.`;
  } else {
    return "I'm your design assistant! Give me a budget, room size, preferred style (like 'old money' or 'modern'), and any smart upgrades, and I will generate a complete Kohler blueprint.";
  }
}

function openProductModal(itemName) {
  const item = catalog.find(p => p.name === itemName);
  if (!item) return;

  let sizeText = `${item.dimensions?.width || 0}' × ${item.dimensions?.depth || 0}'`;
  if ((item.dimensions?.width || 0) === 0) sizeText = "Wall Mounted";
  
  let ecoText = item.water_saver ? 'Yes (Eco Water-Saver)' : 'Standard Flow';
  let desc = item.description || `The ${item.name} offers premium performance, blending seamless functionality with elegant design suited for your requested aesthetic.`;
  let finish = item.finish || "Polished Chrome / Standard";

  document.getElementById('modal-category').innerText = item.category.toUpperCase();
  document.getElementById('modal-title').innerText = item.name;
  document.getElementById('modal-price').innerText = '$' + item.price.toLocaleString();
  document.getElementById('modal-size').innerText = sizeText;
  document.getElementById('modal-finish').innerText = finish;
  document.getElementById('modal-eco').innerText = ecoText;
  document.getElementById('modal-desc').innerText = desc;

  const modal = document.getElementById('product-modal');
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

window.addEventListener('click', (e) => {
  const modal = document.getElementById('product-modal');
  if (e.target === modal) {
    closeModal();
  }
});

// ==========================================
// --- COMPARISON ENGINE LOGIC & TRANSITION ---
// ==========================================

// ==========================================
// --- COMPARISON ENGINE LOGIC & TRANSITION ---
// ==========================================

// ==========================================
// --- COMPARISON ENGINE LOGIC & TRANSITION ---
// ==========================================

// ==========================================
// --- COMPARISON ENGINE LOGIC & SLIDE-IN ---
// ==========================================

function triggerCompareTransition() {
  // Instantly opens the comparison panel so the CSS slide-in animation takes over smoothly
  toggleCompareMode(true);
}

function toggleCompareMode(show) {
  const comparePage = document.getElementById('compare-page');
  const appContainer = document.getElementById('app-container');
  const scrollIndicator = document.getElementById('scroll-indicator');
  
  if (show) {
    // Pre-fill left side configuration with current studio state
    document.getElementById('comp-size-left').value = document.getElementById('roomDimensions').value;
    document.getElementById('comp-theme-left').value = document.getElementById('theme').value;
    let activeTier = document.querySelector('.tier-btn.active');
    if (activeTier) {
      document.getElementById('comp-tier-left').value = activeTier.innerHTML.split('<br>')[0].trim();
    }
    
    comparePage.classList.remove('hidden');
    appContainer.style.display = 'block'; // Keeps background visible during slide
    if (scrollIndicator) scrollIndicator.style.display = 'none';
    updateComparison(); 
  } else {
    comparePage.classList.add('hidden');
    if (scrollIndicator) scrollIndicator.style.display = 'block';
  }
}

function toggleCompareMode(show) {
  const comparePage = document.getElementById('compare-page');
  const appContainer = document.getElementById('app-container');
  const scrollIndicator = document.getElementById('scroll-indicator');
  
  if (show) {
    document.getElementById('comp-size-left').value = document.getElementById('roomDimensions').value;
    document.getElementById('comp-theme-left').value = document.getElementById('theme').value;
    let activeTier = document.querySelector('.tier-btn.active');
    if (activeTier) {
      document.getElementById('comp-tier-left').value = activeTier.innerHTML.split('<br>')[0].trim();
    }
    
    comparePage.classList.remove('hidden');
    appContainer.style.display = 'none';
    if (scrollIndicator) scrollIndicator.style.display = 'none';
    updateComparison(); 
  } else {
    comparePage.classList.add('hidden');
    appContainer.style.display = 'block';
    if (scrollIndicator) scrollIndicator.style.display = 'block';
  }
}

document.querySelectorAll('.comp-trigger').forEach(select => {
  select.addEventListener('change', updateComparison);
});

function updateComparison() {
  const lSize = document.getElementById('comp-size-left').value;
  const lTheme = document.getElementById('comp-theme-left').value;
  const lTier = document.getElementById('comp-tier-left').value;

  const rSize = document.getElementById('comp-size-right').value;
  const rTheme = document.getElementById('comp-theme-right').value;
  const rTier = document.getElementById('comp-tier-right').value;

  const leftImg = document.getElementById('comp-img-left');
  const rightImg = document.getElementById('comp-img-right');
  
  if (renderImages[lSize] && renderImages[lSize][lTheme] && renderImages[lSize][lTheme][lTier]) {
      leftImg.src = renderImages[lSize][lTheme][lTier];
  } else { leftImg.src = ''; leftImg.alt = 'Image not available'; }
  
  if (renderImages[rSize] && renderImages[rSize][rTheme] && renderImages[rSize][rTheme][rTier]) {
      rightImg.src = renderImages[rSize][rTheme][rTier];
  } else { rightImg.src = ''; rightImg.alt = 'Image not available'; }

  const advLeft = document.getElementById('comp-adv-left');
  const advRight = document.getElementById('comp-adv-right');
  
  let leftPoints = [];
  let rightPoints = [];

  const tierRank = { "Value": 1, "Balanced": 2, "Premium": 3 };
  if (tierRank[lTier] > tierRank[rTier]) {
    leftPoints.push("Features premium materials and advanced smart functionality.");
    rightPoints.push("Significantly more cost-effective while maintaining baseline Kohler quality.");
  } else if (tierRank[lTier] < tierRank[rTier]) {
    leftPoints.push("Significantly more cost-effective while maintaining baseline Kohler quality.");
    rightPoints.push("Features premium materials and advanced smart functionality.");
  } else {
    leftPoints.push("Equal material quality and feature set.");
    rightPoints.push("Equal material quality and feature set.");
  }

  const sizeRank = { "6x8": 1, "8x10": 2, "10x12": 3 };
  if (sizeRank[lSize] > sizeRank[rSize]) {
    leftPoints.push(`Expansive footprint (${lSize} FT) allowing for comfortable multi-person use.`);
    rightPoints.push(`Compact design (${rSize} FT) optimized for limited square footage and easier cleaning.`);
  } else if (sizeRank[lSize] < sizeRank[rSize]) {
    leftPoints.push(`Compact design (${lSize} FT) optimized for limited square footage and easier cleaning.`);
    rightPoints.push(`Expansive footprint (${rSize} FT) allowing for comfortable multi-person use.`);
  }

  if (lTheme !== rTheme) {
    const themeTags = {
      "Minimalist Modern": "Maximizes perceived space with sleek, ultra-clean lines.",
      "Japanese Zen": "Provides a calming, organic, spa-like atmosphere for relaxation.",
      "Classic Luxury": "Offers timeless elegance and highly-detailed aesthetic appeal."
    };
    leftPoints.push(themeTags[lTheme]);
    rightPoints.push(themeTags[rTheme]);
  }

  advLeft.innerHTML = leftPoints.map(p => `<li>${p}</li>`).join('');
  advRight.innerHTML = rightPoints.map(p => `<li>${p}</li>`).join('');
}