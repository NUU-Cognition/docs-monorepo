import * as React from "react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * NUU Cognition Logo
 *
 * The distinctive V-shape mark representing NUU Cognition.
 */
export function Logo({ className, width = 32, height = 33 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 281 291"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NUU Cognition"
    >
      <path
        d="M137.498 291L71.1506 94.4027C66.7475 81.416 60.9434 68.6293 53.7382 56.0422C46.5331 43.4552 36.626 37.1617 24.0171 37.1617C18.0128 37.1617 11.4081 38.4603 4.203 41.0576L0 30.5685L74.7532 0L87.9626 0L166.919 230.462L215.854 130.665C224.86 112.684 229.363 98.5984 229.363 88.4088C229.363 80.2173 227.662 68.7291 224.26 53.9443C221.658 43.1555 220.357 35.0638 220.357 29.6694C220.357 9.88977 231.064 0 252.48 0C271.493 0 281 8.99072 281 26.9722C281 44.7539 267.791 78.7189 241.372 128.867L155.511 291L137.498 291Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}
