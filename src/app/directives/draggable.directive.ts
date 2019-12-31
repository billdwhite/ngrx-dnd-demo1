import {Directive, ElementRef, EventEmitter, Input, NgZone, TemplateRef, OnDestroy, OnInit, OnChanges, Output, Renderer2, ViewContainerRef, SimpleChanges,
    Inject, Optional} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject, Observable, merge, ReplaySubject, combineLatest } from 'rxjs';
import { map, mergeMap, takeUntil, filter, debounce, debounceTime, pairwise, take, share, count, takeLast, startWith } from 'rxjs/operators';
import { DraggableHelper } from './draggable-helper.provider';
import { DraggableScrollContainerDirective } from './draggable-scroll-container.directive';
import { Coordinates, ICoordinates, SnapGrid } from '../../../+model';


export interface DragPointerDownEvent extends ICoordinates { }

export interface DragStartEvent {
    cancelDrag$: ReplaySubject<void>;
}

export interface DragEndEvent extends ICoordinates {
    dragCancelled: boolean;
}

export interface DragMoveEvent extends ICoordinates { }

export type DragValidateFunction = (coordinates: ICoordinates) => boolean;

export interface DragPointerEvent {
    clientX: number;
    clientY: number;
    event: MouseEvent | TouchEvent;
}

const MOVE_CURSOR: string = 'move';


@Directive({
    selector: '[draggable]'
})

export class DraggableDirective implements OnInit, OnChanges, OnDestroy {


    @Input('dragElement')
        dragElement: Element;


    /**
     * Called when the element has started to be dragged. Only called after at least one mouse or touch move event
     */
    @Output('dragStart')
        dragStart = new EventEmitter<ICoordinates>();


    /**
     * Called when the element is being dragged
     */
    @Output('dragging')
        dragging = new EventEmitter<ICoordinates>();

    /**
     * Called after the element is dragged
     */
    @Output('dragEnd')
        dragEnd = new EventEmitter<ICoordinates>();



    dragPointerDownSubject$: Subject<DragPointerEvent> = new Subject<DragPointerEvent>();
    dragPointerMoveSubject$: Subject<DragPointerEvent> = new Subject<DragPointerEvent>();
    dragPointerUpSubject$: Subject<DragPointerEvent> = new Subject<DragPointerEvent>();



    private dragEventListenerSubscriptions: {
        mousemove?: () => void;
        mousedown?: () => void;
        mouseup?: () => void;
        mouseenter?: () => void;
        mouseleave?: () => void;
        touchstart?: () => void;
        touchmove?: () => void;
        touchend?: () => void;
        touchcancel?: () => void;
    } = {};



    constructor(private element: ElementRef<HTMLElement>,
                private renderer: Renderer2,
        private zone: NgZone,
        private vcr: ViewContainerRef,
        @Optional() private scrollContainer: DraggableScrollContainerDirective,
        @Inject(DOCUMENT) private document: any
    ) {
        if (this.dragElement == null) {
            this.dragElement = this.element.nativeElement;
        }
    }



