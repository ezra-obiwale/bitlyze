# bitlyze
Shorten long urls with Bitly

## Usage

```html
<ul>
    <li><a href="#" data-url="http://example.com/link1">Link 1</a></li>
    <li><a href="#" data-url="http://example.com/link2">Link 3</a></li>
    <li><a href="#" data-url="http://example.com/link3">Link 3</a></li>
</ul>
<!-- include js -->
<script src="/path/to/jquery.min.js"></script>
<!-- include bitlyze -->
<script src="bitlyze.min.js"></script>
<script>
    $(function(){
        $('a').bitlyze({
            accessToken: 'bitly-access-token-here'
        });
    });
</script>
```

The full config object is:

```js
{`
    bitlyUrl: 'https://api-ssl.bitly.com/v3/shorten',``
    accessToken: '',
    urlDataKey: 'url',
    callback: function (short_url) { }
}
```

The callback is called on each of the elements, therefore the `context` (`this`)
is the element.

## License

MIT``