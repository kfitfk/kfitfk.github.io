---
layout: post
title: Creating Color Pickers
category: programming
poster: https://img.alicdn.com/tps/TB1sLsKLVXXXXasXpXXXXXXXXXX-1200-250.jpg
summary: Describes how to create color pickers using CSS and Canvas. I'll cover several forms. 1. The HSV color picker with 3 sliders; 2. A color pool showing S and V with an extra H strip; 3. RGB color wheel using Canvas; 4. RYB color wheel like the one you see in Illustrator's recolor artwork dialog box.
customjs:
 - http://assets.codepen.io/assets/embed/ei.js
---

## Intro

这篇文章展示 4 种不同类型的色彩选择器，主要讲怎么用 CSS 或者 Canvas 去渲染，以及如何确定颜色值。具体的鼠标交互逻辑代码太长了，而且基本都是在 `mousedown`，`mousemove`，和 `mouseup` 里面做一些边界判断和重新渲染，所以这部分内容就省略了。

以下 Demo 演示用的颜色是 `#8CC63F`，即 `rgb(140, 198, 63)` 或 `hsv(86, 0.68, 0.78)` 或 `hsl(86, 0.54, 0.51)`。所有 Demo 仅包含视觉展现，不带鼠标交互。

## Converting colors

因为浏览器支持的没有 HSV/HSB，只有 HSL，而我自己的习惯是 HSV，所以这里的转换方法是 RGB 和 HSV 的。网上搜索一大堆资料，放在这里只是方便我自己以后复制粘贴。

有两点需要说明：

1. 颜色的转换是不精确的，从 RGB 转到 HSV 再转回来，可能因为精度以及取整的原因，会有一点点偏差，但人眼肯定是区分不出来的；
2. 黑白灰转成 HSV 之后，H 值均为 0。若进行了彩色－黑白－彩色的颜色选择，可能要自行记录一下 H 值。

{% highlight javascript linenos %}
// color 参数是一个长度为 6 的 HEX 格式颜色字符串
// 返回的结果里，r, g, b 的区间是 [0, 255]
function hexToRgb(color) {
  color = parseInt(color, 16)
  return { r: color >> 16, g: (color >> 8) & 255, b: color & 255 }
}

// r, g, b 参数的区间是 [0, 255]
// 返回的结果里，h 的区间是 [0, 360)，s 和 v 的区间是 [0, 1]
function rgbToHsv(r, g, b) {
  r = r/255
  g = g/255
  b = b/255

  var max = Math.max(r, g, b), min = Math.min(r, g, b)
  var h, s, v = max
  var d = max - min
  s = max === 0 ? 0 : d / max

  if (max == min) {
    h = 0 // achromatic
  }
  else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6 // Range of this h value: [0, 1)
  }

  return { h: h * 360, s: s, v: v }
}

// h 参数会原样返回；s 和 v 参数的区间是 [0, 1]
// 返回的结果里，h 的区间同入参，s 和 l 的区间是 [0, 1]
function hsvToHsl(h, s, v) {
  var l = (2 - s) * v / 2

  if (l != 0) {
    if (l == 1) {
      s = 0
    } else if (l < 0.5) {
      s = s * v / (l * 2)
    } else {
      s = s * v / (2 - l * 2)
    }
  }

  return { h: h, s: s, l: l }
}

// h 参数的区间是 [0, 360)，s, v 参数的区间是 [0, 1]
// 返回的结果里，r, g, b 的区间是 [0, 255]
function hsvToRgb(h, s, v) {
  h = h / 360 * 6

  var i = Math.floor(h),
      f = h - i,
      p = v * (1 - s),
      q = v * (1 - f * s),
      t = v * (1 - (1 - f) * s),
      mod = i % 6,
      r = [v, q, p, p, t, v][mod],
      g = [t, v, v, q, p, p][mod],
      b = [p, p, t, v, v, q][mod]

  return { r: r * 255, g: g * 255, b: b * 255 }
}

