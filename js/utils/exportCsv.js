// ==========================================================================
// CSV Inventory Exporter
// Exports active and claimed Lost & Found inventory into a clean CSV file
// ==========================================================================
window.LNF = window.LNF || {};

window.LNF.exportItemsToCsv = function exportItemsToCsv(items, activeTab = 'all') {
  if (!items || items.length === 0) {
    alert('No inventory records available to export.');
    return;
  }

  const headers = [
    'Item ID',
    'Status',
    'Title',
    'Category',
    'Storage Location',
    'Student ID / Identifier',
    'Logging Staff Initials',
    'Date Logged (ISO)',
    'Date Logged (Formatted)',
    'Claimant Name',
    'Claimant Phone or Student ID',
    'Releasing Staff Initials',
    'Claimed Date',
    'Photo URL'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = items.map(item => {
    const formattedDate = item.dateLogged 
      ? new Date(item.dateLogged).toLocaleString('en-US', { timeZoneName: 'short' })
      : '';
    const formattedClaimed = item.claimedAt 
      ? new Date(item.claimedAt).toLocaleString('en-US', { timeZoneName: 'short' })
      : '';

    return [
      escapeCsv(item.id),
      escapeCsv(item.status),
      escapeCsv(item.title),
      escapeCsv(item.category),
      escapeCsv(item.location),
      escapeCsv(item.studentId || ''),
      escapeCsv(item.staffInitials || ''),
      escapeCsv(item.dateLogged || ''),
      escapeCsv(formattedDate),
      escapeCsv(item.claimedBy || ''),
      escapeCsv(item.claimedPhone || ''),
      escapeCsv(item.releasingStaff || ''),
      escapeCsv(formattedClaimed),
      escapeCsv(item.image || '')
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `tivoli-lost-found-inventory-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
