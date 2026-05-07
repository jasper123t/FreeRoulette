import {
  useImperativeHandle,
  useState,
  useRef,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import seedrandom from "seedrandom";

const RouletteWheel = forwardRef<
  { spin: () => void },
  {
    tableType: "EU" | "US";
    onSpinEnd: () => void;
    isSpinning: boolean;
  }
>(({ tableType, onSpinEnd, isSpinning }, ref) => {
  const [rotation, setRotation] = useState(0);
  const tileCount = tableType === "EU" ? 37 : 38;
  const angleStep = 360 / tileCount;
  const spinTimeSecond = 10;
  const rand = seedrandom(Date.now().toString());

  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastAngleRef = useRef<number | null>(null);

  const getAngle = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();

    // Compute center of wheel to avoid flexbox related issues
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Mouse position relative to center
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    // console.log(
    //   // "\tx:\t" + centerX + "\ty:\t" + centerY,
    //   //  +
    //   // "\tdx:\t" + dx + "\tdy:\t" + dy, // xy might be off due to flexbox or smt // seems fixed
    // );
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const angle = getAngle(e.clientX, e.clientY); // 0 is at 3 o'clock
      // console.log(
      //   "x:\t" + e.clientX + "\ty:\t" + e.clientY + "\tangle:\t" + angle,
      // );
      if (lastAngleRef.current !== null) {
        let delta = angle - lastAngleRef.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        setRotation((r) => r + delta);
      }
      lastAngleRef.current = angle;
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsMouseDown(false);
      document.body.style.cursor = "auto";
      lastAngleRef.current = null;
    };

    if (isDragging) {
      document.body.style.cursor = "grabbing";
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [getAngle, isDragging]);

  // Expose spin() to parent
  useImperativeHandle(ref, () => ({
    spin() {
      setRotation((r) => r - (spinTimeSecond + rand()) * 360 * 3);

      setTimeout(
        () => {
          onSpinEnd();
        },
        spinTimeSecond * 1000 + 500 + 100, // ball stop after 500ms, button re-enable after 100ms
      );
    },
  }));

  return (
    <svg
      ref={svgRef}
      width="300"
      height="300"
      viewBox="0 0 300 300"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isDragging
          ? "none"
          : `transform ${spinTimeSecond}s cubic-bezier(0, 1, 0, 1)`,
        transformBox: "fill-box",
        transformOrigin: "center",
        clipPath: "url(#circleMask)",
        // backgroundColor: "rgba(255, 0, 255, 1)", // color for debugging
        // outline: "1px solid rgba(255, 128, 255, 0.5)", // box for debugging
      }}
    >
      {Array.from({ length: tileCount }, (_, i) => {
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
        const textPos = polarToCartesian(150, 150, 120, 0);
        return (
          <g key={i}>
            <path
              d={describeRingSlice(
                150,
                150,
                100,
                140,
                i * angleStep,
                (i + 1) * angleStep,
              )}
              fill={fillColor}
              stroke="white"
            />
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="white"
              fontWeight="bold"
              // fontFamily="Arial, sans-serif" // later
              style={{ userSelect: "none" }}
              transform={`rotate(${(i + 0.5) * angleStep}, 150, 150)`}
            >
              {label}
            </text>
          </g>
        );
      })}
      <circle
        cx="150"
        cy="150"
        r="1"
        // fill="red" // center for debugging
      />
      <circle // hitbox circle
        cx="150"
        cy="150"
        r="150"
        fill="rgba(255,165,0,0)" // color for debug
        pointerEvents="visiblePainted" // only the circle area is clickable
        onMouseDown={(e) => {
          setIsMouseDown(true);
          if (!isSpinning) {
            setIsDragging(true);
            lastAngleRef.current = getAngle(e.clientX, e.clientY);
          }
        }}
        onMouseUp={() => {
          setIsMouseDown(false);
        }}
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
});

export default RouletteWheel;

// Helpers
const europeanSequence: string[] = [
  "0",
  "32",
  "15",
  "19",
  "4",
  "21",
  "2",
  "25",
  "17",
  "34",
  "6",
  "27",
  "13",
  "36",
  "11",
  "30",
  "8",
  "23",
  "10",
  "5",
  "24",
  "16",
  "33",
  "1",
  "20",
  "14",
  "31",
  "9",
  "22",
  "18",
  "29",
  "7",
  "28",
  "12",
  "35",
  "3",
  "26",
];

const americanSequence: string[] = [
  "0",
  "28",
  "9",
  "26",
  "30",
  "11",
  "7",
  "20",
  "32",
  "17",
  "5",
  "22",
  "34",
  "15",
  "3",
  "24",
  "36",
  "13",
  "1",
  "00",
  "27",
  "10",
  "25",
  "29",
  "12",
  "8",
  "19",
  "31",
  "18",
  "6",
  "21",
  "33",
  "16",
  "4",
  "23",
  "35",
  "14",
  "2",
];

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
