/* 
 * Scroller v3.0.2 - 2014-02-23 
 * A jQuery plugin for replacing default browser scrollbars. Part of the Formstone Library. 
 * http://formstone.it/scroller/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

;(function ($, window) {
	"use strict";

	var $body = null;

	/**
	 * @options
	 * @param customClass [string] <''> "Class applied to instance"
	 * @param duration [int] <0> "Scroll animation length"
	 * @param handleSize [int] <0> "Handle size; 0 to auto size"
	 * @param horizontal [boolean] <false> "Scroll horizontally"
	 * @param trackMargin [int] <0> "Margin between track and handle edge”
	 */
	var options = {
		customClass: "",
		duration: 0,
		handleSize: 0,
		horizontal: false,
		trackMargin: 0
	};

	var pub = {

		/**
		 * @method
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $.scroller("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},

		/**
		 * @method
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").scroller("destroy");
		 */
		destroy: function() {
			return $(this).each(function(i, el) {
				var data = $(el).data("scroller");

				if (data) {
					data.$scroller.removeClass(data.customClass)
								  .removeClass("scroller")
								  .removeClass("scroller-active");

					data.$bar.remove();
					data.$content.contents().unwrap();

					data.$content.off(".scroller");
					data.$scroller.off(".scroller")
								  .removeData("scroller");
				}
			});
		},

		/**
		 * @method
		 * @name scroll
		 * @description Scrolls instance of plugin to element or position
		 * @param pos [string || int] <null> "Target element selector or static position"
		 * @param duration [int] <null> "Optional scroll duration"
		 * @example $.scroller("scroll", pos, duration);
		 */
		scroll: function(pos, duration) {
			return $(this).each(function(i) {
				var data = $(this).data("scroller"),
	                duration = duration || options.duration;

				if (typeof pos !== "number") {
					var $el = $(pos);
					if ($el.length > 0) {
						var offset = $el.position();
						if (data.horizontal) {
							pos = offset.left + data.$content.scrollLeft();
						} else {
							pos = offset.top + data.$content.scrollTop();
						}
					} else {
						pos = data.$content.scrollTop();
					}
				}

				if (data.horizontal) {
					data.$content.stop().animate({ scrollLeft: pos }, duration);
				} else {
					data.$content.stop().animate({ scrollTop: pos }, duration);
				}
			});
		},

		/**
		 * @method
		 * @name reset
		 * @description Resets layout on instance of plugin
		 * @example $.scroller("reset");
		 */
		reset: function()  {
			return $(this).each(function(i) {
				var data = $(this).data("scroller");

				if (data) {
					data.$scroller.addClass("scroller-setup");

					if (data.horizontal) {
						// Horizontal
						data.barHeight = data.$content[0].offsetHeight - data.$content[0].clientHeight;
						data.frameWidth = data.$content.outerWidth();
						data.trackWidth = data.frameWidth - (data.trackMargin * 2);
						data.scrollWidth = data.$content[0].scrollWidth;
						data.ratio = data.trackWidth / data.scrollWidth;
						data.trackRatio = data.trackWidth / data.scrollWidth;
						data.handleWidth = (data.handleSize > 0) ? data.handleSize : data.trackWidth * data.trackRatio;
						data.scrollRatio = (data.scrollWidth - data.frameWidth) / (data.trackWidth - data.handleWidth);
						data.handleBounds = {
							left: 0,
							right: data.trackWidth - data.handleWidth
						};

						data.$content.css({ paddingBottom: data.barHeight + data.paddingBottom });

						var scrollLeft = data.$content.scrollLeft(),
							handleLeft = scrollLeft * data.ratio;

						if (data.scrollWidth <= data.frameWidth) {
							data.$scroller.removeClass("scroller-active");
						} else {
							data.$scroller.addClass("scroller-active");
						}

						data.$bar.css({
							width: data.frameWidth
						});
						data.$track.css({
							width: data.trackWidth,
							marginLeft: data.trackMargin,
							marginRight: data.trackMargin
						});
						data.$handle.css({
							width: data.handleWidth
						});

						_position.apply(data.$scroller, [data, handleLeft]);
					} else {
						// Vertical
						data.barWidth = data.$content[0].offsetWidth - data.$content[0].clientWidth;
						data.frameHeight = data.$content.outerHeight();
						data.trackHeight = data.frameHeight - (data.trackMargin * 2);
						data.scrollHeight = data.$content[0].scrollHeight;
						data.ratio = data.trackHeight / data.scrollHeight;
						data.trackRatio = data.trackHeight / data.scrollHeight;
						data.handleHeight = (data.handleSize > 0) ? data.handleSize : data.trackHeight * data.trackRatio;
						data.scrollRatio = (data.scrollHeight - data.frameHeight) / (data.trackHeight - data.handleHeight);
						data.handleBounds = {
							top: 0,
							bottom: data.trackHeight - data.handleHeight
						};

						var scrollTop = data.$content.scrollTop(),
							handleTop = scrollTop * data.ratio;

						if (data.scrollHeight <= data.frameHeight) {
							data.$scroller.removeClass("scroller-active");
						} else {
							data.$scroller.addClass("scroller-active");
						}

						data.$bar.css({
							height: data.frameHeight
						});
						data.$track.css({
							height: data.trackHeight,
							marginBottom: data.trackMargin,
							marginTop: data.trackMargin
						});
						data.$handle.css({
							height: data.handleHeight
						});

						_position.apply(data.$scroller, [data, handleTop]);
					}

					data.$scroller.removeClass("scroller-setup");
				}
			});
		}
	};

	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Local options
		opts = $.extend({}, options, opts || {});

		// Check for Body
		if ($body === null) {
			$body = $("body");
		}

		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		return $items;
	}

	/**
	 * @method private
	 * @name _build
	 * @description Builds each instance
	 * @param $scroller [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($scroller, opts) {
		if (!$scroller.hasClass("scroller")) {
			// EXTEND OPTIONS
			opts = $.extend({}, opts, $scroller.data("scroller-options"));

			var html = '';

			html += '<div class="scroller-bar">';
			html += '<div class="scroller-track">';
			html += '<div class="scroller-handle">';
			html += '</div></div></div>';

			opts.paddingRight = parseInt($scroller.css("padding-right"), 10);
			opts.paddingBottom = parseInt($scroller.css("padding-bottom"), 10);

			$scroller.addClass(opts.customClass + " scroller")
					 .wrapInner('<div class="scroller-content" />')
					 .prepend(html);

			if (opts.horizontal) {
				$scroller.addClass("scroller-horizontal");
			}

			var data = $.extend({
				$scroller: $scroller,
				$content: $scroller.find(".scroller-content"),
				$bar: $scroller.find(".scroller-bar"),
				$track: $scroller.find(".scroller-track"),
				$handle: $scroller.find(".scroller-handle")
			}, opts);

			data.trackMargin = parseInt(data.trackMargin, 10);

			data.$content.on("scroll.scroller", data, _onScroll);
			data.$scroller.on("mousedown.scroller", ".scroller-track", data, _onTrackDown)
						  .on("mousedown.scroller", ".scroller-handle", data, _onHandleDown)
						  .data("scroller", data);

			pub.reset.apply($scroller);

			$(window).one("load", function() {
				pub.reset.apply($scroller);
			});
		}
	}

	/**
	 * @method private
	 * @name _onScroll
	 * @description Handles scroll event
	 * @param e [object] "Event data"
	 */
	function _onScroll(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		if (data.horizontal) {
			// Horizontal
			var scrollLeft = data.$content.scrollLeft();
			if (scrollLeft < 0) {
				scrollLeft = 0;
			}

			var handleLeft = scrollLeft / data.scrollRatio;
			if (handleLeft > data.handleBounds.right) {
				handleLeft = data.handleBounds.right;
			}

			data.$handle.css({ left: handleLeft });
		} else {
			// Vertical
			var scrollTop = data.$content.scrollTop();
			if (scrollTop < 0) {
				scrollTop = 0;
			}

			var handleTop = scrollTop / data.scrollRatio;
			if (handleTop > data.handleBounds.bottom) {
				handleTop = data.handleBounds.bottom;
			}

			data.$handle.css({ top: handleTop });
		}
	}

	/**
	 * @method private
	 * @name _onTrackDown
	 * @description Handles mousedown event on track
	 * @param e [object] "Event data"
	 */
	function _onTrackDown(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data,
			offset = data.$track.offset();

		if (data.horizontal) {
			// Horizontal
			data.mouseStart = e.pageX;
			data.handleLeft = e.pageX - offset.left - (data.handleWidth / 2);
			_position.apply(data.$scroller, [data, data.handleLeft]);
		} else {
			// Vertical
			data.mouseStart = e.pageY;
			data.handleTop = e.pageY - offset.top - (data.handleHeight / 2);
			_position.apply(data.$scroller, [data, data.handleTop]);
		}

		data.$content.off(".scroller");
		$body.on("mousemove.scroller", data, _onMouseMove)
			 .on("mouseup.scroller", data, _onMouseUp);
	}

	/**
	 * @method private
	 * @name _onTrackDown
	 * @description Handles mousedown event on handle
	 * @param e [object] "Event data"
	 */
	function _onHandleDown(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		if (data.horizontal) {
			// Horizontal
			data.mouseStart = e.pageX;
			data.handleLeft = parseInt(data.$handle.css("left"), 10);
		} else {
			// Vertical
			data.mouseStart = e.pageY;
			data.handleTop = parseInt(data.$handle.css("top"), 10);
		}

		data.$content.off(".scroller");
		$body.on("mousemove.scroller", data, _onMouseMove)
			 .on("mouseup.scroller", data, _onMouseUp);
	}

	/**
	 * @method private
	 * @name _onMouseMove
	 * @description Handles mousemove event
	 * @param e [object] "Event data"
	 */
	function _onMouseMove(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data,
			pos = 0,
			delta = 0;

		if (data.horizontal) {
			// Horizontal
			delta = data.mouseStart - e.pageX;
			pos = data.handleLeft - delta;
		} else {
			// Vertical
			delta = data.mouseStart - e.pageY;
			pos = data.handleTop - delta;
		}

		_position.apply(data.$scroller, [data, pos]);
	}

	/**
	 * @method private
	 * @name _onMouseUp
	 * @description Handles mouseup event
	 * @param e [object] "Event data"
	 */
	function _onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = e.data;

		data.$content.on("scroll.scroller", data, _onScroll);
		$body.off(".scroller");
	}

	/**
	 * @method private
	 * @name _position
	 * @description Position handle based on scroll
	 * @param data [object] "Instance data"
	 * @param pos [int] "Scroll position"
	 */
	function _position(data, pos) {
		if (data.horizontal) {
			// Horizontal
			if (pos < data.handleBounds.left) {
				pos = data.handleBounds.left;
			}
			if (pos > data.handleBounds.right) {
				pos = data.handleBounds.right;
			}

			var scrollLeft = Math.round(pos * data.scrollRatio);

			data.$handle.css({ left: pos });
			data.$content.scrollLeft( scrollLeft );
		} else {
			// Vertical
			if (pos < data.handleBounds.top) {
				pos = data.handleBounds.top;
			}
			if (pos > data.handleBounds.bottom) {
				pos = data.handleBounds.bottom;
			}

			var scrollTop = Math.round(pos * data.scrollRatio);

			data.$handle.css({ top: pos });
			data.$content.scrollTop( scrollTop );
		}
	}

	$.fn.scroller = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};

	$.scroller = function(method) {
		if (method === "defaults") {
			pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
})(jQuery);
