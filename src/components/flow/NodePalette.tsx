import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { useStore, NODE_COSTS } from '../../store/useStore';

export function NodePalette({ addNode }: { addNode: (type: string) => void }) {
    const wallet = useStore(state => state.wallet);

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-white p-2 rounded-lg shadow-xl border border-slate-200">
            <ButtonGroup>
            {Object.entries(NODE_COSTS).map(([type, cost]) => (
                <Button
                    key={type}
                    onClick={() => addNode(type)}
                    disabled={wallet < cost}
                    className="px-4"
                >
                    <div className="flex flex-col items-center">
                        <span className="font-bold">{type}</span>
                        <span className="text-xs opacity-70">{cost} M</span>
                    </div>
                </Button>
            ))}
            </ButtonGroup>
        </div>
    )
}
