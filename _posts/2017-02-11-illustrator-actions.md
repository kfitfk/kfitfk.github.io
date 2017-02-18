---
layout: post
title: Illustrator Automation - Actions
category: programming
poster: https://img.alicdn.com/tfscom/TB1_DHtPpXXXXbLXVXXXXXXXXXX.jpg
summary: This article talks about the Actions Panel in Adobe Illustrator. The techniques from this article can be used in other Adobe products which also supports Actions like Photoshop.
---

去年研究了 Adobe Illustrator 和 Photoshop 里一些自动化的方式。从不需要写代码的动作 (Actions) 面板到简单的脚本，进而封装基于 Web 技术的扩展，以及 Photoshop 独有的 Adobe Generator。这一系列的功能让用户能实现相对复杂流程的自动化。每个主题都可以非常深入，而我的研究是满足日常工作需求即可，但这也足够应付多数情况了。本篇来说说最简单的一种方式，动作 (Actions) 面板。

## Intro to Actions

英文版管这个功能叫做 Actions，中文版翻译成“动作”。它的功能是让我们可以录制一组操作命令，之后快速应用到其他的文件上。所谓操作命令，就是诸如选择菜单的某个选项之类。在 Photoshop 里我们可以录制几乎所有的菜单命令，在 Illustrator 里限制能多一些，大约一半的菜单命令是支持录制的。本篇我在 Illustrator 中演示，所提到的方法基本适用 Photoshop。

## Creating a set

所有的动作都通过 Actions 面板进行录制和管理。我们可以选择 Window - Actions 菜单打开动作面板。默认情况下，新安装的 Illustrator 会自带一组动作，称为 Default Actions。这些预制的动作可能一辈子都用不到，所以我们暂且不管它们。

![动作面板][1]

动作面板底部有一排按钮，点击从右往左数第三个按钮，会出现一个对话框，让我们创建一个新的动作集 (Create New Set)。这里我新建一个 demo 组。

![新建 Demo 动作集][2]

理论上，我们可以不创建自定义动作集，把新的动作也录制到默认的组内。但只要你不是出于随便玩玩这个功能的目的，就一定要将动作录制到自己创建的组里。不然一旦软件更新，你的自定义动作就全没了。顺带一提，Illustrator 会把 Swatches 面板的所有色彩、Symbols 面板的图形等保存到当前文件里，但 Actions 面板的所有内容是不随文件保存的，而是存储在软件安装路径下的。所以如果你有多台机器协同工作的需求，记得手动同步自己录制的动作（后面会讲如何操作）。

## Recording an action

下面以创建一个将当前文档存储为 64 色 PNG8 格式的动作为例，来介绍动作面板的使用。

首先，随意创建一个新的文档。在动作面板底部一排按钮中，点击从右往左数第二个按钮，弹出新建动作对话框。

![新建动作][3]

上图中，我在点击新建按钮时，在动作面板里选中了之前新建的 demo 组。所以在新建对话框中，第二排 Set 一项已经默认置为 demo 了。在第一行输入名称，点击 Record 会创建动作并进入录制状态。

顺带一提，第三排的功能键可以选择播放该动作的快捷键，在 Mac 上可用的是 F1-F15；若在第四排选择了颜色，则将动作面板切换到按钮模式时，会在该动作上显示所选颜色。一般没这两个选项没必要配置。

此时观察动作面板底部按钮，会发现最左侧的停止键是可用的，旁边的录制键和播放键都是不可用的，说明当前正处于动作录制状态。我们要录制的动作非常简单，直接选择 File - Export - Save for Web (Legacy) 一项，在弹出的对话框中，将格式置为 PNG-8，颜色数输入 64，其他选项保持默认，点击保存。

![保存为网页可用格式对话框][4]

此时，会弹出文件保存路径选择框，这里我指定文件名为 demo.png 并保存到桌面上。留意这个文件名，一会我们还会用到。

![保存文件路径选择框][5]

存储好文件后，点击动作面板底部左侧第一个停止按钮，结束动作录制。

![保存为 64 色 PNG-8 的动作][6]

至此，我们的第一个动作就录制好了。展开动作面板的描述，会发现录制的动作包含了我们所制定的文件类型和颜色数量，但也记录了完整的文件保存路径。

## Playing an action

当选中某个动作集，或者某个动作，或者某个动作的某一步时，动作面板的播放按钮就会处于可用状态。然而，可用不代表点了就有效果。你可能已经注意到动作面板左侧有两列图标，第一列是勾，表示仅当动作处于勾选状态时，才能够成功播放；第二列是对话框图标，表示播放该动作的某些步骤时是否弹出对话框。

