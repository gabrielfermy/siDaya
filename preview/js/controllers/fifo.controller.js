/**
 * FIFO Controller: Inbound lot tracking and interactive simulator
 */
const FifoController = {
  runSimulation() {
    const qtyInput = document.getElementById('fifo-sim-qty');
    const resultDiv = document.getElementById('fifo-simulation-result');
    if (!qtyInput || !resultDiv) return;

    const requestedQty = parseInt(qtyInput.value, 10) || 0;
    if (requestedQty <= 0) {
      showToast('Kuantitas pesanan harus lebih dari 0.', 'warning');
      return;
    }

    const state = store.getState();
    const batches = state.pilar2.batches;

    let remainingNeeded = requestedQty;
    const allocations = [];

    for (const b of batches) {
      if (remainingNeeded <= 0) break;
      const take = Math.min(b.remainingQty, remainingNeeded);
      allocations.push({
        lotNumber: b.lotNumber,
        binLabel: b.binLabel,
        cogs: b.cogsUnit,
        allocatedQty: take,
        subtotalCogs: take * b.cogsUnit,
      });
      remainingNeeded -= take;
    }

    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedQty, 0);
    const totalCogs = allocations.reduce((sum, a) => sum + a.subtotalCogs, 0);
    const avgCogsPerUnit = totalAllocated > 0 ? Math.round(totalCogs / totalAllocated) : 0;

    resultDiv.innerHTML = `
      <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px solid var(--border-subtle);">
        <div style="font-weight:700; color:var(--text-primary); margin-bottom:8px;">
          📊 Hasil Alokasi Algoritma FIFO (${totalAllocated} Karung):
        </div>
        ${allocations.map((a, i) => `
          <div style="font-size:0.8rem; margin-bottom:4px; display:flex; justify-content:space-between;">
            <span>${i + 1}. <strong>${a.lotNumber}</strong> (${a.binLabel}) - <strong>${a.allocatedQty} Karung</strong> @ ${formatRupiah(a.cogs)}</span>
            <span>${formatRupiah(a.subtotalCogs)}</span>
          </div>
        `).join('')}
        <hr style="border:none; border-top:1px dashed var(--border-subtle); margin:8px 0;" />
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:800;">
          <span>Total HPP Terhitung:</span>
          <span>${formatRupiah(totalCogs)} (Rata-rata: ${formatRupiah(avgCogsPerUnit)}/Karung)</span>
        </div>
      </div>
    `;

    showToast(`Simulasi FIFO selesai: ${allocations.length} batch teralokasi.`);
  },
};

function runFifoSimulation() { FifoController.runSimulation(); }
