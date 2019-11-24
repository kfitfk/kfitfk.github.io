---
layout: post
title: Character Outlines for Lottie-web
category: programming
poster: https://img.alicdn.com/tfs/TB1HLCyn4n1gK0jSZKPXXXvUXXa-2400-500.jpg
summary: When you use lottie-web with canvas renderer, you have to export all the text glyphs used in your project. However, if you require your user to update the text later, things become much trickier. You don't need to switch to SVG renderer to avoid the "Missing character from exported characters list" error. In this article, I'm showing you how I tackle this problem.
---

Combining [lottie-web](https://github.com/airbnb/lottie-web) with [bodymovin](https://aescripts.com/bodymovin/), web developers can render After Effects animations on the web with ease. Lottie offers 3 ways of rendering animation on the web: SVG, canvas, and HTML.

Recently in one of my projects, I'm implementing a video editor based on canvas, which provides a feature that allows the user to edit text animation, as shown below.

![dynamic text using lottie-web canvas renderer](https://img.alicdn.com/tfs/TB1uCN2nWL7gK0jSZFBXXXZZpXa-1260-440.gif)

The animation is exported from AE using bodymovin, and rendered with lottie's canvas renderer. Now here's the problem:

- Lottie's canvas renderer only supports text as glyphs, not text as font;
- My target user can type Chinese characters to preview the effect;
- It is impossible to prepare all Chinese characters' glyph info in advance;
- Even if I can do that, it's not efficient and I may run into performance and storage issues in the future.

In this article, I'm writing down how I generate glyphs info while the user is typing and how to tell lottie-web that the characters info change.

BTW, if you have any questions or better ideas, please [open an issue](https://github.com/kfitfk/kfitfk.github.io/issues) on my blog's repo (since I havn't found a new comment system to replace the defunct one).

## The demo and code archive

The font that I'm using in the code archive is [Bitstream Vera Fonts](https://www.gnome.org/fonts/). It's an open source font which can be redistributed. However, the font that I use to demonstrate the whole process in this article is [Noto Sans CJK SC](https://www.google.com/get/noto/help/cjk/).

![A really simple AE project](https://img.alicdn.com/tfs/TB1Ruizn4D1gK0jSZFyXXciOVXa-1184-804.png)

I created a very simple demo in After Effects. It was a composition containing only a text layer with font set to Bitstream Vera Sans Bold. There was nothing in the text area. Then I exported it using bodymovin and the data looks something like this.

```json
{
  "v": "5.5.9", "fr": 25, "ip": 0, "op": 125,
  "w": 1200, "h": 700, "nm": "Comp 1", "ddd": 0,
  "assets": [],
  "fonts": {
    "list": [{
      "fName": "BitstreamVeraSans-Bold",
      "fFamily": "Bitstream Vera Sans",
      "fStyle": "Bold",
      "ascent": 75.9994506835938
    }]
  },
  "layers": [{...}],
  "markers": [],
  "chars": []
}
```

Notice that the `chars` array is empty.

You can [download the code here](https://github.com/kfitfk/dynamic-lottie-glyph). Run `npm install` and `npm start`. In the demo page, the canvas will update as you type text in the text input. The content in the canvas is rendered using lottie-web canvas renderer. Since the font only contains Latin characters, don't type characters that are not included in the font.

Let's see how it is done at the rest of this article.

## Getting glyph data

The first step is to get a character's glyph data from the font file in browser. Kudos to [fontkit](https://github.com/foliojs/fontkit), its `font.glyphForCodePoint` method returns exactly what we want.

### Webpack config for fontkit

In the demo mentioned before, I'm using webpack. In order to use fontkit in browser, the following webpack configuration is needed.

```js
{
  node: {
    fs: "empty",
  },
  module: {
    rules: [
      {
        test: /fontkit[/\\]index.js$/,
        loader: 'transform-loader?brfs',
        enforce: 'post',
      },
      {
        test: /unicode-properties[/\\]index.js$/,
        loader: 'transform-loader?brfs',
        enforce: 'post',
      },
      {
        test: /linebreak[/\\]src[/\\]linebreaker.js/,
        loader: 'transform-loader?brfs',
        enforce: 'post',
      },
    ],
  },
}
```

### Reading font as buffer

Fontkit provides 3 methods for loading a font. However, the `fontkit.open` and `fontkit.openSync` methods depend on `fs` module, which is only available in Node.js. In the browser, the only option left is `fontkit.create`, which expects a buffer.

Assume the font file is a webfont, and can be loaded using `fetch` API. The `fetch` API can parse what's being fetched as a blob, not as a buffer though.

> Silly browser. How do you convert it to a Buffer?

> Something with a goofy FileReader thingy... Time to Google for it yet again... There must be a better way!

Yes. Let's turn to [blob-to-buffer](https://www.npmjs.com/package/blob-to-buffer) module. And here's all the code that you need.

```js
import fontkit from 'fontkit';
import blobToBuffer from 'blob-to-buffer';

fetch('your_webfont_url')
.then(res => res.blob())
.then(blob => {
  blobToBuffer(blob, (err, buffer) => {
    if (err) {throw err;}
    const font = fontkit.create(buffer);
    const glyph = font.glyphForCodePoint('D'.charCodeAt(0));
    const d = glyph.path.toSVG();
    // do something with the glyph or its SVG path string
  });
});
```

## Converting glyph data

The next step is to convert the glyph data returned by fonkit to the format used by lottie-web.

Time to investigate the glyph data format exported by bodymovin from After Effects.

### `chars` array in a lottie file

There's a setting named "Glyphs" in bodymovin extension. Tick that and hit render, the generated lottie file will have an array of glyphs converted from all the characters used in the After Effects composition.

I've made a very simple lottie file, with only 1 character and nothing else. The character is "D" using Noto Sans CJK SC Bold font. Here's an excerpt.

```js
{
  "chars": [
    {
      "ch": "D",
      "size": 60,
      "fFamily": "Noto Sans CJK SC",
      "style": "Bold",
      "w": 71.4,
      "data": {
        "shapes": [
          {
            "ty": "gr",
            "it": [],
            "nm": "D",
            "np": 5,
            "cix": 2,
            "bm": 0,
            "ix": 1,
            "mn": "ADBE Vector Group",
            "hd": false
          }
        ]
      }
    }
  ]
}
```

- `ch` is the character;
- `size` doesn't matter and doesn't influence client side rendering. If you have 2 same characters in the composition, but of different sizes, there'll be only 1 item of that character in the output;
- `fFamily` and `style` do matter, since different fonts render differently. If you type a letter "D" using Noto Sans CJK SC Bold and another letter "D" using Noto Sans CJK SC Regular, there'll be 2 items of character "D" in the output;
- `w` is the width of the character rendered at 100px;
- Unless `ch` is ` ` (space character), which yields empty `data` (`{data: {}}`), this property is always an object containing and only containing a `shapes` property;
  - `shapes` is an array containing only one item, which is a group description object;
    - since this is a group object, `ty` is `gr`, meaning of group type;
    - `it` is the character glyph data, which we'll explore shortly;
    - `nm` is the layer name, usually it's the same as the character;
    - I don't really know what `np`, `cix`, and `ix` are, but it looks like that `cix` is always `2`, `ix` is always `1`, `np` is `it.length + 3` if `it.length > 1`, and it is `3` if `it.length === 1`;
    - `mn` is `ADBE Vector Group`;
    - `hd` means hidden, just make it `false` since what we're doing in this article is going to display the character, right?

### The `it` array of a character

The `it` array contains all the path data of a character.

![path items](https://img.alicdn.com/tfs/TB11VX0mQL0gK0jSZFtXXXQCXXa-1154-616.png)

If the character is very simple, like Latin letter `C`, `it` array will only have 1 path item; if the character is a bit more complicated, like Chinese character `中`, `it` array will contain 3 path items.

In my demo, character `D` has 2 path items.

```js
{
  "it": [
    {
      "ind": 0,
      "ix": 1,
      "ks": { "a": 0, "k": {}, "ix": 2 },
      "ty": "sh",
      "nm": "D",
      "mn": "ADBE Vector Shape - Group",
      "hd": false,
    },
    {
      "ind": 1,
      "ix": 2,
      "ks": { "a": 0, "k": {}, "ix": 2 },
      "ty": "sh",
      "nm": "D",
      "mn": "ADBE Vector Shape - Group",
      "hd": false,
    }
  ]
}
```

For each item,

- `ind` is the index, should be the same with the item path's index in the array;
- `ix` means property index according to the documentation, seems like that it equals to `ind + 1`;
- `ks` is the path data itself, which we'll discuss next;
- `ty`, `nm`, `mn`, and `hd` are pretty straightforward, some of which are explained before.

The vertices of the path are stored in `ks` object.

- Since this is the static glyph description, it doesn't have any animation, the `a` (animated) property should always be `0`;
- the `ks.ix` property is the property index, I'm not sure about this, but I guess it's 2 in all cases;
- `k` property is the cubic bezier curve data, which is the key part of the whole discussion. So it's worth its own section.

### Cubic Bézier curve in lottie files

As I mentioned before, there's a `w` property describing the character's width when rendered at 100px. All points in `it[i].ks.k` property are coordinates of the glyph's vertices relative to 100px, too. I'd like to point out that what we are going to discuss not only apply to characters' data, but also applicable to all `{"ty": "sh"}` shapes.

![vertices of shape explained in lottie files](https://img.alicdn.com/tfs/TB1dyGwnYr1gK0jSZR0XXbP8XXa-1920-1080.png)

It's too complicated to express in words. So I made this image, which shows how the data are used to render character "D" of font "Noto Sans CJK SC Bold". The data in the image are `it[0].ks.k` and `it[1].ks.k`. Please pay attention to the coordinate system, positive x to the right, positive y to the bottom. The coordinates of control points start with `@`, which are relative to their corresponding anchor points.

![vertices of a character](https://img.alicdn.com/tfs/TB1y6t5mRr0gK0jSZFnXXbRRXXa-1920-1080.png)

When you draw cubic Bézier curve in SVG, using `C` or `c` command of `<path />` tag's `d` property, the relativity of the coordinates is either to the SVG document's origin or to the previous anchor point. Apparently, lottie file takes neither way. The image above shows how the coordinate transformation is done between vertices from lottie file and vertices in a `C` command of SVG `<path />`.

BTW, if you need a refresher on SVG `<path />` tag's drawing commands, I recommend [this article](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) from MDN.

### The final glue

Until now, we can get a glyph's SVG path data using fontkit, and also know the relations between an SVG path and the glyph's vertices in lottie file. There're two more problems we need to tackle. Let's juxtapose both path data of the character "D".

![cubic and quadratic Bézier curves](https://img.alicdn.com/tfs/TB1GuV4mHH1gK0jSZFwXXc7aXXa-1766-659.png)

1. The SVG path string returned by fontkit is a quadratic Bézier curve, whereas the SVG path we converted from lottie file is a cubic Bézier curve;
2. The coordinate systems are somewhat different.

Luckily, a quadratic Bézier curve can be converted to a cubic Bézier curve without being noticed any loss in details.

I'm not going to dive into this process here, you can read [this article](https://codepen.io/enxaneta/post/quadratic-to-cubic-b-zier-in-svg) from codepen. In my code archive, I'm using Adobe's [snap.svg](https://github.com/adobe-webplatform/Snap.svg) library to do this.

![vertices in 2 forms](https://img.alicdn.com/tfs/TB17hV5mG61gK0jSZFlXXXDKFXa-1000-1000.png)

As for the coordinate system, let me draw the two paths in one graph as shown above. The vertices of the SVG path got from fontkit is based on the font's `unitsPerEm` property. And it is vertically flipped comparing to the one from lottie file. After invoking `const font = fontkit.create(fontBuffer)`, you can access the font's `unitsPerEm` using `font.unitsPerEm`, which is a number. Lots of fonts are designed at 1000px, some at 1024px, and there may also be other values. Let `s = 100 / font.unitsPerEm`, we can convert points of fontkit's SVG path to lottie files' using the following equation.

![transformation from fontkit's coordinate system to lottie file's](https://img.alicdn.com/tfs/TB17ALsl1bviK0jSZFNXXaApXXa-1042-244.png)

## Putting it together

Now we know everything about the relations between a glyph's SVG string got from fontkit and the glyph's path items in a lottie file. We can generate lottie glyph data while the user is typing in the browser.

1. Load the font using fontkit;
2. Listen for the keydown event;
3. When user types a character, get the glyph's SVG path string using `fontkitGlyph.path.toSVG()` method;
4. Convert the quadratic Bézier curve from Step 3 to a cuvic Bézier curve;
5. Transform the coordinate system using the equation from the previous section;
6. Turn the SVG string to lottie shape's data structure;
7. Make a new character object and push it to `lottieFileData.chars` array;
8. Add the character data to lottie canvas renderer using `renderer.globalData.fontManager.addChars([newCharacterObject])`;
9. Rerender the current frame.

There's a gotcha in Step 8 though. The coordinates of all anchor points of the curve in a lottie file are relative to the corresponding anchor points. But the method I mentioned in this step expects all coordinates relative to the origin. Recall the second image in "Cubic Bézier curve in lottie files" section, it expects the data on the rightmost side.

## Wrapping up

I hope this article helps you solve the `"Missing character from exported characters list"` problem if you are using lottie canvas renderer and can't export all glyphs from AE. Feel free to download the code and play with it. Let me know if you have any questions or better ideas. Have fun with the amazing lottie-web library.
