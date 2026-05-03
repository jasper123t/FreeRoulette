import { useState } from 'react'
import './App.css'

import { spin } from './utils/roulette'
import styles from './App.module.css';

function App() {
  const [result, setResult] = useState<number | null>(null);

  const callSpin = () => {
    const num = spin();
    setResult(num);
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.box} 
        // style={{ color: result !== null ? getColor(result) : 'white' }}
      >
        {result ?? '?'}
      </div>
      
      <button className={styles.spinButton} onClick={callSpin}>
        SPIN THE WHEEL
      </button>
    </div>
  );
}

export default App
