import { getBezierPath, BaseEdge, Position } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { EdgeData } from '../store/types';

// Cubic Bezier interpolation
function getBezierPoint(t: number, p0: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}, p3: {x:number, y:number}) {
  const oneMinusT = 1 - t;
  const oneMinusTSq = oneMinusT * oneMinusT;
  const oneMinusTCu = oneMinusTSq * oneMinusT;
  const tSq = t * t;
  const tCu = tSq * t;

  const x = oneMinusTCu * p0.x + 3 * oneMinusTSq * t * p1.x + 3 * oneMinusT * tSq * p2.x + tCu * p3.x;
  const y = oneMinusTCu * p0.y + 3 * oneMinusTSq * t * p1.y + 3 * oneMinusT * tSq * p2.y + tCu * p3.y;
  return { x, y };
}

function getControlPoints(sourceX: number, sourceY: number, sourcePosition: Position, targetX: number, targetY: number, targetPosition: Position) {
    // Simplified logic similar to React Flow's internal logic
    // Assuming horizontal flow mostly
    const dist = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
    const minCurvature = 100;
    const maxCurvature = 500;

    // This is a rough approximation of React Flow's default curvature
    // In a real app we might want to match exactly or use straight edges for belts
    const curvature = Math.min(Math.max(dist * 0.25, minCurvature), maxCurvature);

    let p1 = { x: sourceX, y: sourceY };
    let p2 = { x: targetX, y: targetY };

    if (sourcePosition === Position.Right) p1.x += curvature;
    else if (sourcePosition === Position.Left) p1.x -= curvature;
    else if (sourcePosition === Position.Top) p1.y -= curvature;
    else if (sourcePosition === Position.Bottom) p1.y += curvature;

    if (targetPosition === Position.Right) p2.x += curvature;
    else if (targetPosition === Position.Left) p2.x -= curvature;
    else if (targetPosition === Position.Top) p2.y -= curvature;
    else if (targetPosition === Position.Bottom) p2.y += curvature;

    return { p1, p2 };
}

export default function ConveyorEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<EdgeData>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { p1, p2 } = getControlPoints(sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition);

  const items = data?.items || [];

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 4, stroke: '#555' }} />
      <g>
          {items.map((item) => {
             const pos = getBezierPoint(item.progress,
                 {x: sourceX, y: sourceY},
                 p1,
                 p2,
                 {x: targetX, y: targetY}
             );

             let color = '#888';
             if (item.type === 'Ingot') color = 'orange';
             if (item.type === 'Module') color = 'blue';

             return (
                 <circle
                    key={item.id}
                    cx={pos.x}
                    cy={pos.y}
                    r={3}
                    fill={color}
                    stroke="white"
                    strokeWidth={1}
                 />
             );
          })}
      </g>
    </>
  );
}
