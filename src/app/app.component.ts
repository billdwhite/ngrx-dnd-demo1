import {Component, OnInit} from '@angular/core';
import {Action, select, Store} from '@ngrx/store';
import * as DemoStore from './store';
import {Observable, Subscription, forkJoin} from 'rxjs';
import {take, distinctUntilChanged, tap, withLatestFrom, map} from 'rxjs/operators';
import {Shape} from './model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {



  public shapes$: Observable<Shape[]>;


  constructor(public store: Store<DemoStore.DemoState>) {

  }


  ngOnInit() {
    this.shapes$ = this.store.pipe(select(DemoStore.getShapes));
  }


  public shapeTrackBy(index: number, shape: Shape): string {
    return shape ? shape.id : undefined;
}
}
