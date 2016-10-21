/* boring Legal Stuff
 ***********************************************************************************************************************
The MIT License (MIT)
Copyright (c) 2012 Frederick C. Feibel

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in the
Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **********************************************************************************************************************/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.presentable = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    HASH_STRING: '',
    init: function(options) {
        this.HASH_STRING = options.urlHash;
        this.HIDE_NO_TITLE = options.hideNoTitle;
        this.NO_TITLE_TEXT = options.noTitle;
    },
    createRecursive: function(listParent, tocArray) {
        var ol, li, url, i;
        ol = document.createElement("ol");
        listParent.appendChild(ol);

        for (i = 0; i < tocArray.length; i++) {
            if (this.HIDE_NO_TITLE && (tocArray[i].title === this.NO_TITLE_TEXT) ) {
                continue;
            }

            li = document.createElement("li");
            url = this.HASH_STRING + tocArray[i].index;
            li.innerHTML = '<div><a class="title" href="'+ url +'">' + tocArray[i].title + '</a> <a class="page" href="'+ url +'" >' + tocArray[i].page + '</a></div>';
            ol.appendChild(li);

            if (tocArray[i].nested) {
                this.createRecursive(li, tocArray[i].nested);
            }
        }
        return listParent;
    }
};
},{}],2:[function(require,module,exports){
var util = require('./util');

var json = {
    TITLE_SEARCH_STRING: '',
    UNTITLED_SLIDE_TEXT: '',
    TOC_CONTAINER: '',
    PAGE_DIVIDER: '',

    /**
     * public: controller.js
     *
     * @param options
     */
    init: function(options) {
        this.TITLE_SEARCH_STRING = options.titles;
        this.UNTITLED_SLIDE_TEXT = options.noTitle;
        this.TOC_CONTAINER = options.tocContainer;
        this.PAGE_DIVIDER = options.pageDivider;
    },

    slideIndex: function() {
        throw new Error('You must implement slideIndex() or implement create() without it.');
    },

    /**
     * private
     *
     * @param slide
     * @returns {string}
     */
    slideTitle: function(slide) {
        var titleElement = slide.querySelector(this.TITLE_SEARCH_STRING);
        if (titleElement) {
            return titleElement.textContent.replace(/</g, '&lt;');
        }
        else {
            return this.UNTITLED_SLIDE_TEXT;
        }
    },

    formatPage: function(index) {
        // TODO: zero pad?
        // var page, prefixLength;
        // page = index + 1;
        // prefixLength = (slideCount + '').length - (page + '').length;
        // return util.zeroPrefix(page, prefixLength);
        return index + 1;
    },

    /**
     * private
     *
     * @param slide
     * @returns {Node}
     */
    isTocSlide: function(slide) {
        return slide.querySelector(this.TOC_CONTAINER);
    },

    /**
     * public: controller.js, json.js
     */
    create: function() {
        var slides, slideCount, slideData, tocArray, i;
        slides = document.querySelectorAll(this.SLIDE_SEARCH_STRING);
        tocArray = [];

        slideCount = slides.length;
        for (i = 0; i < slideCount; i++) {
            slideData = {};
            slideData.index = this.slideIndex(slides[i], i);
            slideData.page = this.formatPage(i, slideCount);
            slideData.title = this.slideTitle(slides[i]);
            if (this.isTocSlide(slides[i])) {
                slideData.toc = "true";
            }
            tocArray.push(slideData);
        }

        return tocArray;
    }
};

json.frameworks = {};

json.frameworks.revealjs = {
    SLIDE_SEARCH_STRING: '.slides > section',
    options: {
        urlHash: '#/',
        pageDivider: '.'
    },
    create: function() {
        var sections, sectionCount, tocArray, i;
        sections = document.querySelectorAll(this.SLIDE_SEARCH_STRING);
        tocArray = [];

        sectionCount = sections.length;
        for (i = 0; i < sectionCount; i++) {
            this.processSectionRecursive(i, sections[i], tocArray);
        }

        this.removeNestedDuplicatesByTitles(tocArray);
        this.removeUntitledFirstChild(tocArray);
        this.setPageNumberRecursive(tocArray);

        return tocArray;
    },

    isTocSlide: function(slide) {
        return util.querySelectorChild(slide, this.TOC_CONTAINER);
    },

    /**
     * 1. Parent has title, 1st child does not
     *    ** Use parent title, omit child
     *    ** removeUntitledFirstChild()
     *    ** see https://github.com/hakimel/reveal.js/issues/651
     * 2. 1st Child has title, parent does not
     *    ** Use child title for parent and child, omit child as duplicate
     *    ** removeNestedDupicatesByTitles()
     * 3. Neither parent, nor child has title
     *    ** Both assigned "Untitled slide", child omitted
     *    ** removeNestedDupicatesByTitles()
     */
    processSectionRecursive: function(slideIndex, slide, tocArray) {
        var slideData, sectionCount, childSections, hasChildren, i;

        // Actually returns all child sections, not just immediate children
        // I'm getting away with it here because there is only one level of children
        childSections = slide.querySelectorAll('section');
        hasChildren = childSections.length > 0;

        slideData = {};
        slideData.index = slideIndex;
        slideData.title = this.slideTitleRecursive(slide);
        if (this.isTocSlide(slide)) {
            slideData.toc = "true";
        }
        tocArray.push(slideData);

        if (!hasChildren) {
            return;
        }

        slideData.nested = [];
        sectionCount = childSections.length;
        for (i = 0; i < sectionCount; i++) {
            this.processSectionRecursive( (slideIndex + '/' + i), childSections[i], slideData.nested );
        }
    },

    /**
     * Returns parent title or if parent has no title 1st child with title
     * or if no title found returns no title text
     *
     * @param slide
     * @returns {*}
     */
    slideTitleRecursive: function(slide) {
        var firstTitle, childSlide;

        // textContent =< ie9, consider using innerText too if < ie9 important
        firstTitle = slide.querySelector(this.TITLE_SEARCH_STRING);
        if (firstTitle && (firstTitle.parentNode === slide) ) {
            return firstTitle.textContent;
        }

        childSlide = slide.querySelector("section");
        if (childSlide) {
            return this.slideTitleRecursive( childSlide );
        }

        return this.UNTITLED_SLIDE_TEXT;
    },

    /**
     * If 1st child has title and parent does not child's title is assigned to parent
     * This method removes now duplicated 1st child title
     *
     * @param tocArray
     */
    removeNestedDuplicatesByTitles: function (tocArray) {
        var i, parentSlide, firstChildSlide;

        for (i = 0; i < tocArray.length; i++) {
            parentSlide = tocArray[i];
            if (!parentSlide.nested) {continue;}

            firstChildSlide = parentSlide.nested[0];
            // testing that 1st child not untitled necessary because removeUntitledFirstChild() will handle that case
            if ( (parentSlide.title === firstChildSlide.title) && (firstChildSlide.title !== this.UNTITLED_SLIDE_TEXT) ) {
                if (parentSlide.nested.length < 2) {
                    // A <section> with only one <section> child should not be necessary,
                    // but could easily happen while moving sections around.
                    // this handles that scenario
                    delete parentSlide.nested;
                }
                else {
                    parentSlide.nested.shift();
                }

            }

        }
    },

    /**
     * Due to slideTitleRecursive() parent and 1st child will have same title if parent or both
     * have no title. This removes child from toc in that case.
     *
     * @param tocArray
     */
    removeUntitledFirstChild: function (tocArray) {
        var i, parentSlide, firstChildSlide;

        for (i = 0; i < tocArray.length; i++) {
            parentSlide = tocArray[i];
            if (!parentSlide.nested) {continue;}

            firstChildSlide = parentSlide.nested[0];
            if ( firstChildSlide.title === this.UNTITLED_SLIDE_TEXT ) {
                parentSlide.nested.shift();
            }
        }
    },

    setPageNumberRecursive: function(tocArray) {
        for (var i = 0; i < tocArray.length; i++) {
            var hasChildren = (!!tocArray[i].nested);
            tocArray[i].page = this.formatPage(tocArray[i].index, hasChildren);
            if (hasChildren) {
                this.setPageNumberRecursive(tocArray[i].nested);
            }
        }
    },

    formatPage: function (index, hasChildren) {
        if (this.PAGE_DIVIDER === 'c') {
            var formatPage = function () {
                return ++this.formatPage.pageCount;
            };
            formatPage.pageCount = 1;
            this.formatPage = formatPage;
            return formatPage.pageCount;
        }
        // index may be in the format n or n/n. This returns array of strings
        var page = (index + '').split('/');
        // Returns array of integers
        page = page.map(Number);
        // If length === 1, index was in form n, otherwise n/n
        if (page.length === 1) {
            if (hasChildren) {
                // Parent slide with children always  sufixed with 1
                return (page[0] + 1) + this.PAGE_DIVIDER + '1';
            }
            return (page[0] + 1);
        }
        return (page[0] + 1) + this.PAGE_DIVIDER + (page[1] + 1);
    }
};

json.frameworks.html5slides = {
    SLIDE_SEARCH_STRING: 'article',
    options: {
        reload: true
    },
    slideIndex: function(slide, i) {
        return i + 1;
    }
};

json.frameworks.io2012slides = {
    SLIDE_SEARCH_STRING: 'slide:not([hidden=""])',
    options: {
        reload: true
    },
    slideIndex: function(slide, i) {
        return i + 1;
    }
};

json.frameworks.shower = {
    SLIDE_SEARCH_STRING: '.slide',
    slideIndex: function(slide) {
        return slide.id;
    }
};

json.frameworks.impressjs = {
    SLIDE_SEARCH_STRING: '.step',
    slideIndex: function(slide, i) {
        if (slide.id) {
            return slide.id;
        }
        return "step-" + (i + 1);
    }
};

module.exports = json;

},{"./util":4}],3:[function(require,module,exports){
var html = require('./html');
var json = require('./json');
var util = require('./util');

var log = this.console ? console.log.bind(console) : function() {};

var main = {
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
        urlHash: "#",
        pageDivider: '/'
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
            if (!tocSlideData) {
                throw new Error('Table of Contents container not found in presentation.');
            }
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
    tocSlideDataRecursive: function (tocArray) {
        for (var i = 0; i < tocArray.length; i++) {
            if (tocArray[i].toc) {
                return tocArray[i];
            }
            if (tocArray[i].nested) {
                var tocData = main.tocSlideDataRecursive(tocArray[i].nested);
                if (tocData) {
                    return tocData;
                }
            }
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

module.exports = {
    toc: main.init,
    slideTitle: main.slideTitlesRecursive
};

},{"./html":1,"./json":2,"./util":4}],4:[function(require,module,exports){
module.exports = {
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

    zeroPrefix: function(stem, prefixLength) {
        var i;
        for (i = 0; i < prefixLength; i++) {
            stem = '0' + stem;
        }
        return stem;
    }
};
},{}]},{},[3])(3)
});