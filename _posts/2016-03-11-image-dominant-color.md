---
layout: post
title: Dominant color of images
category: programming
poster: https://img.alicdn.com/tps/TB14TYZLVXXXXbKXpXXXXXXXXXX-1200-250.jpg
summary: The designers ask me to get the dominant color of an image regardless of gray, black and white and skin tones. I searched the Internet and got some algorithms and combined them together.
---

最近做一些色彩有关的事情，找了很多有关的文章，打算分几篇整理一下。

## The purpose

这篇文章是一堆网上搜索资料的整合，用于获取一张图片的主体色。代码主要参考于一个 PHP 的颜色占比识别脚本。但视觉设计师还想要过滤掉白底图片的各种灰度色，并且优先选择更加鲜亮的颜色，所以在得到一个按色彩占比排序的列表之后，再做一次排序。

我在项目里是用 ImageMagick 缩放图片并获取各像素点颜色的，下面的代码则是使用 Canvas，这样在浏览器里就能完成所有操作了。

## The process

整体流程比较简单，明确地分为以下几个步骤：缩放图片，将近似色合并，减少渐变的影响，得到一组按占比排序的色彩值；在此基础上，将灰度色排到最后，把饱和度和明度值相对较高的颜色前移，并降低近似皮肤色的权重。

