/**
 * @fileoverview Toast Notification Component: Non-blocking fixed floating feedback pills
 * @module Component:Toast
 * @description
 * High-visibility floating notification pill with micro-animations and severity icons.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

/**
 * Displays a non-blocking floating toast pill at the bottom center of the screen
 * @param {string} message - Feedback message to display
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - Severity type of toast
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-pill';

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
  };

  const icon = icons[type] || 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.95)';
    toast.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

const Toast = {
  show: showToast,
};

window.Toast = Toast;
window.showToast = showToast;
