require(['options', 'jsonBuilderFactory', 'toc', 'icon', 'keyBoardNav'], function(options, jsonBuilderFactory, toc, icon, keyBoardNav) {

    var log = console.log || function() {},
        main = {
            /**
             * public: user
             *
             * @param userOptions
             */
            init: function(userOptions) {
                var jsonBuilder;

                try {
                    options.init(userOptions);

                    if (!options.slideDataExists()) {
                        jsonBuilder = jsonBuilderFactory(options);
                        options.getOption('data').slides = jsonBuilder.create();
                    }

                    toc.init(options);

                    keyBoardNav.init(options);

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
            slideTitleRecursive: function(index, tocArray, title) {
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
                slideTitle: main.slideTitleRecursive
            };
        });
    }
    else {
        window.presentable = {
            toc: main.init,
            slideTitle: main.slideTitleRecursive
        };
    }
});