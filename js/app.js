/* ============================================
   FORGE BUILDERS — Application Engine
   Premium Construction Client Portal
   ============================================ */

// ── Application State ──
const APP = {
  currentPage: 'home',
  scrolled: false,
  countersAnimated: false,
  progressAnimated: false,
  selectedProject: 0,
  adminSidebarOpen: false,
};

// ── Project Data ──
const PROJECT_DATA = {
  phases: [
    { name: 'Foundation', icon: '🏗️', percent: 100, status: 'completed', updated: 'Mar 12, 2025' },
    { name: 'Framing', icon: '🪵', percent: 100, status: 'completed', updated: 'Mar 28, 2025' },
    { name: 'Plumbing', icon: '🔧', percent: 80, status: 'in-progress', updated: 'Apr 18, 2025' },
    { name: 'Electrical', icon: '⚡', percent: 60, status: 'in-progress', updated: 'Apr 16, 2025' },
    { name: 'Painting', icon: '🎨', percent: 30, status: 'in-progress', updated: 'Apr 10, 2025' },
    { name: 'Finishing', icon: '✨', percent: 0, status: 'pending', updated: 'Not started' },
  ],
  overallProgress: 67,
  updates: [
    { date: 'April 18, 2025', text: 'Plumbing on 2nd floor completed — all fixtures installed and pressure-tested.' },
    { date: 'April 16, 2025', text: 'Electrical wiring 60% done — main switchboard installed on ground floor.' },
    { date: 'April 12, 2025', text: 'Interior wall framing completed across all three floors.' },
    { date: 'April 10, 2025', text: 'Primer coat applied to ground floor walls — painting phase initiated.' },
    { date: 'April 5, 2025', text: 'Cement delivery received — 200 bags of UltraTech PPC Grade.' },
    { date: 'March 28, 2025', text: 'Framing phase marked complete — structural inspection passed.' },
    { date: 'March 15, 2025', text: 'Roof truss installation completed ahead of schedule.' },
    { date: 'March 12, 2025', text: 'Foundation curing complete — load-bearing test successful.' },
  ],
  gallery: [
    { phase: 'Foundation', icon: '🏗️', label: 'Foundation — Excavation' },
    { phase: 'Foundation', icon: '🧱', label: 'Foundation — Concrete Pour' },
    { phase: 'Framing', icon: '🪵', label: 'Framing — Ground Floor' },
    { phase: 'Framing', icon: '🏠', label: 'Framing — Roof Structure' },
    { phase: 'Plumbing', icon: '🔧', label: 'Plumbing — Pipe Layout' },
    { phase: 'Plumbing', icon: '🚿', label: 'Plumbing — Bathroom Fixtures' },
    { phase: 'Electrical', icon: '⚡', label: 'Electrical — Wiring Phase 1' },
    { phase: 'Painting', icon: '🎨', label: 'Painting — Primer Coat' },
  ],
  materials: [
    { name: 'Portland Cement (UltraTech)', quantity: '480 bags', unitCost: '₹380', totalCost: '₹1,82,400' },
    { name: 'TMT Steel Bars (16mm)', quantity: '8.2 tons', unitCost: '₹52,000/ton', totalCost: '₹4,26,400' },
    { name: 'River Sand (Fine Grade)', quantity: '120 cu.ft', unitCost: '₹65/cu.ft', totalCost: '₹7,800' },
    { name: 'Red Clay Bricks', quantity: '25,000 pcs', unitCost: '₹8.50/pc', totalCost: '₹2,12,500' },
    { name: 'Teak Wood (Framing)', quantity: '340 cu.ft', unitCost: '₹2,800/cu.ft', totalCost: '₹9,52,000' },
    { name: 'Copper Wiring (1.5mm)', quantity: '1,200m', unitCost: '₹42/m', totalCost: '₹50,400' },
    { name: 'PVC Pipes (4 inch)', quantity: '180m', unitCost: '₹120/m', totalCost: '₹21,600' },
    { name: 'Asian Paints (Interior)', quantity: '65 litres', unitCost: '₹450/L', totalCost: '₹29,250' },
    { name: 'Vitrified Floor Tiles', quantity: '2,400 sq.ft', unitCost: '₹85/sq.ft', totalCost: '₹2,04,000' },
  ],
};


