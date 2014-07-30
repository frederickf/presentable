define('toc', ['util', 'html'], function(util, html) {

    return {
        reload: false,
        toc: null,

        init: function(options) {
            html.init(options.getAll());
            this.tocContainer = document.querySelector( options.getOption('tocContainer') );
            this.reload = options.getOption('reload');
            this.slideData = options.getOption('data').slides;

            this.create();
            this.inject();
        },

        create: function() {
            this.toc = html.createRecursive(document.createDocumentFragment(), this.slideData);
        },

        inject: function() {
            var self = this;
            this.tocContainer.addEventListener('click', function(event) {
                var href = util.findHref(this, event);
                util.goToSlide(href, self.reload);
            }, false);
            this.tocContainer.appendChild(this.toc);
        }
    };
});