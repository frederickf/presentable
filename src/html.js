define('html', [], function() {
    return {
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
                li.innerHTML = '<div><a class="title" href="'+ url +'">' + tocArray[i].title + '</a> <a class="index" href="'+ url +'" >' + tocArray[i].index + '</a></div>';
                ol.appendChild(li);

                if (tocArray[i].nested) {
                    this.createRecursive(li, tocArray[i].nested);
                }
            }
            return listParent;
        }
    };
});