// MIT License
//
// Copyright (c) 2016 Akshay Chavan
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var SICjs = (function SICjs() {

    // Canvas Id
    var canvasId = "";
    // Canvas Object
    var canvasObj = null;
    // ctxd Object
    var ctxdObj = null;
    // Rect color
    var rectcolor = '#FF0000';

    // Limits on the canvas
    var keepWithin = {};
    // Position of the canvas
    var cPos = {};
    // To store rectangle
    var rect = {};
    // Initialize rect width and height to zero
    rect.w = 0;
    rect.h = 0;
    // To store rectangle anchor point
    // Used only while dragging the whole rectangle
    var anchor = {};
    // Selection marker size
    var sBlk = 4;

    // FLAGS
    // Rect already present
    var active = false;
    // Drag for rect resize in progress
    var drag = false;
    // Marker flags by positions
    var TL = false;
    var TM = false;
    var TR = false;
    var LM = false;
    var RM = false;
    var BL = false;
    var BM = false;
    var BR = false;
    var hold = false;

    // Return the constructor
    return function constructor(canvasidIn, canvasObjIn, ctxdIn, rColorIn) {

        // Set canvasId variable
        canvasId = "#" + canvasidIn;
        // Set canvasObj variable
        canvasObj = canvasObjIn;
        // Set ctxdObj variable
        ctxdObj = ctxdIn;
        // Rect color
        rectcolor = rColorIn;
        // Limit the slection box to the canvas
        keepWithin.x = 0;
        keepWithin.y = 0;
        keepWithin.w = canvasObj.width;
        keepWithin.h = canvasObj.height;

        // Check the arguments
        if (typeof canvasId != 'string') {
            return;
        }
        if (!canvasObj) {
            return;
        }
        if (!ctxdObj) {
            return;
        }
        if (typeof rectcolor != 'string') {
            return;
        }

        // Get the position of the canvas
        cPos = canvasObj.getBoundingClientRect();

        // Listeners
        $(canvasId).mousedown(function(e) {
            mouseDown(e);
        });

        $(canvasId).mouseup(function(e) {
            mouseUp(e);
        });

        $(canvasId).mousemove(function(e) {
            mouseMove(e);
        });

        $(document).on('keyup', function(e) {
            keyUp(e);
        });

        // Public method to return rect
        // position -> top-left  and
        // size -> width and height
        // [left, top, width, height]
        this.getRect = function() {
            return rect;
        };

        // Public method to set rect value
        // position -> top-left  and
        // size -> width and height
        // [left, top, width, height]
        this.setRect = function(left, top, width, height) {

            // Set the rect values
            rect.x = left;
            rect.y = top;
            rect.w = width;
            rect.h = height;
            active = true;

            // Draw rect on canvas
            clearCanvasNDraw();
        };

        // Public method to set limits in canvas
        // position -> top-left  and
        // size -> width and height
        // [left, top, width, height]
        this.setLimits = function(left, top, width, height) {

            keepWithin.x = left;
            keepWithin.y = top;
            keepWithin.w = width;
            keepWithin.h = height;
        };
    };

    // Private methods
    function mouseDown(e) {
        eX = e.pageX - cPos.left;
        eY = e.pageY - cPos.top;

        if (active) {
            if (pointInRect(eX, eY, rect.x - sBlk, rect.y - sBlk, sBlk * 2, sBlk * 2)) {
                TL = true;
                return;
            }
            if (pointInRect(eX, eY, rect.x + rect.w - sBlk, rect.y - sBlk, sBlk * 2, sBlk * 2)) {
                TR = true;
                return;
            }
            if (pointInRect(eX, eY, rect.x - sBlk, rect.y + rect.h - sBlk, sBlk * 2, sBlk * 2)) {
                BL = true;
                return;
            }
            if (pointInRect(eX, eY, rect.x + rect.w - sBlk, rect.y + rect.h - sBlk, sBlk * 2, sBlk * 2)) {
                BR = true;
                return;
            }

            if (pointInRect(eX, eY, rect.x + rect.w / 2 - sBlk, rect.y - sBlk, sBlk * 2, sBlk * 2)) {
                TM = true;
                return;
            }
            if (pointInRect(eX, eY, rect.x + rect.w / 2 - sBlk, rect.y + rect.h - sBlk, sBlk * 2, sBlk * 2)) {
                BM = true;
                return;
            }
            if (pointInRect(eX, eY, rect.x - sBlk, rect.y + rect.h / 2 - sBlk, sBlk * 2, sBlk * 2)) {
                LM = true;
                return;
            }
            if (pointInRect(eX, eY, rect.x + rect.w - sBlk, rect.y + rect.h / 2 - sBlk, sBlk * 2, sBlk * 2)) {
                RM = true;
                return;
            }

            // This has to be below all of the other conditions
            if (pointInRect(eX, eY, rect.x, rect.y, rect.w, rect.h)) {
                anchor.xLeft = eX - rect.x;
                anchor.xRight = rect.w - anchor.xLeft;
                anchor.xTop = eY - rect.y;
                anchor.xBottom = rect.h - anchor.xTop;
                hold = true;
                return;
            }
        } else {
            rect.x = eX;
            rect.y = eY;
            drag = true;
            active = true;
            return;
        }
    }

    function mouseMove(e) {
        eX = e.pageX - cPos.left;
        eY = e.pageY - cPos.top;

        if (drag & active) {
            rect.w = eX - rect.x;
            rect.h = eY - rect.y;
            keepRectInCanvas();
            return;
        }

        if (hold) {
            rect.x = eX - anchor.xLeft;
            rect.y = eY - anchor.xTop;
            straightenUpRect();
            keepRectInCanvas();
            return;
        }

        if (TL) {
            rect.w = (rect.x + rect.w) - eX;
            rect.h = (rect.y + rect.h) - eY;
            rect.x = eX;
            rect.y = eY;
            keepRectInCanvas();
            return;
        }

        if (BR) {
            rect.w = eX - rect.x;
            rect.h = eY - rect.y;
            keepRectInCanvas();
            return;
        }

        if (TR) {
            rect.h = (rect.y + rect.h) - eY;
            rect.y = eY;
            rect.w = eX - rect.x;
            keepRectInCanvas();
            return;
        }

        if (BL) {
            rect.w = (rect.x + rect.w) - eX;
            rect.x = eX;
            rect.h = eY - rect.y;
            keepRectInCanvas();
            return;
        }

        if (TM) {
            rect.h = (rect.y + rect.h) - eY;
            rect.y = eY;
            keepRectInCanvas();
            return;
        }
        if (BM) {
            rect.h = eY - rect.y;
            keepRectInCanvas();
            return;
        }
        if (LM) {
            rect.w = (rect.x + rect.w) - eX;
            rect.x = eX;
            keepRectInCanvas();
            return;
        }
        if (RM) {
            rect.w = eX - rect.x;
            keepRectInCanvas();
            return;
        }
    }

    function mouseUp(e) {
        drag = false;
        disableResizeButtons();
        straightenUpRect();
        if (rect.w == 0 || rect.h == 0)
            active = false;
        keepRectInCanvas();
    }

    function keyUp(e) {
        // esc or del
        if (e.keyCode == 27 || e.keyCode == 46) {
            active = false;
            ctxdObj.clearRect(0, 0, canvasObj.width, canvasObj.height);
        }
    }

    function disableResizeButtons() {
        TL = TM = TR = false;
        LM = RM = false;
        BL = BM = BR = false;
        hold = false;
    }

    function pointInRect(pX, pY, rX, rY, rW, rH) {
        if ((pX >= rX) && (pY >= rY) &&
            (pX <= (rX + rW)) && (pY <= (rY + rH)))
            return true;
        else
            return false;
    }

    function clearCanvasNDraw() {
        // Clear canvas
        ctxdObj.clearRect(0, 0, canvasObj.width, canvasObj.height);

        // Draw
        ctxdObj.strokeStyle = rectcolor;
        ctxdObj.strokeRect(rect.x, rect.y, rect.w, rect.h);
        drawSelectMarkers(rect.x, rect.y, rect.w, rect.h);
    }

    function drawSelectMarkers(x, y, w, h) {
        // Top-Left
        ctxdObj.strokeRect(x - sBlk, y - sBlk, sBlk * 2, sBlk * 2);
        // Top-Rigth
        ctxdObj.strokeRect(x + w - sBlk, y - sBlk, sBlk * 2, sBlk * 2);
        // Bottom-Left
        ctxdObj.strokeRect(x - sBlk, y + h - sBlk, sBlk * 2, sBlk * 2);
        // Bottom-Right
        ctxdObj.strokeRect(x + w - sBlk, y + h - sBlk, sBlk * 2, sBlk * 2);

        // Top-Mid
        ctxdObj.strokeRect(x + w / 2 - sBlk, y - sBlk, sBlk * 2, sBlk * 2);
        // Bottom-Mid
        ctxdObj.strokeRect(x + w / 2 - sBlk, y + h - sBlk, sBlk * 2, sBlk * 2);
        // Left-Mid
        ctxdObj.strokeRect(x - sBlk, y + h / 2 - sBlk, sBlk * 2, sBlk * 2);
        // Right-Mid
        ctxdObj.strokeRect(x + w - sBlk, y + h / 2 - sBlk, sBlk * 2, sBlk * 2);
    }

    function keepRectInCanvas() {

        if (rect.w >= keepWithin.w)
            rect.w = keepWithin.w;
        if (rect.h >= keepWithin.h)
            rect.h = keepWithin.h;

        if (rect.x <= keepWithin.x)
            rect.x = keepWithin.x;
        if (rect.y <= keepWithin.y)
            rect.y = keepWithin.y;

        if ((rect.x + rect.w) >= (keepWithin.x + keepWithin.w))
            rect.x = (keepWithin.x + keepWithin.w) - rect.w;
        if ((rect.y + rect.h) >= (keepWithin.y + keepWithin.h))
            rect.y = (keepWithin.y + keepWithin.h) - rect.h;

        clearCanvasNDraw();
    }

    function straightenUpRect() {
        if (rect.w < 0) {
            rect.x = rect.x + rect.w;
            rect.w = -rect.w;
        }
        if (rect.h < 0) {
            rect.y = rect.y + rect.h;
            rect.h = -rect.h;
        }
    }

    function printRect() {
        console.log('Rect : ' + rect.x + ',' + rect.y + ',' + rect.w + ',' + rect.h);
        console.log('limit : ' + keepWithin.x + ',' + keepWithin.y + ',' + keepWithin.w + ',' + keepWithin.h);
    }

}());