根据选中的项目不同，单机播放按钮会触发不同操作。

- 若当前选中的是某个动作集，点击播放按钮会播放该组内勾选的所有动作；
- 若当前选中的是某个动作，点击播放按钮会播放该动作，也是多数情况我们所期望的操作方式；
- 若当前选中的是某个动作的某一步时，点击播放按钮，会从这一步开始播放当前动作；按住 Command/Ctrl 键点击播放按钮，则只会播放当前这一步。

因此，在 Illustrator 里播放动作时，一定要注意当前动作面板高亮选中的那一项。因为撤销命令不会撤销整个动作，只会撤销动作内的某一步，所以最保险的方式，是在播放动作前先保存文件，以免发生意外。在 Photoshop 里，我们可以将每一个动作的第一步，录制为去历史面板里创建当前文档状态的快照。这样，不管在什么状态播放动作，都可以快速返回播放动作前的状态。

我们在上一节录制了一个名为 Save as SVG 的动作，里边只有一个步骤，即 Save for Web。这个动作存储在 demo 组内。所以我们要执行这个动作的话，要先点击 Save as SVG 这行字以选中动作本身。

录制动作，是为了简化操作。所以我们并不需要再见到保存对话框，因此点击 Save as SVG 左侧的对话框按钮，将其关闭。

![播放保存 64 色 PNG-8 的动作][7]

按照上述说明配置完动作面板之后，结果将和上图类似。此时点击播放按钮，在软件内部并不能观察到什么特别的现象，但 Illustrator 已经将当前文档保存为 SVG 文件，存储在了我们上一节录制动作时所选的路径。

在这个例子中，我的存储路径是 /Users/yehao/Desktop/demo.png。不管桌面上 demo.png 文件是否存在，一旦该动作完成播放，桌面上的 demo.png 文件必然被创建或覆盖，且不会给出任何提示。

所以我们就遇到一个问题，既然录制动作是为了自动化某些行为，但现在每次执行动作都会覆盖旧文件，根本无法满足自动化批量存储需求。有两种方法可以绕过这个问题。先来说说复杂的方法，来看看 Illustrator 是如何存储录制的动作的。

## Saving an action set

开篇的时候我提到更换电脑可以自己同步录制的动作，这就用到了动作集的保存和加载功能。单个动作是无法存成文件的，只能将一整个动作集导出。这也是我一开始就说要新建一个动作集的另一个原因。

![导出动作集][8]

这里我们选中之前创建的 demo 动作集，点击动作面板右上角的菜单，选择 Save Actions。在弹出的对话框中选择保存路径并确定后，Illustrator 会将当前动作集导出为一个扩展名为 aia 的文件。如果是 Photoshop 的话则会导出扩展名为 atn 的文件。

之后我们就可以将 aia 或者 atn 文件拷贝到其他电脑上，使用动作面板菜单里的 Load Actions 导入录制的动作了。

## Modify an aia file

aia 文件与 atn 文件有个很大的区别，aia 是普通文本文件，atn 则是编译过的文件。因此我们可以直接用文本编辑器打开 aia 文件。当然，一般情况下，aia 文件并没什么可编辑的，而且还可能导致 Illustrator 不认识被编辑后的文件。

在讲述如何播放动作一节里，我们发现录制的存储 PNG 文件动作会将所有的文件都保存在同一个路径，导致无法复用动作。这里我们就通过修改 aia 文件，来让 Illustrator 将 png 文件保存在当前 AI 文件所在目录，且与当前 AI 文件同名。

用任意文本编辑器打开上一节保存的 demo.aia 文件，会看到一些描述和很多 16 进制表示的字符串。这里我随便摘录最前面一小段。

```
/version 3
/name [ 4
  64656d6f
]
/isOpen 1
/actionCount 1
/action-1 {
  /name [ 11
    5361766520617320535647
  ]
```

第 2-3 行的 `name` 表示当前动作集的名称。第 3 行的 `64656d6f` 即代表 “demo”，第 2 行末尾的 `4` 表示名称的长度是 4 个字符。第 5 行 `isOpen` 代表该动作集在动作面板是处于展开的状态。第 6 行 `actionCount` 也很明显，代表该动作集内总共包含 1 个动作。之后 `action-1` 就是具体的动作描述了。

下面我用两个 JavaScript 函数，来说明一下为什么 `64656d6f` 就代表 `"demo"`，以及 `"demo"` 是如何转成 `64656d6f` 的。

