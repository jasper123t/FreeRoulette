import { useRef, useState, type SetStateAction } from "react";
import "./App.css";

// import { spin } from "./utils/roulette"; //deprecated
import styles from "./App.module.css";
import { TableSelector } from "./components/TableSelector";
import RouletteWheel from "./components/RouletteWheel";

function App() {
  const [table, setTable] = useState<"EU" | "US">("EU");
  const [result, setResult] = useState<string | null>(null);
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
        isSpinning={isSpinning}
      />
      <RouletteWheel
        ref={wheelRef}
        tableType={table}
        onSpinEnd={() => setIsSpinning(false)}
        isSpinning={isSpinning}
        onResult={setResult}
      />
      <div
        className={styles.box}
      // style={{ color: result !== null ? getColor(result) : 'white' }} // todo getColor
      >
        <span>{result ?? "?"}</span>
      </div>

      <button
        className={styles.spinButton}
        onClick={callSpin}
        disabled={isSpinning}
        style={{ cursor: isSpinning ? "not-allowed" : "pointer" }}
      >
        {isSpinning ? "Spinning..." : "SPIN THE WHEEL"}
      </button>
    </div>
  );
}

export default App;
