import {Action} from '@ngrx/store';
import {Shape} from '../../model';

export const UPDATE_SHAPE           : string = '[Demo] UPDATE_SHAPE';
export const UPDATE_SHAPE_SUCCESS   : string = '[Demo] UPDATE_SHAPE_SUCCESS';
export const UPDATE_SHAPE_ERROR     : string = '[Demo] UPDATE_SHAPE_ERROR';




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



export type DemoActionsAll = UpdateShape | UpdateShapeSuccess | UpdateShapeError;