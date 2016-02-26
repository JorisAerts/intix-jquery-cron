# INTIX<sup>®</sup> jquery-cron
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
<dl>

<dt><b>allowAny</b></dt>
<dd><em>Default: true.</em></dd>
<dd>Allows the "<em>any</em>" value, represented by a question mark "?" in cron expressions.<dd>

<dt><b>bindTo</b></dt>
<dd><em>Default: undefined.</em></dd>
<dd>Bind the instance of the cron plugin to a jQuery element. Changes on the cron instance affect the control's value and vice versa.<dd>

<dt><b>className.control</b></dt>
<dd><em>Default: 'jq-cron'.</em></dd>
<dd>The classname to be used on the created control and some of its sub-elements. Changing this option will break the currently defined rules in the stylesheet.<dd>

<dt><b>className.error</b></dt>
<dd><em>Default: 'Error'.</em></dd>
<dd>The classname to be used on the bound control in case of an error. (see bindTo)<dd>

<dt><b>listSize</b></dt>
<dd><em>Default: 5.</em></dd>
<dd>The number of items to be displayed on the value selection lists.<dd>

<dt><b>startOfWeek</b></dt>
<dd><em>Default: 0.</em></dd>
<dd>Can either be <em>0</em> or <em>1</em>. When <em>0</em>, the week starts on Sunday, when <em>1</em> on the other hand, the week starts on Monday.<dd>

<dt><b>useSeconds</b></dt>
<dd><em>Default: true.</em></dd>
<dd>Display (and use) the <em>seconds field</em> in a cron expression. This will be the first field of the cron expression.<dd>

<dt><b>useNames</b></dt>
<dd><em>Default: true.</em></dd>
<dd>Use names instead of numbers in the generated cron expressions. This has nothing to do with the parsing of an expression, because during parsing, both numbers and names will be parsed correctly.<dd>

</dl>
