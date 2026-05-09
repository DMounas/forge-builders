/* ============================================
   RJS FURNITURE SHOP — Admin Engine
   Fully connected to Supabase backend
   ============================================ */

import {
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  deleteCategory,
  getSalesOverview,
} from './supabase.js';

// ── ADMIN STATE ──
const SADMIN = {
  products: [],
  orders: [],
  categories: [],
  salesData: null,
  editingProduct: null,
  pendingPhotos: [],   // File objects waiting to upload
};


// ============================================
// INIT SHOP ADMIN
// ============================================
async function initShopAdmin() {
  switchShopAdminTab('products');
}

document.addEventListener('DOMContentLoaded', () => {
  const uploadArea = document.getElementById('photo-upload-area');
  const fileInput = document.getElementById('p-photos');
  
  if (uploadArea && fileInput) {
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--gold)';
      uploadArea.style.background = 'rgba(212,160,23,0.05)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--glass-border)';
      uploadArea.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--glass-border)';
      uploadArea.style.background = 'transparent';
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        if (typeof previewPhotos === 'function') {
          previewPhotos(fileInput);
        } else if (window.previewPhotos) {
          window.previewPhotos(fileInput);
        }
      }
    });
  }
});


// ============================================
// TAB SWITCHER
// ============================================
function switchShopAdminTab(tab) {
  // Update nav highlight
  document.querySelectorAll('.shop-admin-nav a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById(`sadmin-nav-${tab}`);
  if (navEl) navEl.classList.add('active');

  // Hide all tabs
  document.querySelectorAll('.sadmin-tab').forEach(t => t.classList.remove('active'));
  const tabEl = document.getElementById(`sadmin-tab-${tab}`);
  if (tabEl) tabEl.classList.add('active');

  // Load data for that tab
  if (tab === 'products') loadAdminProducts();
  if (tab === 'categories') loadAdminCategories();
  if (tab === 'orders') loadAdminOrders();
  if (tab === 'sales') loadSalesOverview();
}


// ============================================
// PRODUCTS TAB
// ============================================
async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:24px">Loading products...</td></tr>`;

  try {
    SADMIN.products = await getAllProducts();
    renderAdminProductsTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:#ff6b6b;padding:16px">Failed to load products.</td></tr>`;
    console.error(err);
  }
}

function renderAdminProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  if (SADMIN.products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:32px">
      No products yet. Click "+ Add New Product" to get started.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = SADMIN.products.map(p => {
    const primaryPhoto = p.product_photos?.find(ph => ph.is_primary)?.photo_url;
    const imgHtml = primaryPhoto
      ? `<img src="${primaryPhoto}" alt="${p.name}"
             style="width:48px;height:48px;object-fit:cover;border-radius:6px">`
      : `<div style="width:48px;height:48px;background:#1a1a1a;border-radius:6px;
                     display:flex;align-items:center;justify-content:center;font-size:24px">🛋️</div>`;

    const stockBadge = p.stock <= 5 && p.stock > 0
      ? `<span style="color:#ff9f43">${p.stock} ⚠️</span>`
      : p.stock === 0
        ? `<span style="color:#ff6b6b">0 ❌</span>`
        : `<span>${p.stock}</span>`;

    const statusBadge = p.is_active
      ? `<span style="background:#26de8122;color:#26de81;padding:4px 10px;border-radius:12px;font-size:12px">Active</span>`
      : `<span style="background:#ff6b6b22;color:#ff6b6b;padding:4px 10px;border-radius:12px;font-size:12px">Hidden</span>`;

    return `
      <tr>
        <td>${imgHtml}</td>
        <td style="font-weight:500">${p.name}</td>
        <td style="color:#888">${p.furniture_categories?.name || '—'}</td>
        <td style="color:#D4A017">₹${Number(p.price).toLocaleString('en-IN')}</td>
        <td>${stockBadge}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn-outline-shop" style="padding:6px 12px;font-size:12px;margin-right:6px"
                  onclick="openEditProductPanel('${p.id}')">✏️ Edit</button>
          <button style="background:#ff6b6b22;color:#ff6b6b;border:1px solid #ff6b6b44;
                         padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer"
                  onclick="confirmDeleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')">🗑️</button>
        </td>
      </tr>`;
  }).join('');
}