    /**
     * @hidden
     */
    ngOnInit(): void {
        this.checkDragEventListeners();

        const pointerDrag$: Observable<any> = this.dragPointerDownSubject$.pipe(
            filter(() => this.canDrag()),
            mergeMap((pointerDownEvent: DragPointerEvent) => {
                // fix for https://github.com/mattlewis92/angular-draggable-droppable/issues/61
                // stop mouse events propagating up the chain
                if (pointerDownEvent.event.stopPropagation) {
                    pointerDownEvent.event.stopPropagation();
                }

                // hack to prevent text getting selected in safari while dragging
                const globalDragStyle: HTMLStyleElement = this.renderer.createElement('style');

                this.renderer.setAttribute(globalDragStyle, 'type', 'text/css');
                this.renderer.appendChild(
                    globalDragStyle,
                    this.renderer.createText(`
                  body * {
                   user-select: none;
                  }
                `)
                );
                this.document.head.appendChild(globalDragStyle);

                const startScrollPosition = this.getScrollPosition();

                const scrollContainerScroll$ = new Observable(observer => {
                    const scrollContainer = this.scrollContainer
                        ? this.scrollContainer.elementRef.nativeElement
                        : 'window';
                    return this.renderer.listen(scrollContainer, 'scroll', e =>
                        observer.next(e)
                    );
                }).pipe(
                    startWith(startScrollPosition),
                    map(() => this.getScrollPosition())
                );

                const currentDrag$: Subject<any> = new Subject();
                const cancelDrag$: ReplaySubject<void> = new ReplaySubject<void>();

                this.zone.run(() => {
                    this.dragPointerDown.next(<any>Coordinates.create(0, 0));
                });

                const dragComplete$ = merge(
                    this.dragPointerUpSubject$,
                    this.dragPointerDownSubject$,
                    cancelDrag$,
                    this.destroy$
                ).pipe(share());

                const pointerMove: Observable<ICoordinates> =
                    combineLatest([
                        this.dragPointerMoveSubject$,
                        scrollContainerScroll$
                    ]).pipe(
                        map(([pointerMoveEvent, scroll]) => {
                            // @TODO: find a way to have drag/resize block each other; should I register "currentResize" along with "currentDrag$" on a common helper and use that to discern which is active?
                            pointerMoveEvent.event.preventDefault();
                            pointerMoveEvent.event.stopImmediatePropagation();  // is this redundant with stopProp on line 463 ??
                            pointerMoveEvent.event.stopPropagation();
                            return <any>{
                                currentDrag$,
                                x: pointerMoveEvent.clientX - pointerDownEvent.clientX,
                                y: pointerMoveEvent.clientY - pointerDownEvent.clientY,
                                clientX: pointerMoveEvent.clientX,
                                clientY: pointerMoveEvent.clientY,
                                scrollLeft: scroll.left,
                                scrollTop: scroll.top
                            };
                        }),
                        map((moveData: any) => {
                            // console.log("drag dragSnapGrid", this.dragSnapGrid);
                            if (this.dragSnapGrid.x) {
                                moveData.x = Math.round(Math.ceil(moveData.x) / this.dragSnapGrid.x) * this.dragSnapGrid.x;
                                // moveData.x = Math.floor(moveData.x / this.dragSnapGrid.x) * this.dragSnapGrid.x;
                            }

                            if (this.dragSnapGrid.y) {
                                moveData.y = Math.round(Math.ceil(moveData.y) / this.dragSnapGrid.y) * this.dragSnapGrid.y;
                                // moveData.y = Math.floor(moveData.y / this.dragSnapGrid.y) * this.dragSnapGrid.y;
                            }

                            return moveData;
                        }),
                        map((moveData: ICoordinates) => {
                            if (!this.dragAxis.x) {
                                moveData.x = 0;
                            }

                            if (!this.dragAxis.y) {
                                moveData.y = 0;
                            }

                            return moveData;
                        }),
                        map((moveData: ICoordinates) => {
                            const scrollX = moveData.scrollLeft - startScrollPosition.left;
                            const scrollY = moveData.scrollTop - startScrollPosition.top;
                            return {
                                ...moveData,
                                x: moveData.x + scrollX,
                                y: moveData.y + scrollY
                            };
                        }),
                        filter(
                            ({ x, y, scrollLeft, scrollTop }) => !this.dragValidate || this.dragValidate(Coordinates.create(x, y, scrollLeft, scrollTop))
                        ),
                        takeUntil(dragComplete$),
                        share()
                    );

                const dragStarted$ = pointerMove.pipe(
                    take(1),
                    share()
                );
                /*.subscribe(() => {
                    pointerDownEvent.event.preventDefault();
                    this.zone.run(() => {
                        this.dragStart.next({ x: 0, y: 0 });
                        this.renderer.addClass(this.element.nativeElement, "dragging");
                    });
                    this.setDragCursor(this.dragCursor);
                    this.draggableHelper.currentDrag$.next(currentDrag$);
                });
    */
                const dragEnded$ = pointerMove.pipe(
                    takeLast(1),
                    share()
                );

                dragStarted$.subscribe(() => {
                    // pointerDownEvent.event.preventDefault();
                    this.zone.run(() => {
                        // this.dragStart.next({ cancelDrag$ });
                        this.dragStart.next(Coordinates.create(0, 0));
                        // this.renderer.addClass(this.element.nativeElement, "dragging");
                    });

                    this.setDragCursor(this.dragCursor);


                        const rect = this.element.nativeElement.getBoundingClientRect();
                        const clone = this.element.nativeElement.cloneNode(true) as HTMLElement;

                        this.element.nativeElement.parentNode!.insertBefore(
                            clone,
                            this.element.nativeElement.nextSibling
                        );

                        this.setElementStyles(clone, {
                            position: 'fixed',
                            top: `${rect.top}px`,
                            left: `${rect.left}px`,
                            width: `${rect.width}px`,
                            height: `${rect.height}px`,
                            cursor: this.dragCursor,
                            margin: '0'
                        });

                        dragEnded$.subscribe(() => {
                            clone.parentElement!.removeChild(clone);
                            this.renderer.setStyle(
                                this.element.nativeElement,
                                'visibility',
                                ''
                            );
                        });
                    }
                });

                dragEnded$.pipe(
                    mergeMap(dragEndData => {
                        const dragEndData$ = cancelDrag$.pipe(
                            count(),
                            take(1),
                            map(calledCount => ({
                                ...dragEndData,
                                dragCancelled: calledCount > 0
                            }))
                        );
                        cancelDrag$.complete();
                        return dragEndData$;
                    })
                ).subscribe(({ x, y, dragCancelled }) => {
                    this.zone.run(() => {
                        this.dragEnd.next(
                            Coordinates.create(x, y)
                        );
                    });
                    currentDrag$.complete();
                });

                merge(dragComplete$, dragEnded$).pipe(
                    take(1)
                ).subscribe(() => {
                    this.document.head.removeChild(globalDragStyle);
                });

                return pointerMove;
            }),
            share()
        );

