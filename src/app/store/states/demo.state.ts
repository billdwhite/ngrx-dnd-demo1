import {Shape, Metrics} from '../../model';

export interface DemoState {
    shapes: { [id: string]: Shape };
}


export const InitialDemoState: DemoState = {
    shapes: {
        ['1']: Shape.create('1','Shape 1',new Metrics(20,30,150,75, 0, 1, 1)),
        ['2']: Shape.create('2','Shape 2',new Metrics(320,330,120,55, 0, 1, 1))
    }
};
