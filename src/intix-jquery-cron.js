(function(jQuery) {

    var

    VERSION = "0.0.1", // ...so that the version easily jumps out in the minified version

    // some constants for compression reasons...
    undefined,

    ASTERISK = "*",           // wildcard-value
    QUESTION_MARK = "?",      // start-value
    LIST_VALUE_NAME = "list", // value of the checkbox when selecting from the list of values

    VALUE = "value", // the value attribute

    JQUERY_CHANGE = "change",
    JQUERY_CHECKED = "checked",
    JQUERY_IS_CHECKED = ":" + JQUERY_CHECKED,

    CRON_FIELD_CHANGE = JQUERY_CHANGE + "_field",   // event name, fired when a cron-field changes

    extend = jQuery.extend,



    isString = function(object) {
        return "[object String]" === Object.prototype.toString.call(object);
    },

    offsetValues = [
    //  [ prefix,  min, max, [ divisions                        ], <names> ]
        ["sec",    0,   59,  [2, 3, 4, 5, 6, 10, 12, 15, 20, 30]], // seconds
        ["min",    0,   59,  [2, 3, 4, 5, 6, 10, 12, 15, 20, 30]], // minutes
        ["hour",   0,   23,  [2, 3, 4, 6, 8, 12]                ], // hour
        ["dom",    1,   31,  [2, 3, 4, 5, 6, 10, 15]            ], // day of month
        ["month",  0,   11,  [2, 3, 4, 6],                         "JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC" ], // month
        ["dow",    0,   6,   [],                                   "MON|TUE|WED|THU|FRI|SAT|SUN"                     ]  // day of week
    ],

    error = function(message) {
        throw new EvalError(message);
    },

    cronElement = function(options, html) {
        return jQuery(html).addClass(options.className.control);
    },

    // Returns array [ value, is-a-range-value ]
    // The first element is the String generated, containing the cron-value for
    // this part
    // ea. 1,2,4 or 1-3
    // The second value depict whether the value is a range or not. This is used
    // to determine
    // whether the "every"-option can be enabled
    getSelected = function(options, offsetValue, value,
                           singleValued, i, intVal, parsedValue, lastVal, rangeValue, partValue, isRange) {
        isRange = true;
        lastVal = -1;
        if (value.length === 0) {
            return [ASTERISK, true];
        } else if (singleValued = value.length === 1){
            if ( value === ASTERISK) {
                return [ASTERISK, true];
            } else if ( value === QUESTION_MARK) {
                return [QUESTION_MARK, false];
            }
        }
        for (i = 0; i < value.length; i++) {
            intVal = parseInt(value[i], 10);

            // substitute with text values
            if( options.useNames && offsetValue[4]){
                if( options.startOfWeek === 1 && offsetValue[0] === offsetValues[5][0] ){
                    // dow special case, turn 7 into 0
                    --intVal;
                }
                // substitute parsedValue with name
                parsedValue = offsetValue[4].substr(intVal * 4, 3);
            } else{
                parsedValue = intVal;
            }


            if (-1 === lastVal) {
                // first value. i can be >0 if "" was selected too
                partValue = rangeValue = parsedValue;
            } else {
                partValue += "," + parsedValue;
                isRange = isRange && intVal === lastVal + 1;
            }
            lastVal = intVal;
        }
        return [ isRange ? rangeValue + (singleValued ? "" : "-" + parsedValue) : partValue, !singleValued && isRange ];
    },

    checkRadio = function($radioButtons, value){
        $radioButtons.filter("[value='" + value + "']").prop(JQUERY_CHECKED, true)
    },

    // the biggest function... creates a form-part per cron-field
    drawPart = function(options, offset,
                        text, texts, values, onChange, getValue, tmp, mod) {
        var

        offset = offsetValues[offset],
        optionHtml = '<option/>',
        $div = cronElement(options, '<div class="' + offset[0] + ' field"/>'),
        $selectValue = cronElement(options, '<select multiple="multiple" style="width:50px"/>').attr("size", options.listSize),
        $checkEvery = cronElement(options, '<input type ="checkbox"/> Every'),
        $labelEvery = jQuery('<label>Every</label>').prepend($checkEvery),
        $selectEvery = cronElement(options, '<select style="width:50px"/>').append(jQuery(optionHtml).attr(VALUE, ASTERISK)).val(ASTERISK),

        radioTypeHtml = '<input type="radio" name="'+offset[0]+'Type"/>',
        labelHtml = '<label/>',
        $radioList = cronElement(options, radioTypeHtml).attr(VALUE, LIST_VALUE_NAME),
        $radioAny = cronElement(options, radioTypeHtml).attr(VALUE, ASTERISK).prop(JQUERY_CHECKED, true),
        $labelList = jQuery(labelHtml).text("Select").prepend($radioList),
        $labelAny = jQuery(labelHtml).text("Any").prepend($radioAny),
        $radioGroup = jQuery($radioList).add($radioAny),
        $divType = cronElement(options, '<div class="type"/>').append($labelList).append($labelAny),
        $divSelect = cronElement(options, '<div class="select"/>').append($selectValue),
        $divEvery = cronElement(options, '<div class="every"/>').append($labelEvery).append($selectEvery),

        $option, i, $radioStart, $labelStart // to be used below...
        ;

        if(options.allowQuestionMarks){
            $radioStart = cronElement(options, radioTypeHtml).attr(VALUE, QUESTION_MARK);
            $labelStart = jQuery(labelHtml).text("Start").prepend($radioStart);
            $divType.append($labelStart);
            $radioGroup = $radioGroup.add($radioStart);
        }

        for (i = offset[1]; i < offset[2] + 1; i++) {
            $option = jQuery(optionHtml);
            $selectValue.append($option);
            values ? $option.text(values[i]).attr(VALUE, i) : $option.text(i);
        }
        for (i = offset[3].length; i--;) {
            tmp = offset[3][i];
            mod = offset[2] + (1 - offset[1]);
            $selectEvery.append(jQuery(optionHtml).text(parseInt(mod / tmp, 10)).attr(VALUE, tmp));
        }

        // returns the value of this part of the form
        getValue = function(result, everyEnabled, everyValue, typeValue) {
            typeValue = ($radioGroup.filter(JQUERY_IS_CHECKED).val());
            result = getSelected(options, offset, typeValue === ASTERISK ? ASTERISK : typeValue === QUESTION_MARK ? QUESTION_MARK : $selectValue.val() || [] );
            everyEnabled = result[1];
            jQuery($checkEvery).add($selectEvery).prop('disabled', !everyEnabled);
            everyValue = $selectEvery.val();
            return result[0] + (everyEnabled && everyValue !== ASTERISK && $checkEvery.is(JQUERY_IS_CHECKED) ? "/" + everyValue : "");
        };

        // define the onChange function, and fire it once
        (onChange = function() {
            $div.trigger(CRON_FIELD_CHANGE, [ getValue() ]);
        })();

        // when the selection list changes, set radio to list
        $selectValue.bind(JQUERY_CHANGE, function() {
            checkRadio($radioGroup, LIST_VALUE_NAME);
        });

        // when the "every" value changes, enable or disable the checkbox
        $selectEvery.bind(JQUERY_CHANGE, function() {
            $checkEvery.prop(JQUERY_CHECKED, $selectEvery.val() !== ASTERISK);
        });

        // bind the onchange function to the controls
        jQuery($selectValue)
            .add($checkEvery)
            .add($selectEvery)
            .add($radioGroup)
            .bind(JQUERY_CHANGE, onChange);

        return extend([
            $div.append($divType)
                .append($divSelect)
                .append($divEvery),
            $selectValue,
            $checkEvery,
            $selectEvery,
            $radioGroup
        ], {
            val : getValue
        });

    },

    // set the values
    changePart = function(part, value) {
        if( value[0][0] === ASTERISK || value[0][0] === QUESTION_MARK ){
            part[1].val("");
            checkRadio(part[4], value[0][0]);
        } else {
            part[1].val(value[0]);
            checkRadio(part[4], LIST_VALUE_NAME);
        }
        part[1].val(value[0]);
        part[2].prop(JQUERY_CHECKED, value[1] !== undefined);
        part[3].val(value[1]);
    },

    // draw the control
    drawForm = function(options, $el, parts) {
        // clear the element first
        $el.empty();
        parts = [];
        for (var i = 0; i < options._parts.length; i++) {
            $el.append((parts[i] = drawPart(options, i))[0]);
            if (options.bindTo) {
                parts[i][0].on(CRON_FIELD_CHANGE, function() {
                    for (var result = [], i = 0; i < options._parts.length; i++) {
                        result[i] = parts[i].val();
                    }
                    options.bindTo.val(result.join(" "));
                })
            }
        }
        options.change = function(value) {
            value = getValue(value, options);
            for (var i = 0; i < parts.length; i++) {
                changePart(parts[i], value[i]);
            }
        };
        if (options.value) {
            options.change(options.value);
        }
    },

    // parse one cron field
    parseCronField = function(rxList) {
        var toNumber = function(options, index, value, result) {
            if (value.length === 3) {
                // we're dealing with a string value
                result = options._parts[index][4].indexOf(value.toUpperCase()) / 4;
                return options._parts[index][0] === offsetValues[5][0] ? result + (7 + (options.startOfWeek - 1)) - 6 : result;
            } else {
                return parseInt(value, 10);
            }
        }, parseRange = function(options, parts, index, rxCron, errorMessage, value, groups, values, from, to) {
            rxCron = options._parts[index].rx;
            value = parts[index];
            errorMessage = "Field '" + value + "' is malformed.";
            if (!rxCron.test(value)) {
                error(errorMessage);
            }
            groups = rxCron.exec(value);
            if (groups[1] === ASTERISK || groups[1] === QUESTION_MARK) {
                if (groups[2] != null) {
                    error(errorMessage);
                }
                values = [ groups[1] ];
            } else {
                values = [];
                from = toNumber(options, index, groups[1]);
                to = (groups[3] != null ? toNumber(options, index, groups[3]) : from) + 1;
                if (from >= to) {
                    error(errorMessage);
                }
                for (; from < to; from++) {
                    values.push(from);
                }
            }
            return [ values, groups[4] != null ? parseInt(groups[4].substr(1), 10) : undefined ];
        }, parseList = function(options, parts, index, values, pieces, i) {
            values = [];
            pieces = parts[index].split(',');
            for (i = 0; i < pieces.length; i++) {
                values[i] = toNumber(options, index, pieces[i]);
            }
            return [ values ];
        };
        return function(parts, index, options) {
            return (rxList.test(parts[index]) ? parseList : parseRange)(options, parts, index);
        }
    }(/^[\w,]+$/),

    // get the value of a cron expression
    getValue = function(value, options, shorthand, parts, errorMessage, i, result) {

        // error message to be thrown in case of an invalid expression
        errorMessage = "Invalid cron expression: '" + value + "'";

        // check if the shorthand needs to be returned
        if (options.shortHands.hasOwnProperty(value)) {
            shorthand = options.shortHands[value];
            if (null === shorthand) {
                // TODO: reset the form
                return value;
            }
            value = shorthand;
        }

        parts = value.split(" ");

        // if the expression if too short, then throw an Error
        if (parts.length != options._parts.length) {
            error(errorMessage);
        }
        try {
            result = [];
            for (i = 0; i < options._parts.length; i++) {
                result[i] = parseCronField(parts, i, options);
            }
            return shorthand || result;
        } catch (e) {
            error(errorMessage + (e.message ? ". " + e.message : ""));
        }
    },

    // parse the options and generate an internal options object
    parseOptions = function(rxTemplate) {
        return function(options, parts, part) {
            options = extend({}, fn.defaults, options);
            parts = options._parts = [];
            for (var i = options.useSeconds ? 0 : 1; i < offsetValues.length; i++) {
                parts.push(part = [].concat(offsetValues[i]));
                //if(part[0] === offsetValues[5][0]){
                //    part[1] += options.startOfWeek;
                //    part[2] += options.startOfWeek;
                //}
                part.rx = new RegExp(rxTemplate.replace(/~(\d)~/g, function(v, $) {
                    return ($ === "1") ? (options.allowQuestionMarks ? "\\?|" : "") : (part[4] ? "|" + part[4] : "");
                }), "i");
            }
            options._regex = "";
            return options;
        }
    }("^(\\*|~1~\\d{1,2}~2~)?(\\-?(\\d{1,2}~2~))?(\\/\\d{1,2})?$"),

    // bind an element to change and listen for the values
    bindTo = function(options, bindTo, errorClass) {
        if (!(bindTo = jQuery(options.bindTo)).length) {
            return;
        }
        bindTo.change(function(current) {
            current = jQuery(this);
            // change the value of ALL controls binded
            bindTo.not(current).val(current.val());
            errorClass = options.className.error;
            current.removeClass(errorClass);
            try {
                options.change(current.val());
            } catch (e) {
                current.addClass(errorClass);
            }
        });
    },

    // extension for the cron-function
    fn = {
        // the current version of this plugin
        VERSION : VERSION,
        // default options
        defaults : {
            // allow ? as a wildcard
            allowQuestionMarks : true,
            // class names to be added to the element
            className : {
                control : "jq-cron",
                error : "error"
            },
            // height of the lists
            listSize : 5,
            // shorthand methods
            shortHands : {
                "@reboot" : null,
                "@yearly" : "* 0 0 1 1 *",
                "@annually" : "* 0 0 1 1 *",
                "@monthly" : "* 0 0 1 * *",
                "@weekly" : "* 0 0 * * 0",
                "@daily" : "* 0 0 * * *",
                "@midnight" : "* 0 0 * * *",
                "@hourly" : "* 0 * * * *",
                "@every_minute" : "* */1 * * * *",
                "@every_second" : null
            },

            text : {
                seconds : "seconds",
                minutes : "minutes",
                hours : "hours",
                days : "seconds",
                seconds : "seconds"
            },
            // first day of the week
            startOfWeek : 1,
            // add seconds?
            useSeconds : true,
            // add years? (not supported yet)
            useYears : false,
            // use names in the generated cron expressions
            useNames : true

            // value to start with
            // value: "* * * * * *",

            // bind the cron changes to an element, will also listen for changes on
            // that element
            // bindTo: element

            // TODO: useTabs: false // draw the fields in separate tabs

        },

        // exposed parsing function
        parse : function(value, options, parsedValue, i) {
            parsedValue = getValue(value, parseOptions(options));
            if (isString(parsedValue)) {
                return parsedValue;
            } else {
                for (i = 0; i < parsedValue.length; i++) {
                    parsedValue[i] = {
                        range : parsedValue[i][0],
                        division : parsedValue[i][1]
                    };
                }
                return parsedValue;
            }
        }
    },

    // initialize the control
    init = function(options, $el) {
        drawForm(options, $el.addClass(options.className.control));
        bindTo(options);
    }

    ;

    // The jQuery cron-function
    jQuery.fn.cron = extend(function(options) {
        init(parseOptions(options), this);
    }, fn);

})(jQuery);
