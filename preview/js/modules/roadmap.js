/**
 * ==========================================================================
 * ROADMAP / COMING SOON MODULE VIEWER
 * ==========================================================================
 */
function renderComingSoonModule(key, isOps) {
  const meta = ROADMAP_METADATA[key] || {
    icon: '🚀',
    phase: 'ROADMAP FEATURE',
    title: 'Modul Segera Hadir',
    desc: 'Fitur ini sedang dalam perencanaan roadmap eksekusi.',
    features: []
  };

  const prefix = isOps ? 'op-cs' : 'cs';
  const iconEl = document.getElementById(`${prefix}-icon`);
  const phaseEl = document.getElementById(`${prefix}-phase-tag`);
  const titleEl = document.getElementById(`${prefix}-title`);
  const descEl = document.getElementById(`${prefix}-desc`);
  const gridEl = document.getElementById(`${prefix}-features-grid`);

  if (iconEl) iconEl.textContent = meta.icon;
  if (phaseEl) phaseEl.textContent = meta.phase;
  if (titleEl) titleEl.textContent = meta.title;
  if (descEl) descEl.textContent = meta.desc;

  if (gridEl) {
    gridEl.innerHTML = (meta.features || []).map(f => `
      <div class="coming-soon-feature-item">
        <div class="coming-soon-feature-icon">${f.icon}</div>
        <div>
          <div class="coming-soon-feature-title">${f.title}</div>
          <div class="coming-soon-feature-desc">${f.desc}</div>
        </div>
      </div>
    `).join('');
  }

  const headingEl = isOps ? document.getElementById('op-header-title') : document.getElementById('page-heading');
  const subEl = isOps ? document.getElementById('op-header-sub') : document.getElementById('page-subheading');
  if (headingEl) headingEl.textContent = `${meta.icon} ${meta.title}`;
  if (subEl) subEl.textContent = meta.phase;
}

function handleBetaRegistration() {
  showToast('🎉 Minat Early Access dicatat! Kami akan mengirimkan notifikasi saat versi Beta siap.', 'success');
}
