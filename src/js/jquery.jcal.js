/* jQuery.jcal - a calendar picker plugin.
 *
 * Author: Peter Chater - Artlogic Media Ltd - http://www.artlogic.net/
 * Version: 0.1.5
 *
 * See the README.md file for more information.
 *
 * https://github.com/artlogicmedia/jcal
 *
 */
"use strict";
(function($) {

    $.jcal = {

        /*
         * jCal helper functions.
         *
         * Note that months supplied to jCal functions are not zero-
         * based, e.g. January is 1 not 0.
         *
         */

        // If you need to localize jCal, these are the strings to edit or
        // replace dynamically.
        short_month_names: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
            'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        month_names: ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'],
        weekday_names: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

        get_last_day_of_month: function(year, month, return_as_date) {

            /*
             * Given a year and month (where Jan is 1), return the
             * last day of the month as an integer or, if 'return_as_date'
             * is true then as a date. For example:
             *
             *   >>> $.jcal.get_last_day_of_month(2013, 2);
             *   28
             *
             */
            var d = new Date(),
                l = new Date(),
                month_index = month - 1,
                last_day_of_month;

            d.setFullYear(year, month_index);

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
            var month_index = month - 1,
                last_month = (month == 1) ? 12 : month - 1,
                last_year = (month == 1) ? year - 1 : year,
                last_day_of_last_month = this.get_last_day_of_month(last_year, last_month),
                last_day_of_month = this.get_last_day_of_month(year, month),
                next_month = (month == 12) ? 1 : month + 1,
                next_year = (month == 12) ? year + 1 : year,

                f = new Date(),

                first_day_of_week,
                first_day_of_week_index,
                days = [],
                day,
                visible,
                selected,
                day_of_next_month = 0,
                stop = false,
                weeks = [],
                last_week = false,
                n = -1, i;

            f.setFullYear(year, month_index, 1);
            first_day_of_week = f.getDay();
            first_day_of_week_index = first_day_of_week - 1;

            for (i = first_day_of_week_index - 1; i > -1; i--) {
                n += 1;
                days[i] = [last_year, last_month, last_day_of_last_month - n, 0, 0];
            }

            i = -1;

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

        render_html: function(year, month, selected_year, selected_month, selected_day) {

            /*
             * Given a year, month and optionally a selected day, get the html
             * of the jcal table.
             *
             */
            var weeks = this.cal(year, month, selected_year, selected_month, selected_day),
                html_rows = [],
                html,
                row = [],
                labels = this.weekday_names,
                header_row,
                body_rows,
                item,
                item_html,
                visible,
                selected,
                css_classes,
                css_attr,
                month_index = month - 1,
                month_label = $.jcal.month_names[month_index],
                prev_year = (month == 1) ? year - 1 : year,
                prev_month = (month == 1) ? 12 : month - 1,
                next_year = (month == 12) ? year + 1 : year,
                next_month = (month == 12) ? 1 : month + 1,
                this_year, this_month, this_day;

            for (var i=0;i<labels.length;i++) {
                row[row.length] = '<th>' + labels[i] + '</th>';
            }

            header_row = '<tr>' + row.join('') + '</tr>';

            for (var r=0;r<weeks.length;r++) {

                row = [];

                for (var c=0;c<weeks[r].length;c++) {
                    item = weeks[r][c];
                    this_year = item[0],
                    this_month = item[1],
                    this_day = item[2],
                    visible = item[3] ? '' : 'jcal-disabled',
                    selected = item[4] ? 'jcal-selected' : '';
                    css_classes = []
                    if (visible) {
                        css_classes[css_classes.length] = visible;
                    }
                    if (selected) {
                        css_classes[css_classes.length] = selected;
                    }
                    css_attr = css_classes.length ? ' class="' + css_classes.join(' ') + '"' : '';
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

        jcal: function(arg) {

            /*
             * To test in the console (assuming you have an input field
             * with class 'jcal'):
             * var self = $('input.jcal').jcal();
             *
             */
            var self = this,
                _jcal_hide = function() {
                    $('#jcal-overlay').remove();
                    self.rendered_cal.fadeOut(150, function() {
                        self.rendered_cal.hide();
                    });
                    $('body').off('keydown.jcal');
                },
                _jcal_destroy = function() {
                    if (self.rendered_cal) {
                        self.rendered_cal.removeClass('jcal-float-positioned jcal-float-centered');
                        self.rendered_cal.empty();
                    }
                    self.data('jcal-initted', false);
                    $('body').off('focus.jcal keydown.jcal');
                },
                options;

            if (typeof arg === 'string') {
                // The arg was an API command
                switch (arg) {
                    case 'hide':
                        _jcal_hide();
                        break;
                    case 'destroy':
                        _jcal_destroy();
                        break;
                    case 'reload':
                        _jcal_destroy();
                        self.jcal(self.data('jcal-original-options'));
                    default:
                        if (console && console.warn) {
                            console.warn(arg + ' is not a jCal API command');
                        }
                }
                return this;
            }

            options = $.extend({
                // default options here...
                'value_field': null,
                'render_to': '#jcal'
            }, arg || {});

            // return immediately if we have already jcal-initted this element
            if (self.data('jcal-initted')) {
                return this;
            } else {
                self.data('jcal-original-options', options);
                self.data('jcal-initted', true);
            }

            var value_field,
                formatted_value_field = self;

            if (options.value_field.indexOf('#') != -1 || options.value_field.indexOf('.') != -1) {
                value_field = $(options.value_field);
            } else {
                value_field = $('#'+options.value_field);
            }

            // set initial formatted value from value
            if (value_field.length && formatted_value_field.length) {
                var v = value_field.val();

                if (v && v.indexOf('-') > -1 && v != '0000-00-00') {
                    var segs = v.split('-'),
                        year = parseInt(segs[0], 10),
                        month = parseInt(segs[1], 10),
                        day = parseInt(segs[2], 10),
                        month_str = $.jcal.short_month_names[month - 1],
                        formatted_value;

                    if (day) {
                        formatted_value = day + ' ' + month_str + ' ' + year;
                    } else {
                        formatted_value = month_str + ' ' + year;
                    }

                    formatted_value_field.val(formatted_value);
                }
            }

            var get_dates_from_selection = function(selected_date) {
                var d = new Date(),
                    segs,
                    year,
                    month,
                    day,
                    selected_day,
                    df = selected_date.split(' ')[0];

                if (df && df.length && df != '0000-00-00') {
                    // We're expecting a date string in the format '0000-00-00'
                    segs = df.split('-');
                    year = parseInt(segs[0], 10);
                    // Convert to JavaScript's native zero-based index
                    month = parseInt(segs[1], 10) - 1;
                    day = selected_day = parseInt(segs[2], 10);
                    d.setFullYear(year, month, day);
                }

                return [d.getFullYear(), d.getMonth() + 1, selected_day];
            };

            self.rendered_cal = $(options.render_to).addClass(options.position == 'positioned' ? 'jcal-float-positioned' : 'jcal-float-centered')
                                    .hide();

            if (!self.rendered_cal.length) {
                if (console && console.error) {
                    console.error('jCal could not find the element for ' + options.render_to);
                }
                return self;
            }

            var current_date = null,
                set_value = function(year, month, day) {
                    var year_str = year.toString(),
                        month_str = (month < 10) ? '0' + month.toString() : month.toString(),
                        day_str = (day < 10) ? '0' + day.toString() : day.toString(),
                        numeric_date, formatted_date;
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
                },

                render_cal = function(year, month, selected_day) {

                    var cal_visible = self.rendered_cal.is(':visible');

                    $('body')
                        // Clean up possible duplicate events
                        .off('keydown.jcal')
                        .on('keydown.jcal', function(e) {
                            // In theory, intercept this on the body, so before it
                            // gets to jQuery UI's version of this event listener on
                            // the document (so we don't close the window behind)
                            if (options.close_on_esc && e.keyCode == 27) {
                                e.stopPropagation();
                                _jcal_hide();
                            }
                        });

                    self.rendered_cal
                        .html($.jcal.render_html(year, month, self.jcal_selected_year,
                                self.jcal_selected_month, self.jcal_selected_day));

                    if (!cal_visible) {
                        self.rendered_cal.css('visibility', 'hidden').show();
                    }

                    self.rendered_cal.width(self.rendered_cal.width())
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
                            var body = $('body');
                            self.rendered_cal.detach();
                            body.append('<div id="jcal-overlay"></div>');
                            body.append(self.rendered_cal);
                            $('#jcal-overlay'+(options.render_to ? ', '+options.render_to : ''))
                                .unbind('click')
                                .on('click', function(e) {
                                    if (e.target !== this) {
                                        return;
                                    }
                                    e.stopPropagation();
                                    _jcal_hide(self.rendered_cal);
                                });
                        }
                        self.rendered_cal
                            .hide()
                            .css('visibility', 'visible')
                            .fadeIn(400);
                    }

                    $('.jcal-tbl td', self.rendered_cal).click(function(e) {
                        var btn_obj = $(e.target),
                            date_str = btn_obj.data('date'),
                            segs = date_str.split('-'),
                            year = segs[0],
                            month = parseInt(segs[1], 10),
                            day = parseInt(segs[2], 10);
                        set_value(year, month, day);
                        _jcal_hide();
                    });

                    $('.jcal-btn-goto', self.rendered_cal).click(function(e) {
                        var btn_obj = $(e.target),
                            action = btn_obj.data('goto'),
                            year, month, day;
                        switch(action) {
                            case 'empty-field':
                                value_field.val('');
                                formatted_value_field.val('');
                                _jcal_hide();
                                break;
                            case  'this-month':
                                year = current_date[0];
                                month = current_date[1];
                                day = 0;
                                set_value(year, month, day);
                                _jcal_hide();
                                break;
                            case 'today':
                                var d = new Date();
                                year = d.getFullYear().toString();
                                // Convert from zero-indexed format
                                month = d.getMonth() + 1;
                                day = d.getDate();
                                set_value(year, month, day);
                                _jcal_hide();
                                break;
                            default:
                                // go to next, previous month...
                                // The action should be in the form '2013-12'...
                                var segs = action.split('-');
                                year = parseInt(segs[0], 10);
                                month = parseInt(segs[1], 10);
                                current_date = [year, month, selected_day];
                                render_cal(year, month, selected_day);
                        }
                    });

                }

            self.jcal_selected_year = null;
            self.jcal_selected_month = null;
            self.jcal_selected_day = null;

            var load_cal = function() {
                current_date = get_dates_from_selection(value_field.val());
                self.jcal_selected_year = current_date[0];
                self.jcal_selected_month = current_date[1];
                self.jcal_selected_day = current_date[2];
                render_cal(current_date[0], current_date[1], current_date[2]);
            }

            this.on('focus click', function(e) {
                //e.stopPropagation();
                load_cal();
            });

            // When focus goes from the jCal input to another element, hide the
            // calendar.
            $('body').on('focus.jcal', ':input', function(e) {
                if (e.target != self[0]) {
                    _jcal_hide();
                }
            });

            return this;

        }

    });

})(jQuery);