// ── ADD PRODUCT PANEL ──
function openAddProductPanel() {
  SADMIN.editingProduct = null;
  SADMIN.pendingPhotos = [];
  document.getElementById('panel-title').textContent = 'Add New Product';
  document.getElementById('add-product-form').reset();
  document.getElementById('photo-previews').innerHTML = '';
  document.getElementById('p-active-label').textContent = 'Active (visible in shop)';
  document.getElementById('p-partner').value = 'In-House Delivery Team';
  document.getElementById('p-delivery').value = '7';

  // Populate category dropdown from DB
  populateCategoryDropdown();

  document.getElementById('add-product-panel').classList.add('show');
  document.getElementById('add-product-overlay').classList.add('show');
}

async function openEditProductPanel(productId) {
  const product = SADMIN.products.find(p => p.id === productId);
  if (!product) return;

  SADMIN.editingProduct = product;
  SADMIN.pendingPhotos = [];

  document.getElementById('panel-title').textContent = 'Edit Product';
  await populateCategoryDropdown();

  // Fill form with existing values
  document.getElementById('p-name').value = product.name || '';
  document.getElementById('p-price').value = product.price || '';
  document.getElementById('p-stock').value = product.stock || '';
  document.getElementById('p-material').value = product.material || 'Wood';
  document.getElementById('p-delivery').value = product.delivery_days || 7;
  document.getElementById('p-partner').value = product.delivery_partner || 'In-House Delivery Team';
  document.getElementById('p-desc').value = product.description || '';
  document.getElementById('p-dims').value = product.dimensions || '';
  document.getElementById('p-active').checked = product.is_active;
  document.getElementById('p-active-label').textContent = product.is_active
    ? 'Active (visible in shop)' : 'Hidden (not visible in shop)';

  // Set category
  if (product.furniture_categories?.name) {
    const select = document.getElementById('p-category');
    for (const opt of select.options) {
      if (opt.value === product.furniture_categories.name) {
        opt.selected = true;
        break;
      }
    }
  }

  // Show existing photos
  const previewContainer = document.getElementById('photo-previews');
  previewContainer.innerHTML = (product.product_photos || []).map(ph => `
    <div style="position:relative;display:inline-block;margin:4px">
      <img src="${ph.photo_url}" alt=""
           style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #333">
      ${ph.is_primary ? '<span style="position:absolute;top:2px;left:2px;background:#D4A017;color:#000;font-size:9px;padding:2px 4px;border-radius:3px">PRIMARY</span>' : ''}
    </div>`).join('');

  document.getElementById('add-product-panel').classList.add('show');
  document.getElementById('add-product-overlay').classList.add('show');
}

