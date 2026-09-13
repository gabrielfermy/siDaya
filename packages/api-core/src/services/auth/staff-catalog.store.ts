import {
  DEFAULT_ROLE_PERMISSION_PRESETS,
  PermissionKey,
} from '@sidaya/shared-types';
import { StaffCatalogItem } from './auth-types';

export class StaffCatalogStore {
  private static instance: StaffCatalogStore;

  public catalog: StaffCatalogItem[] = [
    {
      userId: 'a0000001-0001-0000-0000-000000000001',
      fullName: 'Budi Santoso',
      email: 'budi@berasjaya.com',
      phoneNumber: '081234567890',
      pin: '1234',
      password: 'Password123!',
      isEmailVerified: true,
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'OWNER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['OWNER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000001-0001-0000-0000-000000000002',
      fullName: 'Agus Gudang',
      email: 'agus@berasjaya.com',
      phoneNumber: '081234567892',
      pin: '3344',
      password: 'Password123!',
      isEmailVerified: true,
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'WAREHOUSE',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['WAREHOUSE'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000001-0001-0000-0000-000000000003',
      fullName: 'Siti Rahma',
      email: 'siti@berasjaya.com',
      phoneNumber: '081234567893',
      pin: '5566',
      password: 'Password123!',
      isEmailVerified: true,
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'CASHIER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['CASHIER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
    {
      userId: 'a0000001-0001-0000-0000-000000000004',
      fullName: 'Joko Driver',
      email: 'joko@berasjaya.com',
      phoneNumber: '081234567894',
      pin: '7788',
      password: 'Password123!',
      isEmailVerified: true,
      tenants: [
        {
          tenantId: 'c4b8e219-9831-482a-bc91-23a9cf8e12d4',
          businessName: 'Toko Grosir Beras Jaya Bersama',
          subdomain: 'berasjaya',
          role: 'DRIVER',
          permissions: DEFAULT_ROLE_PERMISSION_PRESETS['DRIVER'] as PermissionKey[],
          branchId: 'b0000000-0000-0000-0000-000000000001',
          branchName: 'Pasar Induk Kramat Jati',
        },
      ],
    },
  ];

  public static getInstance(): StaffCatalogStore {
    if (!StaffCatalogStore.instance) {
      StaffCatalogStore.instance = new StaffCatalogStore();
    }
    return StaffCatalogStore.instance;
  }
}