// ============================================
// PARTICLES SYSTEM — Construction Dust
// ============================================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 60;
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
    this.animate();
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2 - 0.1,
      opacity: Math.random() * 0.4 + 0.05,
      fadeDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.7 
        ? `rgba(212, 160, 23, ${Math.random() * 0.3 + 0.05})`  // Gold dust
        : `rgba(180, 180, 180, ${Math.random() * 0.15 + 0.03})` // Normal dust
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += p.fadeDir * 0.002;

      if (p.opacity <= 0.02 || p.opacity >= 0.5) p.fadeDir *= -1;
      if (p.x < -10 || p.x > this.canvas.width + 10 || p.y < -10 || p.y > this.canvas.height + 10) {
        this.particles[i] = this.createParticle();
        this.particles[i].x = Math.random() > 0.5 ? -5 : this.canvas.width + 5;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}


// ============================================
// NAVIGATION & ROUTING
// ============================================
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  // Show target page
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.style.display = 'block';
    // Trigger reflow before adding active class for animation
    void target.offsetWidth;
    target.classList.add('active');
  }

  APP.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Page-specific init
  if (page === 'dashboard') {
    initDashboard();
  }
  if (page === 'admin') {
    initAdmin();
  }

  // Re-observe scroll animations
  setTimeout(() => initScrollObserver(), 100);
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// Mobile menu
function toggleMenu() {
  const links = document.getElementById('nav-links');
  const hamburger = document.getElementById('nav-hamburger');
  links.classList.toggle('open');
  hamburger.classList.toggle('active');
}

function closeMenu() {
  const links = document.getElementById('nav-links');
  const hamburger = document.getElementById('nav-hamburger');
  links.classList.remove('open');
  hamburger.classList.remove('active');
}


// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollObserver() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Trigger counter animation when stats are visible
        if (entry.target.closest('#stats-section') && !APP.countersAnimated) {
          APP.countersAnimated = true;
          animateCounters();
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

// Nav scroll effect
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (APP.currentPage !== 'home') return;
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}


// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current);
    }, 16);
  });
}


// ============================================
// LOGIN HANDLER
// ============================================
function handleLogin(e) {
  e.preventDefault();
  const projectId = document.getElementById('project-id').value;
  const password = document.getElementById('password').value;

  // Admin access
  if (projectId.toLowerCase() === 'admin' && password === 'admin') {
    navigateTo('admin');
    return;
  }

  // Client access (any project ID + password works for demo)
  if (projectId && password) {
    navigateTo('dashboard');
    return;
  }
}

function handleLogout() {
  navigateTo('home');
}


// ============================================
// CLIENT DASHBOARD
// ============================================
function initDashboard() {
  populatePhases();
  populateTimeline();
  populateGallery();
  populateMaterials();
  
  // Animate progress ring after a short delay
  setTimeout(() => {
    animateProgressRing(PROJECT_DATA.overallProgress);
  }, 500);

  // Animate phase bars with stagger
  setTimeout(() => {
    const bars = document.querySelectorAll('.phase-bar');
    bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = bar.getAttribute('data-width');
      }, i * 150);
    });
  }, 800);
}

function animateProgressRing(percent) {
  const circle = document.getElementById('progress-ring-fill');
  const valueEl = document.getElementById('progress-ring-value');
  const circumference = 2 * Math.PI * 90; // r=90
  const offset = circumference - (percent / 100) * circumference;
  
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;
  
  // Trigger animation
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Animate counter
  let current = 0;
  const duration = 2000;
  const step = percent / (duration / 16);
  
  const timer = setInterval(() => {
    current += step;
    if (current >= percent) {
      current = percent;
      clearInterval(timer);
    }
    valueEl.textContent = Math.floor(current) + '%';
  }, 16);
}

