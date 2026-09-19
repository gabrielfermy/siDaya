/**
 * ==========================================================================
 * PILAR 09: PENGATURAN TOKO, HARDWARE & REKENING
 * ==========================================================================
 */
function renderSettingsView(state) {
  const mUser = state.auth.merchantUser;
  if (!mUser) return;
  const bizNameEl = document.getElementById('set-biz-name');
  if (bizNameEl && mUser.tenant) {
    bizNameEl.textContent = mUser.tenant;
  }
}
