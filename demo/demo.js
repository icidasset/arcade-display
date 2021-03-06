(function() {

  var arcade_display, canvas, setup,
      resize, stack = [];



  window.onload = function() {
    canvas = document.getElementById("arcade-display");

    setup();
  };



  window.onresize = function() {
    if (stack.length > 0) return;

    // add new timeout to stack
    stack.push(setTimeout(function() {
      resize();
      stack.shift();
    }, 250));
  };



  setup = function() {
    arcade_display = new ArcadeDisplay(canvas, {
      animation_array: window.animation,
      default_color: "#2d2d2d",
      start_immediately: true,
      led_height: 4,
      led_width: 4
    });
  };



  resize = function() {
    arcade_display.stop();

    canvas.style.height = window.clientHeight;
    canvas.style.width = window.clientWidth;

    arcade_display.setup_canvas();
    arcade_display.play();
  };

}());
