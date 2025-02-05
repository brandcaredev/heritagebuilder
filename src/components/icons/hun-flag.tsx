import * as React from "react";
const HunFlag = ({ width, height }: { width?: number; height?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="flag-icons-hu"
    viewBox="0 0 640 480"
    width={20}
    height={20}
  >
    <g fill-rule="evenodd">
      <path fill="#fff" d="M640 480H0V0h640z" />
      <path fill="#388d00" d="M640 480H0V320h640z" />
      <path fill="#d43516" d="M640 160.1H0V.1h640z" />
    </g>
  </svg>
);
export default HunFlag;
