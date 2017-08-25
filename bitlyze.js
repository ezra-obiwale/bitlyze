(function ($) {
    var btz = {}, str = localStorage.getItem('btz'), cnt = 0;
    if (str) btz = JSON.parse(str);

    function save() {
        if (!cnt) localStorage.setItem('btz', JSON.stringify(btz));
    }

    $.bitlyze = function (url, access_token, bitly_url) {
        return new Promise(function (resolve, reject) {
            // url has been/is being shortened
            if (btz[url]) {
                // has been shortened: use it
                if (btz[url].short) {
                    return Promise.resolve(btz[url].short);
                }
                // is being shortened: queue for it
                else {
                    cnt++;
                    btz[url].queue.push({ resolve: resolve, reject: reject });
                }
                return;
            }
            cnt++;
            // create url map && queue current element
            btz[url] = { queue: [{ resolve: resolve, reject: reject }] };

            bitly_url = bitly_url || 'https://api-ssl.bitly.com/v3/shorten';
            // use either ? or &
            bitly_url += bitly_url.indexOf('?') === -1 ? '?' : '&';
            // add format
            bitly_url += 'format=txt';
            // add acdess token
            bitly_url += '&access_token=' + access_token;
            // add long url
            bitly_url += '&longUrl=' + encodeURIComponent(url);
    
            // get short url
            $.get(bitly_url)
                .then(function (short_url) {
                    for (var i = 0; i < btz[url].queue.length; i++) {
                        // resolve
                        btz[url].queue[i].resolve(short_url);
                        // reduct count
                        cnt--;
                    }
                    // empty queue
                    btz[url].queue = [];
                    // save
                    save();
                })
                .catch(function () {
                    for (var i = 0; i < btz[url].queue.length; i++) {
                        // reject
                        btz[url].queue[i].reject.apply(null, arguments);
                        // reduct count
                        cnt--;
                    }
                    // empty queue
                    btz[url].queue = [];
                    // save
                    save();
                });
        });
    };
    $.fn.bitlyze = function (settings) {
        var config = {
            bitlyUrl: 'https://api-ssl.bitly.com/v3/shorten',
            accessToken: '',
            urlAttr: 'data-url',
            callback: function (short_url) { }
        };
        $.extend(config, settings);

        this.each(function () {
            // already shortened: cancel
            if ($(this).hasClass('bitlyzed')) return;
            var $link = $(this),
                url = $link.attr(config.urlAttr);

            $.bitlyze(url, config.accessToken, config.bitlyUrl)
                .then(function (short) {
                    // add short url to map
                    btz[url].short = short;
                    // settle queue
                    for (var i = 0; i < btz[url].queue.length; i++) {
                        $(btz[url].queue[i])
                            // mark to avoid re-bitlyze-ing
                            .addClass('bitlyzed')
                            // replace url with short
                            .attr(config.urlAttr, short);
                        // call callback on current queued element
                        config.callback.call(btz[url].queue[i], short);
                    }
                });
        });
        return this;
    };
})(jQuery);