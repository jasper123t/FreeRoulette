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
import RouletteWheelSVG from "./RouletteWheelSVG";
import { europeanSequence, americanSequence } from "./RouletteSequences";

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
  const phase1_Time_Base = 5000;
  const phase2_Time_Base = 9000;
  const phase3_Time_Base = 1500;

  // Wheel spin total duration is defined by Phase 1 + (Phase 2 * 0.5)
  const wheel_Time_Base = phase1_Time_Base + (phase2_Time_Base * 0.5);

  // Global speed multiplier (default to 1)
  const spd_mul = 1;

  const spinTimeSecond = wheel_Time_Base / 1000 / spd_mul;
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
    setRotation((prev) => prev + step);
  };

  // Expose spin() to parent
  useImperativeHandle(ref, () => ({
    spin() {
      setRotation((r) => r - (spinTimeSecond + rand()) * 360 * 3);

      const updateBallAngle = (delta: number | "correct") => {
        setBallAngle((prev) => {
          const current = prev[tableType];
          if (delta === "correct") {
            const correction =
              Math.round(current / angleStep) * angleStep - current;

            const tileNumber = Math.round(
              ((current + correction) % 360) / angleStep,
            );
            const activeSequence =
              tableType === "EU" ? europeanSequence : americanSequence;
            const spinResult = activeSequence[tileNumber];
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
      }, phase1_Time_Base / spd_mul);

      setTimeout(() => {
        setBallPhase(3);
        updateBallAngle("correct");
      }, (phase1_Time_Base + phase2_Time_Base) / spd_mul);

      setTimeout(
        () => {
          onSpinEnd();
        },
        (phase1_Time_Base + phase2_Time_Base + phase3_Time_Base) / spd_mul + 100 // ball stop after xs, button re-enable after x+0.1s
      );
    },
  }));

  return (
    <div className={styles.wheelContainer}>
      <RouletteWheelSVG
        svgRef={svgRef}
        rotation={rotation}
        ballAngle={ballAngle}
        ballPhase={ballPhase}
        tileCount={tileCount}
        angleStep={angleStep}
        isDragging={isDragging}
        isSpinning={isSpinning}
        isMouseDown={isMouseDown}
        tableType={tableType}
        spinTimeSecond={spinTimeSecond}
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
          setIsMouseDown(false);
        }}
        onWheel={(e) => {
          if (!isSpinning) {
            handleWheel(e);
          }
        }}
      />
    </div>
  );
});

export default RouletteWheel;