async function populateCategoryDropdown() {
  try {
    SADMIN.categories = await getCategories();
    const select = document.getElementById('p-category');
    select.innerHTML = SADMIN.categories.map(cat =>
      `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
    ).join('');
  } catch (err) {
    console.error('Failed to load categories for dropdown:', err);
  }
}

function closeAddProductPanel() {
  document.getElementById('add-product-panel').classList.remove('show');
  document.getElementById('add-product-overlay').classList.remove('show');
  SADMIN.editingProduct = null;
  SADMIN.pendingPhotos = [];
}

function previewPhotos(input) {
  SADMIN.pendingPhotos = Array.from(input.files);
  const container = document.getElementById('photo-previews');

  const newPreviews = SADMIN.pendingPhotos.map((file, i) => {
    const url = URL.createObjectURL(file);
    return `
      <div style="position:relative;display:inline-block;margin:4px">
        <img src="${url}" alt=""
             style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #D4A017">
        ${i === 0 ? '<span style="position:absolute;top:2px;left:2px;background:#D4A017;color:#000;font-size:9px;padding:2px 4px;border-radius:3px">PRIMARY</span>' : ''}
      </div>`;
  }).join('');

  // Keep existing photos + add new previews
  const existing = container.querySelectorAll('div[data-existing]');
  container.innerHTML = Array.from(existing).map(el => el.outerHTML).join('') + newPreviews;
}

async function saveProduct(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '⏳ Saving...';
  btn.disabled = true;

  try {
    // Find category_id from selected name
    const selectedCatName = document.getElementById('p-category').value;
    const category = SADMIN.categories.find(c => c.name === selectedCatName);

    const productData = {
      name: document.getElementById('p-name').value.trim(),
      price: parseFloat(document.getElementById('p-price').value),
      stock: parseInt(document.getElementById('p-stock').value),
      category_id: category?.id || null,
      material: document.getElementById('p-material').value,
      delivery_days: parseInt(document.getElementById('p-delivery').value),
      delivery_partner: document.getElementById('p-partner').value.trim() || 'In-House Delivery Team',
      description: document.getElementById('p-desc').value.trim(),
      dimensions: document.getElementById('p-dims').value.trim(),
      is_active: document.getElementById('p-active').checked,
    };

    if (SADMIN.editingProduct) {
      // Update existing
      await updateProduct(SADMIN.editingProduct.id, productData);
      // Upload new photos if any
      if (SADMIN.pendingPhotos.length > 0) {
        await uploadProductPhotos(SADMIN.editingProduct.id, SADMIN.pendingPhotos);
      }
      shopAdminToast('✅', 'Product updated successfully!');
    } else {
      // Create new with photos
      await createProduct(productData, SADMIN.pendingPhotos);
      shopAdminToast('✅', 'Product created successfully!');
    }

    closeAddProductPanel();
    await loadAdminProducts();

  } catch (err) {
    shopAdminToast('❌', 'Failed to save product: ' + (err.message || 'Unknown error'));
    console.error(err);
  } finally {
    btn.textContent = 'Save Product';
    btn.disabled = false;
  }
}

async function uploadProductPhotos(productId, files) {
  const { supabase } = await import('./supabase.js');
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = `products/${productId}/${Date.now()}-${file.name}`;
    const { error: storageError } = await supabase.storage
      .from('product-photos')
      .upload(fileName, file);
    if (storageError) { console.error('Photo upload error:', storageError); continue; }

    const { data: { publicUrl } } = supabase.storage
      .from('product-photos')
      .getPublicUrl(fileName);

    await supabase.from('product_photos').insert({
      product_id: productId,
      photo_url: publicUrl,
      is_primary: i === 0,
      sort_order: i,
    });
  }
}

async function confirmDeleteProduct(productId, productName) {
  if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
  try {
    await deleteProduct(productId);
    shopAdminToast('🗑️', 'Product deleted');
    await loadAdminProducts();
  } catch (err) {
    shopAdminToast('❌', 'Failed to delete product');
    console.error(err);
  }
}

// Toggle active on the form
document.addEventListener('DOMContentLoaded', () => {
  const activeToggle = document.getElementById('p-active');
  if (activeToggle) {
    activeToggle.addEventListener('change', function () {
      const label = document.getElementById('p-active-label');
      if (label) label.textContent = this.checked
        ? 'Active (visible in shop)'
        : 'Hidden (not visible in shop)';
    });
  }

  const uploadArea = document.getElementById('photo-upload-area');
  if (uploadArea) {
    uploadArea.addEventListener('click', () => {
      document.getElementById('p-photos')?.click();
    });
  }
});

// ============================================
// CATEGORIES TAB
// ============================================
async function loadAdminCategories() {
  const listEl = document.getElementById('categories-list');
  if (!listEl) return;
  listEl.innerHTML = '<p style="color:#888;padding:16px">Loading...</p>';

  try {
    SADMIN.categories = await getCategories();
    renderCategoriesList();
  } catch (err) {
    listEl.innerHTML = '<p style="color:#ff6b6b;padding:16px">Failed to load categories.</p>';
  }
}

function renderCategoriesList() {
  const listEl = document.getElementById('categories-list');
  if (!listEl) return;

  if (SADMIN.categories.length === 0) {
    listEl.innerHTML = '<p style="color:#888;padding:16px">No categories yet.</p>';
    return;
  }

  listEl.innerHTML = SADMIN.categories.map(cat => `
    <div class="category-item" style="display:flex;align-items:center;justify-content:space-between;
         padding:14px 18px;background:#111;border:1px solid #222;border-radius:8px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:24px">${cat.icon}</span>
        <div>
          <div style="font-weight:600;color:#fff">${cat.name}</div>
          <div style="font-size:12px;color:#888">Sort order: ${cat.sort_order}</div>
        </div>
      </div>
      <button style="background:#ff6b6b22;color:#ff6b6b;border:1px solid #ff6b6b44;
                     padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer"
              onclick="confirmDeleteCategory('${cat.id}', '${cat.name.replace(/'/g, "\\'")}')">
        🗑️ Delete
      </button>
    </div>`).join('');
}

async function addCategory() {
  const nameInput = document.getElementById('new-cat-name');
  const iconInput = document.getElementById('new-cat-icon');
  const name = nameInput?.value.trim();
  const icon = iconInput?.value.trim() || '🪑';

  if (!name) { shopAdminToast('❌', 'Please enter a category name'); return; }

  try {
    const { supabase } = await import('./supabase.js');
    await supabase.from('furniture_categories').insert({ name, icon });
    nameInput.value = '';
    iconInput.value = '';
    shopAdminToast('✅', `Category "${name}" added!`);
    await loadAdminCategories();
  } catch (err) {
    shopAdminToast('❌', 'Failed to add category');
    console.error(err);
  }
}

async function confirmDeleteCategory(catId, catName) {
  if (!confirm(`Delete category "${catName}"? Products in this category will lose their category.`)) return;
  try {
    await deleteCategory(catId);
    shopAdminToast('🗑️', 'Category deleted');
    await loadAdminCategories();
  } catch (err) {
    shopAdminToast('❌', 'Failed to delete category');
    console.error(err);
  }
}


// ============================================
// ORDERS TAB
// ============================================
async function loadAdminOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:24px">Loading orders...</td></tr>`;

  try {
    const statusFilter = document.getElementById('order-status-filter')?.value || 'all';
    SADMIN.orders = await getAllOrders(statusFilter === 'all' ? null : statusFilter);
    renderAdminOrdersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:#ff6b6b;padding:16px">Failed to load orders.</td></tr>`;
    console.error(err);
  }
}

function renderAdminOrders() {
  loadAdminOrders();
}

function renderAdminOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  if (SADMIN.orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:32px">No orders yet.</td></tr>`;
    return;
  }

  const statusColors = {
    'Confirmed': '#f0b429',
    'Dispatched': '#54a0ff',
    'Out for Delivery': '#ff9f43',
    'Delivered': '#26de81',
  };

  tbody.innerHTML = SADMIN.orders.map(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const color = statusColors[order.status] || '#888';
    const customer = order.profiles?.full_name || order.delivery_name || 'Customer';
    const items = order.order_items?.length || 0;
    const slot = order.delivery_slot
      ? { morning: '9AM–12PM', afternoon: '12PM–4PM', evening: '4PM–8PM' }[order.delivery_slot] || order.delivery_slot
      : '—';

    return `
      <tr id="order-row-${order.id}">
        <td style="font-family:monospace;color:#D4A017">${order.order_code}</td>
        <td>${customer}</td>
        <td style="color:#888">${items} item${items !== 1 ? 's' : ''}</td>
        <td style="color:#D4A017;font-weight:600">₹${Number(order.total).toLocaleString('en-IN')}</td>
        <td style="color:#888;font-size:12px">${order.delivery_date || '—'}<br>${slot}</td>
        <td>
          <span id="order-status-badge-${order.id}"
                style="background:${color}22;color:${color};padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600">
            ${order.status}
          </span>
        </td>
        <td>
          <select onchange="handleOrderStatusChange('${order.id}', '${order.customer_id}', this.value)"
                  style="background:#1a1a1a;color:#fff;border:1px solid #333;padding:6px 10px;
                         border-radius:6px;font-size:12px;cursor:pointer">
            <option value="">Update status...</option>
            <option value="Confirmed"        ${order.status === 'Confirmed' ? 'selected' : ''}>✅ Confirmed</option>
            <option value="Dispatched"       ${order.status === 'Dispatched' ? 'selected' : ''}>🚚 Dispatched</option>
            <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>📦 Out for Delivery</option>
            <option value="Delivered"        ${order.status === 'Delivered' ? 'selected' : ''}>🏠 Delivered</option>
          </select>
        </td>
      </tr>`;
  }).join('');
}

