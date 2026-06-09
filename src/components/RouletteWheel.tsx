import {
  useImperativeHandle,
  useState,
  useRef,
  forwardRef,
  useEffect,
  useCallback,
} from "react";
import seedrandom from "seedrandom";
import styles from "./RouletteWheel.module.css";

const RouletteWheel = forwardRef<
  { spin: () => void },
  {
    tableType: "EU" | "US";
    onSpinEnd: () => void;
    isSpinning: boolean;
    onTableResult?: (result: string) => void;
  }
>(({ tableType, onSpinEnd, isSpinning, onTableResult }, ref) => {
  const [rotation, setRotation] = useState(0);

  const [ballAngle, setBallAngle] = useState({ EU: 0, US: 0 });
  const [ballPhase, setBallPhase] = useState<0 | 1 | 2 | 3>(0);
  const [tableResult, setTableResult] = useState<string | null>(null);

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

  const onTableResultRef = useRef(onTableResult);
  useEffect(() => {
    onTableResultRef.current = onTableResult;
  }, [onTableResult]);

  useEffect(() => {
    if (tableResult !== null) {
      onTableResultRef.current?.(tableResult);
    }
  }, [tableResult]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      let angle = 0; // 0 is at 3 o'clock
      if ("touches" in e && e.touches.length > 0) {
        angle = getAngle(e.touches[0].clientX, e.touches[0].clientY);
      } else if ("clientX" in e) {
        angle = getAngle(e.clientX, e.clientY);
      }
      // console.log("angle:\t" + angle);

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
      window.addEventListener("touchmove", handleGlobalMouseMove);
      window.addEventListener("touchend", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalMouseMove);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [getAngle, isDragging]);

  const handleWheel = (e: React.WheelEvent<SVGCircleElement>) => {
    // find which half of the wheel the pointer is in
    const rect = svgRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const isLeftHalf = e.clientX < centerX;

    let step = e.deltaY / 20;
    if (!isLeftHalf) {
      step = -step;
    }
    setRotation(prev => prev + step);
  };

  // Expose spin() to parent
  useImperativeHandle(ref, () => ({
    spin() {
      setRotation((r) => r - (spinTimeSecond + rand()) * 360 * 3);

      const updateBallAngle = (delta: number | "correct") => {
        setBallAngle((prev) => {
          const current = prev[tableType];
          if (delta === "correct") {

            const correction = Math.round(current / angleStep) * angleStep - current

            const tileNumber = Math.round(((current + correction) % 360) / angleStep)
            const activeSequence = tableType === "EU" ? europeanSequence : americanSequence
            const spinResult = activeSequence[tileNumber]
            // Defer result update to next tick to avoid render phase update
            setTimeout(() => setTableResult(spinResult), 0);
            return {
              ...prev,
              [tableType]: current + correction,
            };
          } else {
            return {
              ...prev,
              [tableType]: current + delta,
            };
          }
        });
      };
      setBallPhase(1);
      updateBallAngle(5 * 360);

      setTimeout(() => {
        setBallPhase(2);
        updateBallAngle((spinTimeSecond + rand()) * 360);
      }, 5000);

      setTimeout(() => {
        setBallPhase(3);
        updateBallAngle("correct");
      }, 5000 + 9000);

      setTimeout(
        () => {
          onSpinEnd();
        },
        spinTimeSecond * 1000 + 5000 + 600, // ball stop after 15.5s, button re-enable after 15.6s
      );
    },
  }));

  const center = 150;
  const slotRadius = 115;
  const ballX = center;
  const ballY = center - slotRadius; // 12 o'clock position

  return (
    <div className={styles.wheelContainer}>
      <svg
        ref={svgRef}
        className={styles.wheelSvg}
        viewBox="0 0 300 300"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isDragging
            ? "none"
            : `transform ${spinTimeSecond}s cubic-bezier(0, 1, 0, 1)`,
        }}
      >
        <circle // outer ring
          className={styles.outerRing}
          cx="150"
          cy="150"
          r="145"
        />
        {Array.from({ length: tileCount }, (_, i) => { // tiles
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
            transition:
              !isSpinning ? "none" :
                ballPhase === 1
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
          onMouseDown={() => {
            setIsMouseDown(true);
            if (!isSpinning) {
              setIsDragging(true);
            }
          }}
          onTouchStart={() => {
            setIsMouseDown(true);
            if (!isSpinning) {
              setIsDragging(true);
            }
          }}

          onMouseUp={() => {
            setIsMouseDown(false);
          }}
          onTouchEnd={() => {
            setIsMouseDown(false)
          }}

          onWheel={(e) => {
            if (!isSpinning) {
              handleWheel(e);
            }
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
    </div>
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
