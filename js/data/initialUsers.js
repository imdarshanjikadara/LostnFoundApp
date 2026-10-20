// ==========================================================================
// Initial User Accounts with Cryptographically Hashed Passwords
// - Default Admin Account: admin@auraria.edu / Admin2026!
// - Default Staff Account: maya.staff@auraria.edu / Staff2026!
// Passwords hashed using SHA-256 + Salt
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.INITIAL_USERS = [
  {
    id: 'user-admin-1',
    name: 'Station Supervisor',
    identifier: 'admin@auraria.edu',
    initials: 'SUP',
    role: 'admin',
    passwordHash: 'ab2e962383a239206cb0c3d53295e8778b7d2d7e42ec50eb71edb298fda672bf', // Admin2026!
    createdAt: '2026-10-01T08:00:00.000Z',
    status: 'active'
  },
  {
    id: 'user-staff-1',
    name: 'Maya Lin',
    identifier: 'maya.staff@auraria.edu',
    initials: 'ML',
    role: 'staff',
    passwordHash: 'b47ae400f41d25c4c5ec3fa48e086f0fa02c0c66a0173597e336a4464f6abd46', // Staff2026!
    createdAt: '2026-10-10T09:30:00.000Z',
    status: 'active'
  }
];
