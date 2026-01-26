import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { MinerNodeData } from '../../types/game';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export const MinerNode = memo(({ data, selected }: NodeProps<MinerNodeData>) => {
  const outputBuffer = data.outputBuffers[0];
  const fillPercentage = outputBuffer ? (outputBuffer.amount / outputBuffer.capacity) * 100 : 0;

  return (
    <Card className={cn(
      "min-w-[180px] px-4 py-3 bg-gradient-to-br from-amber-50 to-amber-100 border-2",
      selected ? "border-blue-500 shadow-lg" : "border-amber-300"
    )}>
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-amber-800">⛏️ Miner</div>
          <div className="text-xs text-amber-600">Lv.{data.level}</div>
        </div>

        {/* Status */}
        <div className="text-xs text-amber-700">
          {data.status === 'producing' && '🟢 Producing'}
          {data.status === 'blocked' && '🔴 Blocked'}
          {data.status === 'idle' && '⚪ Idle'}
        </div>

        {/* Output Buffer */}
        {outputBuffer && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-amber-700">
              <span>Ore:</span>
              <span>{outputBuffer.amount.toFixed(1)}/{outputBuffer.capacity}</span>
            </div>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Production Rate */}
        <div className="text-xs text-amber-600">
          ⚡ {data.productionRate.toFixed(1)}/s
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-amber-500 !border-2 !border-amber-700"
      />
    </Card>
  );
});

MinerNode.displayName = 'MinerNode';
