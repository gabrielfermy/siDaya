/**
 * @file onboarding.view.js
 * @description Floating UI Component & Renderer for Interactive Onboarding Tours
 * @module Onboarding:View
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const OnboardingView = {
  /**
   * Renders or updates the floating tour bubble card in DOM
   * @param {Object} step - Current step configuration
   * @param {number} currentIndex - 0-indexed step number
   * @param {number} totalSteps - Total steps in active sequence
   * @param {boolean} isSimulation - True if in operator preview mode
   */
  renderCard(step, currentIndex, totalSteps, isSimulation = false) {
    let container = document.getElementById('onboarding-tour-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'onboarding-tour-root';
      document.body.appendChild(container);
    }

    const progressPct = Math.round(((currentIndex + 1) / totalSteps) * 100);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalSteps - 1;

    const html = `
      <div class="onboarding-bubble-card animate-scale-in" role="dialog" aria-modal="true" aria-labelledby="tour-step-title">
        <!-- Card Topbar: Header, Progress & Close -->
        <div class="onboarding-header">
          <div class="flex items-center gap-2">
            <span class="text-xl">${step.icon || '📌'}</span>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                ${step.moduleTitle || 'Panduan SiDaya'} ${isSimulation ? '<span class="text-amber-400 font-bold">(Simulasi)</span>' : ''}
              </span>
              <div class="text-xs text-slate-400 font-medium">Langkah ${currentIndex + 1} dari ${totalSteps}</div>
            </div>
          </div>
          <button type="button" class="onboarding-close-btn" onclick="OnboardingView.handleSkipClick()" title="Tutup / Lewati">
            ✕
          </button>
        </div>

        <!-- Linear Progress Meter -->
        <div class="onboarding-progress-track">
          <div class="onboarding-progress-bar" style="width: ${progressPct}%"></div>
        </div>

        <!-- Step Title -->
        <h3 id="tour-step-title" class="onboarding-title">
          ${step.title}
        </h3>

        <!-- 4-Part Structured Explanation Content -->
        <div class="onboarding-body custom-scrollbar">
          <!-- 1. Apa Ini -->
          <div class="onboarding-section">
            <div class="onboarding-label text-sky-400">
              <span class="mr-1">📌</span> Apa Ini
            </div>
            <p class="onboarding-text text-slate-200">
              ${step.what}
            </p>
          </div>

          <!-- 2. Mengapa Penting & Dari Mana -->
          <div class="onboarding-section">
            <div class="onboarding-label text-amber-400">
              <span class="mr-1">💡</span> Mengapa Penting & Dari Mana
            </div>
            <p class="onboarding-text text-slate-300">
              ${step.why}
            </p>
          </div>

          <!-- 3. Langkah Penggunaan & Setup (How & Where) -->
          <div class="onboarding-section">
            <div class="onboarding-label text-emerald-400">
              <span class="mr-1">🚀</span> Langkah & Lokasi Setup (How & Where)
            </div>
            <p class="onboarding-text text-slate-300">
              ${step.howWhere}
            </p>
          </div>
        </div>

        <!-- Checkbox: Jangan Tampilkan Lagi -->
        <div class="onboarding-checkbox-row">
          <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors">
            <input type="checkbox" id="onboarding-dont-show-cb" class="form-checkbox h-3.5 w-3.5 rounded text-emerald-500 bg-slate-800 border-slate-600 focus:ring-0 cursor-pointer">
            <span>Jangan tampilkan panduan ini lagi otomatis</span>
          </label>
        </div>

        <!-- Navigation Action Buttons -->
        <div class="onboarding-actions">
          <button type="button" 
                  class="btn-tour-secondary ${isFirst ? 'opacity-40 cursor-not-allowed' : ''}" 
                  onclick="OnboardingService.prevStep()" 
                  ${isFirst ? 'disabled' : ''}>
            ◀ Sebelumnya
          </button>
          
          <button type="button" 
                  class="btn-tour-skip" 
                  onclick="OnboardingView.handleSkipClick()">
            Lewati
          </button>

          <button type="button" 
                  class="btn-tour-primary" 
                  onclick="OnboardingService.nextStep()">
            ${isLast ? 'Selesai 🎉' : 'Berikutnya ▶'}
          </button>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Reads the "Jangan tampilkan lagi" checkbox state and calls skipTour
   */
  handleSkipClick() {
    const cb = document.getElementById('onboarding-dont-show-cb');
    const dontShow = cb ? cb.checked : false;
    if (typeof OnboardingService !== 'undefined') {
      OnboardingService.skipTour(dontShow);
    }
  },

  /**
   * Removes card from DOM
   */
  removeCard() {
    const container = document.getElementById('onboarding-tour-root');
    if (container) {
      container.innerHTML = '';
    }
  }
};

if (typeof window !== 'undefined') {
  window.OnboardingView = OnboardingView;
}
