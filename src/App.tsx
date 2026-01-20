import "./App.css";
import FlowCanvas from "./components/flow/FlowCanvas";
import { TopBar } from "./components/ui/TopBar";

function App() {
  return (
    <div className="w-screen h-screen relative bg-slate-50 overflow-hidden">
      <TopBar />
      <FlowCanvas />
    </div>
  );
}

export default App;
