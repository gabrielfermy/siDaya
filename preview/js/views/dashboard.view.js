/**
 * Dashboard View (Pilar 01): Quick Launch Shortcuts, Financial Metrics, Cash Mix & Recent Sales
 */
const DashboardView = {
  render(state) {
    const s = state?.pilar1 || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar1 : {});
    const omsetToday = s.omsetToday || 0;
    const grossMarginPercent = s.grossMarginPercent || 0;
    const grossMarginNominal = s.grossMarginNominal || 0;
    const totalPiutangOutstanding = s.totalPiutangOutstanding || 0;
    const cashMixPercent = s.cashMixPercent || 0;
    const recentOrders = s.recentOrders || [];
    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">Executive Dashboard</h1>
          <p class="view-subtitle">Ringkasan real-time operasional toko, arus kas, margin laba, dan peringatan inventaris.</p>
        </div>
        <div class="view-actions">
          <button class="btn btn-outline" onclick="exportExecutiveReport()">📥 Unduh Rekap CSV</button>
          <button class="btn btn-primary" onclick="navigate('/pos')">🛒 Buka Kasir POS</button>
        </div>
      </div>

      <!-- FLAGSHIP FEATURE SHORTCUT WIDGETS -->
      <div class="shortcut-banner">
        <div class="shortcut-title">⚡ Pintasan Cepat Fitur Unggulan (Quick Launch)</div>
        <div class="shortcut-grid">
          <div class="shortcut-card" onclick="navigate('/pos')">
            <div class="shortcut-card-icon">🛒</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Kasir POS Grosir</div>
              <div class="shortcut-card-desc">Fast-scan barcode, kasbon limit & cetak struk</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/fifo')">
            <div class="shortcut-card-icon">📦</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Inbound Lot FIFO</div>
              <div class="shortcut-card-desc">Audit batch masuk & simulator alokasi HPP</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/customers')">
            <div class="shortcut-card-icon">👥</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">CRM & Limit Piutang</div>
              <div class="shortcut-card-desc">Profil pelanggan, plafon kasbon & riwayat</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/invoices')">
            <div class="shortcut-card-icon">🧾</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Faktur & Penjualan</div>
              <div class="shortcut-card-desc">Histori transaksi, status bayar & cetak ulang</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/sj')">
            <div class="shortcut-card-icon">🚚</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Surat Jalan (POD)</div>
              <div class="shortcut-card-desc">Logistik, manifest kirim & TTD digital supir</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/piutang')">
            <div class="shortcut-card-icon">💬</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Buku Piutang & WA</div>
              <div class="shortcut-card-desc">Aging kasbon & kirim PayLink QRIS via WhatsApp</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/roles')">
            <div class="shortcut-card-icon">🛡️</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Matriks RBAC</div>
              <div class="shortcut-card-desc">18 capability keys granular 5 peran kerja</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>

          <div class="shortcut-card" onclick="navigate('/katalog')">
            <div class="shortcut-card-icon">🏷️</div>
            <div class="shortcut-card-body">
              <div class="shortcut-card-title">Master SKU & Harga</div>
              <div class="shortcut-card-desc">Katalog grosir bertingkat, barcode & COGS</div>
            </div>
            <span class="shortcut-arrow">→</span>
          </div>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Omset Hari Ini (GMV)</span>
            <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-value" id="dashboard-omset-today">${formatRupiah(omsetToday)}</div>
          <div class="kpi-subtext positive">▲ +14.2% dibanding kemarin</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Gross Margin Real-Time</span>
            <span class="kpi-icon">📈</span>
          </div>
          <div class="kpi-value" id="dashboard-gross-margin">${grossMarginPercent}%</div>
          <div class="kpi-subtext">Laba Kotor: <strong>${formatRupiah(grossMarginNominal)}</strong></div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Piutang Berjalan</span>
            <span class="kpi-icon">⏳</span>
          </div>
          <div class="kpi-value warning" id="dashboard-total-piutang">${formatRupiah(totalPiutangOutstanding)}</div>
          <div class="kpi-subtext">Dari 8 pelanggan kredit aktif</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Komposisi Kas Masuk</span>
            <span class="kpi-icon">💳</span>
          </div>
          <div class="kpi-value" id="dashboard-cash-mix">${cashMixPercent}% Tunai</div>
          <div class="kpi-subtext">${100 - cashMixPercent}% PayLink QRIS & Transfer</div>
        </div>
      </div>

      <!-- CASH MIX & FIFO NOTIFICATION -->
      <div class="dashboard-grid-2col" style="margin-top:16px;">
        <div class="card">
          <div class="card-title">💳 Bauran Arus Kas Masuk (Hari Ini)</div>
          <div style="display:flex; height:20px; border-radius:10px; overflow:hidden; margin:16px 0 12px 0;">
            <div style="width:${cashMixPercent}%; background:var(--accent-green);" title="Tunai ${cashMixPercent}%"></div>
            <div style="width:${100 - cashMixPercent}%; background:var(--primary);" title="Non-Tunai ${100 - cashMixPercent}%"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary);">
            <span>💵 Kas Tunai: <strong>${formatRupiah(omsetToday * (cashMixPercent / 100))}</strong> (${cashMixPercent}%)</span>
            <span>📱 PayLink & Bank: <strong>${formatRupiah(omsetToday * ((100 - cashMixPercent) / 100))}</strong> (${100 - cashMixPercent}%)</span>
          </div>
        </div>

        <div class="card" style="border-left: 4px solid var(--accent-amber);">
          <div class="card-title">⚠️ Peringatan FIFO Lot Kedaluwarsa</div>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px;">
            Ditemukan <strong>1 Batch</strong> Beras Rojolele (LOT-RJL-2026-0828) tersisa 40 Karung dengan umur simpan 14 hari lagi.
          </p>
          <div style="margin-top:14px;">
            <button class="btn btn-outline" style="font-size:0.75rem; padding:6px 12px;" onclick="navigate('/fifo')">
              📦 Alokasikan Batch Tertua Sekarang →
            </button>
          </div>
        </div>
      </div>

      <!-- RECENT TRANSACTIONS TABLE -->
      <div class="card" style="margin-top:16px;">
        <div class="card-title">🧾 Transaksi Kasir & Pesanan Terbaru</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Waktu</th>
              <th>Pelanggan</th>
              <th>Metode</th>
              <th>Total Nominal</th>
              <th>Status Bayar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="dashboard-recent-orders">
            ${recentOrders.map(o => `
              <tr>
                <td><strong>${o.orderNumber}</strong></td>
                <td>${o.time}</td>
                <td>${o.customer}</td>
                <td><span class="badge-tag">${o.method}</span></td>
                <td><strong>${formatRupiah(o.total)}</strong></td>
                <td><span class="tier-badge ${o.status === 'PAID' ? 'tier-grosir-pro' : 'tier-starter-free'}">${o.status}</span></td>
                <td>
                  <button class="btn btn-outline" style="padding:4px 8px; font-size:0.75rem;" onclick="viewReceipt('${o.orderNumber}')">
                    Cetak Struk
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },
};
