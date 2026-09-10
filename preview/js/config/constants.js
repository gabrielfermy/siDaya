/**
 * @file constants.js
 * @description Global presets, session security thresholds, and account presets
 * @module Config:Constants
 */

const SESSION_CONFIG = {
  /** Session Time-To-Live in milliseconds (30 minutes) */
  SESSION_TTL_MS: 30 * 60 * 1000,
  /** Inactivity poll check frequency (15 seconds) */
  IDLE_CHECK_INTERVAL_MS: 15 * 1000,
  /** Storage keys */
  KEY_MERCHANT_SESSION: 'sidaya_merchant_session',
  KEY_OPERATOR_SESSION: 'sidaya_operator_session',
  KEY_INTENDED_PATH: 'sidaya_intended_path',
  KEY_SESSION_EXPIRED_FLAG: 'sidaya_session_expired_flag',
};

const MERCHANT_ACCOUNTS = {
  'budi@berasjaya.com': { email: 'budi@berasjaya.com', password: 'Password123!', name: 'Budi Santoso', role: '👑 OWNER', roleLabel: 'Owner / Billing POC', avatar: 'B', tenantName: 'Toko Grosir Beras Jaya Bersama' },
  'siti@berasjaya.com': { email: 'siti@berasjaya.com', password: 'Password123!', name: 'Siti Rahma', role: '💳 KASIR (POS)', roleLabel: 'Kasir Grosir (POS)', avatar: 'S', tenantName: 'Toko Grosir Beras Jaya Bersama' },
  'agus@berasjaya.com': { email: 'agus@berasjaya.com', password: 'Password123!', name: 'Agus Santoso', role: '📦 GUDANG (FIFO)', roleLabel: 'Gudang & Batch FIFO', avatar: 'A', tenantName: 'Toko Grosir Beras Jaya Bersama' },
  'joko@berasjaya.com': { email: 'joko@berasjaya.com', password: 'Password123!', name: 'Joko Supir', role: '🚚 DRIVER', roleLabel: 'Driver Logistik (POD)', avatar: 'J', tenantName: 'Toko Grosir Beras Jaya Bersama' },
};

const OPERATOR_ACCOUNTS = {
  'gabriel@ashvinlabs.com': { email: 'gabriel@ashvinlabs.com', password: 'SuperSecret123!', name: 'Gabriel (CEO)', role: 'SUPER_ADMIN', roleName: 'Super Admin', badgeClass: 'role-super-admin' },
  'alex@ashvinlabs.com': { email: 'alex@ashvinlabs.com', password: 'SuperSecret123!', name: 'Alex (Lead Developer)', role: 'DEV_ENGINEER', roleName: 'Dev Engineer', badgeClass: 'role-dev-engineer' },
  'dina@ashvinlabs.com': { email: 'dina@ashvinlabs.com', password: 'SuperSecret123!', name: 'Dina (Customer Ops)', role: 'OPS_SUPPORT', roleName: 'Ops Support', badgeClass: 'role-ops-support' },
};

const MERCHANT_PRESETS = MERCHANT_ACCOUNTS;
const OPERATOR_PRESETS = OPERATOR_ACCOUNTS;

