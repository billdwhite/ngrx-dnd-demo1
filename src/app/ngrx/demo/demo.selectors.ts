import {createFeatureSelector, createSelector, MemoizedSelector} from '@ngrx/store';
import {DemoState} from './demo.state';
import {Shape} from '../../model';

const getDemoState: MemoizedSelector<object, DemoState>  = createFeatureSelector<DemoState>('demo');



export const getShapeEntities = createSelector(
    getDemoState,
    (state: DemoState): {[id: string]: Shape} => {
        return state ? state.shapes : {};
    }
);



export const getShapes = createSelector(
    getShapeEntities,
    (stateEntities: {[id: string]: Shape}): Shape[] => {
        return stateEntities ? Object.values(stateEntities) : [];
    }
);




export const getShapeForId = (idArg: string) => createSelector(
    getShapeEntities,
    (stateEntities: {[id: string]: Shape}): Shape => {
        return stateEntities ? stateEntities[idArg] : null;
    }
);
