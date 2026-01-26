import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { SplitterNodeData } from '../../types/game';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export const SplitterNode = memo(({ data, selected }: NodeProps<SplitterNodeData>) => {
  const inputBuffer = data.inputBuffers[0];
  const inputFill = inputBuffer ? (inputBuffer.amount / inputBuffer.capacity) * 100 : 0;

  return (
    <Card className={cn(
      "min-w-[180px] px-4 py-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2",
      selected ? "border-blue-500 shadow-lg" : "border-emerald-300"
    )}>
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-emerald-800">🔀 Splitter</div>
          <div className="text-xs text-emerald-600">Lv.{data.level}</div>
        </div>

        {/* Input Buffer */}
        {inputBuffer && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-emerald-700">
              <span className="capitalize">{inputBuffer.type}:</span>
              <span>{inputBuffer.amount.toFixed(1)}/{inputBuffer.capacity}</span>
            </div>
            <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  inputBuffer.type === 'ore' && "bg-amber-500",
                  inputBuffer.type === 'ingots' && "bg-slate-500",
                  inputBuffer.type === 'modules' && "bg-green-500"
                )}
                style={{ width: `${inputFill}%` }}
              />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-xs text-emerald-600">
          Round-robin: Output {data.lastOutput + 1}
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-emerald-500 !border-2 !border-emerald-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-1"
        style={{ top: '35%' }}
        className="!bg-emerald-500 !border-2 !border-emerald-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output-2"
        style={{ top: '65%' }}
        className="!bg-emerald-500 !border-2 !border-emerald-700"
      />
    </Card>
  );
});

SplitterNode.displayName = 'SplitterNode';
