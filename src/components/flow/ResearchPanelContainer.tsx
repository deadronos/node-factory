import { useGameStore } from '../../store/gameStore';
import { ResearchPanelPresentational } from './ResearchPanelPresentational';

export function ResearchPanel() {
  const { research, economy, spendModules, unlockNode } = useGameStore();
  
  return (
    <ResearchPanelPresentational
      researchUnlockedNodes={research.unlockedNodes}
      economyModules={economy.modules}
      onSpend={spendModules}
      onUnlockNode={unlockNode}
    />
  );
}
