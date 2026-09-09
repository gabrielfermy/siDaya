/**
 * ==========================================================================
 * APPLICATION BOOTSTRAP & EVENT DISPATCHERS
 * ==========================================================================
 */
function toggleTheme() { store.dispatch('TOGGLE_THEME'); }
function toggleSidebarDrawer() { store.dispatch('TOGGLE_SIDEBAR'); }
function closeSidebarDrawer() { store.dispatch('CLOSE_SIDEBAR'); }

// Subscribe UI renderer to store
store.subscribe(renderUI);

// Cross-Tab Synchronization
window.addEventListener('storage', (e) => {
  if (e.key === 'sidaya_store_v3' && e.newValue) {
    try {
      const remoteState = JSON.parse(e.newValue);
      Object.assign(store.state, remoteState);
      renderUI(store.getState());
    } catch (err) {}
  }
});

// Listen for browser Back/Forward navigation
window.addEventListener('popstate', () => {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  store.dispatch('NAVIGATE', path);
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderUI(store.getState());
});

// Immediate initial execution
renderUI(store.getState());
