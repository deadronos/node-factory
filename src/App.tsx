import "./App.css";
import FlowCanvas from "./components/flow/FlowCanvas";
import { GameTopBar } from "./components/game/GameTopBar";

function App() {
  return (
    <div className="app-shell">
      <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-3 p-4">
        <GameTopBar />
        <div className="min-h-0 flex-1">
          <FlowCanvas />
        </div>
      </div>
    </div>
  );
}

export default App;
