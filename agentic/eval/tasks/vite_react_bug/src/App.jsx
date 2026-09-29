import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    // BUG: calls undefined 'setCounter' instead of 'setCount'
    setCounter(count + 1);
  };

  return (
    <div className="app">
      <h1>Counter</h1>
      <button onClick={handleIncrement}>Count: {count}</button>
    </div>
  );
}
