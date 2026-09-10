/**
 * SiDaya Internal Dependency & Module Manager (Modulith Core)
 * Manages module lifecycles, validates dependencies, and provides structured broken dependency warnings.
 */
class DependencyManager {
  constructor() {
    this.modules = new Map();
    this.instances = new Map();
    this.healthStatus = new Map();
  }

  /**
   * Registers a module with its declared dependencies and implementation
   * @param {string} name - Unique module identifier (e.g. 'View:POS', 'Controller:POS')
   * @param {string[]} dependencies - List of required module names
   * @param {any} implementation - Module instance or factory function
   */
  register(name, dependencies = [], implementation = null) {
    this.modules.set(name, {
      name,
      dependencies,
      implementation,
      registeredAt: new Date(),
    });
    this.instances.set(name, implementation);
    this.healthStatus.set(name, 'HEALTHY');
  }

  /**
   * Resolves a registered module by name
   */
  resolve(name) {
    if (!this.instances.has(name)) {
      console.warn(`[DependencyManager] ⚠️ Missing module resolution: '${name}' is not registered.`);
      return null;
    }
    return this.instances.get(name);
  }

  /**
   * Validates the integrity of all registered modules and their dependencies
   * Emits structured warnings if any dependency is missing or broken.
   */
  validateAll() {
    const brokenDependencies = [];

    for (const [name, mod] of this.modules.entries()) {
      for (const dep of mod.dependencies) {
        if (!this.modules.has(dep) || !this.instances.get(dep)) {
          this.healthStatus.set(name, 'DEGRADED');
          brokenDependencies.push({
            consumer: name,
            missingDependency: dep,
          });
          console.warn(`[DependencyManager] ⚠️ Broken Dependency Alert: Module '${name}' requires '${dep}' which is not available!`);
        }
      }
    }

    if (brokenDependencies.length > 0) {
      console.error('[DependencyManager] 🚨 Dependency Integrity Check Failed:', brokenDependencies);
      if (typeof showToast === 'function') {
        showToast(`⚠️ Peringatan Dependensi: ${brokenDependencies.length} modul memiliki dependensi hilang.`, 'warning');
      }
    } else {
      console.log(`[DependencyManager] ✅ All ${this.modules.size} internal modules healthy & resolved.`);
    }

    return {
      isValid: brokenDependencies.length === 0,
      totalModules: this.modules.size,
      brokenDependencies,
    };
  }

  /**
   * Returns a diagnostic summary of all registered modules
   */
  getDiagnostics() {
    const list = [];
    for (const [name, mod] of this.modules.entries()) {
      list.push({
        name,
        dependencies: mod.dependencies,
        status: this.healthStatus.get(name) || 'UNKNOWN',
      });
    }
    return list;
  }
}

// Global DependencyManager singleton
const moduleManager = new DependencyManager();
window.moduleManager = moduleManager;
