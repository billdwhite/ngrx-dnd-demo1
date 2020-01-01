import { Shape, Metrics } from '../../model';

export interface DemoState {
    shapes: { [id: string]: Shape };
    selectedShapeId: string
}


export const InitialDemoState: DemoState = {
    shapes: {
        ['Shape_1']: Shape.create('Shape_1', 'Shape 1', new Metrics(20, 30, 150, 75, 0, 1, 1)),
        ['Shape_2']: Shape.create('Shape_2', 'Shape 2', new Metrics(320, 330, 120, 55, 0, 1, 1))
    },
    selectedShapeId: null
};