function populatePhases() {
  const grid = document.getElementById('phases-grid');
  grid.innerHTML = '';
  
  PROJECT_DATA.phases.forEach((phase, i) => {
    const statusLabel = phase.status === 'completed' ? '✅ Complete' 
      : phase.status === 'in-progress' ? '🔄 In Progress' 
      : '⏳ Pending';
    
    const barClass = phase.status === 'completed' ? 'completed-bar' : '';
    
    grid.innerHTML += `
      <div class="phase-card animate-on-scroll stagger-${i + 1}">
        <div class="phase-card-header">
          <div class="phase-card-left">
            <span class="phase-icon">${phase.icon}</span>
            <span class="phase-name">${phase.name}</span>
          </div>
          <span class="phase-status ${phase.status}">${statusLabel}</span>
        </div>
        <div class="phase-bar-container">
          <div class="phase-bar ${barClass}" data-width="${phase.percent}%"></div>
        </div>
        <div class="phase-meta">
          <span class="phase-percent">${phase.percent}%</span>
          <span>Updated: ${phase.updated}</span>
        </div>
      </div>
    `;
  });
}

function populateTimeline() {
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  
  PROJECT_DATA.updates.forEach((update, i) => {
    timeline.innerHTML += `
      <div class="timeline-item animate-on-scroll stagger-${Math.min(i + 1, 6)}">
        <div class="timeline-date">${update.date}</div>
        <div class="timeline-text">${update.text}</div>
      </div>
    `;
  });
}

function populateGallery() {
  const gallery = document.getElementById('gallery-grid');
  gallery.innerHTML = '';
  
  PROJECT_DATA.gallery.forEach((photo, i) => {
    const hue = (i * 25 + 15) % 360;
    gallery.innerHTML += `
      <div class="gallery-item animate-on-scroll stagger-${Math.min(i + 1, 6)}" style="animation-delay: ${i * 0.1}s">
        <div class="placeholder-img" style="background: linear-gradient(135deg, hsl(${hue}, 10%, 14%), hsl(${hue}, 15%, 20%));">
          ${photo.icon}
        </div>
        <div class="gallery-item-overlay">${photo.label}</div>
      </div>
    `;
  });
}

function populateMaterials() {
  const tbody = document.getElementById('materials-tbody');
  tbody.innerHTML = '';
  
  PROJECT_DATA.materials.forEach(mat => {
    tbody.innerHTML += `
      <tr>
        <td>${mat.name}</td>
        <td>${mat.quantity}</td>
        <td>${mat.unitCost}</td>
        <td class="cost">${mat.totalCost}</td>
      </tr>
    `;
  });
}


// ============================================
// NOTIFICATIONS
// ============================================
function toggleNotifications() {
  const dropdown = document.getElementById('notification-dropdown');
  dropdown.classList.toggle('show');
  
  // Close when clicking outside
  if (dropdown.classList.contains('show')) {
    setTimeout(() => {
      document.addEventListener('click', closeNotifications);
    }, 10);
  }
}

function closeNotifications(e) {
  const bell = document.getElementById('notification-bell');
  if (!bell.contains(e.target)) {
    document.getElementById('notification-dropdown').classList.remove('show');
    document.removeEventListener('click', closeNotifications);
  }
}


// ============================================
// ADMIN PANEL
// ============================================
function initAdmin() {
  populatePhaseSliders();
  populateAdminUpdates();
  populateAdminMaterials();
}

