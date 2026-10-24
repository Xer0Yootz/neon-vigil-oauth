export function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true };
  if (name === 'login') {
    return <svg {...common}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>;
  }
  if (name === 'logout') {
    return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
  }
  if (name === 'chat') {
    return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  }
  if (name === 'avatar') {
    return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  }
  if (name === 'repos') {
    return <svg {...common}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
  }
  if (name === 'hex') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2L22 7V17L12 22L2 17V7Z" />
        <path d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5Z" />
      </svg>
    );
  }
  if (name === 'back') {
    return (
      <svg {...common}>
        <polygon points="11 19 2 12 11 5 11 19" />
        <polygon points="22 19 13 12 22 5 22 19" />
      </svg>
    );
  }
  if (name === 'sound') {
    return (
      <svg {...common}>
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    );
  }
  if (name === 'sound-off') {
    return (
      <svg {...common}>
        <path d="M11 5 6 9H2v6h4l5 4V5z" />
        <path d="m22 9-6 6" />
        <path d="m16 9 6 6" />
      </svg>
    );
  }
  if (name === 'weapon') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
        <path d="m13 19 6-6" />
        <path d="m16 16 4 4" />
        <path d="m19 21 2-2" />
        <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
        <path d="m5 14 4 4" />
        <path d="m7 17-3 3" />
        <path d="m3 19 2 2" />
      </svg>
    );
  }
  if (name === 'fist') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9a2 2 0 0 1 4 0" />
        <path d="M8 8a2 2 0 0 1 4 0" />
        <path d="M12 8a2 2 0 0 1 4 0" />
        <path d="M16 9a2 2 0 0 1 4 0" />
        <path d="M4 9v5a7 7 0 0 0 7 7h2a7 7 0 0 0 7-7V9" />
        <path d="M8 8v3" />
        <path d="M12 8v3" />
        <path d="M16 9v2" />
        <path d="M4 14h7a2 2 0 0 0 2-2" />
      </svg>
    );
  }
  if (name === 'laser-cutter') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="11" height="6" rx="1" />
        <path d="M13 10h3v2h-3" />
        <path d="M5 14v4h3l1-4" />
        <path d="M18 11h1.5" />
        <path d="M21.5 11H22" />
        <path d="m19 7 1.5-1.5" />
        <path d="m19 15 1.5 1.5" />
      </svg>
    );
  }
  if (name === 'machete') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14 18 4c1.6-1.6 4.4-.6 3.6 2.2C20.6 10 15.5 14 11 17z" />
        <path d="m6 14 4 4" />
        <path d="m3 21 5-5" />
      </svg>
    );
  }
  if (name === 'eye') {
    return (
      <svg {...common}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === 'globe') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    );
  }
  if (name === 'image-off') {
    return (
      <svg {...common}>
        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
        <path d="M3 3l18 18" />
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    );
  }
  if (name === 'bluetooth') {
    return (
      <svg {...common}>
        <path d="m7 7 10 10-5 5V2l5 5L7 17" />
      </svg>
    );
  }
  return null;
}
