import {
    Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output,
    SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, ViewChild
} from '@angular/core';
import { DomSanitizer, SafeUrl, SafeStyle } from '@angular/platform-browser';
import { MoveStart, Dimensions, CropperPosition, CroppedEvent } from '../interfaces';

export type OutputType = 'base64' | 'file' | 'both';

export type Rect = { x1: number, y1: number, x2: number, y2: number }

@Component({
    selector: 'cropper',
    templateUrl: './cropper.component.html',
    styleUrls: ['./cropper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CropperComponent implements OnChanges {
    private moveStart: MoveStart;
    private maxSize: Dimensions;
    private cropperScaledMinWidth = 20;
    private cropperScaledMinHeight = 20;

    safeImgDataUrl: SafeUrl | string;
    marginLeft: SafeStyle | string = '0px';
    imageVisible = false;

    @Input() elementContainer: HTMLVideoElement;

    @Input() maintainAspectRatio = true;
    @Input() aspectRatio = 1;
    @Input() resizeToWidth = 0;
    @Input() cropperMinWidth = 0;
    @Input() roundCropper = false;
    @Input() onlyScaleDown = false;
    @Input() autoCrop = true;
    @Input() cropper: CropperPosition = {
        x1: -100,
        y1: -100,
        x2: 10000,
        y2: 10000
    };

    @Output() imageCropped = new EventEmitter<CroppedEvent>();
    @Output() cropperReady = new EventEmitter<void>();

    constructor(private sanitizer: DomSanitizer, private cd: ChangeDetectorRef, private zone: NgZone) {
        this.setCropperInitializationValues();
    }

    ngOnInit() {
        this.maxSize = {
            width: this.elementContainer.offsetWidth,
            height: this.elementContainer.offsetHeight
        };

        // this.cropper.x1 = 0;
        // this.cropper.y1 = 0;
        // this.cropper.x2 = this.maxSize.width;
        // this.cropper.y2 = this.maxSize.height;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.cropper) {
            this.setMaxSize();
            this.setCropperScaledMinSize();
            this.checkCropperPosition(false);
            this.doAutoCrop();
            this.cd.markForCheck();
        }
        if (changes.aspectRatio && this.imageVisible) {
            this.resetCropperPosition();
        }
    }

    @Input() set videoCropperSlice(videoCropper: Rect) {
        const divideRatio = this.elementContainer.videoWidth / this.elementContainer.offsetWidth;
        this.cropper.x1 = videoCropper.x1 / divideRatio;
        this.cropper.y1 = videoCropper.y1 / divideRatio;
        this.cropper.x2 = videoCropper.x2 / divideRatio;
        this.cropper.y2 = videoCropper.y2 / divideRatio;
        this.doAutoCrop();
        this.onResize();
        this.cd.markForCheck();
    }

    private setCropperInitializationValues() {
        this.moveStart = {
            active: false,
            type: null,
            position: null,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            clientX: 0,
            clientY: 0
        };
        this.maxSize = {
            width: 0,
            height: 0
        };

        this.cropper.x1 = -100;
        this.cropper.y1 = -100;
        this.cropper.x2 = 10000;
        this.cropper.y2 = 10000;
    }

    private checkImageMaxSizeRecursively(): void {
        if (this.elementContainer && this.elementContainer.offsetWidth > 0) {
            this.setMaxSize();
            this.setCropperScaledMinSize();
            this.resetCropperPosition();
            this.cropperReady.emit();
            this.cd.markForCheck();
        } else {
            setTimeout(() => {
                this.checkImageMaxSizeRecursively();
            }, 50);
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        this.resizeCropperPosition();
        this.setMaxSize();
        this.setCropperScaledMinSize();
    }

    private resizeCropperPosition(): void {
        const sourceImageElement = this.elementContainer
        if (this.maxSize.width !== sourceImageElement.offsetWidth || this.maxSize.height !== sourceImageElement.offsetHeight) {
            this.cropper.x1 = this.cropper.x1 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.x2 = this.cropper.x2 * sourceImageElement.offsetWidth / this.maxSize.width;
            this.cropper.y1 = this.cropper.y1 * sourceImageElement.offsetHeight / this.maxSize.height;
            this.cropper.y2 = this.cropper.y2 * sourceImageElement.offsetHeight / this.maxSize.height;
        }
    }

    private resetCropperPosition(): void {
        const sourceImageElement = this.elementContainer
        if (!this.maintainAspectRatio) {
            this.cropper.x1 = 0;
            this.cropper.x2 = sourceImageElement.offsetWidth;
            this.cropper.y1 = 0;
            this.cropper.y2 = sourceImageElement.offsetHeight;
        } else if (sourceImageElement.offsetWidth / this.aspectRatio < sourceImageElement.offsetHeight) {
            this.cropper.x1 = 0;
            this.cropper.x2 = sourceImageElement.offsetWidth;
            const cropperHeight = sourceImageElement.offsetWidth / this.aspectRatio;
            this.cropper.y1 = (sourceImageElement.offsetHeight - cropperHeight) / 2;
            this.cropper.y2 = this.cropper.y1 + cropperHeight;
        } else {
            this.cropper.y1 = 0;
            this.cropper.y2 = sourceImageElement.offsetHeight;
            const cropperWidth = sourceImageElement.offsetHeight * this.aspectRatio;
            this.cropper.x1 = (sourceImageElement.offsetWidth - cropperWidth) / 2;
            this.cropper.x2 = this.cropper.x1 + cropperWidth;
        }
        this.doAutoCrop();
        this.imageVisible = true;
    }

    startMove(event: any, moveType: string, position: string | null = null): void {
        event.preventDefault();
        this.moveStart = {
            active: true,
            type: moveType,
            position: position,
            clientX: this.getClientX(event),
            clientY: this.getClientY(event),
            ...this.cropper
        };
    }

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:touchmove', ['$event'])
    moveImg(event: any): void {
        if (this.moveStart.active) {
            event.stopPropagation();
            event.preventDefault();
            if (this.moveStart.type === 'move') {
                this.move(event);
                this.checkCropperPosition(true);
            } else if (this.moveStart.type === 'resize') {
                this.resize(event);
                this.checkCropperPosition(false);
            }
            this.cd.detectChanges();
        }
    }

    private setMaxSize(): void {
        const sourceImageElement = this.elementContainer;
        this.maxSize.width = sourceImageElement.offsetWidth;
        this.maxSize.height = sourceImageElement.offsetHeight;
        this.marginLeft = this.sanitizer.bypassSecurityTrustStyle('calc(50% - ' + this.maxSize.width / 2 + 'px)');
    }

    private setCropperScaledMinSize(): void {
        if (this.cropperMinWidth > 0) {
            this.cropperScaledMinWidth = Math.max(20, this.cropperMinWidth / this.elementContainer.clientWidth * this.maxSize.width);
            this.cropperScaledMinHeight = this.maintainAspectRatio
                ? Math.max(20, this.cropperScaledMinWidth / this.aspectRatio)
                : 20;
        } else {
            this.cropperScaledMinWidth = 20;
            this.cropperScaledMinHeight = 20;
        }
    }

    private checkCropperPosition(maintainSize = false): void {
        if (this.cropper.x1 < 0) {
            this.cropper.x2 -= maintainSize ? this.cropper.x1 : 0;
            this.cropper.x1 = 0;
        }
        if (this.cropper.y1 < 0) {
            this.cropper.y2 -= maintainSize ? this.cropper.y1 : 0;
            this.cropper.y1 = 0;
        }
        if (this.cropper.x2 > this.maxSize.width) {
            this.cropper.x1 -= maintainSize ? (this.cropper.x2 - this.maxSize.width) : 0;
            this.cropper.x2 = this.maxSize.width;
        }
        if (this.cropper.y2 > this.maxSize.height) {
            this.cropper.y1 -= maintainSize ? (this.cropper.y2 - this.maxSize.height) : 0;
            this.cropper.y2 = this.maxSize.height;
        }
    }

    @HostListener('document:mouseup')
    @HostListener('document:touchend')
    moveStop(): void {
        if (this.moveStart.active) {
            this.moveStart.active = false;
            this.doAutoCrop();
        }
    }

    private move(event: any) {
        const diffX = this.getClientX(event) - this.moveStart.clientX;
        const diffY = this.getClientY(event) - this.moveStart.clientY;

        this.cropper.x1 = this.moveStart.x1 + diffX;
        this.cropper.y1 = this.moveStart.y1 + diffY;
        this.cropper.x2 = this.moveStart.x2 + diffX;
        this.cropper.y2 = this.moveStart.y2 + diffY;
    }

    private resize(event: any): void {
        const diffX = this.getClientX(event) - this.moveStart.clientX;
        const diffY = this.getClientY(event) - this.moveStart.clientY;
        switch (this.moveStart.position) {
            case 'left':
                this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                break;
            case 'topleft':
                this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                break;
            case 'top':
                this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                break;
            case 'topright':
                this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                this.cropper.y1 = Math.min(this.moveStart.y1 + diffY, this.cropper.y2 - this.cropperScaledMinHeight);
                break;
            case 'right':
                this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                break;
            case 'bottomright':
                this.cropper.x2 = Math.max(this.moveStart.x2 + diffX, this.cropper.x1 + this.cropperScaledMinWidth);
                this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                break;
            case 'bottom':
                this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                break;
            case 'bottomleft':
                this.cropper.x1 = Math.min(this.moveStart.x1 + diffX, this.cropper.x2 - this.cropperScaledMinWidth);
                this.cropper.y2 = Math.max(this.moveStart.y2 + diffY, this.cropper.y1 + this.cropperScaledMinHeight);
                break;
        }

        if (this.maintainAspectRatio) {
            this.checkAspectRatio();
        }
    }

    private checkAspectRatio(): void {
        let overflowX = 0;
        let overflowY = 0;

        switch (this.moveStart.position) {
            case 'top':
                this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(0 - this.cropper.y1, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'bottom':
                this.cropper.x2 = this.cropper.x1 + (this.cropper.y2 - this.cropper.y1) * this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : (overflowX / this.aspectRatio);
                }
                break;
            case 'topleft':
                this.cropper.y1 = this.cropper.y2 - (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(0 - this.cropper.x1, 0);
                overflowY = Math.max(0 - this.cropper.y1, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x1 += (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'topright':
                this.cropper.y1 = this.cropper.y2 - (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(0 - this.cropper.y1, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y1 += (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'right':
            case 'bottomright':
                this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(this.cropper.x2 - this.maxSize.width, 0);
                overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x2 -= (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
            case 'left':
            case 'bottomleft':
                this.cropper.y2 = this.cropper.y1 + (this.cropper.x2 - this.cropper.x1) / this.aspectRatio;
                overflowX = Math.max(0 - this.cropper.x1, 0);
                overflowY = Math.max(this.cropper.y2 - this.maxSize.height, 0);
                if (overflowX > 0 || overflowY > 0) {
                    this.cropper.x1 += (overflowY * this.aspectRatio) > overflowX ? (overflowY * this.aspectRatio) : overflowX;
                    this.cropper.y2 -= (overflowY * this.aspectRatio) > overflowX ? overflowY : overflowX / this.aspectRatio;
                }
                break;
        }
    }

    private doAutoCrop(): void {
        if (this.autoCrop) {
            this.crop();
        }
    }

    crop(): CroppedEvent | Promise<CroppedEvent> | null {
        if (this.elementContainer) {

            const imagePosition = this.getImagePosition();
            const width = imagePosition.x2 - imagePosition.x1;
            const height = imagePosition.y2 - imagePosition.y1;

            const output = { width, height, imagePosition, cropperPosition: { ...this.cropper } };
            const resizeRatio = this.getResizeRatio(width);
            if (resizeRatio !== 1) {
                output.width = Math.floor(width * resizeRatio);
                output.height = Math.floor(height * resizeRatio);
            }
            this.imageCropped.emit(output);
        }
        return null;
    }

    private getImagePosition(): CropperPosition {
        const sourceImageElement = this.elementContainer;
        const ratio = this.elementContainer.videoWidth / sourceImageElement.offsetWidth;
        return {
            x1: Math.round(this.cropper.x1 * ratio),
            y1: Math.round(this.cropper.y1 * ratio),
            x2: Math.min(Math.round(this.cropper.x2 * ratio), this.elementContainer.videoWidth),
            y2: Math.min(Math.round(this.cropper.y2 * ratio), this.elementContainer.videoHeight)
        }
    }

    private getResizeRatio(width: number): number {
        return this.resizeToWidth > 0 && (!this.onlyScaleDown || width > this.resizeToWidth)
            ? this.resizeToWidth / width
            : 1;
    }

    private getClientX(event: any): number {
        return event.clientX || event.touches && event.touches[0] && event.touches[0].clientX;
    }

    private getClientY(event: any): number {
        return event.clientY || event.touches && event.touches[0] && event.touches[0].clientY;
    }
}
