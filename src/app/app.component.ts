import { Component, OnInit, Renderer2 as Renderer, ElementRef, ViewChild} from '@angular/core';
import { Action, select, Store } from '@ngrx/store';
import * as DemoStore from './store';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { take, distinctUntilChanged, tap, withLatestFrom, map } from 'rxjs/operators';
import { Shape, Metrics } from './model';
import * as DemoActions from './store/actions';
import { Utils } from './utils';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {


    @ViewChild('diagram', {static: true}) diagram: ElementRef;

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



    public handleClickAddShape(event: Event): void {
        let newShape: Shape = Shape.create(
            Utils.random4(),
            'New Shape',
            Metrics.create(
                Utils.randomNumberBetween(1, 500),
                Utils.randomNumberBetween(1, 500),
                Utils.randomNumberBetween(150, 300),
                Utils.randomNumberBetween(50, 200)
            )
        );
        this.store.dispatch(new DemoStore.AddShape(newShape));
    }



    public handleMouseDown(mouseShape: Shape, mouseEvent: MouseEvent): void {
        // reparent div to bring it to the top
        this.renderer.appendChild(this.diagram.nativeElement, mouseEvent.target);
        // get the offset of the mouse within the shape to drag it cleanly
        let offsetX: number = mouseEvent.x - mouseShape.metrics.x;
        let offsetY: number = mouseEvent.y - mouseShape.metrics.y;
        // listener to move shape
        let mouseMoveListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mousemove", (mouseMoveEvent: MouseEvent) => {
            let updatedShape: Shape = mouseShape.clone()
            let updatedMetrics: Metrics = mouseShape.metrics.clone()
            updatedMetrics.x = mouseMoveEvent.x - offsetX;
            updatedMetrics.y = mouseMoveEvent.y - offsetY;
            updatedShape.metrics = updatedMetrics;
            // HERE IS THE MAGIC
            this.store.dispatch(new DemoActions.UpdateShape(updatedShape))
        });

        let mouseupListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mouseup", (mouseUpEvent: MouseEvent) => {
            mouseMoveListener();
            mouseupListener();
        });
    }
}
