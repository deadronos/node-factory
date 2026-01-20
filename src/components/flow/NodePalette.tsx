import React from 'react';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';

export function NodePalette({ addNode }: { addNode: (type: string) => void }) {
    return (
        <div>
        <ButtonGroup>
          <Button onClick={() => addNode('Miner')}>Miner</Button>
          <Button onClick={() => addNode('Refiner')}>Refiner</Button>
          <Button onClick={() => addNode('Assembler')}>Assembler</Button>
          <Button onClick={() => addNode('Storage')}>Storage</Button>
        </ButtonGroup>
        </div>
    )
}