;
/**
* author: snakedunjie
* created: 2020-05-28
*/
(function($, window, document, undefined) {
	var DayCalendar = function(option) {
		var currentMoment = moment();
		var currentYear = parseInt(currentMoment.format('YYYY'));
		var currentMonth = parseInt(currentMoment.format('MM'));
		var currentDay = parseInt(currentMoment.format('DD'));
		var currentDate = currentMoment.format('YYYY-MM-DD');
		
		this.defaults = {
			element : null, // 元素
			selectDate : currentDate, // 选中日期
			dayClickCallback : null, // 日期点击回调事件
			
			currentMoment : currentMoment, //当前日期
			currentYear : currentYear, //当前年份（数字类型）
			currentMonth : currentMonth, //当前月份（数字类型）
			currentDay : currentDay //当前第几天（数字类型）
		};
		this.options = $.extend({}, this.defaults, option);
	};

	DayCalendar.prototype = {
		initDayCalendar : function() {
			this.createHeadNode(this.options.selectDate);
			this.createDayNode(this.options.selectDate);
			this.scrollMonth(this.options.selectDate);
			this.selectDay(this.options.selectDate);
		},
		/**
		 * 创建头部节点
		 */
		createHeadNode : function(date) {
			var _this = this;

			// 选中月份
			var selectMonth = moment(date).format("YYYY-MM");
			var selectMonth2 = moment(date).format("YYYY年MM月");

			var head = '';
			head += '<div class="dayCalendar-head">';
			head += '<div class="dayCalendar-head-left"><img src="images/left.png" /></div>';
			head += '<div class="dayCalendar-head-center" data-date="'+selectMonth+'">' + selectMonth2 + '</div>';
			head += '<div class="dayCalendar-head-right"><img src="images/right.png" /></div>';
			head += '</div>';
			$('.dayCalendar-head').remove();
			$(_this.options.element).append(head);

			/**
			 * 选择上一月
			 */
			$('.dayCalendar-head-left img').click(function() {
				var yearMonth = $('.dayCalendar-head-center').attr('data-date');
				var lastMonth = moment(yearMonth).subtract(1, 'months').format('YYYY-MM');
				
				// 设置年月
				$('.dayCalendar-head-center').attr('data-date', lastMonth);
				$('.dayCalendar-head-center').html(moment(lastMonth).format("YYYY年MM月"));
				
				var year = moment(yearMonth).format('YYYY');
				var year2 = moment(lastMonth).format('YYYY');
				/**
				 * 1、同一年内切换月份，滚动到指定月份
				 * 2、跨年，重新生成日期节点
				 */
				if(year == year2){
					 _this.scrollMonth(lastMonth);
				} else {
					_this.createDayNode(lastMonth);
					_this.scrollMonth(lastMonth);
				}
			});

			/**
			 * 选择下一月
			 */
			$('.dayCalendar-head-right img').click(function() {
				var yearMonth = $('.dayCalendar-head-center').attr('data-date');
				var nextMonth = moment(yearMonth).add(1, 'months').format('YYYY-MM');
				
				// 设置年月
				$('.dayCalendar-head-center').attr('data-date', nextMonth);
				$('.dayCalendar-head-center').html(moment(nextMonth).format("YYYY年MM月"));
				
				var year = moment(yearMonth).format('YYYY');
				var year2 = moment(nextMonth).format('YYYY');
				/**
				 * 1、同一年内切换月份，滚动到指定月份
				 * 2、跨年，重新生成日期节点
				 */
				if(year == year2){
					 _this.scrollMonth(nextMonth);
				} else {
					_this.createDayNode(nextMonth);
					_this.scrollMonth(nextMonth);
				}
			});
		},
		/**
		 * 创建日期节点
		 * @param date
		 */
		createDayNode : function(date) {
			var _this = this;
			
			// 创建该年份的所有日期节点
			var year = moment(date).format("YYYY");
			var content = '';
			content += '<div class="dayCalendar-content" title="单击按住可拖动日历，双击可选中日期">';
			content += '<div class="dayCalendar-content-days">';
			
			for (var i = 1; i <= 12; i++) {
				var days = moment(year + '-' + (i < 10 ? '0' + i : '' + i)).daysInMonth();
				for (var j = 1; j <= days; j++) {
					var dataDate = moment(year + '-' + (i < 10 ? '0' + i : '' + i) + '-' + (j < 10 ? '0' + j : '' + j)).format('YYYY-MM-DD');
					
					if(_this.options.currentYear == year && _this.options.currentMonth == i && _this.options.currentDay == j){
						content += '<div class="day" data-date="' +  dataDate + '" style="background:url(images/today.png) no-repeat;">&nbsp;</div>';
					} else {
						content += '<div class="day" data-date="' + dataDate + '">' + j + '</div>';
					}
				}
			}
			content += '</div>';
			content += '</div>';
			$('.dayCalendar-content').remove();
			$(_this.options.element).append(content);
			
			// 年最后一天，增加右边距
			$('.dayCalendar-content-days .day:last').css('border-right', '1px solid #cccccc');

			// 日期可横向拖动
			var draggable = $('.dayCalendar-content-days').draggabilly({
				axis : 'x'
			});
			// 拖动中
			draggable.on('dragMove', function(event, pointer, moveVector) {
				// 鼠标手型设置为move
				$('.dayCalendar-content').css("cursor","move");
			});
			// 结束拖动
			draggable.on('dragEnd', function(event, pointer, moveVector) {
				// 鼠标手型设置为默认
				$('.dayCalendar-content').css("cursor","default");
				
				// 居中的日期的左边距
				var left = parseInt($('.dayCalendar-content-days').css('left'));
				
				// 头部长度
				var headWidth =  $('.dayCalendar-head').width();
				
				// 拖动为1月后的日期
				if (left < 0) {
					left = Math.abs(left) + headWidth / 2;
					
					// 居中的日期的下标
					var index = parseInt(left / 51);
					// 日期个数
					var days =  $('.dayCalendar-content-days .day').length;
					if (index < days) {
						// 居中的日期增加下划线样式
						$('.dayCalendar-content-days .day-center').removeClass('day-center');
						var centerDay =  $('.dayCalendar-content-days .day').eq(index);
						centerDay.addClass('day-center');
						
						// 更新头部的年月
						var dataDate = centerDay.attr('data-date');
						$('.dayCalendar-head-center').attr('data-date',moment(dataDate).format('YYYY-MM'));
						$('.dayCalendar-head-center').html(moment(dataDate).format("YYYY年MM月"));
					}
				}
			});
			
			// 绑定日期点击事件
			$('.dayCalendar-content-days .day').dblclick(function() {
				_this.selectDay($(this).attr('data-date'));
			});
		},
		/**
		 * 滚动到指定月份
		 * @param date
		 */
		scrollMonth : function(date) {
			this.scrollDay(moment(date).format('YYYY-MM') + '-01');
		},
		/**
		 * 滚动到指定日期
		 * @param date
		 */
		scrollDay : function(date) {
			var dataDate = moment(date).format('YYYY-MM-DD');
			var dayElement = $('.dayCalendar-content-days .day[data-date="' + dataDate + '"]');
			var index =  $(".dayCalendar-content-days .day").index(dayElement);
			
			if(index >= 0){
				// 数量*日期宽度51
				var left = index * 51;
				$('.dayCalendar-content-days').css({
					left :  (0 - left) + 'px'
				});
			}
		},
		/**
		 * 选中指定日期
		 * @param date
		 */
		selectDay : function(date) {
			var dataDate = moment(date).format('YYYY-MM-DD');
			var dayElement = $('.dayCalendar-content-days .day[data-date="' + dataDate + '"]');
			
			// 取消日期选中
			$('.dayCalendar-content-days .day-select').removeClass('day-select');
			
			// 选中当前点击日期&触发点击回调
			if(dayElement.length == 1){
				$(dayElement).addClass('day-select');
				if (this.options.dayClickCallback != null) {
					this.options.dayClickCallback(dataDate);
				}
			}
		},
		/**
		 * 获取选中日期
		 */
		getSelectDay : function(){
			var date = $('.dayCalendar-content-days .day-select').attr('data-date');
			return date;
		}
	}
	$.fn.dayCalendar = function(options) {
		var dayCalendar = new DayCalendar(options);
		dayCalendar.initDayCalendar();
		return dayCalendar;
	}
})(jQuery, window, document);