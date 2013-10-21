define('util', [], function() {
    return {
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
        }
    };

});