import 'fabric-with-gestures';
import $ from 'jquery';

var canvas = new fabric.Canvas('step4');
fabric.Image.fromURL(
  'https://www.guidedogs.org/wp-content/uploads/2019/11/website-donate-mobile.jpg',
  function (img) {
    img.scale(0.5).set({
      left: 150,
      top: 150,
      angle: -15,
    });
    canvas.add(img);
  }
);

var circle1 = new fabric.Circle({
  radius: 65,
  fill: '#039BE5',
  left: 0,
  stroke: 'red',
  strokeWidth: 3,
});

canvas.add(circle1);

var info = document.getElementById('info');

canvas.on({
  'touch:gesture': function () {
    var text = document.createTextNode(' Gesture ');
  },
  'touch:drag': function (event) {
    var text = document.createTextNode(' Dragging ');
  },
  'touch:orientation': function () {
    var text = document.createTextNode(' Orientation ');
  },
  'touch:shake': function () {
    var text = document.createTextNode(' Shaking ');
  },
  'touch:longpress': function () {
    var text = document.createTextNode(' Longpress ');
  },
});

(function () {
  var bg = new fabric.Rect({
    width: 990,
    height: 990,
    stroke: 'pink',
    strokeWidth: 10,
    fill: '',
    evented: false,
    selectable: false,
  });
  bg.fill = new fabric.Pattern(
    {
      source:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAASElEQVQ4y2NkYGD4z0A6+M3AwMBKrGJWBgYGZiibEQ0zIInDaCaoelYyHYcX/GeitomjBo4aOGrgQBj4b7RwGFwGsjAwMDAAAD2/BjgezgsZAAAAAElFTkSuQmCC',
    },
    function () {
      bg.dirty = true;
      canvas.requestRenderAll();
    }
  );
  bg.canvas = canvas;
  canvas.backgroundImage = bg;
  canvas.add(
    new fabric.Rect({ width: 50, height: 50, fill: 'blue', angle: 10 })
  );
  canvas.add(new fabric.Circle({ radius: 50, fill: 'red', top: 44, left: 80 }));
  canvas.add(
    new fabric.Ellipse({ rx: 50, ry: 10, fill: 'yellow', top: 80, left: 35 })
  );
  canvas.add(
    new fabric.Rect({
      width: 50,
      height: 50,
      fill: 'purple',
      angle: -19,
      top: 70,
      left: 70,
    })
  );
  canvas.add(
    new fabric.Circle({ radius: 50, fill: 'green', top: 110, left: 30 })
  );
  canvas.add(
    new fabric.Ellipse({
      rx: 50,
      ry: 10,
      fill: 'orange',
      top: 12,
      left: 100,
      angle: 30,
    })
  );
  canvas.on('mouse:wheel', function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
    var vpt = this.viewportTransform;
    if (zoom < 0.4) {
      vpt[4] = 200 - (1000 * zoom) / 2;
      vpt[5] = 200 - (1000 * zoom) / 2;
    } else {
      if (vpt[4] >= 0) {
        vpt[4] = 0;
      } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
        vpt[4] = canvas.getWidth() - 1000 * zoom;
      }
      if (vpt[5] >= 0) {
        vpt[5] = 0;
      } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
        vpt[5] = canvas.getHeight() - 1000 * zoom;
      }
    }
  });

  canvas.on('touch:gesture', function (event) {
    let zoomStartScale = 1;
    // Handle zoom only if 2 fingers are touching the screen
    if (event.e.touches && event.e.touches.length == 2) {
      // Get event point
      var point = new fabric.Point(event.self.x, event.self.y);
      // Remember canvas scale at gesture start
      if (event.self.state == 'start') {
        zoomStartScale = canvas.getZoom();
      }
      // Calculate delta from start scale
      var delta = zoomStartScale * event.self.scale;
      // Zoom to pinch point
      canvas.zoomToPoint(point, delta);
    }
  });

  canvas.on('mouse:down', function (opt) {
    var evt = opt.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  });

  canvas.on('mouse:move', function (opt) {
    if (this.isDragging) {
      var e = opt.e;
      var zoom = canvas.getZoom();
      var vpt = this.viewportTransform;
      if (zoom < 0.4) {
        vpt[4] = 200 - (1000 * zoom) / 2;
        vpt[5] = 200 - (1000 * zoom) / 2;
      } else {
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        if (vpt[4] >= 0) {
          vpt[4] = 0;
        } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
          vpt[4] = canvas.getWidth() - 1000 * zoom;
        }
        if (vpt[5] >= 0) {
          vpt[5] = 0;
        } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
          vpt[5] = canvas.getHeight() - 1000 * zoom;
        }
      }
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });
  canvas.on('mouse:up', function (opt) {
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    //this.selection = true;
  });
})();

