import {Action} from '@ngrx/store';
import {Shape} from '../../model';

export const ADD_SHAPE              : string = '[Demo] ADD_SHAPE';
export const ADD_SHAPE_SUCCESS      : string = '[Demo] ADD_SHAPE_SUCCESS';
export const ADD_SHAPE_ERROR        : string = '[Demo] ADD_SHAPE_ERROR';

export const UPDATE_SHAPE           : string = '[Demo] UPDATE_SHAPE';
export const UPDATE_SHAPE_SUCCESS   : string = '[Demo] UPDATE_SHAPE_SUCCESS';
export const UPDATE_SHAPE_ERROR     : string = '[Demo] UPDATE_SHAPE_ERROR';



export class AddShape implements Action {
    readonly type = ADD_SHAPE;
    constructor(public payload: Shape) {}
}
export class AddShapeSuccess implements Action {
    readonly type = ADD_SHAPE_SUCCESS;
    constructor(public payload: Shape) {}
}
export class AddShapeError implements Action {
    readonly type = ADD_SHAPE_ERROR;
    constructor(public payload: string) {}
}



export class UpdateShape implements Action {
    readonly type = UPDATE_SHAPE;
    constructor(public payload: Shape) {}
}
export class UpdateShapeSuccess implements Action {
    readonly type = UPDATE_SHAPE_SUCCESS;
    constructor(public payload: Shape) {}
}
export class UpdateShapeError implements Action {
    readonly type = UPDATE_SHAPE_ERROR;
    constructor(public payload: string) {}
}



export type DemoActionsAll =  AddShape | AddShapeSuccess | AddShapeError 
                              | UpdateShape | UpdateShapeSuccess | UpdateShapeError;