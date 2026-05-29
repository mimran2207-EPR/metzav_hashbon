import React from 'react';

const ICON_PATHS = {
  search:      <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  command:     <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>,
  home:        <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
  back:        <path d="M15 18l-6-6 6-6"/>,
  forward:     <path d="M9 18l6-6-6-6"/>,
  history:     <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></>,
  star:        <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"/>,
  user:        <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></>,
  chevdown:    <path d="M6 9l6 6 6-6"/>,
  chevleft:    <path d="M15 18l-6-6 6-6"/>,
  chevright:   <path d="M9 18l6-6-6-6"/>,
  notes:       <><path d="M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M14 3v5h5M8 13h8M8 17h5"/></>,
  shield:      <><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></>,
  sigma:       <path d="M18 5H7l6 7-6 7h11"/>,
  print:       <><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 17h10v4H7z"/><circle cx="17" cy="12.5" r=".6" fill="currentColor"/></>,
  card:        <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  scan:        <><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M4 12h16"/></>,
  docs:        <><path d="M8 3h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/></>,
  calc:        <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15v2"/></>,
  calendar:    <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  building:    <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></>,
  droplet:     <path d="M12 3s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>,
  receipt:     <><path d="M5 3v18l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4V3l-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  bell:        <><path d="M7 11a5 5 0 0 1 10 0v4l1.5 2.5h-13L7 15z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  phone:       <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 5 6a2 2 0 0 1 0-2z"/>,
  sparkle:     <><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18 15l.7 1.8 1.8.7-1.8.7L18 20l-.7-1.8L15.5 17.5l1.8-.7z"/></>,
  send:        <path d="M5 12l15-7-5 15-3.5-5.5z"/>,
  citation:    <><path d="M7 8h6M7 12h8M7 16h5"/><rect x="3" y="3" width="18" height="18" rx="2"/></>,
  arrowdown:   <><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></>,
  arrowup:     <><path d="M12 19V5"/><path d="m6 11 6-6 6 6"/></>,
  filter:      <path d="M3 5h18l-7 8v6l-4-2v-4z"/>,
  close:       <path d="M6 6l12 12M18 6 6 18"/>,
  check:       <path d="M5 12l5 5 9-10"/>,
  plus:        <path d="M12 5v14M5 12h14"/>,
  info:        <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  alert:       <><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></>,
  settings:    <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.4l2.1-1.6-2-3.5-2.5 1a7 7 0 0 0-2.4-1.4L13.5 2.6h-3l-.6 2.5a7 7 0 0 0-2.4 1.4l-2.5-1-2 3.5L5.1 10.6"/></>,
  logout:      <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M16 15l3-3-3-3M19 12H9"/></>,
  trend:       <><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7h-5M21 7v5"/></>,
  pin:         <><path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></>,
  link:        <><path d="M9 15l6-6"/><path d="M11 7l1-1a4 4 0 0 1 6 6l-1 1M13 17l-1 1a4 4 0 0 1-6-6l1-1"/></>,
  wallet:      <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2"/></>,
  dots:        <><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></>,
  enter:       <path d="M9 10l-4 4 4 4M5 14h11a4 4 0 0 0 4-4V4"/>,
  download:    <><path d="M12 4v11M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
  clock:       <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  // subject icons
  welfare:     <><path d="M12 8.6c-.9-1.8-3.4-1.3-3.4.7 0 1.5 2.1 2.9 3.4 3.6 1.3-.7 3.4-2.1 3.4-3.6 0-2-2.5-2.5-3.4-.7z"/><path d="M4.5 13.5 7 12.6M19.5 13.5 17 12.6M4 14.5c0 3 3.2 4.8 8 4.8s8-1.8 8-4.8"/></>,
  supervision: <><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M8.4 11.5c1.1-1.9 6.1-1.9 7.2 0-1.1 1.9-6.1 1.9-7.2 0z"/><circle cx="12" cy="11.5" r="1.3"/></>,
  clubs:       <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h2.2a1.3 1.3 0 0 1 2.6 0H13a1.5 1.5 0 0 1 1.5 1.5v2.2a1.3 1.3 0 0 0 0 2.6V13A1.5 1.5 0 0 1 13 14.5h-2.2a1.3 1.3 0 0 1-2.6 0H6.5A1.5 1.5 0 0 1 5 13v-2.2a1.3 1.3 0 0 0 0-2.6z"/>,
  education:   <><path d="M3.5 6.2C5.5 5.3 9 5.3 12 6.8c3-1.5 6.5-1.5 8.5-.6v11.4c-2-.9-5.5-.9-8.5.6-3-1.5-6.5-1.5-8.5-.6z"/><path d="M12 6.8v11.4"/><path d="M12 3.2l3.4 1.6L12 6.4 8.6 4.8z"/></>,
  parking:     <><circle cx="12" cy="12" r="9"/><path d="M9.6 17V7h3.1a2.7 2.7 0 0 1 0 5.4H9.6"/></>,
  signage:     <><rect x="4" y="5.5" width="16" height="9" rx="1.5"/><path d="M7.5 9h4M7.5 11.5h6M9.5 14.5v4M14.5 14.5v4M7 18.5h10"/></>,
  engineering: <><path d="M12 4.2v3.2"/><path d="m8.5 19.5 3.5-9.4 3.5 9.4"/><path d="M8.5 19.5h7"/><circle cx="12" cy="6" r="1.4"/></>,
};

function Icon({ name, size = 20, color = "currentColor", stroke = 1.8, style }) {
  const d = ICON_PATHS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flex: "none", display: "block", ...style }} aria-hidden="true">
      {d || null}
    </svg>
  );
}

export { Icon, ICON_PATHS };
