# INTIX® jquery-cron
_Fresh, brand new jQuery cron plugin, developed by INTIX®_


Limited Quartz Scheduler support.
**TODO:** years, L & W

## Usage
```javascript
jQuery("selector").cron()
```
or
```javascript
jQuery("selector").cron({
  // options
})
```


## Options
##### allowAny
> _Default: true_.

> Allows the "_any_" value, represented by a question mark "?" in cron expressions.

##### bindTo
> _Default: undefined_.

> Bind the instance of the cron plugin to a jQuery element. Changes on the cron instance affect the control's value and vice versa.

##### className.control
> _Default: 'jq-cron'_.

> The classname to be used on the created control and some of its sub-elements. Changing this option will break the currently defined rules in the stylesheet.

##### className.error
> _Default: 'Error'_.

> The classname to be used on the bound control in case of an error. (see bindTo)

##### listSize
> _Default: 5_.

> The number of items to be displayed on the value selection lists.

##### startOfWeek
> _Default: 0_.

> Can either be _0_ or _1_. When _0_, the week starts on Sunday, when _1_ on the other hand, the week starts on Monday.

##### useSeconds
> _Default: true_.

> Display (and use) the _seconds field_ in a cron expression. This will be the first field of the cron expression.

##### useNames
> _Default: true_.

> Use names instead of numbers in the generated cron expressions. This has nothing to do with the parsing of an expression, because during parsing, both numbers and names will be parsed correctly.

