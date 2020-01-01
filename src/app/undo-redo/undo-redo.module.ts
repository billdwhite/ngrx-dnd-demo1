import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {undoredoReducer} from './undo-redo.reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature('undoredo', undoredoReducer)
  ]
})
export class UndoRedoModule { }
