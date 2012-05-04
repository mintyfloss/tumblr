// plug-in
;(function($, doc, win) {
	"use strict";

	function CanvasBackground(el, opts) {
		this.$el = $(el);
		this.opts = opts;

		this.$canvas = $('<canvas></canvas>')
			.attr('class', 'captionOverlay');

		this.init();
	}

	CanvasBackground.prototype.init = function() {
		this.createCanvas();
		this.fillCanvas();
	};

	CanvasBackground.prototype.createCanvas = function() {
		// Add canvas element to DOM after element
		if (this.$el.length > 0) {
			$(this.$el).wrapInner(
				$('<div />')
					.css({
						position:'relative',
						'z-index':101
					})
					.attr('class', 'canvasForeground')
			);

			this.$el
				.css('position', 'relative')
				.append(
					this.$canvas
						.attr({
							width:this.$el.width(),
							height:this.$el.height(),
							'class':'canvasBackground'
						})
						.css({
							position:'absolute',
							top:'0',
							left:'0',
							'z-index':100
						})
				)
		}
	};

	CanvasBackground.prototype.fillCanvas = function() {
		/**
		 * Converts an HSL color value to RGB. Conversion formula
		 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
		 * Assumes h, s, and l are contained in the set [0, 1] and
		 * returns r, g, and b in the set [0, 255].
		 *
		 * @param   Number  h       The hue
		 * @param   Number  s       The saturation
		 * @param   Number  l       The lightness
		 * @return  Array           The RGB representation
		 */
		function hslToRgb(h, s, l){
			var r, g, b;

			var hue2rgb = function(p, q, t) {
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			};

			if(s == 0){
				r = g = b = l; // achromatic
			} else {
				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1/3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1/3);
			}

			return [r * 255, g * 255, b * 255];
		}


		var
			canvas = this.$canvas.get(0),
			width = this.$el.width(),
			height = this.$el.height()
		;

		if (canvas.getContext) {
			var ctx = canvas.getContext("2d");  

			for (var i = 0; i < width + height; i++) {
				var
					color = hslToRgb(.221 + i/1000, .63, .55)
				;

				if (i % 2 == 0)
					var rgbString = 'rgb(' + Math.floor(color[0]) + ',' + Math.floor(color[1]) + ',' + Math.floor(color[2]) + ')';
				else
					var rgbString = 'rgba(255,255,255,.8)';

				ctx.beginPath();
				
				if (i < height) {
					ctx.moveTo(i, 0);
					ctx.lineTo(0, i);
				} else if (i < width) {
					ctx.moveTo(i, 0);
					ctx.lineTo(i - height, height);
				} else {
					ctx.moveTo(width, i - width);
					ctx.lineTo(i - width, width);
				}

				ctx.strokeStyle = rgbString;
				ctx.stroke();
			}
		}
	};

	$.fn.canvasBackground = function(opts) {
		return this.each(function() {
			new CanvasBackground(this, opts);
		});
	};

})(jQuery, document, window);