function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('admin-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

function switchAdminTab(tab) {
  // Highlight nav
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.getElementById(`admin-nav-${tab === 'editor' || tab === 'projects' ? tab : tab}`);
  if (navLink) navLink.classList.add('active');

  // Show/hide editor panel
  const editorPanel = document.getElementById('editor-panel');
  if (tab === 'projects') {
    editorPanel.classList.remove('visible');
  } else {
    editorPanel.classList.add('visible');
  }

  // Close mobile sidebar
  if (window.innerWidth <= 768) {
    toggleAdminSidebar();
  }
}

function selectProject(index) {
  APP.selectedProject = index;
  
  // Update active state
  const items = document.querySelectorAll('.project-list-item');
  items.forEach((item, i) => {
    item.classList.toggle('active-project', i === index);
  });

  // Show editor
  const editorPanel = document.getElementById('editor-panel');
  editorPanel.classList.add('visible');
  
  // Scroll to editor
  editorPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function populatePhaseSliders() {
  const container = document.getElementById('phase-sliders');
  container.innerHTML = '';
  
  PROJECT_DATA.phases.forEach((phase, i) => {
    container.innerHTML += `
      <div class="phase-slider-item">
        <span class="phase-slider-label">${phase.icon} ${phase.name}</span>
        <input type="range" class="phase-slider" min="0" max="100" value="${phase.percent}" 
               id="slider-${i}" oninput="updateSliderValue(${i})">
        <span class="phase-slider-value" id="slider-value-${i}">${phase.percent}%</span>
      </div>
    `;
  });
}

function updateSliderValue(index) {
  const slider = document.getElementById(`slider-${index}`);
  const valueEl = document.getElementById(`slider-value-${index}`);
  valueEl.textContent = slider.value + '%';
  PROJECT_DATA.phases[index].percent = parseInt(slider.value);
  
  // Update status
  if (slider.value == 100) {
    PROJECT_DATA.phases[index].status = 'completed';
  } else if (slider.value > 0) {
    PROJECT_DATA.phases[index].status = 'in-progress';
  } else {
    PROJECT_DATA.phases[index].status = 'pending';
  }

  // Recalculate overall progress
  const total = PROJECT_DATA.phases.reduce((sum, p) => sum + p.percent, 0);
  PROJECT_DATA.overallProgress = Math.round(total / PROJECT_DATA.phases.length);
}

function populateAdminUpdates() {
  const container = document.getElementById('update-entries');
  container.innerHTML = '';
  
  PROJECT_DATA.updates.forEach((update, i) => {
    container.innerHTML += `
      <div class="update-entry">
        <span class="update-entry-date">${update.date}</span>
        <span>${update.text}</span>
        <span class="update-entry-remove" onclick="removeUpdate(${i})">✕</span>
      </div>
    `;
  });
}

function addUpdate() {
  const dateInput = document.getElementById('new-update-date');
  const textInput = document.getElementById('new-update-text');
  
  if (!textInput.value.trim()) return;
  
  const dateObj = new Date(dateInput.value);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric' 
  });
  
  PROJECT_DATA.updates.unshift({
    date: formattedDate,
    text: textInput.value.trim()
  });
  
  textInput.value = '';
  populateAdminUpdates();
  showToast('✅', 'Update entry added');
}

function removeUpdate(index) {
  PROJECT_DATA.updates.splice(index, 1);
  populateAdminUpdates();
}

function populateAdminMaterials() {
  const container = document.getElementById('materials-admin');
  container.innerHTML = '';
  
  PROJECT_DATA.materials.forEach((mat, i) => {
    container.innerHTML += `
      <div class="material-row">
        <input class="admin-input" type="text" value="${mat.name}" onchange="updateMaterial(${i}, 'name', this.value)">
        <input class="admin-input" type="text" value="${mat.quantity}" onchange="updateMaterial(${i}, 'quantity', this.value)">
        <input class="admin-input" type="text" value="${mat.unitCost}" onchange="updateMaterial(${i}, 'unitCost', this.value)">
        <button class="remove-btn" onclick="removeMaterial(${i})">✕</button>
      </div>
    `;
  });
}

function addMaterialRow() {
  PROJECT_DATA.materials.push({
    name: '',
    quantity: '',
    unitCost: '',
    totalCost: '₹0'
  });
  populateAdminMaterials();
  showToast('📦', 'New material row added');
}

function updateMaterial(index, field, value) {
  PROJECT_DATA.materials[index][field] = value;
}

function removeMaterial(index) {
  PROJECT_DATA.materials.splice(index, 1);
  populateAdminMaterials();
}

function simulateUpload() {
  showToast('📸', 'Photo upload simulated — files received');
}


