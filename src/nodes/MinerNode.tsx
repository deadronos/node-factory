import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../store/types';
import { Card } from '../components/ui/card';

const MinerNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <Card className="min-w-[150px] p-2 bg-slate-100 border-2 border-stone-500">
      <div className="font-bold text-center border-b border-stone-300 mb-2 pb-1">Miner</div>
      <div className="text-xs">
          <div>Out: {data.outputBuffer['Ore']?.toFixed(1) || 0}</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-stone-500"
      />
    </Card>
  );
};

export default memo(MinerNode);
