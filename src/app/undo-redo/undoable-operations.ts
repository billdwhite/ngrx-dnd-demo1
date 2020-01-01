import * as DemoActions from '../ngrx/demo/demo.actions';
import {UndoableOperation} from './undoable.operation';

export const UNDOABLE_OPERATIONS: UndoableOperation[] =
  [
    {hint: 'Update shape', type: DemoActions.UPDATE_SHAPE},
    {hint: 'Update shape success', type: DemoActions.UPDATE_SHAPE_SUCCESS},
    {hint: 'Add shape', type: DemoActions.ADD_SHAPE},
    {hint: 'Add shape success', type: DemoActions.ADD_SHAPE_SUCCESS}
  ];
