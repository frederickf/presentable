define('controller', ['html', 'json','util'], function(html, json, util) {
    var log = console.log || function() {},
        main = {
            options: {
                data: {"slides": []},
                framework: "",
                iconContainer: "#presentable-icon",
                keyCode: 84,
                noTitle: "Untitled Slide",
                hideNoTitle: false,
                reload: false,
                titles: "h1,h2,h3,.presentable-title",
                tocContainer: "#presentable-toc",
                urlHash: "#"
            },

            /**
             * public: user
             *
             * @param userOptions
             */
            init: function(userOptions) {
                var tocSlideData, toc, tocContainer, iconContainer;

                try {
                    main.configure(userOptions);

                    // Use json to create slide data if user didn't provide any
                    if (main.options.data.slides.length === 0) {
                        util.extend(json, json.frameworks[main.options.framework]);
                        json.init(main.options);
                        main.options.data.slides = json.create();
                    }

                    tocSlideData = main.tocSlideDataRecursive(main.options.data.slides);
                    tocContainer = document.querySelector(main.options.tocContainer);
                    iconContainer = document.querySelector(main.options.iconContainer);

                    html.init(main.options);
                    toc = html.createRecursive(document.createDocumentFragment(), main.options.data.slides);

                    if (main.options.keyCode !== false) {
                        main.enableKeyboardNavigation(tocSlideData);
                    }

                    if (iconContainer) {
                        main.enableOnClickNavigation(iconContainer);
                    }

                    main.enableOnClickNavigation(tocContainer);

                    tocContainer.appendChild(toc);
                }
                catch(e) {
                    log("Presentable: " + e.message);
                }
            },

            /**
             * private
             *
             * @param userOptions
             */
            configure: function(userOptions) {
                if (userOptions.framework) {
                    // Configure with framework configs
                    util.extend(main.options, json.frameworks[userOptions.framework].options);
                    // but allow user to override them
                    util.extend(main.options, userOptions);
                }
                else if (userOptions.data) {
                    util.extend(main.options, userOptions);
                }
                else {
                    throw {message: "You must provide a value for framework or data."};
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
                    if (keyPressed === main.options.keyCode) {
                        main.goToSlide(main.options.urlHash + tocSlideData.index);
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
                tocArray = tocArray || main.options.data.slides;

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
                if (main.options.reload) {
                    window.location.reload();
                }
            }
        };

    return {
        toc: main.init,
        slideTitle: main.slideTitlesRecursive
    };

});