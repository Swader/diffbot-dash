/**
 * @preserve jQuery TimePicker plugin v1.9.6
 * @homepage http://xdsoft.net/jqplugins/timepicker/
 * @copyright (c) 2015 xdsoft.net Chupurnov Valeriy
 * @license Basic http://xdsoft.net/jqplugins/periodpicker/license/
 */
/*global jQuery,document,window,moment,clearTimeout,setTimeout,alert,console*/
(function ($, window, document) {
	'use strict';
	var uniqueid = 1;
	function TimeWrapper(options) {
		var now = new Date(), pm = 0, that = this;
		that.onChange = [];
		that.isValid = function (now) {
			if (Object.prototype.toString.call(now) !== "[object Date]") {
				return false;
			}
			return !isNaN(now.getTime());
		};
		that.hours12Format = function () {
			var value = now.getHours();
			if (value === 0) {
				return 12;
			}
			if (value > 0 && value < 13) {
				return value;
			}
			if (value > 12 && value <= 23) {
				return value - 12;
			}
		};
		that.to12Format = function (value) {
			if (value === 12 && !pm) {
				return 0;
			}
			return (pm && value < 12) ? value + 12 : value;
		};
		that.index = function (index, value) {
			var h;
			if (value !== undefined && value !== null) {
				value = parseInt(value, 10);
				switch (index) {
				case 1:
					now.setMinutes(value);
					break;
				case 2:
					now.setSeconds(value);
					break;
				case 3:
					h = now.getHours();
					pm = value;
					if (h < 12 && value) {
						now.setHours(h + 12);
					} else if (h >= 12 && !value) {
						now.setHours(h - 12);
					}
					break;
				default:
					now.setHours((options.twelveHoursFormat) ?  that.to12Format(value) : value);
					break;
				}
				pm = that.index(3);
				if (that.onChange.length) {
					for (h = 0; h < that.onChange.length; h += 1) {
						if ($.isFunction(that.onChange[h])) {
							that.onChange[h].call(that, that.get(), now);
						}
					}
				}
			}
			switch (index) {
			case 1:
				return now.getMinutes();
			case 2:
				return now.getSeconds();
			case 3:
				pm = (now.getHours() >= 12 ? 1 : 0); // 1 - pm, 0 - am
				return pm;
			default:
				return options.twelveHoursFormat ? that.hours12Format() : now.getHours();
			}
		};
		that.set = function (strOrDate) {
			var h, buff = that.isValid(strOrDate) ? strOrDate : (window.moment !== undefined ? moment(strOrDate, options.inputFormat).toDate() : Date.parse(strOrDate));
			if (that.isValid(buff)) {
				now = buff;
				if (that.onChange.length) {
					for (h = 0; h < that.onChange.length; h += 1) {
						if ($.isFunction(that.onChange[h])) {
							that.onChange[h].call(that, that.get(), now);
						}
					}
				}
			}
		};
		that.get = function () {
			return window.moment !== undefined ? moment(now).format(options.inputFormat) : String(now);
		};
		return that;
	}

	function TimePicker(startinput, options, box) {
		var that = this;
		that.box = box || document.body;
		that.options = options;
		that.startinput = $(startinput);
		that.uniqueid = uniqueid;
		uniqueid += 1;
		that.init();
	}
	TimePicker.prototype.getRealOffset = function (j) {
		var index = this.getIndex(j);
		return this.indexes[j].indexOf(index) !== -1 ? this.indexes[j].indexOf(index) * this.itemHeight() : 0;
	};
	TimePicker.prototype.getIndex = function (j) {
		return Math.floor(this.currentime.index(j) / this.options.steps[j]) * this.options.steps[j];
	};
	TimePicker.prototype.height = function () {
		return this.timepicker ? parseInt(this.timepicker.get(0).offsetHeight, 10) : 0;
	};
	TimePicker.prototype.itemHeight = function () {
		return this.items[0][0] ? parseInt(this.items[0][0].get(0).offsetHeight, 10) : 22;
	};
	TimePicker.prototype.highlight = function () {
		var i, val;
		if (this.last === undefined) {
			this.last = [];
		}
		for (i = 0; i < this.boxes.length; i += 1) {
			val = this.getIndex(i);
			if (this.items[i][this.indexes[i].indexOf(val)] !== undefined) {
				this.items[i][this.indexes[i].indexOf(val)].addClass('active');
			}
			if (this.last[i] !== undefined && this.last[i] !== this.indexes[i].indexOf(val) && this.items[i][this.last[i]] !== undefined) {
				this.items[i][this.last[i]].removeClass('active');
			}
			this.last[i] = this.indexes[i].indexOf(val);
		}
	};
	TimePicker.prototype.setTime = function () {
		var offset, j;

		for (j = this.boxes.length - 1; j >= 0; j -= 1) {
			this.currentime.index(j, arguments[j]);
		}

		for (j = 0; j < this.boxes.length; j += 1) {
			if (this.boxes[j] !== undefined) {
				offset = -this.getRealOffset(j) + Math.ceil(this.height() - this.itemHeight()) / 2;
				this.boxes[j].css('margin-top', offset + 'px');
			}
		}

		this.highlight();
	};
	TimePicker.prototype.xy = function (e) {
		var out = {x: 0, y: 0},
			touch;
		if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
			touch  = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			out.x = touch.clientX;
			out.y = touch.clientY;
		} else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
			out.x = e.clientX;
			out.y = e.clientY;
		}
		return out;
	};
	TimePicker.prototype.init = function () {
		var that = this, start, diff, maxindex;

		that.timepicker = $('<div class="periodpicker_timepicker xdsoft_noselect">' +
			'<div class="periodpicker_timepicker_sliders">' +
				(that.options.hours ?
					'<div data-index="0" class="periodpicker_hourspicker_box">' +
						'<div class="periodpicker_hourspicker"></div>' +
						'<input readonly="true" type="text"/>' +
					'</div>' : '') +
				(that.options.minutes ?
					'<div data-index="1" class="periodpicker_minutespicker_box">' +
						'<div class="periodpicker_minutespicker"></div>' +
						'<input readonly="true" type="text"/>' +
					'</div>' : '') +
				(that.options.seconds ?
					'<div data-index="2" class="periodpicker_secondspicker_box">' +
						'<div class="periodpicker_secondspicker"></div>' +
						'<input readonly="true" type="text"/>' +
					'</div>' : '') +
				(that.options.ampm ?
					'<div data-index="3" class="periodpicker_ampmpicker_box">' +
						'<div class="periodpicker_ampmpicker">' +
							'<div data-value="0" class="periodpicker_0 periodpicker_item">AM</div>' +
							'<div data-value="1" class="periodpicker_1 periodpicker_item">PM</div>' +
						'</div>' +
						'<input readonly="true" type="text"/>' +
					'</div>' : '') +
			'</div>' +
			'<div class="periodpicker_timepicker_center"></div>' +
			'</div>');

		that.currentime = new TimeWrapper(that.options);

		if (that.startinput.length && that.startinput.val()) {
			that.currentime.set(that.startinput.val());
		} else {
			that.currentime.set(that.options.defaultTime);
		}

		if (that.options.onChange) {
			that.currentime.onChange.push(that.options.onChange);
		}

		if (that.options.saveOnChange) {
			that.currentime.onChange.push(function (v) {
				var oldvalue = that.startinput.val();
				that.startinput.val(v);
				if (v !== oldvalue) {
					that.startinput.trigger('change');
				}
			});
		}

		that.boxes = {};
		maxindex = 0;
		that.timepicker.find('.periodpicker_timepicker_sliders>div>div').each(function () {
			maxindex = Math.max(maxindex, parseInt($(this).parent().data('index'), 10));
			that.boxes[parseInt($(this).parent().data('index'), 10)] = $(this);
		});
		that.boxes.length = maxindex + 1;

		that.timepicker.find('.periodpicker_timepicker_sliders>div').addClass('periodpicker_col' + that.timepicker.find('.periodpicker_timepicker_sliders>div>div').length);

		that.timer2 = 0;
		that.timepicker.on('mousewheel', function (e) {
			if (that.options.mouseWheel) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
		that.timepicker.find('.periodpicker_timepicker_sliders>div').on('mousewheel', function (e) {
			if (that.options.mouseWheel) {
				var box = $(this), time = [null, null, null, null], i = parseInt($(this).data('index'), 10);
				box.addClass('draggable');
				if (i < 3) {
					time[i] = that.currentime.index(i) + (-e.deltaY * (that.options.inverseMouseWheel ? -1 : 1)) * that.options.steps[i];
				} else {
					time[i] = that.currentime.index(i) - 1;
				}
				that.setTime.apply(that, time);
				clearTimeout(that.timer2);
				that.timer2 = setTimeout(function () {
					box.removeClass('draggable');
				}, 300);
				e.preventDefault();
				e.stopPropagation();
			}
		});

		that.timepicker.find('.periodpicker_timepicker_sliders').on('click', '.periodpicker_item', function () {
			if (that.options.clickAndSelect) {
				var  value = parseInt($(this).data('value'), 10), time = [null, null, null, null], i = parseInt($(this).parent().parent().data('index'), 10);
				if (!that.iwasdragged && !isNaN(value)) {
					time[i] = value;
					that.setTime.apply(that, time);
				}
			}
		});

		that.timepicker.find('.periodpicker_timepicker_sliders>div').on('click', function () {
			//$(this).find('input')[0].focus();
		});
		that.timer = 0;
		that.timepicker.find('.periodpicker_timepicker_sliders>div input').on('keydown', function (e) {
			if (that.options.listenKeyPress) {
				var time = [null, null, null, null], $input = $(this), i = parseInt($input.parent().data('index'), 10);
				switch (e.keyCode) {
				case 38:
					time[i] = that.currentime.index(i) - that.options.steps[i];
					that.setTime.apply(that, time);
					break;
				case 39:
					if ($(this).parent().next().length) {
						$(this).parent().next().find('input')[0].focus();
					}
					break;
				case 37:
					if ($(this).parent().prev().length) {
						$(this).parent().prev().find('input')[0].focus();
					}
					break;
				case 40:
					time[i] = that.currentime.index(i) + that.options.steps[i];
					that.setTime.apply(that, time);
					break;
				default:
					if (/[0-9amp]/i.test(String.fromCharCode(e.keyCode))) {
						$input.val($input.val() + String.fromCharCode(e.keyCode));
					}
					clearTimeout(that.timer);
					that.timer = setTimeout(function () {
						var value = $input.val();
						$input.val('');
						if (i === 3 && value.length) {
							value = value.toLowerCase().substr(0, 1) === 'p' ? 1 : 0;
						}
						if (!isNaN(value = parseInt(value, 10))) {
							time[i] = value;
							that.setTime.apply(that, time);
						}
					}, 300);
				}
			}
		});

		that.timepicker.find('.periodpicker_timepicker_sliders>div').on('mousedown.xdsoft touchstart.xdsoft', function (e) {
			if (that.options.dragAndDrop) {
				that.drag = true;
				start = [that.xy(e).x, that.xy(e).y];

				start[4] = parseInt($(this).data('index'), 10);
				start[3] = that.boxes[start[4]];
				start[2] = parseInt(start[3].css('margin-top'), 10);

				start[3].find('div').removeClass('active');
				start[3].parent().addClass('draggable');
				//$(this).find('input')[0].focus();
				that.iwasdragged = false;
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		});
		that.iwasdragged = false;
		$(window)
			.on('mouseup.xdsoft' + that.uniqueid + ' touchend.xdsoft' + that.uniqueid, function (e) {
				if (that.options.dragAndDrop && that.drag) {
					that.drag = false;
					that.setTime();
					start[3].parent().removeClass('draggable');
					e.stopImmediatePropagation();
				}
			})
			.on('mousemove.xdsoft' + that.uniqueid + ' touchmove.xdsoft' + that.uniqueid, function (e) {
				if (that.drag && that.options.dragAndDrop) {
					diff = [that.xy(e).x - start[0], that.xy(e).y - start[1]];
					start[3].css({
						marginTop: start[2] + diff[1]
					});
					if (diff[1] > 10) {
						that.iwasdragged = true;
					}
					var value =  -Math.round((-(that.height() - that.itemHeight()) / 2 + start[2] + diff[1]) / that.itemHeight());
					if (value < 0) {
						value = 0;
					}
					if (value >= that.items[start[4]].length) {
						value = that.items[start[4]].length - 1;
					}
					value =	parseInt(that.items[start[4]][value].data('value'), 10);
					that.currentime.index(start[4], value);
					that.highlight();
					e.preventDefault();
				}
			});
		$(that.box).append(that.timepicker);
		that.generateTimepicker();
		that.setTime();
	};
	TimePicker.prototype.destroy = function () {
		var that = this;
		$(window)
			.off('mouseup.xdsoft' + that.uniqueid + ' touchend.xdsoft' + that.uniqueid)
			.off('mousemove.xdsoft' + that.uniqueid + ' touchmove.xdsoft' + that.uniqueid);
		that.timepicker.remove();
		delete that.timepicker;
		delete that.boxes;
		delete that.currentime;
	};
	TimePicker.prototype.generateTimepicker = function () {
		var i, j, that = this;
		that.items = [[], [], [], []];
		that.indexes = [[], [], [], [0, 1]];

		for (i = 0; i <= 2; i += 1) {
			if (that.options.parts[i] !== undefined && that.boxes[i] !== undefined) {
				if (!that.options.twelveHoursFormat || i > 0) {
					for (j = that.options.parts[i][0][0]; j <= that.options.parts[i][0][1]; j += that.options.steps[i]) {
						that.items[i].push($('<div data-value="' + j + '" class="periodpicker_' + j + ' periodpicker_item">' + (j < 10 ? '0' : '') + j + '</div>'));
						that.indexes[i].push(j);
					}
				} else {
					that.items[i].push($('<div data-value="12" class="periodpicker_12 periodpicker_item">12</div>'));
					that.indexes[i].push(12);
					for (j = 1; j <= 11; j += that.options.steps[i]) {
						that.items[i].push($('<div data-value="' + j + '" class="periodpicker_' + j + ' periodpicker_item">' + (j < 10 ? '0' : '') + j + '</div>'));
						that.indexes[i].push(j);
					}
				}
				that.boxes[i].html(that.items[i]);
			}
		}
		if (that.boxes[3] && that.boxes[3].length) {
			that.boxes[i].find('div').each(function () {
				that.items[3].push($(this));
			});
		}
	};
	$.fn.timepicker = $.fn.TimePicker = function (opt, opt1) {
		var returnValue = this;
		this.each(function () {
			var options,
				$this = $(this),
				timepicker = $this.data('timepicker');

			if (!timepicker) {
				options = $.extend(true, {}, $.fn.TimePicker.defaultOptions, opt);
				timepicker = new TimePicker(this, options, opt1);
				$this.data('timepicker', timepicker);
			} else {
				switch (opt) {
				case 'stopDrag':
					timepicker.drag = false;
					timepicker.timepicker.find('.draggable').removeClass('draggable');
					timepicker.setTime();
					break;
				case 'regenerate':
					timepicker.setTime();
					break;
				case 'destroy':
					timepicker.destroy();
					break;
				case 'save':
					$this.val(timepicker.currentime.get());
					break;
				case 'setValue':
					timepicker.currentime.set(opt1);
					timepicker.setTime();
					break;
				case 'getValue':
					returnValue = timepicker.currentime.get();
					break;
				}
			}
		});
		return returnValue;
	};
	$.fn.TimePicker.defaultOptions = {
		clickAndSelect: true,
		dragAndDrop: true,
		mouseWheel: true,
		inverseMouseWheel: false,
		listenKeyPress: true,
		saveOnChange: true,

		onChange: function (str, datetime) {
			console.log(str);
			console.log(datetime);
		},

		twelveHoursFormat: true,
		inputFormat: 'HH:mm:ss',
		defaultTime: '00:00:00',

		hours: true,
		minutes: true,
		seconds: false,
		ampm: true,
		parts: [
			[
				[0, 23]
			],
			[
				[0, 59]
			],
			[
				[0, 59]
			],
			[
				[0, 1]
			]
		],
		steps: [1, 1, 1, 1]
	};
	function TimePickerAlone(startinput, options) {
		var that = this;
		that.uniqueid = uniqueid;
		uniqueid += 1;
		that.startinput = $(startinput);
		that.picker = $('<div class="periodpicker_timepicker_dialog"></div>');
		that.startinput.TimePicker(options, that.picker);
		$(document.body).append(that.picker);
		that.startinput.on('focus.xdsoft' + that.uniqueid, function () {
			that.show();
		});
		$(window).on('mousedown.xdsoft' + that.uniqueid, function () {
			that.hide();
		});
	}
	TimePickerAlone.prototype.destroy = function () {
		this.startinput.TimePicker('destroy');
	};
	TimePickerAlone.prototype.hide = function () {
		if (this.picker.hasClass('visible')) {
			this.picker.removeClass('visible');
		}
	};
	TimePickerAlone.prototype.show = function () {
		if (!this.picker.hasClass('visible')) {
			var offset = this.startinput.offset();
			this.picker.css({
				left: offset.left,
				top: offset.top + this.startinput[0].offsetHeight
			});
			this.picker.addClass('visible');
			this.startinput.TimePicker('regenerate');
		}
	};
	$.fn.timepickeralone = $.fn.TimePickerAlone = function (opt, opt1, opt2) {
		var returnValue = this;
		this.each(function () {
			var options,
				$this = $(this),
				timepickeralone = $this.data('timepickeralone');

			if (!timepickeralone) {
				options = $.extend(true, {}, $.fn.TimePicker.defaultOptions, opt);
				timepickeralone = new TimePickerAlone(this, options);
				$this.data('timepickeralone', timepickeralone);
			} else {
				switch (opt) {
				case 'destroy':
					timepickeralone.destroy();
					break;
				default:
					return timepickeralone.startinput.TimePicker(opt, opt1, opt2);
				}
			}
		});
		return returnValue;
	};
}(jQuery, window, document));