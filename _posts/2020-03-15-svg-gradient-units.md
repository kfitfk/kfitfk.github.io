---
layout: post
title: SVG Gradient Units
category: programming
poster: https://img.alicdn.com/tfs/TB1fhwQyeH2gK0jSZJnXXaT1FXa-2400-500.jpg
summary: This article talks about the 2 unit systems used in SVG gradient, objectBoundingBox and userSpaceOnUse and how to convert from one to another.
---

## Intro

SVG 渐变有两种单位模式，`objectBoundingBox` 和 `userSpaceOnUse`，可通过在 `<linearGradient>` 或 `<radialGradient>` 标签的 `gradientUnits` 属性来指定。若不配置该属性，则默认单位为 `objectBoundingBox`。

在日常工作中，我们很少会自己写 SVG 代码来创建 SVG 图形，通常都是通过 Inkscape、Adobe Illustrator 或者 Sketch 等图形制作软件来创建或导出 SVG。Sketch 导出的 SVG 会用默认的单位，而 Illustrator 则使用 `userSpaceOnUse`。

我们先来看看这两种单位的区别。

## userSpaceOnUse

指定 `gradientUnits="userSpaceOnUse"`，渐变的属性值可以是绝对数值，也可以是百分比表示的相对数值。

```xml
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 500 200" width="500" height="200">
<linearGradient id="lg1" x1="10%" y1="0" x2="200" y2="80%" gradientUnits="userSpaceOnUse">
  <stop stop-color="orange" offset="0"/>
  <stop stop-color="blue" offset="1"/>
</linearGradient>
<rect x="50" y="50" width="200" height="100" fill="url(#lg1)" />
</svg>
```

以上面这段 SVG 为例，当前视口的尺寸为 500x200，则渐变的 `x1="10%"` 与 `x1=50` 等价，因为 500px 视口宽度的 10% 是 50px；而渐变的 `y2="80%"` 与 `y=160` 等价，因为 200px 视口高度的 80% 为 160px。

这个渐变的完整效果，就是在 500x200 的画布上，在 (50, 0) 处配置停靠色为橘色，在 (200, 160) 处配置停靠色为蓝色，两个点相连形成一个线性渐变。

定义好渐变后，还需引用之才可展现。而 `<rect>` 形状的属性配置，则表示展现该渐变从 (50, 50) 到 (200+50, 100+50)，即 (250, 150) 所构成的矩形框内的色彩。

