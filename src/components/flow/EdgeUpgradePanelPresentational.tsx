import { Button } from '../ui/button';
import { Card } from '../ui/card';
import type { Edge } from 'reactflow';
import type { BeltData } from '../../types/game';
import { BELT_UPGRADES } from '../../types/game';

interface EdgeUpgradePanelPresentationalProps {
  selectedEdge: Edge<BeltData> | null;
  onClose: () => void;
  economyModules: number;
  onSpend: (cost: number) => boolean;
  onUpdateEdgeData: (edgeId: string, updates: Partial<BeltData>) => void;
  onAlert: (msg: string) => void;
}

export function EdgeUpgradePanelPresentational({
  selectedEdge,
  onClose,
  economyModules,
  onSpend,
  onUpdateEdgeData,
  onAlert,
}: EdgeUpgradePanelPresentationalProps) {
  if (!selectedEdge || !selectedEdge.data) {
    return null;
  }
  
  const currentLevel = selectedEdge.data.level;
  const nextUpgrade = BELT_UPGRADES.find((u) => u.level === currentLevel + 1);
  
  const handleUpgrade = () => {
    if (!nextUpgrade) return;
    
    if (onSpend(nextUpgrade.cost)) {
      onUpdateEdgeData(selectedEdge.id, {
        level: nextUpgrade.level,
        throughput: nextUpgrade.throughput,
      });
      onClose();
    } else {
      onAlert(`Not enough modules! Need ${nextUpgrade.cost}, have ${economyModules.toFixed(1)}`);
    }
  };
  
  return (
    <Card className="absolute top-4 right-4 p-4 bg-white shadow-lg border-2 border-blue-300 z-10 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-blue-900">🔧 Belt Upgrade</h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 font-bold"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm">
          <div className="text-slate-600">Current Level:</div>
          <div className="font-semibold">
            Mk{currentLevel} - {selectedEdge.data.throughput.toFixed(1)} units/s
          </div>
        </div>
        
        {selectedEdge.data.resourceType && (
          <div className="text-sm">
            <div className="text-slate-600">Carrying:</div>
            <div className="font-semibold capitalize">{selectedEdge.data.resourceType}</div>
          </div>
        )}
        
        <div className="text-sm">
          <div className="text-slate-600">Flow Rate:</div>
          <div className="font-semibold">
            {selectedEdge.data.flowRate.toFixed(2)} units/s
            <span className="text-xs text-slate-500 ml-1">
              ({((selectedEdge.data.flowRate / selectedEdge.data.throughput) * 100).toFixed(0)}% capacity)
            </span>
          </div>
        </div>
        
        {nextUpgrade ? (
          <div className="pt-2 border-t">
            <div className="text-sm mb-2">
              <div className="text-slate-600">Next Level:</div>
              <div className="font-semibold text-green-700">
                Mk{nextUpgrade.level} - {nextUpgrade.throughput.toFixed(1)} units/s
              </div>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={economyModules < nextUpgrade.cost}
              className="w-full"
            >
              Upgrade ({nextUpgrade.cost}💚)
            </Button>
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic">
            Max level reached!
          </div>
        )}
      </div>
    </Card>
  );
}