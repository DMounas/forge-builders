/* ============================================
   RJS HOMES — Application Engine
   Fully connected to Supabase backend
   ============================================ */

import {
  signInClient,
  signOut,
  getCurrentUser,
  getCurrentProfile,
  getMyProject,
  subscribeToProject,
  subscribeToNotifications,
  getMyNotifications,
  markNotificationsRead,
  getAllProjects,
  updatePhase,
  addProjectUpdate,
  deleteProjectUpdate,
  upsertMaterial,
  deleteMaterial,
  pushNotificationToClient,
  uploadProjectPhoto,
  createProject,
  supabase,
} from './supabase.js';

// ── Application State ──
const APP = {
  currentPage: 'home',
  countersAnimated: false,
  adminSidebarOpen: false,
  currentProject: null,       // loaded from DB
  allProjects: [],            // admin: all projects
  selectedProjectIndex: 0,
  unsubscribeProject: null,   // real-time unsub fn
  unsubscribeNotifs: null,
  notifications: [],
};


// ============================================
// NAVIGATION & ROUTING
// ============================================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.style.display = 'block';
    void target.offsetWidth;
    target.classList.add('active');
  }

  APP.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (page === 'dashboard') initDashboard();

  setTimeout(() => initScrollObserver(), 100);
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function toggleMenu() {
  document.getElementById('nav-links')?.classList.toggle('open');
  document.getElementById('nav-hamburger')?.classList.toggle('active');
}

function closeMenu() {
  document.getElementById('nav-links')?.classList.remove('open');
  document.getElementById('nav-hamburger')?.classList.remove('active');
}


// ============================================
// SCROLL + COUNTER ANIMATIONS
// ============================================
function initScrollObserver() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.closest('#stats-section') && !APP.countersAnimated) {
          APP.countersAnimated = true;
          animateCounters();
        }
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}

function initNavScroll() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (APP.currentPage !== 'home') return;
    nav?.classList.toggle('scrolled', window.scrollY > 80);
  });
}

function animateCounters() {
  document.querySelectorAll('.counter').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const step = target / (2000 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = Math.floor(current);
    }, 16);
  });
}