async function handleOrderStatusChange(orderId, customerId, newStatus) {
  if (!newStatus) return;
  try {
    await updateOrderStatus(orderId, newStatus, customerId);

    // Update badge in table immediately
    const badge = document.getElementById(`order-status-badge-${orderId}`);
    if (badge) {
      const statusColors = {
        'Confirmed': '#f0b429', 'Dispatched': '#54a0ff',
        'Out for Delivery': '#ff9f43', 'Delivered': '#26de81'
      };
      const color = statusColors[newStatus] || '#888';
      badge.textContent = newStatus;
      badge.style.background = `${color}22`;
      badge.style.color = color;
    }

    // Update local data
    const order = SADMIN.orders.find(o => o.id === orderId);
    if (order) order.status = newStatus;

    shopAdminToast('✅', `Order updated to "${newStatus}" — client notified!`);
  } catch (err) {
    shopAdminToast('❌', 'Failed to update order status');
    console.error(err);
  }
}


// ============================================
// SALES OVERVIEW TAB
// ============================================
async function loadSalesOverview() {
  const metricsEl = document.getElementById('sales-metrics');
  if (!metricsEl) return;
  metricsEl.innerHTML = '<p style="color:#888;padding:16px">Loading sales data...</p>';

  try {
    SADMIN.salesData = await getSalesOverview();
    renderSalesMetrics();
    renderRevenueChart();
    renderTopProducts();
  } catch (err) {
    metricsEl.innerHTML = '<p style="color:#ff6b6b;padding:16px">Failed to load sales data.</p>';
    console.error(err);
  }
}

