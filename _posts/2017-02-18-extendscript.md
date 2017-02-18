---
layout: post
title: Illustrator Automation - ExtendScript
category: programming
poster: https://img.alicdn.com/tfscom/TB1tGRZPFXXXXbjXXXXXXXXXXXX.jpg
summary: This article talks about the ExtendScript in Adobe Illustrator. The techniques from this article can be used in other Adobe products which also supports ExtendScript like Photoshop, Indesign and After Effects.
---

去年研究了 Adobe Illustrator 和 Photoshop 里一些自动化的方式。从不需要写代码的动作 (Actions) 面板到简单的脚本，进而封装基于 Web 技术的扩展，以及 Photoshop 独有的 Adobe Generator。这一系列的功能让用户能实现相对复杂流程的自动化。每个主题都可以非常深入，而我的研究是满足日常工作需求即可，但这也足够应付多数情况了。本篇来说说 ExtendScript，通过写脚本的方式做一些自动化操作。

## Intro to ExtendScript

相对于上一篇所述的动作 (Actions)，脚本可以认为是一个更高级的自动化工具。动作仅支持少数软件内的部分功能，而脚本则支持更多的软件，可操作的元素也更加丰富。一旦自动化流程涉及条件判断，例如当前文档是否有图片元素，当前软件是否打开了某些文档等，动作就很难满足需求了（尽管 Photoshop 的动作面板内置了简单的条件判断）。此外，脚本是可以调用我们录制的动作的，并能和操作系统的文件系统进行交互。

支持脚本编程的 Adobe 软件都支持 3 种脚本语言，AppleScript(Mac)、VBScript(Windows)、JavaScript(Mac/Windows)。其中，这里 JavaScript 是在 ECMAScript 3 的基础上增加了 E4X、跨平台文件系统交互、多国语言、`#include` 引用外部 JS 文件等功能，Adobe 称之为 ExtendScript。

Adobe 有一份完整的文档讲述 ExtendScript 的所有功能，本篇只会选择里边的一部分常用内容，配合 Illustrator 出一些实例来说明。

## Adobe ExtendScript Toolkit

我们可以直接将 ExtendScript 理解为一个特殊版本的 JavaScript，因此任何代码编辑器都能胜任编码工作。不过，为了调试方便，Adobe 提供了一个专门的 IDE，叫做 ExtendScript Toolkit。只要你安装了 Adobe Creative Cloud，就可以在 App 标签下找到安装，装完后会显示在 PREVIOUS VERSIONS 下方的软件列表里。在后续的文字里，我们简称该工具为 Toolkit。

![Adobe ExtendScript 在 Creative Cloud 软件里的位置][1]

不过我并不推荐在这个软件里写代码。软件的代码提示是丰富的，但性能实在太差，经常会因为代码提示的原因导致打字有延迟。而且在 Retina 显示屏下，至少 Mac 版的界面不是高清的。所以推荐使用 Microsoft Code 之类的第三方编辑器，将语言调至 JavaScript 来编码。

至于这个 IDE 里的一些必要功能，我们在后边的示例中说明。

## Adobe Scripting Center

