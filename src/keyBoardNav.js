define('keyBoardNav', ['util'], function(util) {

    return {
        tocSlideHref:'',
        keyCode: '',
        reload: false,

        init: function(options) {
            if (options.getOption('keyCode') !== false) {
                var tocSlideData = this.tocSlideDataRecursive(options.getOption('data').slides);
                this.tocSlideHref = options.getOption('urlHash') + tocSlideData.index;
                this.keyCode = options.getOption('keyCode');
                this.reload = options.getOption('reload');
                this.enableKeyboardNavigation();
            }
        },

        /**
         * private
         *
         * @param tocArray
         * @returns {*}
         */
        tocSlideDataRecursive: function(tocArray) {
            for (var i = 0; i < tocArray.length; i++) {

                if (tocArray[i].toc) {
                    return tocArray[i];
                }

                if (tocArray[i].nested) {
                    return this.tocSlideDataRecursive(tocArray[i].nested);
                }
            }
            throw {message: 'Table of Contents container not found in presentation.'};
        },
        /**
         * private
         *
         * @param tocSlideData
         */
        enableKeyboardNavigation: function() {
            var self = this;
            window.document.body.addEventListener('keyup', function(event) {
                var keyPressed;
                if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" ||
                    event.altKey || event.ctrlKey || event.metaKey) {
                    return;
                }

                event.preventDefault();

                keyPressed = event.keyCode || event.which;
                if ( keyPressed === self.keyCode ) {
                    util.goToSlide( self.tocSlideHref, self.reload );
                }
            }, false);
        }
    };
});