function renderSalesMetrics() {
  const metricsEl = document.getElementById('sales-metrics');
  if (!metricsEl || !SADMIN.salesData) return;

  const { totalRevenue, ordersThisMonth, pending, topProducts } = SADMIN.salesData;
  const topProduct = topProducts?.[0]?.name || '—';

  metricsEl.innerHTML = `
    <div class="sales-metric-card">
      <div class="metric-icon">💰</div>
      <div class="metric-value">₹${Number(totalRevenue).toLocaleString('en-IN')}</div>
      <div class="metric-label">Total Revenue</div>
    </div>
    <div class="sales-metric-card">
      <div class="metric-icon">📦</div>
      <div class="metric-value">${ordersThisMonth}</div>
      <div class="metric-label">Orders This Month</div>
    </div>
    <div class="sales-metric-card">
      <div class="metric-icon">🏆</div>
      <div class="metric-value" style="font-size:16px">${topProduct}</div>
      <div class="metric-label">Top Selling Product</div>
    </div>
    <div class="sales-metric-card">
      <div class="metric-icon">🚚</div>
      <div class="metric-value">${pending}</div>
      <div class="metric-label">Pending Deliveries</div>
    </div>`;
}

function renderRevenueChart() {
  const chartEl = document.getElementById('bar-chart');
  if (!chartEl || !SADMIN.salesData) return;

  const orders = SADMIN.salesData.orders || [];

  // Group by week
  const weeks = {};
  orders.forEach(order => {
    const date = new Date(order.created_at);
    const week = `W${getWeekNumber(date)}`;
    if (!weeks[week]) weeks[week] = 0;
    weeks[week] += order.total || 0;
  });

  const entries = Object.entries(weeks).slice(-6); // last 6 weeks
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    chartEl.innerHTML = '<p style="color:#888;padding:16px;text-align:center">No sales data yet.</p>';
    return;
  }

  chartEl.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:12px;height:180px;padding:0 8px">
      ${entries.map(([label, value]) => {
    const heightPct = Math.max((value / maxVal) * 100, 4);
    return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">
            <div style="font-size:11px;color:#D4A017">₹${Math.round(value / 1000)}k</div>
            <div style="width:100%;background:linear-gradient(180deg,#D4A017,#A67C00);
                        border-radius:4px 4px 0 0;height:${heightPct}%;
                        transition:height 0.8s ease;min-height:4px"></div>
            <div style="font-size:11px;color:#888">${label}</div>
          </div>`;
  }).join('')}
    </div>`;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function renderTopProducts() {
  const listEl = document.getElementById('top-products-list');
  if (!listEl || !SADMIN.salesData) return;

  const { topProducts } = SADMIN.salesData;
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  if (!topProducts || topProducts.length === 0) {
    listEl.innerHTML = '<p style="color:#888;padding:16px">No sales data yet.</p>';
    return;
  }

  listEl.innerHTML = topProducts.map((p, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;
         padding:14px 18px;background:#111;border:1px solid #222;
         border-radius:8px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:20px">${medals[i] || '⭐'}</span>
        <span style="font-weight:500">${p.name}</span>
      </div>
      <span style="color:#D4A017;font-weight:600">${p.qty} sold</span>
    </div>`).join('');
}


// ============================================
// TOAST
// ============================================
function shopAdminToast(icon, msg) {
  // Reuse the shop toast
  if (typeof shopToast === 'function') {
    shopToast(icon, msg);
    return;
  }
  const t = document.getElementById('s-toast');
  if (!t) return;
  t.querySelector('.s-toast-icon').textContent = icon;
  t.querySelector('.s-toast-text').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}


// ============================================
// EXPOSE TO HTML
// ============================================
window.initShopAdmin = initShopAdmin;
window.switchShopAdminTab = switchShopAdminTab;
window.loadAdminProducts = loadAdminProducts;
window.loadAdminCategories = loadAdminCategories;
window.loadAdminOrders = loadAdminOrders;
window.loadSalesOverview = loadSalesOverview;
window.openAddProductPanel = openAddProductPanel;
window.openEditProductPanel = openEditProductPanel;
window.closeAddProductPanel = closeAddProductPanel;
window.previewPhotos = previewPhotos;
window.saveProduct = saveProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.addCategory = addCategory;
window.confirmDeleteCategory = confirmDeleteCategory;
window.renderAdminOrders = renderAdminOrders;
window.handleOrderStatusChange = handleOrderStatusChange;