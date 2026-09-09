export interface SyncPushPayload {
  pendingOrders: unknown[];
  pendingShifts: unknown[];
}

export interface SyncPullResult {
  productsLastUpdated: number;
  newOrders: unknown[];
  updatedEntitlements: Record<string, boolean>;
}

export interface ISyncEngine {
  pushPendingLocalChanges(payload: SyncPushPayload): Promise<{ success: boolean; pushedCount: number }>;
  pullLatestCloudChanges(sinceTimestamp: number): Promise<SyncPullResult>;
}

export class OfflineSyncEngine implements ISyncEngine {
  async pushPendingLocalChanges(payload: SyncPushPayload): Promise<{ success: boolean; pushedCount: number }> {
    const total = payload.pendingOrders.length + payload.pendingShifts.length;
    return { success: true, pushedCount: total };
  }

  async pullLatestCloudChanges(_sinceTimestamp: number): Promise<SyncPullResult> {
    return {
      productsLastUpdated: Date.now(),
      newOrders: [],
      updatedEntitlements: {},
    };
  }
}
