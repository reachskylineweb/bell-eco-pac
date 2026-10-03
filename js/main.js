/**
 * BELL ECO PACK - Master Application Script
 * Blends Catering24's B2B e-commerce agility with GoPack's direct-factory manufacturing engine.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  initBulkCalculator();
  initCustomStudio();
  initHeroStage();
  initModals();
  initMobileNav();
  initDimensionsVisualizer();
});

/* ==========================================================================
   0. DYNAMIC LAYOUT LOADING (HEADER & FOOTER PLACEHOLDERS)
   ========================================================================== */
async function loadLayout() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  if (headerPlaceholder) {
    try {
      const res = await fetch('layout/header.html');
      if (res.ok) {
        const html = await res.text();
        headerPlaceholder.outerHTML = html;
      }
    } catch (e) {
      console.warn('Fetch layout/header.html failed (e.g. file:// protocol)', e);
    }
  }

  if (footerPlaceholder) {
    try {
      const res = await fetch('layout/footer.html');
      if (res.ok) {
        const html = await res.text();
        footerPlaceholder.outerHTML = html;
      }
    } catch (e) {
      console.warn('Fetch layout/footer.html failed (e.g. file:// protocol)', e);
    }
  }

  // Highlight active menu link according to current URL
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu > .nav-item > a.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else if (href && !href.startsWith('#')) {
      link.classList.remove('active');
    }
  });
}


/* ==========================================================================
   1. B2B WHOLESALE SYSTEM
   ========================================================================== */

/* ==========================================================================
   2. B2B BULK TIER & PRICE CALCULATOR
   ========================================================================== */
const PRODUCT_PRICING = {
  burger_clamshell: {
    name: 'Heavy-Duty Burger Clamshell Box',
    basePrice: 4.80, // Price in INR per unit for standard pack
    caseSize: 500,
    tiers: {
      pack: { min: 250, discount: 0, label: 'Standard Pack (250 pcs)' },
      case: { min: 1000, discount: 0.18, label: 'Master Case (1,000 pcs)' },
      pallet: { min: 10000, discount: 0.35, label: 'Pallet Load (10,000+ pcs)' }
    }
  },
  noodle_bowl: {
    name: 'Round Kraft Noodle & Salad Bowl 750ml',
    basePrice: 6.20,
    caseSize: 300,
    tiers: {
      pack: { min: 250, discount: 0, label: 'Standard Pack (250 pcs)' },
      case: { min: 1000, discount: 0.16, label: 'Master Case (1,000 pcs)' },
      pallet: { min: 10000, discount: 0.32, label: 'Pallet Load (10,000+ pcs)' }
    }
  },
  corrugated_pizza: {
    name: 'E-Flute Corrugated Pizza Box 10-inch',
    basePrice: 7.90,
    caseSize: 200,
    tiers: {
      pack: { min: 200, discount: 0, label: 'Bundle (200 pcs)' },
      case: { min: 1000, discount: 0.20, label: 'Master Case (1,000 pcs)' },
      pallet: { min: 5000, discount: 0.36, label: 'Pallet Load (5,000+ pcs)' }
    }
  },
  carrier_bag: {
    name: 'Reinforced Twist-Handle Kraft Carrier Bag',
    basePrice: 5.40,
    caseSize: 250,
    tiers: {
      pack: { min: 250, discount: 0, label: 'Bundle (250 pcs)' },
      case: { min: 1500, discount: 0.22, label: 'Master Case (1,500 pcs)' },
      pallet: { min: 15000, discount: 0.40, label: 'Pallet Load (15,000+ pcs)' }
    }
  }
};

