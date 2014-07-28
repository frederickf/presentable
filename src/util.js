define('util', [], function() {
    return {
        querySelectorChild: function(parentElement, childSelector) {
            var tempId, child;

            if (!parentElement.id) {
                tempId = 'tempId_' + Math.floor(Math.random() * 1000 * new Date().getUTCMilliseconds());
                parentElement.id = tempId;
            }

            child = parentElement.querySelector('#' + parentElement.id + ' > ' + childSelector);

            if (tempId) {
                parentElement.removeAttribute('id');
            }

            return child;
        },

        extend: function(a, b) {
            var i;
            for (i in b) {
                if (b.hasOwnProperty(i)) {
                    a[i] = b[i];
                }
            }
        },

        /**
         * private
         *
         * Takes into account that some frameworks don't listen to window.location updates
         * requiring a forced reload to navigate to the desired slide
         *
         * @param container
         */
        findHref: function(container, event) {
            var target;

            event.stopPropagation();
            event.preventDefault();

            target = event.target;
            while (container !== target) {
                // For some reason IE10 confuses img.src with a.href
                if (target.href && target.tagName === "A") {
                    return target.href;
                }
                target = target.parentNode;
            }
        },

        /**
         * private
         *
         * @param URL
         */
        goToSlide: function(URL, reload) {
            if(!URL) {return;}
            window.location =  URL;
            // Some frameworks don't listen to changes in window.location necessitating forced reload
            if ( reload ) {
                window.location.reload();
            }
        }
    };

});