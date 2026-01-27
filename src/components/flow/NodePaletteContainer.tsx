import { useGameStore } from '../../store/gameStore';
import type { NodeType } from '../../types/game';
import { NodePalettePresentational } from './NodePalettePresentational';

export function NodePalette({ addNode }: { addNode: (type: NodeType) => void }) {
    const { research, economy, spendModules } = useGameStore();
    
    return (
        <NodePalettePresentational
            onAddNode={addNode}
            researchUnlockedNodes={research.unlockedNodes}
            economyModules={economy.modules}
            onSpend={spendModules}
        />
    );
}