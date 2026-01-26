import "./App.css";
import { Card } from "./components/ui/card";
import FlowCanvas from "./components/flow/FlowCanvas";

function App() {
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