function initBulkCalculator() {
  const prodSelect = document.getElementById('calcProductSelect');
  const qtyRange = document.getElementById('calcQtyRange');
  const qtyInput = document.getElementById('calcQtyInput');
  const tierBtns = document.querySelectorAll('.tier-pill-btn');

  if (!prodSelect || !qtyRange) return;

  function calculate() {
    const prodKey = prodSelect.value;
    const qty = parseInt(qtyRange.value, 10);
    const prod = PRODUCT_PRICING[prodKey] || PRODUCT_PRICING.burger_clamshell;

    // Determine tier discount
    let discount = 0;
    let tierName = 'Standard Pack';
    let savingsText = 'Standard Wholesale Rate';

    if (qty >= 10000) {
      discount = prod.tiers.pallet.discount;
      tierName = 'Pallet Tier (Factory Direct)';
      savingsText = `🎉 Maximum Tier Savings: ${(discount * 100).toFixed(0)}% Off List Price!`;
    } else if (qty >= 1000) {
      discount = prod.tiers.case.discount;
      tierName = 'Master Case Tier';
      savingsText = `✨ Wholesale Tier Savings: ${(discount * 100).toFixed(0)}% Off List Price!`;
    } else {
      discount = 0;
      tierName = 'Standard Pack Tier';
      savingsText = 'Standard Wholesale Rate (Order 1,000+ for 15-20% off)';
    }

    const unitPrice = prod.basePrice * (1 - discount);
    const totalPrice = unitPrice * qty;
    const casesCount = Math.ceil(qty / prod.caseSize);

    // Update UI
    const unitPriceEl = document.getElementById('calcUnitPrice');
    const totalPriceEl = document.getElementById('calcTotalPrice');
    const casesCountEl = document.getElementById('calcCasesCount');
    const tierNameEl = document.getElementById('calcActiveTier');
    const savingsEl = document.getElementById('calcSavingsBadge');
    const dispatchEl = document.getElementById('calcDispatchTime');

    if (unitPriceEl) unitPriceEl.textContent = `₹${unitPrice.toFixed(2)}`;
    if (totalPriceEl) totalPriceEl.textContent = `₹${Math.round(totalPrice).toLocaleString('en-IN')}`;
    if (casesCountEl) casesCountEl.textContent = `${casesCount} Cases (${prod.caseSize} pcs/case)`;
    if (tierNameEl) tierNameEl.textContent = tierName;
    if (savingsEl) savingsEl.textContent = savingsText;
    if (dispatchEl) {
      dispatchEl.textContent = qty >= 10000 ? '3-5 Business Days (Direct Truckload)' : 'Immediate (Dispatches in 24-48 hrs)';
    }

    // Highlight tier pills
    tierBtns.forEach(btn => {
      const tierType = btn.getAttribute('data-tier');
      btn.classList.remove('active');
      if (qty >= 10000 && tierType === 'pallet') btn.classList.add('active');
      else if (qty >= 1000 && qty < 10000 && tierType === 'case') btn.classList.add('active');
      else if (qty < 1000 && tierType === 'pack') btn.classList.add('active');
    });
  }

  prodSelect.addEventListener('change', calculate);

  qtyRange.addEventListener('input', () => {
    if (qtyInput) qtyInput.value = qtyRange.value;
    calculate();
  });

  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 100) val = 100;
      if (val > 50000) val = 50000;
      qtyRange.value = val;
      calculate();
    });
  }

  tierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier');
      if (tier === 'pack') qtyRange.value = 500;
      else if (tier === 'case') qtyRange.value = 2500;
      else if (tier === 'pallet') qtyRange.value = 15000;
      if (qtyInput) qtyInput.value = qtyRange.value;
      calculate();
    });
  });

  calculate();
}

/* ==========================================================================
   3. CUSTOM PRINT & BESPOKE PACKAGING STUDIO
   ========================================================================== */
function initCustomStudio() {
  const logoInput = document.getElementById('studioLogoText');
  const logoOverlay = document.getElementById('studioLogoOverlay');
  const boxGraphic = document.getElementById('studioBoxSvg');
  const swatches = document.querySelectorAll('.swatch-btn');
  const boxTypeSelect = document.getElementById('studioBoxType');
  const printColorsSelect = document.getElementById('studioPrintColors');
  const moqEl = document.getElementById('studioMoq');
  const leadTimeEl = document.getElementById('studioLeadTime');

  if (!boxGraphic) return;

  // Color mapping
  const COLOR_MAP = {
    kraft: { fill: '#c69c6d', stroke: '#8c6239', textColor: '#ffffff' },
    white: { fill: '#f8fafc', stroke: '#cbd5e1', textColor: '#0d3b2e' },
    bamboo: { fill: '#e6d5b8', stroke: '#b59e78', textColor: '#33291d' },
    dark_kraft: { fill: '#966d43', stroke: '#5c4021', textColor: '#faedcd' }
  };

  // Swatch switcher
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      const palette = COLOR_MAP[color] || COLOR_MAP.kraft;

      const mainFills = boxGraphic.querySelectorAll('.box-color-target');
      mainFills.forEach(el => {
        el.setAttribute('fill', palette.fill);
      });

      if (logoOverlay) {
        logoOverlay.style.color = palette.textColor;
      }
    });
  });

  // Text / Logo update
  if (logoInput && logoOverlay) {
    logoInput.addEventListener('input', () => {
      const text = logoInput.value.trim();
      logoOverlay.textContent = text || 'YOUR LOGO';
    });
  }

  // Box type & MOQ updates
  function updateSpecs() {
    if (!boxTypeSelect) return;
    const type = boxTypeSelect.value;
    const colors = printColorsSelect ? printColorsSelect.value : '2';

    let moq = '5,000 units';
    let lead = '7-10 Business Days';

    if (type === 'clamshell') {
      moq = colors === '4' ? '10,000 units' : '5,000 units';
    } else if (type === 'carrier_bag') {
      moq = '3,000 units';
      lead = '5-7 Business Days';
    } else if (type === 'pizza') {
      moq = '2,000 units';
      lead = '5-8 Business Days';
    }

    if (moqEl) moqEl.textContent = moq;
    if (leadTimeEl) leadTimeEl.textContent = lead;
  }

  if (boxTypeSelect) boxTypeSelect.addEventListener('change', updateSpecs);
  if (printColorsSelect) printColorsSelect.addEventListener('change', updateSpecs);
}

