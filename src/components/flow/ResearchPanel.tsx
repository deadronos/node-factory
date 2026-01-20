import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useGameStore } from '../../store/gameStore';
import type { NodeType } from '../../types/game';

const RESEARCH_COSTS: Record<NodeType, number> = {
  miner: 0,
  refiner: 0,
  assembler: 0,
  storage: 0,
  splitter: 100,
};

const RESEARCH_DESCRIPTIONS: Record<NodeType, string> = {
  miner: 'Basic ore extraction',
  refiner: 'Process ore into ingots',
  assembler: 'Assemble modules from ingots',
  storage: 'Store resources for buffering',
  splitter: 'Split one input into two outputs for parallel processing',
};

export function ResearchPanel() {
  const { research, economy, spendModules, unlockNode } = useGameStore();
  
  const handleUnlock = (nodeType: NodeType) => {
    const cost = RESEARCH_COSTS[nodeType];
    if (spendModules(cost)) {
      unlockNode(nodeType);
    } else {
      alert(`Not enough modules! Need ${cost}, have ${economy.modules.toFixed(1)}`);
    }
  };
  
  const lockedNodes: NodeType[] = ['splitter'].filter(
    (type) => !research.unlockedNodes.has(type as NodeType)
  ) as NodeType[];
  
  if (lockedNodes.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-4 bg-purple-50 border-purple-200">
      <h3 className="font-bold text-purple-900 mb-3">🔬 Research</h3>
      <div className="space-y-2">
        {lockedNodes.map((nodeType) => {
          const cost = RESEARCH_COSTS[nodeType];
          const canAfford = economy.modules >= cost;
          
          return (
            <div
              key={nodeType}
              className="flex items-center justify-between p-2 bg-white rounded border border-purple-200"
            >
              <div className="flex-1">
                <div className="font-semibold text-sm capitalize">{nodeType}</div>
                <div className="text-xs text-slate-600">
                  {RESEARCH_DESCRIPTIONS[nodeType]}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleUnlock(nodeType)}
                disabled={!canAfford}
                variant={canAfford ? "default" : "outline"}
              >
                Unlock ({cost}💚)
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
