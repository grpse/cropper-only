import { CropperPosition } from "./cropper-position.interface";

export interface CroppedEvent {
    width: number;
    height: number;
    cropperPosition: CropperPosition;
    imagePosition: CropperPosition;
}