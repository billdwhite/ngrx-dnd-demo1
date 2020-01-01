import {createFeatureSelector, createSelector, MemoizedSelector} from '@ngrx/store';
import {State, DemoState} from '../states';
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
    (shapeEntities: {[id: string]: Shape}): Shape[] => {
        return shapeEntities ? Object.values(shapeEntities) : [];
    }
);




export const getShapeForId = (idArg: string) => createSelector(
    getShapeEntities,
    (shapeEntities: {[id: string]: Shape}): Shape => {
        return shapeEntities ? shapeEntities[idArg] : null;
    }
);



export const getSelectedShapeId = createSelector(
    getDemoState,
    (state: DemoState): string => {
        return state ? state.selectedShapeId : null;
    }
)



export const getSelectedShape = createSelector(
    getShapeEntities,
    getSelectedShapeId,
    (shapeEntities: {[id: string]: Shape}, selectedId: string): Shape => {
        return shapeEntities && selectedId 
               ? shapeEntities[selectedId]
               : null;
    }
);
