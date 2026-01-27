import { useGameStore } from '../../store/gameStore';
import type { Edge } from 'reactflow';
import type { BeltData } from '../../types/game';
import { EdgeUpgradePanelPresentational } from './EdgeUpgradePanelPresentational';

interface EdgeUpgradePanelProps {
  selectedEdge: Edge<BeltData> | null;
  onClose: () => void;
}

export function EdgeUpgradePanel({ selectedEdge, onClose }: EdgeUpgradePanelProps) {
  const { economy, spendModules, updateEdgeData } = useGameStore();
  
  return (
    <EdgeUpgradePanelPresentational
      selectedEdge={selectedEdge}
      onClose={onClose}
      economyModules={economy.modules}
      onSpend={spendModules}
      onUpdateEdgeData={updateEdgeData}
      onAlert={(msg) => alert(msg)}
    />
  );
}
