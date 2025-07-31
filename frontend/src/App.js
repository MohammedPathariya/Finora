import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("…checking…");

  useEffect(() => {
    fetch("/health")
      .then(res => res.json())
      .then(json => setStatus(`${json.service}: ${json.status}`))
      .catch(err => setStatus(`Error: ${err.message}`));
  }, []);

  return (
    <div>
      <h1>Finora UI (Local)</h1>
      <p>Backend status: <strong>{status}</strong></p>
    </div>
  );
}

export default App;