下面的代码说明配合一张[某品牌的模特图片](https://img.alicdn.com/tps/TB1U4WSLVXXXXX4XFXXXXXXXXXX-704-1026.jpg)作为示例，要直接下代码的，[请点这里](http://acc.alicdn.com/tfscom/TB1vUv0LVXXXXaIXpXXcvNbFXXX.zip)。

### The helper method

获取初始色彩排序的代码参考自一个 PHP 脚本，原代码使用了 PHP 的 `arsort` 方法，效果类似把一个字典按值排序，但保持键的指向。参考 PHP 官网的[文档](http://php.net/manual/en/function.arsort.php)。

因为 ES5 里没有 PHP 的 Associative Array，我用普通数组和对象代替，同时精简了使用场景，因为我用到的值都是 `Number` 类型的。或许也可以尝试一下 `Map`。

因此就有了下面这个方法，返回 Object 的值降序排列时的键。

```js
function keysAfterArsortNumeric(obj) {
  var result = []

  var bridge = []
  for (var key in obj) {
    bridge.push({
      key: key,
      value: obj[key]
    })
  }

  bridge = bridge.sort(function(a, b) {
    return b.value - a.value
  })

  bridge.forEach(function(item) {
    result.push(item.key)
  })

  return result
}
```

使用效果如下。

```js
var obj = {
  'd': 40,
  'a': 10,
  'b': 20,
  'c': 30
}

console.log(keysAfterArsortNumeric(obj))
// outputs: ["d", "c", "b", "a"]
```

### Resizing image

获取图片主色调只需要用缩放的图片，效果差不多并且能节约很多时间。

如果用 ImageMagick 的话，直接用 `convert` 命令配合 `-resize` 选项就可以了。如果想让效果稍微好一点，也可以根据文档的建议，增加 `'-unsharp 1.5x1+0.7+0.02'` 之类的选项。

这里直接在浏览器里用 Canvas 做非等比缩放。

```js
function resizeImage(img, width, height) {
  var canvas = document.createElement('canvas')
  var context = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height
  context.drawImage(img, 0, 0, width, height)
  return canvas
}
```

### Reducing duplicate colors

使用 Canvas 缩放图片后，便可以得到每个像素的颜色值。首先要做的就是去掉近似色。这里分别对每个像素的 R，G，B 3 个值进行重新计算。

```js
// img 是一个 DOM <img> 节点
var delta = 16
var halfDelta
if (delta > 2) {
  halfDelta = delta / 2 - 1
}
else {
  halfDelta = 0
}

var width = 150, height = 150 // 假设缩放至 150x150
var x, y
var color, hex, hexObj = {}
for (y = 0; y < height; y++) {
  for (x = 0; x < width; x++) {
    // #1
    color = imageColorAt(canvas, x, y)

    // #2: 将近似色合并
    color.red = parseInt(((color.red + halfDelta) / delta), 10) * delta
    color.green = parseInt(((color.green + halfDelta) / delta), 10) * delta
    color.blue = parseInt(((color.blue + halfDelta) / delta), 10) * delta

    if (color.red > 255) color.red = 255
    if (color.green > 255) color.green = 255
    if (color.blue > 255) color.blue = 255

    hex = ('0' + color.red.toString(16)).substr(-2) +
      ('0' + color.green.toString(16)).substr(-2) +
      ('0' + color.blue.toString(16)).substr(-2)

    // 记录每一个颜色出现的次数
    if (hexObj[hex]) {
      hexObj[hex]++
    }
    else {
      hexObj[hex] = 1
    }
  }
}
```

`#1` 处用到了一个 `imageColorAt` 方法，就是通过 `<Canvas>` 2d context 的 `getImageData` 读取颜色值，返回一个类似 `{ red: 0, green: 0, blue: 0 }` 的对象。其中 `canvas` 变量是使用前一小节的 `resizeImage` 方法得到的。

`#2` 下方的 3 行代码，用来合并颜色。合并的力度取决于 `delta`。例如，在上述代码中，`delta` 设置为 `16`，那么属于 [9, 24] 区间的 R/G/B 值将被置为 16，属于 [25, 40] 区间的 R/G/B 值都将被置为 32，依此类推。

在上述代码执行完成后，`hexObj` 变量就保存了一份以颜色值为键，颜色出现次数为值的数据。

此时，获取到的占比前十的颜色如下图。

![The original palette][original]

### Reducing gradient variants

此时 `hexObj` 里的颜色，除了白色， 其他颜色的 R/G/B 值均为 `delta` 的倍数。这一步将继续减少上一小节 `hexObj` 里的近似色。

例如，当前有 2 个出现次数较高的近似色，在 `hexObj` 里表现为 `{'20a020': 4000, '30a020': 5000}`。这两个颜色在人眼看来是非常接近的。通过这个步骤，`hexObj` 将变为 `{'20a020': 0, '30a020': 9000}`。

```js
// #1
var hexArr = keysAfterArsortNumeric(hexObj)
var gradients = {}

hexArr.forEach(function(val) {
  if (!gradients[val]) {
    // #2
    hex = findAdjacent(val, gradients, delta)
    gradients[val] = hex
  }
  else {
    hex = gradients[val]
  }

  if (val !== hex) {
    hexObj[hex] += hexObj[val]
    hexObj[val] = 0
  }
})
```

`#1` 处先根据上一小节得到的 `hexObj` 做个排序，按照颜色出现次数由多到少，把颜色值存在 `hexArr` 数组里。`gradients` 对象用于存储近似色的关系。以前面那 2 个绿色为例，`gradients` 将包含 `{ '20a020': '30a020', '30a020': '30a020' }`。

`#2` 处的 `findAdjacent` 方法就是用来寻找上面这个关系的，其内部逻辑很简单，主要是用 R/G/B 值同 `delta` 和 `255-delta` 的比较来判断是否近似色。该方法内的相似代码比较多，这里就不贴了，直接[下载源码](http://acc.alicdn.com/tfscom/TB1vUv0LVXXXXaIXpXXcvNbFXXX.zip)吧。

完成这一步后的结果如下。

![Palette after reducing gradients][reduce_gradient]

### Favoring saturated colors

至此，`hexObj` 里各元素的值均为数字，代表颜色出现的次数。这一步的操作会改变这个数字的意义，因此之后这个值将纯粹代表颜色的权重。并且从这一步开始，将准备产出结果集。

首先，将有效颜色都推入结果数组中。

```js
var result = []
hexArr = keysAfterArsortNumeric(hexObj)
hexArr.forEach(function(val) {
  if (hexObj[val] !== 0) {
    result.push({ color: val, weight: hexObj[val] })
  }
})
```

根据 RGB 和 HSB 的关系，明度取决于 R/G/B 三者的最大值，非黑色的饱和度为 `(Max(R, G, B) - Min(R, G, B)) / Max(R, G, B)`。此处 R/G/B 属于 [0, 1] 区间。因此可以通过以下公式来简单判断一个颜色是否饱和度和明度相对较高。

```js
function favorSaturatedHue(r, g, b) {
  return ((r-g)*(r-g) + (r-b)*(r-b) + (g-b)*(g-b))/65535*50+1;
}
```

若要完全弱化黑白灰，可以把上述最后的 `+1` 去掉。

将颜色应用上述公式的结果乘以颜色出现次数，每个颜色得到一个新的权重。

```js
result.forEach(function(item) {
  item.weight = parseInt(item.weight * favorSaturatedHue(
    parseInt(item.color.substr(0, 2), 16),
    parseInt(item.color.substr(2, 2), 16),
    parseInt(item.color.substr(4, 2), 16)
  ), 10)
})
result.sort(function(a, b) {
  return b.weight - a.weight
})
```

下面的截图完全弱化了黑白灰，得到权重大的色彩是皮肤色。

![Palette favoring saturated colors][favor_saturated]

### Handling skin tone

上述结果一般情况下是可用的。我自己的应用场景大多数是有模特的商品图片，所以视觉设计师想要再弱化一下皮肤色。

一般来说，皮肤色的 R 和 B 值相差 20% 左右，G 值大约是 `(R + B) / 2`。例如，0.75R，0.65G，0.55B（R/G/B 属于 [0, 1] 区间）。深色皮肤各颜色通道值会高一些。若要更偏黄，B 值相对再低一些。

因为之前的步骤已经把颜色值做了合并，所以这里我把判断阈值加大一些，把匹配到的颜色权重降为原有值的平方根。下述代码里 R/G/B 属于 [0, 255] 区间。

```js
result.forEach(function (item) {
  var red = parseInt(item.color.substr(0, 2), 16)
  var green = parseInt(item.color.substr(2, 2), 16)
  var blue = parseInt(item.color.substr(4,2), 16)
  if (red > blue && red-blue < 70 && Math.abs((red+blue)/2-green) < 10) {
    item.weight = Math.sqrt(item.weight)
  }
})
result.sort(function(a, b) {
  return b.weight - a.weight
})
```

至此，取得衣服上的绿色，作为权重最大的颜色。

![Palette with less skin tone weight][less_skin_tone]

## Wrap up

很啰嗦的一篇，主要是说明一下每一个步骤的原理，因为我自己也很健忘。如果只要获取图片主体色，直接[下载代码](http://acc.alicdn.com/tfscom/TB1vUv0LVXXXXaIXpXXcvNbFXXX.zip)用就好了。

## References

1. [The PHP version of image color extractor](http://www.coolphptools.com/color_extract)
2. [pieroxy's color finder](https://github.com/pieroxy/color-finder)

[original]:https://img.alicdn.com/tps/TB182D7LVXXXXXLXXXXXXXXXXXX-1078-238.jpg
[reduce_gradient]:https://img.alicdn.com/tps/TB1brn3LVXXXXc3XXXXXXXXXXXX-1078-238.jpg
[favor_saturated]:https://img.alicdn.com/tps/TB1uOPVLVXXXXXCXFXXXXXXXXXX-1078-238.jpg
[less_skin_tone]:https://img.alicdn.com/tps/TB1ytDOLVXXXXaZXVXXXXXXXXXX-1078-238.jpg