{% highlight javascript linenos %}
function decode(str) {
  let result = '';
  for (let i = 0; i < str.length; i += 2) {
    let tmpStr = str.substring(i, i+2);
    result += String.fromCharCode(Number('0x' + tmpStr));
  }
  return result;
}

function encode(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

encode('demo'); // "64656d6f"
decode('64656d6f'); // "demo"
{% endhighlight %}

不过，上述分析和 JS 方法仅针对英文字符有效。如果名称里有中文，或者中英文混排，这里会变得更加复杂，我们就不再深入了。

说了这么多，让我们再回到保存文件的主题上。Save for Web 动作有很多参数，最后一个参数是文件保存路径。所以在文本编辑器中打开 demo.aia 文件，滚动到最后，会看到类似下述内容。

```
/parameter-17 {
  /key 1231953952
  /showInPalette 4294967295
  /type (ustring)
  /value [ 29
    2f55736572732f796568616f2f4465736b746f702f64656d6f2e706e67
  ]
}
```

由于我的文件保存路径为纯英文，所以我在这里可以使用上述 `decode` 方法来解码这串常常的 `value` 值。

{% highlight javascript linenos %}
decode('2f55736572732f796568616f2f4465736b746f702f64656d6f2e706e67');
// "/Users/yehao/Desktop/demo.png"
{% endhighlight %}

在这里我们要把 `demo.png` 删掉，只留下 `/Users/yehao/Desktop/` 这部分。小心地删去尾部 `64656d6f2e706e67` 这串字符串，并一定记住，将 `value` 后边的 `29` 改成 `21`，因为我们删去了 `demo.png` 一共 8 个字符。当然，你的存储路径肯定和我的有所不同，因此这个数值也是不一样的，要用你的数值减去相应字符数。

操作完成后，我们就可以保存文件，并重新导入这个动作了。此时，再查看动作面板的描述，会发现存储路径确实变了。再播放一次动作，就会发现 Illustrator 存储的 png 文件和当前 AI 文件在同一个文件夹内，且两者文件名是相同的。

![手动修改保存路径后的保存动作][9]

## Batch processing

为了将文件存储为 Web 格式，录制个动作还需要手动修改文件，显然过于麻烦。实际上，动作面板本身就提供了批量操作功能，且允许我们覆盖存储路径。

在动作面板右上角的菜单里，最后一项叫做 Batch，可将某个动作批量作用于一整个文件夹里的所有文件。批量处理对话框的各个选项都是什么意思，我就不再赘述了，可以参考 Adobe 的[帮助文档](https://helpx.adobe.com/illustrator/using/automation-actions.html)。

假设我们有一整个文件夹的 AI 文件，都要用刚才的动作转成 64 色 PNG8 图片。我们就可以按如下方式配置批量操作。

![批量执行动作][10]

## Editing an action

是时候来说说如何修改已经录制好的动作了。即使你是 Illustrator 专家，在录制动作的过程中也是会点错菜单或者不小心结束录制的。下面我们通过录制一个全新的动作，来说说如何操作。

这个动作的效果是将一个选中的对象，往右侧平移拷贝，然后缩放，最后旋转。效果如下图所示。

![拷贝、移动、旋转的动作效果][11]

下面我们就开始创建新动作并模拟失误。

1. 新建一个空文档；

2. 点击动作面板底部从右往左数第二个按钮，在弹出的新建动作对话框输入一个名字，这里我叫做 cp_right。点击确认后会自动进入录制状态；

3. 随便绘制一个形状，你会注意到绘制动作也被录制了，我们稍后处理；

4. 双击选择工具，输入你喜欢的位移，点击确认。点击确认是个故意的错误操作，会做出移动操作，而非拷贝；

5. 双击旋转工具，输入你喜欢的角度，点击确认。

6. 点击动作面板底部第一个按钮结束录制。

此时，你的动作面板将有一个类似下图这样的动作。我顺带标上了一会要进行的修改操作。

![一个需要修改的动作][12]

- 删除绘制图形的步骤。删除一条动作很简单，只要选中要删除的步骤名称，动作面板底部的垃圾桶图标就会变成可用状态。你可以直接点击垃圾桶删除选中步骤，或者将步骤拖拽到垃圾桶图标上。区别是，点击垃圾桶会有确认对话框，直接拖拽过去则会直接删除。这里我删掉 Polygon Tool 这一步。你的绘制步骤名称视你选择的工具，会和我的略有不同；

![删除绘制图形步骤][13]

- 更改移动步骤为拷贝。此时当前动作剩下两个步骤，Move 和 Rotate。这里我们要让 Move 步骤执行拷贝，而非移动操作。最简单的方法，是在动作面板里双击 Move 这步，以再次呼出移动对话框。此时选择 Copy 而非 OK 命令，即可修改成功；

![修改移动步骤为拷贝][14]

- 插入缩放步骤。要插入一个新步骤，我们需要让当前动作重新进入录制状态。所以选中 cp_right 动作或者该动作内的某一个步骤，点击面板底部红色录制按钮。双击缩放工具，输入你喜欢的数值并点击 OK。接着停止录制。如果此时 Scale 动作出现在 Rotate 动作后面，你可以通过拖拽的方式调整步骤的先后顺序。

这样，我们的动作就修改完成了。现在，我们可以选择任何一个元素，来播放该动作。同时，我们会发现在该动作播放完成后，所选元素仍然处于选中状态，因此我们可以连续点击播放，来拷贝出多个变化的元素。

## Nested actions

这个系列后续的文章会开始写代码。所以在最后一节，我要先提及一个编程时常用的概念，就是复用。一个录制好的动作，其实就是一个独立的小功能，也是可以复用的。例如，我们现在已经录制了两个动作，我们可以在以后的动作录制过程中，选择播放这些动作。

![复用已有动作][15]

注意上图第一步叫做 Set Selection。这是 Illustrator 动作面板所特有的，用于选择画布上带有某个指定名称的所有元素。Photoshop 的动作面板也有其特有功能。这些功能都可以在动作面板的右上角菜单里找到。

![动作面板特殊菜单][16]

既然提到了 Set Selection，就顺带说一下用法。

1. 在录制之前，先选中画布上待会要用到的对象；
2. 打开 Window - Attributes 属性面板，并将面板展开到能显示所有选项；
3. 在属性面板最下方的输入框里，输入一个名称（为方便后续使用，建议纯英文，无换行）；
4. 在动作面板的菜单项里，点击 Select Object；
5. 在弹出的对话框里，填写第 3 步输入的名称，点击确定。

![录制动作时选择对象][17]

这样，在播放动作的时候，就会自动进行对象选择了。

至于其他特殊菜单的用法，就留待各位自行参考文档了。

## Wrapping up

通过这篇长长的文章，希望能够对你使用动作面板自动化一些操作起到帮助。如开篇所述，这是最简单的一种自动化方式，不涉及任何代码，但已经可以解决很多日常机械化的操作了。在后续文章里，我们将更加深入，使用 JavaScript 来进行更加复杂的自动化操作及扩展功能的开发。

[1]:https://img.alicdn.com/tfscom/TB1rEvVPpXXXXcPXXXXXXXXXXXX.png
[2]:https://img.alicdn.com/tfscom/TB1IXLjPpXXXXb9aXXXXXXXXXXX.png
[3]:https://img.alicdn.com/tfscom/TB1kQ6BPpXXXXcNXFXXXXXXXXXX.png
[4]:https://img.alicdn.com/tfscom/TB1yt2kPpXXXXa1aXXXXXXXXXXX.png
[5]:https://img.alicdn.com/tfscom/TB1e2r2PpXXXXaWXXXXXXXXXXXX.png
[6]:https://img.alicdn.com/tfscom/TB1YM6CPpXXXXa4XFXXXXXXXXXX.png
[7]:https://img.alicdn.com/tfscom/TB1dg_QPpXXXXa_XpXXXXXXXXXX.png
[8]:https://img.alicdn.com/tfscom/TB1EkvsPpXXXXciXVXXXXXXXXXX.png
[9]:https://img.alicdn.com/tfscom/TB1YMDcPpXXXXcgapXXXXXXXXXX.png
[10]:https://img.alicdn.com/tfscom/TB11YDEPpXXXXa7XFXXXXXXXXXX.png
[11]:https://img.alicdn.com/tfscom/TB1xAjWPpXXXXbWXXXXXXXXXXXX.png
[12]:https://img.alicdn.com/tfscom/TB1P5brPpXXXXXuaXXXXXXXXXXX.png
[13]:https://img.alicdn.com/tfscom/TB1rxDnPpXXXXbJaXXXXXXXXXXX.png
[14]:https://img.alicdn.com/tfscom/TB1Op2qPpXXXXaIaXXXXXXXXXXX.png
[15]:https://img.alicdn.com/tfscom/TB1ghjTPpXXXXXEXpXXXXXXXXXX.png
[16]:https://img.alicdn.com/tfscom/TB1Hl20PpXXXXaSXXXXXXXXXXXX.png
[17]:https://img.alicdn.com/tfscom/TB1aSvDPpXXXXaFXFXXXXXXXXXX.png