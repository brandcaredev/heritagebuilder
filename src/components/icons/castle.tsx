import * as React from "react";
const Castle = ({ width, height }: { width?: number; height?: number }) => (
  <svg
    width={width || 64}
    height={height || 64}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.25 2V14.8571L19.5 22L17.75 32H9.5V23.4286H2V62H24.5V49.1429C24.5 44.4089 27.8579 40.5714 32 40.5714C36.1421 40.5714 39.5 44.4089 39.5 49.1429V62H62V23.4286H54.5V32H46.25L44.4999 22L50.75 14.8571V2H43.25V10.5714H35.75V2H28.25V10.5714H20.75V2H13.25Z"
      stroke="#5A452A"
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </svg>
);
export default Castle;