/* ==========================================================================
   4. HERO INTERACTIVE PACKAGING STAGE
   ========================================================================== */
function initHeroStage() {
  const tabs = document.querySelectorAll('.stage-tab-btn');
  const boxWrapper = document.getElementById('heroBoxInteractive');
  const specTitle = document.getElementById('heroSpecTitle');
  const specMaterial = document.getElementById('heroSpecMaterial');
  const specMoq = document.getElementById('heroSpecMoq');

  if (!boxWrapper || tabs.length === 0) return;

  const STAGE_DATA = {
    clamshell: {
      title: 'Clamshell Burger Box (Kraft)',
      material: 'Virgin Unbleached Kraft (320 GSM)',
      moq: '250 pcs / 1 Case',
      svg: `
        <svg viewBox="0 0 200 200" class="box-svg-graphic">
          <polygon points="40,90 100,55 160,90 100,125" fill="#d4a373" stroke="#b07d4b" stroke-width="2"/>
          <polygon points="40,90 100,125 100,165 40,130" fill="#b07d4b" stroke="#8c6239" stroke-width="2"/>
          <polygon points="100,125 160,90 160,130 100,165" fill="#8c6239" stroke="#5c4021" stroke-width="2"/>
          <!-- Lid hinge angle -->
          <polygon points="40,90 100,55 100,25 40,55" fill="#e9c46a" opacity="0.9"/>
          <polygon points="100,55 160,90 160,55 100,25" fill="#d4a373" opacity="0.9"/>
          <!-- Leaf eco badge -->
          <circle cx="100" cy="90" r="14" fill="#0d3b2e"/>
          <path d="M96 90 Q100 82 104 90 Q100 96 96 90 Z" fill="#10b981"/>
        </svg>
      `
    },
    bowl: {
      title: '750ml Compostable Salad Bowl',
      material: 'Sugarcane Bagasse Pulp',
      moq: '300 pcs / 1 Case',
      svg: `
        <svg viewBox="0 0 200 200" class="box-svg-graphic">
          <!-- Bowl body -->
          <path d="M45,85 Q100,180 155,85 Z" fill="#e6d5b8" stroke="#b59e78" stroke-width="2"/>
          <!-- Rim -->
          <ellipse cx="100" cy="85" rx="56" ry="18" fill="#f5ebe0" stroke="#d5bdaf" stroke-width="2"/>
          <!-- PET/Paper lid preview -->
          <ellipse cx="100" cy="82" rx="52" ry="16" fill="rgba(255,255,255,0.4)" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="100" cy="120" r="10" fill="#0d3b2e"/>
          <path d="M97 120 Q100 114 103 120 Q100 124 97 120 Z" fill="#10b981"/>
        </svg>
      `
    },
    bag: {
      title: 'Twist Handle Delivery Bag',
      material: '120 GSM High-Tensile Kraft',
      moq: '250 pcs / 1 Case',
      svg: `
        <svg viewBox="0 0 200 200" class="box-svg-graphic">
          <!-- Bag body -->
          <polygon points="55,70 145,70 140,165 60,165" fill="#c69c6d" stroke="#8c6239" stroke-width="2"/>
          <polygon points="60,165 140,165 130,175 70,175" fill="#8c6239"/>
          <!-- Gusset crease -->
          <line x1="100" y1="70" x2="100" y2="165" stroke="#b07d4b" stroke-dasharray="3,3" stroke-width="1.5"/>
          <!-- Twisted paper handles -->
          <path d="M80,70 C80,35 120,35 120,70" fill="none" stroke="#8c6239" stroke-width="4" stroke-linecap="round"/>
          <circle cx="100" cy="115" r="14" fill="#0d3b2e"/>
          <text x="100" y="119" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="bold">BELL</text>
        </svg>
      `
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const itemKey = tab.getAttribute('data-item');
      const data = STAGE_DATA[itemKey] || STAGE_DATA.clamshell;

      // Animate transition
      boxWrapper.style.transform = 'scale(0.8) rotateY(40deg)';
      boxWrapper.style.opacity = '0.4';

      setTimeout(() => {
        boxWrapper.innerHTML = data.svg;
        if (specTitle) specTitle.textContent = data.title;
        if (specMaterial) specMaterial.textContent = data.material;
        if (specMoq) specMoq.textContent = data.moq;

        boxWrapper.style.transform = 'scale(1) rotateY(0deg)';
        boxWrapper.style.opacity = '1';
      }, 250);
    });
  });
}