// ============================================
// PARTICLES
// ============================================
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    this.init();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  init() {
    for (let i = 0; i < 60; i++) this.particles.push(this.createParticle());
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
        ? `rgba(212,160,23,${Math.random() * 0.3 + 0.05})`
        : `rgba(180,180,180,${Math.random() * 0.15 + 0.03})`
    };
  }
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p, i) => {
      p.x += p.speedX; p.y += p.speedY;
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
// DYNAMIC HOMEPAGE PROJECTS
// ============================================
async function loadHomepageProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  try {
    const { data: projects, error } = await supabase
      .from('homepage_projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    if (!projects || projects.length === 0) {
      grid.innerHTML = '<div style="color:var(--text-secondary);grid-column:1/-1;text-align:center;padding:40px;">No featured projects found.</div>';
      return;
    }

    const colors = { ACTIVE: 'yellow', ONGOING: 'orange', 'NEW LAUNCH': 'blue', COMPLETED: 'red' };
    
    grid.innerHTML = projects.map((p, i) => {
      const bColor = colors[p.status.toUpperCase()] || 'gold';
      const statusClass = p.status.toUpperCase().replace(' ', '-').toLowerCase();
      
      // Default placeholder text if no image
      const imgContent = p.image_url 
        ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
        : `<span>${p.name.toUpperCase()} - ${p.location.split(',')[0].toUpperCase()}</span>`;

      return `
        <div class="rjs-card border-${bColor} animate-on-scroll stagger-${(i % 6) + 1} visible" data-type="${p.type.toUpperCase()}" style="opacity:1;transform:translateY(0);">
          <div class="rjs-card-img">${imgContent}</div>
          <div class="rjs-card-content">
            <h3>${p.name}</h3>
            <p class="rjs-card-meta">${p.location} · ${p.type} · ${p.units}</p>
            <p class="rjs-card-price">${p.price_range}</p>
            <div class="rjs-card-footer">
              <span class="rjs-status status-${statusClass}">${p.status.toUpperCase()}</span>
              <a href="#" class="rjs-details-link"
                onclick="showProjectDetail('${p.name}','${p.location}','${p.type}','${p.units}','${p.price_range}','${p.status.toUpperCase()}');return false;">Details
                &rarr;</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (err) {
    console.error("Error loading homepage projects:", err);
    grid.innerHTML = '<div style="color:red;grid-column:1/-1;text-align:center;padding:40px;">Failed to load projects. Please try again later.</div>';
  }
}


// ============================================
// LOGIN — Real Supabase Auth
// ============================================
async function handleLogin(e) {
  e.preventDefault();

  const projectId = document.getElementById('project-id').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button[type="submit"]');

  btn.textContent = 'Signing in...';
  btn.disabled = true;

  try {
    // Client login — email is projectcode@rjshomes.in
    const email = `${projectId.toLowerCase()}@rjshomes.in`;
    await signInWithEmail(email, password);
    navigateTo('dashboard');

  } catch (err) {
    showLoginError('Invalid Project ID or Password. Please try again.');
    console.error(err);
  } finally {
    btn.textContent = '✦ Enter Portal';
    btn.disabled = false;
  }
}

// helper used by handleLogin
async function signInWithEmail(email, password) {
  const { supabase } = await import('./supabase.js');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

function showLoginError(msg) {
  let errEl = document.getElementById('login-error');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = 'login-error';
    errEl.style.cssText = 'color:#ff6b6b;font-size:13px;margin-top:8px;text-align:center;';
    document.getElementById('login-form').appendChild(errEl);
  }
  errEl.textContent = msg;
}

async function handleLogout() {
  // Stop real-time listeners
  if (APP.unsubscribeProject) APP.unsubscribeProject();
  if (APP.unsubscribeNotifs) APP.unsubscribeNotifs();
  await signOut();
  APP.currentProject = null;
  navigateTo('home');
}


// ============================================
// CLIENT DASHBOARD — loads from Supabase
// ============================================
async function initDashboard() {
  showDashboardLoading(true);

  try {
    // Load project data
    const project = await getMyProject();
    if (!project) {
      showDashboardError('No project found for your account.');
      return;
    }
    APP.currentProject = project;

    // Render everything
    renderDashboardHeader(project);
    renderProgressRing(project.overall_progress);
    renderPhases(project.phases);
    renderTimeline(project.project_updates);
    renderGallery(project.project_photos);
    renderMaterials(project.materials);
    loadNotifications();

    // Subscribe to LIVE updates
    APP.unsubscribeProject = subscribeToProject(
      project.id,
      // Phase updated live
      (updatedPhase) => {
        updatePhaseCardLive(updatedPhase);
        showToast('🔄', 'Project update received!');
      },
      // New timeline entry live
      (newUpdate) => {
        prependTimelineEntry(newUpdate);
        showToast('📋', 'New project update added!');
      }
    );

    // Subscribe to notifications
    const user = await getCurrentUser();
    APP.unsubscribeNotifs = subscribeToNotifications(user.id, (notif) => {
      APP.notifications.unshift(notif);
      updateNotificationBadge();
      showToast('🔔', notif.title);
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    showDashboardError('Failed to load project. Please refresh.');
  } finally {
    showDashboardLoading(false);
  }
}

function showDashboardLoading(show) {
  const main = document.querySelector('.dash-main');
  if (!main) return;
  if (show) {
    main.style.opacity = '0.4';
    main.style.pointerEvents = 'none';
  } else {
    main.style.opacity = '1';
    main.style.pointerEvents = 'auto';
  }
}

function showDashboardError(msg) {
  const welcome = document.querySelector('.dash-welcome');
  if (welcome) welcome.innerHTML = `<h2 style="color:#ff6b6b">${msg}</h2>`;
}

function renderDashboardHeader(project) {
  const user = document.querySelector('.dash-user-name');
  if (user) user.textContent = project.profiles?.full_name || 'Client';

  const welcome = document.querySelector('.dash-welcome h1');
  if (welcome) welcome.innerHTML = `Welcome back, <span class="gold">${project.profiles?.full_name || 'Client'}</span>`;

  const sub = document.querySelector('.dash-welcome p');
  if (sub) sub.innerHTML = `${project.project_name} <strong>#${project.project_code}</strong> — Tracking your dream, brick by brick.`;

  const eta = document.querySelector('.estimated');
  if (eta && project.estimated_completion) {
    const date = new Date(project.estimated_completion).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    eta.textContent = `📅 Estimated Completion: ${date}`;
  }
}

function renderProgressRing(percent) {
  const circle = document.getElementById('progress-ring-fill');
  const valueEl = document.getElementById('progress-ring-value');
  const circumference = 2 * Math.PI * 90;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;

  setTimeout(() => {
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  }, 100);

  let current = 0;
  const step = percent / (2000 / 16);
  const timer = setInterval(() => {
    current += step;
    if (current >= percent) { current = percent; clearInterval(timer); }
    if (valueEl) valueEl.textContent = Math.floor(current) + '%';
  }, 16);
}

function renderPhases(phases) {
  const grid = document.getElementById('phases-grid');
  if (!grid || !phases) return;

  const icons = { Foundation: '🏗️', Framing: '🪵', Plumbing: '🔧', Electrical: '⚡', Painting: '🎨', Finishing: '✨' };

  grid.innerHTML = phases
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((phase, i) => {
      const icon = icons[phase.name] || '🔨';
      const statusLabel = phase.status === 'completed' ? '✅ Complete'
        : phase.status === 'in-progress' ? '🔄 In Progress' : '⏳ Pending';
      const updated = phase.last_updated
        ? new Date(phase.last_updated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Not started';

      return `
        <div class="phase-card animate-on-scroll stagger-${i + 1}" id="phase-card-${phase.id}">
          <div class="phase-card-header">
            <div class="phase-card-left">
              <span class="phase-icon">${icon}</span>
              <span class="phase-name">${phase.name}</span>
            </div>
            <span class="phase-status ${phase.status}">${statusLabel}</span>
          </div>
          <div class="phase-bar-container">
            <div class="phase-bar ${phase.status === 'completed' ? 'completed-bar' : ''}"
                 id="phase-bar-${phase.id}"
                 style="width: ${phase.completion}%"></div>
          </div>
          <div class="phase-meta">
            <span class="phase-percent" id="phase-pct-${phase.id}">${phase.completion}%</span>
            <span>Updated: ${updated}</span>
          </div>
        </div>`;
    }).join('');
}

// Called when real-time phase update arrives
function updatePhaseCardLive(updatedPhase) {
  const bar = document.getElementById(`phase-bar-${updatedPhase.id}`);
  const pct = document.getElementById(`phase-pct-${updatedPhase.id}`);
  if (bar) bar.style.width = updatedPhase.completion + '%';
  if (pct) pct.textContent = updatedPhase.completion + '%';

  // Update progress ring
  const project = APP.currentProject;
  if (project) {
    const idx = project.phases.findIndex(p => p.id === updatedPhase.id);
    if (idx !== -1) project.phases[idx] = updatedPhase;
    const avg = Math.round(project.phases.reduce((s, p) => s + p.completion, 0) / project.phases.length);
    renderProgressRing(avg);
  }
}

function renderTimeline(updates) {
  const timeline = document.getElementById('timeline');
  if (!timeline || !updates) return;

  if (updates.length === 0) {
    timeline.innerHTML = '<p style="color:var(--text-muted);padding:16px">No updates yet.</p>';
    return;
  }

  timeline.innerHTML = updates
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((u, i) => {
      const date = new Date(u.update_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      return `
        <div class="timeline-item animate-on-scroll stagger-${Math.min(i + 1, 6)}">
          <div class="timeline-date">${date}</div>
          <div class="timeline-text">${u.update_text}</div>
        </div>`;
    }).join('');
}

// Prepend a new timeline entry live
function prependTimelineEntry(update) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  const date = new Date(update.update_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const div = document.createElement('div');
  div.className = 'timeline-item';
  div.innerHTML = `<div class="timeline-date">${date}</div><div class="timeline-text">${update.update_text}</div>`;
  timeline.prepend(div);
}

function renderGallery(photos) {
  const gallery = document.getElementById('gallery-grid');
  if (!gallery) return;

  if (!photos || photos.length === 0) {
    gallery.innerHTML = '<p style="color:var(--text-muted);padding:16px">No photos uploaded yet.</p>';
    return;
  }

  gallery.innerHTML = photos.map((photo, i) => `
    <div class="gallery-item animate-on-scroll stagger-${Math.min(i + 1, 6)}">
      <img src="${photo.photo_url}" alt="${photo.caption || photo.phase_name}" 
           style="width:100%;height:100%;object-fit:cover;border-radius:8px"
           onerror="this.parentElement.innerHTML='<div class=\\'placeholder-img\\'>📸</div>'">
      <div class="gallery-item-overlay">${photo.phase_name || ''} ${photo.caption ? '— ' + photo.caption : ''}</div>
    </div>`).join('');
}

function renderMaterials(materials) {
  const tbody = document.getElementById('materials-tbody');
  if (!tbody || !materials) return;

  if (materials.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:var(--text-muted);text-align:center;padding:16px">No materials logged yet.</td></tr>';
    return;
  }

  tbody.innerHTML = materials.map(mat => `
    <tr>
      <td>${mat.material_name}</td>
      <td>${mat.quantity}</td>
      <td>${mat.unit_cost ? '₹' + Number(mat.unit_cost).toLocaleString('en-IN') : '—'}</td>
      <td class="cost">${mat.total_cost ? '₹' + Number(mat.total_cost).toLocaleString('en-IN') : '—'}</td>
    </tr>`).join('');
}


// ============================================
// NOTIFICATIONS
// ============================================
async function loadNotifications() {
  try {
    APP.notifications = await getMyNotifications();
    updateNotificationBadge();
    renderNotificationDropdown();
  } catch (err) {
    console.error('Notifications error:', err);
  }
}

function updateNotificationBadge() {
  const unread = APP.notifications.filter(n => !n.is_read).length;
  const badge = document.getElementById('notification-count');
  if (badge) badge.textContent = unread;
}

function renderNotificationDropdown() {
  const dropdown = document.getElementById('notification-dropdown');
  if (!dropdown) return;

  const items = APP.notifications.slice(0, 5).map(n => {
    const time = new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `
      <div class="notification-item">
        <div class="notification-item-text">${n.title}</div>
        <div class="notification-item-time">${time}</div>
      </div>`;
  }).join('') || '<div class="notification-item">No notifications yet.</div>';

  // Keep header, replace items
  const header = dropdown.querySelector('.notification-dropdown-header');
  dropdown.innerHTML = '';
  if (header) dropdown.appendChild(header);
  dropdown.insertAdjacentHTML('beforeend', items);
}

async function toggleNotifications() {
  const dropdown = document.getElementById('notification-dropdown');
  dropdown?.classList.toggle('show');

  if (dropdown?.classList.contains('show')) {
    // Mark as read
    const user = await getCurrentUser();
    if (user) await markNotificationsRead(user.id);
    APP.notifications.forEach(n => n.is_read = true);
    updateNotificationBadge();

    setTimeout(() => document.addEventListener('click', closeNotifications), 10);
  }
}

function closeNotifications(e) {
  const bell = document.getElementById('notification-bell');
  if (!bell?.contains(e.target)) {
    document.getElementById('notification-dropdown')?.classList.remove('show');
    document.removeEventListener('click', closeNotifications);
  }
}


// ============================================
// ADMIN PANEL — loads from Supabase
// ============================================
async function initAdmin() {
  try {
    APP.allProjects = await getAllProjects();
    renderAdminProjectList();
    if (APP.allProjects.length > 0) {
      await selectProject(0);
    }
  } catch (err) {
    console.error('Admin init error:', err);
    showToast('❌', 'Failed to load projects');
  }
}

function renderAdminProjectList() {
  const list = document.getElementById('admin-projects-list');
  if (!list) return;

  const statusClass = { 'On Track': 'on-track', 'Delayed': 'delayed', 'Completed': 'completed-chip' };
  const icons = ['🏛️', '🏗️', '🏠', '🏡', '🏢'];

  list.innerHTML = APP.allProjects.map((p, i) => `
    <div class="project-list-item ${i === APP.selectedProjectIndex ? 'active-project' : ''}"
         onclick="selectProject(${i})">
      <div class="project-list-info">
        <div class="project-list-icon">${icons[i % icons.length]}</div>
        <div>
          <div class="project-list-name">${p.project_name}</div>
          <div class="project-list-id">${p.project_code}</div>
        </div>
      </div>
      <span class="status-chip ${statusClass[p.status] || 'on-track'}">${p.status}</span>
    </div>`).join('');
}

async function selectProject(index) {
  APP.selectedProjectIndex = index;
  renderAdminProjectList();

  const project = APP.allProjects[index];
  if (!project) return;

  // Load full project details
  const { getProjectById } = await import('./supabase.js');
  APP.currentProject = await getProjectById(project.id);

  // Show editor panel
  document.getElementById('editor-panel')?.classList.add('visible');
  document.getElementById('editor-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  populatePhaseSliders();
  populateAdminUpdates();
  populateAdminMaterials();
}

function populatePhaseSliders() {
  const container = document.getElementById('phase-sliders');
  if (!container || !APP.currentProject) return;

  const icons = { Foundation: '🏗️', Framing: '🪵', Plumbing: '🔧', Electrical: '⚡', Painting: '🎨', Finishing: '✨' };

  container.innerHTML = APP.currentProject.phases
    ?.sort((a, b) => a.sort_order - b.sort_order)
    .map(phase => `
      <div class="phase-slider-item">
        <span class="phase-slider-label">${icons[phase.name] || '🔨'} ${phase.name}</span>
        <input type="range" class="phase-slider" min="0" max="100"
               value="${phase.completion}" id="slider-${phase.id}"
               oninput="updateSliderDisplay('${phase.id}', this.value)">
        <span class="phase-slider-value" id="slider-value-${phase.id}">${phase.completion}%</span>
      </div>`).join('') || '';
}

function updateSliderDisplay(phaseId, value) {
  const el = document.getElementById(`slider-value-${phaseId}`);
  if (el) el.textContent = value + '%';
}

function populateAdminUpdates() {
  const container = document.getElementById('update-entries');
  if (!container || !APP.currentProject) return;

  const updates = APP.currentProject.project_updates || [];
  if (updates.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No updates yet.</p>';
    return;
  }

  container.innerHTML = updates
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(u => {
      const date = new Date(u.update_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `
        <div class="update-entry">
          <span class="update-entry-date">${date}</span>
          <span>${u.update_text}</span>
          <span class="update-entry-remove" onclick="removeUpdate('${u.id}')">✕</span>
        </div>`;
    }).join('');
}

function populateAdminMaterials() {
  const container = document.getElementById('materials-admin');
  if (!container || !APP.currentProject) return;

  const mats = APP.currentProject.materials || [];
  if (mats.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No materials logged yet.</p>';
    return;
  }

  container.innerHTML = mats.map(mat => `
    <div class="material-row" id="mat-row-${mat.id}">
      <input class="admin-input" type="text" value="${mat.material_name}"
             onchange="updateMaterialField('${mat.id}', 'material_name', this.value)"
             placeholder="Material name">
      <input class="admin-input" type="text" value="${mat.quantity}"
             onchange="updateMaterialField('${mat.id}', 'quantity', this.value)"
             placeholder="Quantity">
      <input class="admin-input" type="number" value="${mat.unit_cost || ''}"
             onchange="updateMaterialField('${mat.id}', 'unit_cost', this.value)"
             placeholder="Unit cost ₹">
      <button class="remove-btn" onclick="removeMaterial('${mat.id}')">✕</button>
    </div>`).join('');
}

// Track in-memory changes to materials before push
const materialChanges = {};

function updateMaterialField(matId, field, value) {
  if (!materialChanges[matId]) {
    const existing = APP.currentProject.materials.find(m => m.id === matId);
    materialChanges[matId] = { ...existing };
  }
  materialChanges[matId][field] = value;

  // Auto-calc total if unit_cost changed
  if (field === 'unit_cost') {
    const mat = materialChanges[matId];
    const qty = parseFloat(mat.quantity) || 0;
    const cost = parseFloat(value) || 0;
    materialChanges[matId].total_cost = qty * cost;
  }
}

function addMaterialRow() {
  const tempId = 'new-' + Date.now();
  const newMat = { id: tempId, material_name: '', quantity: '', unit_cost: '', total_cost: 0 };
  if (!APP.currentProject.materials) APP.currentProject.materials = [];
  APP.currentProject.materials.push(newMat);
  materialChanges[tempId] = newMat;
  populateAdminMaterials();
  showToast('📦', 'New material row added');
}

async function removeMaterial(matId) {
  if (!matId.startsWith('new-')) {
    try {
      await deleteMaterial(matId);
    } catch (err) {
      showToast('❌', 'Failed to delete material');
      return;
    }
  }
  APP.currentProject.materials = APP.currentProject.materials.filter(m => m.id !== matId);
  delete materialChanges[matId];
  populateAdminMaterials();
}

async function addUpdate() {
  const dateInput = document.getElementById('new-update-date');
  const textInput = document.getElementById('new-update-text');
  if (!textInput?.value.trim()) return;

  try {
    const update = await addProjectUpdate(
      APP.currentProject.id,
      textInput.value.trim(),
      dateInput.value
    );
    if (!APP.currentProject.project_updates) APP.currentProject.project_updates = [];
    APP.currentProject.project_updates.unshift(update);
    textInput.value = '';
    populateAdminUpdates();
    showToast('✅', 'Update entry added');
  } catch (err) {
    showToast('❌', 'Failed to add update');
    console.error(err);
  }
}

async function removeUpdate(updateId) {
  try {
    await deleteProjectUpdate(updateId);
    APP.currentProject.project_updates = APP.currentProject.project_updates.filter(u => u.id !== updateId);
    populateAdminUpdates();
  } catch (err) {
    showToast('❌', 'Failed to remove update');
  }
}

async function simulateUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,application/pdf';
  input.multiple = true;
  input.style.display = 'none';
  document.body.appendChild(input);

  input.onchange = async () => {
    document.body.removeChild(input);
    const files = Array.from(input.files);
    const phase = document.getElementById('photo-phase-select')?.value || 'General';
    showToast('⏳', 'Uploading photos...');
    try {
      for (const file of files) {
        await uploadProjectPhoto(APP.currentProject.id, phase, file);
      }
      showToast('📸', `${files.length} photo(s) uploaded!`);
    } catch (err) {
      showToast('❌', 'Upload failed');
      console.error(err);
    }
  };
  
  // If user cancels file dialog, cleanup the DOM (some browsers fire cancel event, some don't. We do our best)
  input.addEventListener('cancel', () => {
    if(document.body.contains(input)) document.body.removeChild(input);
  });

  input.click();
}

function toggleAdminSidebar() {
  document.getElementById('admin-sidebar')?.classList.toggle('open');
  document.getElementById('admin-overlay')?.classList.toggle('show');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById(`admin-nav-${tab}`)?.classList.add('active');

  const editorPanel = document.getElementById('editor-panel');
  if (tab === 'projects') {
    editorPanel?.classList.remove('visible');
  } else {
    editorPanel?.classList.add('visible');
  }

  if (window.innerWidth <= 768) toggleAdminSidebar();
}


// ============================================
// PUSH LIVE UPDATE — saves everything to DB
// ============================================
async function pushLiveUpdate() {
  const btn = document.querySelector('.push-update-btn');
  btn.textContent = '⏳ Pushing Update...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  try {
    const project = APP.currentProject;

    // 1. Save all phase sliders
    for (const phase of project.phases || []) {
      const slider = document.getElementById(`slider-${phase.id}`);
      if (slider) {
        const newVal = parseInt(slider.value);
        if (newVal !== phase.completion) {
          await updatePhase(phase.id, newVal);
          phase.completion = newVal;
        }
      }
    }

    // 2. Save all material changes
    for (const [matId, matData] of Object.entries(materialChanges)) {
      if (matId.startsWith('new-')) {
        // New row — insert without the temp id
        const { id, ...data } = matData;
        await upsertMaterial(project.id, data);
      } else {
        await upsertMaterial(project.id, matData);
      }
    }
    // Clear pending changes
    Object.keys(materialChanges).forEach(k => delete materialChanges[k]);

    // 3. Push notification to client
    if (project.client_id) {
      const updateText = document.getElementById('new-update-text')?.value;
      await pushNotificationToClient(
        project.client_id,
        'Your project has been updated!',
        updateText || 'The builder has pushed new progress updates to your project.'
      );
    }

    showToast('🚀', 'Live update pushed to client!');

  } catch (err) {
    console.error('Push update error:', err);
    showToast('❌', 'Failed to push update');
  } finally {
    btn.textContent = '⚡ Push Live Update to Client';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }
}


// ============================================
// TOAST + MISC
// ============================================
function showToast(icon, message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('.toast-text').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

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

function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);
      width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;transform:scale(0);
      animation:rippleAnim 0.6s ease-out forwards;pointer-events:none;`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
  const style = document.createElement('style');
  style.textContent = `@keyframes rippleAnim { to { transform:scale(2.5);opacity:0; } }`;
  document.head.appendChild(style);
}

function initCursorGlow() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--cursor-x', (e.clientX - rect.left) + 'px');
    hero.style.setProperty('--cursor-y', (e.clientY - rect.top) + 'px');
  });
  const style = document.createElement('style');
  style.textContent = `.hero::after{content:'';position:absolute;top:0;left:0;width:100%;height:100%;
    background:radial-gradient(400px circle at var(--cursor-x,50%) var(--cursor-y,50%),rgba(212,160,23,0.04) 0%,transparent 60%);
    pointer-events:none;z-index:1;}`;
  document.head.appendChild(style);
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      document.getElementById('notification-dropdown')?.classList.remove('show');
    }
  });
}


// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Particles
  const canvas = document.getElementById('particle-canvas');
  if (canvas) new ParticleSystem(canvas);

  // Core UI
  initScrollObserver();
  initNavScroll();
  initParallax();
  initRippleEffect();
  initKeyboardShortcuts();
  initCursorGlow();
  
  // Load Dynamic Content
  loadHomepageProjects();

  // Check if already logged in
  try {
    const user = await getCurrentUser();
    if (user) {
      const profile = await getCurrentProfile();
      if (profile?.role === 'admin') {
        // Change portal button to admin dashboard
        const navCta = document.querySelector('.nav-cta');
        if (navCta) {
          navCta.innerHTML = 'ADMIN &rarr;';
          navCta.href = 'admin.html';
          navCta.onclick = null; // Remove navigateTo('login')
        }
      } else {
        navigateTo('dashboard');
      }
    }
  } catch (err) {
    // Not logged in — stay on home
  }

  // Bind login form
  document.getElementById('login-form')?.addEventListener('submit', handleLogin);

  console.log('%c⚡ RJS HOMES %cClient Portal v3.0 — Live',
    'color:#D4A017;font-size:20px;font-weight:bold;',
    'color:#888;font-size:14px;');
});

// Expose functions needed by HTML onclick attributes
window.navigateTo = navigateTo;
window.scrollToSection = scrollToSection;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;
window.handleLogout = handleLogout;
window.toggleNotifications = toggleNotifications;
window.toggleAdminSidebar = toggleAdminSidebar;
window.switchAdminTab = switchAdminTab;
window.selectProject = selectProject;
window.updateSliderDisplay = updateSliderDisplay;
window.updateMaterialField = updateMaterialField;
window.addMaterialRow = addMaterialRow;
window.removeMaterial = removeMaterial;
window.addUpdate = addUpdate;
window.removeUpdate = removeUpdate;
window.simulateUpload = simulateUpload;
window.pushLiveUpdate = pushLiveUpdate;