/**
 * @file onboarding.registry.js
 * @description Pluggable Registry for Modular Interactive Onboarding Tours
 * @module Onboarding:Registry
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

class OnboardingRegistryClass {
  constructor() {
    this.modules = new Map();
  }

  /**
   * Registers a self-contained tour module package
   * @param {Object} moduleSpec - Module specification
   * @param {string} moduleSpec.id - Unique module identifier (e.g. 'pilar_pos')
   * @param {string} moduleSpec.moduleKey - Functional key (e.g. 'pos')
   * @param {string} moduleSpec.route - Target route path (e.g. '/pos')
   * @param {string} moduleSpec.title - Human-readable title
   * @param {string} [moduleSpec.icon='📌'] - Module icon
   * @param {Array<string>} [moduleSpec.requiredPermissions=[]] - Required permissions to view
   * @param {boolean} [moduleSpec.isOwnerOnly=false] - If true, restricted to workspace Owner
   * @param {'STARTER_FREE'|'GROSIR_PRO'} [moduleSpec.tier='STARTER_FREE'] - Tier requirement
   * @param {Array<Object>} moduleSpec.steps - List of component tour steps
   */
  registerModule(moduleSpec) {
    if (!moduleSpec || !moduleSpec.id) {
      console.warn('[OnboardingRegistry] Invalid module spec provided');
      return;
    }

    const defaultModule = {
      id: moduleSpec.id,
      moduleKey: moduleSpec.moduleKey || moduleSpec.id,
      route: moduleSpec.route || '/dashboard',
      title: moduleSpec.title || 'Modul Panduan',
      icon: moduleSpec.icon || '📌',
      requiredPermissions: Array.isArray(moduleSpec.requiredPermissions) ? moduleSpec.requiredPermissions : [],
      isOwnerOnly: !!moduleSpec.isOwnerOnly,
      tier: moduleSpec.tier || 'STARTER_FREE',
      enabled: moduleSpec.enabled !== false,
      steps: Array.isArray(moduleSpec.steps) ? moduleSpec.steps : []
    };

    this.modules.set(moduleSpec.id, defaultModule);
  }

  /**
   * Unregisters or disables a tour module
   * @param {string} moduleId
   */
  unregisterModule(moduleId) {
    this.modules.delete(moduleId);
  }

  /**
   * Retrieves all registered modules
   * @returns {Array<Object>}
   */
  getAllModules() {
    return Array.from(this.modules.values());
  }

  /**
   * Retrieves a specific registered module by ID
   * @param {string} moduleId
   * @returns {Object|null}
   */
  getModule(moduleId) {
    return this.modules.get(moduleId) || null;
  }

  /**
   * Toggles module active/disabled state
   * @param {string} moduleId
   * @param {boolean} [enabled]
   * @returns {boolean} New state
   */
  toggleModule(moduleId, enabled) {
    const mod = this.modules.get(moduleId);
    if (!mod) return false;
    mod.enabled = (typeof enabled === 'boolean') ? enabled : !mod.enabled;
    return mod.enabled;
  }

  /**
   * Updates specific step content within a module
   * @param {string} moduleId
   * @param {string} stepId
   * @param {Object} updates
   */
  updateStepContent(moduleId, stepId, updates) {
    const mod = this.modules.get(moduleId);
    if (!mod || !Array.isArray(mod.steps)) return false;
    const step = mod.steps.find(s => s.id === stepId);
    if (!step) return false;
    Object.assign(step, updates);
    return true;
  }

  /**
   * Resolves all eligible tour steps for a given user and subscription tier
   * @param {Object} user - User session object (isOwner, permissions, role)
   * @param {string} [tenantTier='GROSIR_PRO'] - Active tenant subscription tier
   * @returns {Array<Object>}
   */
  resolveStepsForUser(user, tenantTier = 'GROSIR_PRO') {
    if (!user) return [];
    const isOwner = !!user.isOwner;
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    const allSteps = [];

    for (const mod of this.modules.values()) {
      if (!mod.enabled) continue;

      // Tier check
      if (mod.tier === 'GROSIR_PRO' && tenantTier === 'STARTER_FREE') continue;

      // Owner restriction check
      if (mod.isOwnerOnly && !isOwner) continue;

      // Permissions check
      if (!isOwner && mod.requiredPermissions.length > 0) {
        const hasPerm = mod.requiredPermissions.some(p => userPermissions.includes(p));
        if (!hasPerm) continue;
      }

      // Collect steps for this module
      for (const step of mod.steps) {
        if (step.enabled === false) continue;
        if (step.isOwnerOnly && !isOwner) continue;
        if (!isOwner && step.requiredPermission && !userPermissions.includes(step.requiredPermission)) continue;

        allSteps.push({
          ...step,
          moduleId: mod.id,
          moduleTitle: mod.title,
          route: step.route || mod.route,
          icon: step.icon || mod.icon || '📌'
        });
      }
    }

    return allSteps;
  }
}

// Global Singleton Instance
const OnboardingRegistry = new OnboardingRegistryClass();

if (typeof window !== 'undefined') {
  window.OnboardingRegistry = OnboardingRegistry;
}
