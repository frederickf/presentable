define('html', [], function() {
    return {
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
                    this.createRecursive(li, tocArray[i].nested);
                }
            }
            return listParent;
        }
    };
});