        merge(
            pointerDrag$.pipe(
                take(1),
                map(value => [, value])
            ),
            pointerDrag$.pipe(pairwise())
        ).pipe(
            filter(([previous, next]) => {
                if (!previous) {
                    return true;
                }
                return previous.x !== next.x || previous.y !== next.y;
            }),
            map(([previous, next]) => next)
        ).subscribe(({ x, y, currentDrag$, clientX, clientY }) => {
            this.zone.run(() => {
                this.dragging.next(Coordinates.create(x, y));
            });
            if (this.dragGhostEnabled) {
                this.renderer.setStyle(
                    this.dragElement,
                    'pointerEvents',
                    'none'
                );
            }

            // @TODO: for now, we have disabled setDragCSSTransform() for now; let listeners do dragging on the other end
            // this.setDragCSSTransform(`translate(${x}px, ${y}px)`);
            // this.setDragCSSTransform('translate(' + clientX + ',' + clientY + ')');

            currentDrag$.next({
                clientX,
                clientY,
                dragData: this.dragData
            });
        });
    }



    ngOnChanges(changes: SimpleChanges): void {
        if (this._dragEnabled && changes.dragAxis) {
            this.checkDragEventListeners();
        }
    }



    ngOnDestroy(): void {
        this.unsubscribeDragEventListeners();
        this.dragPointerDownSubject$.complete();
        this.dragPointerMoveSubject$.complete();
        this.dragPointerUpSubject$.complete();
        this.destroy$.next();
    }



    private checkDragEventListeners(): void {
        const canDrag: boolean = this.canDrag();
        const hasEventListeners: boolean = Object.keys(this.dragEventListenerSubscriptions).length > 0;

        if (canDrag && !hasEventListeners) {
            this.zone.runOutsideAngular(() => {
                this.dragEventListenerSubscriptions.mousedown = this.renderer.listen(
                    this.dragElement,
                    'mousedown',
                    (event: MouseEvent) => {
                        console.log("drag: dragOnMouseDown");
                        this.dragOnMouseDown(event);
                    }
                );

                this.dragEventListenerSubscriptions.mouseup = this.renderer.listen(
                    'document',
                    'mouseup',
                    (event: MouseEvent) => {
                        this.dragOnMouseUp(event);
                    }
                );

                this.dragEventListenerSubscriptions.touchstart = this.renderer.listen(
                    this.dragElement,
                    'touchstart',
                    (event: TouchEvent) => {
                        this.dragOnTouchStart(event);
                    }
                );

                this.dragEventListenerSubscriptions.touchend = this.renderer.listen(
                    'document',
                    'touchend',
                    (event: TouchEvent) => {
                        this.dragOnTouchEnd(event);
                    }
                );

                this.dragEventListenerSubscriptions.touchcancel = this.renderer.listen(
                    'document',
                    'touchcancel',
                    (event: TouchEvent) => {
                        this.dragOnTouchEnd(event);
                    }
                );

                this.dragEventListenerSubscriptions.mouseenter = this.renderer.listen(
                    this.dragElement,
                    'mouseenter',
                    () => {
                        this.dragOnMouseEnter();
                    }
                );

                this.dragEventListenerSubscriptions.mouseleave = this.renderer.listen(
                    this.dragElement,
                    'mouseleave',
                    (event: MouseEvent) => {
                        this.dragOnMouseLeave(event);
                    }
                );
            });
        } else if (!canDrag && hasEventListeners) {
            this.unsubscribeDragEventListeners();
        }
    }



    private dragOnMouseDown(event: MouseEvent): void {
        if (!this.dragEventListenerSubscriptions.mousemove) {
            this.dragEventListenerSubscriptions.mousemove = this.renderer.listen(
                'document',
                'mousemove',
                (mouseMoveEvent: MouseEvent) => {
                    if (this.canDrag()) {
                        event.stopPropagation();
                        this.dragPointerMoveSubject$.next({
                            event: mouseMoveEvent,
                            clientX: mouseMoveEvent.clientX,
                            clientY: mouseMoveEvent.clientY
                        });
                    }
                }
            );
        }
        if (this.canDrag()) {
            // event.stopPropagation();
            this.dragPointerDownSubject$.next({
                event,
                clientX: event.clientX,
                clientY: event.clientY
            });
        }
    }



    private dragOnMouseUp(event: MouseEvent): void {
        // console.log("dragOnMouseUp", event);
        if (this.canDrag()) {
            // don't call event.stopPropagation(); since it blocks resize mouse up functionality
            if (this.dragEventListenerSubscriptions.mousemove) {
                this.dragEventListenerSubscriptions.mousemove();
                delete this.dragEventListenerSubscriptions.mousemove;
            }
            this.dragPointerUpSubject$.next({
                event,
                clientX: event.clientX,
                clientY: event.clientY
            });
            this.setDragCursor(null);
        }
    }



    private dragOnTouchStart(event: TouchEvent): void {
        if (!this.dragEventListenerSubscriptions.touchmove) {
            this.dragEventListenerSubscriptions.touchmove = this.renderer.listen(
                'document',
                'touchmove',
                (touchMoveEvent: TouchEvent) => {
                    if (this.canDrag()) {
                        this.dragPointerMoveSubject$.next({
                            event: touchMoveEvent,
                            clientX: touchMoveEvent.targetTouches[0].clientX,
                            clientY: touchMoveEvent.targetTouches[0].clientY
                        });
                    }
                }
            );
        }
        if (this.canDrag()) {
            this.dragPointerDownSubject$.next({
                event,
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            });
        }
    }



    private dragOnTouchEnd(event: TouchEvent): void {
        // console.log("dragOnTouchEnd", event);
        if (this.canDrag()) {
            if (this.dragEventListenerSubscriptions.touchmove) {
                this.dragEventListenerSubscriptions.touchmove();
                delete this.dragEventListenerSubscriptions.touchmove;
            }
            this.dragPointerUpSubject$.next({
                event,
                clientX: event.changedTouches[0].clientX,
                clientY: event.changedTouches[0].clientY
            });
        }
    }



    private dragOnMouseEnter(): void {
        if (this.canDrag()) {
            this.setDragCursor(this.dragCursor);
        }
    }



    private dragOnMouseLeave(event: MouseEvent): void {
        // console.log("dragOnMouseLeave", event);
        this.setDragCursor(null);
    }



    private setElementStyles(
        element: HTMLElement,
        styles: { [key: string]: string }
    ) {
        Object.keys(styles).forEach(key => {
            this.renderer.setStyle(element, key, styles[key]);
        });
    }



    private setDragCSSTransform(value: string): void {
        if (this.dragGhostEnabled) {
            /*
            const transformAttributes = [
                'transform',
                '-webkit-transform',
                '-ms-transform'
            ];
            transformAttributes.forEach(transformAttribute => {
                this.renderer.setStyle(
                    this.dragElement,
                    transformAttribute,
                    value
                );
            });
            */
            this.renderer.setAttribute(
                this.dragElement,
                'transform',
                value
            );
        }
    }



    private canDrag(): boolean {
        return this._dragEnabled && (this.dragAxis.x || this.dragAxis.y);
    }



    private setDragCursor(value: string | null): void {
        if (value) {
            this.renderer.addClass(this.dragElement, 'draggable');
        } else {
            this.renderer.removeClass(this.dragElement, 'draggable');
        }
    }



    private unsubscribeDragEventListeners(): void {
        Object.keys(this.dragEventListenerSubscriptions).forEach(type => {
            (this as any).dragEventListenerSubscriptions[type]();
            delete (this as any).dragEventListenerSubscriptions[type];
        });
    }



    private getScrollPosition() {
        if (this.scrollContainer) {
            return {
                top: this.scrollContainer.elementRef.nativeElement.scrollTop,
                left: this.scrollContainer.elementRef.nativeElement.scrollLeft
            };
        } else {
            return {
                top: window.pageYOffset || document.documentElement.scrollTop,
                left: window.pageXOffset || document.documentElement.scrollLeft
            };
        }
    }
}
