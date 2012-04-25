$(function(){
	$('#posts').imagesLoaded(function(){
		$(this).masonry({
			// options
			itemSelector: '.post',
			gutterWidth: 20
		});
	});
	
	function showModal(postId, postNotesUrl, scrollToNotes) {
		// Callback function
		callback = function(data)
		{
			function insertSource(source_url, source_title) {
				if (source_url)
					$('.modalPostSource').append(
						// TODO: "Source:" string needs to be localized
						$('<span>Source: </span>')
							.append(
								$('<a></a>').attr('href', thePost.source_url)
									.html(source_title ? source_title : source_url)
							)
					);
			}

			if (data.meta.msg == 'OK') {
				var thePost = data.response.posts[0];
			
				// Displays modal
				$('#postModal').modal({ show: true, backdrop: false });
				
				// Changes title of modal
				$('#postModal h3').html(data.response.blog.title);
				
				if (thePost.type == 'photo') {
					// Inserts photo
					$('.modalPostMain').html(
						'<img src="' + thePost.photos[0].alt_sizes[1].url + '" />'
					);
					
					// Inserts caption
					if (thePost.caption)
						$('.modalPostInfo').append(
							$('<div></div>')
								.html(thePost.caption)
						);

					// Inserts source
					insertSource(thePost.source_url, thePost.source_title);

				} else if (thePost.type == 'audio') {
					// Inserts album art
					if (thePost.album_art)
						$('.modalPostMain')
							.append(
								$('<img>').attr('src', thePost.album_art)
							);

					// Inserts player
					if (thePost.player)
						$('.modalPostInfo').append(thePost.player);

					// Inserts caption
					if (thePost.caption)
						$('.modalPostInfo').append($('<div></div>').html(thePost.caption));

					// Inserts artist and trackname
					if (thePost.track_name)
						$('.modalPostInfo').append($('<h5></h5>').html(thePost.track_name));
					if (thePost.artist)
						$('.modalPostInfo').append($('<div></div>').html(thePost.artist));
					if (thePost.album)
						$('.modalPostInfo').append($('<em></em>').html(thePost.album));

					// Inserts source
					insertSource(thePost.source_url, thePost.source_title);
				}
				
				// Loads notes
				$.ajax({
					url: postNotesUrl,
					success: function(data) {
						$('#postModal .modal-body .modalPostNotes').html(data);
						
						// Scrolls to notes
						if (scrollToNotes) {
							$('.modalScroll').scrollTop($('.modalPostNotes').position().top)
						}
					}
				});
				
				// Show the scroll Div
				$('.modalScroll').show();			
				
				console.log(data);
			}
		}

		// Makes request for post
		$.ajax({
			url: 'http://api.tumblr.com/v2/blog/mintyfied.tumblr.com/posts',
			dataType: 'jsonp',
			data:{
				id:postId,
				api_key:'0eTJreMUDVmiI3uF7kaSTf8pYUXOowEjzoJw0l7tT5oTjWsyWr',
				jsonp:'callback'
			}
		});
	}
	
	function resetPostModalContent() {
		$('.modalScroll').hide();
		$('.modalPostMain').html('');
		$('.modalPostInfo').html('');
		$('.modalPostNotes').html('');
		$('.modalPostSource').html('')
	}
	
	$('#postModal').on('hidden', function () {
		resetPostModalContent();
	});	
	
	$('.modalScroll').click(function() {
		$('#postModal').modal('hide');
	});
	
	$('#postModal').click(function(event) {
		// prevents modal from closing when clicking on #postModal since clicking on parent modalScroll will close
		event.stopPropagation();
	});
	
	// Launches modal when clicked
	$('.modalLink').click(function() {
		var $modalLink = $(this);
		showModal($modalLink.attr('data-postid'), $modalLink.attr('data-postnotesurl'), false);

		return false;
	});
	
	// Lauches modal and scroll to notes section
	$('.noteCount').click(function() {
		var $modalLink = $(this);
		showModal($modalLink.attr('data-postid'), $modalLink.attr('data-postnotesurl'), true);

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
	$('article').each(function() {
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

		// Add canvas element to DOM after figcaption
		if ($audioDesc.length > 0) {
			$canvasCaption
				.attr('width', $article.width())
				.attr('height', $audioDesc.height())
				.attr('style', 'clip: rect(' + ($audioDesc.height() - 2)+ 'px, 250px, ' + $audioDesc.height() + 'px, 0px)');
			$audioDesc.css({position:'relative'}).after($canvasCaption);
		}
		// $indexPage.css({position:'relative'}).append($canvasIndexPage);

		// Draw stuff
		if ($figcaption.length > 0)
			drawCanvas($canvasCaption.get(0), $article.width(), $figcaption.height());
		if ($audioDesc.length > 0)
			drawCanvas($canvasCaption.get(0), $article.width(), $audioDesc.height());
		// drawCanvas($canvasIndexPage.get(0), $indexPage.width(), $indexPage.height());
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