/* ==========================================================================
   5. MODALS & INQUIRIES
   ========================================================================== */
function initModals() {
  const quoteModal = document.getElementById('quoteModal');

  // Open Quote Modal triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-quote-modal');
    if (trigger) {
      e.preventDefault();
      const product = trigger.getAttribute('data-product') || 'Custom Packaging Inquiry';
      const quoteProdInput = document.getElementById('quoteModalProduct');
      if (quoteProdInput) quoteProdInput.value = product;
      if (quoteModal) quoteModal.classList.add('active');
    }
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close-btn, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || e.target.classList.contains('modal-close-btn')) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    });
  });

  // Handle Quotation form submit
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending to dm@bellmatch.com...';
      }

      const name = quoteForm.querySelector('[name="name"]')?.value || 'Client';
      const phone = quoteForm.querySelector('[name="phone"]')?.value || '';
      const email = quoteForm.querySelector('[name="email"]')?.value || '';
      const qty = quoteForm.querySelector('[name="quantity"]')?.value || '5,000 - 25,000 units';
      const customUnits = quoteForm.querySelector('[name="custom_units"]')?.value || '';
      const product = quoteForm.querySelector('[name="product"]')?.value || 'General Packaging';
      const city = quoteForm.querySelector('[name="city"]')?.value || '';

      const displayQty = customUnits ? `${qty} (Custom: ${customUnits})` : qty;

      // Web3Forms dispatch to dm@bellmatch.com
      const token = window.WEB3FORMS_ACCESS_KEY || quoteForm.querySelector('[name="access_key"]')?.value || "77c3048c-b836-4d5f-9283-538f7718eb36";
      if (token) {
        try {
          const formData = new FormData(quoteForm);
          formData.set('access_key', token);
          formData.set('subject', `B2B Wholesale Inquiry: ${product} - ${name} (${city})`);
          formData.set('from_name', 'Bell Eco Pac B2B Portal');
          await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
        } catch (err) {
          console.error('Web3Forms modal submit error:', err);
        }
      }

      // Send to WhatsApp direct option
      const message = encodeURIComponent(`Hello Bell Eco Pac! B2B Wholesale Quote Request:\nCompany: ${name}\nPhone: ${phone}\nEmail: ${email}\nProducts Required: ${product}\nEstimated Volume: ${displayQty}\nDelivery City: ${city}`);
      
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      showToast('Quotation sent to dm@bellmatch.com! Connecting via WhatsApp...');
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      quoteForm.reset();

      setTimeout(() => {
        window.open(`https://wa.me/917845965010?text=${message}`, '_blank');
      }, 800);
    });
  }
}

/* ==========================================================================
   6. MOBILE NAVIGATION & UTILITIES
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const headerNav = document.getElementById('siteHeaderNav') || document.querySelector('.header-nav');

  if (toggleBtn && headerNav) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = headerNav.classList.toggle('is-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!headerNav.contains(e.target) && !toggleBtn.contains(e.target)) {
        headerNav.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Mobile mega-menu toggle
    const megaToggle = headerNav.querySelector('.has-mega-menu > .nav-link');
    if (megaToggle) {
      megaToggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
          e.preventDefault();
          megaToggle.parentElement.classList.toggle('open');
        }
      });
    }
  }
}

function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================================================
   7. PRODUCT DIMENSIONS VISUALIZER SYSTEM
   ========================================================================== */
