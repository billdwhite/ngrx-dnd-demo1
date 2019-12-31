import {Action, ActionReducer, MetaReducer, ActionReducerMap} from '@ngrx/store';
import * as DemoReducer from './demo.reducers';
import {State} from '../states';

export * from './demo.reducers';

export const reducers: ActionReducerMap<State> = {
    demo: DemoReducer.reducer
}