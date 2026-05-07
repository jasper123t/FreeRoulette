import { useRef, useState, type SetStateAction } from "react";
import "./App.css";

// import { spin } from "./utils/roulette"; //deprecated
import styles from "./App.module.css";
import { TableSelector } from "./components/TableSelector";
import RouletteWheel from "./components/RouletteWheel";

function App() {
  const [table, setTable] = useState<"EU" | "US">("EU");
  // const [result, setResult] = useState<number | null>(null); // might need to redo logic
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<{ spin: () => void }>(null);

  const callSpin = () => {
    if (!isSpinning) {
      setIsSpinning(true);
      wheelRef.current?.spin();
    }
  };

  return (
    <div className={styles.container}>
      <TableSelector
        current={table}
        onSelect={(selectedTable: SetStateAction<"EU" | "US">) =>
          setTable(selectedTable)
        }
      />
      <RouletteWheel
        ref={wheelRef}
        tableType={table}
        onSpinEnd={() => setIsSpinning(false)}
        isSpinning={isSpinning}
      />
      <div
        className={styles.box}
        // style={{ color: result !== null ? getColor(result) : 'white' }} // todo getColor
      >
        {/* <span>{result ?? "?"}</span> */}
        <span>"?"</span>
      </div>

      <button
        className={styles.spinButton}
        onClick={callSpin}
        disabled={isSpinning}
      >
        {isSpinning ? "Spinning..." : "SPIN THE WHEEL"}
      </button>
    </div>
  );
}

export default App;
