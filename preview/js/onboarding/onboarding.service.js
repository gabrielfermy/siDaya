/**
 * @file onboarding.service.js
 * @description Orchestration Engine for Role-Based Interactive Onboarding & Spotlighting
 * @module Onboarding:Service
 * @author Ashvin Labs Engineering Team
 * @license Proprietary - SiDaya
 */

class OnboardingServiceClass {
  constructor() {
    this.isRunning = false;
    this.isSimulating = false;
    this.currentStepIndex = 0;
    this.activeSteps = [];
    this.targetElement = null;
    this.pollInterval = null;
  }

  /**
   * Resolves current user context from AuthController/Session
   * @private
   */
  _getCurrentContext() {
    const user = (typeof AuthController !== 'undefined' && AuthController.currentUser)
      ? AuthController.currentUser
      : null;
    const subdomain = (typeof AuthController !== 'undefined' && AuthController.currentTenant)
      ? AuthController.currentTenant.subdomain
      : (window.location.hostname.split('.')[0] || 'default');
    const tier = (typeof AuthController !== 'undefined' && AuthController.currentTenant && AuthController.currentTenant.tier)
      ? AuthController.currentTenant.tier
      : 'GROSIR_PRO';

    return { user, subdomain, tier };
  }

  /**
   * Retrieves list of seen step IDs for current user & workspace
   * @param {Object} [user]
   * @param {string} [subdomain]
   * @returns {Array<string>}
   */
  getSeenSteps(user = null, subdomain = null) {
    const ctx = this._getCurrentContext();
    const activeUser = user || ctx.user;
    const activeSubdomain = subdomain || ctx.subdomain;
    if (!activeUser || !activeUser.email) return [];

    const key = `sidaya_seen_steps_${activeSubdomain}_${activeUser.email}`;
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      console.warn('[OnboardingService] Error reading seen steps', e);
      return [];
    }
  }

  /**
   * Records a step as seen in localStorage
   * @param {string} stepId
   * @param {Object} [user]
   * @param {string} [subdomain]
   */
  markStepSeen(stepId, user = null, subdomain = null) {
    if (this.isSimulating || !stepId) return;
    const ctx = this._getCurrentContext();
    const activeUser = user || ctx.user;
    const activeSubdomain = subdomain || ctx.subdomain;
    if (!activeUser || !activeUser.email) return;

    const key = `sidaya_seen_steps_${activeSubdomain}_${activeUser.email}`;
    const seen = this.getSeenSteps(activeUser, activeSubdomain);
    if (!seen.includes(stepId)) {
      seen.push(stepId);
      localStorage.setItem(key, JSON.stringify(seen));
    }
  }

  /**
   * Checks if onboarding is permanently suppressed by user
   * @param {Object} [user]
   * @param {string} [subdomain]
   * @returns {boolean}
   */
  isSuppressed(user = null, subdomain = null) {
    const ctx = this._getCurrentContext();
    const activeUser = user || ctx.user;
    const activeSubdomain = subdomain || ctx.subdomain;
    if (!activeUser || !activeUser.email) return false;

    const key = `sidaya_onboarding_suppressed_${activeSubdomain}_${activeUser.email}`;
    return localStorage.getItem(key) === 'true';
  }

  /**
   * Sets permanent suppression flag
   * @param {boolean} value
   * @param {Object} [user]
   * @param {string} [subdomain]
   */
  setSuppressed(value, user = null, subdomain = null) {
    const ctx = this._getCurrentContext();
    const activeUser = user || ctx.user;
    const activeSubdomain = subdomain || ctx.subdomain;
    if (!activeUser || !activeUser.email) return;

    const key = `sidaya_onboarding_suppressed_${activeSubdomain}_${activeUser.email}`;
    localStorage.setItem(key, value ? 'true' : 'false');
  }

  /**
   * Resolves unseen steps for dynamic progression (e.g. role promotion)
   * @returns {Array<Object>}
   */
  getUnseenSteps() {
    const { user, subdomain, tier } = this._getCurrentContext();
    if (!user) return [];

    const allSteps = OnboardingRegistry.resolveStepsForUser(user, tier);
    const seen = this.getSeenSteps(user, subdomain);
    return allSteps.filter(step => !seen.includes(step.id));
  }

  /**
   * Automatically starts the onboarding tour if unseen steps exist and tour is not suppressed
   */
  checkAndAutoStart() {
    const { user } = this._getCurrentContext();
    if (!user) return;
    if (this.isRunning) return;
    if (this.isSuppressed()) return;

    // Do not auto start on auth pages or operator subdomain
    if (window.location.hash.startsWith('#/login') ||
        window.location.hash.startsWith('#/register') ||
        window.location.hostname.startsWith('ops.')) {
      return;
    }

    const unseen = this.getUnseenSteps();
    if (unseen.length > 0) {
      console.log(`[OnboardingService] Auto-starting tour with ${unseen.length} unseen steps`);
      // Slight delay to allow initial DOM and route layout to mount cleanly
      setTimeout(() => {
        this.startTour(unseen, false);
      }, 700);
    }
  }

  /**
   * Initiates an onboarding tour
   * @param {Array<Object>} [stepList=null] - Specific step list, or full role steps if null
   * @param {boolean} [isSimulation=false] - Simulation mode from Operator Plane
   */
  startTour(stepList = null, isSimulation = false) {
    const { user, tier } = this._getCurrentContext();
    this.isSimulating = isSimulation;

    if (stepList && stepList.length > 0) {
      this.activeSteps = stepList;
    } else if (user) {
      this.activeSteps = OnboardingRegistry.resolveStepsForUser(user, tier);
    } else {
      this.activeSteps = [];
    }

    if (this.activeSteps.length === 0) {
      if (typeof Toast !== 'undefined') {
        Toast.info('Tidak ada panduan yang tersedia untuk peran saat ini.');
      }
      return;
    }

    this.isRunning = true;
    this.currentStepIndex = 0;
    this._renderCurrentStep();
  }

  /**
   * Advances to next step
   */
  nextStep() {
    if (!this.isRunning || this.activeSteps.length === 0) return;

    const currentStep = this.activeSteps[this.currentStepIndex];
    if (currentStep) {
      this.markStepSeen(currentStep.id);
    }

    if (this.currentStepIndex < this.activeSteps.length - 1) {
      this.currentStepIndex++;
      this._renderCurrentStep();
    } else {
      this.completeTour();
    }
  }

  /**
   * Navigates back to previous step
   */
  prevStep() {
    if (!this.isRunning || this.activeSteps.length === 0) return;

    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this._renderCurrentStep();
    }
  }

  /**
   * Skips remaining tour steps
   * @param {boolean} dontShowAgain - If checked, permanently suppress tour
   */
  skipTour(dontShowAgain = false) {
    if (dontShowAgain) {
      this.setSuppressed(true);
      if (typeof Toast !== 'undefined') {
        Toast.info('Panduan Kilat dinonaktifkan. Anda dapat membukanya kembali dari menu atas.');
      }
    }
    this.clearHighlight();
    OnboardingView.removeCard();
    this.isRunning = false;
    this.isSimulating = false;
  }

  /**
   * Completes the entire tour sequence
   */
  completeTour() {
    const { user, subdomain } = this._getCurrentContext();
    // Mark all steps as seen
    if (!this.isSimulating && user) {
      this.activeSteps.forEach(s => this.markStepSeen(s.id, user, subdomain));
      this.setSuppressed(true, user, subdomain);
    }

    this.clearHighlight();
    OnboardingView.removeCard();
    this.isRunning = false;
    this.isSimulating = false;

    if (typeof Toast !== 'undefined') {
      Toast.success('🎉 Selamat! Anda telah menyelesaikan Panduan Kilat SiDaya.');
    }
  }

  /**
   * Internal render orchestrator
   * @private
   */
  _renderCurrentStep() {
    if (this.currentStepIndex >= this.activeSteps.length) return;
    const step = this.activeSteps[this.currentStepIndex];

    // 1. Render Floating Card UI
    OnboardingView.renderCard(step, this.currentStepIndex, this.activeSteps.length, this.isSimulating);

    // 2. Route Check & Auto-Navigation
    const currentHash = window.location.hash.replace('#', '') || '/dashboard';
    const targetRoute = step.route;

    if (targetRoute && currentHash !== targetRoute) {
      if (typeof Router !== 'undefined' && Router.navigate) {
        Router.navigate(targetRoute);
      } else {
        window.location.hash = `#${targetRoute}`;
      }
    }

    // 3. Highlight Target Element with retry loop for async-rendered views
    this.highlightElement(step.targetSelector);
  }

  /**
   * Applies pulsing spotlight halo and smooth auto-scroll to target element
   * @param {string} selector
   */
  highlightElement(selector) {
    this.clearHighlight();
    if (!selector) return;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    let attempts = 0;
    const maxAttempts = 20; // 2 seconds total

    const tryFindAndHighlight = () => {
      attempts++;
      const el = document.querySelector(selector);
      if (el) {
        this.targetElement = el;
        el.classList.add('onboarding-spotlight-active');
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        } catch (e) {
          // fallback if smooth scroll unsupported
          el.scrollIntoView();
        }
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      } else if (attempts >= maxAttempts) {
        console.warn(`[OnboardingService] Target element '${selector}' not found after ${maxAttempts} attempts.`);
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      }
    };

    // Immediate check
    tryFindAndHighlight();

    // Polling check for dynamic components
    if (!this.targetElement && attempts < maxAttempts) {
      this.pollInterval = setInterval(tryFindAndHighlight, 100);
    }
  }

  /**
   * Clears any active spotlight halos
   */
  clearHighlight() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    const activeElements = document.querySelectorAll('.onboarding-spotlight-active');
    activeElements.forEach(el => el.classList.remove('onboarding-spotlight-active'));
    this.targetElement = null;
  }

  /**
   * Operator Control Plane helper: Reset onboarding progress for a tenant
   * @param {string} subdomain
   * @param {string} [userEmail]
   */
  resetTenantOnboarding(subdomain, userEmail = null) {
    if (!subdomain) return false;
    let count = 0;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (userEmail) {
        if (key === `sidaya_seen_steps_${subdomain}_${userEmail}` ||
            key === `sidaya_onboarding_suppressed_${subdomain}_${userEmail}`) {
          keysToRemove.push(key);
        }
      } else {
        if (key.startsWith(`sidaya_seen_steps_${subdomain}_`) ||
            key.startsWith(`sidaya_onboarding_suppressed_${subdomain}_`)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(k => {
      localStorage.removeItem(k);
      count++;
    });

    return count > 0;
  }
}

// Global Singleton Instance
const OnboardingService = new OnboardingServiceClass();

if (typeof window !== 'undefined') {
  window.OnboardingService = OnboardingService;
}
