import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../store/types';
import { Card } from '../components/ui/card';

const RefinerNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <Card className="min-w-[150px] p-2 bg-orange-100 border-2 border-orange-500">
      <div className="font-bold text-center border-b border-orange-300 mb-2 pb-1">Refiner</div>
      <div className="text-xs">
          <div>In: {data.inputBuffer['Ore']?.toFixed(1) || 0}</div>
          <div className="my-1 border-t border-orange-200"></div>
          <div>Out: {data.outputBuffer['Ingot']?.toFixed(1) || 0}</div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-orange-500"
      />
    </Card>
  );
};

export default memo(RefinerNode);