所有关于脚本自动化的文档，都可以在 [Adobe Scripting Center](http://www.adobe.com/devnet/scripting.html) 找到。在这个站点，可以看到 Acrobat、After Effects、Bridge、Device Central、Illustrator、InDesign、Photoshop 都支持脚本的使用。Adobe 为每一个软件提供了相应的 Guide。同时，还有对应的论坛，如果有什么文档里没说清楚的，也可以去咨询。

建议这里先下载 [Adobe Illustrator CC Reference: JavaScript](http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/illustrator/sdk/CC2017/Illustrator_JavaScript_Scripting_Reference.pdf)。我们会在后续的文字里用到，并称之为*参考*。

## Scripting in Illustrator

虽然每个软件有各自的对象模型，但诸如文件系统操作，UI 工具等都是通用的。能用脚本来做的事情实在太丰富了，因此本篇的重点并不在如何编写一个酷炫的 Illustrator 脚本，而是介绍使用脚本的基本流程。下面我们就以 Illustrator 为例，通过一个简单的实例，来介绍 ExtendScript 的自动化流程，Toolkit 和*参考*文档的使用。

### The app instance and file system

所有 Illustrator 的入门教程都会在一开始介绍完界面后，讲解新建文件，打开和关闭等操作。所以我们也从这里开始。

软件提供了 `app` 这个全局变量，它是 `Application` 的一个单例，*参考*里的第一个词条便是。所有的脚本总是要从 `app` 开始。例如，要获取某个图层的名称，就要先找到当前活动文档，而当前活动文档是 `app` 的一个属性。

另外有两个常用的全局对象，用来操作文件系统的，分别是 `File` 和 `Folder`。*参考*里并不包括这两个对象，需要单独下载 [JavaScript Tools Guide](http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/scripting/pdfs/javascript_tools_guide.pdf)。

下面我们通过脚本来创建一个 2 行 4 列共带有 8 个 100x100 画板，色彩空间为 RGB 的文档，并弹出保存对话框。先贴出完整的代码，稍后解释含义，并图示说明如何通过翻阅*参考*来写出这段代码。

```js
// 添加文档
app.documents.add(
  DocumentColorSpace.RGB,
  100, 100,
  8, DocumentArtboardLayout.GridByRow, 20, 4
);

// 保存文档
var doc = app.activeDocument;
var file = File.saveDialog();
if (file) doc.saveAs(file);
```

### Running scripts

在任意代码编辑器里粘贴上一节的代码，并将其保存为 `first_script.jsx`。注意这里的扩展名 `jsx` 和当下很流行的 React.js 所用的 JSX 完全没有关系。这里的 `jsx` 只是表示 ExtendScript 而已。

启动 Toolkit，打开刚才的文件，在文件编辑窗口左上角将目标软件切换为 Adobe Illustrator。根据你机器上安装的 Adobe 软件版本不同，这里显示的名称也会有所变化。

![在 Toolkit 里执行脚本][4]

接着点击播放按钮。若 AI 未启动，Toolkit 会弹出提示，问我们是否启动 AI，选择是即可。若 AI 已经启动，则 AI 会自动切换到活动状态，并弹出文件保存对话框（因为我们的脚本里写了保存文件）。

选择好路径后，点击确定，脚本执行完成，便自动切回 Toolkit，并在右上角的 JavaScript Console 显示 `Result: undefined`。

![JavaScript Console][5]

作为开发者，我们推荐使用 Toolkit 运行脚本。因为运行过程中遇到报错，Toolkit 会给出提示，并允许我们调试。假若我们要将这个脚本文件直接分发给普通用户使用，一般有两种方式。

**方法一** 选择 File - Scripts - Other Scripts 菜单项，在弹出的对话框选择脚本文件。

**方法二** 将脚本文件放置在 Illustrator 安装目录的 `Presets/en_US/Scripts/` 目录并重启 AI，便可在 File - Scripts 的下级菜单里找到。这里 `en_US` 目录视你的软件语言而异。例如，我在 Mac 上英文版 Illustrator CC 2017 的脚本路径为 `/Applications/Adobe Illustrator CC 2017/Presets/en_US/Scripts/`。

使用 Scripts 菜单运行脚本时，若遇到未捕获异常，则会直接弹出一个对话框告知用户脚本运行出错。

### How to use references

好了，现在我们已经成功用脚本创建并保存了一个文件。是时候来看看这个脚本是如何写出来的了。

首先，我们来看下本例脚本代码与图形界面的关系。

![添加文档方法和软件界面元素的对应关系][2]

通过图形界面创建新文档时，我们可以设置画板个数、尺寸、排列方式以及文档色彩模型等高级选项。这些选项在 `add` 方法中都有对应的参数。但其他更丰富的配置，例如文档的名称、单位以及画板的流血设置等，在 `add` 方法中并不能指定。不过，我们可以在 `add` 方法之后，通过单独配置 `Document` 或者 `Artboard` 的相应属性来调整这些值。但也可能某些配置在代码中是不可访问到的。

那如何知道要用这个 `add` 方法呢？首先，你得至少了解 Illustrator 这个软件里的一些术语，例如文档 (Document)，画板 (Artboard) 等。接着，想一想平常新建的时候，对话框都叫做 New Document，那么很可能在代码中有一个 `Document` 类来处理这个操作。而所有的操作最终都源于 `Application`，也就是 `app` 全局变量。所以如果你下载了前述*参考*，就可以先找到 Application 条目，发现它有一个 `documents` 属性，进而查看 `Documents` 类，发现它提供了一个 `add` 方法。而 `add` 方法有 7 个可选参数，且*参考*都详述了每个参数的类型。

![使用参考文档查找方法][3]

当创建好文档之后，Illustrator 会自动切换到这个文档，即当前活动文档。于是再翻阅*参考*，发现 `app.activeDocument` 是 `Document` 的实例，指向当前活动文档。最后我们再找到 `Document` 类下方的方法，发现通过 `saveAs` 可以将文档保存到一个新的路径。

如果你没有下载*参考*，其实在 Toolkit 内部也是集成了一份文档的。打开 Help - Object Model Viewer，在 Browser 一项选择所需软件，即可在 Classes 区域查找所需的信息了。

![Toolkit 内建的文档浏览器][7]

不过，我仍然推荐下载 PDF 文档，因为 Toolkit 内建的参考用起来总是莫名的卡顿。

### Debugging

不知道你的 AI 是否和我的一样，在执行刚才的方法之后，新创建的文档里画板的位置并不正确。下图左边是预期的，右边则是实际的。

![不符合预期的结果][6]

理论上，要完成我们的目标操作，仅需要上述代码中“添加文档”和“保存文档”两个步骤。但 `app.documents.add` 方法的最后一个参数似乎怎么配置都无法生效，至少在 Illustrator CC 2017 版本下有这么个 bug。那刚好借机来说说 Toolkit 的调试功能。

画板的位置不正确，那肯定是它们的原点坐标值不对。翻阅*参考*发现 `Artboard` 实例并没有 `origin` 之类的属性，不过有一个 `artboardRect` 属性，表示画板的尺寸和位置。于是，我们就使用下面的循环，把每一个画板的边框信息打印出来看看。

使用上例代码创建一个文档，并确保其处于活动状态。在 Toolkit 新建一个文档，贴入下述代码并运行。

```js
var doc = app.activeDocument;
var artboards = doc.artboards;
for (var i = 0; i < artboards.length; i++) {
  $.writeln(artboards[i].name, ' ', artboards[i].artboardRect);
}
```

结束后，我们会在 JavaScript Console 得到如下结果。

```
Artboard 1 0,100,100,0
Artboard 2 120,100,220,0
Artboard 3 240,100,340,0
Artboard 4 0,-20,100,-120
Artboard 5 120,-20,220,-120
Artboard 6 240,-20,340,-120
Artboard 7 0,-140,100,-240
Artboard 8 120,-140,220,-240
Result: undefined
```

此处 `$.writeln` 就类似在浏览器里用 `console.log` 一样，会将传入的参数转为字符串输出到控制台。

如果你更喜欢打断点的方式，Toolkit 也是支持的。例如，我们在 for 循环体内，即第 4 行打一个断点（点击行数 4 右侧的空隙），并执行脚本，那么 Toolkit 会在执行到断点时黄色高亮断点所在行，并和各 IDE 一样，允许我们使用 step into、step over 等断点控制操作。

![使用 Toolkit 打断点调试][8]

注意上图中为了方便截图，我把编辑器调到了 Debugging 布局。在进入断点之后，在 Data Browser 面板输入一个变量名并会车，便可在下方面板里展开查看具体信息了。不过 Toolkit 的断点功能相当脆弱，不要在断点状态停留太长时间，或者做太多复杂的操作。不然 Toolkit 可能会停止响应。

你若跟着我的描述翻阅了*参考*，可能会注意到 `artboardRect` 属性值的类型是 `rect`，并且这个类型在*参考*中并不带额外说明的。此时通过断点的方式，我们展开 `artboardRect` 属性，可以明显看到这是一个包含 4 个数值的数组。

回到我们的 bug 上。观察上述 Console 里的打印结果，我们会发现一个很有意思的现象。一般来说，当代 2D 图形界面编程都会选择左上角点作为坐标原点，y 轴往下为正。但 AI 脚本里的坐标系，是和数学坐标系一样，y 轴往上为正。

![画板在坐标系中的位置][9]

所以根据这个坐标系，我们很快就能推出下述代码里的通式，将画板移动到预期的位置上。

```js
var doc = app.activeDocument;
var artboards = doc.artboards;
var row = 0;
var col = 0;
for (var i = 0; i < artboards.length; i++) {
  row = Math.floor(i / 4);
  col = i % 4;
  artboards[i].artboardRect = [col*120, 100-row*120, 100+col*120, -row*120];
}
```

是不是已经体验到，批量循环操作的时候，用脚本所带来的便利性呢？

## Useful ExtendScript features

关于 AI 里的脚本编程，我们暂且介绍这么多。假若把*参考*里的各个类都拿出来，做一些基于项目的实例，我们就真要写成一本书了。最后罗列几条 [JavaScript Tools Guide](http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/scripting/pdfs/javascript_tools_guide.pdf) 里特别有用的功能。

### The `#include` preprocessor directive

每一个软件的 ExtendScript 提供的 JavaScript 支持，是有些区别的。例如 Illustrator CC 2017 的 ExtendScript 提供的 JavaScript 支持依旧是基于 ECMAScript 3 的，因此很多 ES5 以上的 JS 语言特性都没有，包括 `JSON`。不过我们可以很方便地使用 `#include` 来预先载入这些模块。

例如在如下目录结构下，在 `main.js` 里就可以使用 `#include "./includes/json.jsxinc"` 来预载 `JSON` 模块。

```
.
├── includes
│   └── json.jsxinc
└── main.js
```

这里 `json.jsxinc` 这个奇怪的扩展名只是 ExtendScript 里的一个习惯，用 `js` 或者 `jsx` 扩展名都是可以的。

### Localization

若要在界面或者文案输出时，匹配当前软件的语言，则可以使用 `localize` 这个全局方法。例如

```js
var birthday = {
  en: '%1/%2/%3',
  zh_CN: '%3 年 %1 月 %2 日'
};
alert(localize(birthday, 2, 22, 1990));
```

### Scripting UI

如果你在 Photoshop 里用过内置的图像批处理脚本，即 File - Scripts - Image Processor 脚本，会发现这个脚本是带有界面的。脚本的界面是使用 ExtendScript 的 ScriptUI 来编写的，因此并没有控件拖拽的图形化界面。

纯粹使用代码来编写界面，即使是简单的界面，也可能需要较多的代码。例如，下图是我以前写的批量调用 Photoshop Save for Web 功能生成 JPG 图片的界面。

![ScriptUI 编写界面][10]

实际上，[JavaScript Tools Guide](http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/scripting/pdfs/javascript_tools_guide.pdf) 之所以这么厚，一大原因是界面编程就整整占了 100 多页，超过 1/3 的篇幅。如果各位想要具体了解脚本支持的各类 UI 组件，以及如何编写带有窗口尺寸适配的界面，可以仔细翻阅 User-Interface Tools 章节。

## Wrapping up

本篇的目的是说明如何配置脚本的调试环境；如何从零开始，通过翻阅文档来编写实用脚本。如开篇所述，脚本支持的 Adobe 软件非常丰富。各位在日常工作中，如果还使用 After Effects、Photoshop 等软件，不妨试试用脚本去自动化一些日常工作流，或者发掘更有创造性的应用。在下一篇文章里，我们将会把脚本编写和动作录制组合到一起，使用 HTML 和 CSS 来制作界面，讲述如何编写一个 Illustrator 扩展。

[1]:https://img.alicdn.com/tfscom/TB1v5hdPFXXXXcZaXXXXXXXXXXX.jpg
[2]:https://img.alicdn.com/tfscom/TB1IYpkPFXXXXayaXXXXXXXXXXX.png
[3]:https://img.alicdn.com/tfscom/TB1k78VPFXXXXc9XXXXXXXXXXXX.png
[4]:https://img.alicdn.com/tfscom/TB1vRBiPFXXXXbeaXXXXXXXXXXX.png
[5]:https://img.alicdn.com/tfscom/TB1QL8yPFXXXXcnXFXXXXXXXXXX.png
[6]:https://img.alicdn.com/tfscom/TB18WXAPFXXXXczXFXXXXXXXXXX.png
[7]:https://img.alicdn.com/tfscom/TB1d.pUPFXXXXcZXXXXXXXXXXXX.png
[8]:https://img.alicdn.com/tfscom/TB1ozpKPFXXXXceXpXXXXXXXXXX.png
[9]:https://img.alicdn.com/tfscom/TB1UXJFPFXXXXcAXFXXXXXXXXXX.png
[10]:https://img.alicdn.com/tfscom/TB1NJxJPFXXXXcqXpXXXXXXXXXX.png