const PRODUCT_DIMENSIONS = {
  "burger-box": {
    name: "Burger Clamshell Box",
    cat: "Takeaway & Fast Food",
    img: "assets/images/product_burger_box_custom.webp",
    gsm: "320 GSM Virgin Kraft Board",
    barrier: "Food-Safe Aqueous Oil & Grease Barrier",
    pack: "500 pcs / carton",
    sizes: [
      { name: "Regular / Single Patty", mm: "105 × 105 × 75 mm", inches: '4.1" × 4.1" × 3.0"', use: "Single Burgers, Slider Pairs" },
      { name: "Large / Gourmet Burger", mm: "120 × 120 × 80 mm", inches: '4.7" × 4.7" × 3.1"', use: "Double Patty, Brioche Buns" },
      { name: "Jumbo / Loaded Burger", mm: "140 × 140 × 90 mm", inches: '5.5" × 5.5" × 3.5"', use: "Monster Burgers, Combos" }
    ]
  },
  "fries-scoop": {
    name: "Pop-up French Fry Scoop",
    cat: "Fries Trays & Cones",
    img: "assets/images/product_fries_tray.webp",
    gsm: "280–300 GSM Greaseproof Foodboard",
    barrier: "Oleophobic Grease Barrier",
    pack: "1,000 pcs / carton",
    sizes: [
      { name: "Small Scoop (100g)", mm: "85 × 50 × 100 mm", inches: '3.3" × 2.0" × 3.9"', use: "Regular Fries, Nuggets (4 pcs)" },
      { name: "Medium Scoop (150g)", mm: "100 × 55 × 120 mm", inches: '3.9" × 2.2" × 4.7"', use: "Medium Fries, Wedges, Rings" },
      { name: "Large Scoop (220g)", mm: "115 × 60 × 140 mm", inches: '4.5" × 2.4" × 5.5"', use: "Large Loaded Fries, Tenders" }
    ]
  },
  "hotdog-tray": {
    name: "Takeaway Hot Dog Tray",
    cat: "Fast Food Food Boats",
    img: "assets/images/product_hotdog_tray.webp",
    gsm: "300 GSM Certified Foodboard",
    barrier: "Moisture & Sauce Leak Barrier",
    pack: "1,000 pcs / carton",
    sizes: [
      { name: "Standard 7-inch", mm: "180 × 70 × 40 mm", inches: '7.1" × 2.8" × 1.6"', use: "Hot Dogs, Frankfurters, Sausage Rolls" },
      { name: "Jumbo 9-inch", mm: "225 × 75 × 45 mm", inches: '8.9" × 3.0" × 1.8"', use: "Submarine Rolls, Footlong Sausages" }
    ]
  },
  "fast-food-tray": {
    name: "Fast Food Boat Tray",
    cat: "Food & Side Trays",
    img: "assets/images/product_fast_food_tray.webp",
    gsm: "320 GSM Rigid Foodboard",
    barrier: "High Grease Resistance",
    pack: "500 pcs / carton",
    sizes: [
      { name: "Medium Boat", mm: "170 × 95 × 40 mm", inches: '6.7" × 3.7" × 1.6"', use: "Wings (6 pcs), Nachos, Fries" },
      { name: "Large Feast Boat", mm: "200 × 110 × 45 mm", inches: '7.9" × 4.3" × 1.8"', use: "Loaded Combos, Kebabs, Fish & Chips" }
    ]
  },
  "cake-box": {
    name: "Bakery Pastry & Cake Box",
    cat: "Bakery & Cake Packaging",
    img: "assets/images/product_cake_box_white.webp",
    gsm: "350–380 GSM High-Rigidity Bleached White Board",
    barrier: "Clean White Food-Safe Finish",
    pack: "250 pcs / carton",
    sizes: [
      { name: '1/2 kg / 6-inch', mm: "152 × 152 × 127 mm", inches: '6.0" × 6.0" × 5.0"', use: "Mini Cakes, Bento Cakes, Pastry Assortment" },
      { name: '1 kg / 8-inch', mm: "203 × 203 × 127 mm", inches: '8.0" × 8.0" × 5.0"', use: "Standard 1kg Birthday Cakes" },
      { name: '1.5 kg / 10-inch', mm: "254 × 254 × 127 mm", inches: '10.0" × 10.0" × 5.0"', use: "Party Cakes, Fondant Tier Cakes" },
      { name: '2 kg / 12-inch', mm: "305 × 305 × 152 mm", inches: '12.0" × 12.0" × 6.0"', use: "Large Celebration & Wedding Cakes" }
    ]
  },
  "cupcake-box": {
    name: "4-Cavity Cupcake Presentation Box",
    cat: "Bakery & Dessert Packaging",
    img: "assets/images/product_cupcake_box.webp",
    gsm: "320 GSM Premium White Board + Insert",
    barrier: "Crystal Clean Food Contact Surface",
    pack: "250 pcs / carton",
    sizes: [
      { name: "4-Cupcake Standard", mm: "165 × 165 × 75 mm", inches: '6.5" × 6.5" × 3.0"', use: "4 Standard Frosted Cupcakes (60mm cavity)" },
      { name: "6-Cupcake Box", mm: "240 × 165 × 75 mm", inches: '9.4" × 6.5" × 3.0"', use: "6 Cupcakes / Muffins" }
    ]
  },
  "paper-straws": {
    name: "Eco Paper Straws",
    cat: "Beverage & Sustainable",
    img: "assets/images/product_paper_straws.webp",
    gsm: "4-Ply FSC Scandinavian Virgin Kraft",
    barrier: "Zero Softening for 4+ Hours in Cold/Hot Drinks",
    pack: "250 pcs / pack • 5,000 / master carton",
    sizes: [
      { name: "Standard Drink (6mm)", mm: "197 mm × Ø 6 mm", inches: '7.75" × Ø 0.24"', use: "Sodas, Juices, Iced Teas, Cocktails" },
      { name: "Smoothie / Shake (8mm)", mm: "210 mm × Ø 8 mm", inches: '8.25" × Ø 0.31"', use: "Thick Shakes, Frappes, Smoothies" },
      { name: "Boba / Bubble Tea (12mm)", mm: "210 mm × Ø 12 mm", inches: '8.25" × Ø 0.47"', use: "Tapioca Pearls, Jelly Drinks" }
    ]
  },
  "kraft-bag": {
    name: "Twist Handle Kraft Takeaway Bag",
    cat: "Carriers & Takeaway Bags",
    img: "assets/images/product_kraft_bag.webp",
    gsm: "120 GSM High-Tensile Virgin Brown Kraft",
    barrier: "Reinforced Tear-Resistant Fiber",
    pack: "250 pcs / carton",
    sizes: [
      { name: "Small Bag (Holds 3 kg)", mm: "210 × 110 × 270 mm", inches: '8.3" × 4.3" × 10.6"', use: "Burger + Fries Combos, Takeaway Orders" },
      { name: "Medium Bag (Holds 5 kg)", mm: "260 × 140 × 320 mm", inches: '10.2" × 5.5" × 12.6"', use: "Meal Deliveries, 2-3 Clamshells" },
      { name: "Large Bag (Holds 7 kg)", mm: "320 × 180 × 380 mm", inches: '12.6" × 7.1" × 15.0"', use: "Family Buckets, Multi-Meal Takeaway" }
    ]
  },
  "round-bowl": {
    name: "Round Paper Food Container (Bowl)",
    cat: "Meal Bowls & Soups",
    img: "assets/images/product_salad_bowl.webp",
    gsm: "300 GSM + 18 PE/Aqueous Barrier",
    barrier: "100% Liquid-Tight & Microwaveable",
    pack: "500 pcs / carton",
    sizes: [
      { name: "500 ml (16 oz)", mm: "Ø 150 × Ø 128 × 48 mm", inches: 'Ø 5.9" × 1.9"', use: "Soups, Salads, Rice Bowls" },
      { name: "750 ml (25 oz)", mm: "Ø 150 × Ø 128 × 60 mm", inches: 'Ø 5.9" × 2.4"', use: "Curry Bowls, Poke, Biryani" },
      { name: "1000 ml (32 oz)", mm: "Ø 150 × Ø 128 × 75 mm", inches: 'Ø 5.9" × 3.0"', use: "Noodle Soups, Large Curries, Thalis" }
    ]
  },
  "window-box": {
    name: "Multi-Purpose Box with Window",
    cat: "Containers with Clear Window",
    img: "assets/images/product_window_box.webp",
    gsm: "320 GSM Kraft / White Board + Anti-Fog Window",
    barrier: "Grease & Sauce Resistant Coated Interior",
    pack: "500 pcs / carton",
    sizes: [
      { name: "Medium Window Box", mm: "150 × 100 × 45 mm", inches: '5.9" × 3.9" × 1.8"', use: "Sushi (6 pcs), Pastries, Salads" },
      { name: "Large Window Box", mm: "180 × 120 × 50 mm", inches: '7.1" × 4.7" × 2.0"', use: "Bakery Assortments, Gourmet Sandwiches" },
      { name: "Family Window Box", mm: "200 × 140 × 50 mm", inches: '7.9" × 5.5" × 2.0"', use: "Catering Platters, Bento Sets" }
    ]
  },
  "pillow-pack": {
    name: "Pillow Pack | Shawarma Pack",
    cat: "Takeaway Wraps & Rolls",
    img: "assets/images/product_pillow_pack.webp",
    gsm: "300 GSM Greaseproof Certified Foodboard",
    barrier: "Hot Steam & Sauce Retention",
    pack: "1,000 pcs / carton",
    sizes: [
      { name: "Standard Roll Pack", mm: "220 × 105 × 45 mm", inches: '8.7" × 4.1" × 1.8"', use: "Shawarma, Kathi Roll, Churros, Wraps" },
      { name: "Long Roll Pack", mm: "260 × 110 × 50 mm", inches: '10.2" × 4.3" × 2.0"', use: "Footlong Wraps, Burritos" }
    ]
  },
  "noodle-box": {
    name: "Takeaway Noodle Box",
    cat: "Asian & Noodle Containers",
    img: "assets/images/product_noodle_box.webp",
    gsm: "320 GSM Heavyweight Poly-Coated Board",
    barrier: "100% Leak-Proof Folded Base",
    pack: "500 pcs / carton",
    sizes: [
      { name: "16 oz (450 ml)", mm: "75 × 55 × 85 mm", inches: '3.0" × 2.2" × 3.3"', use: "Noodles, Fried Rice, Stir Fries" },
      { name: "26 oz (750 ml)", mm: "80 × 65 × 100 mm", inches: '3.1" × 2.6" × 3.9"', use: "Large Meals, Curry Rice Bowls" },
      { name: "32 oz (900 ml)", mm: "90 × 70 × 110 mm", inches: '3.5" × 2.8" × 4.3"', use: "Family Portions, Pad Thai" }
    ]
  },
  "cake-base": {
    name: "Rigid Cake Base & Pastry Board",
    cat: "Bakery Under-Boards",
    img: "assets/images/product_cake_base.webp",
    gsm: "1.5 mm – 2.5 mm Solid High-Density Compressed Board",
    barrier: "Greaseproof Food-Grade Embossed Foil / Wax",
    pack: "200 pcs / carton",
    sizes: [
      { name: '8-inch Round / Square', mm: "203 mm Diameter", inches: '8.0" Board', use: "1 kg Round/Square Cakes" },
      { name: '10-inch Round / Square', mm: "254 mm Diameter", inches: '10.0" Board', use: "1.5 kg Cakes" },
      { name: '12-inch Round / Square', mm: "305 mm Diameter", inches: '12.0" Board', use: "2 kg Cakes & Tiered Displays" }
    ]
  },
  "lunch-box": {
    name: "Pure White Paper Lunch Box",
    cat: "Takeaway Lunch & Meals",
    img: "assets/images/product_lunch_box_paper.webp",
    gsm: "300–320 GSM Bleached Virgin Foodboard",
    barrier: "Aqueous Oil & Moisture Barrier",
    pack: "500 pcs / carton",
    sizes: [
      { name: "Size A (Mini)", mm: "135 × 100 × 36 mm", inches: '5.3" × 3.9" × 1.4"', use: "Pastries, Snacks, Breakfasts" },
      { name: "Size B (Snack)", mm: "150 × 100 × 45 mm", inches: '5.9" × 3.9" × 1.8"', use: "Sandwich, Dim Sums" },
      { name: "Size C (Meal)", mm: "180 × 120 × 50 mm", inches: '7.1" × 4.7" × 2.0"', use: "Executive Meal, Rice + 2 Curries" },
      { name: "Size D (Combo)", mm: "200 × 140 × 50 mm", inches: '7.9" × 5.5" × 2.0"', use: "Full Lunch, Thali Set" },
      { name: "Size E (Platter)", mm: "200 × 150 × 57 mm", inches: '7.9" × 5.9" × 2.2"', use: "Biryani Feast, Buffet Takeaway" }
    ]
  },
  "fold-box": {
    name: "Kraft Multi-Purpose Fold Box",
    cat: "Fold Boxes (Sizes A–G)",
    img: "assets/images/product_fold_box_kraft.webp",
    gsm: "320 GSM Unbleached Virgin Kraft Board",
    barrier: "Grease Resistant Webbed Fold Corners",
    pack: "500 pcs / carton",
    sizes: [
      { name: "Size A (Small)", mm: "115 × 90 × 65 mm", inches: '4.5" × 3.5" × 2.6"', use: "Fries, Nuggets, Sides" },
      { name: "Size B (Regular)", mm: "152 × 120 × 65 mm", inches: '6.0" × 4.7" × 2.6"', use: "Pastas, Salads, Rice" },
      { name: "Size C (Large)", mm: "196 × 137 × 64 mm", inches: '7.7" × 5.4" × 2.5"', use: "Family Combos, Curries" }
    ]
  },
  "pizza-box": {
    name: "White Corrugated Pizza Box",
    cat: "Corrugated Pizza Packaging",
    img: "assets/images/product_pizza_box_white.webp",
    gsm: "E-Flute Corrugated High-Strength Board",
    barrier: "Thermal Retention with Steam Vent Notches",
    pack: "100 pcs / bundle",
    sizes: [
      { name: '7-inch Regular', mm: "190 × 190 × 40 mm", inches: '7.5" × 7.5" × 1.6"', use: "Personal Pizza, Garlic Breads" },
      { name: '9-inch Medium', mm: "240 × 240 × 45 mm", inches: '9.4" × 9.4" × 1.8"', use: "Medium 6-Slice Pizza" },
      { name: '10-inch Large', mm: "265 × 265 × 45 mm", inches: '10.4" × 10.4" × 1.8"', use: "Standard Large Pizza" },
      { name: '12-inch Party', mm: "315 × 315 × 45 mm", inches: '12.4" × 12.4" × 1.8"', use: "8-Slice Party Pizza" }
    ]
  },
  "chip-tray": {
    name: "Virgin Kraft Chip Tray",
    cat: "Open Food Trays",
    img: "assets/images/product_chip_tray.webp",
    gsm: "300 GSM Virgin Brown Kraft",
    barrier: "Oil & Condiment Barrier",
    pack: "1,000 pcs / carton",
    sizes: [
      { name: "Standard Scoop", mm: "130 × 90 × 50 mm", inches: '5.1" × 3.5" × 2.0"', use: "Loaded Wedges, Fries, Wings" }
    ]
  },
  "paper-cone": {
    name: "Paper Fry Scoop Cone",
    cat: "Snack & Dip Cones",
    img: "assets/images/product_paper_cone.webp",
    gsm: "280 GSM Foodboard",
    barrier: "High Grease Absorption Prevention",
    pack: "1,000 pcs / carton",
    sizes: [
      { name: "Tall Scoop Cone", mm: "160 × 160 × 210 mm", inches: '6.3" × 6.3" × 8.3"', use: "Street Fries, Churros, Sweet Bites" }
    ]
  },
  "pie-box": {
    name: "Pie & Pizza Slice Wedge Box",
    cat: "Wedge Cartons",
    img: "assets/images/product_pie_box.webp",
    gsm: "300 GSM Bleached Foodboard",
    barrier: "Grease Resistant Interior",
    pack: "500 pcs / carton",
    sizes: [
      { name: "Slice Wedge", mm: "180 × 140 × 45 mm", inches: '7.1" × 5.5" × 1.8"', use: "Single Pizza Slice, Fruit Pies, Quiches" }
    ]
  },
  "pastry-tray": {
    name: "Individual Pastry Trays",
    cat: "Bakery Counter Serving",
    img: "assets/images/product_pastry_tray.webp",
    gsm: "1.0 mm Rigid Laminated Board",
    barrier: "Greaseproof Gold/Black/White Lamination",
    pack: "1,000 pcs / carton",
    sizes: [
      { name: "Single Pastry Card", mm: "110 × 60 mm", inches: '4.3" × 2.4"', use: "Pastry Slices, Eclairs, Tarts" }
    ]
  }
};

