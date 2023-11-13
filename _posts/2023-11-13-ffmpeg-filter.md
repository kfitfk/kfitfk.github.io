---
layout: post
title: Cropping video using ffmpeg
category: programming
poster: https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/fc755f00-8202-11ee-bdcf-159280ce0971.jpg
summary: Recently I used ffmpeg command line tool to crop video, add blurry background, and convert webm to gif, using some complex filter combinations. Here's the notes.
---

最近做的需求里有视频的快速裁切，和 webm 转 gif，用到了 ffmpeg 的一些滤镜操作。ffmpeg 的滤镜是通过 libavfilter 库实现的，它可以对多个输入和多个输出做一系列的操作，产出最终的视频。下面记录几个我在工作中使用的滤镜指令。

## 视频裁切

一个完整的 ffmpeg 裁剪命令类似这样：

`ffmpeg -i input.mp4 -vf "crop=986:800:2:0,scale=759:-1,pad=767:1024:0:204" -n output.mp4`

这里都使用了缩写的形式。这个滤镜的意思是把源素材 (2, 0) 这个点右下方 986x800 区域的像素，等比缩放到宽为 759 像素（此时高约为 616 像素），最终输出一个 767x1024 尺寸的视频，把缩放后的素材左上角点置于 (0, 204) 这个位置，并用黑色补足剩余像素。

