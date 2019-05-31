import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CropperComponent } from './cropper/cropper.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        CropperComponent
    ],
    exports: [
        CropperComponent
    ]
})
export class CropperModule {}