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
    default_color: "#290523",
    start_immediately: true
  });
};



resize = function() {
  arcade_display.stop();

  canvas.style.height = window.clientHeight;
  canvas.style.width = window.clientWidth;

  arcade_display.setup_canvas();
  arcade_display.play();
};
