import React from "react";

export const Details = (prop) => {
  return (
    <svg
      {...prop}
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22.2632C17.5228 22.2632 22 17.786 22 12.2632C22 6.74034 17.5228 2.26318 12 2.26318C6.47715 2.26318 2 6.74034 2 12.2632C2 17.786 6.47715 22.2632 12 22.2632Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16.2632V12.2632"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.26318H12.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