// r, g, b 参数的区间是 [0, 255]
// 返回的结果是一个长度为 6 的 HEX 格式颜色字符串
function rgbToHex(r, g, b) {
  return ('0' + r.toString(16)).substr(-2) +
    ('0' + g.toString(16)).substr(-2) +
    ('0' + b.toString(16)).substr(-2)
}
{% endhighlight %}

## The color pickers

### HSV color picker using 3 sliders

使用 3 个色条分别表现 H，S，和 V 值。下面的描述是基于 CSS 渐变的实现。

H 色条需要使用一个定义若干个停靠色的线性渐变。例如，将 360 度的色轮分成 25 段，定义 26 个停靠色，对应的 H 值依次为 0, 14.4, 28.8, 43.2, 57.6, 72, 86.4, 100.8, 115.2, 129.6, 144, 158.4, 172.8, 187.2, 201.6, 216, 230.4, 244.8, 259.2, 273.6, 288, 302.4, 316.8, 331.2, 345.6, 360；而 S(in HSL) 和 L 值根据当前选中的 S(in HSV) 和 V 值计算得到。

S 色条使用头尾两个停靠色的线性渐变。已知当前颜色的 H 和 V 值，则

{% highlight javascript linenos %}
var rgb0 = hsvToRgb(h, 0, v)
var rgb1 = hsvToRgb(h, 1, v)
var hex0 = rgbToHex(rgb0.r, rgb0.g, rgb0.b)
var hex1 = rgbToHex(rgb1.r, rgb1.g, rgb1.b)
{% endhighlight %}

S 色条的头尾两个停靠色分别为 `hex0` 和 `hex1`。

V 色条也使用头尾两个停靠色的线性渐变。0% 位置的停靠色永远为黑色，即 `#000000`；已知当前颜色的 H 和 S(in HSV) 值，则通过 `hsl = hsvToHsl(h, sInHsv, 1)` 得到 100% 位置的停靠色为 `hsl(h, hsl.s, hsl.l)`。

在实现鼠标交互的时候，其中一个色条的值变化后，另外两个色条需要重新渲染。

<p data-height="268" data-theme-id="22822" data-slug-hash="NNdzQx" data-default-tab="result" data-user="yehao" class="codepen">See the Pen <a href="http://codepen.io/yehao/pen/NNdzQx/">NNdzQx</a> by Ye Hao (<a href="http://codepen.io/yehao">@yehao</a>) on <a href="http://codepen.io">CodePen</a>.</p>

### HSV color picker using hue strip

使用一个横坐标为 S，纵坐标为 V 的坐标系的第一象限来表现 S 和 V 值，以及一个色条来表现 H 值，类似 Photoshop Color Picker 的默认形式。下面描述是基于 CSS 渐变的实现。

H 色条的渲染同上一节。之前的 Demo 是从左往右的渐变，这个 Demo 使用从下往上的渐变。

SV 组成的颜色池，可以简单地使用两个渐变，让 CSS 透明帮我们自动融合色彩效果。两个渐变各自包含头尾两个停靠色。下层为左往右水平向渐变，0% 位置的停靠色永远为白色，即 `#FFFFFF`；已知当前颜色的 H 值，100% 位置的停靠色为 `hsl(h, 100%, 50%)`。上层为上往下竖直向渐变，0% 位置的停靠色是完全透明的黑色，即 `rgba(0, 0, 0, 0)`；100% 位置的停靠色为不透明的黑色，即 `#000000`。

下层渐变需要在 H 值改变的时候重新渲染，上层渐变永远不变。

<p data-height="268" data-theme-id="22822" data-slug-hash="RaKBZw" data-default-tab="result" data-user="yehao" class="codepen">See the Pen <a href="http://codepen.io/yehao/pen/RaKBZw/">RaKBZw</a> by Ye Hao (<a href="http://codepen.io/yehao">@yehao</a>) on <a href="http://codepen.io">CodePen</a>.</p>

