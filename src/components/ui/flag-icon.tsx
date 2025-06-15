
import React from "react";
import "flag-icons/css/flag-icons.min.css";

// TEMPORARY: For debug, render a static flag as a check and log.
export function FlagIcon({
  countryCode,
  className = "",
  size = 24,
  rounded = true,
  style,
}: {
  countryCode: string;
  className?: string;
  size?: number;
  rounded?: boolean;
  style?: React.CSSProperties;
}) {
  const cc = (countryCode || "").toLowerCase();

  // Debug: log the code to the console so we know what's being used
  console.log("[FlagIcon] rendering with code:", cc);

  // The fi fi-xx classes are used for all ISO 3166-1 alpha-2 codes
  // See: https://flagicons.lipis.dev/
  // Fallback to a gray rectangle if country is not found
  const flagClass = `fi fi-${cc} ${rounded ? "rounded-[4px]" : ""} ${className}`.trim();

  // flag-icons uses em for sizing, so use inline style to force dimension
  const flagStyle: React.CSSProperties = {
    width: size,
    height: Math.round(size * 0.75),
    display: "inline-block",
    lineHeight: 0,
    border: "1px solid #aaa", // Debug: show border for visibility
    ...style,
  };

  // List of all supported country codes in flag-icons
  const isValidIsoAlpha2 = /^[a-z]{2}$/.test(cc);

  return (
    <span style={{display: "inline-flex", alignItems: "center", gap: 8}}>
      {/* Static showcase: This always shows the Lebanon flag for CSS check */}
      <span
        className="fi fi-lb"
        style={{
          width: size,
          height: Math.round(size * 0.75),
          border: "2px dashed orange", // high visibility border for test
        }}
        aria-label="Lebanon flag showcase"
      />
      {/* Main dynamic flag */}
      {isValidIsoAlpha2 ? (
        <span className={flagClass} style={flagStyle} aria-label={cc.toUpperCase() + " flag"} />
      ) : (
        // fallback
        <span
          className={className}
          style={{
            background: "#e5e7eb",
            borderRadius: rounded ? 4 : 0,
            width: size,
            height: Math.round(size * 0.75),
            display: "inline-block",
            verticalAlign: "middle",
            border: "1px solid #aaa",
            ...style,
          }}
          aria-label="No flag"
        />
      )}
    </span>
  );
}
