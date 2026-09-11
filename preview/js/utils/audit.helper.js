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
    const actorName = curUser.name || 'Owner / Sistem';
    const actorRole = curUser.role || 'OWNER';

    const targetDesc = typeof target === 'object' && target !== null
      ? (target.identifier || `${target.entityType || 'ENTITY'} #${target.entityId || ''}`)
      : String(target || 'Entitas Sistem');

    const entry = {
      id: 'aud_t_' + Date.now(),
      time: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      actor: actorName,
      actorRole,
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

    const opEmail = state?.auth?.operatorUser?.email || 'operator@ashvinlabs.com';

    const entry = {
      id: 'aud_ops_' + Date.now(),
      time: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      operatorEmail: opEmail,
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
