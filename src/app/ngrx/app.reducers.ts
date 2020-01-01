import {ActionReducerMap} from '@ngrx/store';
import {AppState} from './app.state';
import {reducer as demoReducer} from './demo/demo.reducers';

export const appReducer: ActionReducerMap<AppState> = {
  demo: demoReducer
};