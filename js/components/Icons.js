// ==========================================================================
// Vector Icons Library (SF Symbols / Heroicons Style)
// Clean, crisp SVG vector icons — 100% emoji-free
// ==========================================================================
window.LNF = window.LNF || {};

(function () {
  const Icons = {};

  // 1. Category Icons
  Icons.Grid = function GridIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    );
  };

  Icons.IdCard = function IdCardIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="11" r="2.25" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9h4m-4 3.5h4M6 17a3 3 0 016 0" />
      </svg>
    );
  };

  Icons.Key = function KeyIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a4 4 0 10-5.657 5.657L3 19v2h2v-2h2v-2h2l1.343-1.343A4 4 0 0015 7z" />
        <circle cx="15.5" cy="6.5" r=".5" fill="currentColor" />
      </svg>
    );
  };

  Icons.Phone = function PhoneIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="2" width="12" height="20" rx="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeWidth="2" d="M11 18h2" />
      </svg>
    );
  };

  Icons.Bag = function BagIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 6a3 3 0 016 0m4 4v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9a2 2 0 012-2h10a2 2 0 012 2zM9 10v2a3 3 0 006 0v-2" />
      </svg>
    );
  };

  Icons.Bottle = function BottleIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 2h4m-3 0v3l-3 4v11a2 2 0 002 2h4a2 2 0 002-2V9l-3-4V2" />
        <line x1="8" y1="13" x2="16" y2="13" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  Icons.Box = function BoxIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  };

  // 2. UI / Feedback Icons
  Icons.MapPin = function MapPinIcon({ className = "w-3.5 h-3.5" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z" />
        <circle cx="12" cy="11" r="2" strokeWidth="2" />
      </svg>
    );
  };

  Icons.Users = function UsersIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  };

  Icons.Crown = function CrownIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 18h18L20 8l-5 4-3-6-3 6-5-4-1 10z" />
        <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  Icons.Check = function CheckIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  Icons.AlertTriangle = function AlertTriangleIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  };

  Icons.Info = function InfoIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  Icons.Lock = function LockIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 018 0v4" />
      </svg>
    );
  };

  Icons.Camera = function CameraIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  };

  Icons.Search = function SearchIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
    );
  };

  Icons.Bolt = function BoltIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  Icons.Spinner = function SpinnerIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    );
  };

  Icons.X = function XIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  Icons.Plus = function PlusIcon({ className = "w-4 h-4" }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
      </svg>
    );
  };

  // Helper function to resolve category ID to corresponding SVG icon component
  window.LNF.getCategoryIcon = function getCategoryIcon(categoryId, className = "w-4 h-4") {
    switch (categoryId) {
      case 'All':
        return <Icons.Grid className={className} />;
      case 'ID Card':
        return <Icons.IdCard className={className} />;
      case 'Keys':
        return <Icons.Key className={className} />;
      case 'Phone':
        return <Icons.Phone className={className} />;
      case 'Bag':
        return <Icons.Bag className={className} />;
      case 'Water Bottle':
        return <Icons.Bottle className={className} />;
      case 'Other':
      default:
        return <Icons.Box className={className} />;
    }
  };

  window.LNF.Icons = Icons;
})();
