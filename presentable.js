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
            titles: "h1,h2,h3,.presentable-title",
            tocContainer: "#presentable-toc",
            iconContainer: "#presentable-icon",
            urlHash: "#/",
            deckType: "revealjs",
            data: {"slides": []},
            reload: false
        },

        init: function(options) {
            var dataGenerator, tocContainer, iconContainer;

            try {
                main.extend(main.options, options);

                dataGenerator = json[main.options.deckType];

                if (main.options.data.slides.length === 0) {
                    dataGenerator.TITLE_SEARCH_STRING = main.options.titles;
                    dataGenerator.create(main.options.data);
                }

                tocContainer = document.querySelector(main.options.tocContainer);
                iconContainer = document.querySelector(main.options.iconContainer);

                html.HASH_STRING = main.options.urlHash;
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
    json = {};
    json.revealjs = {
        TITLE_SEARCH_STRING: '',
        create: function(data) {
            var sections, sectionCount, i;
            sections = document.querySelectorAll('.slides > section');

            sectionCount = sections.length;
            for (i = 0; i < sectionCount; i++) {
                this.processSectionRecursive(i, sections[i], data.slides);
            }

            this.removeNestedDupicatesByTitles(data.slides);
            this.removeUntitledFirstChild(data.slides);
        },

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

            return "Untitled Slide";
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
                if ( tocArray[i].nested && (tocArray[i].nested[0].title === "Untitled Slide") ) {
                    tocArray[i].nested.shift();
                }
            }
        }
    };

    json.html5slides = {
        TITLE_SEARCH_STRING: '',
        create: function(data) {
            var slides, slideCount, slideData, tocArray, i;
            slides = document.querySelectorAll('article');
            tocArray = data.slides;

            slideCount = slides.length;
            for (i = 0; i < slideCount; i++) {
                slideData = {};
                slideData.index = i + 1;
                slideData.title = this.slideTitle(slides[i]);
                tocArray.push(slideData);
            }
        },

        slideTitle: function(slide) {
            var titleElement = slide.querySelector(this.TITLE_SEARCH_STRING);
            if (titleElement) {
                return titleElement.textContent;
            }
            else {
                return "Untitled Slide"
            }
        }
    };

    html = {
        HASH_STRING: '',
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
        init: main.init,
        getTitle: main.slideTitlesRecursive
    };

})(window);
