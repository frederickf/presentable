define('controller', ['html', 'json', 'util', 'options'], function(html, json, util, options) {
    options.getOption('keyCode');
    var log = console.log || function() {},
        main = {
            /**
             * public: user
             *
             * @param userOptions
             */
            init: function(userOptions) {
                var tocSlideData, toc, tocContainer, iconContainer;

                try {
                    options.init(userOptions, json.frameworks);

                    // Use json to create slide data if user didn't provide any
                    if (options.getOption('data').slides.length === 0) {
                        util.extend(json, json.frameworks[options.getOption('framework')]);
                        json.init(options.getAll());
                        options.getOption('data').slides = json.create();
                    }

                    // Table of contents
                    html.init(options.getAll());
                    toc = html.createRecursive(document.createDocumentFragment(), options.getOption('data').slides);
                    tocContainer = document.querySelector( options.getOption('tocContainer') );
                    main.enableOnClickNavigation(tocContainer);
                    tocContainer.appendChild(toc);

                    // Keyboard navigation
                    if (options.getOption('keyCode') !== false) {
                        tocSlideData = main.tocSlideDataRecursive(options.getOption('data').slides);
                        main.enableKeyboardNavigation(tocSlideData);
                    }

                    // Icon
                    iconContainer = document.querySelector( options.getOption('iconContainer') );
                    if (iconContainer) {
                        main.enableOnClickNavigation(iconContainer);
                    }
                }
                catch(e) {
                    log("Presentable: " + e.message);
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
            enableOnClickNavigation: function(container) {
                container.addEventListener('click', function(event) {
                    var target;

                    event.stopPropagation();
                    event.preventDefault();

                    target = event.target;
                    while (container !== target) {
                        // For some reason IE10 confusses img.src with a.href
                        if (target.href && target.tagName === "A") {
                            main.goToSlide(target.href);
                            break;
                        }
                        target = target.parentNode;
                    }
                }, false);
            },

            /**
             * private
             *
             * @param tocSlideData
             */
            enableKeyboardNavigation: function(tocSlideData) {
                window.document.body.addEventListener('keyup', function(event) {
                    var keyPressed;
                    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" ||
                        event.altKey || event.ctrlKey || event.metaKey) {
                        return;
                    }

                    event.preventDefault();

                    keyPressed = event.keyCode || event.which;
                    if ( keyPressed === options.getOption('keyCode') ) {
                        main.goToSlide( options.getOption('urlHash') + tocSlideData.index );
                    }
                }, false);
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
                        return main.tocSlideDataRecursive(tocArray[i].nested);
                    }
                }
                throw {message: 'Table of Contents container not found in presentation.'};
            },

            /**
             * public: user
             *
             * @param index
             * @param tocArray
             * @param title
             * @returns {string}
             */
            slideTitlesRecursive: function(index, tocArray, title) {
                title = title || '';
                tocArray = tocArray || options.getOption('data').slides;

                for (var i = 0; i < tocArray.length; i++) {
                    if (tocArray[i].index === index) {
                        title = tocArray[i].title;
                    }

                    if (tocArray[i].nested) {
                        title = main.slideTitlesRecursive(index, tocArray[i].nested, title);
                    }
                }
                return title;
            },

            /**
             * private
             *
             * @param URL
             */
            goToSlide: function(URL) {
                window.location =  URL;
                // Some frameworks don't listen to changes in window.location necessitating forced reload
                if ( options.getOption('reload') ) {
                    window.location.reload();
                }
            }
        };

    return {
        toc: main.init,
        slideTitle: main.slideTitlesRecursive
    };

});