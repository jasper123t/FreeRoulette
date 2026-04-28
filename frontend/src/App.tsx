import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <div>
        <h1>FreeRoulette</h1>
        <p>Welcome to your Vite + Bun + React starter app.</p>
        <div className="card">
          <button type="button" onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test Bun + Vite hot reload.
          </p>
        </div>
        <p className="read-the-docs">
          Click the button to verify the starter app is working.
        </p>
      </div>
    </div>
  );
}

export default App;