![userSpaceOnUse example](https://img.alicdn.com/tfs/TB1G.QGyaL7gK0jSZFBXXXZZpXa-1120-250.jpg)

此时保持 `<linearGradient>` 定义和 `<rect>` 的尺寸不变，改变 `<rect>` 的 `x` 和 `y` 坐标，则渐变渲染结果会跟着 `<rect>` 位置的移动而改变。

### Percentage on radius

对于 `userSpaceOnUse` 场景下的相对数值表示，要补充一点。对线性渐变来说，`x1` 和 `x2` 的相对值要乘以宽度，`y1` 和 `y2` 的相对值要乘以高度，这很直观；而径向渐变除了 `cx` 和 `fx` 对应宽度，`cy` 和 `fy` 对应高度外，还有个 `r` 半径并不直接与宽或高相关。若 `r` 使用了百分数，则渲染绝对值为 `r * sqrt(w * w + h * h) / sqrt(2)`。

例如，在刚才的 SVG 中若定义了如下径向渐变：

```xml
<radialGradient id="rg1" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
  <stop stop-color="orange" offset="0"/>
  <stop stop-color="blue" offset="1"/>
</radialGradient>
```

则实际渲染的 `r` 值为 `50% * sqrt(500 * 500 + 200 * 200) / sqrt(2) ≈ 190.394`。

## objectBoundingBox

忽略 `gradientUnits` 属性或指定 `gradientUnits="objectBoundingBox"`，渐变的属性值则为相对数值，且相对应用了该渐变的元素的外接矩形。

```xml
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 300 300" width="300" height="300">
<linearGradient id="lg1" x1="0.1" y1="0" x2="0.9" y2="1">
  <stop stop-color="orange" offset="0"/>
  <stop stop-color="blue" offset="1"/>
</linearGradient>
<rect x="50" y="50" width="200" height="200" fill="url(#lg1)" />
</svg>
```

以上面这段视口尺寸为 300x300 的 SVG 为例，渐变的定义中没有配置 `gradientUnits` 属性，故其属性值的渲染结果与应用该渐变的 `<rect>` 有关。这是一个左上角点位于 (50,50) 且边长为 200 的正方形。故渐变的 `x1="0.1"` 与 `x1=70` 等价，因为边长为 200 的正方形的外接矩形就是它自己，加上左上角 50px 偏移量，可得 `x1 = 0.1 * 200 + 50 = 70`。同理将其他属性转为绝对值，可得 `x2=230`，`y1=50`，`y2=250`。故本例 `<rect>` 上的渐变效果等同于使用了下面这个渐变：

```xml
<linearGradient id="lg2" x1="70" y1="50" x2="230" y2="250" gradientUnits="userSpaceOnUse">
  <stop stop-color="orange" offset="0"/>
  <stop stop-color="blue" offset="1"/>
</linearGradient>
```

此时保持 `<linearGradient>` 定义和 `<rect>` 的尺寸不变，改变 `<rect>` 的 `x` 和 `y` 坐标，不管 `<rect>` 移动到哪，渐变的渲染结果总是一样的。

![objectBoundingBox example](https://img.alicdn.com/tfs/TB1G3APybY1gK0jSZTEXXXDQVXa-930-350.jpg)

## The relations

你可能注意到在 `objectBoundingBox` 这一节的例子中，我特地把 `<rect>` 换成了一个正方形来做解释。事实上那段解释是不完善的。倘若它是完全准确的，那么下面这两段 SVG 的渲染结果应该完全一致，但实际并非如此。

```xml
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 200 100" width="200" height="100">
<linearGradient id="lg1" x1="0" y1="0" x2="200" y2="100" gradientUnits="userSpaceOnUse">
  <stop stop-color="orange" offset="0"/>
  <stop stop-color="blue" offset="1"/>
</linearGradient>
<rect x="0" y="0" width="200" height="100" fill="url(#lg1)" />
</svg>
```

```xml
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 200 100" width="200" height="100">
<linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
  <stop stop-color="orange" offset="0"/>
  <stop stop-color="blue" offset="1"/>
</linearGradient>
<rect x="0" y="0" width="200" height="100" fill="url(#lg1)" />
</svg>
```

![actual rendering of the above 2 SVG files](https://img.alicdn.com/tfs/TB1hwUPybj1gK0jSZFOXXc7GpXa-430-140.jpg)

[MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/gradientUnits) 在线性渐变用 `objectBoundingBox` 为单位的说明中，有这么一段话：

> When the object's bounding box is not square, the gradient normal which is initially perpendicular to the gradient vector within object bounding box space may render non-perpendicular relative to the gradient vector in user space.

在上面这两个例子中，`gradientUnits="userSpaceOnUse"` 的渲染，类似于先绘制一个 200x100 的矩形，然后从 (0, 0) 到 (200, 100) 绘制了一个线性渐变；而没有配置 `gradientUnits` 的渲染，则类似于先绘制一个 100x100 的矩形，然后从 (0, 0) 到 (100, 100) 绘制了一个线性渐变，再把这个矩形拉伸缩放为 200x100，此时渐变跟着被非等比缩放了。

因此这里若把 `gradientUnits="userSpaceOnUse"` 的渐变属性改为下面这样，两者效果就等价了。

```xml
<linearGradient id="lg1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse" gradientTransform="translate(0, 0) scale(2, 1) translate(-0, -0)">
```

## From objectBoundingBox to userSpaceOnUse

最后我们再以径向渐变举个例子，来说明如何从 `objectBoundingBox` 转为 `userSpaceOnUse`。

![radial gradient drawn in Sketch](https://img.alicdn.com/tfs/TB1pAoLyoY1gK0jSZFMXXaWcVXa-1182-490.jpg)

如上图所示，我在 Sketch 中创建一块 300x200 的画板，绘制一个矩形，旋转 15°，填充一个径向渐变，并导出为 SVG，可得如下代码（已简化）：

```xml
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 300 200" width="300" height="200">
<radialGradient cx="50%" cy="50%" fx="50%" fy="50%" r="76.789%" gradientTransform="translate(0.5,0.5),scale(0.5,1.0),rotate(90.0),scale(1.0,1.943),translate(-0.5,-0.5)" id="rg1">
  <stop stop-color="#FFA500" offset="0%"></stop>
  <stop stop-color="#0000FF" offset="100%"></stop>
</radialGradient>
<rect fill="url(#rg1)" transform="translate(150.0, 100.0) rotate(15.0) translate(-150.0, -100.0)" x="50" y="50" width="200" height="100" />
</svg>
```

填充渐变的 `<rect>` 虽有旋转，但转换渐变单位时无需考虑，故该 `<rect>` 的外接矩形依然是左上角点位于 (50, 50) 且尺寸为 200x100 的矩形。那么，径向渐变的各个属性值的渲染绝对值为：

- cx = 50% * 200 + 50 = 150
- cy = 50% * 100 + 50 = 100
- fx = 50% * 200 + 50 = 150
- fy = 50% * 100 + 50 = 100
- r = 76.789% * MIN(200, 100) = 76.789

由于该矩形并非正方形，刚才计算 `r` 时乘以较小的边长，还需用 `gradientTransform` 不等比水平拉伸 MAX(200, 100) / MIN(200, 100) = 2 倍，即拉伸所需 `gradientTransform="translate(cx, cy) scale(2, 1) translate(-cx, -cy)"`。刚才已经算得 `cx=150`，`cy=100`。

由于该径向渐变自身已经有 `gradientTransform` 属性，在单位转换时，还需把它原有的 `gradientTransform` 中的 `translate` 转为绝对值。若 `rotate` 使用了 3 个参数的形式（即配置了基准点，本例未出现），还要把旋转基准点也转为绝对坐标。

于是，`translate(0.5,0.5)` 的第一个 `0.5` 要转换成 `0.5 * 200 + 50 = 150`，第二个 `0.5` 要转成 `0.5 * 100 + 50 = 100`。

因此，这里 `gradientTransform` 的值最终应转成

```
translate(150, 100) scale(2, 1) translate(-150, -100)
translate(150, 100) scale(0.5,1.0),rotate(90.0),scale(1.0,1.943),translate(-150, -100)
```

当然我们可以把它们合并为用一个转换矩阵来表示：

```
matrix(0, 1, -1.9433, 0, 344.3344, -50)
```

以下是 `<radialGradient>` 转成 `userSpaceOnUse` 后的 SVG 代码：

```xml
<radialGradient
  cx="150" cy="100"
  fx="150" fy="100"
  r="76.789"
  gradientTransform="matrix(0, 1, -1.9433, 0, 344.3344, -50)"
  id="rg1"
  gradientUnits="userSpaceOnUse">
```

## Wrapping up

对于开发者来说，`gradientUnits` 提供了不同场景下单位选择的灵活性。合适的单位能降低数学计算的复杂度，也对某些渐变复用场景提供便利性。

从项目应用的角度看，若要把 SVG 转为 Canvas 等技术来渲染，则多少会遇到本文描述的单位转换问题。两种单位系统没有好坏之分，了解他们之间的关系，亦可让某些特定场景下的渐变处理变得更为简单。

## References

- [Coordinate Systems, Transformations and Units](https://dev.w3.org/SVG/profiles/1.1F2/master/coords.html#ObjectBoundingBoxUnits)
- [GradientUnits MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/gradientUnits)
