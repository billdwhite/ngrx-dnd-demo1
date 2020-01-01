import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Store } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {UndoRedoModule} from './undo-redo/undo-redo.module';
import { NgrxModule } from './ngrx';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgrxModule,
        UndoRedoModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
