import React from "react";
import styles from "./RouletteWheel.module.css";
import { europeanSequence, americanSequence } from "./RouletteSequences";

interface RouletteWheelSVGProps {
  rotation: number;
  ballAngle: { EU: number; US: number };
  ballPhase: 0 | 1 | 2 | 3;
  tileCount: number;
  angleStep: number;
  isDragging: boolean;
  isSpinning: boolean;
  isMouseDown: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onMouseDown: () => void;
  onTouchStart: () => void;
  onMouseUp: () => void;
  onTouchEnd: () => void;
  onWheel: (e: React.WheelEvent<SVGCircleElement>) => void;
  tableType: "EU" | "US";
  spinTimeSecond: number;
}

const RouletteWheelSVG: React.FC<RouletteWheelSVGProps> = ({
  rotation,
  ballAngle,
  ballPhase,
  tileCount,
  angleStep,
  // isDragging,
  isSpinning,
  isMouseDown,
  svgRef,
  onMouseDown,
  onTouchStart,
  onMouseUp,
  onTouchEnd,
  onWheel,
  tableType,
  spinTimeSecond,
}) => {
  const center = 150;
  const slotRadius = 115;
  const ballX = center;
  const ballY = center - slotRadius; // 12 o'clock position

  return (
    <svg
      ref={svgRef}
      className={styles.wheelSvg}
      viewBox="0 0 300 300"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning
          ? `transform ${spinTimeSecond}s cubic-bezier(0, 1, 0, 1)`
          : "none",
        // backgroundColor: "rgba(255, 0, 255, 1)", // color for debugging
        // outline: "1px solid rgba(255, 128, 255, 0.5)", // box for debugging
      }}
    >
      <circle // outer ring
        className={styles.outerRing}
        cx="150"
        cy="150"
        r="145"
      />
      {Array.from({ length: tileCount }, (_, i) => {
        // tiles
        let fillColor =
          (i + Number(tableType === "EU")) % 2 === 0 ? "red" : "black";
        if (tableType === "EU" && i === 0) {
          fillColor = "green";
        }
        if (tableType === "US" && (i === 0 || i === 19)) {
          fillColor = "green";
        }

        let label: string;
        // label = i.toString(); // for debug
        if (tableType === "EU") {
          label = europeanSequence[i];
        } else {
          label = americanSequence[i];
        }

        // place number at 12 o'clock, then rotate to tile angle
        const textPos = polarToCartesian(150, 150, 135, 0);
        return (
          <g key={i}>
            <path // number part
              className={styles.wheelNumber}
              d={describeRingSlice(
                150,
                150,
                125,
                145,
                i * angleStep,
                (i + 1) * angleStep,
              )}
              fill={fillColor}
            />
            <path // slot part
              className={styles.wheelSlot}
              d={describeRingSlice(
                150,
                150,
                105,
                125,
                i * angleStep,
                (i + 1) * angleStep,
              )}
              fill={fillColor}
            />
            <text // number text
              className={styles.wheelText}
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="white"
              fontWeight="bold"
              // fontFamily="Arial, sans-serif" // later
              transform={`rotate(${(i + 0.5) * angleStep}, 150, 150)`}
            >
              {label}
            </text>
          </g>
        );
      })}
      <circle // center for debugging
        className={styles.wheelCenter}
        cx="150"
        cy="150"
        r="1"
      />
      <g // for spinning ball
        className={styles.ballGroup}
        style={{
          transform: `rotate(${ballAngle[tableType]}deg)`,
          transition: !isSpinning
            ? "none"
            : ballPhase === 1
              ? "transform 5s linear"
              : ballPhase === 2
                ? "transform 9s ease-out"
                : ballPhase === 3
                  ? "transform 1.5s cubic-bezier(.68,-0.55,.27,1.55)" // bounce
                  : "none",
        }}
      >
        <circle // ball
          className={styles.wheelBall}
          cx={ballX}
          cy={ballY}
          r={5}
          transform={`rotate(${0.5 * angleStep}, 150, 150)`} // initialise to slot 0
        />
      </g>
      <circle // hitbox circle
        className={styles.wheelHitbox}
        cx="150"
        cy="150"
        r="150"
        fill="rgba(255,165,0,0)" // color for debug
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        style={{
          cursor: isSpinning
            ? "not-allowed"
            : isMouseDown
              ? "grabbing"
              : "grab",
        }}
      />
    </svg>
  );
};

export default RouletteWheelSVG;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeRingSlice(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    startOuter.x,
    startOuter.y,
    "A",
    outerR,
    outerR,
    0,
    largeArcFlag,
    0,
    endOuter.x,
    endOuter.y,
    "L",
    endInner.x,
    endInner.y,
    "A",
    innerR,
    innerR,
    0,
    largeArcFlag,
    1,
    startInner.x,
    startInner.y,
    "Z",
  ].join(" ");
}
