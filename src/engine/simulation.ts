import type { Node, Edge } from 'reactflow';
import type {
  FactoryNodeData,
  BeltData,
  MinerNodeData,
  RefinerNodeData,
  AssemblerNodeData,
  StorageNodeData,
  SplitterNodeData,
} from '../types/game';

const TICK_DELTA = 0.1; // 10 ticks per second = 0.1 seconds per tick

// Miner: produces ore from nothing
export function updateMiner(node: Node<MinerNodeData>, deltaTime: number): Partial<MinerNodeData> {
  const data = node.data;
  const outputBuffer = data.outputBuffers[0];
  
  if (!outputBuffer) return {};
  
  // Calculate production
  const produced = data.productionRate * deltaTime;
  const newAmount = Math.min(outputBuffer.amount + produced, outputBuffer.capacity);
  
  const newOutputBuffers = [{
    ...outputBuffer,
    amount: newAmount,
  }];
  
  // Update status
  const status = newAmount >= outputBuffer.capacity ? 'blocked' : 'producing';
  
  return {
    outputBuffers: newOutputBuffers,
    status,
  };
}

// Refiner: consumes ore, produces ingots
export function updateRefiner(node: Node<RefinerNodeData>, deltaTime: number): Partial<RefinerNodeData> {
  const data = node.data;
  const inputBuffer = data.inputBuffers[0];
  const outputBuffer = data.outputBuffers[0];
  
  if (!inputBuffer || !outputBuffer) return {};
  
  const recipe = data.recipe;
  const requiredInput = recipe.inputs.ore || 0;
  const producedOutput = recipe.outputs.ingots || 0;
  
  // Check if we can produce
  const canProduce = inputBuffer.amount >= requiredInput && 
                     outputBuffer.amount + producedOutput <= outputBuffer.capacity;
  
  if (!canProduce) {
    const status = inputBuffer.amount < requiredInput ? 'starved' :
                   outputBuffer.amount >= outputBuffer.capacity ? 'blocked' : 'idle';
    return { status, progress: 0 };
  }
  
  // Update progress
  const progressIncrement = (1 / recipe.processingTime) * (deltaTime / TICK_DELTA);
  let newProgress = data.progress + progressIncrement;
  
  let newInputAmount = inputBuffer.amount;
  let newOutputAmount = outputBuffer.amount;
  
  // Complete production
  if (newProgress >= 1.0) {
    newProgress = 0;
    newInputAmount -= requiredInput;
    newOutputAmount = Math.min(newOutputAmount + producedOutput, outputBuffer.capacity);
  }
  
  return {
    inputBuffers: [{
      ...inputBuffer,
      amount: newInputAmount,
    }],
    outputBuffers: [{
      ...outputBuffer,
      amount: newOutputAmount,
    }],
    progress: newProgress,
    status: 'producing',
  };
}

// Assembler: consumes ingots, produces modules
export function updateAssembler(node: Node<AssemblerNodeData>, deltaTime: number): Partial<AssemblerNodeData> {
  const data = node.data;
  const inputBuffer = data.inputBuffers[0];
  const outputBuffer = data.outputBuffers[0];
  
  if (!inputBuffer || !outputBuffer) return {};
  
  const recipe = data.recipe;
  const requiredInput = recipe.inputs.ingots || 0;
  const producedOutput = recipe.outputs.modules || 0;
  
  // Check if we can produce
  const canProduce = inputBuffer.amount >= requiredInput && 
                     outputBuffer.amount + producedOutput <= outputBuffer.capacity;
  
  if (!canProduce) {
    const status = inputBuffer.amount < requiredInput ? 'starved' :
                   outputBuffer.amount >= outputBuffer.capacity ? 'blocked' : 'idle';
    return { status, progress: 0 };
  }
  
  // Update progress
  const progressIncrement = (1 / recipe.processingTime) * (deltaTime / TICK_DELTA);
  let newProgress = data.progress + progressIncrement;
  
  let newInputAmount = inputBuffer.amount;
  let newOutputAmount = outputBuffer.amount;
  
  // Complete production
  if (newProgress >= 1.0) {
    newProgress = 0;
    newInputAmount -= requiredInput;
    newOutputAmount = Math.min(newOutputAmount + producedOutput, outputBuffer.capacity);
  }
  
  return {
    inputBuffers: [{
      ...inputBuffer,
      amount: newInputAmount,
    }],
    outputBuffers: [{
      ...outputBuffer,
      amount: newOutputAmount,
    }],
    progress: newProgress,
    status: 'producing',
  };
}

