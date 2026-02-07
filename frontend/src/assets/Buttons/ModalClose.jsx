import React from "react";

export const ModalClose = ({ className }) => {
  return (
    <svg
      width="800px"
      height="800px"
      viewBox="0 0 24 24"
      className={`${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_429_11083)">
        <path
          d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006"
          stroke="#292929"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_429_11083">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
