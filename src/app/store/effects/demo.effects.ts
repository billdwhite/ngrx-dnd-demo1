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
    updateRoadmap: Observable<Action> = this.actions.pipe(
        ofType<DemoActions.UpdateShape>(DemoActions.UPDATE_SHAPE),
        map((action): DemoActions.UpdateShapeSuccess => {
            return new DemoActions.UpdateShapeSuccess(action.payload);
        }),
        catchError((err) => {
            return of(new DemoActions.UpdateShapeError(err));
        })
    )
}