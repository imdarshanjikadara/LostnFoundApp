// ==========================================================================
// Initial Sample Data for Tivoli ID Station (Auraria Campus)
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.INITIAL_ITEMS = [
  {
    id: 'item-1',
    title: 'MSU Denver Student ID Card — Maya Lin',
    category: 'ID Card',
    studentId: '900481203',
    location: 'Bin A-02',
    markings: 'Maya Lin, Fall 2026 sticker, Auraria Campus',
    staffInitials: 'TD',
    dateLogged: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: 'active',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80',
    claimedBy: null,
    claimedPhone: null,
    claimedAt: null,
    releasingStaff: null
  },
  {
    id: 'item-2',
    title: 'Apple AirPods Pro (2nd Gen) in Blue Silicon Case',
    category: 'Phone',
    studentId: 'Engraved: "C.R."',
    location: 'Safe Drawer 1',
    markings: 'Matte navy blue silicone cover with small brass carabiner clip',
    staffInitials: 'MR',
    dateLogged: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'active',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80',
    claimedBy: null,
    claimedPhone: null,
    claimedAt: null,
    releasingStaff: null
  },
  {
    id: 'item-3',
    title: 'Subaru Car Key Fob with Colorado Flag Lanyard',
    category: 'Keys',
    studentId: 'Plate note: CO #AXY-412',
    location: 'Key Rack #03',
    markings: 'Subaru 4-button keyless entry fob + King Soopers rewards card + 1 brass Schlage key',
    staffInitials: 'JD',
    dateLogged: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: 'active',
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80',
    claimedBy: null,
    claimedPhone: null,
    claimedAt: null,
    releasingStaff: null
  },
  {
    id: 'item-4',
    title: 'Hydro Flask 32oz Wide Mouth (Teal)',
    category: 'Water Bottle',
    studentId: 'Sticker: "Red Rocks Amphitheatre"',
    location: 'Bin B-14',
    markings: 'Dented bottom edge, Teal color, black flex sip lid, multiple ski resort stickers',
    staffInitials: 'TD',
    dateLogged: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    status: 'active',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80',
    claimedBy: null,
    claimedPhone: null,
    claimedAt: null,
    releasingStaff: null
  },
  {
    id: 'item-5',
    title: 'The North Face Jester Backpack (Black)',
    category: 'Bag',
    studentId: 'Inside folder name: "Marcus Evans"',
    location: 'Shelf 2-C',
    markings: 'Contains 2 spiral notebooks (BIO 101), TI-84 calculator, and black fleece beanie',
    staffInitials: 'JD',
    dateLogged: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    status: 'active',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
    claimedBy: null,
    claimedPhone: null,
    claimedAt: null,
    releasingStaff: null
  },
  {
    id: 'item-6',
    title: 'TI-84 Plus CE Color Graphing Calculator (White)',
    category: 'Other',
    studentId: '900331821',
    location: 'Bin A-08',
    markings: 'White shell, name "Carlos Gomez" on back cover',
    staffInitials: 'MR',
    dateLogged: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    status: 'claimed',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80',
    claimedBy: 'Carlos Gomez',
    claimedPhone: '900331821 / (303) 555-0192',
    claimedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    releasingStaff: 'JD'
  }
];
