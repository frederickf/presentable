# Presentable 
### A Table of Contents for HTML Presentations

Presentable is a small script/plugin/widget/thingy that adds a table of contents to HTML based presentations by parsing the header tags.  

See examples and detailed instructions: [http://fcfeibel.com/presentable/](http://fcfeibel.com/presentable/)

## Framework Support

The following presentation frameworks are supported out of the box, and Presentable can theoretically handle other frameworks too, although your mileage may vary.


* [Reveal.js](https://github.com/hakimel/reveal.js)
* [html5slides](http://code.google.com/p/html5slides/)
* [io-2012-slides (formerly html5slides)](https://code.google.com/p/io-2012-slides/)
* [Shower](https://github.com/pepelsbey/shower)
* [impress.js](https://github.com/bartaz/impress.js/)

## Browser Support
Presentable should work in Firefox, Chrome, Safari, and IE9/10. If it doesn't open an issue.

## Generic Instructions
These are generic instructions for installing.  See the [official documentation](http://fcfeibel.com/presentable/) for presentation specific instructions.

### CSS
Add the CSS in the &lt;head&gt; tag.

    <link rel="stylesheet" href="path/to/presentable.min.css">

### HTML
Wrap the following HTML in a slide.

    <h2>Table of Contents</h2>
    <nav id="presentable-toc" class="frameworkname"></nav>

And add this as a child of the &lt;body&gt; tag.

    <aside id="presentable-icon" class="frameworkname">
        <a title="Table of Contents" href="#?">
            <img alt="Table of Contents" src="path/to/frameworkname.png"/>
        </a>
    </aside>

### JavaScript
Reference presentable.js following the conventions set by your framework of choice.

    <script src="path/to/presentable.min.js"></script>

### Initialize
This goes <em>after</em> all the slides.

    presentable.toc({
        framework: "framework name here"
    });

It can also accept other configuration options allowing Presentable to support almost any framework.

    presentable.toc({
        config: "options here"
    });

## Learn More
See examples and instructions: [http://fcfeibel.com/presentable/](http://fcfeibel.com/presentable/)