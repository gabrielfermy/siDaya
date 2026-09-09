/**
 * SiDaya Offline-First Local SQLite Schema Definitions
 * Supports high-speed local checkout, FIFO batch allocation, and sync tracking
 */

export interface LocalSyncMetadata {
  syncStatus: 'SYNCED' | 'PENDING_PUSH' | 'CONFLICT';
  localCreatedAt: number;
  localUpdatedAt: number;
}

export const SQLITE_LOCAL_SCHEMA = {
  version: 1,
  tables: [
    `CREATE TABLE IF NOT EXISTS local_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      barcode TEXT,
      price_retail REAL NOT NULL,
      base_unit TEXT NOT NULL,
      current_stock INTEGER NOT NULL DEFAULT 0,
      sync_status TEXT NOT NULL DEFAULT 'SYNCED',
      updated_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS local_orders (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      order_number TEXT NOT NULL UNIQUE,
      cashier_user_id TEXT NOT NULL,
      customer_id TEXT,
      subtotal_amount REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'PENDING_PUSH',
      created_at INTEGER NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS local_order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      selected_unit TEXT NOT NULL,
      conversion_factor INTEGER NOT NULL DEFAULT 1,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES local_orders(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS local_shifts (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      cashier_name TEXT NOT NULL,
      opened_at INTEGER NOT NULL,
      closed_at INTEGER,
      opening_cash_float REAL NOT NULL,
      total_cash_sales REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'OPEN',
      sync_status TEXT NOT NULL DEFAULT 'PENDING_PUSH'
    );`,
    `CREATE TABLE IF NOT EXISTS local_delivery_manifests (
      id TEXT PRIMARY KEY,
      delivery_order_number TEXT NOT NULL UNIQUE,
      order_number TEXT NOT NULL,
      driver_name TEXT NOT NULL,
      vehicle_plate_number TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      destination_address TEXT NOT NULL,
      verification_token TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'SYNCED'
    );`,
  ],
} as const;
