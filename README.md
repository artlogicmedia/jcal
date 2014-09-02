
# jCal

jCal is a simple jQuery plugin for date selection. It doesn't rely on any other
plugins (like the jQuery UI) so it is relatively lightweight compared to other
alternatives.

The interface provides buttons for selecting the current day, the month (without
specifying a day), or clearing the input field altogether.

Although it does not require [Twitter Bootstrap][1], jCal works nicely with
it, and uses the Bootstrap button classes on the UI controls.

## Using jCal

### Markup and JavaScript

jCal assumes that there are two input field on the page - one which shows a
formatted date (e.g. '1 Jan 2013') and another hidden field which contains the
actual value that will be sent to the database, in mysql format, e.g.
'2013-01-01'.

The 'value field' is the one with a 'name' attribute - the formatted field does
not need one. The formatted (visible) field is the one on which we attach the
plugin. The html markup should look something like this:
```
<label for="f_mydate">
    Pick a date
</label>
<input type="hidden" id="f_mydate" name="mydate" value="2013-01-01" />
<input type="text" class="jcal" />
<div id="jcal"></div>
```

We can then call the plugin (in this example on any element with a class
'jcal'):
```
$('input.jcal').each(function() {
    obj.jcal({
        value_field: '#value_field', // Optionally, here you could just use
                                     // the value 'value_field'.
        render_to: '#jcal'
    });
});
```

### Options

- *value_field* - Either the ID of the field in which the hidden value will be 
  stored, or a jQuery selector string targeting that field. This is intended to
  be the value that will be posted back to the server.
- *render_to* - The jQuery selector used to specify the `div` element into which
  the calendar interface will be rendered. Alternatively, this option can be
  specified using a data attribute, as in the example above.
- *position* - Where to position the calendar when it appears. The options are:
    * *centered* - The calendar will be centered in the middle of the browser
      window. This is the default behaviour.
    * *positioned* - The calendar will be positioned below the input field. This
      behaves more like the [jQuery UI Datepicker][2] plugin.
- *close_on_esc* - Binds a keydown event handler to the body to listen for an 
  "ESC" keypress. When triggered, the calendar will be hidden (and the listener
  unbound).

### Events

When updating the values of the form elements that jCal uses, it makes use of
jQuery's `.val()` method, which does not trigger a `change` event on the updated
elements.

If you need to detect when jCal updates either the display value or the hidden
input value, you can watch either element for an `updated.jcal` event, like so:
```
$('input.jcal').on('updated.jcal', function() {
    // do stuff
});
```

### API

There are a few API commands you can use to control the calendar in a limited
fashion. They are as follows:

* `el.jcal('hide')` - Hides the calendar popup, if it is visible.
* `el.jcal('destroy')` - Removes the calendar HTML from the page and
  de-intializes the calendar.
* `el.jcal('reload')` - Calls the 'destroy' command and then re-initializes the 
  calendar with the original options. This is useful if you have changed any of
  the inherent jCal properties, like month or weekday names.

These should be called on the original jQuery object, like so:
```
var obj = $('input#jcal-input');

obj.jcal({
    'value_field': '#value_field',
    'render_to': '#jcal'
});

obj.jcal('destroy');
```

### $.jcal.cal()

The `$.jcal` object provides a function for generating calendars and blocks of
dates, `$.jcal.cal()`. Given a year, month and optionally the currently selected
day, this function returns a multidimensional array, where each row itself
contains exactly seven items representing the days of the week, starting at
Monday. Each day is represented as an array comprising `[year, month, day,
visible, selected]`.

For example, for the selected date 3rd May 2013, our array would look like this:
```
[
    [                        // first row of results
        [2013, 4, 29, 0, 0], // 29th Apr, not visible, not selected
        [2013, 4, 30, 0, 0],
        [2013, 5, 1, 1, 0],  // 1st May, visible, not selected
        [2013, 5, 2, 1, 0],
        [2013, 5, 3, 1, 1],  // 3rd May, visible, selected
        [2013, 5, 4, 1, 0],
        [2013, 5, 5, 1, 0]
    ],
    [                        // second row of results
        [2013, 5, 6, 1, 0],
        [2013, 5, 7, 1, 0],
        [2013, 5, 8, 1, 0],
        // etc...
    ],
    // down to...
    [                        // last (5th) row of results
        [2013, 5, 27, 1, 0],
        [2013, 5, 28, 1, 0],
        [2013, 5, 29, 1, 0],
        [2013, 5, 30, 1, 0],
        [2013, 5, 31, 1, 0],
        [2013, 5, 1, 0, 0],  // 1st June, not visible, not selected
        [2013, 5, 2, 0, 0]
    ]
 ]
```

### Minified version

If you have `make` and [UglifyJS][6] installed, you can make a minified version
of jCal with just
```
$ make
```

### A note about formatting

This plugin was written for Artlogic Media Ltd and handles date fields in our
house style (both in terms of the hidden value and the display value). It may
not be your house style. If you would like to use this plugin, help yourself and
adapt it as you want.

That said, the hidden value matches the standard MySQL format, so it should be
useful generally. Providing multi-language support is a simple matter of
modifying the $.jcal.weekday_names`, `$.jcal.short_month_names`, and
`$.jcal.long_month_names` properties.

## License

jCal is dual-licensed under the
[MIT license][3] and the [GNU Public License version 2][4].

## Authorship information

jCal is written and maintained by [Artlogic Media][5].



[1]: http://twitter.github.io/bootstrap/
[2]: http://jqueryui.com/datepicker/
[3]: https://github.com/artlogicmedia/jcal/blob/master/MIT-LICENSE.md
[4]: https://github.com/artlogicmedia/jcal/blob/master/GPLv2-LICENSE.md
[5]: http://artlogic.net/
[6]: https://github.com/mishoo/UglifyJS