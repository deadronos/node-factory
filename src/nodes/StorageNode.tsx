import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../store/types';
import { Card } from '../components/ui/card';

const StorageNode = ({ data }: NodeProps<NodeData>) => {
    // Show total items
    const totalItems = Object.values(data.inputBuffer).reduce((a, b) => a + b, 0) +
                       Object.values(data.outputBuffer).reduce((a, b) => a + b, 0);

  return (
    <Card className="min-w-[150px] p-2 bg-slate-200 border-2 border-slate-600">
      <div className="font-bold text-center border-b border-slate-400 mb-2 pb-1">Storage</div>
      <div className="text-xs text-center">
          <div className="text-lg font-mono">{totalItems.toFixed(0)}</div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-slate-600"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-slate-600"
      />
    </Card>
  );
};

export default memo(StorageNode);
