# selectInCanvas.js
Enables a dragable rectangle on a canvas.

[DEMO](https://cdn.rawgit.com/arccoder/selectincanvasjs/master/index.html)

<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
<script src="src/selectincanvas.js"></script>
<canvas id="canvas" width="500" height="500" style="border:1px solid #000000;"></canvas>

<script>
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    // Invoke selectInCanvas.js
    var sicJs = new SICjs('canvas', canvas, ctx, '#FF0000');
    $("#canvas").dblclick(function(e) {
        rect = sicJs.getRect();
        alert(rect.x + ',' + rect.y + ',' + rect.w + ',' + rect.h);
    });
</script>

**Usage**

To draw a rectangle, left click on the canvas and drag. 
Leave the left click to complete drawing the rectangle.

You can use the squares on the rectangle to resize. 

Left click any where in the rectangle to hold the rectangle and move around in the canvas, leave the left click to drop the rectangle to the desired location. 

You can use the 'del' or 'esc' key to delete the rectangle.

Double click on the rectangle to display the its coordinates in an alert.

**Applications**
- Select a roi (region of interest).
- Crop an image.
