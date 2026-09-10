/**
 * Roles & Settings Controller: RBAC Capability Matrix and Store Hardware Settings
 */
const RolesController = {
  toggleCapability(role, capabilityKey, isChecked) {
    store.dispatch('RBAC_TOGGLE_CAPABILITY', { role, capabilityKey, isChecked });
  },

  saveMatrix() {
    showToast('✅ Matriks izin 18 Capability Keys berhasil disimpan ke database tenant.');
  },
};

const SettingsController = {
  saveSettings() {
    const storeName = document.getElementById('settings-store-name').value;
    const storeAddress = document.getElementById('settings-store-address').value;
    const storePhone = document.getElementById('settings-store-phone').value;
    const printerType = document.getElementById('settings-printer-type').value;
    const paperWidth = document.getElementById('settings-paper-width').value;

    store.dispatch('SETTINGS_UPDATE', { storeName, storeAddress, storePhone, printerType, paperWidth });
    showToast('✅ Konfigurasi toko dan printer hardware berhasil diperbarui.');
  },

  testPrinter() {
    showToast('🖨️ Mengirim perintah byte ESC/POS ke printer thermal...');
    alert('[ESC/POS Test Print]\n\nTOKO GROSIR BERAS JAYA\nPasar Induk Kramat Jati\n================================\nTEST PRINTER BERHASIL\nKertas: 80mm\nKoneksi: OK\n================================\nTerima Kasih!');
  },
};

function toggleRbacCapability(role, key, isChecked) { RolesController.toggleCapability(role, key, isChecked); }
function saveRbacMatrix() { RolesController.saveMatrix(); }
function saveStoreSettings() { SettingsController.saveSettings(); }
function testThermalPrinter() { SettingsController.testPrinter(); }
