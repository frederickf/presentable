define('options', ['util'], function(util) {
    var defaultOptions = {
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

        frameworkOptions = {
            revealjs: {
                urlHash: "#/"
            },
            html5slides: {
                reload: true
            },
            io2012slides: {
                reload: true
            }
        },

        /**
         *
         * @param userOptions
         * @param frameworkOptions
         */
        init = function(userOptions) {
            if (userOptions.framework) {
                // Configure with framework configs
                util.extend(defaultOptions, frameworkOptions[userOptions.framework]);
                // but allow user to override them
                util.extend(defaultOptions, userOptions);
            }
            else if (userOptions.data) {
                util.extend(defaultOptions, userOptions);
            }
            else {
                throw {message: "You must provide a value for framework or data."};
            }
        },

        getOption = function(optionName) {
            return defaultOptions[optionName];
        },

        getAll = function() {
            return defaultOptions;
        };

    return {
        init: init,
        getOption: getOption,
        getAll: getAll
    };

});