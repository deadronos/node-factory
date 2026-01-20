import { useStore } from '../../store/useStore';
import { Card } from './card';

export function TopBar() {
  const wallet = useStore((state) => state.wallet);
  const lifetimeModules = useStore((state) => state.lifetimeModules);

  const GOAL = 50;
  const progress = Math.min((lifetimeModules / GOAL) * 100, 100);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
        <Card className="p-3 pointer-events-auto flex gap-6 items-center">
            <div className="font-bold text-xl text-blue-600">
                Modules: {wallet}
            </div>

            <div className="flex flex-col w-64">
                <div className="flex justify-between text-xs mb-1">
                    <span>Goal: Produce {GOAL} Modules</span>
                    <span>{lifetimeModules} / {GOAL}</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </Card>

        <Card className="p-3 pointer-events-auto">
             <div className="text-xs text-slate-500">
                 Hint: Connect Assembler Output to Storage to sell Modules.
             </div>
        </Card>
    </div>
  );
}
