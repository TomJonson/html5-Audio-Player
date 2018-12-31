/*!
 * Player Plugin for jPlayer JavaScript Library
 * Web Player Only HTML5 Version
 * Copyright 2017-2018 Player
 * Author: Tom Jonson
 * Licensed under the GNU General Public License v2.0.
 * https://github.com/TomJonson/html5-Audio-Player/blob/master/LICENSE
 * Version: 5.1.12
 * Date: 31.12.2018
 *
 * WebSite (https://github.com/TomJonson)
 */
var jPlayerAndroidFix = (function(jQuery) {
	var fix = function(id, media, options) {
		this.playFix = false;
		this.init(id, media, options);
	};
	fix.prototype = {
		init: function(id, media, options) {
			var self = this;
			// Store the params
			this.id = id;
			this.media = media;
			this.options = options;
			// Make a jQuery selector of the id, for use by the jPlayer instance.
			this.player = jQuery(this.id);
			// Make the ready event to set the media to initiate.
			this.player.bind(jQuery.jPlayer.event.ready, function(event) {
				// Use this fix's setMedia() method.
				self.setMedia(self.media);
			});
			// Apply Android fixes
			if ($.jPlayer.platform.android) {
				// Fix playing new media immediately after setMedia.
				this.player.bind(jQuery.jPlayer.event.progress, function(event) {
					if (self.playFixRequired) {
						self.playFixRequired = false;
						// Enable the contols again
						// self.player.jPlayer("option", "cssSelectorAncestor", self.cssSelectorAncestor);
						// Play if required, otherwise it will wait for the normal GUI input.
						if (self.playFix) {
							self.playFix = false;
							jQuery(this).jPlayer("play");
						}
					}
				});
				// Fix missing ended events.
				this.player.bind(jQuery.jPlayer.event.ended, function(event) {
					if (self.endedFix) {
						self.endedFix = false;
						setTimeout(function() {
							self.setMedia(self.media);
						}, 0);
						// what if it was looping?
					}
				});
				this.player.bind(jQuery.jPlayer.event.pause, function(event) {
					if (self.endedFix) {
						var remaining = event.jPlayer.status.duration - event.jPlayer.status.currentTime;
						if (event.jPlayer.status.currentTime === 0 || remaining < 1) {
							// Trigger the ended event from inside jplayer instance.
							setTimeout(function() {
								self.jPlayer._trigger(jQuery.jPlayer.event.ended);
							}, 0);
						}
					}
				});
			}
			// Instance jPlayer
			this.player.jPlayer(this.options);
			// Store a local copy of the jPlayer instance's object
			this.jPlayer = this.player.data("jPlayer");
			// Store the real cssSelectorAncestor being used.
			this.cssSelectorAncestor = this.player.jPlayer("option", "cssSelectorAncestor");
			// Apply Android fixes
			this.resetAndroid();
			return this;
		},
		setMedia: function(media) {
			this.media = media;
			// Apply Android fixes
			this.resetAndroid();
			// Set the media
			this.player.jPlayer("setMedia", media);
			return this;
		},
		play: function() {
			// Apply Android fixes
			if (jQuery.jPlayer.platform.android && this.playFixRequired) {
				// Apply Android play fix, if it is required.
				this.playFix = true;
			} else {
				// Other browsers play it, as does Android if the fix is no longer required.
				this.player.jPlayer("play");
			}
		},
		resetAndroid: function() {
			// Apply Android fixes
			if (jQuery.jPlayer.platform.android) {
				this.playFix = false;
				this.playFixRequired = true;
				this.endedFix = true;
				// Disable the controls
				// this.player.jPlayer("option", "cssSelectorAncestor", "#NeverFoundDisabled");
			}
		}
	};
	return fix;
})(jQuery);

