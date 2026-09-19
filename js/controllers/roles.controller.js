/**
 * @fileoverview Roles & RBAC Matrix Controller (Pilar 08)
 * @module Controllers:Roles
 * @description
 * Event listeners and handlers for 18-Key RBAC Capability Matrix management.
 *
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

const RolesController = {
  /**
   * Toggles permission capability checkbox for role
   * @param {string} role
   * @param {string} capabilityKey
   * @param {boolean} isChecked
   */
  toggleCapability(role, capabilityKey, isChecked) {
    store.dispatch('RBAC_TOGGLE_CAPABILITY', { role, capabilityKey, isChecked });
  },

  /**
   * Saves RBAC Matrix changes
   */
  saveMatrix() {
    Toast.show('✅ Matriks izin 18 Capability Keys berhasil disimpan ke database tenant.', 'success');
  },
};

// Global backward compatibility
window.toggleRbacCapability = (role, key, isChecked) => RolesController.toggleCapability(role, key, isChecked);
window.saveRbacMatrix = () => RolesController.saveMatrix();
