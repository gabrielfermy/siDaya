/**
 * @file audit.helper.js
 * @description Standardized Plug-and-Play Audit Interfacing Utility for SiDaya
 * @module Utils:Audit
 * @dependencies Store:Store
 * @exports
 *   - AuditEmitter.logTenant: Emit tenant-scoped forensic audit event
 *   - AuditEmitter.logOperator: Emit discreet, UU PDP compliant operator audit event
 */

const AuditEmitter = {
  /**
   * Emits structured audit entry for the Tenant Workspace Plane
   * @param {Object} params
   * @param {string} params.domain - e.g. 'INVENTORY' | 'POS' | 'SALES' | 'CRM' | 'STAFF' | 'SETTINGS'
   * @param {string} params.action - Format: <DOMAIN>_<VERB>
   * @param {string|Object} params.target - Entity identifier string or { entityType, entityId, identifier }
   * @param {Object} [params.diff] - Optional state diff { before, after }
   * @param {string} [params.reason] - Justification for overrides, deletes, or modifications
   * @param {'SUCCESS'|'FAILED'|'REJECTED'} [params.status='SUCCESS']
   * @returns {Object} Generated audit entry
   */
  logTenant({ domain, action, target, diff = null, reason = 'Aktivitas operasional toko', status = 'SUCCESS' }) {
    if (typeof store === 'undefined') return null;

    const state = store.getState ? store.getState() : (store.state || {});
    const curUser = state?.auth?.merchantUser || {};
    const now = new Date();

    const actorName = (typeof actor === 'object' && actor?.name) ? actor.name : (curUser.name || 'Owner / Sistem');
    const actorRole = (typeof actor === 'object' && actor?.role) ? actor.role : (curUser.role || 'OWNER');
    const actorEmail = (typeof actor === 'object' && actor?.email) ? actor.email : (curUser.email || '-');

    const targetDesc = typeof target === 'object' && target !== null
      ? (target.identifier || `${target.entityType || 'ENTITY'} #${target.entityId || ''}`)
      : String(target || 'Entitas Sistem');

    const entry = {
      id: 'aud_t_' + Date.now(),
      time: now.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }), // Contoh: 11/09/2026, 12:51:18
      isoTimestamp: now.toISOString(),
      actor: actorName,
      actorRole,
      actorEmail,
      domain: (domain || 'GENERAL').toUpperCase(),
      action: (action || 'ACTION').toUpperCase(),
      target: targetDesc,
      diff: diff ? JSON.parse(JSON.stringify(diff)) : null,
      reason: String(reason).trim(),
      status
    };

    if (!state.pilar8) state.pilar8 = {};
    if (!Array.isArray(state.pilar8.auditLogs)) state.pilar8.auditLogs = [];
    state.pilar8.auditLogs.unshift(entry);

    if (store.saveState) store.saveState();
    if (store.notify) store.notify();

    return entry;
  },

  /**
   * Emits discreet audit entry for the Operator Control Plane (UU PDP Compliant)
   * @param {Object} params
   * @param {string} params.action - Format: OPERATOR_<ACTION>
   * @param {string} params.target - Target tenant or operator account
   * @param {string} [params.ticketRef='#TICKET-OPS'] - Mandatory ticket ref
   * @param {string} [params.reason='Platform operation'] - Justification
   * @param {'SUCCESS'|'BLOCKED'} [params.status='SUCCESS']
   * @returns {Object} Generated operator audit entry
   */
  logOperator({ action, target, ticketRef = '#TICKET-OPS', reason = 'Platform operations', status = 'SUCCESS' }) {
    if (typeof store === 'undefined') return null;

    const state = store.getState ? store.getState() : (store.state || {});
    if (!state.operator) return null; // Strict plane defense: no operator state in merchant plane

    const now = new Date();
    const curOp = state?.auth?.operatorUser || {};
    const opEmail = curOp.email || 'operator@ashvinlabs.com';
    const opRole = curOp.role || state?.operator?.currentRole || 'SUPER_ADMIN';

    const entry = {
      id: 'aud_ops_' + Date.now(),
      time: now.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' }), // Contoh: 11/09/2026, 12:51:18
      isoTimestamp: now.toISOString(),
      operatorEmail: opEmail,
      operatorRole: opRole,
      action: (action || 'OPERATOR_ACTION').toUpperCase(),
      target: String(target || 'Global System'),
      ticketRef: String(ticketRef).trim(),
      reason: String(reason).trim(),
      status,
      privacyClearance: 'UU_PDP_COMPLIANT'
    };

    if (!Array.isArray(state.operator.auditLogs)) state.operator.auditLogs = [];
    state.operator.auditLogs.unshift(entry);

    if (store.saveState) store.saveState();
    if (store.notify) store.notify();

    return entry;
  }
};

// Global handles
if (typeof window !== 'undefined') {
  window.AuditEmitter = AuditEmitter;
}
if (typeof global !== 'undefined') {
  global.AuditEmitter = AuditEmitter;
}