function initDimensionsVisualizer() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.view-dimensions-btn');
    if (!btn) return;
    e.preventDefault();

    const card = btn.closest('.product-editorial-card');
    const itemKey = card ? card.getAttribute('data-item') : btn.getAttribute('data-item');
    const productName = btn.getAttribute('data-name') || (card ? card.querySelector('.product-card-title')?.textContent : 'Packaging Item');
    
    const data = PRODUCT_DIMENSIONS[itemKey] || {
      name: productName,
      cat: "Certified Food Packaging",
      img: card ? card.querySelector('.product-card-img')?.src : "assets/images/product_burger_box_custom.webp",
      gsm: "300–350 GSM Certified Foodboard",
      barrier: "Greaseproof Food-Grade Barrier",
      pack: "500 pcs / carton",
      sizes: [
        { name: "Standard Size", mm: "Manufactured to Specification", inches: "Custom Dieline", use: "Universal Commercial Kitchen Use" }
      ]
    };

    const modal = document.getElementById('dimensionsModal');
    if (!modal) return;

    const titleEl = document.getElementById('dimModalTitle');
    const catEl = document.getElementById('dimModalCat');
    const imgEl = document.getElementById('dimModalImg');
    const gsmEl = document.getElementById('dimModalGsm');
    const barrierEl = document.getElementById('dimModalBarrier');
    const packEl = document.getElementById('dimModalPack');
    const tbody = document.getElementById('dimModalSizesTbody');

    if (titleEl) titleEl.textContent = data.name;
    if (catEl) catEl.textContent = data.cat;
    if (imgEl) {
      imgEl.src = data.img;
      imgEl.alt = data.name;
    }
    if (gsmEl) gsmEl.textContent = data.gsm;
    if (barrierEl) barrierEl.textContent = data.barrier;
    if (packEl) packEl.textContent = data.pack;

    if (tbody) {
      tbody.innerHTML = data.sizes.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td style="color: var(--primary); font-weight: 700;">${s.mm}</td>
          <td style="color: var(--text-secondary);">${s.inches}</td>
          <td><div class="dim-use-tag">${s.use}</div></td>
        </tr>
      `).join('');
    }

    const quoteBtn = document.getElementById('dimModalQuoteBtn');
    if (quoteBtn) {
      quoteBtn.onclick = () => {
        modal.classList.remove('active');
        const quoteModal = document.getElementById('quoteModal');
        const quoteProdInput = document.getElementById('quoteModalProduct');
        if (quoteProdInput) quoteProdInput.value = data.name;
        if (quoteModal) quoteModal.classList.add('active');
      };
    }

    const closeBtn = document.getElementById('closeDimModalBtn');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.remove('active');
    }

    modal.classList.add('active');
  });
}

