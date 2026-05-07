const ICONS = {
  dashboard: <g><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></g>,
  users: <g><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></g>,
  calendar: <g><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></g>,
  clock: <g><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></g>,
  file: <g><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></g>,
  chart: <g><path d="M3 3v18h18M9 17V9M15 17V5M21 17v-4"/></g>,
  download: <g><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></g>,
  edit: <g><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></g>,
  check: <g><polyline points="20 6 9 17 4 12"/></g>,
  x: <g><path d="M18 6L6 18M6 6l12 12"/></g>,
  alert: <g><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></g>,
  info: <g><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></g>,
  chevDown: <g><polyline points="6 9 12 15 18 9"/></g>,
  chevRight: <g><polyline points="9 18 15 12 9 6"/></g>,
  search: <g><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></g>,
  filter: <g><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></g>,
  logout: <g><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></g>,
  user: <g><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2"/></g>,
  dollar: <g><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></g>,
  receipt: <g><path d="M2 8l10-5 10 5-10 5L2 8z"/><path d="M2 16l10 5 10-5M2 12l10 5 10-5"/></g>,
  clipboard: <g><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-4"/></g>,
  settings: <g><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1z"/></g>,
  plus: <g><path d="M12 5v14M5 12h14"/></g>,
  trash: <g><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></g>,
  bell: <g><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></g>,
};

export default function Icon({ name, size = 18, className = '', style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
