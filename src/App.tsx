import { useRef, useState, useCallback, type SetStateAction } from "react";
import "./App.css";

// import { spin } from "./utils/roulette"; //deprecated
import styles from "./App.module.css";
import { TableSelector } from "./components/TableSelector";
import RouletteWheel from "./components/RouletteWheel";

function App() {
  const [table, setTable] = useState<"EU" | "US">("EU");
  const [boxResult, setBoxResult] = useState<{
    EU: string | null;
    US: string | null;
  }>({ EU: null, US: null });
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<{ spin: () => void }>(null);

  const handleTableResult = useCallback(
    (result: string) => {
      setBoxResult((prev) => ({ ...prev, [table]: result }));
    },
    [table],
  );

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
        onTableResult={handleTableResult}
      />
      <div
        className={styles.box}
        // style={{ color: result !== null ? getColor(result) : 'white' }} // todo getColor
      >
        <span>{boxResult[table] ?? "?"}</span>
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
