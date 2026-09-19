/**
 * @file daya.view.js
 * @description View renderer for Daya AI Floating Operational Co-Pilot Widget
 * @module View:DayaAI
 */

const DayaView = {
  /**
   * Resolves human-friendly screen titles for active operational context
   * @param {string} path - Current pathname
   * @returns {string}
   */
  getContextTitle(path) {
    const clean = '/' + (path || '').replace(/^\/+|\/+$/g, '');
    const map = {
      '/': 'Ringkasan Eksekutif (Dashboard)',
      '/dashboard': 'Ringkasan Eksekutif (Dashboard)',
      '/katalog': 'Master SKU & Harga Grosir',
      '/fifo': 'Inbound Lot FIFO & Batch Rotasi',
      '/customers': 'Direktori CRM & Limit Kredit',
      '/pos': 'Kasir POS Grosir (Terminal)',
      '/invoices': 'Faktur Penjualan & Invoice',
      '/sj': 'Surat Jalan Logistik & POD',
      '/piutang': 'Buku Piutang & WA PayLink',
      '/users': 'Direktori Staf Toko & PIN Kasir',
      '/roles': 'Matriks Hak Akses RBAC',
      '/settings': 'Pengaturan Domain & Profil Toko',
    };
    return map[clean] || 'Workspace Toko';
  },

  /**
   * Generates dynamic contextual suggestion prompt chips based on active screen
   * @param {string} path - Current pathname
   * @returns {Array<string>}
   */
  getContextSuggestions(path) {
    const clean = '/' + (path || '').replace(/^\/+|\/+$/g, '');
    switch (clean) {
      case '/':
      case '/dashboard':
        return [
          'Berapa omset & margin laba hari ini?',
          'Berapa total piutang yang belum tertagih?',
          'Siapa pelanggan dengan transaksi terbesar?'
        ];
      case '/fifo':
        return [
          'Lot beras mana yang harus keluar duluan?',
          'Berapa stok lot tertua yang tersisa?',
          'Ada lot yang mendekati kadaluwarsa?'
        ];
      case '/pos':
        return [
          'Cek stok Beras Pandan Wangi',
          'Aturan tier diskon grosir beras',
          'Ringkasan transaksi kasir hari ini'
        ];
      case '/customers':
      case '/piutang':
        return [
          'Siapa pelanggan dengan kasbon tertinggi?',
          'Pelanggan mana yang lewat jatuh tempo?',
          'Buatkan draft WhatsApp tagihan kasbon'
        ];
      case '/katalog':
        return [
          'SKU mana yang stoknya menipis?',
          'Perbandingan harga grosir vs eceran',
          'Rekomendasi restock barang laris'
        ];
      case '/invoices':
      case '/sj':
        return [
          'Berapa faktur yang statusnya belum lunas?',
          'Cek status Surat Jalan pengiriman hari ini',
          'Apakah ada pengiriman yang tertunda?'
        ];
      default:
        return [
          'Ringkas data operasional toko saat ini',
          'Berapa total kasbon dan omset berjalan?',
          'Apa saja prioritas operasional hari ini?'
        ];
    }
  },

  /**
   * Renders the complete Daya AI floating trigger and drawer markup
   * @param {Object} params
   * @param {boolean} params.isOpen
   * @param {string} params.activePath
   * @param {Array<Object>} params.messages
   * @param {boolean} params.isTyping
   * @param {Object} params.state
   * @returns {string}
   */
  renderWidget({ isOpen, activePath, messages, isTyping, state }) {
    const contextTitle = this.getContextTitle(activePath);
    const cleanPath = '/' + (activePath || '').replace(/^\/+|\/+$/g, '');
    const suggestions = this.getContextSuggestions(cleanPath);
    const tenantName = state?.auth?.merchantUser?.tenant || 'Toko Grosir Beras Jaya';

    return `
      <!-- FLOATING LAUNCHER TRIGGER -->
      <button id="daya-floating-trigger" class="daya-trigger-btn" onclick="toggleDayaChat()" title="Tanya Daya AI" aria-label="Buka Chat Daya AI">
        <span class="trigger-icon">✨</span>
        <span class="daya-trigger-pulse"></span>
        <span class="daya-trigger-label">Tanya Daya ✨</span>
      </button>

      <!-- FLOATING CHAT PANEL DRAWER -->
      <div id="daya-chat-panel" class="daya-panel ${isOpen ? 'is-open' : ''}">
        <!-- HEADER -->
        <div class="daya-header">
          <div class="daya-header-profile">
            <div class="daya-avatar">✨</div>
            <div>
              <div class="daya-title">
                Daya AI
                <span class="daya-badge-status">Online</span>
              </div>
              <div class="daya-subtitle">${tenantName}</div>
            </div>
          </div>
          <div class="daya-header-actions">
            <button class="daya-btn-icon" onclick="clearDayaChat()" title="Bersihkan Percakapan">🔄</button>
            <button class="daya-btn-icon" onclick="toggleDayaChat()" title="Tutup Panel">✕</button>
          </div>
        </div>

        <!-- CONTEXT RIBBON -->
        <div class="daya-context-ribbon">
          <div class="daya-context-badge">
            <span>📍</span>
            <span id="daya-context-text">${contextTitle}</span>
          </div>
          <span class="daya-context-route" id="daya-context-route">${cleanPath}</span>
        </div>

        <!-- MESSAGES STREAM -->
        <div class="daya-messages-stream" id="daya-messages-stream">
          ${messages.map((m) => this.renderMessageBubble(m)).join('')}
          ${isTyping ? `
            <div class="daya-msg msg-daya">
              <div class="daya-typing-indicator">
                <span class="daya-typing-dot"></span>
                <span class="daya-typing-dot"></span>
                <span class="daya-typing-dot"></span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- DYNAMIC QUICK SUGGESTION CHIPS -->
        <div class="daya-quick-chips" id="daya-quick-chips">
          ${suggestions.map((s) => `
            <button class="daya-chip-btn" onclick="sendDayaPrompt('${s.replace(/'/g, "\\'")}')">
              ${s}
            </button>
          `).join('')}
        </div>

        <!-- FOOTER INPUT -->
        <div class="daya-footer">
          <input 
            type="text" 
            id="daya-chat-input" 
            class="daya-input" 
            placeholder="Tanyakan data toko (omset, FIFO, piutang)..." 
            onkeydown="handleDayaInputKey(event)"
            autocomplete="off"
          />
          <button class="daya-send-btn" onclick="sendDayaMessage()" title="Kirim Pertanyaan">
            ➤
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Renders single message bubble with markdown formatting & KPI styling
   * @param {Object} msg
   * @returns {string}
   */
  renderMessageBubble(msg) {
    const isUser = msg.sender === 'user';
    const formattedText = this.formatMarkdown(msg.text);

    return `
      <div class="daya-msg ${isUser ? 'msg-user' : 'msg-daya'}">
        <div class="daya-msg-bubble">
          ${formattedText}
        </div>
        <div class="daya-msg-time">${msg.time || ''}</div>
      </div>
    `;
  },

  /**
   * Lightweight markdown and highlights formatter
   * @param {string} text
   * @returns {string}
   */
  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.06);padding:2px 4px;border-radius:4px;font-family:var(--font-mono);font-size:11px;">$1</code>')
      .replace(/\n/g, '<br/>');
  }
};
