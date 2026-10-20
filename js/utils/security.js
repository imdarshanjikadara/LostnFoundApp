// ==========================================================================
// Security Utilities & Defenses
// - WebCrypto SHA-256 password hashing + salt
// - Anti-Brute-Force rate limiter
// - XSS input sanitization
// - Cryptographically secure session token generation
// ==========================================================================
window.LNF = window.LNF || {};

(function () {
  const SECURITY_SALT = "tivoli_auraria_lostnfound_salt_2026";

  // SHA-256 password hash using standard browser WebCrypto API
  async function hashPassword(plainTextPassword) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainTextPassword + SECURITY_SALT);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Generate cryptographically random secure token
  function generateSessionToken() {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
  }

  // XSS protection: escape untrusted strings before rendering or storing
  function sanitizeInput(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  // Anti-Brute-Force Rate Limiter
  const loginAttempts = {
    count: 0,
    lockoutUntil: 0
  };

  function checkLoginRateLimit() {
    const now = Date.now();
    if (loginAttempts.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((loginAttempts.lockoutUntil - now) / 1000);
      return { allowed: false, remainingSeconds };
    }
    return { allowed: true, remainingSeconds: 0 };
  }

  function recordFailedLogin() {
    loginAttempts.count += 1;
    if (loginAttempts.count >= 5) {
      // 60-second lockout after 5 consecutive failed attempts
      loginAttempts.lockoutUntil = Date.now() + 60 * 1000;
      loginAttempts.count = 0;
      return 60;
    }
    return 0;
  }

  function resetLoginAttempts() {
    loginAttempts.count = 0;
    loginAttempts.lockoutUntil = 0;
  }

  window.LNF.security = {
    hashPassword,
    generateSessionToken,
    sanitizeInput,
    checkLoginRateLimit,
    recordFailedLogin,
    resetLoginAttempts
  };
})();