// ============================================
// PUSH LIVE UPDATE
// ============================================
function pushLiveUpdate() {
  const btn = document.querySelector('.push-update-btn');
  btn.textContent = '⏳ Pushing Update...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';
  
  // Update phase dates
  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });
  
  PROJECT_DATA.phases.forEach(phase => {
    if (phase.status === 'in-progress') {
      phase.updated = today;
    }
  });
  
  setTimeout(() => {
    btn.textContent = '⚡ Push Live Update to Client';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    
    // Update notification count
    const countEl = document.getElementById('notification-count');
    const currentCount = parseInt(countEl.textContent) || 0;
    countEl.textContent = currentCount + 1;
    
    showToast('🚀', 'Live update pushed to client dashboard!');
  }, 1500);
}


// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(icon, message) {
  const toast = document.getElementById('toast');
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('.toast-text').textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}


// ============================================
// PARALLAX EFFECT (subtle)
// ============================================
function initParallax() {
  window.addEventListener('scroll', () => {
    if (APP.currentPage !== 'home') return;
    const scrollY = window.scrollY;
    const hero = document.querySelector('.hero-content');
    if (hero && scrollY < window.innerHeight) {
      hero.style.transform = `translateY(${scrollY * 0.25}px)`;
      hero.style.opacity = 1 - (scrollY / (window.innerHeight * 0.8));
    }
  });
}


// ============================================
// HORIZONTAL SCROLL — Mouse Drag
// ============================================
function initHorizontalScroll() {
  const container = document.getElementById('projects-scroll');
  if (!container) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.style.cursor = 'grabbing';
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('mouseleave', () => {
    isDown = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mouseup', () => {
    isDown = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  // Set initial cursor
  container.style.cursor = 'grab';
}


// ============================================
// RIPPLE EFFECT ON BUTTONS
// ============================================
function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      transform: scale(0);
      animation: rippleAnim 0.6s ease-out forwards;
      pointer-events: none;
    `;
    
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
  
  // Add ripple keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}


// ============================================
// SMOOTH NUMBER FORMATTING (Indian format)
// ============================================
function formatIndianNumber(num) {
  return num.toLocaleString('en-IN');
}


// ============================================
// KEYBOARD SHORTCUTS
// ============================================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Escape closes modals / goes back
    if (e.key === 'Escape') {
      closeMenu();
      const dropdown = document.getElementById('notification-dropdown');
      if (dropdown) dropdown.classList.remove('show');
    }
  });
}


// ============================================
// CURSOR GLOW EFFECT ON HERO
// ============================================
function initCursorGlow() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    hero.style.setProperty('--cursor-x', x + 'px');
    hero.style.setProperty('--cursor-y', y + 'px');
  });
  
  // Add cursor glow style
  const style = document.createElement('style');
  style.textContent = `
    .hero::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(
        400px circle at var(--cursor-x, 50%) var(--cursor-y, 50%),
        rgba(212, 160, 23, 0.04) 0%,
        transparent 60%
      );
      pointer-events: none;
      z-index: 1;
    }
  `;
  document.head.appendChild(style);
}


// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
function initMagneticButtons() {
  document.querySelectorAll('.btn-gold').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}


// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize particle system
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    new ParticleSystem(canvas);
  }

  // Initialize features
  initScrollObserver();
  initNavScroll();
  initParallax();
  initHorizontalScroll();
  initRippleEffect();
  initKeyboardShortcuts();
  initCursorGlow();
  
  // Delayed inits
  setTimeout(() => {
    initMagneticButtons();
  }, 1000);

  // Check URL hash for navigation
  const hash = window.location.hash.replace('#', '');
  if (['login', 'dashboard', 'admin'].includes(hash)) {
    navigateTo(hash);
  }

  console.log(
    '%c⚡ FORGE BUILDERS %cClient Portal v2.0',
    'color: #D4A017; font-size: 20px; font-weight: bold; font-family: sans-serif;',
    'color: #888; font-size: 14px; font-family: sans-serif;'
  );
});
