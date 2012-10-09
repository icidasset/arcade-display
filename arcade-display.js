/*

  + Arcade display

*/

var root = window;
root.ArcadeDisplay = (function() {
  var __bind = function(fn, me) {
    return function() { return fn.apply(me, arguments); };
  };

  /**************************************
   *  Default settings
   */
  AD.prototype.options = {
    default_color : "#1d1d1d",
    led_height : 5,
    led_width : 5
  };



  /**************************************
   *  Various
   */
  AD.prototype.animation_array = [[]];
  AD.prototype.state = { current_anim_idx : 0 };

  // canvas,
  // context,

  // margin_x,
  // margin_y,
  // stled



  /**************************************
   *  Constructor
   */
  function AD(element, options) {
    var frame_rate;

    // check
    if (!element) {
      console.error("The canvas element is missing or invalid");
      return;
    }

    // options
    options = options || {};

    if (options.animation_array) {
      this.animation_array = options.animation_array;
      delete options.animation_array;
    }

    _.extend(this.options, options);

    // bind
    this.bind_to_self("anim_loop");

    // canvas
    this.canvas = canvas;
    this.setup_canvas();

    // frame rate
    frame_rate = options.frame_rate || 24;
    this.state.delay = 1000 * (1 / frame_rate);

    // render if needed
    if (options.start_immediately) this.play();
  };



  /**************************************
   *  Setup canvas
   */
  AD.prototype.setup_canvas = function() {
    this.context = canvas.getContext("2d");

    canvas.height = canvas.offsetHeight;
    canvas.width  = canvas.offsetWidth;

    this.setup_leds(true);
  };



  /**************************************
   *  Setup LEDs
   */
  AD.prototype.setup_leds = function(draw_leds) {
    var amount_of_leds, h, v;

    // amount of leds
    amount_of_leds = {
      horizontal  : Math.floor(this.canvas.width  / this.options.led_width),
      vertical    : Math.floor(this.canvas.height / this.options.led_height)
    };

    // check if the amount is even
    // if not, reduce by one
    if (amount_of_leds.horizontal % 2 === 0) --amount_of_leds.horizontal;
    if (amount_of_leds.vertical   % 2 === 0) --amount_of_leds.vertical;

    // smaller variable names
    h = amount_of_leds.horizontal;
    v = amount_of_leds.vertical;

    // determine margins (on the outside)
    this.margin_x = (this.canvas.width - (h * this.options.led_width)) / 2,
    this.margin_y = (this.canvas.height - (v * this.options.led_height)) / 2;

    // this object
    this.state.amount_of_leds = amount_of_leds;

    // cache switched off led
    var stled    = document.createElement("canvas");
    stled.width  = this.options.led_width;
    stled.height = this.options.led_height;
    this.draw_led(stled.getContext("2d"), { x: 0, y: 0 }, this.options.default_color);
    this.stled   = stled;

    // draw them
    if (draw_leds) { this.draw_unactive_leds(h, v); }
  };



  /**************************************
   *  Draw unactive leds
   */
  AD.prototype.draw_unactive_leds = function(h, v) {
    var i = 0;

    for (; i<h; ++i) {
      var x = i - Math.floor(h / 2),
          j = 0;

      for (; j<v; ++j) {
        var y = j - Math.floor(v / 2);
        this.prepare_and_draw_led({ x: x, y: y }, false);
      }
    }
  };



  /**************************************
   *  Prepare and draw LED
   */
  AD.prototype.prepare_and_draw_led = function(position, color) {
    position = this.get_actual_position(position.x, position.y);

    if (!position) {
      return false;

    } else if (!color) {
      this.draw_led(this.context, position, this.options.default_color);
      // this.draw_stled(this.context, position); // <-- used to do this, but seems to use more cpu

    } else {
      this.draw_led(this.context, position, color);

    }
  };



  /**************************************
   *  Draw LED
   */
  AD.prototype.draw_led = function(c, position, color) {
    if (this.options.squares) {
      this.draw_led_square(c, position, color);

    } else {
      this.draw_led_circle(c, position, color);

    }
  };



  AD.prototype.draw_led_circle = function(c, position, color) {
    var width, height, x, y, radius;

    // set
    width  = this.options.led_width;
    height = this.options.led_height;

    x      = position.x + width / 2;
    y      = position.y + height / 2;
    radius = width / 2 - .45;

    // led glow
    if (color !== this.options.default_color) {
      var radial_gradient = c.createRadialGradient(x, y, 0, x, y, radius * 5);
      radial_gradient.addColorStop(0, this.hex_to_rgb(color, .11));
      radial_gradient.addColorStop(1, this.hex_to_rgb(color, 0));

      c.fillStyle = radial_gradient;
      c.beginPath();
      c.arc(x, y, radius * 5, 0, Math.PI * 2, false);
      c.closePath();
      c.fill();
    }

    // led
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, radius, 0, Math.PI * 2, false);
    c.closePath();
    c.fill();
  };



  AD.prototype.draw_led_square = function(c, position, color) {
    var width, height, x, y;

    // set
    width  = this.options.led_width - .5;
    height = this.options.led_height - .5;

    x = position.x;
    y = position.y;

    // led
    c.fillStyle = color;
    c.fillRect(x, y, width, height);
  };



  /**************************************
   *  Draw STLED
   */
  AD.prototype.draw_stled = function(c, position) {
    c.drawImage(this.stled, position.x, position.y);
  };



  /**************************************
   *  Render
   */
  AD.prototype.render = function(clear, led_array) {
    if (clear) this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw unactive leds
    this.draw_unactive_leds(
      this.state.amount_of_leds.horizontal,
      this.state.amount_of_leds.vertical
    );

    // draw active leds
    var i = led_array.length + 1;

    while (--i) {
      var t = led_array[i-1];
      this.prepare_and_draw_led({ x: t[0], y: t[1] }, t[2]);
    }
  };



  /**************************************
   *  Animation loop
   */
  AD.prototype.anim_loop = function() {
    var led_array = this.animation_array[this.state.current_anim_idx];

    // render
    this.render(true, led_array);

    // next led array index
    if (this.animation_array.length > 1) {
      if (this.state.current_anim_idx < this.animation_array.length - 1) ++this.state.current_anim_idx;
      else this.state.current_anim_idx = 0;
    }

    // set timeout
    this.state.timeout_id = setTimeout(this.anim_loop, this.state.delay);
  },



  /**************************************
   *  Controls
   */
  AD.prototype.play = function() {
    // animation array check
    if (!this.animation_array.length ||
        !this.animation_array[0].length
    ) { console.error("The animation array is empty or invalid."); return; }

    // start animation loop
    this.anim_loop();
  };


  AD.prototype.stop = function() {
    clearTimeout(this.state.timeout_id);
    this.state.timeout_id = null;
  };



  /**************************************
   *  Utility functions
   */
  AD.prototype.bind_to_self = function(fn_name) {
    this[fn_name] = __bind(this[fn_name], this);
  };


  AD.prototype.get_actual_position = function(x, y) {
    var half_of_the_horizontal_amount = Math.floor(this.state.amount_of_leds.horizontal / 2),
        half_of_the_vertical_amount   = Math.floor(this.state.amount_of_leds.vertical / 2);

    if (Math.abs(x) > half_of_the_horizontal_amount) {
      console.log("x(" + x + ") is out of reach.");
      return false;

    } else if (Math.abs(y) > half_of_the_vertical_amount) {
      console.log("y(" + y + ") is out of reach.");
      return false;

    } else {
      var real_x = this.margin_x + (half_of_the_horizontal_amount + x) * this.options.led_width,
          real_y = this.margin_y + (half_of_the_vertical_amount - y) * this.options.led_height;

      return { x: real_x, y: real_y };

    }
  };


  AD.prototype.hex_to_rgb = function(hex, opacity) {
    var rgb = hex.replace("#", "").match(/(.{2})/g),
        i = 3;

    while (i--) {
      rgb[i] = parseInt(rgb[i], 16);
    }

    if (typeof opacity == "undefined") {
      return "rgb(" + rgb.join(", ") + ")";

    } else {
      return "rgba(" + rgb.join(", ") + ", " + opacity + ")";

    }
  };



  /**************************************
   *  Return
   */
  return AD;

}());