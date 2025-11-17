import React from "react";

export const Divider = ({
  orientation = "vertical",
  full, // when horizontal, the divider is full width
  height,
}: {
  orientation?: "vertical" | "horizontal";
  full?: boolean;
  height?: number;
}) => {
  const svgWidth = 14; // Fixed width/height of the SVG content
  const arrowHeight = 25.25; // Fixed height/width of the arrows
  const circleHeight = 12.7; // Fixed height/width of the circle

  const isVertical = orientation === "vertical";

  return (
    <div
      style={{
        position: "relative",
        width: isVertical ? `${svgWidth}px` : "100%",
        height:
          isVertical && height
            ? `${height}%`
            : isVertical
              ? "100%"
              : `${svgWidth}px`,
      }}
    >
      {/* First Arrow */}
      {(isVertical || full) && (
        <svg
          width={svgWidth}
          height={arrowHeight}
          style={{
            position: "absolute",
            ...(isVertical
              ? {
                  top: 0,
                  left: 0,
                }
              : {
                  top: -(svgWidth / 2) + 1,
                  left: 0,
                  transform: "translateX(50%) rotate(-90deg)",
                }),
          }}
          viewBox={`0 0 ${svgWidth} ${arrowHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.5394 4.90997C5.79946 7.57997 4.33957 10.7 1.40979 12.48C4.04959 13.34 5.54947 15.53 6.35941 17.34C5.85945 18.52 5.05951 19.69 3.80961 20.46C4.75954 20.76 5.45948 21.37 5.96944 22.04C6.65939 22.95 6.99936 24.09 6.99936 25.22L7.55932 25.25C7.55932 23.87 8.03929 22.52 9.00921 21.54C9.45918 21.09 10.0391 20.69 10.7491 20.46C9.49917 19.69 8.69924 18.52 8.17927 17.34C9.00921 15.52 10.4991 13.34 13.1489 12.48C10.2091 10.69 8.73923 7.56997 8.01929 4.90997C7.27934 2.22997 7.27934 0 7.27934 0C7.27934 0 7.27934 2.22997 6.5594 4.90997L6.5394 4.90997Z"
            fill="#6A573A"
          />
        </svg>
      )}

      {/* Second Arrow */}
      <svg
        width={svgWidth}
        height={arrowHeight}
        style={{
          position: "absolute",
          ...(isVertical
            ? {
                bottom: 0,
                left: 0,
                transform: "rotate(180deg)",
              }
            : {
                top: -(svgWidth / 2) + 1,
                right: 0,
                transform: "translateX(-50%) rotate(90deg)",
              }),
        }}
        viewBox={`0 0 ${svgWidth} ${arrowHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.5394 4.90997C5.79946 7.57997 4.33957 10.7 1.40979 12.48C4.04959 13.34 5.54947 15.53 6.35941 17.34C5.85945 18.52 5.05951 19.69 3.80961 20.46C4.75954 20.76 5.45948 21.37 5.96944 22.04C6.65939 22.95 6.99936 24.09 6.99936 25.22L7.55932 25.25C7.55932 23.87 8.03929 22.52 9.00921 21.54C9.45918 21.09 10.0391 20.69 10.7491 20.46C9.49917 19.69 8.69924 18.52 8.17927 17.34C9.00921 15.52 10.4991 13.34 13.1489 12.48C10.2091 10.69 8.73923 7.56997 8.01929 4.90997C7.27934 2.22997 7.27934 0 7.27934 0C7.27934 0 7.27934 2.22997 6.5594 4.90997L6.5394 4.90997Z"
          fill="#6A573A"
        />
      </svg>

      {/* Middle Circle */}
      <svg
        width={svgWidth}
        height={circleHeight}
        style={{
          position: "absolute",
          ...(isVertical
            ? {
                top: "50%",
                left: "50%",
                transform: "translateY(-50%) translateX(-50%)",
              }
            : {
                top: "50%",
                left: full ? "50%" : circleHeight / 2,
                transform: "translateY(-50%) translateX(-50%) rotate(-90deg)",
              }),
        }}
        viewBox={`0 0 ${svgWidth} ${circleHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.83944 6.35C9.83944 4.926 8.6889 3.77 7.26963 3.77C5.85037 3.77 4.69983 4.926 4.69983 6.35C4.69983 7.775 5.85037 8.93 7.26963 8.93C8.6889 8.93 9.83944 7.775 9.83944 6.35Z"
          fill="#6A573A"
        />
        <path
          d="M0.929809 6.35C0.929809 9.85 3.76959 12.7 7.26933 12.7C10.7691 12.7 13.6088 9.85 13.6088 6.35C13.6088 2.85 10.7691 0 7.26933 0C3.76959 0 0.929809 2.85 0.929809 6.35ZM11.409 6.35C11.409 8.64 9.55915 10.5 7.26933 10.5C4.9795 10.5 3.12964 8.64 3.12964 6.35C3.12964 4.06 4.9795 2.2 7.26933 2.2C9.55915 2.2 11.409 4.06 11.409 6.35Z"
          fill="#6A573A"
        />
      </svg>

      {/* First Line */}
      {(isVertical || full) && (
        <div
          style={{
            position: "absolute",
            ...(isVertical
              ? {
                  top: arrowHeight,
                  bottom: `calc(50% + ${circleHeight / 2}px)`,
                  left: "50%",
                  width: "2px",
                }
              : {
                  top: "50%",
                  left: arrowHeight,
                  right: `calc(50% + ${circleHeight / 2 - 1}px)`,
                  height: "2px",
                }),
            backgroundColor: "#6A573A",
            transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
          }}
        ></div>
      )}

      {/* Second Line */}
      <div
        style={{
          position: "absolute",
          ...(isVertical
            ? {
                top: `calc(50% + ${circleHeight / 2}px)`,
                bottom: arrowHeight,
                left: "50%",
                width: "2px",
              }
            : {
                left: full
                  ? `calc(50% + ${circleHeight / 2}px)`
                  : circleHeight - 1,
                right: arrowHeight,
                top: "50%",
                height: "2px",
              }),
          backgroundColor: "#6A573A",
          transform: isVertical ? "translateX(-50%)" : "translateY(-50%)",
        }}
      ></div>
    </div>
  );
};
