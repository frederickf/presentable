require(['controller'], function(controller) {
    if (typeof define === "function" && define.amd) {
        // window.define() here because without it amdClean modifies define()
        window.define(function() {
            return controller;
        });
    }
    else {
        window.presentable = controller;
    }
});