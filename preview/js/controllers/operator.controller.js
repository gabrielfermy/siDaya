/**
 * Operator Controller: Fleet management, tenant lifecycle status, and break-glass diagnostics
 */
const OperatorController = {
  toggleStatus(tenantId) {
    store.dispatch('OPERATOR_TOGGLE_TENANT_STATUS', { tenantId });
    showToast('Status siklus hidup tenant berhasil diperbarui.');
    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/telemetry')) {
      container.innerHTML = OperatorView.render(store.getState());
    }
  },

  openBreakglassModal() {
    openModal('modal-breakglass');
  },

  executeBreakglass() {
    const ticketId = document.getElementById('bg-ticket-id').value;
    const reason = document.getElementById('bg-reason').value;

    if (!ticketId || !reason) {
      showToast('Nomor tiket dan alasan diagnosa wajib diisi.', 'warning');
      return;
    }

    closeModal();
    showToast(`🚨 Sesi Break-Glass aktif untuk tiket ${ticketId}. Audit log dicatat.`);
    alert(`[Break-Glass Audit Log Created]\nTiket: ${ticketId}\nOperator: Gabriel (SUPER_ADMIN)\nAlasan: ${reason}\nScope: FULL_READ_ONLY_UNMASKED`);
  },
};

function toggleTenantStatus(id) { OperatorController.toggleStatus(id); }
function openBreakglassModal() { OperatorController.openBreakglassModal(); }
function executeBreakglass() { OperatorController.executeBreakglass(); }
