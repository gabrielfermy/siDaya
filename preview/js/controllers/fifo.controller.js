/**
 * FIFO Controller: Inbound lot tracking and interactive simulator
 */
const FifoController = {
  openReceiveInboundModal() {
    const state = store.getState();
    const products = state?.pilar2?.products || [];
    const select = document.getElementById('inbound-product-select');
    if (select) {
      if (products.length === 0) {
        select.innerHTML = '<option value="" disabled selected>-- Belum Ada Produk Master SKU (Buat di Katalog) --</option>';
      } else {
        select.innerHTML = products.map(p => `<option value="${p.sku}" data-name="${p.name}" data-unit="${p.unit}" data-cogs="${p.cogs}">${p.name} (${p.sku}) - Satuan: ${p.unit}</option>`).join('');
      }
    }
    const lotInput = document.getElementById('inbound-lot-number');
    if (lotInput && !lotInput.value) {
      lotInput.value = 'LOT-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    }
    const dateInput = document.getElementById('inbound-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    openModal('modal-receive-inbound');
  },

  handleReceiveInboundSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    const state = store.getState();
    const products = state?.pilar2?.products || [];
    const select = document.getElementById('inbound-product-select');
    const lotNumber = document.getElementById('inbound-lot-number')?.value?.trim();
    const binLabel = document.getElementById('inbound-bin-label')?.value?.trim() || 'GUDANG-A / RAK-01';
    const initialQty = parseInt(document.getElementById('inbound-qty')?.value, 10) || 0;
    const cogsUnit = parseInt(document.getElementById('inbound-cogs')?.value, 10) || 0;
    const receivedDate = document.getElementById('inbound-date')?.value?.trim() || new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    if (!lotNumber || initialQty <= 0) {
      showToast('Harap isi nomor lot dan kuantitas masuk yang valid.', 'warning');
      return;
    }

    const sku = select?.value;
    const prod = products.find(p => p.sku === sku);
    const productName = prod ? prod.name : (select?.options[select?.selectedIndex]?.text || 'Komoditas Grosir');

    const newBatch = {
      id: 'b_' + Date.now(),
      lotNumber,
      sku: sku || 'SKU-INB',
      productName,
      binLabel,
      receivedDate,
      cogsUnit: cogsUnit || prod?.cogs || 0,
      initialQty,
      remainingQty: initialQty,
      status: 'ACTIVE',
    };

    store.dispatch('FIFO_RECEIVE_INBOUND', newBatch);
    closeModal();
    showToast(`✅ Muatan masuk ${lotNumber} (${initialQty} unit) berhasil dicatat.`);

    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/fifo')) {
      container.innerHTML = FifoView.render(store.getState());
    }
  },

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
    const batches = state?.pilar2?.batches || [];

    if (batches.length === 0) {
      resultDiv.innerHTML = `
        <div style="background:var(--bg-card); padding:12px; border-radius:8px; border:1px dashed var(--border-subtle); text-align:center; color:var(--text-muted); font-size:12px;">
          ⚠️ Belum ada lot batch yang tersedia untuk dialokasikan. Catat lot masuk terlebih dahulu.
        </div>
      `;
      return;
    }

    let remainingNeeded = requestedQty;
    const allocations = [];

    for (const b of batches) {
      if (remainingNeeded <= 0) break;
      if (b.remainingQty <= 0) continue;
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
          📊 Hasil Alokasi Algoritma FIFO (${totalAllocated} Unit):
        </div>
        ${allocations.map((a, i) => `
          <div style="font-size:0.8rem; margin-bottom:4px; display:flex; justify-content:space-between;">
            <span>${i + 1}. <strong>${a.lotNumber}</strong> (${a.binLabel}) - <strong>${a.allocatedQty} Unit</strong> @ ${formatRupiah(a.cogs)}</span>
            <span>${formatRupiah(a.subtotalCogs)}</span>
          </div>
        `).join('')}
        <hr style="border:none; border-top:1px dashed var(--border-subtle); margin:8px 0;" />
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:800;">
          <span>Total HPP Terhitung:</span>
          <span>${formatRupiah(totalCogs)} (Rata-rata: ${formatRupiah(avgCogsPerUnit)}/Unit)</span>
        </div>
      </div>
    `;

    showToast(`Simulasi FIFO selesai: ${allocations.length} batch teralokasi.`);
  },
};

function runFifoSimulation() { FifoController.runSimulation(); }
function openReceiveInboundModal() { FifoController.openReceiveInboundModal(); }

