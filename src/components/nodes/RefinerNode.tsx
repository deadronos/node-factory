import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { RefinerNodeData } from '../../types/game';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export const RefinerNode = memo(({ data, selected }: NodeProps<RefinerNodeData>) => {
  const inputBuffer = data.inputBuffers[0];
  const outputBuffer = data.outputBuffers[0];
  const inputFill = inputBuffer ? (inputBuffer.amount / inputBuffer.capacity) * 100 : 0;
  const outputFill = outputBuffer ? (outputBuffer.amount / outputBuffer.capacity) * 100 : 0;

  return (
    <Card className={cn(
      "min-w-[180px] px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2",
      selected ? "border-blue-500 shadow-lg" : "border-blue-300"
    )}>
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-blue-800">🔧 Refiner</div>
          <div className="text-xs text-blue-600">Lv.{data.level}</div>
        </div>

        {/* Status */}
        <div className="text-xs text-blue-700">
          {data.status === 'producing' && '🟢 Refining'}
          {data.status === 'starved' && '🟡 Starved'}
          {data.status === 'blocked' && '🔴 Blocked'}
          {data.status === 'idle' && '⚪ Idle'}
        </div>

        {/* Progress Bar */}
        {data.status === 'producing' && (
          <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-100"
              style={{ width: `${data.progress * 100}%` }}
            />
          </div>
        )}

        {/* Input Buffer */}
        {inputBuffer && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-blue-700">
              <span>Ore In:</span>
              <span>{inputBuffer.amount.toFixed(1)}/{inputBuffer.capacity}</span>
            </div>
            <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${inputFill}%` }}
              />
            </div>
          </div>
        )}

        {/* Output Buffer */}
        {outputBuffer && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-blue-700">
              <span>Ingots Out:</span>
              <span>{outputBuffer.amount.toFixed(1)}/{outputBuffer.capacity}</span>
            </div>
            <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-500 transition-all duration-300"
                style={{ width: `${outputFill}%` }}
              />
            </div>
          </div>
        )}

        {/* Production Rate */}
        <div className="text-xs text-blue-600">
          ⚡ {data.productionRate.toFixed(1)}/s
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-amber-500 !border-2 !border-amber-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!bg-slate-500 !border-2 !border-slate-700"
      />
    </Card>
  );
});

RefinerNode.displayName = 'RefinerNode';
