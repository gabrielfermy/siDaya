/**
 * ==========================================================================
 * STANDARD HTTP ERROR CONTROLLER
 * ==========================================================================
 */
function renderErrorPage(code, isOps, requestedRoute) {
  const err = ERROR_DEFINITIONS[code] || ERROR_DEFINITIONS['404'];
  const prefix = isOps ? 'op-err' : 'err';

  const badgeEl = document.getElementById(`${prefix}-badge`);
  const iconEl = document.getElementById(`${prefix}-badge-icon`);
  const badgeTextEl = document.getElementById(`${prefix}-badge-text`);
  const codeEl = document.getElementById(`${prefix}-code`);
  const titleEl = document.getElementById(`${prefix}-title`);
  const descEl = document.getElementById(`${prefix}-desc`);
  const rayIdEl = document.getElementById(`${prefix}-ray-id`);
  const timeEl = document.getElementById(`${prefix}-timestamp`);
  const routeEl = document.getElementById(`${prefix}-route`);

  if (badgeEl) badgeEl.className = `error-status-badge ${err.badgeClass}`;
  if (iconEl) iconEl.textContent = err.badgeIcon;
  if (badgeTextEl) badgeTextEl.textContent = err.badgeText;
  if (codeEl) {
    codeEl.textContent = err.code;
    codeEl.className = `error-big-code ${err.codeClass}`;
  }
  if (titleEl) titleEl.textContent = err.title;
  if (descEl) descEl.textContent = err.desc;
  if (rayIdEl) rayIdEl.textContent = `sidaya_${isOps ? 'ops' : 'req'}_${Math.random().toString(36).substring(2, 10)}`;
  if (timeEl) timeEl.textContent = new Date().toISOString();
  if (routeEl) routeEl.textContent = requestedRoute ? `/${requestedRoute}` : '/';
}

function triggerError(statusCode) {
  history.pushState(null, '', '/' + statusCode);
  store.dispatch('NAVIGATE', statusCode);
}

function copyRayId() {
  const rayEl = document.getElementById('err-ray-id') || document.getElementById('op-err-ray-id');
  const text = rayEl ? rayEl.textContent : 'sidaya_req_89f1a2bc0d';
  navigator.clipboard?.writeText(text);
  showToast(`📋 Ray ID disalin: ${text}`, 'success');
}
