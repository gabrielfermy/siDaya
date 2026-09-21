/**
 * Customers & Piutang Controllers: CRM, Credit Limits, and WhatsApp PayLink
 */
const CustomersController = {
  openAddCustomerModal() {
    openModal('modal-add-customer');
  },

  handleAddCustomerSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    const name = document.getElementById('cust-owner-name')?.value?.trim();
    const storeName = document.getElementById('cust-store-name')?.value?.trim();
    const phone = document.getElementById('cust-phone')?.value?.trim();
    const type = document.getElementById('cust-type')?.value || 'GROSIR_REGULER';
    const creditLimit = parseInt(document.getElementById('cust-credit-limit')?.value, 10) || 0;
    const topDays = parseInt(document.getElementById('cust-top-days')?.value, 10) || 0;

    if (!name || !storeName || !phone) {
      showToast('Harap lengkapi nama pemilik, nama toko, dan nomor WhatsApp.', 'warning');
      return;
    }

    const newCustomer = {
      id: 'c_' + Date.now(),
      name,
      storeName,
      phone,
      type,
      creditLimit,
      usedCredit: 0,
      topDays,
      status: 'ACTIVE',
    };

    store.dispatch('ADD_CUSTOMER', newCustomer);
    closeModal();
    showToast(`✅ Pelanggan ${storeName} (${name}) berhasil didaftarkan.`);

    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/customers')) {
      container.innerHTML = CustomersView.render(store.getState());
    }
  },

  openCreateSjModal() {
    const sjInput = document.getElementById('sj-number');
    if (sjInput && !sjInput.value) {
      sjInput.value = 'SJ-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    }
    openModal('modal-create-sj');
  },

  handleCreateSjSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    const sjNumber = document.getElementById('sj-number')?.value?.trim();
    const orderNumber = document.getElementById('sj-order-ref')?.value?.trim() || 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const driverName = document.getElementById('sj-driver-name')?.value?.trim();
    const plateNumber = document.getElementById('sj-plate-number')?.value?.trim();
    const destination = document.getElementById('sj-destination')?.value?.trim();
    const itemSummary = document.getElementById('sj-item-summary')?.value?.trim();

    if (!sjNumber || !driverName || !plateNumber || !destination || !itemSummary) {
      showToast('Harap lengkapi seluruh kolom Surat Jalan.', 'warning');
      return;
    }

    const newSj = {
      id: 'sj_' + Date.now(),
      sjNumber,
      orderNumber,
      driverName,
      plateNumber,
      destination,
      itemSummary,
      status: 'IN_TRANSIT',
    };

    store.dispatch('CREATE_SURAT_JALAN', newSj);
    closeModal();
    showToast(`🚚 Surat Jalan ${sjNumber} berhasil diterbitkan untuk armada ${plateNumber}.`);

    const container = document.getElementById('main-content');
    if (container && window.location.pathname.includes('/sj')) {
      container.innerHTML = SjView.render(store.getState());
    }
  },

  sendPaylink(customerId) {
    const state = store.getState();
    const customer = state?.pilar3?.customers?.find(c => c.id === customerId);
    if (!customer) return;

    if (customer.usedCredit <= 0) {
      showToast(`Pelanggan ${customer.name} tidak memiliki tagihan piutang aktif.`);
      return;
    }

    const paylinkUrl = `https://pay.sidaya.id/pl_${customer.id.slice(-6)}`;
    const message = `Halo ${customer.name}, tagihan kasbon toko Anda saat ini sebesar ${formatRupiah(customer.usedCredit)}. Anda dapat melakukan pembayaran instan via QRIS / Transfer melalui tautan resmi berikut: ${paylinkUrl}`;

    showToast(`💬 Pesan WhatsApp PayLink disiapkan untuk ${customer.name} (${customer.phone})`);
    alert(`[Simulasi WhatsApp Dispatch]\nKepada: ${customer.phone}\n\nPesan:\n${message}`);
  },

  dispatchWhatsAppPaylink(invoiceNumber, customerName, phone, amount) {
    const paylinkUrl = `https://pay.sidaya.id/inv_${invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const message = `Halo ${customerName}, tagihan Faktur ${invoiceNumber} sebesar ${formatRupiah(amount)} siap dibayar via QRIS/VA: ${paylinkUrl}`;
    
    showToast(`PayLink untuk Faktur ${invoiceNumber} terkirim ke ${customerName}`);
    alert(`[Simulasi WhatsApp API]\nPenerima: ${phone}\n\nPesan:\n${message}`);
  },
};

function openAddCustomerModal() { CustomersController.openAddCustomerModal(); }
function openCreateSjModal() { CustomersController.openCreateSjModal(); }
function handleCreateSjSubmit(e) { CustomersController.handleCreateSjSubmit(e); }
function sendCustomerPaylink(id) { CustomersController.sendPaylink(id); }
function dispatchWhatsAppPaylink(inv, name, phone, amount) { CustomersController.dispatchWhatsAppPaylink(inv, name, phone, amount); }

