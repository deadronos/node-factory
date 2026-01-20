import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Card } from "./components/ui/card";
import FlowCanvas from "./components/flow/FlowCanvas";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Card className="card">
          <h1>Node Factory</h1>
        </Card>
      </div>
      <div>
        <FlowCanvas />
      </div>
    </>
  );
}

export default App;
