
import React from "react";
import "flag-icons/css/flag-icons.min.css";

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
    ...style,
  };

  // List of all supported country codes in flag-icons
  const isValidIsoAlpha2 = /^[a-z]{2}$/.test(cc);

  if (isValidIsoAlpha2) {
    return <span className={flagClass} style={flagStyle} aria-label={cc.toUpperCase() + " flag"} />;
  }
  // fallback
  return (
    <span
      className={className}
      style={{
        background: "#e5e7eb",
        borderRadius: rounded ? 4 : 0,
        width: size,
        height: Math.round(size * 0.75),
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      aria-label="No flag"
    />
  );
}
