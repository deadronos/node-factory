import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { StorageNodeData } from '../../types/game';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

export const StorageNode = memo(({ data, selected }: NodeProps<StorageNodeData>) => {
  const buffer = data.inputBuffers[0] || data.outputBuffers[0];
  const fillPercentage = buffer ? (buffer.amount / buffer.capacity) * 100 : 0;

  return (
    <Card className={cn(
      "min-w-[180px] px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 border-2",
      selected ? "border-blue-500 shadow-lg" : "border-slate-300"
    )}>
      <div className="flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-800">📦 Storage</div>
          <div className="text-xs text-slate-600">Lv.{data.level}</div>
        </div>

        {/* Buffer Display */}
        {buffer && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="capitalize">{buffer.type}:</span>
              <span>{buffer.amount.toFixed(1)}/{buffer.capacity}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  buffer.type === 'ore' && "bg-amber-500",
                  buffer.type === 'ingots' && "bg-slate-500",
                  buffer.type === 'modules' && "bg-green-500"
                )}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        )}

        {!buffer && (
          <div className="text-xs text-slate-500 italic">
            Empty
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-slate-500 !border-2 !border-slate-700"
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

StorageNode.displayName = 'StorageNode';