### RGB color wheel

RGB 色轮和上一节的颜色池加色条的方式是类似的，只不过色轮上体现的两个元素是 H 和 S，V 值使用额外的一个色条来展现。

因为 CSS 没有类似 Photoshop 里 Angle Gradient 的选项，下面的描述是基于 Canvas 的实现。

完整色轮为 360 度，这里以 1 度为单位，用 `for` 循环进行渲染。每一个单位图形都是一个 `arc`，其填充色为径向渐变。已知本单位图形的 H 和 V 值，则通过 `hsl0 = hsvToHsl(h, 0, v)` 和 `hsl1 = hsvToHsl(h, 1, v)` 分别得到 0% 位置的停靠色为 `hsl(h, hsl0.s, hsl0.l)`，100% 位置的停靠色为 `hsl(h, hsl1.s, hsl1.l)`。

在示例中，渲染每一个单位图形的时候，由于 `arc` 方法渲染的原因，使用了 2 度来渲染一个单位，让后面渲染的单位图形盖住前面渲染的单位图形的一半，来达到预期的效果。

<p data-height="268" data-theme-id="22822" data-slug-hash="BKpPxQ" data-default-tab="result" data-user="yehao" class="codepen">See the Pen <a href="http://codepen.io/yehao/pen/BKpPxQ/">RGB Color Wheel</a> by Ye Hao (<a href="http://codepen.io/yehao">@yehao</a>) on <a href="http://codepen.io">CodePen</a>.</p>

### RYB color wheel

RYB(Red, Yellow, Blue) 色轮的渲染和 RGB 色轮的原理是一样的。不过 RYB 颜色的分布不是均匀的，我们通过下面这个近似的关系来映射度数。这个结果比较接近 LAB 色轮。

{% highlight javascript linenos %}
// Left column - RYB hue; right column: RGB hue.
var wheel = [
    0,   0,
   15,   8,
   30,  17,
   45,  26,
   60,  34,
   75,  41,
   90,  48,
  105,  54,
  120,  60,
  135,  81,
  150, 103,
  165, 123,
  180, 138,
  195, 155,
  210, 171,
  225, 187,
  240, 204,
  255, 219,
  270, 234,
  285, 251,
  300, 267,
  315, 282,
  330, 298,
  345, 329,
  360, 360
]

function rgbHueOf(rybHue) {
  var x0, y0, x1, y1
  for (var i = 0; i < wheel.length - 2; i += 2) {
    x0 = wheel[i]
    y0 = wheel[i+1]
    x1 = wheel[i+2]
    y1 = wheel[i+3]

    if (rybHue <= x1 && rybHue >= x0) {
      return y0 + (y1 - y0) * (rybHue - x0) / (x1 - x0)
    }
  }
}

function rybHueOf(rgbHue) {
  var x0, y0, x1, y1
  for (var i = 0; i < wheel.length - 2; i += 2) {
    x0 = wheel[i]
    y0 = wheel[i+1]
    x1 = wheel[i+2]
    y1 = wheel[i+3]

    if (rgbHue <= y1 && rgbHue >= y0) {
      return x0 + (x1 - x0) * (rgbHue - y0) / (y1 - y0)
    }
  }
}
{% endhighlight %}

<p data-height="268" data-theme-id="22822" data-slug-hash="bpgxaK" data-default-tab="result" data-user="yehao" class="codepen">See the Pen <a href="http://codepen.io/yehao/pen/bpgxaK/">RYB Color Wheel</a> by Ye Hao (<a href="http://codepen.io/yehao">@yehao</a>) on <a href="http://codepen.io">CodePen</a>.</p>

## Wrap up

以上就是用 CSS 或者 Canvas 渲染颜色选择器界面的一些方式。以后有时间再简单介绍一下在 Photoshop 或者 Illustrator 里这两个软件里的绘制吧。
