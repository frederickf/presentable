/* boring Legal Stuff
 ***********************************************************************************************************************
 Copyright (c) 2012, Frederick C. Feibel
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the
 following conditions are met:

 Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 disclaimer.
 Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **********************************************************************************************************************/

var presentable = (function(window) {

    var json,   // Objects for creating JSON representation of a particular presentation framework
        html,   // Uses JSON object created by json or provided by user to build the table of contents html
        main,   // The...um...main object that does all the...um...things
        log = console.log || function(){};

    main = {
        options: {
            data: {"slides": []},
            framework: "",
            iconContainer: "#presentable-icon",
            noTitle: "Untitled Slide",
            reload: false,
            titles: "h1,h2,h3,.presentable-title",
            tocContainer: "#presentable-toc",
            urlHash: "#"
        },

        init: function(userOptions) {
            var tocContainer, iconContainer;

            try {
                main.configure(userOptions);
                tocContainer = document.querySelector(main.options.tocContainer);
                iconContainer = document.querySelector(main.options.iconContainer);

                if (main.options.data.slides.length === 0) {
                    main.extend(json, json.frameworks[main.options.framework]);
                    json.init(main.options);
                    json.create(main.options.data);
                }

                html.init(main.options);
                html.createRecursive(tocContainer, main.options.data.slides);

                if (main.options.reload) {
                    main.enableForceReload(tocContainer);
                    main.enableForceReload(iconContainer);
                }
            }
            catch(e) {
                log("Presentable: " + e.message);
            }
        },

        configure: function(userOptions) {
            if (userOptions.framework) {
                // Configure with framework configs
                main.extend(main.options, json.frameworks[userOptions.framework].options);
                // but allow user to override them
                main.extend(main.options, userOptions);
            }
            else if (userOptions.data) {
                main.extend(main.options, userOptions);
            }
            else {
                throw {message: "You must provide a value for framework or data."};
            }
        },

        /**
         * Forces reload after updating URL hash for frameworks that do not provide API for navigation
         *
         * @param container
         */
        enableForceReload: function(container) {
            container.addEventListener('click', function(event) {
                var target;

                event.stopPropagation();
                event.preventDefault();

                target = event.target;
                while (container != target) {
                    if (target.href && target.tagName == "A") {
                        window.location = target.href;
                        window.location.reload();
                        break;
                    }
                    target = target.parentNode;
                }
            }, false);
        },


        slideTitlesRecursive: function(index, tocArray, title) {
            title = title || '';
            tocArray = tocArray || main.options.data.slides;

            for (var i = 0; i < tocArray.length; i++) {
                if (tocArray[i].index == index) {
                    title = tocArray[i].title;
                }

                if (tocArray[i].nested) {
                    title = main.slideTitlesRecursive(index, tocArray[i].nested, title);
                }
            }
            return title;
        },

        extend: function(a, b) {
            for( var i in b ) {
                a[ i ] = b[ i ];
            }
        }
    };

    json = {
        TITLE_SEARCH_STRING: '',
        UNTITLED_SLIDE_TEXT: '',
        init: function(options) {
            this.TITLE_SEARCH_STRING = options.titles;
            this.UNTITLED_SLIDE_TEXT = options.noTitle;
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
        create: function(data) {
            var slides, slideCount, slideData, tocArray, i;
            slides = document.querySelectorAll(this.SLIDE_SEARCH_STRING);
            tocArray = data.slides;

            slideCount = slides.length;
            for (i = 0; i < slideCount; i++) {
                slideData = {};
                slideData.index = this.slideIndex(slides[i], i);
                slideData.title = this.slideTitle(slides[i]);
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


    html = {
        HASH_STRING: '',
        init: function(options) {
            this.HASH_STRING = options.urlHash;
        },
        createRecursive: function(listParent, tocArray) {
            var ol, li, url, i;
            ol = document.createElement("ol");
            listParent.appendChild(ol);

            for (i = 0; i < tocArray.length; i++) {
                li = document.createElement("li");
                url = this.HASH_STRING + tocArray[i].index;
                li.innerHTML = '<div><a class="title" href="'+ url +'">' + tocArray[i].title + '</a> <a class="index" href="'+ url +'" >' + tocArray[i].index + '</a></div>';
                ol.appendChild(li);

                if (tocArray[i].nested) {
                    this.createRecursive(li, tocArray[i].nested)
                }
            }
        }
    };

    return {
        toc: main.init,
        sideTitle: main.slideTitlesRecursive
    };

})(window);
