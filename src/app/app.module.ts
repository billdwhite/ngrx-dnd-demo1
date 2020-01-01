import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Store } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './store/reducers';
import { DemoEffects } from './store/effects';
import {handleUndo, configureBufferSize} from 'ngrx-undo';

configureBufferSize(150);

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        // ngrx modules
        StoreModule.forRoot(
            reducers,
            {metaReducers: [handleUndo]}
        ),
        EffectsModule.forRoot([
            DemoEffects
        ])
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