const STATE_IDLE = 'idle';
const STATE_PANNING = 'panning';
fabric.Canvas.prototype.toggleDragMode = function (dragMode) {
  // Remember the previous X and Y coordinates for delta calculations
  let lastClientX;
  let lastClientY;
  // Keep track of the state
  let state = STATE_IDLE;
  // We're entering dragmode
  if (dragMode) {
    // Discard any active object
    this.discardActiveObject();
    // Set the cursor to 'move'
    this.defaultCursor = 'move';
    // Loop over all objects and disable events / selectable. We remember its value in a temp variable stored on each object
    this.forEachObject(function (object) {
      object.prevEvented = object.evented;
      object.prevSelectable = object.selectable;
      object.evented = false;
      object.selectable = false;
    });
    // Remove selection ability on the canvas
    this.selection = false;
    // When MouseUp fires, we set the state to idle
    this.on('mouse:up', function (e) {
      state = STATE_IDLE;
    });

    this.on('touch:drag', function (e) {
      if (e.self.state === 'up') {
        //state = STATE_IDLE;
      }
    });

    // When MouseDown fires, we set the state to panning
    this.on('mouse:down', (e) => {
      if (e.e.clientX && e.e.clientY) {
        state = STATE_PANNING;
        this.lastClientX = e.e.clientX;
        this.lastClientY = e.e.clientY;
      }
    });
    this.on('touch:drag', function (e) {
      if (e.self.state === 'move' && e.e.touches) {
        const [touch] = e.e.touches;
        state = STATE_PANNING;
        //this.lastClientX = touch.clientX;
        //this.lastClientY = touch.clientY;
      }
    });
    // When the mouse moves, and we're panning (mouse down), we continue
    this.on('mouse:move', (e) => {
      if (state === STATE_PANNING && e && e.e && !e.e.touches) {
        this.selection = false;
        // let delta = new fabric.Point(e.e.movementX, e.e.movementY); // No Safari support for movementX and movementY
        // For cross-browser compatibility, I had to manually keep track of the delta

        // Calculate deltas
        let deltaX = 0;
        let deltaY = 0;
        if (this.lastClientX) {
          deltaX = e.e.clientX - this.lastClientX;
        }
        if (this.lastClientY) {
          deltaY = e.e.clientY - this.lastClientY;
        }
        // Update the last X and Y values
        this.lastClientX = e.e.clientX;
        this.lastClientY = e.e.clientY;

        document.getElementById('text').innerHTML = JSON.stringify([
          this.lastClientX,
          this.lastClientY,
        ]);

        let delta = new fabric.Point(deltaX, deltaY);
        this.relativePan(delta);
        //this.trigger('moved');
      }
    });

    this.on('touch:drag', (e) => {
      if (state === STATE_PANNING && e && e.e && e.e.touches) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          const [touch] = e.e.touches;
          // let delta = new fabric.Point(e.e.movementX, e.e.movementY); // No Safari support for movementX and movementY
          // For cross-browser compatibility, I had to manually keep track of the delta

          // Calculate deltas
          let deltaX = 0;
          let deltaY = 0;
          if (this.lastClientX) {
            deltaX = touch.clientX - this.lastClientX;
          }
          if (this.lastClientY) {
            deltaY = touch.clientY - this.lastClientY;
          }
          // Update the last X and Y values
          this.lastClientX = touch.clientX;
          this.lastClientY = touch.clientY;

          document.getElementById('text').innerHTML = JSON.stringify([
            deltaX,
            deltaY,
          ]);
          console.log('METADATA', JSON.stringify(e));
          console.log('LAST CLIENT', this.lastClientX, this.lastClientY);
          console.log('TOUCH', touch.clientX, touch.clientY);

          let delta = new fabric.Point(deltaX, deltaY);
          this.relativePan(delta);
          //this.trigger('moved');
        });
      }
    });
  } else {
    // When we exit dragmode, we restore the previous values on all objects
    this.forEachObject(function (object) {
      object.evented =
        object.prevEvented !== undefined ? object.prevEvented : object.evented;
      object.selectable =
        object.prevSelectable !== undefined
          ? object.prevSelectable
          : object.selectable;
    });
    // Reset the cursor
    this.defaultCursor = 'default';
    // Remove the event listeners
    this.off('mouse:up');
    this.off('mouse:down');
    this.off('mouse:move');
    this.off('touch:drag');
    // Restore selection ability on the canvas
    this.selection = true;
  }
};

let dragMode = false;
$('#dragmode').change((_) => {
  dragMode = !dragMode;
  canvas.toggleDragMode(dragMode);
});