// Storage: forwards input buffers to output buffers
export function updateStorage(node: Node<StorageNodeData>): Partial<StorageNodeData> {
  const inputBuffer = node.data.inputBuffers[0];
  const outputBuffer = node.data.outputBuffers[0];

  if (!inputBuffer || !outputBuffer) return {};

  const needsAmountUpdate = outputBuffer.amount !== inputBuffer.amount;
  const needsTypeUpdate = outputBuffer.type !== inputBuffer.type;
  if (!needsAmountUpdate && !needsTypeUpdate) {
    return {};
  }

  return {
    outputBuffers: [{
      ...outputBuffer,
      type: inputBuffer.type,
      amount: inputBuffer.amount,
    }],
  };
}

// Splitter: distributes input to outputs in round-robin fashion
export function updateSplitter(node: Node<SplitterNodeData>): Partial<SplitterNodeData> {
  const data = node.data;
  const inputBuffer = data.inputBuffers[0];
  const outputBuffers = data.outputBuffers;

  if (!inputBuffer || outputBuffers.length === 0) return {};

  const resourceType = inputBuffer.type;
  let remainingInput = inputBuffer.amount;
  const updatedOutputs = outputBuffers.map(buf => ({
    ...buf,
    type: resourceType,
  }));
  const outputCount = updatedOutputs.length;
  let lastOutput = data.lastOutput;
  let nextOutputIndex = (lastOutput + 1) % outputCount;
  let emptyLoops = 0;

  while (remainingInput > 0 && emptyLoops < outputCount) {
    const buffer = updatedOutputs[nextOutputIndex];
    const space = buffer.capacity - buffer.amount;

    if (space > 0) {
      const transfer = Math.min(remainingInput, space);
      updatedOutputs[nextOutputIndex] = {
        ...buffer,
        amount: buffer.amount + transfer,
        type: resourceType,
      };
      remainingInput -= transfer;
      lastOutput = nextOutputIndex;
      emptyLoops = 0;
    } else {
      emptyLoops += 1;
    }

    nextOutputIndex = (nextOutputIndex + 1) % outputCount;
  }

  const outputsChanged = updatedOutputs.some((buf, idx) =>
    buf.amount !== outputBuffers[idx].amount || buf.type !== outputBuffers[idx].type
  );
  const inputChanged = remainingInput !== inputBuffer.amount;
  const lastOutputChanged = lastOutput !== data.lastOutput;

  if (!outputsChanged && !inputChanged && !lastOutputChanged) {
    return {};
  }

  return {
    inputBuffers: [{
      ...inputBuffer,
      amount: remainingInput,
    }],
    outputBuffers: updatedOutputs,
    lastOutput,
  };
}

// Belt transfer: moves resources from source output to target input
export function transferAlongBelt(
  edge: Edge<BeltData>,
  sourceNode: Node<FactoryNodeData>,
  targetNode: Node<FactoryNodeData>,
  deltaTime: number
): {
  sourceUpdate: Partial<FactoryNodeData>;
  targetUpdate: Partial<FactoryNodeData>;
  edgeUpdate: Partial<BeltData>;
} {
  const beltData = edge.data;
  if (!beltData) {
    return { sourceUpdate: {}, targetUpdate: {}, edgeUpdate: {} };
  }
  
  // Find source output buffer
  const sourceOutput = sourceNode.data.outputBuffers[0];
  if (!sourceOutput || sourceOutput.amount <= 0) {
    return {
      sourceUpdate: {},
      targetUpdate: {},
      edgeUpdate: { flowRate: 0 },
    };
  }
  
  // Determine resource type if not set
  const resourceType = beltData.resourceType || sourceOutput.type;
  
  // Find target input buffer matching the resource type
  let targetInput = targetNode.data.inputBuffers.find(b => b.type === resourceType);

  // Allow only storage and splitter nodes to act as wildcards
  const acceptsAny = ['storage', 'splitter'].includes(targetNode.data.type);
  if (!targetInput && acceptsAny && targetNode.data.inputBuffers.length > 0) {
    targetInput = targetNode.data.inputBuffers[0];
  }
  
  if (!targetInput) {
    return {
      sourceUpdate: {},
      targetUpdate: {},
      edgeUpdate: { resourceType, flowRate: 0 },
    };
  }
  
  // Calculate transfer amount
  const maxTransfer = beltData.throughput * deltaTime;
  const available = sourceOutput.amount;
  const space = targetInput.capacity - targetInput.amount;
  
  const transferAmount = Math.min(maxTransfer, available, space);
  
  if (transferAmount <= 0) {
    return {
      sourceUpdate: {},
      targetUpdate: {},
      edgeUpdate: { resourceType, flowRate: 0 },
    };
  }
  
  // Update buffers
  const newSourceOutput = {
    ...sourceOutput,
    amount: sourceOutput.amount - transferAmount,
  };
  
  const newTargetInput = {
    ...targetInput,
    type: resourceType,
    amount: targetInput.amount + transferAmount,
  };
  
  return {
    sourceUpdate: {
      outputBuffers: [newSourceOutput],
    },
    targetUpdate: {
      inputBuffers: targetNode.data.inputBuffers.map(b =>
        b.type === resourceType || (b === targetInput) ? newTargetInput : b
      ),
    },
    edgeUpdate: {
      resourceType,
      flowRate: transferAmount / deltaTime,
    },
  };
}

