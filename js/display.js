/**
 * ML Sticky Notes
 */
(function ($) {
	$(function () {
		/**
		 * JSON string containing all saved sticky notes for this page
		 */
		var savedStickies = MLStickyNotes.saved;

		/**
		 * Z-index counter (ensure clicked stickies always appear on top)
		 */
		var zindex = 1;

		/**
		 * Sticky note
		 */
		$.MLStickyNote = function(options) {
			var noteBorder;
			var note;
			var self = this;

			/**
			 * Add the note to the page
			 */
	        this.create = function() {
				noteBorder = $("<div />")
							.css({
								'text-rendering' : 'optimizeLegibility',
								'border-radius' : '4px',
								'position' : 'absolute',
								'top' : options.top + 'px',
								'left' : options.left + '%',
								'background' : '#FCF0AD',
								'padding' : '10px',
								'z-index' : zindex++,
								'cursor' : 'move',
								'box-shadow' : 'rgb(136, 136, 136) 0px 4px 5px'
							})
							.drag(function( ev, dd ) {
								options.left = (dd.offsetX / $(window).width() ) * 100; // %age val
								options.top = dd.offsetY;

						        $(this).css({
						           'top': options.top + "px",
						           'left': options.left + "%"
						        });

						        self.tilt();
						    })
							.drag('end', function( ev, dd ) { 
						        self.save();
						    })
						    .mousedown(function() {
						    	zindex++;
						    	$(this).css('z-index', zindex);
						    });
							
				note = $("<textarea />")
							.css({
								'background' : 'transparent',
								'-webkit-transform' : 'translate3d(0,0,0)', // anti aliasing for chrome (windows)
								'width' : '150px',
								'height' : '150px',
								'font-size' : '16px',
								'border' : '0',
								'font-family' : 'Marker Felt, Comic Sans MS',
								'color' : '#666',
								'outline' : 'none',
								'line-height' : '1.5em'
							 })
							.blur(function() {
								options.text = escape($(this).val());
								self.save();
								self.tilt();
							})
							.click(function() {
					    		self.straighten();
							})
							.val(unescape(options.text));

				noteBorder.append(note);

				$('body').append(noteBorder);
			}

			/**
			 * Tilt the note either left or right depending on which side of the page it is
			 */
			this.tilt = function() {
				var offset = noteBorder.offset();

		        if (offset.left > (($(window).width() / 2) - 75)) {
		        	noteBorder.css({
		        		'opacity' : '1',
		        		'-webkit-transform' : 'rotate(4deg)'
		        	})
		        } else {
		        	noteBorder.css({
		        		'opacity' : '1',
		        		'-webkit-transform' : 'rotate(-4deg)'
		        	})	
		        }
			}

			/**
			 * Strighten the note positioning / untilt
			 */
			this.straighten = function() {
	    		noteBorder.css({
	    			'opacity' : '1',
	    			'transform' : 'rotate(0deg)'
	    		});	
			}

			/**
			 * Get the caret ready for typing
			 */
			this.setCaret = function() {
				var noteVal = note.val();
				note.val("");
				note.focus();
				note.val(noteVal);
			}

			/**
			 * Save note
			 */
			this.save = function() {
				if (note.val().length == 0) {
					noteBorder.fadeOut();
				}

				$.post(MLStickyNotes.ajaxurl, { 
						action: 'save-note',
						nonce: MLStickyNotes.nonce,
						pageid: MLStickyNotes.pageid,
						note: options
					}
				);
			}
		};

		/**
		 * Initialize
		 */
		var init = function() {
			var addButton = $("<div />")
								.css({
									'position' : 'relative',
									'top' : '35px',
									'left' : '6px',
									'background' : "white url('data:application/octet-stream;base64,iVBORw\
										0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABD0lEQVR42mMwNzf3NzMzCwDS\
										+6iJTU1NAy0tLQ0ZgJwsIP5PCwx0uBPIgt9QgQ9AfNDCwiKXEgwyA2oWyILZyBbsZa\
										ASABp8AJsFWdSyAGhWwcBaAGT3A/EOUjDQsFJSLFgGxFdJwUDDOkgJIkYgZoLSxGCY\
										2sETB3zAXChECtbT0+MmxYK9QPyJRDyTFAtACiaQgoG5OHrwxAEVLMgmFEQ2QEkfXB\
										hYFEvgMtzY2JgVqH8VIQvO4yuGgeEdhMfwuUjFNXYLgMnODMh3xYVtbW1FCRlO1TjA\
										ZjjVLIAaPg9HjUZZhePg4MCCy3BsFvyA1kTZJOBVBOrk2bSv9E1MTNSBjDigwH1qYm\
										DcaIDyCwDpR/OPvCWtIAAAAABJRU5ErkJggg==')",
									'padding' : '12px',
									'z-index' : zindex++,
									'position' : 'fixed',
									'opacity' : '0.5',
									'transition-duration' : '0.3s',
									'font-size' : '2em',
									'font-weight' : 'bold',
									'cursor' : 'pointer'
								})
								.attr('title', 'Add Sticky Note')
								.click(function() {
									var sticky = new $.MLStickyNote({
										'top' : $('body').scrollTop() + 50,
										'left' : '5',
										'text' : 'New Note',
										'id' : new Date().getTime()
									});
									sticky.create();
									sticky.save();
									sticky.setCaret();
								})
								.hover(function() {
									$(this).css('opacity', '1');
								})
								.mouseout(function() {
									$(this).css('opacity', '0.5')
								});

			$('body').append(addButton);
		}

		/**
		 * Restore the existing sticky notes
		 */
		var restore = function() {
			if (savedStickies.length > 0) {
				stickies = JSON.parse(savedStickies);

				$.each(stickies, function(index, value) {
					var sticky = new $.MLStickyNote(value);
					sticky.create();
					sticky.tilt();
				});
			}
		}

		init();
		restore();
	});
}(jQuery));