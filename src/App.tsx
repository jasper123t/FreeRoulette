import { useState, type SetStateAction } from "react";
import "./App.css";

import { spin } from "./utils/roulette";
import styles from "./App.module.css";
import { TableSelector } from "./components/TableSelector";

function App() {
  const [table, setTable] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);

  const callSpin = () => {
    const num = spin(table);
    setResult(num);
  };

  return (
    <div className={styles.container}>
      <TableSelector
        current={table}
        onSelect={(val: SetStateAction<number>) => setTable(val)}
      />
      <div
        className={styles.box}
        // style={{ color: result !== null ? getColor(result) : 'white' }}
      >
        <span>{result ?? "?"}</span>
      </div>

      <button className={styles.spinButton} onClick={callSpin}>
        SPIN THE WHEEL
      </button>
    </div>
  );
}

export default App;
