import {Component, OnInit, Renderer2 as Renderer, ElementRef} from '@angular/core';
import {Action, select, Store} from '@ngrx/store';
import * as DemoStore from './store';
import {Observable, Subscription, forkJoin} from 'rxjs';
import {take, distinctUntilChanged, tap, withLatestFrom, map} from 'rxjs/operators';
import {Shape, Metrics} from './model';
import * as DemoActions from './store/actions'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {



  public shapes$: Observable<Shape[]>;


  constructor(public store: Store<DemoStore.DemoState>,
    private renderer: Renderer,
    private elementRef: ElementRef) {

  }


  ngOnInit() {
    this.shapes$ = this.store.pipe(select(DemoStore.getShapes));
  }


  public shapeTrackBy(index: number, shape: Shape): string {
    return shape ? shape.id : undefined;
  }



  public handleMouseDown(mouseShape: Shape, mouseEvent: MouseEvent): void {
    let offsetX: number = mouseEvent.x - mouseShape.metrics.x;
    let offsetY: number = mouseEvent.y - mouseShape.metrics.y;

    let mouseMoveListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mousemove",  (mouseMoveEvent: MouseEvent) => {
      let updatedShape: Shape = mouseShape.clone()
      let updatedMetrics: Metrics = mouseShape.metrics.clone()
      updatedMetrics.x = mouseMoveEvent.x-offsetX;
      updatedMetrics.y = mouseMoveEvent.y-offsetY;
      updatedShape.metrics = updatedMetrics;

      this.store.dispatch(new DemoActions.UpdateShape(updatedShape))
    });

    let mouseupListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mouseup",  (mouseUpEvent: MouseEvent) => {
      mouseMoveListener();
      mouseupListener();
    });
  }


  public update
}
