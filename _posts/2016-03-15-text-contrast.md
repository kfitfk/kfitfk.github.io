---
layout: post
title: Better Text Contrast
category: programming
poster: https://img.alicdn.com/tps/TB1Wbf7LVXXXXcsXpXXXXXXXXXX-1200-250.jpg
summary: Describes whether to use light text or dark text given a background color, making text more readable.
customjs:
 - http://assets.codepen.io/assets/embed/ei.js
---

最近做一些色彩有关的事情，找了很多有关的文章，打算分几篇整理一下。

## The purpose

这篇文章很短，主要是说在一个给定的背景上，该使用亮色还是暗色文本。

## The Specification

这是有现成[规范](https://www.w3.org/TR/WCAG20/)的。在规范的 [contrast ratio](https://www.w3.org/TR/WCAG20/#contrast-ratiodef) 一节，叙述了具体的对比度计算公式；并在 [1.4.3](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast) 一节，对计算结果给出了判断参考。

> **对比度（最小）**：文本的视觉呈现以及文本图像至少要有 4.5:1 的对比度，以下部分除外：（AA级）
>
> - **大文本**：大号文本以及大文本图像至少有 3:1 的对比度;
> - **附属内容**：文本或文本图像是未激活的用户界面组件部分，或者只是一个纯粹的装饰，或者对任何人不可见，或者只是包含其他重要可视内容的图片一部分，此文本或文本图像没有对比要求。
> - **商标**：文本作为标志或品牌名称的一部分，没有最低对比要求。

### The formular

> 对比度 (L1 + 0.05) / (L2 + 0.05)，其中
>
> - L1是浅色的相对亮度 ，并且
> - L2是深色的相对亮度。

> **相对亮度**
>
> 色彩空间里任何一点的相对明度 (Relative Brightness)，标准化为 0 的是深黑色，为 1 的是亮白色
> 注 1: 对于 sRGB 色彩空间，色彩的相对亮度是指定义 L = 0.2126 \* R + 0.7152 \* G + 0.0722 \* B，其中 R，G 和 B 的定义为：

> - 如果 R<sub>sRGB</sub> <= 0.03928，则 R = R<sub>sRGB</sub>/12.92，否则 R = ((R<sub>sRGB</sub>+0.055)/1.055) ^ 2.4
> - 如果 G<sub>sRGB</sub> <= 0.03928，则 G = G<sub>sRGB</sub>/12.92，否则 G = ((G<sub>sRGB</sub>+0.055)/1.055) ^ 2.4
> - 如果 B<sub>sRGB</sub> <= 0.03928，则 B = B<sub>sRGB</sub>/12.92，否则 B = ((B<sub>sRGB</sub>+0.055)/1.055) ^ 2.4
>
> 并且 R<sub>sRGB</sub>，G<sub>sRGB</sub> 和 B<sub>sRGB</sub> 定义如下：
>
> - R<sub>sRGB</sub> = R<sub>8bit</sub>/255
> - G<sub>sRGB</sub> = G<sub>8bit</sub>/255
> - B<sub>sRGB</sub> = B<sub>8bit</sub>/255

## Simplified Application

我在项目里需要考虑在任意背景上，是使用白色文本还是黑色文本。于是用了更加简化的公式。

```js
function luminosityContrastWithWhite(r, g, b) {
  var luminance = 0.2126 * Math.pow(r/255, 2.2) + 0.7152 * Math.pow(g/255, 2.2) + 0.0722 * Math.pow(b/255, 2.2)
  return 1.05 / (luminance + 0.05)
}
```

上述方法的参数区间为 [0, 255]。

可能是我自己对于颜色的感觉比较敏感，在对比度不满足规范的某些情况下，我仍然偏好某些搭配。因此应用上述公式之后，我选择结果小于 2 时才使用黑色文本，其他情况均使用白色文本。

```js
if (luminosityContrastWithWhite(235, 116, 116) < 2) {
  // use black text
}
else {
  // use white text
}
```

<p data-height="119" data-theme-id="0" data-slug-hash="MybbBv" data-default-tab="result" data-user="yehao" class="codepen">See the Pen <a href="http://codepen.io/yehao/pen/MybbBv/">MybbBv</a> by Ye Hao (<a href="http://codepen.io/yehao">@yehao</a>) on <a href="http://codepen.io">CodePen</a>.</p>
