// ==========================================================================
// Main Application Component
// Role-Based Access Control (Admin & Staff) & Session Management
// ==========================================================================
window.LNF = window.LNF || {};

(function () {
  const { useState, useEffect, useMemo } = React;
  const {
    INITIAL_ITEMS,
    INITIAL_USERS,
    Header,
    ItemCard,
    ItemDetailSheet,
    ItemFormSheet,
    MarkClaimedModal,
    StaffSignInModal,
    UserManagementModal,
    supabaseService,
    exportItemsToCsv
  } = window.LNF;

  function App() {
    // 1. User Management State (Persisted in localStorage)
    const [users, setUsers] = useState(() => {
      const saved = localStorage.getItem('tivoli_users');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return INITIAL_USERS;
        }
      }
      return INITIAL_USERS;
    });

    useEffect(() => {
      localStorage.setItem('tivoli_users', JSON.stringify(users));
    }, [users]);

    // 2. Authentication & Session State
    const [currentUser, setCurrentUser] = useState(() => {
      const sessionStr = sessionStorage.getItem('tivoli_auth_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          if (session.expiresAt && session.expiresAt > Date.now()) {
            // Guarantee capital initials on session restore
            const caps = (window.LNF.getUserInitials ? window.LNF.getUserInitials(session) : (session.initials || '')).toUpperCase();
            session.initials = caps;
            return session;
          }
          sessionStorage.removeItem('tivoli_auth_session');
        } catch (e) {
          sessionStorage.removeItem('tivoli_auth_session');
        }
      }
      return null;
    });

    // 3. Lost & Found Items Inventory (Persisted in localStorage)
    const [items, setItems] = useState(() => {
      const saved = localStorage.getItem('tivoli_lostnfound_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return INITIAL_ITEMS;
        }
      }
      return INITIAL_ITEMS;
    });

    useEffect(() => {
      localStorage.setItem('tivoli_lostnfound_items', JSON.stringify(items));
    }, [items]);

    // 4. Navigation & Search Filters
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'claimed'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // 5. Network, Sync & Toast States
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    };

    // 6. Supabase Initial Fetch with Graceful Local Fallback
    useEffect(() => {
      let isMounted = true;
      async function loadRemoteInventory() {
        if (supabaseService?.init) {
          await supabaseService.init();
        }
        if (supabaseService && supabaseService.isConfigured()) {
          try {
            setIsLoading(true);
            const remoteItems = await supabaseService.fetchItems();
            if (isMounted && remoteItems && remoteItems.length > 0) {
              setItems(remoteItems);
              showToast('Synced live inventory with Supabase', 'success');
            }
          } catch (err) {
            console.warn('Network issue fetching from Supabase, operating with local storage:', err);
            if (isMounted) {
              showToast('Network issue connecting to Supabase. Loaded local cache.', 'error');
            }
          } finally {
            if (isMounted) setIsLoading(false);
          }
        } else {
          // Local storage mode
          setIsLoading(false);
        }
      }
      loadRemoteInventory();
      return () => { isMounted = false; };
    }, []);

    // 7. Modals State
    const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
    const [claimingItem, setClaimingItem] = useState(null);
    const [isLogItemOpen, setIsLogItemOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

    // Auth Handlers
    const handleLoginSuccess = (session) => {
      setCurrentUser(session);
    };

    const handleSignOut = () => {
      sessionStorage.removeItem('tivoli_auth_session');
      setCurrentUser(null);
      setIsUserManagementOpen(false);
      setSelectedItemForDetail(null);
      setEditingItem(null);
      setClaimingItem(null);
    };

    // User Management Handlers (Admin Only)
    const handleCreateUser = (newUserData) => {
      if (currentUser?.role !== 'admin') {
        alert('Unauthorized: Only administrators can create new staff accounts.');
        return;
      }
      const newUser = {
        id: 'user-' + Date.now(),
        ...newUserData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setUsers(prev => [...prev, newUser]);
    };

    const handleToggleRole = (userId) => {
      if (currentUser?.role !== 'admin') {
        alert('Unauthorized: Only administrators can modify roles.');
        return;
      }
      if (currentUser.userId === userId) {
        alert('Security rule: You cannot demote your own active admin account.');
        return;
      }
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            role: u.role === 'admin' ? 'staff' : 'admin'
          };
        }
        return u;
      }));
    };

    const handleDeleteUser = (userId) => {
      if (currentUser?.role !== 'admin') {
        alert('Unauthorized: Only administrators can remove staff accounts.');
        return;
      }
      if (currentUser.userId === userId) {
        alert('Security rule: You cannot delete your own active admin account.');
        return;
      }
      const targetUser = users.find(u => u.id === userId);
      if (window.confirm(`Are you sure you want to deactivate and remove ${targetUser?.name || 'this user'}?`)) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    };

    const handleResetPassword = (userId, newPasswordHash) => {
      if (currentUser?.role !== 'admin') {
        alert('Unauthorized: Only administrators can reset staff credentials.');
        return;
      }
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            passwordHash: newPasswordHash
          };
        }
        return u;
      }));
    };

    // Item Action Handlers (Supabase + Local Sync)
    const handleSaveNewItem = async (newItemData) => {
      const activeInitials = (window.LNF.getUserInitials ? window.LNF.getUserInitials(currentUser) : '');
      const defaultInitials = (newItemData.staffInitials || activeInitials || 'ST').toUpperCase();
      
      let createdItem = null;

      // 1. Attempt Supabase insert with photo upload if configured
      if (supabaseService && supabaseService.isConfigured()) {
        try {
          createdItem = await supabaseService.addItem({
            ...newItemData,
            staffInitials: defaultInitials
          });
          if (createdItem) {
            setItems(prev => [createdItem, ...prev]);
            setIsLogItemOpen(false);
            showToast(`Logged "${createdItem.title}" to Supabase!`, 'success');
            return;
          }
        } catch (err) {
          console.error('Supabase addItem failed:', err);
          showToast('Failed to save to Supabase: ' + (err.message || 'Network error'), 'error');
        }
      }

      // 2. Local Fallback Insert
      const newItem = {
        id: 'item-' + Date.now(),
        ...newItemData,
        staffInitials: defaultInitials,
        dateLogged: new Date().toISOString(),
        status: 'active',
        claimedBy: null,
        claimedPhone: null,
        claimedAt: null,
        releasingStaff: null
      };
      setItems(prev => [newItem, ...prev]);
      setIsLogItemOpen(false);
      showToast(`Logged "${newItem.title}" into inventory!`, 'success');
    };

    const handleUpdateItem = async (updatedItemData) => {
      if (!editingItem) return;

      if (supabaseService && supabaseService.isConfigured()) {
        try {
          const updated = await supabaseService.updateItem(editingItem.id, updatedItemData);
          if (updated) {
            setItems(prev => prev.map(item => item.id === editingItem.id ? updated : item));
            if (selectedItemForDetail?.id === editingItem.id) {
              setSelectedItemForDetail(updated);
            }
            setEditingItem(null);
            showToast('Updated item details in Supabase!', 'success');
            return;
          }
        } catch (err) {
          console.error('Supabase updateItem failed:', err);
          showToast('Failed to update in Supabase: ' + (err.message || 'Network error'), 'error');
        }
      }

      // Local fallback
      setItems(prev => prev.map(item => {
        if (item.id === editingItem.id) {
          const updated = {
            ...item,
            ...updatedItemData
          };
          if (selectedItemForDetail && selectedItemForDetail.id === item.id) {
            setSelectedItemForDetail(updated);
          }
          return updated;
        }
        return item;
      }));
      setEditingItem(null);
      showToast('Updated item details!', 'success');
    };

    const handleDeleteItem = async (itemId) => {
      if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
        if (supabaseService && supabaseService.isConfigured()) {
          try {
            await supabaseService.deleteItem(itemId);
          } catch (err) {
            console.warn('Supabase deleteItem error:', err);
          }
        }
        setItems(prev => prev.filter(item => item.id !== itemId));
        setEditingItem(null);
        if (selectedItemForDetail && selectedItemForDetail.id === itemId) {
          setSelectedItemForDetail(null);
        }
        showToast('Item deleted from inventory.', 'info');
      }
    };

    const handleConfirmClaim = async (claimData) => {
      if (!claimingItem) return;
      const activeInitials = (window.LNF.getUserInitials ? window.LNF.getUserInitials(currentUser) : '');
      const releasingStaffInitials = (claimData.releasingStaff || activeInitials || 'ST').toUpperCase();

      if (supabaseService && supabaseService.isConfigured()) {
        try {
          const claimed = await supabaseService.claimItem(claimingItem.id, {
            ...claimData,
            releasingStaff: releasingStaffInitials
          });
          if (claimed) {
            setItems(prev => prev.map(item => item.id === claimingItem.id ? claimed : item));
            setClaimingItem(null);
            if (selectedItemForDetail && selectedItemForDetail.id === claimingItem.id) {
              setSelectedItemForDetail(null);
            }
            showToast(`Item "${claimed.title}" released to claimant!`, 'success');
            return;
          }
        } catch (err) {
          console.error('Supabase claimItem failed:', err);
          showToast('Failed to record claim in Supabase: ' + (err.message || 'Network error'), 'error');
        }
      }

      // Local Fallback Claim
      setItems(prev => prev.map(item => {
        if (item.id === claimingItem.id) {
          return {
            ...item,
            status: 'claimed',
            claimedBy: claimData.claimantName,
            claimedPhone: claimData.claimantIdOrPhone || 'N/A',
            releasingStaff: releasingStaffInitials,
            claimedAt: new Date().toISOString()
          };
        }
        return item;
      }));
      setClaimingItem(null);
      if (selectedItemForDetail && selectedItemForDetail.id === claimingItem.id) {
        setSelectedItemForDetail(null);
      }
      showToast('Item released to claimant!', 'success');
    };

    // CSV Export Handler
    const handleExportCsv = () => {
      if (window.LNF.exportItemsToCsv) {
        window.LNF.exportItemsToCsv(items, activeTab);
        showToast('Exported inventory log to CSV!', 'info');
      }
    };

    // Inventory Counts
    const activeCount = useMemo(() => items.filter(i => i.status === 'active').length, [items]);
    const claimedCount = useMemo(() => items.filter(i => i.status === 'claimed').length, [items]);

    // Instant Filter Logic
    const filteredItems = useMemo(() => {
      return items.filter(item => {
        if (item.status !== activeTab) return false;
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title?.toLowerCase().includes(q);
          const matchesId = item.studentId?.toLowerCase().includes(q);
          const matchesLoc = item.location?.toLowerCase().includes(q);
          const matchesMarkings = item.markings?.toLowerCase().includes(q);
          const matchesClaimant = item.claimedBy?.toLowerCase().includes(q);
          return matchesTitle || matchesId || matchesLoc || matchesMarkings || matchesClaimant;
        }
        return true;
      });
    }, [items, activeTab, selectedCategory, searchQuery]);

    // If unauthenticated: Render Staff Sign-In Portal
    if (!currentUser) {
      return (
        <StaffSignInModal
          onLoginSuccess={handleLoginSuccess}
          users={users}
        />
      );
    }

    return (
      <div className="flex flex-col min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {/* Floating Apple-Style Toast Alert */}
        {toast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-sheet-up max-w-md w-[92%] px-3 pointer-events-none">
            <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl shadow-apple-card backdrop-blur-md border text-xs sm:text-sm font-semibold pointer-events-auto ${
              toast.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-800'
                : toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                : 'bg-zinc-900/95 border-white/20 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {toast.type === 'error' ? (
                  <window.LNF.Icons.AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                ) : toast.type === 'success' ? (
                  <window.LNF.Icons.Check className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0" />
                ) : (
                  <window.LNF.Icons.Info className="w-4 h-4 text-white shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs opacity-70 hover:opacity-100 p-1 ml-2 transition-opacity"
              >
                <window.LNF.Icons.X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Sticky Frosted Glass Header with Current User & Admin Link */}
        <Header
          currentUser={currentUser}
          activeCount={activeCount}
          claimedCount={claimedCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onOpenUserManagement={() => setIsUserManagementOpen(true)}
          onSignOut={handleSignOut}
          onExportCsv={handleExportCsv}
        />

        {/* Items Feed Main Container */}
        <main className="max-w-5xl xl:max-w-6xl mx-auto w-full px-4 pt-4 flex-1">
          {/* Active Filter Summary Bar */}
          {(searchQuery || selectedCategory !== 'All') && (
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-600 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-zinc-200/80 shadow-apple-sm">
              <span>
                Showing {filteredItems.length} result{filteredItems.length === 1 ? '' : 's'}
                {selectedCategory !== 'All' && <b> in {selectedCategory}</b>}
                {searchQuery && <span> matching "<b>{searchQuery}</b>"</span>}
              </span>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-[#0047BA] font-semibold hover:underline active:opacity-70"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-pulse">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white/85 rounded-2xl p-4 border border-zinc-200/80 shadow-apple-sm flex gap-3.5 items-center">
                  <div className="w-16 h-16 rounded-xl bg-zinc-200 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-zinc-100 rounded-md w-1/2"></div>
                    <div className="h-3 bg-zinc-100 rounded-md w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            /* Empty State */
            <div className="mt-12 text-center py-16 px-4 bg-white/60 rounded-3xl border border-dashed border-zinc-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 text-[#0047BA] flex items-center justify-center">
                {activeTab === 'active' ? (
                  <window.LNF.Icons.Search className="w-7 h-7" />
                ) : (
                  <window.LNF.Icons.Box className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-base font-bold text-zinc-800">
                {activeTab === 'active' ? 'No active items found' : 'No claimed items recorded'}
              </h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No matches for "${searchQuery}". Check the spelling or search by student ID or bin #.`
                  : activeTab === 'active'
                  ? 'All items in this category have been returned, or no new items logged yet.'
                  : 'Claimed items will show up here once marked verified and released.'}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => setIsLogItemOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0047BA] hover:bg-[#00368C] active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-sm border border-black/10 transition-all duration-150"
                >
                  <window.LNF.Icons.Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Log New Item</span>
                </button>
              )}
            </div>
          ) : (
            /* Card Grid / List */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onOpenDetail={() => setSelectedItemForDetail(item)}
                  onEditClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(item);
                  }}
                  onClaimClick={(e) => {
                    e.stopPropagation();
                    setClaimingItem(item);
                  }}
                />
              ))}
            </div>
          )}
        </main>

        {/* Floating "+ Log Item" Action Button (Mobile Thumb Zone) */}
        <div className="fixed z-20" style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))', right: 'calc(1rem + env(safe-area-inset-right))' }}>
          <button
            onClick={() => setIsLogItemOpen(true)}
            className="flex items-center gap-2 bg-[#0047BA] hover:bg-[#00368C] text-white px-5 py-3.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all duration-150 border border-white/20 text-base font-semibold min-h-[50px] min-w-[50px]"
          >
            <window.LNF.Icons.Plus className="w-5 h-5 stroke-[2.5]" />
            <span className="tracking-tight">Log Item</span>
          </button>
        </div>

        {/* Modals & Sheets */}
        {/* 1. Detail Modal Sheet */}
        {selectedItemForDetail && (
          <ItemDetailSheet
            item={selectedItemForDetail}
            onClose={() => setSelectedItemForDetail(null)}
            onEditClick={() => setEditingItem(selectedItemForDetail)}
            onClaimClick={() => {
              const itm = selectedItemForDetail;
              setClaimingItem(itm);
            }}
          />
        )}

        {/* 2. Log New Item Bottom Sheet */}
        {isLogItemOpen && (
          <ItemFormSheet
            currentUser={currentUser}
            onClose={() => setIsLogItemOpen(false)}
            onSave={handleSaveNewItem}
          />
        )}

        {/* 3. Edit Existing Item Bottom Sheet */}
        {editingItem && (
          <ItemFormSheet
            currentUser={currentUser}
            initialItem={editingItem}
            onClose={() => setEditingItem(null)}
            onSave={handleUpdateItem}
            onDelete={handleDeleteItem}
          />
        )}

        {/* 4. Mark Claimed Modal Prompt */}
        {claimingItem && (
          <MarkClaimedModal
            currentUser={currentUser}
            item={claimingItem}
            onClose={() => setClaimingItem(null)}
            onConfirm={handleConfirmClaim}
          />
        )}

        {/* 5. User & Staff Management Console (Admin Only) */}
        {isUserManagementOpen && currentUser?.role === 'admin' && (
          <UserManagementModal
            currentUser={currentUser}
            users={users}
            onClose={() => setIsUserManagementOpen(false)}
            onCreateUser={handleCreateUser}
            onToggleRole={handleToggleRole}
            onDeleteUser={handleDeleteItem ? handleDeleteUser : () => {}}
            onResetPassword={handleResetPassword}
          />
        )}
      </div>
    );
  }

  // Mount root
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
})();
