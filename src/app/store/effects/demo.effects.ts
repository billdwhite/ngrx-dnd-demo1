import {Action, select, Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import * as DemoActions from '../actions/demo.actions';


@Injectable()
export class DemoEffects {

    constructor(private store: Store<any>,
                private actions: Actions) {
    }


    @Effect()
    addShape: Observable<Action> = this.actions.pipe(
        ofType<DemoActions.AddShape>(DemoActions.ADD_SHAPE),
        map((action): DemoActions.AddShapeSuccess => {
            return new DemoActions.AddShapeSuccess(action.payload);
        }),
        catchError((err) => {
            return of(new DemoActions.AddShapeError(err));
        })
    )

    

    @Effect()
    updateShape: Observable<Action> = this.actions.pipe(
        ofType<DemoActions.UpdateShape>(DemoActions.UPDATE_SHAPE),
        map((action): DemoActions.UpdateShapeSuccess => {
            return new DemoActions.UpdateShapeSuccess(action.payload);
        }),
        catchError((err) => {
            return of(new DemoActions.UpdateShapeError(err));
        })
    )

    

    @Effect()
    selectedShape: Observable<Action> = this.actions.pipe(
        ofType<DemoActions.SelectShape>(DemoActions.SELECT_SHAPE),
        map((action): DemoActions.SelectShapeSuccess => {
            return new DemoActions.SelectShapeSuccess(action.payload);
        }),
        catchError((err) => {
            return of(new DemoActions.SelectShapeError(err));
        })
    )
}