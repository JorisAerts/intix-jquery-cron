jQuery(function() {
    jQuery("body > div").each(function(index, element) {
        var
				$el = jQuery(this),
        $input = $el.find("input"),
				$container = $el.find("div.container"),
				$code = $el.find("code"),
				defaults = {
            bindTo : $input
        },
				options = jQuery.extend(defaults, jQuery.parseJSON($code.text()));
        $container.cron(options);
    });
});
