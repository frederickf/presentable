# Presentable
### A Table of Contents for HTML Presentations

> Spacebar to go forward,  
> p to go backwards,  
> Presentable to go anywhere!

Presentable is a small script/plugin/widget/thingy that adds a table of contents to HTML based presentations by parsing the header tags.  

## Table of contents

* [Framework Support](#framework-support)
* [Browser Support](#browser-support)
* [Quickstart](#quickstart)
* [Basics](#basics)
* [Usage](#usage)
* [Configuration](#configuration)
* [Support for other frameworks](#support-for-other-frameworks)
* [Bugs, feature requests, contributing](#bugs-feature-requests-contributing)

## Framework support

The following presentation frameworks are supported out of the box, and Presentable can theoretically handle other frameworks too, although your mileage may vary.

* [reveal.js](https://github.com/hakimel/reveal.js)
* [Shower](https://github.com/pepelsbey/shower)
* [impress.js](https://github.com/bartaz/impress.js/)
* html5slides
* io-2012-slides

Refer to the [wiki](https://github.com/frederickf/presentable/wiki) for details on using Presentable with these presentation frameworks.

## Browser support
Presentable should work in Firefox, Chrome, Safari, Edge and IE9+.

## Quickstart
These are generic instructions to give you an idea of how to install Presentable. Refer to the [wiki](https://github.com/frederickf/presentable/wiki) for framework specific installation instructions.

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
        config: "value"
    });

## Basics

Presentable will turn slide "titles" into lines in the table of contents. By default, a slide "title" is an HTML element that meets the following requirements:
* It is an `<h1>`, `<h2>`, `<h3>`, or
* any tag marked with the .presentable-title class

The first eligible element in a slide will be the title for that slide in the table of contents:

```
<section>
    <h1>This will be the title in the table of contents</h1>
    <h2>This will not</h2>
</section>
```

Every slide should have a "title" or it will be assigned the title "Untitled Slide" in the table of contents. However, untitled slides can be omitted from the table of contents by using the "hideNoTitle" option. There is also an option to change the default untitled slide text.

Any markup that was in the slide title will be stripped from the table of contents titles.

Press the `t` key navigate back to the TOC from anywhere in the presentation. This option is configurable.

## Usage
Presentable exposes the following two methods:
```
presentable.toc()
presentable.slideTitle()
```

### Configuration and initialization
Calling `presentable.toc()` will trigger presentable to parse your presentation and render the table of contents. It must be called after the presentation is in the DOM and fully rendered. `presentable.toc()` should only be called once.

You also pass configuration options to `presentable.toc()`. One of `framework` or `data` are required. All other configurations are optional.
```
presentable.toc({
    framework: 'revealjs',
    pageDivider: '-',
})
```

### Getting a slide title
Presentable also exposes `presentable.slideTitle()` function which  returns the title of a slide identified by an index which matches the URL hash corresponding to that slide.

```
// example.com/my-presentation#11
presentable.slideTitle("11");
// example.com/my-presentation#0/1
presentable.slideTitle("0/1");
```
One possible use is to track traffic to specific slides by passing the slide title to your web analytics provider each time it is visited.

## Configuration
The following configurations can be passed to `presentable.toc()`. The options and their default values are demonstrated below. Some frameworks have their own defaults. See the [wiki](https://github.com/frederickf/presentable/wiki) for more details.

### framework
Identifies the presentation framework. Presentable will generate the correct TOC for the framework based on this value. The `data` option is ignored when this option is used.

Accepts one of the following: `revealjs`, `html5slides`, `io-2012-slides`, `shower`, `impressjs`

**This configuration is required if `data` is not used and will be ignored if `data` is used.**

```
presentable.toc({
    framework: ""
)}
```

### data
Pass in a custom presentation structure. The `framework` option is ignored when this option is used. See [Support for other frameworks](#support-for-other-frameworks) below for more details.

**This configuration is required if `framework` is not used and will be ignored if `framework` is used.**

```
presentable.toc({
    data: {"slides": []}
)}
```

### keyCode
Used for keyboard navigation back to TOC slide. The default, `84` equals the `t` key. Set to `false` to disable.
```
presentable.toc({
    keyCode: 84
)}
```

### noTitle
Text displayed in the TOC when no title is found for a slide.
```
presentable.toc({
    noTitle: "Untitled Slide"
)}
```

### hideNoTitle
Untitled slides are excluded from the TOC when this option is `true`.
```
presentable.toc({
    hideNoTitle: false
)}
```

### reload
Reload when Presentable link is clicked. For frameworks without navigation API.
```
presentable.toc({
    reload: false
)}
```

### titles
HTML IDs, classes, and elements to be considered slide titles.
```
presentable.toc({
    titles: "h1,h2,h3,.presentable-title"
)}
```

### urlHash
URL hash pattern
```
presentable.toc({
    urlHash: "#"
)}
```

### pageDivider
Identifies how slides and nested slides are separated. If any character other than `c` is used, then the Parent and child pages in the TOC will be separated by that value. If `c` is used, then an ascending slide counts will be displayed instead showing parent and child counts.

This configuration only applies to presentation frameworks that support nested slides (like reveal.js). Flat presentations will always show the ascending slide count.

```
presentable.toc({
    pageDivider: "/"
)}

EX:
Slide title            1
Slide title          2/1
   Slide title       2/2
Slide title            3
```
```
presentable.toc({
    pageDivider: "c"
)}

EX:
Slide title            1
Slide title            2
   Slide title         3
Slide title            4
```

## Support for other frameworks
A JSON object can be passed to `presentable.toc()` making it possible to generate a table of contents for otherwise unsupported presentation frameworks.

The JSON object should have the following format:

```
var customData = {"slides": [
    {"index": "1", "page": "1", "title": "slide 1"},
    {"index": "2", "page": "2", "title": "slide 2", "toc": true},
    {"index": "3", "title": "slide 3", "nested": [
        {"index": "3/0", "page": "4", "title": "slide 3/0"},
        {"index": "3/1", "page": "5", "title": "slide 3/1"}
     ]},
    {"index": "4", page: "6", "title": "slide 4"},
    ...
]};
presentable.toc({
    data: customData,
    // Other config options
});
```

key | value
--- | -----
`index` | The value used by the presentation to identify slides. This value is also used in the URL. In some presentations this will be the same as `page`.
`page` | Displayed in the table of contents to the right of the slide title.
`title` | Displayed in the table of contents to the left of the page number.
`toc` | Identifies the slide containing the slide containing the table of contents.
`nested` | Nested slides. Only one level of nesting is supported.
