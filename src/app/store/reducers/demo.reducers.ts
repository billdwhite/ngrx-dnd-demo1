import * as DemoActions from '../actions/demo.actions';
import {InitialDemoState, DemoState} from '../states/demo.state';
import {Shape} from '../../model';
import produce from 'immer';

const initialDemoState: DemoState = InitialDemoState;


export function reducer(state: DemoState=initialDemoState, action: DemoActions.DemoActionsAll): DemoState {

    return produce(
    
        (draft: DemoState, action: DemoActions.DemoActionsAll): DemoState => {

            switch (action.type) {


                case DemoActions.ADD_SHAPE: {
                    break;
                }
                case DemoActions.ADD_SHAPE_SUCCESS: {
                    const addedShape: Shape = (<DemoActions.AddShapeSuccess>action).payload;
                    const updatedShapes = {
                        ...draft.shapes,
                        [addedShape.id]: addedShape
                    };
                    draft.shapes = updatedShapes;
                    break;
                }
                case DemoActions.ADD_SHAPE_ERROR: {
                    break;
                }

                

                case DemoActions.UPDATE_SHAPE: {
                    break;
                }
                case DemoActions.UPDATE_SHAPE_SUCCESS: {
                    const updatedShape: Shape = (<DemoActions.UpdateShapeSuccess>action).payload;
                    const updatedShapes = {
                        ...draft.shapes,
                        [updatedShape.id]: updatedShape
                    };
                    draft.shapes = updatedShapes;
                    break;
                }
                case DemoActions.UPDATE_SHAPE_ERROR: {
                    break;
                }
            }

            return draft;
        }
    )(state, action);
}