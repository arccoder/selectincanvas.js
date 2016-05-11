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
	
	// Position of the canvas
	var cPos = {};
	// To store rectangle
	var rect = {};	
	// Initialize rect width and height to zero
	rect.w = 0;
	rect.h = 0;	
	// Rect color
	var rectcolor = '#FF0000';
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
    return function constructor(canvasid,canvas,ctxd,rColor) {
						
		// Check the arguments
		if( typeof canvasid != 'string' ) { return; }
		if( !canvas ) { return; }
		if( !ctxd ) { return; }
		if( typeof rColor != 'string' ) { return; }

		// Get the position of the canvas
		cPos = canvas.getBoundingClientRect();

		// Rect color
		rectcolor = rColor;
		
		// Listeners
		$(canvasid).mousedown(function(e) {
			mouseDown(e);
		});
        
		$(canvasid).mouseup(function(e) {
			mouseUp(e);	
		});
        
		$(canvasid).mousemove(function(e) {
			mouseMove(e);
		});
		
		$(document).on('keyup',function(e) {
			keyUp(e);
		});

		// Public method to return rect
		// position -> top-left  and 
		// size -> width and height
		// [left, top, width, height]
        this.getRect = function () {
            return rect;
        };
    };
	
	// Private methods	
	function mouseDown(e) {
		eX = e.pageX - cPos.left;
		eY = e.pageY - cPos.top;

		if( active )
		{		
			if( pointInRect(eX,eY,rect.x-sBlk,rect.y-sBlk,sBlk*2,sBlk*2) )
			{
				TL = true;
				return;
			}
			if( pointInRect(eX,eY,rect.x+rect.w-sBlk,rect.y-sBlk,sBlk*2,sBlk*2) )
			{
				TR = true;
				return;
			}	
			if( pointInRect(eX,eY,rect.x-sBlk,rect.y+rect.h-sBlk,sBlk*2,sBlk*2) )
			{
				BL = true;
				return;
			}	
			if( pointInRect(eX,eY,rect.x+rect.w-sBlk,rect.y+rect.h-sBlk,sBlk*2,sBlk*2) )
			{
				BR = true;
				return;
			}	

			if( pointInRect(eX,eY,rect.x+rect.w/2-sBlk,rect.y-sBlk,sBlk*2,sBlk*2) )
			{
				TM = true;
				return;
			}			
			if( pointInRect(eX,eY,rect.x+rect.w/2-sBlk,rect.y+rect.h-sBlk,sBlk*2,sBlk*2) )
			{
				BM = true;
				return;
			}	
			if( pointInRect(eX,eY,rect.x-sBlk,rect.y+rect.h/2-sBlk,sBlk*2,sBlk*2) )
			{
				LM = true;
				return;
			}	
			if( pointInRect(eX,eY,rect.x+rect.w-sBlk,rect.y+rect.h/2-sBlk,sBlk*2,sBlk*2) )
			{
				RM = true;
				return;
			}
			
			// This has to be below all of the other conditions
			if( pointInRect(eX,eY,rect.x,rect.y,rect.w,rect.h) )
			{
				anchor.xLeft = eX-rect.x;
				anchor.xRight = rect.w-anchor.xLeft;
				anchor.xTop = eY-rect.y;
				anchor.xBottom = rect.h-anchor.xTop;
				hold = true;
				return;
			}
		}
		else
		{
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
		
		if( drag & active ) {
			rect.w = eX - rect.x;
			rect.h = eY - rect.y ;
			clearCanvasNDraw();
			return;
		}

		if( hold )
		{
			rect.x = eX-anchor.xLeft;
			rect.y = eY-anchor.xTop;
			straightenUpRect();
			keepRectInCanvas();	
			clearCanvasNDraw();
			return;
		}
		
		if( TL ) {
			rect.w = (rect.x + rect.w) - eX;
			rect.h = (rect.y + rect.h) - eY;
			rect.x = eX;
			rect.y = eY;
			clearCanvasNDraw();
			return;
		}
	  
		if( BR ) {
			rect.w = eX - rect.x;
			rect.h = eY - rect.y;
			clearCanvasNDraw();
			return;
		}
	  
		if( TR ) {
			rect.h = (rect.y + rect.h) - eY;
			rect.y = eY;
			rect.w = eX - rect.x;
			clearCanvasNDraw();
			return;
		}
		
		if( BL ) {
			rect.w = (rect.x + rect.w) - eX;
			rect.x = eX;
			rect.h = eY - rect.y;
			clearCanvasNDraw();
			return;
		}
		
		if( TM ) {
			rect.h = (rect.y + rect.h) - eY;
			rect.y = eY;
			clearCanvasNDraw();
			return;
		}
		if( BM ) {
			rect.h = eY - rect.y;
			clearCanvasNDraw();
			return;
		}
		if( LM ) {
			rect.w = (rect.x + rect.w) - eX;
			rect.x = eX;
			clearCanvasNDraw();
			return;
		}
		if( RM ) {
			rect.w = eX - rect.x;
			clearCanvasNDraw();
			return;
		}
	}
	
	function mouseUp(e) {
		drag = false;
		disableResizeButtons();
		straightenUpRect();
		if( rect.w == 0 || rect.h == 0 )
			active = false;
		keepRectInCanvas();		
	}
	
	function keyUp(e) {
		// esc or del
		if (e.keyCode == 27 || e.keyCode == 46 ) {
			active = false;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	}

	function disableResizeButtons(){
		TL = TM = TR = false;
		LM = RM = false;
		BL = BM = BR = false;
		hold = false;
	}
	
	function pointInRect(pX,pY,rX,rY,rW,rH) {
		if( (pX >= rX) && (pY >= rY) && 
			(pX <= (rX+rW)) && (pY <= (rY+rH)) )
			return true;
		else
			return false;
	}
	
	function clearCanvasNDraw() {
		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		// Draw
		ctx.strokeStyle = rectcolor;
		ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
		drawSelectMarkers(rect.x, rect.y, rect.w, rect.h);
	}
	
	function drawSelectMarkers(x,y,w,h){
		// Top-Left
		ctx.strokeRect(x-sBlk,y-sBlk,sBlk*2,sBlk*2);
		// Top-Rigth
		ctx.strokeRect(x+w-sBlk,y-sBlk,sBlk*2,sBlk*2);
		// Bottom-Left
		ctx.strokeRect(x-sBlk,y+h-sBlk,sBlk*2,sBlk*2);
		// Bottom-Right
		ctx.strokeRect(x+w-sBlk,y+h-sBlk,sBlk*2,sBlk*2);
		
		// Top-Mid
		ctx.strokeRect(x+w/2-sBlk,y-sBlk,sBlk*2,sBlk*2);
		// Bottom-Mid
		ctx.strokeRect(x+w/2-sBlk,y+h-sBlk,sBlk*2,sBlk*2);
		// Left-Mid
		ctx.strokeRect(x-sBlk,y+h/2-sBlk,sBlk*2,sBlk*2);
		// Right-Mid
		ctx.strokeRect(x+w-sBlk,y+h/2-sBlk,sBlk*2,sBlk*2);
	}

	function keepRectInCanvas() {
		if( rect.x < 0 ) 
			rect.x = 0;
		if( rect.y < 0 )
			rect.y = 0;
		if( (rect.x+rect.w) > canvas.width )
			rect.x = canvas.width - rect.w;
		if( (rect.y+rect.h) > canvas.height )
			rect.y = canvas.height - rect.h;
	}
	
	function straightenUpRect(){
		if( rect.w < 0 ){
			rect.x = rect.x + rect.w;
			rect.w = -rect.w;
		}
		if( rect.h < 0 ){
			rect.y = rect.y + rect.h;
			rect.h = -rect.h;
		}
	}
	
	//function printRect() {
	//	console.log(rect.x + ',' + rect.y + ',' + rect.w + ',' + rect.h);
	//}
	
}());