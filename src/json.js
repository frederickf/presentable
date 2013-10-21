define('json', [], function() {
    var json = {};
    json = {
        TITLE_SEARCH_STRING: '',
        UNTITLED_SLIDE_TEXT: '',
        TOC_CONTAINER: '',

        init: function(options) {
            this.TITLE_SEARCH_STRING = options.titles;
            this.UNTITLED_SLIDE_TEXT = options.noTitle;
            this.TOC_CONTAINER = options.tocContainer;
        },

        slideTitle: function(slide) {
            var titleElement = slide.querySelector(this.TITLE_SEARCH_STRING);
            if (titleElement) {
                return titleElement.textContent;
            }
            else {
                return this.UNTITLED_SLIDE_TEXT;
            }
        },

        isTocSlide: function(slide) {
            return slide.querySelector(this.TOC_CONTAINER);
        },

        create: function(data) {
            var slides, slideCount, slideData, tocArray, i;
            slides = document.querySelectorAll(this.SLIDE_SEARCH_STRING);
            tocArray = data.slides;

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
        }
    };

    json.frameworks = {};

    json.frameworks.revealjs = {
        SLIDE_SEARCH_STRING: '.slides > section',
        options: {
            urlHash: "#/"
        },
        create: function(data) {
            var sections, sectionCount, i;
            sections = document.querySelectorAll(this.SLIDE_SEARCH_STRING);

            sectionCount = sections.length;
            for (i = 0; i < sectionCount; i++) {
                this.processSectionRecursive(i, sections[i], data.slides);
            }

            this.removeNestedDupicatesByTitles(data.slides);
            this.removeUntitledFirstChild(data.slides);
        },

        isTocSlide: function(slide) {
            return util.querySelectorChild(slide, this.TOC_CONTAINER);
        },

        /**
         * 1. Parent has title, 1st child does not
         *    ** Use parent title, omit child
         *    ** removeUntitledFirstChild()
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

        slideTitleRecursive: function(slide) {
            var firstTitle, childSlide;

            // textContent =< ie9, consider using innerText too if < ie9 important
            firstTitle = slide.querySelector(this.TITLE_SEARCH_STRING);
            if (firstTitle) {
                return firstTitle.textContent;
            }

            childSlide = slide.querySelector("section");
            if (childSlide) {
                return this.slideTitleRecursive( childSlide );
            }

            return this.UNTITLED_SLIDE_TEXT;
        },

        removeNestedDupicatesByTitles: function (tocArray) {
            for (var i = 0; i < tocArray.length; i++) {
                if ( tocArray[i].nested && (tocArray[i].title === tocArray[i].nested[0].title) ) {
                    tocArray[i].nested.shift();
                }
            }
        },

        removeUntitledFirstChild: function (tocArray) {
            for (var i = 0; i < tocArray.length; i++) {
                if ( tocArray[i].nested && (tocArray[i].nested[0].title === this.UNTITLED_SLIDE_TEXT) ) {
                    tocArray[i].nested.shift();
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

    json.frameworks.shower = {
        SLIDE_SEARCH_STRING: '.slide',
        slideIndex: function(slide, i) {
            return slide.id;
        }
    };

    json.frameworks.impressjs = {
        SLIDE_SEARCH_STRING: '.step',
        slideIndex: function(slide, i) {
            return slide.id;
        }
    };

    return json;
});
