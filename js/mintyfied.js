(function($){
// *****************
//  MODELS
// *****************
	var Post = Backbone.Model.extend({
		defaults: {
			id: '0',
			url: '',
			type: '',
			notesUrl: '',
			reblogKey: ''
		}
	});

	var ModalPost = Backbone.Model.extend({
		defaults: _.extend(
			Post.prototype.defaults,
			{
				isVisible: false,
				scrollToNotes: false
			}
		)
	});

	var LoadMore = Backbone.Model.extend({
		defaults: {
			totalPages: 0,
			page: 1
		}
	});

// *****************
//  COLLECTIONS
// *****************
	var Posts = Backbone.Collection.extend({
		model: Post
	});

// *****************
//  VIEWS
// *****************
	var PostsView = Backbone.View.extend({
		el: $('.posts'),

		initialize: function() {
			_.bindAll(this, 'render', 'addPosts');

			this.collection = new Posts();

			var $posts = this.$el.find('.post');

			this.addPosts($posts);
			this.render($posts);
		},

		render: function($posts, appended, callback) {
			var view = this;

			// Position posts with Isotope plugin
			view.$el.imagesLoaded(function(){
				if (!appended)
					this.isotope({
						itemSelector:'.post',
						transformsEnabled:false,
						masonry:{
							columnWidth:280
						}
					},
					function() {
						if (callback) callback();
					});
				else
					this.isotope('appended', $posts, function() {
						if (callback) callback();
					});
			});
		},

		addPosts: function($posts, appended) {
			var _this = this;

			// If appended, add to DOM first and then create the model and view
			if (appended) {
				this.$el.append($posts);
			}

			_($posts).each(function(postElement){
				var
					$postElement = $(postElement),
					post = new Post({
						id: $postElement.attr('data-post-id'),
						url: $postElement.attr('data-post-url'),
						type: $postElement.attr('data-post-type'),
						notesUrl: $postElement.attr('data-post-notesurl'),
						reblogKey: $postElement.attr('data-post-reblogurl').split($postElement.attr('data-post-id') + '/')[1]
					})
				;

				_this.collection.add(post);

				new PostView({
					el: $postElement,
					model: post
				});		
			});
		}
	});

	var PostView = Backbone.View.extend({
		initialize: function(){
			_.bindAll(this, 'render');

			this.render();
		},

		events: {
			'click .modalLink': function() { 
				modalView.model.set({
					id: this.model.get('id'),
					url: this.model.get('url'),
					type: this.model.get('type'),
					notesUrl: this.model.get('notesUrl'),
					isVisible: true,
					scrollToNotes: false
				});

				return false;
			},
			'click .noteCount': function() {
				modalView.model.set({
					id: this.model.get('id'),
					url: this.model.get('url'),
					type: this.model.get('type'),
					notesUrl: this.model.get('notesUrl'),
					isVisible: true,
					scrollToNotes: true
				});

				return false;
			}
		},

		render: function() {
			this.$el.find('figcaption').canvasBackground();
			this.$el.find('.audioDesc').canvasBackground();
			this.$el.find('.permalink').tooltip({
				placement: 'bottom'
			});
		}
	});

	var ModalView = Backbone.View.extend({
		el: $('.modalScroll'),

		initialize: function() {
			_.bindAll(this, 'showModal', 'hideModal');

			view = this;

			view.model = new ModalPost();
			view.model.on('change:isVisible', function() { 
				if (view.model.get('isVisible'))
					view.showModal(view.model.get('scrollToNotes'));
				else
					view.hideModal();
			});

			// Hide modal on hide event
			$('#postModal').on('hidden', function() { view.model.set({ isVisible: false }) });

			// Hide modal when clicking outside of it
			$('.modalScroll').click(function() { view.model.set({ isVisible: false }) });

			// prevents modal from closing when clicking on #postModal since clicking on parent modalScroll will close
			$('#postModal').click(function(event) {
				event.stopPropagation();
			});			
		},

		showModal: function(scrollToNotes) {
			var viewModel = this.model;

			// Makes request for post
			$('.modalPost').load(viewModel.get('url') + ' article', function(data) {

				// Set title of modal to the date of the post
				var $date = $(this).find('.date');
				$('.modal-header h3').html($date.html());

				// Remove date from post
				$date.remove();

				// Loads notes
				$('.modalPostNotes').load(viewModel.get('notesUrl'),
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
		},

		hideModal: function() {
			// Resets modal content
			$('.modalScroll').hide();
			$('.modalPost').html('');
			$('.modalPostNotes').html('');
			
			// Hide modal
			$('#postModal').modal('hide');
		}
	});

	var LoadMoreView = Backbone.View.extend({
		el: $('.loadMore'),
		
		initialize: function() {
			var view = this;

			view.model = new LoadMore({
				page: view.$el.attr('data-page'),
				totalPages: view.$el.attr('data-total-pages')
			});

			view.model.on('change:page', function() {
				if (this.get('page') == this.get('totalPages'))
					view.$el.find('.load').hide();
			});

			this.$el.find('.load').canvasBackground();
		},

		events: {
			'click .load': function() { 
				this.loadMore();
				return false;
			}
		},

		loadMore: function(callback) {
			var
				view = this,
				nextPage = parseInt(view.model.get('page')) + 1
			;

			$.ajax({
				url:'/page/' + nextPage,
				success:function(data) {
					var $newPosts = $(data).find('.posts .post');
					postsView.addPosts($newPosts, true);
					postsView.render($newPosts, true, function() {
						// sets new page
						view.model.set({page: nextPage});

						// scrolls to new posts
						$('html, body').animate({scrollTop: $newPosts.position().top}, 500, 'swing');

						if (callback) callback();
					});
				}
			});			
		}
	});

	var postsView = new PostsView();
	var modalView = new ModalView();
	var loadMore = new LoadMoreView();
})(jQuery);