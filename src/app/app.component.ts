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
    public diagramX: number = 0;
    public diagramY: number = 0;
    public diagramWidth: number = 700;
    public diagramHeight: number = 700;

    private undoHandler: Function;


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



    public handleClickUndo(event: Event): void {
        if (this.undoHandler) {
            console.log("undo");
            this.undoHandler();
            this.undoHandler = null;
        }
    }



    public handleMouseDown(mouseShape: Shape, mouseEvent: MouseEvent): void {
        // set drag limits 
        let boundingBox: {x: number, y: number, width: number, height: number} = {
            x: this.diagramX, 
            y: this.diagramY, 
            width: this.diagramWidth - mouseShape.metrics.width, 
            height: this.diagramHeight - mouseShape.metrics.height
        };

        // reparent div to bring it to the top
        this.renderer.appendChild(this.diagram.nativeElement, mouseEvent.target);
        
        // get the offset of the mouse within the shape to drag it cleanly
        let offsetX: number = mouseEvent.x - mouseShape.metrics.x;
        let offsetY: number = mouseEvent.y - mouseShape.metrics.y;
        // listener to move shape
        let mouseMoveListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mousemove", (mouseMoveEvent: MouseEvent) => {
            this.updateShape(mouseShape, mouseMoveEvent, offsetX, offsetY, boundingBox, false);
        });

        let killListeners: Function;

        let mouseUpListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mouseup", (mouseUpEvent: MouseEvent) => {
            this.updateShape(mouseShape, mouseUpEvent, offsetX, offsetY, boundingBox, false);
            killListeners();
        });

        let mouseLeaveListener: Function = this.renderer.listen(this.elementRef.nativeElement, "mouseleave", (mouseUpEvent: MouseEvent) => {
            this.updateShape(mouseShape, mouseUpEvent, offsetX, offsetY, boundingBox, false);
            killListeners();
        });

        killListeners = () => {
            mouseMoveListener();
            mouseUpListener();
            mouseLeaveListener();
        };

        this.updateShape(mouseShape, mouseEvent, offsetX, offsetY, boundingBox, true);
    }



    public updateShape(mouseShape: Shape, 
                       mouseMoveEvent: MouseEvent, 
                       offsetX: number, 
                       offsetY: number, 
                       boundingBox: {x: number, y: number, width: number, height: number},
                       allowUndo: boolean=false): void {
        let updatedShape: Shape = mouseShape.clone()
        let updatedMetrics: Metrics = mouseShape.metrics.clone()
        let updatedX: number = Math.max(boundingBox.x, Math.min(mouseMoveEvent.x - offsetX, boundingBox.width))
        let updatedY: number = Math.max(boundingBox.y, Math.min(mouseMoveEvent.y - offsetY, boundingBox.height))
        updatedMetrics.x = updatedX;
        updatedMetrics.y = updatedY;
        updatedShape.metrics = updatedMetrics;

        let updateAction: Action = new DemoActions.UpdateShape(updatedShape);

        if (allowUndo) {
            this.undoHandler = () => {
                this.store.dispatch(updateAction);
            }
        }

        // HERE IS THE MAGIC
        this.store.dispatch(updateAction);
    }
}
