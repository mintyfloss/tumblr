$(function(){
	$('.posts').imagesLoaded(function(){
		$(this).isotope({
			itemSelector:'.post',
			masonry:{
				columnWidth:270
			}
		},
		function() { console.log('done') });
	});
	
	function showModal(postUrl, postNotesUrl, scrollToNotes) {
		// Makes request for post
		$('.modalPost').load(postUrl + ' article', function(data) {

			// Set title of modal to the date of the post
			var $date = $(this).find('.date');
			$('#postModal h3').html($date.html());

			// Remove date from post
			$date.remove();

			// Loads notes
			$('.modalPostNotes').load(postNotesUrl,
				function() {
					// Scrolls to notes
					if (scrollToNotes) {
						$('.modalScroll').scrollTop($('.modalPostNotes').position().top)
					}
				}
			);

			// Show Modal
			$('#postModal').modal({ show: true, backdrop: false });

			// Show Modal Scroll
			$('.modalScroll').show();	
		});
	}
	
	function resetPostModalContent() {
		$('.modalScroll').hide();
		$('.modalPost').html('');
		$('.modalPostNotes').html('');
	}
	
	// Reset modal content when modal is hidden
	$('#postModal').on('hidden', function () {
		resetPostModalContent();
	});	
	
	// Hide modal when clicking outside of it
	$('.modalScroll').click(function() {
		$('#postModal').modal('hide');
	});
	
	// prevents modal from closing when clicking on #postModal since clicking on parent modalScroll will close
	$('#postModal').click(function(event) {
		event.stopPropagation();
	});
	
	// Launches modal when clicked
	$('.modalLink').click(function() {
		var $modalLink = $(this);
		showModal($modalLink.attr('href'), $modalLink.attr('data-postnotesurl'), false);

		return false;
	});
	
	// Lauches modal and scroll to notes section
	$('.noteCount').click(function() {
		var $modalLink = $(this);
		showModal($modalLink.attr('href'), $modalLink.attr('data-postnotesurl'), true);

		return false;
	});

	// Pagination
	$('.pagination a').click(function() {
		function callback() {
			console.log('done');

		}

		$.ajax({
			url:$(this).attr('href'),
			success:function(data) {
				var $newPosts = $(data).find('.posts .post');
				$('.posts').append($newPosts).imagesLoaded(
					function() {
						$(this).isotope('appended', $newPosts, callback);
					}
				);
			}
		});

		return false;
	});

	// Do cool canvas stuff
	function drawCanvas(node, width, height) {
		if (node.getContext) {
			var ctx = node.getContext("2d");  

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
			


			// ctx.beginPath();

			// for (var i = width; i > 0; i-=2) {
			// 	ctx.moveTo(width, i);
			// 	ctx.lineTo(i/2, width);
			// }
			
			// ctx.strokeStyle = "#000";
			// ctx.stroke();
			// ctx.closePath();
		}
	}

	// Add canvas element and position it over text
	$('.posts article').each(function() {
		var
			$article = $(this),
			$figcaption = $(this).find('figcaption'),
			$audioDesc = $(this).find('.audioDesc')
			$canvasCaption = $('<canvas></canvas>')
				.attr('class', 'captionOverlay')
		;

		// Add canvas element to DOM after figcaption
		if ($figcaption.length > 0) {
			$canvasCaption
				.attr('width', $article.width())
				.attr('height', $figcaption.height())
				.attr('style', 'clip: rect(' + ($figcaption.height() - 2)+ 'px, 250px, ' + $figcaption.height() + 'px, 0px)');
			$figcaption.css({position:'relative'}).after($canvasCaption);
		}

		// Add canvas element to DOM after .audioDesc
		if ($audioDesc.length > 0) {
			$canvasCaption
				.attr('width', $article.width())
				.attr('height', $audioDesc.height())
				.attr('style', 'clip: rect(' + ($audioDesc.height() - 2)+ 'px, 250px, ' + $audioDesc.height() + 'px, 0px)');
			$audioDesc.css({position:'relative'}).after($canvasCaption);
		}

		// Draw stuff
		if ($figcaption.length > 0)
			drawCanvas($canvasCaption.get(0), $article.width(), $figcaption.height());
		if ($audioDesc.length > 0)
			drawCanvas($canvasCaption.get(0), $article.width(), $audioDesc.height());
	});


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

		if(s == 0){
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [r * 255, g * 255, b * 255];
	}
});