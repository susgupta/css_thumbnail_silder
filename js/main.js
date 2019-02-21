/*
 * The images preload plugin, copied as per tutorial
 */
(function ($) {
	$.fn.preload = function (options) {
		var opts = $.extend({}, $.fn.preload.defaults, options);
		console.log(this.data());
		o = $.meta ? $.extend({}, opts, this.data()) : opts;
		var c = this.length,
			l = 0;
		console.log("C length is: " + c);
		return this.each(function () {
			console.log("In preload callback");
			var $i = $(this);
			$('<img/>').load(function (i) {
				++l;
				if (l == c) o.onComplete();
			}).attr('src', $i.attr('src'));
		});
	};
	$.fn.preload.defaults = {
		onComplete: function () { return false; }
	};
})(jQuery);

/*
 * The main function to handle the slider
 */
$(function () {

	//declare varibles and selected elements
	var $tf_bg = $('#tf_bg');
	var $tf_bg_images = $tf_bg.find('img');
	var $tf_bg_img = $tf_bg_images.eq(0);
	var $tf_thumbs = $('#tf_thumbs');
	var total = $tf_bg_images.length;
	var current = 0; //current index position for image array
	var $tf_content_wrapper = $('#tf_content_wrapper');
	var $tf_next = $('#tf_next');
	var $tf_prev = $('#tf_prev');
	var $tf_loading = $('#tf_loading');

	//using Jquery, once preloaded, call the init
	$tf_bg_images.preload({
		onComplete: function () {
			$tf_loading.hide();
			init();
		}
	});

	//custom init routine
	function init() {

		var dimensions = getImageDimensions($tf_bg_img);
		//set the returned values and show the image, using JQUERY animate
		$tf_bg_img.css({
			width: dimensions.width,
			height: dimensions.height,
			left: dimensions.left,
			top: dimensions.top
		}).fadeIn();

		//bind to callback on 'resize', again calling on common function for getting window size
		$(window).bind('resize', function () {
			var dimensions = getImageDimensions($tf_bg_img);
			$tf_bg_img.css({
				width: dimensions.width,
				height: dimensions.height,
				left: dimensions.left,
				top: dimensions.top
			});
		});

		//again use JQuery
		$('#tf_zoom').live('click',
			function () {

				if ($tf_bg_img.is(':animated')) {
					return false;
				}

				var $this = $(this);
				//if zoomed, set css to fullscreen
				if ($this.hasClass('tf_zoom')) {
					resize($tf_bg_img);
					$this.addClass('tf_fullscreen').removeClass('tf_zoom');
				}
				else {
					//get dimensions for zooming
					var dimensions = getImageDimensions($tf_bg_img);
					//use Jquery animate API
					$tf_bg_img.animate({
						width: dimensions.width,
						height: dimensions.height,
						top: dimensions.top,
						left: dimensions.left
					}, 350);
					$this.addClass('tf_zoom').removeClass('tf_fullscreen');
				}
			}
		);

		//click the arrow down, scrolls down
		$tf_next.bind('click', function () {
			if ($tf_bg_img.is(':animated')) {
				return false;
			}
			scroll('tb');
		});

		//click the arrow up, scrolls up
		$tf_prev.bind('click', function () {
			if ($tf_bg_img.is(':animated')) {
				return false;
			}
			scroll('bt');
		});

		//apply mousewheel scrolling
		$(document).mousewheel(function (e, delta) {
			if ($tf_bg_img.is(':animated')) {
				return false;
			}
			if (delta > 0) {
				scroll('bt');
			}
			else {
				scroll('tb');
			}
			return false;
		});
	}

	//common function to handle scroll animation
	function scroll(dir) {
		//determine which 'current'image
		current = (dir == 'tb') ? current + 1 : current - 1;

		//if at max size decrement from collection image position etc.
		if (current == total) {
			current = 0;
		}
		else if (current < 0) {
			current = total - 1;
		}

		//flip the thumb, using JQuery
		$tf_thumbs.flip({
			direction: dir,
			speed: 400,
			onBefore: function () {
				//the new thumb is set here
				var content = '<span id="tf_zoom" class="tf_zoom"></span>';
				content += '<img src="' + $tf_bg_images.eq(current).attr('longdesc') + '" alt="Thumb' + (current + 1) + '"/>';
				$tf_thumbs.html(content);
			}
		});

		//need next image
		var $tf_bg_img_next = $tf_bg_images.eq(current);
		//next image dimentions
		var dimensions = getImageDimensions($tf_bg_img_next);

		//the top should be one that makes the image out of the viewport
		//the image should be positioned up or down depending on the direction
		var top = (dir == 'tb') ? $(window).height() + 'px' : -parseFloat(dimensions.height, 10) + 'px';

		//set the returned values and show the next image	
		$tf_bg_img_next.css({
			width: dimensions.width,
			height: dimensions.height,
			left: dimensions.left,
			top: top
		}).show();

		//animate using JQuery
		$tf_bg_img_next.stop().animate({
			top: dimensions.top
		}, 1000);

		//determine thumbnail slide
		var slideTo = (dir == 'tb') ? -$tf_bg_img.height() + 'px' : $(window).height() + 'px';

		//use Jquery to stop slide and hide old image in callback
		$tf_bg_img.stop().animate({
			top: slideTo
		}, 1000, function () {
			//hide old 
			$(this).hide();
			//the $tf_bg_img is now the shown image
			$tf_bg_img = $tf_bg_img_next;
			//show the description for the new image
			$tf_content_wrapper.children().eq(current).show();
		});
		//hide the current description	
		$tf_content_wrapper.children(':visible').hide();
	}

	//common get dimentions of the image, 
	//in order to make it full size and centered
	function getImageDimensions($img) {

		//declare dimension varibles
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		var remainderWindow = windowHeight / windowWidth;
		var imageWidth = $img.width();
		var imageHeight = $img.height();
		var remainderImage = imageHeight / imageWidth;
		var newWidth;
		var newHeight;

		//adjust based in size of window (responsiveness)
		if (remainderWindow > remainderImage) {
			newHeight = windowHeight;
			newWidth = windowHeight / remainderImage;
		}
		else {
			newHeight = windowWidth * remainderImage;
			newWidth = windowWidth;
		}

		//return dimensions
		return {
			width: newWidth + 'px',
			height: newHeight + 'px',
			left: (windowWidth - newWidth) / 2 + 'px',
			top: (windowHeight - newHeight) / 2 + 'px'
		};
	}
});
