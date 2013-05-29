/* jQuery.jcal - a calendar picker plugin.
 *
 * Author: Peter Chater - Artlogic Media Ltd - http://www.artlogic.net/
 * Version: 0.1.1 (May 25, 2013)
 *
 * See the README.md file for more information.
 *
 */

(function($) {

    $.jcal = {
        /* jCal helper functions.
         * Note that months supplied to jCal functions are not zero-
         * based, e.g. January is 1 not 0.
         */
        get_last_day_of_month: function(year, month, return_as_date) {
            /* Given a year and month (where Jan is 1), return the
             * last day of the month as an integer or, if 'return_as_date'
             * is true then as a date.
             *
             * Example:
             *
             * >>> $.jcal.get_last_day_of_month(2013, 2);
             * 28
             */
            var d, l, month_index, last_day_of_month;
            month_index = month - 1;
            d = new Date();
            d.setFullYear(year, month_index);
            l = new Date();
            for (var i = 0; i < 31; i ++) {
                l.setFullYear(year, month_index, i + 1);
                if (l.getMonth() == month_index) {
                    last_day_of_month = l.getDate();
                } else {
                    continue;
                }
            }
            if (return_as_date) {
                l.setFullYear(year, month_index, last_day_of_month);
                return l;
            } else {
                return last_day_of_month;
            }
        },

        cal: function(year, month, selected_year, selected_month, selected_day) {
            /*
             * Given a year, month and optionally the currently selected
             * day, returns an array of arrays, where each row itself
             * contains exactly seven items representing the days of the
             * week, starting at Monday. Each day is represented as an
             * array comprising [year, month, day, visible, selected].
             * For example, for the selected date 3rd May 2013, our
             * array would look like this:
             * [
             *     [                        // first row of results
             *         [2013, 4, 29, 0, 0], // 29th Apr, not visible, not selected
             *         [2013, 4, 30, 0, 0],
             *         [2013, 5, 1, 1, 0],  // 1st May, visible, not selected
             *         [2013, 5, 2, 1, 0],
             *         [2013, 5, 3, 1, 1],  // 3rd May, visible, selected
             *         [2013, 5, 4, 1, 0],
             *         [2013, 5, 5, 1, 0]
             *     ],
             *     [                        // second row of results
             *         [2013, 5, 6, 1, 0],
             *         [2013, 5, 7, 1, 0],
             *         [2013, 5, 8, 1, 0],
             *         etc...
             *     ],
             *     down to...
             *     [                        // last (5th) row of results
             *         [2013, 5, 27, 1, 0],
             *         [2013, 5, 28, 1, 0],
             *         [2013, 5, 29, 1, 0],
             *         [2013, 5, 30, 1, 0],
             *         [2013, 5, 31, 1, 0],
             *         [2013, 5, 1, 0, 0],   // 1st June, not visible, not selected
             *         [2013, 5, 2, 0, 0]
             *     ]
             * ]
             *
             * Based on the start day of week and end day of week, we may
             * need to add empty elements to our array.
             *
             * Each day is composed of [date, active, selected] where
             * active is a date that is displayed (e.g. it forms part of
             * the current month) and selected is the date that is currently
             * selected in the date field.
             */
            var month_index, last_month, last_year, last_day_of_last_month,
                last_day_of_month, next_month, next_year, first_day_of_week,
                first_day_of_week_index, days, day, visible,
                selected, n, curr_day, day_of_next_month, day_of_week_index,
                stop, weeks, i, last_week;
            month_index = month - 1;
            last_month = (month == 1) ? 12 : month - 1;
            last_year = (month == 1) ? year - 1 : year;
            last_day_of_last_month = this.get_last_day_of_month(last_year, last_month);
            last_day_of_month = this.get_last_day_of_month(year, month);
            next_month = (month == 12) ? 1 : month + 1;
            next_year = (month == 12) ? year + 1 : year;
            var f = new Date();
            f.setFullYear(year, month_index, 1);
            first_day_of_week = f.getDay();
            first_day_of_week_index = first_day_of_week - 1;
            days = [];
            n = -1;
            for (i = first_day_of_week_index - 1; i > -1; i--) {
                n += 1;
                days[i] = [last_year, last_month, last_day_of_last_month - n, 0, 0];
            }
            day_of_next_month = 0;
            stop = false;
            weeks = [];
            i = -1;
            last_week = false;
            while (!stop) {
                i += 1;
                day = i + 1;
                visible = (day <= last_day_of_month) ? 1 : 0;
                selected = (year == selected_year && month == selected_month
                    && day == selected_day) ? 1 : 0;
                if (day > last_day_of_month) {
                    if (days.length == 0) {
                        stop = true;
                    }
                    last_week = true;
                    visible = 0;
                    selected = 0;
                    year = next_year;
                    month = next_month;
                    day_of_next_month += 1;
                    day = day_of_next_month;
                }
                if (!stop) {
                    days[days.length] = [year, month, day, visible, selected];
                }
                if (days.length == 7) {
                    weeks[weeks.length] = days;
                    days = [];
                    if (last_week) {
                        stop = true;
                    }
                }
            }
            return weeks;
        },

        short_month_names: ['Jan', 'Feb', 'Mar', 'Apr', 'May',
                'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov',
                'Dec'],

        month_names: ['January', 'February', 'March', 'April', 'May',
                'June', 'July', 'August', 'September', 'October', 'November',
                'December'],

        render_html: function(year, month, selected_year, selected_month, selected_day) {
            /* Given a year, month and optionally a selected day, get the html
             * of the jcal table.
             */
            // to test in console (requires an element with id 'jcal':
            // $('#jcal').html($.jcal.render_cal(2013, 2, 3));
            var weeks = this.cal(year, month, selected_year, selected_month, selected_day);
            var html_rows, html, row, labels, header_row, body_rows, item,
                item_html, visible, selected, css_classes,
                css_attr, month_label, month_index, prev_year,
                prev_month, next_year, next_month;
                month_index = month - 1;
            prev_year = (month == 1) ? year - 1 : year;
            prev_month = (month == 1) ? 12 : month - 1;
            next_year = (month == 12) ? year + 1 : year;
            next_month = (month == 12) ? 1 : month + 1;
            html_rows = [];
            // header row
            row = [];
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            month_label = $.jcal.month_names[month_index];
            for (var i = 0; i < labels.length; i ++) {
                row[row.length] = '<th>' + labels[i] + '</th>';
            }
            header_row = '<tr>' + row.join('') + '</tr>';
            html_rows = [];
            var this_year, this_month, this_day;
            for (var r = 0; r < weeks.length; r ++) {
                row = [];
                for (var c = 0; c < weeks[r].length; c ++) {
                    item = weeks[r][c];
                    this_year = item[0], this_month = item[1], this_day = item[2],
                    visible = (item[3]) ? '' : 'jcal-disabled',
                    selected = (item[4]) ? 'jcal-selected' : '';
                    css_classes = []
                    if (visible) {
                        css_classes[css_classes.length] = visible;
                    }
                    if (selected) {
                        css_classes[css_classes.length] = selected;
                    }
                    css_attr = (css_classes.length) ? ' class="' + css_classes.join(' ') + '"' : '';
                    item_html = '<td data-date="' + this_year + '-' + this_month + '-' + this_day + '"' + css_attr + '>' + this_day + '</td>';
                    row[row.length] = item_html;
                }
                html_rows[html_rows.length] = '<tr>' + row.join('') + '</tr>';
            }
            body_rows = html_rows.join('\n');
            html = '<div class="jcal-obj">' +
                '<table class="jcal-title-tbl"><tbody>' +
                    '<td class="jcal-title-left"><a href="#" class="btn btn-small jcal-btn jcal-btn-goto" data-goto="' + prev_year + '-' + prev_month + '">&lt;</a></td>' +
                    '<td class="jcal-title">' + month_label + ' ' + year + '</td>' +
                    '<td class="jcal-title-right"><a href="#" class="btn btn-small jcal-btn jcal-btn-goto" data-goto="' + next_year + '-' + next_month + '">&gt;</a></td>' +
                '</tbody></table>' +
                '<table class="jcal-tbl">' +
                '<thead>' + header_row + '</thead>' +
                '<tbody>' + body_rows + '</tbody>' +
                '</table>' +
                '<table class="jcal-footer-tbl"><tbody>' +
                    '<td class="jcal-footer-left"><a href="#" class="btn btn-small jcal-btn jcal-btn-goto" data-goto="today">Today</a></td>' +
                    '<td class="jcal-footer-center"><a href="#" class="btn btn-small jcal-btn jcal-btn-goto" data-goto="empty-field">Empty field</a></td>' +
                    '<td class="jcal-footer-right"><a href="#" class="btn btn-small jcal-btn jcal-btn-goto" data-goto="this-month">Month</a></td>' +
                '</tbody></table>' +
                '</div>';
            return html;
        }
    };

    $.fn.extend({
        _jcal_hide: function() {
            $('#jcal-overlay').remove();
            this.fadeOut(150, function() {
                $(this).hide();
            });
        },
        jcal: function(options) {
            /* To test in the console (assuming you have an input field
             * with class 'jcal'):
             * var obj = $('input.jcal').jcal();
             */
            options = $.extend({
                // default options here...
                'value_field': null,
                'render_to': '#jcal'
            }, options || {});
            // return immediately if we have already initted this element
            if (this.attr('data-initted')) {
                return this;
            }
            this.attr('data-initted', '1');
            var obj = this;
            var value_field = (options.value_field) ? $('#' + options.value_field) : obj;
            var formatted_value_field = obj;
            // set initial formatted value from value
            if (value_field && formatted_value_field) {
                var v = value_field.val();
                if (v && v.indexOf('-') > -1) {
                    var segs = v.split('-');
                    var year = parseInt(segs[0], 10);
                    var month = parseInt(segs[1], 10);
                    var day = parseInt(segs[2], 10);
                    var month_str = $.jcal.short_month_names[month - 1];

                    var formatted_value;
                    if (day) {
                        formatted_value = day + ' ' + month_str + ' ' + year;
                    } else {
                        formatted_value = month_str + ' ' + year;
                    }
                    formatted_value_field.val(formatted_value);
                }
            }
            if (obj.attr('data-jcal-render-to')) {
                options.render_to = obj.attr('data-jcal-render-to');
            }
            var get_dates_from_selection = function(selected_date) {
                var d, segs, year, month, day, selected_day;
                if (selected_date) {
                    // we're expecting a date string in the format '0000-00-00'
                    segs = selected_date.split(' ')[0].split('-');
                    year = parseInt(segs[0], 10);
                    month = parseInt(segs[1], 10) - 1; // zero-based index
                    day = selected_day = parseInt(segs[2], 10);
                    d = new Date();
                    d.setFullYear(year, month, day);
                } else {
                    d = new Date(); // today
                }
                return [d.getFullYear(), d.getMonth() + 1, selected_day];
            };
            var rendered_cal = $(options.render_to)
                                    .addClass(options.position == 'positioned' ? 'jcal-float-positioned' : 'jcal-float-centered')
                                    .hide();
            var current_date = null;
            var set_value = function(year, month, day) {
                var year_str = year.toString();
                var month_str = (month < 10) ? '0' + month.toString() : month.toString();
                var day_str = (day < 10) ? '0' + day.toString() : day.toString();
                var numeric_date, formatted_date;
                if (day) {
                    numeric_date = year_str + '-' + month_str + '-' + day_str;
                    formatted_date = day.toString() + ' ' + $.jcal.short_month_names[month - 1] + ' ' + year.toString();
                } else {
                    numeric_date = year_str + '-' + month_str + '-00';
                    formatted_date = $.jcal.short_month_names[month - 1] + ' ' + year.toString();
                }
                if (formatted_value_field) {
                    formatted_value_field.val(formatted_date);
                    value_field.val(numeric_date);
                } else {
                    value_field.val(numeric_date);
                }
            }
            var render_cal = function(year, month, selected_day) {
                var cal_visible = rendered_cal.is(':visible');
                rendered_cal
                    .html($.jcal.render_html(year, month, $.jcal.selected_year,
                            $.jcal.selected_month, $.jcal.selected_day));
                if (!cal_visible) {
                    rendered_cal.css('visibility', 'hidden').show();
                }
                rendered_cal.width(rendered_cal.width())
                    .find('.jcal-obj')
                        // Setting height and width attributes allows us to
                        // center everything properly.
                        .height(function() {
                            var h = 0, $this = $(this);
                            $(this).children().each(function() {
                                h += $(this).outerHeight(true)>>>0;
                            });
                            h += $this.css('padding-top')>>>0 + $this.css('padding-bottom')>>>0;
                            return h;
                        });
                if (!cal_visible) {
                    if (options.position != 'positioned') {
                        rendered_cal.detach();
                        $('body').append('<div id="jcal-overlay"></div>');
                        $('body').append(rendered_cal);
                        $('#jcal-overlay'+(options.render_to ? ', '+options.render_to : ''))
                            .unbind('click')
                            .on('click', '.jcal-obj, .jcal-obj *', function(e) {
                                e.stopPropagation();
                            }).one('click', function(e) {
                                e.stopPropagation();
                                rendered_cal._jcal_hide();
                            });
                    }
                    rendered_cal
                        .hide()
                        .css('visibility', 'visible')
                        .fadeIn(400);
                }

                $('.jcal-tbl td', rendered_cal).click(function(e) {
                    var btn_obj = $(e.target);
                    var date_str = btn_obj.attr('data-date');
                    var segs = date_str.split('-');
                    var year = segs[0];
                    var month = parseInt(segs[1]);
                    var day = parseInt(segs[2]);
                    set_value(year, month, day);
                    rendered_cal._jcal_hide();
                });
                $('.jcal-btn-goto', rendered_cal).click(function(e) {
                    var btn_obj = $(e.target);
                    var action = btn_obj.attr('data-goto');
                    var year, month, day;
                    if (action == 'empty-field') {
                        value_field.val('');
                        formatted_value_field.val('');
                        rendered_cal._jcal_hide();
                    } else if (action == 'this-month') {
                        year = current_date[0];
                        month = current_date[1];
                        day = 0;
                        set_value(year, month, day);
                        rendered_cal._jcal_hide();
                    } else if (action == 'today') {
                        var d = new Date();
                        year = d.getFullYear().toString();
                        month = d.getMonth() + 1; // zero-based
                        day = d.getDate();
                        set_value(year, month, day);
                        rendered_cal._jcal_hide();
                    } else {
                        /* go to next, previous month...
                         * The action should be in the form '2013-12'...
                         */
                        var segs = action.split('-');
                        year = parseInt(segs[0]);
                        month = parseInt(segs[1]);
                        current_date = [year, month, selected_day];
                        render_cal(year, month, selected_day);
                    }
                });
            }
            $.jcal.selected_year = null;
            $.jcal.selected_month = null;
            $.jcal.selected_day = null;
            var load_cal = function(e) {
                current_date = get_dates_from_selection(value_field.val());
                $.jcal.selected_year = current_date[0];
                $.jcal.selected_month = current_date[1];
                $.jcal.selected_day = current_date[2];
                render_cal(current_date[0], current_date[1], current_date[2]);
            }
            this.click(function(e) {
                e.stopPropagation();
                load_cal(e);
            });
            this.focus(function(e) {
                e.stopPropagation();
                load_cal(e);
            });

            return this;
        }
    });

})(jQuery);