在 ffmpeg 里，可以使用 [crop](https://ffmpeg.org/ffmpeg-filters.html#crop) 来截取输入视频素材的某个区域，通过 [scale](https://ffmpeg.org/ffmpeg-filters.html#scale-1) 放大到所需的尺寸，再用 [pad](https://ffmpeg.org/ffmpeg-filters.html#pad-1) 把缩放后的画面放到目标区域的某个位置，并将多余区域用某个颜色补足。

![ffmpeg crop/scale/pad filters](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/7030d450-81eb-11ee-9d4e-c3a96c17c06f.jpg)

下面定义这个过程的一些输入变量，来生成裁剪的滤镜指令。

### crop

假设目标尺寸的宽和高分别为 `mw` 和 `mh`，原素材的锚点为 `(ax, ay)`，素材锚点相对目标区域的坐标为 `(x, y)`，素材相对锚点的缩放值为 `s`。

![defining variables](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/6fd742a0-81eb-11ee-87d0-85b758d2d134.jpg)

源素材上的任意一个点 `(x0, y0)`，在缩放并移动之后，于目标尺寸坐标系下的坐标 `(x1, y1)` 为

```js
function pointInOutputCoord(x0, y0) {
  const x1 = x0 * s - ax * s + x;
  const y1 = y0 * s - ay * s + y;
  return [x1, y1];
}
```

相应地，目标尺寸坐标系下的坐标 `(x1, y1)` 在源素材坐标系下的值 (x0, y0) 即为

```js
function pointInObjectCoord(x1, y1) {
  const x0 = x1 / s - x / s + ax;
  const y0 = y1 / s - y / s + ay;
  return [x0, y0];
}
```

首先要找到素材与目标尺寸相交的左上角点和右下角点。源素材在未应用任何变换矩阵时，它的左上角点为 `(0, 0)`，右下角点为 `(m, w)`。代入上述等式后，可算出这两个点在目标尺寸下的坐标

```js
const topLeft = pointInOutputCoord(0, 0);
const bottomRight = pointInOutputCoord(w, h);
```

若素材左上角点和右下角点的某个坐标值超出容器范围，要计算出素材与容器相交的点在源素材坐标系上的值。

```js
let cropAx = 0;
let cropAy = 0;
let cropBx = w;
let cropBy = h;
if (topLeft[0] < 0) {
  cropAx = pointInObjectCoord(0, 0)[0];
}
if (topLeft[1] < 0) {
  cropAy = pointInObjectCoord(0, 0)[1];
}
if (bottomRight[0] > mw) {
  cropBx = pointInObjectCoord(mw, 0)[0];
}
if (bottomRight[1] > mh) {
  cropBy = pointInObjectCoord(0, mh)[1];
}
```

这样就能得出裁切区域的宽和高。

```js
const cropW = Math.floor(cropBx - cropAx);
const cropH = Math.floor(cropBy - cropAy);
```

于是，就有了 crop 滤镜所需的参数：

`crop=${cropW}:${cropH}:${cropAx}:${cropAy}`

### scale & pad

scale 和 pad 要一起考虑。因为 pad 不允许输出尺寸小于输入尺寸，故裁切后的像素若不需要填充额外的留白，则只需 scale，无需 pad：

```js
let filter = '';
if (topLeft.x <= 0 && topLeft.y <= 0 && bottomRight.x >= mw && bottomRight.y >= mh) {
  filter = `crop=${cropW}:${cropH}:${cropAx}:${cropAy},scale=${mw}:${mh}`;
}
```

若缩放后仍需在左上或右下填充一些留白像素，则使用 scale 时，只能以像素为单位指定宽或高的其中一个值，另一个值要配置成 `-1` 以实现等比缩放。之后再用 pad 命令，补全留白像素，使输出尺寸与目标尺寸一致。

```js
let filter = `crop=${cropW}:${cropH}:${cropAx}:${cropAy}`;
const widthAfterScale = Math.round(s * cropW);
const heightAfterScale = Math.round(s * cropH);
if (widthAfterScale <= mw && heightAfterScale <= mh) {
  filter += `,scale=${widthAfterScale}:-1,pad=${mw}:${mh}`;
} else if (widthAfterScale > mw) {
  const _h = mw / cropW * cropH;
  if (_h > mh) filter += `,scale=${mw}:${mh}`;
  else filter += `,scale=${mw}:-1,pad=${mw}:${mh}`;
} else if (heightAfterScale > mh) {
  filter += `,scale=-1:${mh},pad=${mw}:${mh}`;
}
```

上述命令会让留白像素全部补充在右下方。当素材缩放后，其左上角点位于目标区域内时，左侧或上方也需要补充一些留白像素。

```js
if (topLeft.x > 0) {
  filter += `:${Math.round(topLeft.x)}`;
  if (topLeft.y > 0) {
    filter += `:${Math.round(topLeft.y)}`;
  }
} else if (topLeft.y > 0) {
  filter += `:0:${Math.round(topLeft.y)}`;
}
```

这样 `filter` 变量就有了最终值。

## Webm 转 GIF

一个完成的 ffmpeg webm 转 gif 命令类似这样：

`ffmpeg -vcodec libvpx-vp9 -i input.webm -vsync 0 -filter_complex "[0:v] fps=25, split [a][b];[a] palettegen=max_colors=32 [p];[b][p] paletteuse" -loop 0 output.gif`

这里用到了 `filter_complex`，用 `;` 分隔构成了 3 条滤镜链 (filter chain)。而第一条滤镜链里，又用 `,` 分隔使用了两个滤镜。

这个命令的含义大致如下：

`[0:v] fps=25, split [a][b]`

把输入文件的视频流先应用一个 [`fps`](https://ffmpeg.org/ffmpeg-filters.html#fps-1) 滤镜，再给中间结果应用 [`split`](https://ffmpeg.org/ffmpeg-filters.html#split_002c-asplit) 滤镜。

`fps=25` 是 `fps=fps=25` 的简写，即使用 `fps` 滤镜，并把这个滤镜的 `fps` 参数配置为 `25`。因为 `fps` 滤镜的 `fps` 参数是源码里的第一个参数，所以可以把 `fps=fps=25` 简写成 `fps=25`。

在 `,` 后面的 `split` 会拿到经过 `fps` 滤镜后输出的影像作为它的输入，这里可以得到两份一样的输出，分别为 `[a]` 和 `[b]`。

`[a] palettegen=max_colors=32 [p]`

把第一个滤镜链里的输出结果 `[a]` 作为输入，使用 [`palettegen`](https://ffmpeg.org/ffmpeg-filters.html#palettegen-1) 滤镜，生成一个最多含有 32 种色彩的色板，并输出为 `[p]`。这个滤镜默认会保留透明，所以不需要额外配置 `reserve_transparent` 参数。

`[b][p] paletteuse`

把第一个滤镜链里输出的视频流 `[b]` 和第二个链里输出的色板 `[p]` 作为 [`paletteuse`](https://ffmpeg.org/ffmpeg-filters.html#paletteuse) 滤镜的输入，把原画面通过指定的色板重新采样。这是最后一个滤镜了，就省略了最后输出流的名称，和写成 `[b][p] paletteuse [output]` 的效果是一样的。

除了滤镜配置外，这条转换命令还有诸如 `-loop 0` 让输出的 gif 一直循环等配置。

## filter_complex 通用语法

通过上面的例子，可以知道 `filter_complex` 的通用语法。使用下面的结构构造一条滤镜链：

`[input1][input2][...] filter1=f1_param1=f1_val1:f1_param2=f1_val2, filter2=f2_param1=f2_val1 [output1][output2][...]`

输入与输出的个数应根据滤镜的支持情况按需指定，多个滤镜之间用 , 分隔，第一个 `=` 左边的是滤镜名称，右边的是滤镜的配置项，多个配置项之间用 `:` 分隔。若只要按顺序指定滤镜的配置项，则可以省略配置项的名称，写成 `filter1=f1_val1:f1_val2` 这样的简写格式。

多条滤镜链之间用 `;` 来连接。若不显示指定输入与输出的名称，也没有歧义，则可是省略命名。

## 模糊背景

在很多短视频软件，因为视频比例不符，通常会把原来的视频缩放至刚好能完全展现其内容，上下或左右补充模糊背景，以让画面撑满屏幕。使用上面提到的视频裁切计算和滤镜配置，可以用 ffmpeg 输出这样的视频。

类似“视频裁剪 - Crop”一节，下面定义一些输入变量，来生成带主体缩放居中到目标尺寸区域内，并添加背景模糊的滤镜指令。

![defining variables](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/7083af40-81eb-11ee-b89f-3d9efa3268eb.jpg)

假设目标尺寸的宽和高分别为 `mw` 和 `mh`，源素材宽和高分别为 `w` 和 `h`，原素材锚点为 `(ax1, ay1)`，素材锚点相对目标区域的坐标为 `(x1, y1)`，素材相对锚点的缩放值为 `s1`，模糊素材锚点为 `(ax2, ay2)`，模糊素材锚点相对目标区域的坐标为 `(x2, y2)`，模糊素材相对锚点的缩放值为 `s2`。

可以通过 split 滤镜把原始输入的视频流拆成两份：

```
[0:v] split [bg_input][fg_input]
```

先处理模糊背景。把 `(ax2, ay2)`、`(x2, y2)`、`s2`、`mw`、`mh` 代入“视频裁剪 - Crop”一节的计算流程，可以得到一组 crop 滤镜所需的参数 `crop=${cropW}:${cropH}:${cropAx}:${cropAy}`。因为模糊背景裁切和缩放后理论上总是能填充满目标尺寸的，故 scale 滤镜也就直接配置为 `scale=${mw}:${mh}`。最后给画面加上 [boxblur](https://ffmpeg.org/ffmpeg-filters.html#boxblur) 滤镜即可，完整的滤镜链类似这样：

```js
`[bg_input] crop=${cropW}:${cropH}:${cropAx}:${cropAy},scale=${mw}:${mh},boxblur=12 [bg_output]`
```

在目标尺寸里缩放居中完整呈现的素材，因为是完整呈现，故无需 crop，只要 scale：

```js
`[fg_input] scale=${w*s1}:${h*s1} [fg_output]`
```

然后用 overlay 滤镜把它们叠起来：

```js
`[bg_output][fg_output] overlay=${x1-s1*ax1}:${y1-s1*ay1}`
```

最后用 `;` 把上面几个滤镜链连起来，就可以作为最终的 `filter_complex` 了。

例如，把一个 1508x1078 的视频，转为 540x960 并带上模糊背景，则 mw=540，mh=960，w=1508，h=1078，ax1=ax2=754，ay1=ay2=539，x1=x2=270，y1=y2=480，s1=0.3581，s2=0.8905，代入计算得到结果后就可以这么操作：

`ffmpeg -i input.mp4 -filter_complex "[0:v] split [bg_input][fg_input];[bg_input] crop=606:1078:450:0,scale=540:960,boxblur=12 [bg_output];[fg_input] scale=540:386 [fg_output];[bg_output][fg_output] overlay=0:287" -n output.mp4`
