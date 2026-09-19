/**
 * Customers & Piutang Controllers: CRM, Credit Limits, and WhatsApp PayLink
 */
const CustomersController = {
  sendPaylink(customerId) {
    const state = store.getState();
    const customer = state.pilar3.customers.find(c => c.id === customerId);
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

function sendCustomerPaylink(id) { CustomersController.sendPaylink(id); }
function dispatchWhatsAppPaylink(inv, name, phone, amount) { CustomersController.dispatchWhatsAppPaylink(inv, name, phone, amount); }
