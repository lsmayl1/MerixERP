import * as React from "react";

const Logo = (props) => {
  return (
    <svg
      width={80}
      height={80}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M80 68.75V12.5L56.5803 31.6742V31.4932L23.2124 0H0V80L23.2124 59.7285V30.2262L40.4145 45.6109L56.5803 31.4932V31.6742V68.75H80Z"
        fill="black"
      />
    </svg>
  );
};

export default Logo;
