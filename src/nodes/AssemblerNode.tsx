import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '../store/types';
import { Card } from '../components/ui/card';

const AssemblerNode = ({ data }: NodeProps<NodeData>) => {
  return (
    <Card className="min-w-[150px] p-2 bg-blue-100 border-2 border-blue-500">
      <div className="font-bold text-center border-b border-blue-300 mb-2 pb-1">Assembler</div>
      <div className="text-xs">
          <div>In: {data.inputBuffer['Ingot']?.toFixed(1) || 0}</div>
          <div className="my-1 border-t border-blue-200"></div>
          <div>Out: {data.outputBuffer['Module']?.toFixed(1) || 0}</div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500"
      />
    </Card>
  );
};

export default memo(AssemblerNode);