// Main simulation tick
export function simulateTick(
  nodes: Node<FactoryNodeData>[],
  edges: Edge<BeltData>[],
  deltaTime: number
): {
  nodeUpdates: Map<string, Partial<FactoryNodeData>>;
  edgeUpdates: Map<string, Partial<BeltData>>;
  modulesProduced: number;
} {
  const nodeUpdates = new Map<string, Partial<FactoryNodeData>>();
  const edgeUpdates = new Map<string, Partial<BeltData>>();
  let modulesProduced = 0;
  
  // Phase 1: Update production nodes
  for (const node of nodes) {
    let update: Partial<FactoryNodeData> = {};
    
    switch (node.data.type) {
      case 'miner':
        update = updateMiner(node as Node<MinerNodeData>, deltaTime);
        break;
      case 'refiner':
        update = updateRefiner(node as Node<RefinerNodeData>, deltaTime);
        break;
      case 'assembler':
        update = updateAssembler(node as Node<AssemblerNodeData>, deltaTime);
        // Track modules produced
        if (update.outputBuffers && node.data.outputBuffers[0]) {
          const oldAmount = node.data.outputBuffers[0].amount;
          const newAmount = update.outputBuffers[0].amount;
          if (newAmount > oldAmount) {
            modulesProduced += newAmount - oldAmount;
          }
        }
        break;
      case 'storage':
        update = updateStorage(node as Node<StorageNodeData>);
        break;
      case 'splitter':
        update = updateSplitter(node as Node<SplitterNodeData>);
    }
    
    if (Object.keys(update).length > 0) {
      nodeUpdates.set(node.id, update);
    }
  }
  
  // Phase 2: Transfer resources along belts
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) continue;
    
    // Apply pending updates before transfer
    const sourceUpdate = nodeUpdates.get(sourceNode.id);
    const updatedSource: Node<FactoryNodeData> = {
      ...sourceNode,
      data: {
        ...sourceNode.data,
        ...(sourceUpdate || {}),
      } as FactoryNodeData,
    };
    
    const targetUpdate = nodeUpdates.get(targetNode.id);
    const updatedTarget: Node<FactoryNodeData> = {
      ...targetNode,
      data: {
        ...targetNode.data,
        ...(targetUpdate || {}),
      } as FactoryNodeData,
    };
    
    const { sourceUpdate: newSourceUpdate, targetUpdate: newTargetUpdate, edgeUpdate } = transferAlongBelt(
      edge,
      updatedSource,
      updatedTarget,
      deltaTime
    );
    
    // Merge updates
    if (Object.keys(newSourceUpdate).length > 0) {
      const existing = nodeUpdates.get(sourceNode.id) || {};
      nodeUpdates.set(sourceNode.id, { ...existing, ...newSourceUpdate });
    }
    
    if (Object.keys(newTargetUpdate).length > 0) {
      const existing = nodeUpdates.get(targetNode.id) || {};
      nodeUpdates.set(targetNode.id, { ...existing, ...newTargetUpdate });
    }
    
    if (Object.keys(edgeUpdate).length > 0) {
      edgeUpdates.set(edge.id, edgeUpdate);
    }
  }
  
  return { nodeUpdates, edgeUpdates, modulesProduced };
}
