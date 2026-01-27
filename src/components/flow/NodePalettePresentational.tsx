import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
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

interface NodePalettePresentationalProps {
  onAddNode: (type: NodeType) => void;
  researchUnlockedNodes: Set<NodeType>;
  economyModules: number;
  onSpend: (cost: number) => boolean;
}

export function NodePalettePresentational({
  onAddNode,
  researchUnlockedNodes,
  economyModules,
  onSpend,
}: NodePalettePresentationalProps) {
    const handleAddNode = (type: NodeType) => {
        const cost = NODE_COSTS[type].modules;
        if (onSpend(cost)) {
            onAddNode(type);
        } else {
            alert(`Not enough modules! Need ${cost}, have ${economyModules.toFixed(1)}`);
        }
    };
    
    const nodeTypes: NodeType[] = ['miner', 'refiner', 'assembler', 'storage', 'splitter'];
    
    return (
        <ButtonGroup>
          {nodeTypes.map(type => {
              const isUnlocked = researchUnlockedNodes.has(type);
              const cost = NODE_COSTS[type].modules;
              const canAfford = economyModules >= cost;
              
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