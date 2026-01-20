
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { useGameStore } from '../../store/gameStore';
import type { NodeType } from '../../types/game';
import { NODE_COSTS } from '../../types/game';

const NODE_ICONS: Record<NodeType, string> = {
  miner: '⛏️',
  refiner: '🔧',
  assembler: '⚙️',
  storage: '📦',
  splitter: '🔀',
};

const NODE_LABELS: Record<NodeType, string> = {
  miner: 'Miner',
  refiner: 'Refiner',
  assembler: 'Assembler',
  storage: 'Storage',
  splitter: 'Splitter',
};

export function NodePalette({ addNode }: { addNode: (type: NodeType) => void }) {
    const { research, economy, spendModules } = useGameStore();
    
    const handleAddNode = (type: NodeType) => {
        const cost = NODE_COSTS[type].modules;
        if (spendModules(cost)) {
            addNode(type);
        } else {
            alert(`Not enough modules! Need ${cost}, have ${economy.modules.toFixed(1)}`);
        }
    };
    
    const nodeTypes: NodeType[] = ['miner', 'refiner', 'assembler', 'storage', 'splitter'];
    
    return (
        <ButtonGroup>
          {nodeTypes.map(type => {
              const isUnlocked = research.unlockedNodes.has(type);
              const cost = NODE_COSTS[type].modules;
              const canAfford = economy.modules >= cost;
              
              if (!isUnlocked) {
                  return (
                      <Button
                          key={type}
                          disabled
                          variant="outline"
                          className="opacity-50"
                      >
                          🔒 {NODE_LABELS[type]}
                      </Button>
                  );
              }
              
              return (
                  <Button
                      key={type}
                      onClick={() => handleAddNode(type)}
                      disabled={!canAfford}
                      variant={canAfford ? "default" : "outline"}
                      className={!canAfford ? "opacity-60" : ""}
                  >
                      {NODE_ICONS[type]} {NODE_LABELS[type]} ({cost}💚)
                  </Button>
              );
          })}
        </ButtonGroup>
    );
}