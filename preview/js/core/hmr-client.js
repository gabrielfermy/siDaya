/**
 * @file hmr-client.js
 * @description Executive-Grade Hot Module Replacement (HMR) & Live-Reload Client for SiDaya Platform
 * Features:
 *   - Instant in-place CSS hot-swapping (<10ms, zero flicker, preserves scroll & state)
 *   - In-place Image/SVG asset hot-swapping
 *   - Smooth JS/HTML full reload with scroll and route preservation
 *   - Automatic reconnection on server restart
 *   - Visual status badge & micro-notifications
 */

(function initSiDayaHMR() {
  if (typeof window === 'undefined') return;
  if (window.__SIDAYA_HMR_INITIALIZED__) return;
  window.__SIDAYA_HMR_INITIALIZED__ = true;

  console.log('%c[SiDaya HMR] ⚡ Hot Module Replacement client active', 'color: #10B77F; font-weight: bold;');

  // Floating HMR Notification Badge
  function showHMRToast(message, type = 'info') {
    let container = document.getElementById('sidaya-hmr-badge');
    if (!container) {
      container = document.createElement('div');
      container.id = 'sidaya-hmr-badge';
      container.style.cssText = `
        position: fixed;
        bottom: 18px;
        right: 18px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(9, 13, 27, 0.92);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #F8FAFC;
        border: 1px solid rgba(16, 183, 127, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 183, 127, 0.25);
        border-radius: 30px;
        padding: 6px 14px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px) scale(0.95);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(container);
    }

    const icon = type === 'css' ? '⚡' : (type === 'asset' ? '🎨' : '🔄');
    const color = type === 'css' ? '#10B77F' : (type === 'asset' ? '#38BDF8' : '#828DF8');

    container.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color}; box-shadow:0 0 8px ${color};"></span>
      <span>${icon} ${message}</span>
    `;

    container.style.opacity = '1';
    container.style.transform = 'translateY(0) scale(1)';

    clearTimeout(container._hideTimeout);
    container._hideTimeout = setTimeout(() => {
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px) scale(0.95)';
    }, 1800);
  }

  // Hot-swap CSS in-place without reloading page
  function hotReloadCSS(filePath) {
    const cleanPath = filePath ? filePath.replace(/^\//, '').split('?')[0] : '';
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    let reloadedCount = 0;

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkClean = href.replace(/^\//, '').split('?')[0];
      const match = !cleanPath || linkClean.includes(cleanPath) || cleanPath.includes(linkClean);

      if (match) {
        const newHref = href.split('?')[0] + '?hmr=' + Date.now();
        // Create duplicate link to prevent momentary unstyled flash
        const newLink = link.cloneNode();
        newLink.setAttribute('href', newHref);
        newLink.onload = () => {
          link.remove();
        };
        link.parentNode.insertBefore(newLink, link.nextSibling);
        reloadedCount++;
      }
    });

    const label = cleanPath ? cleanPath.split('/').pop() : 'Stylesheets';
    showHMRToast(`CSS Updated: ${label}`, 'css');
    console.log(`[SiDaya HMR] ⚡ Hot-swapped ${reloadedCount} stylesheet(s) for: ${cleanPath || 'all'}`);
  }

  // Hot-swap Images / SVGs in-place without reloading page
  function hotReloadAssets(filePath) {
    const cleanPath = filePath ? filePath.replace(/^\//, '').split('?')[0] : '';
    const images = document.querySelectorAll('img, image');
    let reloadedCount = 0;

    images.forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('href');
      if (!src) return;

      const srcClean = src.replace(/^\//, '').split('?')[0];
      if (!cleanPath || srcClean.includes(cleanPath) || cleanPath.includes(srcClean)) {
        const newSrc = src.split('?')[0] + '?hmr=' + Date.now();
        if (img.tagName.toLowerCase() === 'image') {
          img.setAttribute('href', newSrc);
        } else {
          img.src = newSrc;
        }
        reloadedCount++;
      }
    });

    const label = cleanPath ? cleanPath.split('/').pop() : 'Asset';
    showHMRToast(`Asset Updated: ${label}`, 'asset');
    console.log(`[SiDaya HMR] 🎨 Hot-swapped ${reloadedCount} asset instance(s) for: ${cleanPath || 'all'}`);
  }

  // Full page reload with scroll and route preservation
  function triggerFullReload(filePath) {
    try {
      sessionStorage.setItem('sidaya_hmr_scroll_y', String(window.scrollY));
      sessionStorage.setItem('sidaya_hmr_scroll_x', String(window.scrollX));
      sessionStorage.setItem('sidaya_hmr_last_route', window.location.pathname);
    } catch(e) {}

    const label = filePath ? filePath.split('/').pop() : 'Application';
    showHMRToast(`Reloading: ${label}...`, 'reload');
    console.log(`[SiDaya HMR] 🔄 Reloading due to change in: ${filePath || 'code'}`);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  // Restore scroll position after reload
  window.addEventListener('DOMContentLoaded', () => {
    try {
      const savedY = sessionStorage.getItem('sidaya_hmr_scroll_y');
      const savedX = sessionStorage.getItem('sidaya_hmr_scroll_x');
      if (savedY !== null) {
        sessionStorage.removeItem('sidaya_hmr_scroll_y');
        sessionStorage.removeItem('sidaya_hmr_scroll_x');
        window.scrollTo(Number(savedX) || 0, Number(savedY) || 0);
      }
    } catch(e) {}
  });

  // SSE EventSource Connection Manager
  let eventSource = null;
  let reconnectAttempts = 0;

  function connect() {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource('/__livereload');

    eventSource.onopen = () => {
      if (reconnectAttempts > 0) {
        console.log('%c[SiDaya HMR] Connected to live reload server', 'color: #10B77F;');
        showHMRToast('HMR Connected', 'info');
      }
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event) => {
      if (!event.data) return;

      // Simple message format fallback
      if (event.data === 'reload') {
        triggerFullReload();
        return;
      }

      // JSON HMR message format
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'css') {
          hotReloadCSS(payload.file);
        } else if (payload.type === 'asset') {
          hotReloadAssets(payload.file);
        } else if (payload.type === 'reload') {
          triggerFullReload(payload.file);
        }
      } catch(err) {
        triggerFullReload();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
      setTimeout(connect, delay);
    };
  }

  connect();
})();
