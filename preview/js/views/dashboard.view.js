const DashboardView = {
  render(state) {
    const s = state?.pilar1 || (typeof INITIAL_DEFAULT_STATE !== 'undefined' ? INITIAL_DEFAULT_STATE.pilar1 : {});
    const omsetToday = s.omsetToday || 0;
    const grossMarginPercent = s.grossMarginPercent || 0;
    const grossMarginNominal = s.grossMarginNominal || 0;
    const totalPiutangOutstanding = s.totalPiutangOutstanding || 0;
    const cashMixPercent = s.cashMixPercent || 100;
    const recentOrders = s.recentOrders || [];

    const products = state?.pilar2?.products || [];
    const batches = state?.pilar2?.batches || [];
    const customers = state?.pilar3?.customers || [];
    const bankConfigured = !!(state?.pilar9?.settings?.businessProfile?.bankAccount?.accountNumber);

    // Calculate setup completeness
    const setupSteps = [
      { key: 'products', title: 'Master SKU & Komoditas', done: products.length > 0, count: `${products.length} SKU`, cta: 'Buka Master SKU', action: "navigate('/katalog')" },
      { key: 'batches', title: 'Inbound Batch FIFO', done: batches.length > 0, count: `${batches.length} Lot`, cta: 'Catat Lot Masuk', action: "openReceiveInboundModal()" },
      { key: 'customers', title: 'Direktori Pelanggan CRM', done: customers.length > 0, count: `${customers.length} Mitra`, cta: 'Tambah Pelanggan', action: "openAddCustomerModal()" },
      { key: 'bank', title: 'Rekening Bank & Profil Usaha', done: bankConfigured, count: bankConfigured ? 'Terkonfigurasi' : 'Belum Diisi', cta: 'Lengkapi Profil', action: "navigate('/settings')" },
    ];
    const completedCount = setupSteps.filter(st => st.done).length;
    const isSetupComplete = completedCount === setupSteps.length;
    const setupPercent = Math.round((completedCount / setupSteps.length) * 100);

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

      <!-- SYSTEM SETUP & ONBOARDING CHECKLIST (Shown until all 4 core components configured) -->
      ${!isSetupComplete ? `
        <div id="tour-dashboard-checklist" class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary); background: linear-gradient(135deg, rgba(79, 70, 229, 0.04) 0%, rgba(99, 102, 241, 0.02) 100%);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:1.2rem;">🚀</span>
                <span class="card-title" style="margin:0;">Panduan Penyiapan Sistem Toko (Setup Checklist)</span>
                <span class="badge ${setupPercent >= 50 ? 'badge-primary' : 'badge-warning'}" style="font-size:11px;">${setupPercent}% Siap</span>
              </div>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
                Lengkapi komponen operasional di bawah agar seluruh modul kasir, FIFO, dan faktur berfungsi optimal.
              </p>
            </div>
            <div style="min-width:140px;">
              <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px; color:var(--text-primary);">
                <span>Progress: ${completedCount}/${setupSteps.length}</span>
                <span>${setupPercent}%</span>
              </div>
              <div style="height:6px; background:var(--border-subtle); border-radius:3px; overflow:hidden;">
                <div style="width:${setupPercent}%; height:100%; background:var(--primary); transition: width 0.3s ease;"></div>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:10px; margin-top:10px;">
            ${setupSteps.map(step => `
              <div style="background:var(--bg-surface); border:1px solid ${step.done ? 'var(--border-subtle)' : 'rgba(79, 70, 229, 0.3)'}; border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-size:0.8rem; font-weight:700; color:${step.done ? 'var(--text-primary)' : 'var(--primary)'}; display:flex; align-items:center; gap:6px;">
                    <span>${step.done ? '✅' : '⏳'}</span>
                    <span>${step.title}</span>
                  </div>
                  <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
                    ${step.done ? `Terisi: ${step.count}` : '⚠️ Belum dikonfigurasi'}
                  </div>
                </div>
                <button class="btn ${step.done ? 'btn-outline' : 'btn-primary'}" style="font-size:0.7rem; padding:4px 8px;" onclick="${step.action}">
                  ${step.done ? 'Kelola' : step.cta}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

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
        <div id="tour-kpi-omset" class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Omset Hari Ini (GMV)</span>
            <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-value" id="dashboard-omset-today">${formatRupiah(omsetToday)}</div>
          <div class="kpi-subtext ${omsetToday > 0 ? 'positive' : ''}">
            ${omsetToday > 0 ? '▲ Arus kas transaksi hari ini' : 'Belum ada transaksi hari ini'}
          </div>
        </div>

        <div id="tour-kpi-margin" class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Gross Margin Real-Time</span>
            <span class="kpi-icon">📈</span>
          </div>
          <div class="kpi-value" id="dashboard-gross-margin">${grossMarginPercent}%</div>
          <div class="kpi-subtext">Laba Kotor: <strong>${formatRupiah(grossMarginNominal)}</strong></div>
        </div>

        <div id="tour-kpi-piutang" class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Piutang Berjalan</span>
            <span class="kpi-icon">⏳</span>
          </div>
          <div class="kpi-value ${totalPiutangOutstanding > 0 ? 'warning' : ''}" id="dashboard-total-piutang">${formatRupiah(totalPiutangOutstanding)}</div>
          <div class="kpi-subtext">
            ${totalPiutangOutstanding > 0 ? `Dari pelanggan kredit aktif` : 'Tidak ada piutang aktif'}
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Komposisi Kas Masuk</span>
            <span class="kpi-icon">💳</span>
          </div>
          <div class="kpi-value" id="dashboard-cash-mix">${omsetToday > 0 ? `${cashMixPercent}% Tunai` : '100% Tunai'}</div>
          <div class="kpi-subtext">
            ${omsetToday > 0 ? `${100 - cashMixPercent}% PayLink QRIS & Transfer` : 'Siap menerima transaksi'}
          </div>
        </div>
      </div>

      <!-- CASH MIX & FIFO NOTIFICATION -->
      <div class="dashboard-grid-2col" style="margin-top:16px;">
        <div class="card">
          <div class="card-title">💳 Bauran Arus Kas Masuk (Hari Ini)</div>
          ${omsetToday > 0 ? `
            <div style="display:flex; height:20px; border-radius:10px; overflow:hidden; margin:16px 0 12px 0;">
              <div style="width:${cashMixPercent}%; background:var(--accent-green);" title="Tunai ${cashMixPercent}%"></div>
              <div style="width:${100 - cashMixPercent}%; background:var(--primary);" title="Non-Tunai ${100 - cashMixPercent}%"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary);">
              <span>💵 Kas Tunai: <strong>${formatRupiah(omsetToday * (cashMixPercent / 100))}</strong> (${cashMixPercent}%)</span>
              <span>📱 PayLink & Bank: <strong>${formatRupiah(omsetToday * ((100 - cashMixPercent) / 100))}</strong> (${100 - cashMixPercent}%)</span>
            </div>
          ` : `
            <div style="padding:16px 0; text-align:center; color:var(--text-muted); font-size:0.8rem;">
              Belum ada data transaksi kasir hari ini. Selesaikan pesanan di POS untuk melihat visualisasi bauran kas masuk.
            </div>
          `}
        </div>

        <div class="card" style="border-left: 4px solid ${batches.length > 0 ? 'var(--accent-amber)' : 'var(--primary)'};">
          <div class="card-title">
            ${batches.length > 0 ? '⚠️ Monitoring FIFO Lot Inventaris' : '📦 Status Lot FIFO Gudang'}
          </div>
          ${batches.length > 0 ? `
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px;">
              Terdata <strong>${batches.length} Batch</strong> lot aktif dalam gudang toko.
            </p>
            <div style="margin-top:14px;">
              <button class="btn btn-outline" style="font-size:0.75rem; padding:6px 12px;" onclick="navigate('/fifo')">
                📦 Audit Batch FIFO Sekarang →
              </button>
            </div>
          ` : `
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px;">
              Belum ada catatan lot muatan barang masuk (Inbound). Catat penerimaan batch untuk mengaktifkan audit HPP dan peringatan kedaluwarsa otomatis.
            </p>
            <div style="margin-top:14px;">
              <button class="btn btn-primary" style="font-size:0.75rem; padding:6px 12px;" onclick="openReceiveInboundModal()">
                📥 Catat Inbound Lot Baru →
              </button>
            </div>
          `}
        </div>
      </div>

      <!-- RECENT TRANSACTIONS TABLE -->
      <div class="card" style="margin-top:16px;">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>🧾 Transaksi Kasir & Pesanan Terbaru</span>
          ${recentOrders.length > 0 ? `<span class="badge badge-outline" style="font-size:11px;">${recentOrders.length} Transaksi</span>` : ''}
        </div>
        
        ${recentOrders.length > 0 ? `
          <div class="table-scroll-hint"><span>⇄</span> Geser ke samping untuk melihat detail & aksi</div>
          <div class="table-responsive">
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
        ` : `
          <div style="padding:32px 16px; text-align:center; background:var(--bg-surface); border:1px dashed var(--border-color); border-radius:10px; margin-top:10px;">
            <div style="font-size:2rem; margin-bottom:8px;">🛒</div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-bottom:4px;">Belum Ada Transaksi Kasir Hari Ini</div>
            <p style="font-size:0.78rem; color:var(--text-secondary); max-width:420px; margin:0 auto 14px auto;">
              Buka terminal Kasir POS Grosir untuk mulai scan barcode barang, layani kasbon pelanggan, dan cetak struk thermal.
            </p>
            <button class="btn btn-primary" onclick="navigate('/pos')">
              🛒 Buka Kasir POS Sekarang
            </button>
          </div>
        `}
      </div>
    `;
  },
};

