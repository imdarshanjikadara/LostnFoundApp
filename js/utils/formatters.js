// ==========================================================================
// Formatting Utilities
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.formatTimeAgo = function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSecs < 60) return 'Just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

window.LNF.formatDateTime = function formatDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Extracts and formats staff or admin initials in strict CAPITAL LETTERS.
 * Checks user.initials, user.name, user.identifier, or stored staff initials.
 */
window.LNF.getUserInitials = function getUserInitials(user) {
  if (!user) {
    const saved = localStorage.getItem('tivoli_staff_initials');
    return (saved || '').toUpperCase().trim();
  }
  if (typeof user === 'string') {
    return user.toUpperCase().trim();
  }
  if (user.initials && typeof user.initials === 'string') {
    return user.initials.toUpperCase().trim();
  }
  if (user.name && typeof user.name === 'string') {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 0) {
      return parts.map(p => p[0]).join('').slice(0, 4).toUpperCase();
    }
  }
  if (user.identifier && typeof user.identifier === 'string') {
    const prefix = user.identifier.split('@')[0];
    const parts = prefix.split(/[._-]/).filter(Boolean);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return prefix.slice(0, 3).toUpperCase();
  }
  return '';
};

