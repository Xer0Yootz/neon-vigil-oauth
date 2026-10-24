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
  if (name === 'interact') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 14a8 8 0 0 1-8 8" />
        <path d="M18 11v-1a2 2 0 0 0-4 0" />
        <path d="M14 10V9a2 2 0 0 0-4 0v1" />
        <path d="M10 9.5V4a2 2 0 0 0-4 0v10" />
        <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    );
  }
  if (name === 'cut') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 2.5 22 4 10.5 15.5 8.5 13.5z" />
        <path d="m6.5 13 4.5 4.5" />
        <path d="m3 21 5-5" />
        <path d="M3 10c1.8-3.4 4.6-5.8 8.5-7" />
        <path d="M14 21c3.4-1.1 5.8-3.4 7-6.5" />
      </svg>
    );
  }
  if (name === 'gather') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-4 0" />
        <path d="M14 10V4a2 2 0 0 0-4 0v2" />
        <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
      </svg>
    );
  }
  if (name === 'hammer') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 12-8.4 8.4a2.1 2.1 0 0 1-3-3L12 9" />
        <path d="m18 15 4-4" />
        <path d="m21.5 11.5-1.9-1.9a2 2 0 0 1-.6-1.4V7l-2.3-2.3a6 6 0 0 0-4.2-1.7H9l.9.8A6.2 6.2 0 0 1 12 8.4V10l2 2h1.2a2 2 0 0 1 1.4.6l1.9 1.9" />
      </svg>
    );
  }
  if (name === 'move') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="m15 19-3 3-3-3" />
        <path d="m19 9 3 3-3 3" />
        <path d="M2 12h20" />
        <path d="m5 9-3 3 3 3" />
        <path d="m9 5 3-3 3 3" />
      </svg>
    );
  }
  if (name === 'cargo') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </svg>
    );
  }
  if (name === 'drop') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z" />
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
