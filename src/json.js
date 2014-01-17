define('json', ['util'], function(util) {
    var json = {};
    json = {
        TITLE_SEARCH_STRING: '',
        UNTITLED_SLIDE_TEXT: '',
        TOC_CONTAINER: '',

        /**
         * public: controller.js
         *
         * @param options
         */
        init: function(options) {
            this.TITLE_SEARCH_STRING = options.titles;
            this.UNTITLED_SLIDE_TEXT = options.noTitle;
            this.TOC_CONTAINER = options.tocContainer;
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
            urlHash: "#/"
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
            var slideData, sectionCount, i;

            slideData = {};
            slideData.index = slideIndex;
            slideData.title = this.slideTitleRecursive(slide);
            if (this.isTocSlide(slide)) {
                slideData.toc = "true";
            }

            tocArray.push(slideData);

            // Actually returns all child sections, not just immediate children
            // I'm getting away with it here because there is only one level of children
            var childSections = slide.querySelectorAll('section');
            if (childSections.length === 0) {
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
                    parentSlide.nested.shift();
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

    return json;
});
