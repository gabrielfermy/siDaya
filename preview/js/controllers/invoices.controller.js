/**
 * Invoices, Surat Jalan, and Katalog Controllers
 */
const InvoicesController = {
  viewReceipt(invoiceNumber) {
    showToast(`Memuat struk transaksi untuk ${invoiceNumber}...`);
    alert(`[ESC/POS Thermal Receipt]\n================================\nFAKTUR: ${invoiceNumber}\nTOKO GROSIR BERAS JAYA\n================================\nStatus: LUNAS\nMetode: Kasir POS (TUNAI)\n================================\nTerima kasih atas kunjungan Anda!`);
  },

  exportCsv() {
    showToast('📥 Mengunduh rekap faktur penjualan format CSV...');
  },
};

const SjController = {
  openPodModal(sjId) {
    const signature = prompt('Masukkan tanda tangan digital / Nama Penerima Toko:', 'H. Hendro');
    if (signature) {
      store.dispatch('SJ_SIGN_POD', { sjId, signature });
      showToast(`✅ Serah terima Surat Jalan #${sjId} berhasil ditandatangani!`);
      const container = document.getElementById('main-viewport');
      if (container && window.location.pathname.includes('/sj')) {
        container.innerHTML = SjView.render(store.getState());
      }
    }
  },

  viewPodSignature(sjNumber) {
    alert(`[Bukti Digital Tanda Tangan POD]\n================================\nSurat Jalan: ${sjNumber}\nPenerima: H. Hendro (Stempel Toko OK)\nWaktu: 2026-09-09 14:32 WIB\nStatus: SERAH TERIMA SELESAI\n================================`);
  },
};

const KatalogController = {
  editProduct(id) {
    const state = store.getState();
    const product = state.pilar2.products.find(p => p.id === id);
    if (!product) return;
    showToast(`Membuka editor SKU: ${product.name}`);
  },
};

function viewReceipt(num) { InvoicesController.viewReceipt(num); }
function viewInvoiceReceipt(num) { InvoicesController.viewReceipt(num); }
function exportInvoicesCsv() { InvoicesController.exportCsv(); }
function openPodSignModal(id) { SjController.openPodModal(id); }
function viewPodSignature(num) { SjController.viewPodSignature(num); }
function editProduct(id) { KatalogController.editProduct(id); }
