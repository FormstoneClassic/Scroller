/*
 * Scroller Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.6.4
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

if (jQuery) (function($) {
	
	var options = {
		customClass: "",
		duration: 0,
		handleSize: false,
		horizontal: false,
		trackMargin: 0
	};
	
	var pub = {
		
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		destroy: function() {
			return $(this).each(function(i) {
				var data = $(this).data("scroller");
				if (data) {
					data.$scroller.removeClass(data.customClass)
								  .removeClass("scroller")
								  .removeClass("scroller-active");
					data.$content.replaceWith(data.$content.html());
					data.$bar.remove();
					
					data.$content.off(".scroller");
					data.$scroller.off(".scroller")
								  .removeData("scroller");
				}
			});
		},
		
		scroll: function(pos, duration) {
			return $(this).each(function(i) {
				var data = $(this).data("scroller"),
	                duration = duration || options.duration;
				
				if (typeof pos != "number") {
					var $el = $(pos);
					if ($el.length > 0) {
						var offset = $el.position();
						if (data.horizontal == true) {
							pos = offset.left + data.$content.scrollLeft();
						} else {
							pos = offset.top + data.$content.scrollTop();
						}
					} else {
						pos = data.$content.scrollTop();
					}
				}
				
				if (data.horizontal == true) {
					data.$content.stop().animate({ scrollLeft: pos }, duration);
				} else {
					data.$content.stop().animate({ scrollTop: pos }, duration);
				}
			});
		},
		
		reset: function(_data)  {
			return $(this).each(function(i) {
				var data = _data || $(this).data("scroller");
				
				if (typeof data != "undefined") {
					data.$scroller.addClass("scroller-setup");
					
					if (data.horizontal == true) {
						// Horizontal
						data.barHeight = data.$content[0].offsetHeight - data.$content[0].clientHeight;
						data.frameWidth = data.$content.outerWidth();
						data.trackWidth = data.frameWidth - (data.trackMargin * 2);
						data.scrollWidth = data.$content[0].scrollWidth;
						data.ratio = data.trackWidth / data.scrollWidth;
						data.trackRatio = data.trackWidth / data.scrollWidth;
						data.handleWidth = (data.handleSize) ? data.handleSize : data.trackWidth * data.trackRatio;
						data.scrollRatio = (data.scrollWidth - data.frameWidth) / (data.trackWidth - data.handleWidth);
						data.handleBounds = {
							left: 0,
							right: data.trackWidth - data.handleWidth
						};
						
						data.$scroller.data("scroller", data);
						data.$content.css({ paddingBottom: data.barHeight + data.paddingBottom });
						
						var scrollLeft = data.$content.scrollLeft();
						var handleLeft = scrollLeft * data.ratio;
						
						if (data.scrollWidth <= data.frameWidth) {
							data.$scroller.removeClass("scroller-active");
						} else {
							data.$scroller.addClass("scroller-active");
						}
						
						data.$bar.css({ width: data.frameWidth });
						data.$track.css({ width: data.trackWidth, marginLeft: data.trackMargin, marginRight: data.trackMargin });
						data.$handle.css({ width: data.handleWidth });
						_position.apply(data.$scroller, [data, handleTop]);
					} else {
						// Vertical
						data.barWidth = data.$content[0].offsetWidth - data.$content[0].clientWidth;
						data.frameHeight = data.$content.outerHeight();
						data.trackHeight = data.frameHeight - (data.trackMargin * 2);
						data.scrollHeight = data.$content[0].scrollHeight;
						data.ratio = data.trackHeight / data.scrollHeight;
						data.trackRatio = data.trackHeight / data.scrollHeight;
						data.handleHeight = (data.handleSize) ? data.handleSize : data.trackHeight * data.trackRatio;
						data.scrollRatio = (data.scrollHeight - data.frameHeight) / (data.trackHeight - data.handleHeight);
						data.handleBounds = {
							top: 0,
							bottom: data.trackHeight - data.handleHeight
						};
						
						data.$scroller.data("scroller", data);
						
						var scrollTop = data.$content.scrollTop();
						var handleTop = scrollTop * data.ratio;
						
						if (data.scrollHeight <= data.frameHeight) {
							data.$scroller.removeClass("scroller-active");
						} else {
							data.$scroller.addClass("scroller-active");
						}
						
						data.$bar.css({ height: data.frameHeight });
						data.$track.css({ height: data.trackHeight, marginBottom: data.trackMargin, marginTop: data.trackMargin });
						data.$handle.css({ height: data.handleHeight });
						_position.apply(data.$scroller, [data, handleTop]);
					}
					
					data.$scroller.removeClass("scroller-setup");
				}
			});
		}
	}
	
	function _init(opts) {
		// Local options
		opts = $.extend({}, options, opts || {});
		
		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		return $items;
	}
	
	// Build
	function _build($scroller, opts) {
		if (!$scroller.data("scroller")) {
			// EXTEND OPTIONS
			$.extend(opts, $scroller.data("scroller-options"));
			
			var html = '<div class="scroller-bar">';
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
			
			opts = $.extend({
				$scroller: $scroller,
				$content: $scroller.find(".scroller-content"),
				$bar: $scroller.find(".scroller-bar"),
				$track: $scroller.find(".scroller-track"),
				$handle: $scroller.find(".scroller-handle")
			}, opts);
			
			opts.$content.on("scroll.scroller", opts, _onScroll);
			opts.$scroller.on("mousedown.scroller", ".scroller-track", opts, _onTrackDown)
						   .on("mousedown.scroller", ".scroller-handle", opts, _onHandleDown)
						   .data("scroller", opts);
			
			pub.reset.apply($scroller, [opts]);
			$(window).one("load", function() {
				pub.reset.apply($scroller, [opts]);
			});
		}
	}
	
	function _onScroll(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		if (data.horizontal == true) {
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
	
	function _onTrackDown(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		var offset = data.$track.offset();
		
		if (data.horizontal == true) {
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
		
		data.$scroller.data("scroller", data);
		data.$content.off(".scroller");
		$("body").on("mousemove.scroller", data, _onMouseMove)
				 .on("mouseup.scroller", data, _onMouseUp);
	}
	
	function _onHandleDown(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;

		if (data.horizontal == true) {
			// Horizontal
			data.mouseStart = e.pageX;
			data.handleLeft = parseInt(data.$handle.css("left"), 10);
		} else {
			// Vertical
			data.mouseStart = e.pageY;
			data.handleTop = parseInt(data.$handle.css("top"), 10);
		}
		
		data.$scroller.data("scroller", data);
		data.$content.off(".scroller");
		$("body").on("mousemove.scroller", data, _onMouseMove)
				 .on("mouseup.scroller", data, _onMouseUp);
	}
	
	function _onMouseMove(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		var pos = 0;
		
		if (data.horizontal == true) {
			// Horizontal
			var delta = data.mouseStart - e.pageX;
			pos = data.handleLeft - delta;
		} else {
			// Vertical
			var delta = data.mouseStart - e.pageY;
			pos = data.handleTop - delta;
		}
		
		_position.apply(data.$scroller, [data, pos]);
	}
	
	function _onMouseUp(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		data.$content.on("scroll.scroller", data, _onScroll);
		$("body").off(".scroller");
	}
	
	function _position(data, pos) {
		if (data.horizontal == true) {
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
	
	// Define Plugin
	$.fn.scroller = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);
