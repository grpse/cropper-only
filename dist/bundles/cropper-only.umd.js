(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/platform-browser')) :
    typeof define === 'function' && define.amd ? define('cropper-only', ['exports', '@angular/common', '@angular/core', '@angular/platform-browser'], factory) :
    (factory((global['cropper-only'] = {}),global.ng.common,global.ng.core,global.ng.platformBrowser));
}(this, (function (exports,common,core,platformBrowser) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var CropperComponent = /** @class */ (function () {
        function CropperComponent(sanitizer, cd, zone) {
            this.sanitizer = sanitizer;
            this.cd = cd;
            this.zone = zone;
            this.cropperScaledMinWidth = 20;
            this.cropperScaledMinHeight = 20;
            this.marginLeft = '0px';
            this.imageVisible = false;
            this.maintainAspectRatio = true;
            this.aspectRatio = 1;
            this.resizeToWidth = 0;
            this.cropperMinWidth = 0;
            this.roundCropper = false;
            this.onlyScaleDown = false;
            this.autoCrop = true;
            this.cropper = {
                x1: -100,
                y1: -100,
                x2: 10000,
                y2: 10000
            };
            this.imageCropped = new core.EventEmitter();
            this.cropperReady = new core.EventEmitter();
            this.setCropperInitializationValues();
        }
        /**
         * @return {?}
         */
        CropperComponent.prototype.ngOnInit = /**
         * @return {?}
         */
            function () {
                this.maxSize = {
                    width: this.elementContainer.offsetWidth,
                    height: this.elementContainer.offsetHeight
                };
                // this.cropper.x1 = 0;
                // this.cropper.y1 = 0;
                // this.cropper.x2 = this.maxSize.width;
                // this.cropper.y2 = this.maxSize.height;
            };
        /**
         * @param {?} changes
         * @return {?}
         */
        CropperComponent.prototype.ngOnChanges = /**
         * @param {?} changes
         * @return {?}
         */
            function (changes) {
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
            };
        Object.defineProperty(CropperComponent.prototype, "videoCropperSlice", {
            set: /**
             * @param {?} videoCropper
             * @return {?}
             */ function (videoCropper) {
                /** @type {?} */
                var divideRatio = this.elementContainer.videoWidth / this.elementContainer.offsetWidth;
                this.cropper.x1 = videoCropper.x1 / divideRatio;
                this.cropper.y1 = videoCropper.y1 / divideRatio;
                this.cropper.x2 = videoCropper.x2 / divideRatio;
                this.cropper.y2 = videoCropper.y2 / divideRatio;
                console.log('this.cropper', this.cropper);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.setCropperInitializationValues = /**
         * @private
         * @return {?}
         */
            function () {
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
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.checkImageMaxSizeRecursively = /**
         * @private
         * @return {?}
         */
            function () {
                var _this = this;
                if (this.elementContainer && this.elementContainer.offsetWidth > 0) {
                    this.setMaxSize();
                    this.setCropperScaledMinSize();
                    this.resetCropperPosition();
                    this.cropperReady.emit();
                    this.cd.markForCheck();
                }
                else {
                    setTimeout(( /**
                     * @return {?}
                     */function () {
                        _this.checkImageMaxSizeRecursively();
                    }), 50);
                }
            };
        /**
         * @return {?}
         */
        CropperComponent.prototype.onResize = /**
         * @return {?}
         */
            function () {
                this.resizeCropperPosition();
                this.setMaxSize();
                this.setCropperScaledMinSize();
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.resizeCropperPosition = /**
         * @private
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.elementContainer;
                if (this.maxSize.width !== sourceImageElement.offsetWidth || this.maxSize.height !== sourceImageElement.offsetHeight) {
                    this.cropper.x1 = this.cropper.x1 * sourceImageElement.offsetWidth / this.maxSize.width;
                    this.cropper.x2 = this.cropper.x2 * sourceImageElement.offsetWidth / this.maxSize.width;
                    this.cropper.y1 = this.cropper.y1 * sourceImageElement.offsetHeight / this.maxSize.height;
                    this.cropper.y2 = this.cropper.y2 * sourceImageElement.offsetHeight / this.maxSize.height;
                }
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.resetCropperPosition = /**
         * @private
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.elementContainer;
                if (!this.maintainAspectRatio) {
                    this.cropper.x1 = 0;
                    this.cropper.x2 = sourceImageElement.offsetWidth;
                    this.cropper.y1 = 0;
                    this.cropper.y2 = sourceImageElement.offsetHeight;
                }
                else if (sourceImageElement.offsetWidth / this.aspectRatio < sourceImageElement.offsetHeight) {
                    this.cropper.x1 = 0;
                    this.cropper.x2 = sourceImageElement.offsetWidth;
                    /** @type {?} */
                    var cropperHeight = sourceImageElement.offsetWidth / this.aspectRatio;
                    this.cropper.y1 = (sourceImageElement.offsetHeight - cropperHeight) / 2;
                    this.cropper.y2 = this.cropper.y1 + cropperHeight;
                }
                else {
                    this.cropper.y1 = 0;
                    this.cropper.y2 = sourceImageElement.offsetHeight;
                    /** @type {?} */
                    var cropperWidth = sourceImageElement.offsetHeight * this.aspectRatio;
                    this.cropper.x1 = (sourceImageElement.offsetWidth - cropperWidth) / 2;
                    this.cropper.x2 = this.cropper.x1 + cropperWidth;
                }
                this.doAutoCrop();
                this.imageVisible = true;
            };
        /**
         * @param {?} event
         * @param {?} moveType
         * @param {?=} position
         * @return {?}
         */
        CropperComponent.prototype.startMove = /**
         * @param {?} event
         * @param {?} moveType
         * @param {?=} position
         * @return {?}
         */
            function (event, moveType, position) {
                if (position === void 0) {
                    position = null;
                }
                event.preventDefault();
                this.moveStart = __assign({ active: true, type: moveType, position: position, clientX: this.getClientX(event), clientY: this.getClientY(event) }, this.cropper);
            };
        /**
         * @param {?} event
         * @return {?}
         */
        CropperComponent.prototype.moveImg = /**
         * @param {?} event
         * @return {?}
         */
            function (event) {
                if (this.moveStart.active) {
                    event.stopPropagation();
                    event.preventDefault();
                    if (this.moveStart.type === 'move') {
                        this.move(event);
                        this.checkCropperPosition(true);
                    }
                    else if (this.moveStart.type === 'resize') {
                        this.resize(event);
                        this.checkCropperPosition(false);
                    }
                    this.cd.detectChanges();
                }
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.setMaxSize = /**
         * @private
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.elementContainer;
                this.maxSize.width = sourceImageElement.offsetWidth;
                this.maxSize.height = sourceImageElement.offsetHeight;
                this.marginLeft = this.sanitizer.bypassSecurityTrustStyle('calc(50% - ' + this.maxSize.width / 2 + 'px)');
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.setCropperScaledMinSize = /**
         * @private
         * @return {?}
         */
            function () {
                if (this.cropperMinWidth > 0) {
                    this.cropperScaledMinWidth = Math.max(20, this.cropperMinWidth / this.elementContainer.clientWidth * this.maxSize.width);
                    this.cropperScaledMinHeight = this.maintainAspectRatio
                        ? Math.max(20, this.cropperScaledMinWidth / this.aspectRatio)
                        : 20;
                }
                else {
                    this.cropperScaledMinWidth = 20;
                    this.cropperScaledMinHeight = 20;
                }
            };
        /**
         * @private
         * @param {?=} maintainSize
         * @return {?}
         */
        CropperComponent.prototype.checkCropperPosition = /**
         * @private
         * @param {?=} maintainSize
         * @return {?}
         */
            function (maintainSize) {
                if (maintainSize === void 0) {
                    maintainSize = false;
                }
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
            };
        /**
         * @return {?}
         */
        CropperComponent.prototype.moveStop = /**
         * @return {?}
         */
            function () {
                if (this.moveStart.active) {
                    this.moveStart.active = false;
                    this.doAutoCrop();
                }
            };
        /**
         * @private
         * @param {?} event
         * @return {?}
         */
        CropperComponent.prototype.move = /**
         * @private
         * @param {?} event
         * @return {?}
         */
            function (event) {
                /** @type {?} */
                var diffX = this.getClientX(event) - this.moveStart.clientX;
                /** @type {?} */
                var diffY = this.getClientY(event) - this.moveStart.clientY;
                this.cropper.x1 = this.moveStart.x1 + diffX;
                this.cropper.y1 = this.moveStart.y1 + diffY;
                this.cropper.x2 = this.moveStart.x2 + diffX;
                this.cropper.y2 = this.moveStart.y2 + diffY;
            };
        /**
         * @private
         * @param {?} event
         * @return {?}
         */
        CropperComponent.prototype.resize = /**
         * @private
         * @param {?} event
         * @return {?}
         */
            function (event) {
                /** @type {?} */
                var diffX = this.getClientX(event) - this.moveStart.clientX;
                /** @type {?} */
                var diffY = this.getClientY(event) - this.moveStart.clientY;
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
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.checkAspectRatio = /**
         * @private
         * @return {?}
         */
            function () {
                /** @type {?} */
                var overflowX = 0;
                /** @type {?} */
                var overflowY = 0;
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
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.doAutoCrop = /**
         * @private
         * @return {?}
         */
            function () {
                if (this.autoCrop) {
                    this.crop();
                }
            };
        /**
         * @return {?}
         */
        CropperComponent.prototype.crop = /**
         * @return {?}
         */
            function () {
                if (this.elementContainer) {
                    /** @type {?} */
                    var imagePosition = this.getImagePosition();
                    /** @type {?} */
                    var width = imagePosition.x2 - imagePosition.x1;
                    /** @type {?} */
                    var height = imagePosition.y2 - imagePosition.y1;
                    /** @type {?} */
                    var output = { width: width, height: height, imagePosition: imagePosition, cropperPosition: __assign({}, this.cropper) };
                    /** @type {?} */
                    var resizeRatio = this.getResizeRatio(width);
                    if (resizeRatio !== 1) {
                        output.width = Math.floor(width * resizeRatio);
                        output.height = Math.floor(height * resizeRatio);
                    }
                    this.imageCropped.emit(output);
                }
                return null;
            };
        /**
         * @private
         * @return {?}
         */
        CropperComponent.prototype.getImagePosition = /**
         * @private
         * @return {?}
         */
            function () {
                /** @type {?} */
                var sourceImageElement = this.elementContainer;
                /** @type {?} */
                var ratio = this.elementContainer.videoWidth / sourceImageElement.offsetWidth;
                return {
                    x1: Math.round(this.cropper.x1 * ratio),
                    y1: Math.round(this.cropper.y1 * ratio),
                    x2: Math.min(Math.round(this.cropper.x2 * ratio), this.elementContainer.videoWidth),
                    y2: Math.min(Math.round(this.cropper.y2 * ratio), this.elementContainer.videoHeight)
                };
            };
        /**
         * @private
         * @param {?} width
         * @return {?}
         */
        CropperComponent.prototype.getResizeRatio = /**
         * @private
         * @param {?} width
         * @return {?}
         */
            function (width) {
                return this.resizeToWidth > 0 && (!this.onlyScaleDown || width > this.resizeToWidth)
                    ? this.resizeToWidth / width
                    : 1;
            };
        /**
         * @private
         * @param {?} event
         * @return {?}
         */
        CropperComponent.prototype.getClientX = /**
         * @private
         * @param {?} event
         * @return {?}
         */
            function (event) {
                return event.clientX || event.touches && event.touches[0] && event.touches[0].clientX;
            };
        /**
         * @private
         * @param {?} event
         * @return {?}
         */
        CropperComponent.prototype.getClientY = /**
         * @private
         * @param {?} event
         * @return {?}
         */
            function (event) {
                return event.clientY || event.touches && event.touches[0] && event.touches[0].clientY;
            };
        CropperComponent.decorators = [
            { type: core.Component, args: [{
                        selector: 'cropper',
                        template: "<div>\n        <!-- [style.margin-left]=\"alignImage === 'center' ? marginLeft : null\" -->\n        \n  <div class=\"cropper\"\n       [class.rounded]=\"roundCropper\"\n       [style.top.px]=\"cropper.y1\"\n       [style.left.px]=\"cropper.x1\"\n       [style.width.px]=\"cropper.x2 - cropper.x1\"\n       [style.height.px]=\"cropper.y2 - cropper.y1\"\n       [style.visibility]=\"'visible'\"\n  >\n      <div\n              (mousedown)=\"startMove($event, 'move')\"\n              (touchstart)=\"startMove($event, 'move')\"\n              class=\"move\"\n      >&nbsp;</div>\n      <span\n              class=\"resize topleft\"\n              (mousedown)=\"startMove($event, 'resize', 'topleft')\"\n              (touchstart)=\"startMove($event, 'resize', 'topleft')\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize top\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize topright\"\n              (mousedown)=\"startMove($event, 'resize', 'topright')\"\n              (touchstart)=\"startMove($event, 'resize', 'topright')\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize right\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize bottomright\"\n              (mousedown)=\"startMove($event, 'resize', 'bottomright')\"\n              (touchstart)=\"startMove($event, 'resize', 'bottomright')\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize bottom\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize bottomleft\"\n              (mousedown)=\"startMove($event, 'resize', 'bottomleft')\"\n              (touchstart)=\"startMove($event, 'resize', 'bottomleft')\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize left\"\n      ><span class=\"square\"></span></span>\n      <span\n              class=\"resize-bar top\"\n              (mousedown)=\"startMove($event, 'resize', 'top')\"\n              (touchstart)=\"startMove($event, 'resize', 'top')\"\n      ></span>\n      <span\n              class=\"resize-bar right\"\n              (mousedown)=\"startMove($event, 'resize', 'right')\"\n              (touchstart)=\"startMove($event, 'resize', 'right')\"\n      ></span>\n      <span\n              class=\"resize-bar bottom\"\n              (mousedown)=\"startMove($event, 'resize', 'bottom')\"\n              (touchstart)=\"startMove($event, 'resize', 'bottom')\"\n      ></span>\n      <span\n              class=\"resize-bar left\"\n              (mousedown)=\"startMove($event, 'resize', 'left')\"\n              (touchstart)=\"startMove($event, 'resize', 'left')\"\n      ></span>\n  </div>\n</div>\n",
                        changeDetection: core.ChangeDetectionStrategy.OnPush,
                        styles: [":host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}:host>div{position:relative;width:100%}:host>div img.source-image{max-width:100%;max-height:100%}:host .cropper{position:absolute;display:flex;color:#53535c;background:0 0;touch-action:none;outline:rgba(255,255,255,.3) solid 100vw}:host .cropper:after{position:absolute;content:'';top:0;bottom:0;left:0;right:0;pointer-events:none;border:1px dashed;opacity:.75;color:inherit;z-index:1}:host .cropper .move{width:100%;cursor:move;border:1px solid rgba(255,255,255,.5)}:host .cropper .resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .cropper .resize .square{display:inline-block;background:#53535c;width:6px;height:6px;border:1px solid rgba(255,255,255,.5);box-sizing:content-box}:host .cropper .resize.topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .cropper .resize.top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.topright{top:-12px;right:-12px;cursor:nesw-resize}:host .cropper .resize.right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .cropper .resize.bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .cropper .resize.bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .cropper .resize.bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .cropper .resize.left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .cropper .resize-bar{position:absolute;z-index:1}:host .cropper .resize-bar.top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper .resize-bar.bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .cropper .resize-bar.left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .cropper.rounded{outline-color:transparent}:host .cropper.rounded:after{border-radius:100%;box-shadow:0 0 0 100vw rgba(255,255,255,.3)}@media (orientation:portrait){:host .cropper{outline-width:100vh}:host .cropper.rounded:after{box-shadow:0 0 0 100vh rgba(255,255,255,.3)}}:host .cropper.rounded .move{border-radius:100%}"]
                    }] }
        ];
        /** @nocollapse */
        CropperComponent.ctorParameters = function () {
            return [
                { type: platformBrowser.DomSanitizer },
                { type: core.ChangeDetectorRef },
                { type: core.NgZone }
            ];
        };
        CropperComponent.propDecorators = {
            elementContainer: [{ type: core.Input }],
            maintainAspectRatio: [{ type: core.Input }],
            aspectRatio: [{ type: core.Input }],
            resizeToWidth: [{ type: core.Input }],
            cropperMinWidth: [{ type: core.Input }],
            roundCropper: [{ type: core.Input }],
            onlyScaleDown: [{ type: core.Input }],
            autoCrop: [{ type: core.Input }],
            cropper: [{ type: core.Input }],
            imageCropped: [{ type: core.Output }],
            cropperReady: [{ type: core.Output }],
            videoCropperSlice: [{ type: core.Input }],
            onResize: [{ type: core.HostListener, args: ['window:resize',] }],
            moveImg: [{ type: core.HostListener, args: ['document:mousemove', ['$event'],] }, { type: core.HostListener, args: ['document:touchmove', ['$event'],] }],
            moveStop: [{ type: core.HostListener, args: ['document:mouseup',] }, { type: core.HostListener, args: ['document:touchend',] }]
        };
        return CropperComponent;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var CropperModule = /** @class */ (function () {
        function CropperModule() {
        }
        CropperModule.decorators = [
            { type: core.NgModule, args: [{
                        imports: [
                            common.CommonModule
                        ],
                        declarations: [
                            CropperComponent
                        ],
                        exports: [
                            CropperComponent
                        ]
                    },] }
        ];
        return CropperModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.CropperModule = CropperModule;
    exports.CropperComponent = CropperComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=cropper-only.umd.js.map