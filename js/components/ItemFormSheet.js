// ==========================================================================
// Component: Item Form Sheet (Log New or Edit Existing Item)
// Supports storage location editing, 1-tap presets, and client image optimizer
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.ItemFormSheet = function ItemFormSheet({
  currentUser = null,
  initialItem = null,
  onClose,
  onSave,
  onDelete = null
}) {
  const { CATEGORIES, STORAGE_PRESETS, compressImage, Icons } = window.LNF;
  const isEditing = Boolean(initialItem);
  const fileInputRef = React.useRef(null);

  // Compute initials of logged-in user in strict capital letters
  const userInitials = (window.LNF.getUserInitials 
    ? window.LNF.getUserInitials(currentUser) 
    : (currentUser?.initials || '')).toUpperCase();

  const [title, setTitle] = React.useState(initialItem?.title || '');
  const [category, setCategory] = React.useState(initialItem?.category || 'ID Card');
  const [studentId, setStudentId] = React.useState(initialItem?.studentId || '');
  const [location, setLocation] = React.useState(initialItem?.location || 'Bin A-01');
  const [markings, setMarkings] = React.useState(initialItem?.markings || '');
  const [staffInitials, setStaffInitials] = React.useState(
    (initialItem?.staffInitials || userInitials || '').toUpperCase()
  );
  const [imageData, setImageData] = React.useState(initialItem?.image || null);
  const [optimizing, setOptimizing] = React.useState(false);
  const [optStats, setOptStats] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState('');

  // Auto-populate staff initials in capital letters from authenticated session
  React.useEffect(() => {
    if (!initialItem && userInitials) {
      setStaffInitials(userInitials);
    }
  }, [userInitials, initialItem]);

  // Update fields if initialItem changes
  React.useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setCategory(initialItem.category || 'ID Card');
      setStudentId(initialItem.studentId || '');
      setLocation(initialItem.location || 'Bin A-01');
      setMarkings(initialItem.markings || '');
      setStaffInitials((initialItem.staffInitials || userInitials || '').toUpperCase());
      setImageData(initialItem.image || null);
    } else if (userInitials) {
      setStaffInitials(userInitials);
    }
  }, [initialItem, userInitials]);

  // Handle photo capture / file upload + canvas compression
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setOptimizing(true);
      setErrorMsg('');
      const result = await compressImage(file, 1280, 0.75);
      setImageData(result.dataUrl);
      setOptStats({
        orig: result.originalSizeKB,
        comp: result.compressedSizeKB,
        saved: result.reductionPercent,
        dim: `${result.width}×${result.height}`
      });
    } catch (err) {
      console.error('Image optimization failed:', err);
      setErrorMsg('Could not process photo: ' + (err.message || 'Compression error'));
    } finally {
      setOptimizing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a short descriptive item title.');
      return;
    }
    if (!staffInitials.trim()) {
      setErrorMsg('Please enter logging staff initials.');
      return;
    }

    localStorage.setItem('tivoli_staff_initials', staffInitials.toUpperCase().trim());

    onSave({
      title: title.trim(),
      category,
      studentId: studentId.trim(),
      location: location.trim(),
      markings: markings.trim(),
      staffInitials: staffInitials.toUpperCase().trim(),
      image: imageData
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-sheet-up pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-apple-sheet flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-full pt-3 pb-2 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 leading-tight">
              {isEditing ? 'Edit Item Details' : 'Log Turn-in Item'}
            </h3>
            <p className="text-xs text-zinc-500">
              {isEditing ? 'Update storage location, title, markings, or staff' : 'Record item into Tivoli Station inventory'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
          >
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium flex items-center gap-2">
              <Icons.AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Capture Section (Client Image Optimizer & Native Camera Trigger) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Item Photo (Mobile Camera & Canvas Optimized)
              </label>
              {imageData && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Icons.Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                  <span>Ready (&lt; 250 KB)</span>
                </span>
              )}
            </div>
            
            {/* Native Camera Trigger: captures directly with device camera or photo library */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload States */}
            {optimizing ? (
              /* Clean iOS Loading State */
              <div className="w-full py-8 px-4 rounded-2xl border border-blue-200/90 bg-blue-50/60 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-sheet-up">
                <div className="w-10 h-10 mb-2 relative flex items-center justify-center">
                  <svg className="animate-spin w-8 h-8 text-[#0047BA]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-sm font-bold text-zinc-900">Optimizing Photo on Canvas...</p>
                <p className="text-xs text-zinc-500 mt-0.5">Resizing to max 1280px & compressing under 250 KB</p>
              </div>
            ) : imageData ? (
              /* Thumbnail Preview with Rounded Corners, Floating Badges, and Retake Button */
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200/90 bg-zinc-950 shadow-apple-card group animate-sheet-up">
                <div className="relative h-48 sm:h-52 w-full overflow-hidden flex items-center justify-center bg-zinc-900">
                  <img
                    src={imageData}
                    alt="Captured preview thumbnail"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />
                </div>

                {/* Floating Top Header: Compression Stats & Remove Button */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                  {optStats ? (
                    <div className="inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-apple-sm border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      <span>{optStats.comp} KB</span>
                      {optStats.saved > 0 && (
                        <span className="text-emerald-300 font-semibold">({optStats.saved}% saved)</span>
                      )}
                      {optStats.dim && (
                        <span className="text-zinc-400 text-[10px] hidden sm:inline">• {optStats.dim}</span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
                      Attached
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setImageData(null);
                      setOptStats(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="w-7 h-7 bg-black/65 hover:bg-black/85 text-white rounded-full flex items-center justify-center text-xs font-bold active:scale-90 transition-all backdrop-blur-md border border-white/20 shadow-sm"
                    title="Remove photo"
                  >
                    <Icons.X className="w-3 h-3" />
                  </button>
                </div>

                {/* Floating Bottom: Retake Button */}
                <div className="absolute bottom-2.5 right-2.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-zinc-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md active:scale-95 transition-all border border-black/10"
                  >
                    <svg className="w-3.5 h-3.5 stroke-[2.2] text-[#0047BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Intuitive iOS Photo Upload Card */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 px-4 rounded-2xl border-2 border-dashed border-zinc-300 hover:border-[#0047BA] bg-zinc-50/90 hover:bg-blue-50/40 flex flex-col items-center justify-center text-zinc-600 transition-all duration-200 active:scale-[0.98] group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100/90 text-[#0047BA] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-sm">
                  <Icons.Camera className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-base font-semibold text-zinc-800 tracking-tight">
                  Take Photo or Upload
                </span>
                <span className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1">
                    <Icons.Camera className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Camera or photo library</span>
                  </span>
                  <span>•</span>
                  <span>Auto compressed &lt; 250 KB</span>
                </span>
              </button>
            )}
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 font-medium text-zinc-900 focus:bg-white focus:border-[#0047BA] outline-none text-[16px]"
              >
                {CATEGORIES.filter(c => c.id !== 'All').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Storage Bin / Shelf <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bin A-04, Key Hook 3"
                className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-[#0047BA] outline-none text-[16px]"
              />
              {/* Quick storage preset pills */}
              <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 no-scrollbar">
                {STORAGE_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLocation(preset)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap active:scale-95 transition-all ${
                      location === preset
                        ? 'bg-[#0047BA] text-white border-[#0047BA] font-bold'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Item Short Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hydro Flask 32oz Teal, Silver iPhone 14"
              className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-[#0047BA] outline-none text-[16px]"
            />
          </div>

          {/* Student ID / Markings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Student ID # / Owner Name
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 900123456 or Maya Lin"
                className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-[#0047BA] outline-none text-[16px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-600">
                  Staff Initials <span className="text-red-500">*</span>
                </label>
                {userInitials && (
                  <button
                    type="button"
                    onClick={() => setStaffInitials(userInitials)}
                    title="Click to reset to your logged-in initials"
                    className="text-[11px] font-semibold text-[#0047BA] hover:underline flex items-center gap-1"
                  >
                    <span>Auto:</span>
                    <span className="bg-blue-100 text-[#0047BA] px-1.5 py-0.5 rounded font-bold">{userInitials}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                maxLength={4}
                value={staffInitials}
                onChange={(e) => setStaffInitials(e.target.value.toUpperCase())}
                placeholder={userInitials || "e.g. SUP"}
                className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-[#0047BA] outline-none text-[16px] uppercase font-bold"
              />
            </div>
          </div>

          {/* Distinct Markings Textarea */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1">
              Distinct Markings / Detailed Notes
            </label>
            <textarea
              rows={2}
              value={markings}
              onChange={(e) => setMarkings(e.target.value)}
              placeholder="e.g. Scratch on back, sticker of Red Rocks, found at Tivoli 2nd floor lounge"
              className="w-full px-3 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-900 focus:bg-white focus:border-[#0047BA] outline-none text-[16px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(initialItem.id)}
                className="px-3 py-3 text-red-600 hover:bg-red-50 active:scale-95 rounded-xl font-semibold transition-all text-xs border border-red-200 min-h-[48px] flex items-center justify-center gap-1.5"
                title="Delete item"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl font-semibold active:scale-[0.98] transition-all duration-150 min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={optimizing}
              className={`flex-1 py-3 bg-[#0047BA] hover:bg-[#00368C] active:scale-[0.98] text-white rounded-xl font-semibold shadow-sm border border-black/10 transition-all duration-150 flex items-center justify-center min-h-[48px] ${
                optimizing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              {optimizing ? (
                <div className="flex items-center gap-2">
                  <Icons.Spinner className="w-4 h-4 text-white" />
                  <span>Optimizing...</span>
                </div>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
