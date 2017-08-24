(function ($) {
    $.fn.bitlyze = function (settings) {
        var btz = {}, str = localStorage.getItem('btz');
        if (str) btz = JSON.parse(str);

        var config = {
            bitlyUrl: 'https://api-ssl.bitly.com/v3/shorten',
            accessToken: '',
            urlDataKey: 'url',
            callback: function (short_url) { }
        };
        $.extend(config, settings);
        this.each(function () {
            // already shortened: cancel
            if ($(this).hasClass('bitlyzed')) return;
            var $link = $(this),
                url = $link.data(config.urlDataKey);
            // url has been/is being shortened
            if (btz[url]) {
                // has been shortened: use it
                if (btz[url].short)
                    $link
                        // mark to avoid re-bitlyze-ing
                        .addClass('bitlyzed')
                        // replace url with short
                        .data('url', btz[url].short);
                // is being shortened: queue for it
                else btz[url].queue.push(this);
                return;
            }
            // create url map && queue current element
            btz[url] = { queue: [this] };
            var bitlyUrl = config.bitlyUrl;
            // use either ? or &
            bitlyUrl += bitlyUrl.indexOf('?') === -1 ? '?' : '&';
            // add format
            bitlyUrl += 'format=txt';
            // add acdess token
            bitlyUrl += '&access_token=' + config.accessToken;
            // add long url
            bitlyUrl += '&longUrl=' + encodeURIComponent(url);
            $.get(bitlyUrl, function (short) {
                // add short url to map
                btz[url].short = short;
                // settle queue
                for (var i = 0; i < btz[url].queue.length; i++) {
                    $(btz[url].queue[i])
                        // mark to avoid re-bitlyze-ing
                        .addClass('bitlyzed')
                        // replace url with short
                        .data(config.urlDataKey, short);
                    // call callback on current queued element
                    config.callback.call(btz[url].queue[i], short);
                }
                // empty queue
                btz[url].queue = [];
                // save
                localStorage.setItem('btz', JSON.stringify(btz));
            });
        });
        return this;
    };
})(jQuery);