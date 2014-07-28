require(['options', 'util', 'json', 'toc', 'icon', 'keyBoardNav'], function(options, util, json, toc, icon, keyBoardNav) {

    var log = console.log || function() {},
        main = {
            /**
             * public: user
             *
             * @param userOptions
             */
            init: function(userOptions) {

                try {
                    options.init(userOptions);

                    // Use json to create slide data if user didn't provide any
                    if (options.getOption('data').slides.length === 0) {
                        util.extend(json, json.frameworks[options.getOption('framework')]);
                        json.init(options.getAll());
                        options.getOption('data').slides = json.create();
                    }

                    // Table of contents
                    toc.init(options);
                    toc.create();
                    toc.inject();

                    // Keyboard navigation
                    keyBoardNav.init(options);

                    // Icon
                    icon.init(options);
                }
                catch(e) {
                    log("Presentable: " + e.message);
                }
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
            }
        };


    if (typeof define === "function" && define.amd) {
        // window.define() here because without it amdClean modifies define()
        window.define(function() {
            return {
                toc: main.init,
                slideTitle: main.slideTitlesRecursive
            };
        });
    }
    else {
        window.presentable = {
            toc: main.init,
            slideTitle: main.slideTitlesRecursive
        };
    }
});