import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { StorePickerRoutingModule } from "./store-picker-routing.module";
import { StorePickerComponent } from "./store-picker.component";
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";



@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptHttpClientModule,
        StorePickerRoutingModule
    ],
    declarations: [
        StorePickerComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA,
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class StorePickerModule { }
