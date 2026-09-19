/**
 * @file daya.controller.js
 * @description Controller & Context-Aware Reasoning Engine for Daya AI
 * @module Controller:DayaAI
 */

const DayaController = {
  isOpen: false,
  activePath: '/',
  isTyping: false,
  messages: [],

  /**
   * Initializes Daya AI controller and seeds initial welcome prompt
   */
  init() {
    this.activePath = (typeof window !== 'undefined' ? window.location.pathname : '/');
    const state = (typeof store !== 'undefined') ? store.getState() : null;
    const ownerName = state?.auth?.merchantUser?.name || 'Juragan';
    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (this.messages.length === 0) {
      this.messages.push({
        id: 'msg_welcome',
        sender: 'daya',
        text: `Halo, **${ownerName}**! 👋\nSaya **Daya**, personal AI co-pilot untuk operasional tokomu. Saya memantau data **omset**, alokasi **lot FIFO**, limit **kasbon piutang**, dan **stok gudang** secara realtime.\n\nKetik pertanyaan atau klik salah satu topik saran di bawah ini ya!`,
        time: timeNow
      });
    }

    this.render();
  },

  /**
   * Renders widget into dynamic mounting root #daya-root
   */
  render() {
    const root = document.getElementById('daya-root');
    if (!root || typeof DayaView === 'undefined') return;

    const state = (typeof store !== 'undefined') ? store.getState() : null;
    root.innerHTML = DayaView.renderWidget({
      isOpen: this.isOpen,
      activePath: this.activePath,
      messages: this.messages,
      isTyping: this.isTyping,
      state
    });

    this.scrollToBottom();
  },

  /**
   * Smoothly scrolls message stream to newest message
   */
  scrollToBottom() {
    requestAnimationFrame(() => {
      const stream = document.getElementById('daya-messages-stream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    });
  },

  /**
   * Toggles drawer open/close
   */
  toggleChat() {
    this.isOpen = !this.isOpen;
    this.render();
    if (this.isOpen) {
      setTimeout(() => {
        const input = document.getElementById('daya-chat-input');
        if (input) input.focus();
      }, 100);
    }
  },

  /**
   * Clears conversational history back to initial welcome
   */
  clearChat() {
    this.messages = [];
    this.init();
    if (typeof showToast === 'function') showToast('Percakapan Daya AI diatur ulang.');
  },

  /**
   * Synchronizes active operational context when SPA route changes
   * @param {string} newPath - Navigated pathname
   */
  onRouteChanged(newPath) {
    this.activePath = newPath || '/';
    
    // If panel is already rendered in DOM, update context ribbon and chips seamlessly
    const contextText = document.getElementById('daya-context-text');
    const contextRoute = document.getElementById('daya-context-route');
    const chipsContainer = document.getElementById('daya-quick-chips');

    if (contextText && typeof DayaView !== 'undefined') {
      contextText.textContent = DayaView.getContextTitle(this.activePath);
    }
    if (contextRoute) {
      contextRoute.textContent = '/' + (this.activePath || '').replace(/^\/+|\/+$/g, '');
    }
    if (chipsContainer && typeof DayaView !== 'undefined') {
      const suggestions = DayaView.getContextSuggestions(this.activePath);
      chipsContainer.innerHTML = suggestions.map((s) => `
        <button class="daya-chip-btn" onclick="sendDayaPrompt('${s.replace(/'/g, "\\'")}')">
          ${s}
        </button>
      `).join('');
    }
  },

  /**
   * Sends user message and triggers reasoning process
   * @param {string} rawText
   */
  async sendMessage(rawText) {
    const input = document.getElementById('daya-chat-input');
    const text = (rawText || (input ? input.value : '')).trim();
    if (!text) return;

    if (input) input.value = '';

    const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    this.messages.push({
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      time: timeNow
    });

    this.isTyping = true;
    this.render();

    // Simulate realistic AI reasoning & live store analysis latency
    setTimeout(() => {
      const responseText = this.analyzeAndRespond(text);
      const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      this.messages.push({
        id: 'daya_' + Date.now(),
        sender: 'daya',
        text: responseText,
        time: replyTime
      });

      this.isTyping = false;
      this.render();
    }, 650);
  },

  /**
   * Context-aware heuristic reasoning engine analyzing live store data
   * @param {string} q - User query
   * @returns {string} Response in natural Indonesian
   */
  analyzeAndRespond(q) {
    const query = q.toLowerCase();
    const state = (typeof store !== 'undefined') ? store.getState() : null;
    const p1 = state?.pilar1 || {};
    const p3 = state?.pilar3 || {};
    const p4 = state?.pilar4 || {};
    const p5 = state?.pilar5 || {};

    // 1. Omset & Profit Margin Analysis
    if (query.includes('omset') || query.includes('margin') || query.includes('laba') || query.includes('penjualan')) {
      const omsetStr = p1.omsetToday ? 'Rp ' + Number(p1.omsetToday).toLocaleString('id-ID') : 'Rp 42.850.000';
      const marginNom = p1.grossMarginNominal ? 'Rp ' + Number(p1.grossMarginNominal).toLocaleString('id-ID') : 'Rp 5.484.800';
      const marginPct = p1.grossMarginPercent || 12.8;
      const cashMix = p1.cashMixPercent || 65;
      return `📊 **Analisis Kinerja Keuangan Hari Ini:**\n\n• **Total Omset**: \`${omsetStr}\`\n• **Laba Kotor (Gross Margin)**: \`${marginNom}\` (*${marginPct}%*)\n• **Komposisi Tunai**: \`${cashMix}%\` (Sedangkan *${100 - cashMix}%* tempo kasbon/QRIS)\n\n💡 *Rekomendasi Daya*: Margin berada di rentang sehat untuk grosir sembako (> 10%). Pantau sisa kasbon tempo agar perputaran modal kerja tetap lancar.`;
    }

    // 2. FIFO Batch & Inbound Lot Rotation
    if (query.includes('fifo') || query.includes('lot') || query.includes('kedaluwarsa') || query.includes('kadaluwarsa') || query.includes('gudang')) {
      const batches = p3.inboundBatches || [];
      if (batches.length > 0) {
        const oldest = batches[0];
        return `📦 **Pemeriksaan Rotasi Lot FIFO:**\n\nBerdasarkan prinsip *First-In, First-Out*, lot yang **harus dikeluarkan duluan** adalah:\n\n• **Nomor Lot**: \`${oldest.lotNumber || 'LOT-20260901-01'}\`\n• **Produk**: *${oldest.productName || 'Beras Ramos Super 25kg'}*\n• **Sisa Stok**: \`${oldest.remainingStock || 120} karung\`\n• **Tanggal Masuk**: ${oldest.receivedDate || '01 Sep 2026'}\n\n⚠️ *Peringatan*: Pastikan supir dan staf gudang memprioritaskan tumpukan rak sisi timur sebelum membuka lot kiriman baru!`;
      }
      return `📦 **Pemeriksaan Lot FIFO**: Seluruh batch inbound dalam kondisi aman. Prioritaskan pengeluaran stok dengan tanggal penerimaan tertua untuk memproteksi kesegaran komoditas.`;
    }

    // 3. Piutang, Kasbon & Customer Credit Limits
    if (query.includes('piutang') || query.includes('kasbon') || query.includes('tagih') || query.includes('tempo') || query.includes('debit')) {
      const totalP = p1.totalPiutangOutstanding ? 'Rp ' + Number(p1.totalPiutangOutstanding).toLocaleString('id-ID') : 'Rp 11.925.000';
      const customers = p4.customers || [];
      const topDebtor = customers.length > 0 
        ? customers.reduce((prev, curr) => (curr.totalPiutang > prev.totalPiutang ? curr : prev), customers[0])
        : { name: 'Toko Sinar Terang', totalPiutang: 4200000, creditLimit: 10000000 };

      return `💳 **Audit Buku Piutang & Kasbon:**\n\n• **Total Piutang Berjalan**: \`${totalP}\`\n• **Pelanggan dengan Saldo Terbesar**: *${topDebtor.name}*\n  ↳ Kasbon: \`Rp ${Number(topDebtor.totalPiutang || 4200000).toLocaleString('id-ID')}\` (Limit: Rp ${Number(topDebtor.creditLimit || 10000000).toLocaleString('id-ID')})\n\n💡 *Saran Penagihan*: Anda bisa menekan tombol **Kirim PayLink WA** di menu Buku Piutang untuk penagihan otomatis berfitur QRIS instan.`;
    }

    // 4. Draft WhatsApp Reminder Template
    if (query.includes('wa') || query.includes('whatsapp') || query.includes('draft') || query.includes('pesan')) {
      const tenantName = state?.auth?.merchantUser?.tenant || 'Toko Grosir Beras Jaya';
      const payBase = (typeof getSubdomainUrl === 'function') ? getSubdomainUrl('pay') : 'https://pay.sidaya.biz.id';
      return `📱 **Draft Pengingat Tagihan WhatsApp:**\n\n\`\`\`\nSalam hangat dari ${tenantName}.\n\nYth. Bpk/Ibu Toko Pelanggan,\nKami mengingatkan faktur tagihan belanja beras Anda sebesar Rp 4.200.000 telah mendekati jatuh tempo.\n\nPembayaran praktis via QRIS/VA dapat diakses di:\n${payBase}/p/INV-9284\n\nTerima kasih atas kerja samanya! 🙏\n\`\`\`\n\nSalin pesan di atas dan kirimkan langsung via WhatsApp Web!`;
    }

    // 5. POS & Stock Availability
    if (query.includes('stok') || query.includes('pos') || query.includes('sku') || query.includes('produk') || query.includes('pandan')) {
      const products = p5.products || [];
      const p = products.find((prod) => prod.name.toLowerCase().includes('pandan')) || products[0] || { name: 'Beras Pandan Wangi Cianjur 25kg', stock: 180, price: 345000 };
      return `🌾 **Informasi Master SKU & Stok:**\n\n• **Nama Barang**: *${p.name}*\n• **Stok Tersedia**: \`${p.stock || 180} karung\`\n• **Harga Grosir Tier 1**: \`Rp ${Number(p.price || 345000).toLocaleString('id-ID')}\`\n• **Status**: \`STOK AMAN (Tersedia untuk kasir POS & order muatan)\``;
    }

    // 6. Active Screen Context Fallback
    const contextTitle = DayaView.getContextTitle(this.activePath);
    return `✨ Saya memahami Anda sedang membuka **${contextTitle}** (\`${this.activePath}\`).\n\nSaya dapat menganalisis data keuangan, stok FIFO gudang, tagihan kasbon pelanggan, atau membuatkan draft penagihan WhatsApp. Silakan pilih salah satu topik di bawah atau tanyakan data spesifik tokomu!`;
  },

  /**
   * Future Extensibility Hook: Connects to Cloud LLM RAG endpoint with pgvector & Graphiti
   * @param {string} prompt
   * @param {Object} tenantContext
   */
  async callBackendAI(prompt, tenantContext) {
    // Stub ready for Phase 4 backend endpoint:
    // return fetch('/api/v1/ai/chat', { method: 'POST', body: JSON.stringify({ prompt, tenantContext }) });
    return this.analyzeAndRespond(prompt);
  }
};

// Global bindings for inline HTML onclick handlers
function toggleDayaChat() { DayaController.toggleChat(); }
function clearDayaChat() { DayaController.clearChat(); }
function sendDayaMessage() { DayaController.sendMessage(); }
function sendDayaPrompt(text) { DayaController.sendMessage(text); }
function handleDayaInputKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    DayaController.sendMessage();
  }
}