var _volume = 50;
var _sliderVolume = {};
var _volumeWidth = 90;
jQuery(document).ready(function() {
	jQuery("#containerHidden").jPlayer({
		ready: function(event) {
			ready = true;
			jQuery(this).jPlayer("setMedia", stream);
			jQuery(this).jPlayer("play", 1);
		},
		pause: function() {
			jQuery(this).jPlayer("clearMedia");
		},
		error: function(event) {
			if (ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
				// Setup the media stream again and play it.
				jQuery(this).jPlayer("setMedia", stream).jPlayer("play");
			}
		},
		initialVolume: _volume / 100,
		supplied: "mp3",
		autoPlay: true,
		preload: "none",
		smoothPlayBar: true,
		wmode: "transparent",
		currentTime: ".jtimer",
		useStateClassSkin: true,
		autoBlur: false,
		keyEnabled: true
	});
	_player = jQuery("#containerHidden");
	var id = "#containerHidden";
	var stream = {
		mp3: (location.protocol == "https:" ? "https:" : "http:") + "//url here"
	};
	_player.bind(jQuery.jPlayer.event.stop, function() {
		_player.jPlayer("clearMedia"), StopPlayer(), _player.bind(jQuery.jPlayer.event.timeupdate, self.update_timer);
	}), _player.bind(jQuery.jPlayer.event.play, function() {
		_player.jPlayer("play"), StartPlayer(), _player.bind(jQuery.jPlayer.event.timeupdate, self.update_timer);
	}), self.update_timer = function(e) {
		e = e.jPlayer.status, jQuery(".jtimer").text(jQuery.jPlayer.convertTime(e.currentTime));
	};
	_player.bind(jQuery.jPlayer.event.pause, function(a) {
		jQuery(this).jPlayer("clearMedia");
		StopPlayer();
	});
	_player.bind(jQuery.jPlayer.event.play, function(a) {
		StartPlayer();
	});
	_player.bind(jQuery.jPlayer.event.volumechange, function(a) {
		VolumeChanged(a);
	});
	_sliderVolume.setup();
	_sliderVolume.draw();
});

function PlayPause() {
	if (_isPlaying) return _player.jPlayer("clearMedia"), StopPlayer();
	_player.jPlayer("play"), StartPlayer();
}

function StartPlayer() {
	jQuery("#aPlayPause").css("background-position", "-59px 0px");
	jQuery('#aPlayPause').attr('title', 'Stop');
	_isPlaying = !0;
	return !1;
}

function StopPlayer() {
	jQuery("#aPlayPause").css("background-position", "0px 0px");
	jQuery('#aPlayPause').attr('title', 'Play');
	_isPlaying = !1;
	return !1;
}

function VolumeChanged(a) {}
jQuery("#aPlayPause").click(function() {
	return PlayPause();
});

document.onkeydown = function(e) {
	if (e.keyCode == 32) {
		return PlayPause();
	} else if (e.keyCode == 75) {
		return PlayPause();
	}
};

function ChangeVolume(a) {
	_volume != a && (_volume = a, _player.jPlayer("volume", _volume / 100));
}
_sliderVolume._value = _volume;
_sliderVolume._uipadding = 5;
_sliderVolume.onchange = function(a) {
	ChangeVolume(a);
};

_sliderVolume.setValue = function(a) {
	if (isNaN(a)) return !1;
	a = Math.max(0, Math.min(100, a));
	_sliderVolume._value = a;
	_sliderVolume.draw();
};

_sliderVolume.getValue = function() {
	return _sliderVolume._value;
};

_sliderVolume.draw = function() {
	var a = _volumeWidth - 2 * _sliderVolume._uipadding,
		a = _sliderVolume.getValue() / 100 * a + _sliderVolume._uipadding;
	jQuery('#volume .handler').css('left', a + 'px');
	jQuery('#volume .fill').css('width', a + 'px');
	jQuery('#volume .handler').attr('title', 'Volume');
};

_sliderVolume.calculateFromMouse = function(a) {
	a -= _sliderVolume._uipadding;
	_sliderVolume.setValue(a / (_volumeWidth - 2 * _sliderVolume._uipadding) * 100);
	_sliderVolume.onchange(_sliderVolume.getValue());
};

_sliderVolume.setup = function() {
	jQuery('#volume').append(jQuery('<div class="fill"></div>'));
	jQuery('#volume').append(jQuery('<span class="handler" href="#"></span>'));
	jQuery('#volume').mousedown(function() {
    var parentOffset = jQuery(this).offset(),
    width = jQuery(this).width();
    jQuery(window).mousemove(function(a) {
      var x = a.pageX - parentOffset.left,
      currentPosition = x/width
      var barValue = Math.floor(currentPosition*100);
      if (barValue < 0 ) barValue = 0;
      if (barValue > 100) barValue = 100;
      _sliderVolume.calculateFromMouse(a.pageX - parentOffset.left);
    });
    return false;
  })
  jQuery(document).on("mouseup", function() {
    jQuery(window).unbind("mousemove");
  });
};
