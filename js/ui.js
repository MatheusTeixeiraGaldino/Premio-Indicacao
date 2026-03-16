import { getCurrentUser, logout } from './auth.js';
import { STATUS_LABELS, STATUS_COLORS } from './indicacoes.js';

// ── Toast ──────────────────────────────────────────
let toastContainer;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'success', duration = 3500) {
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal ──────────────────────────────────────────
export function openModal(overlayId) {
  document.getElementById(overlayId)?.classList.add('open');
}

export function closeModal(overlayId) {
  document.getElementById(overlayId)?.classList.remove('open');
}

export function createConfirmModal(message, onConfirm) {
  const existing = document.getElementById('confirm-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'confirm-modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <span class="modal-title">Confirmar ação</span>
        <button class="modal-close" id="confirm-close">×</button>
      </div>
      <div class="modal-body">
        <p style="font-size:14px;color:var(--text)">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="confirm-cancel">Cancelar</button>
        <button class="btn btn-danger" id="confirm-ok">Confirmar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);

  const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200); };
  overlay.querySelector('#confirm-close').onclick = close;
  overlay.querySelector('#confirm-cancel').onclick = close;
  overlay.querySelector('#confirm-ok').onclick = () => { close(); onConfirm(); };
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

// ── Loading ─────────────────────────────────────────
export function showLoading() {
  let el = document.getElementById('loading-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'loading-overlay';
    el.className = 'loading-overlay';
    el.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(el);
  }
  el.style.display = 'flex';
}

export function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}

// ── Badge ────────────────────────────────────────────
export function statusBadge(status) {
  const map = {
    previsto: 'blue',
    aguardando_pagamento: 'yellow',
    pago: 'green',
    colaborador_desligado: 'red',
    cancelado: 'gray'
  };
  const cls = map[status] || 'gray';
  return `<span class="badge badge-${cls}">${STATUS_LABELS[status] || status}</span>`;
}

// ── Currency ────────────────────────────────────────
export function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

// ── Navigation ──────────────────────────────────────
const NAV_ITEMS = [
  { href: 'dashboard.html', icon: '⬡', label: 'Dashboard', roles: ['admin', 'dh', 'dp'] },
  { href: 'indicacoes.html', icon: '✦', label: 'Indicações', roles: ['admin', 'dh', 'dp'] },
  { href: 'cadastro.html', icon: '+', label: 'Nova Indicação', roles: ['admin', 'dh'] },
  { href: 'pagamentos.html', icon: '◈', label: 'Pagamentos', roles: ['admin', 'dh', 'dp'] },
  { href: 'relatorios.html', icon: '▤', label: 'Relatórios', roles: ['admin', 'dh', 'dp'] },
  { href: 'usuarios.html', icon: '⊙', label: 'Usuários', roles: ['admin'] },
  { href: 'configuracoes.html', icon: '⚙', label: 'Configurações', roles: ['admin', 'dh'] },
];

export function renderSidebar(activePage) {
  const user = getCurrentUser();
  if (!user) return;

  const current = window.location.pathname.split('/').pop();
  const page = activePage || current;

  const navHtml = NAV_ITEMS
    .filter(item => item.roles.includes(user.perfil))
    .map(item => `
      <a href="${item.href}" class="nav-item ${page === item.href ? 'active' : ''}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join('');

  const initials = user.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const roleLabel = { admin: 'Administrador', dh: 'Desenvolvimento Humano', dp: 'Departamento Pessoal' };

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-mark">
        <div class="logo-icon">🏆</div>
        <div class="logo-text">Prêmio <span>por Indicação</span></div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        ${navHtml}
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="user-badge">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <div class="user-name">${user.nome}</div>
          <div class="user-role">${roleLabel[user.perfil] || user.perfil}</div>
        </div>
      </div>
      <button class="nav-item mt-2 w-full" id="logout-btn" style="color:var(--danger)">
        <span class="nav-icon">⏻</span>
        <span>Sair</span>
      </button>
    </div>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    createConfirmModal('Deseja realmente sair do sistema?', logout);
  });

  // Hamburger
  const ham = document.getElementById('hamburger');
  if (ham) {
    ham.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !ham.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}
