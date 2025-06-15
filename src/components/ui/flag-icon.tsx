
import React from "react";

// SVGs for a selection of countries – you can expand as needed.
const SVG_FLAGS: Record<string, React.ReactNode> = {
  lb: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect y="0" width="24" height="4" fill="#f90"/>
      <rect y="14" width="24" height="4" fill="#f90"/>
      <rect y="4" width="24" height="10" fill="#fff"/>
      <path d="M12 6l1.6 4H10.4L12 6z" fill="#228c22"/>
      <rect x="11.15" y="11" width="1.7" height="2" rx="0.7" fill="#228c22"/>
    </svg>
  ),
  us: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect y="0" width="24" height="2.571" fill="#b22234"/>
      <rect y="2.571" width="24" height="2.285" fill="#fff"/>
      <rect y="4.857" width="24" height="2.285" fill="#b22234"/>
      <rect y="7.143" width="24" height="2.285" fill="#fff"/>
      <rect y="9.428" width="24" height="2.285" fill="#b22234"/>
      <rect y="11.714" width="24" height="2.286" fill="#fff"/>
      <rect y="14" width="24" height="2.286" fill="#b22234"/>
      <rect width="9.6" height="7.714" rx="1.5" fill="#3c3b6e"/>
      {/* 9 white stars */}
      <g fill="#fff">
        <circle cx="1.6" cy="1.285" r="0.42"/>
        <circle cx="3.2" cy="2.57" r="0.42"/>
        <circle cx="4.8" cy="1.285" r="0.42"/>
        <circle cx="6.4" cy="2.57" r="0.42"/>
        <circle cx="8" cy="1.285" r="0.42"/>
        <circle cx="2.4" cy="4" r="0.42"/>
        <circle cx="4" cy="4" r="0.42"/>
        <circle cx="5.6" cy="4" r="0.42"/>
        <circle cx="7.2" cy="4" r="0.42"/>
      </g>
    </svg>
  ),
  gb: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#ffffff"/>
      <rect width="24" height="18" rx="3" fill="#012169"/>
      <path fill="#fff" d="M0 2.25v1.2l20 12.3V12.6L0 2.25zM0 12.6v1.2l20-12.3V2.25L0 12.6z"/>
      <path fill="#c8102e" d="M0 2.9v0.8l20 12V14.9L0 2.9zm0 10.2v0.8l20-12V2.9L0 13.1z"/>
      <rect x="9.36" width="5.28" height="18" fill="#fff"/>
      <rect y="6.36" width="24" height="5.28" fill="#fff"/>
      <rect x="10.2" width="3.6" height="18" fill="#c8102e"/>
      <rect y="7.2" width="24" height="3.6" fill="#c8102e"/>
    </svg>
  ),
  fr: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect width="8" height="18" rx="3" fill="#0055a4"/>
      <rect x="16" width="8" height="18" rx="3" fill="#ef4135"/>
    </svg>
  ),
  ca: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect width="4" height="18" fill="#d52b1e"/>
      <rect x="20" width="4" height="18" fill="#d52b1e"/>
      <path d="M12 7.2l0.75 1.55h1.75l-1.4 1.15L13.65 12 12 10.3 10.35 12l0.55-2.1-1.4-1.15H11.25z" fill="#d52b1e"/>
    </svg>
  ),
  ae: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect width="8" height="18" fill="#ef2b2d"/>
      <rect x="8" width="16" height="6" fill="#00732f"/>
      <rect x="8" y="12" width="16" height="6" fill="#000"/>
    </svg>
  ),
  de: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect width="24" height="6" fill="#000"/>
      <rect y="6" width="24" height="6" fill="#dd0000"/>
      <rect y="12" width="24" height="6" fill="#ffce00"/>
    </svg>
  ),
  it: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect width="8" height="18" fill="#008c45"/>
      <rect x="16" width="8" height="18" fill="#cd212a"/>
    </svg>
  ),
  es: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#aa151b"/>
      <rect y="4" width="24" height="10" fill="#f1bf00"/>
    </svg>
  ),
  au: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
      <rect width="24" height="18" rx="3" fill="#012169"/>
      {/* Hint of UK flag and white star. */}
      <rect width="10" height="9" fill="#fff"/>
      <rect width="6" height="6" fill="#c8102e"/>
      <circle cx="20" cy="15" r="2" fill="#fff"/>
    </svg>
  ),
  jp: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="#fff">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <circle cx="12" cy="9" r="5" fill="#bc002d"/>
    </svg>
  ),
  in: (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="#fff">
      <rect width="24" height="18" rx="3" fill="#fff"/>
      <rect y="0" width="24" height="6" fill="#f93"/>
      <rect y="12" width="24" height="6" fill="#138808"/>
      <circle cx="12" cy="9" r="2.2" stroke="#008" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="9" r="0.9" fill="#008"/>
    </svg>
  ),
  // Add more SVGs as needed for your audience!
};

export function FlagIcon({ countryCode, className }: { countryCode: string; className?: string }) {
  const cc = (countryCode || "").toLowerCase();
  return (
    <span className={className} style={{ display: 'inline-block', width: 24, height: 18 }}>
      {SVG_FLAGS[cc] || (
        // Fallback: gray rounded rectangle if country not found
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
          <rect width="24" height="18" rx="3" fill="#d1d5db"/>
          <rect x="2" y="6" width="20" height="6" rx="2" fill="#9ca3af"/>
        </svg>
      )}
    </span>
  );
}
