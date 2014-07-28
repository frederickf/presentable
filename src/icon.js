define('icon', ['util'], function(util) {

    return {

        init: function(options) {
            var iconContainer = document.querySelector( options.getOption('iconContainer') );
            if (iconContainer) {
                iconContainer.addEventListener('click', function(event) {
                    var href = util.findHref(this, event);
                    util.goToSlide(href, options.getOption('reload'));
                }, false);
            }
        }
    };
});