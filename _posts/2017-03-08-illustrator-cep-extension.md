---
layout: post
title: Illustrator Automation - CEP Extension
category: programming
poster: https://img.alicdn.com/tfscom/TB1N0P3PVXXXXamXpXXXXXXXXXX.jpg
summary: This article talks about the Creative Cloud Extension SDK. I write CEP extensions in my daily work to help designers automate some workflow, combining ExtrendScript and Actions in Illustrator. The techniques from this article can be used in other Adobe products which also support Adobe Extension SDK extensions like Photoshop, Indesign, Premiere Pro, etc.
---

去年研究了 Adobe Illustrator 和 Photoshop 里一些自动化的方式。从不需要写代码的动作 (Actions) 面板到简单的脚本，进而封装基于 Web 技术的扩展，以及 Photoshop 独有的 Adobe Generator。这一系列的功能让用户能实现相对复杂流程的自动化。每个主题都可以非常深入，而我的研究是满足日常工作需求即可，但这也足够应付多数情况了。本篇来说说 CEP 扩展，使用 HTML 和 CSS 来编写扩展界面，整合之前说过的 Actions 和 ExtendScript 来编写一个完整的扩展。

## Intro to CEP extensions

标题里提到了本篇主题的缩写，CEP，全称为 Common Extensibility Platform。基于这个功能的扩展可用于延伸 Adobe 软件的功能。这类扩展以前叫做 CSXS 扩展，在 Adobe CC 系列软件发布之后更名为 CEP。

简单地说，目前在 Adobe 系列软件内部看到的第三方的面板，很多都是用这套技术实现的。当然，也有 Adobe 自家的扩展，最有代表性的是现在已经更名为 Adobe Color，最早发布的时候叫做 Kuler 的颜色管理面板（新的版本里已经不自带了）。

如果你也装有 Illustrator CC 2016 秋季版本更新之上的版本，那么在 Window - Extensions - Introduction to Shaper 就能打开一个 Adobe 自家的 CEP 扩展，用来介绍 Illustrator 在上述版本新增的绘图识别功能。

![Illustrator 内置的 CEP 扩展，介绍 Shaper 功能][1]

实际上这个扩展就是打开了一个 Modal Dialog，里边的内容都是使用 Web 技术实现的。

支持 CEP 扩展的 Adobe 软件非常多，包括 Photoshop、Illustrator、InDesign、Premiere Pro、After Effects、Animate，甚至已经被开发者冷落了很久的 Dreamweaver。

CEP 扩展用于渲染界面的 Web 引擎是基于 Chromium 的。CEP 5.2 用的是 Chromium 27 和 Node.js 0.8.22；更新的 CEP 6.1 和 CEP 7.0 用的是 Chromium 41 和 IO.js 1.2.0，同时使用 nw.js 来实现 CEF 和 Node 之间的交互。

因此，本篇内容适用所有 CC 版本以上的 Adobe 软件。但要使用一些 ES5 以上的 JS 特性，也就要求 CEP 6.1+，那么 Adobe CC 软件的版本得是 CC 2015.1 以上了。

接下去讲的和 CEP 相关的所有内容，都可以在 Adobe-CEP 的 [Github 仓库](https://github.com/Adobe-CEP/CEP-Resources)找到相关资源。如果你发现有什么没说清楚的，可以去看看 PDF 文档。我们重点就放在如何配置环境，从零开始开发一个完整插件的流程，以及最后的打包发布。

## Development Environment

和 ExtendScript 脚本开发类似，接下去说到的环境配置纯粹是为了调试，以及方便生成新项目用的。如果你有更加熟悉的代码编辑器，写代码的过程依旧推荐在日常常用的编辑器进行。

Adobe 提供的开发环境，叫做 [Extend Builder 3](http://labs.adobe.com/downloads/extensionbuilder3.html)。它是基于 [Eclipse](http://www.eclipse.org/downloads/) 的开发工具，因此我们首先要安装 Eclipse 3.6 及以上版本。因此在前面这两个链接指向的网站上，先下载 Eclipse Neon 和 Extend Builder 3。

我选择的是 Eclipse Neon for Mac。在准备安装时，macOS Sierra 会提示我安装旧版 Java SE 6 runtime。

![安装 Eclipse Neon 需要旧版 Java 环境][2]

此时点击 More Info 会直接跳转到苹果的[一个页面](https://support.apple.com/kb/DL1572?locale=en_US)。如果你在此下载并安装 Java，完成之后再尝试安装 Eclipse，很可能出现下图这个情况。

![Java 版本过旧][3]

呃，这时候我能想到的词只有 interesting。好吧，既然一开始说要装旧版 JVM，自动跳转的链接里又不正确，那么就劳烦各位自行搜索并安装一下 JRE8 了。如果安装 JRE8 之后在终端看到 `java -version` 依旧是 1.6 版本，试试直接在 Oracle 的[这个站点](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)下载安装 JDK8 后再尝试安装 Eclipse。

总之，我在如此折腾一番之后见到了 Eclipse Neon 的安装界面，记得我们马上要使用基于 JavaScript 的 ExtendScript 语言，所以一开始建议选择 Eclipse IDE for JavaScript and Web Developers。

![Eclipse 安装界面][4]

安装过程中一定确保你的网络足够好，会联网下载东西。好不容易安装好 Eclipse 后，启动之。选择 Help - Install New Software，在站点列表右侧点击 Add，在弹出的对话框点击 Archive 选择下载的 Extension Builder 3 的 zip 包文件。

![添加 Extension Builder 3][5]

点击几次确定之后，在添加新软件界面的列表里，就会出现 Adobe Extension Builder 3 的选项，勾选之，点击 Next。

![继续添加 Extension Builder 3][6]

继续点击几次 Next 并同意用户协议之后，会出现 Finish 选项。完成后会再次联网下载安装一些东西。等最终进度条到头之后，便安装好了环境。

![完成安装前最后的软件包下载][7]

重启 Eclipse。选择 Window - Perspective - Open Perspective - Other - Adobe Extension Builder 3 以切换到 Adobe 扩展开发工作空间。

![切换到 Extension Builder 3][8]

## Writing a CEP extension targeting Illustrator

配好环境后，接下去我们以开发一个 AI 插件为例，说说插件的编写和调试。鉴于本篇重点是环境配置和流程介绍，虽然后面的图文里我给插件起名叫 GraphBuilder，实际上我并不会介绍如何去写 Web 界面，仅用预设界面来说明。我可能后续会单独用一篇文章来说明图表工具和变量（Illustrator 的 Variable 功能，非编程语言中的变量概念）的使用。

### New Project Wizard

在花了这么长时间折腾好环境，一大原因是可以用它的新建项目向导来生成一堆初始文件。在跟随下述操作前请确保你已经按照开发环境配置一节最后所述，切换到了 Adobe 扩展开发工作空间。

选择 File - New - Application Extension，呼出新建项目对话框。下述截图注明了每一个选项的作用，你可以根据自己的需要勾选相关复选框。

![新建项目向导 - 填写项目名称和选择模板][9]

一般来说，我们为确保扩展界面和目标软件完美融合，一定会勾选 Synchronize interface with host。多数情况下我们都会对扩展界面有自己的设计，因此 Use Minimal Template 通常不勾选。本篇是扩展编写流程讲解，因此不会用到 IPC 这种同其他 Adobe 软件通信的功能，因此也不勾选。

了解并填写完上述界面后，点击 Next 进入目标软件选择界面。

![新建项目向导 - 选择目标软件][10]

由于我电脑上的软件都更新到了最新版本，因此版本选择一项是置灰的。我们的示例是编写一个 Illustrator 的扩展，因此我勾选了 Adobe Illustrator。点击 Next 进入扩展视窗信息配置界面。

![新建项目向导 - 扩展视窗配置][11]

这里若不配置菜单名称，将无法直接通过 Window 菜单打开扩展，但可以通过代码呼出扩展，例如适用父子扩展的情况。

Window 支持 3 种选项：

- Panel 普通面板，类似 PS、AI 的图层面板一样；
- ModalDialog 一个新窗口。扩展处于活动状态时，软件功能不可用；
- Modeless 类似 ModalDialog，但扩展激活时不影响用户与宿主软件交互。

其他最大最小宽高值和默认宽高值试情况而定，我们暂且保持默认，后续再来调整。

点击 Next 进入最后一步，选择所需的库。

![新建项目向导 - 选择库文件][12]

一般按照默认配置，使用 Adobe CEP Interface Library 就可以。这个库允许我们在扩展中和上一篇所属的 ExtendScript 脚本通信。如果你在扩展界面里要用到 jQuery，可以到 Frameworks 选项卡下勾选。不过 CEP 6.1 以后的版本所用的 Chromium 版本已经够高了，原生的 JS API 在多数情况下已经够用了。Host Adapters 和 Services 提供更高级的库，允许扩展同其他软件做更多的通信，就留给各位自行查找文档了。

点击 Finish 即可完成项目创建。

来看一下向导所创建的目录结构。

```
.
├── .project
├── .settings
│   └── .jsdtscope
├── .staged-extension
│   └── CSXS
│       └── manifest.xml
└── ExtensionContent
    ├── GraphBuilder.jsx
    ├── ext.js
    ├── index.html
    ├── jsx
    │   └── Illustrator.jsx
    ├── lib
    │   └── CSInterface-4.0.0.js
    └── style.css
```

其中 `manifest.xml` 和 `index.html` 是每个扩展必须的。留意一下这里 `manifest.xml` 是在一个隐藏的目录下。而 `index.html` 则是扩展主界面的 HTML 代码。

不过，Adobe 自 2013 年 8 月发布 Extension Builder 3 之后，再也没见其网站更新过。因此上述代码仍然有一点瑕疵。但我们得让扩展先在软件里跑起来，才能知道具体的问题。

### Testing extension in host app

扩展开发完成后，给终端用户使用，会通过 Add-on 市场或者 Extension Manager 进行分发。但我们作为开发者，为方便调试，还需做一点额外的配置，让软件能够加载未签名的扩展。

在 macOS 上，打开终端，输入下述命令。

```
defaults write com.adobe.CSXS.7 PlayerDebugMode 1
```

这会在 `~/Library/Preferences/com.adobe.CSXS.7.plist` 文件里加入一个 `PlayerDebugMode: 1` 的键值对，开启调试模式。你可能需要注销并重新登录以确保结果生效。

在 Windows 上，按 Windows + R 打开运行对话框，输入 `regedit` 打开注册表，找到 `HKEY_CURRENT_USER/Software/Adobe/CSXS.7`，添加一个 `string` 类型的名为 `PlayerDebugMode` 的键，并设置值为 1。

配置完成后，便可将扩展拷贝到各软件对应的目录下，一般是 `[ProgramPath]/CEP/extensions` 重启相应软件即可测试。

不过，我们在上一节用的是新建项目向导，上一节末尾我说 `manifest.xml` 是在一个隐藏的目录。如果你要用拷贝代码到目录的方式调试，务必确保 `manifest.xml` 在扩展项目的 `CSXS` 目录下。

所以我们装了 IDE，还有个好处就是调试时省事。下面说说如何配置。

打开 Eclipse 的偏好设置，在左侧找到 Adobe Extension Builder 3 一项并展开，选择 Target Application。在右侧面板里配置对应软件的路径。一般默认路径都是不对的，因为 Adobe CC 版本的软件都是带有年份编号，而默认路径没有。修改完成后，点击 Apply。

![软件路径配置][13]

切换到 Service Manager 一项。由于此处偏好设置的 CEP 扩展路径是针对当前用户和系统的，不能针对单个软件配置，所以我们可能还需要创建以下 2 个文件夹。

在 macOS 下，确保 `~/Library/Application Support/Adobe/CEP` 和 `/Library/Application Support/Adobe/CEP` 目录存在；在 Windows 下，确保 `C:\Users\{USER}\AppData\Roaming\Adobe\CEP` 和 `C:\Program Files\Common Files\Adobe\CEP` 目录存在。

之后将对应路径配置到下图所示面板里，点击 apply 确认，再点击 OK 关闭对话框。

![CEP 扩展路径配置][14]

此时我们就可以选中项目，在工具条点击 Debug - Debug As - Adobe Illustrator Extension。

![调试扩展][15]

不管 Illustrator 当前是否处于启动状态，软件都会重启一次 AI。因此，调试前务必确认你已经保存好所有的文档。待软件重启之后，我们点击 Window - Extensions。根据你的 Illustrator 版本，有很大的几率，会发现我们的 GraphicBuilder 扩展并没有显示在这。还记得我在上一节末尾说的瑕疵么？这是向导没有生成带有正确配置的 `manifest.xml` 导致的。

在 Project 面板的项目标题上点击右键（点上图我标注了 1 的上方，那个绿色高亮的文字部分），从菜单里选择 Adobe Extension Builder 3 - Bundle Manifest Editor。确保 Bundle Manifest Editor 处于激活状态，在编辑器底部切换到 manifest.xml 标签，在代码窗口任意位置点击右键，选择 Open With - Text Editor。

![编辑 manifest.xml 文件][16]

找到 `<Host Name="ILST" Version="[17.0,17.9]" />` 这一行，把后面的 `17.9` 改成 `99.9` 之后保存文件。这里 `Name="ILST"` 代表目标软件是 Illustrator，版本 17 是指最初版本的 Illustrator CC。我写这篇文章用的版本是 Illustrator CC 2017，版本号是 21。当然，软件后续更新之后，版本号递增，我们为了确保扩展在新版软件仍能使用，这里直接将最大版本改成了 `99.9`。

再次尝试调试，终于可以在扩展菜单下打开我们的扩展了。

![在 AI 扩展菜单找到编写的扩展][17]

### Project code flow

鉴于我们的重点不在如何编写具体的界面和功能，而新建项目向导已经生成了一个简单的面板，那我们就重点剖析一下这个目录结构，方便入手添加自己的代码。

![新建向导生成的主要文件及其作用][18]

如果你有观察过 `manifest.xml` 文件的话，会发现有这么两行，指明入口的两个文件。

{% highlight xml linenos %}
<MainPath>./index.html</MainPath>
<ScriptPath>./GraphBuilder.jsx</ScriptPath>
{% endhighlight %}

首先，`GraphBuilder.jsx` 文件。这个文件定义了一个 `$` 全局变量，在 `$._ext` 下方提供了执行 `jsx` 文件的两个方法。一般我们不修改这个文件。

其次，`index.html`。这是扩展的 HTML 代码，它会引用 `style.css` 和 `ext.js`，分别用来添加面板的样式和用户交互时的 JS 逻辑。当用户通过 Window 菜单打开扩展时，绑定在 `<body>` 元素上的 `onLoad` 事件触发，执行 `ext.js` 里定义的 `onLoaded` 方法。当用户点击按钮的时候，触发 `ext.js` 里定义的 `onClickButton` 方法。

![HTML 和界面映射][19]

接着，`ext.js` 文件。在 `onLoaded` 方法里，向导生成的代码会同步扩展面板的主题色，与软件当前主题色保持一致；若当前软件不是 Flash，则预载 `jsx` 目录下的所有文件。因此，如果需要添加更多的 jsx 脚本文件，直接丢到 `jsx` 目录下即可。当我们修改了界面以后，下述摘录 7-14 行初始化按钮的代码，就可以根据自己的需要，进行修改、保留或删除。

{% highlight javascript linenos %}
function onLoaded() {
  var csInterface = new CSInterface();
  var appName = csInterface.hostEnvironment.appName;

  if (appName != "FLPR") loadJSX();

  var appNames = ["ILST"];
  for (var i = 0; i < appNames.length; i++) {
    var name = appNames[i];
    if (appName.indexOf(name) >= 0) {
      var btn = document.getElementById("btn_" + name);
      if (btn) btn.disabled = false;
    }
  }

  updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
  csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
}
{% endhighlight %}

当点击按钮的时候，`ext.js` 的 `onClickButton` 方法会被调用，执行下述代码。

{% highlight javascript linenos %}
var extScript = "$._ext_" + ppid + ".run()";
evalScript(extScript);
{% endhighlight %}

在 `onLoaded` 方法里预载 `jsx` 目录文件时（本例仅有 `jsx/Illustrator.jsx`），会挂载 `$._ext_ILST` 对象（若后续添加其他 `jsx` 文件，建议也将相关对象挂载到 `$` 上，防止过多全局变量的污染）。因此，点击按钮就是调用了 `jsx/Illustrator.jsx` 文件的 `$._ext_ILST.run` 方法，这样就把扩展面板上的用户操作同 jsx 自动化脚本串起来了。

同时，我们也知道了，要执行某个 `jsx` 脚本，使用 `ext.js` 提供的 `evalScript` 方法即可。若需要访问 `jsx` 脚本的执行结果，还可以给 `evalScript` 传递第二个参数，例如

{% highlight javascript linenos %}
evalScript(extScript, function(result) {
  // do something with result, maybe update the extension UI
});
{% endhighlight %}

### Integrating Actions

若要在插件里调用动作面板里的脚本，实际也是通过 ExtendScript 来处理的。如果你根据我上一篇对 ExtendScript 的介绍，去下载了 Illustrator 的 PDF 参考，并不能找到下面这个方法。但在 ExtendScript Toolkit 里使用帮助 Object Model Viewer，则可以找到 `Application.doScript(action: string, from: string, dialogs: Boolean)` 方法。

例如，我们要调用在[动作一篇]({% post_url 2017-02-11-illustrator-actions %})中录制在 demo 组里的 Save for PNG 动作，就可以在 `jsx/Illustrator.jsx` 文件的 `$._ext_ILST` 对象上，添加一个 saveForPng8 方法。

{% highlight javascript linenos %}
$._ext_ILST = {
  run: function() {}, // implementation not shown here
  saveForPng8: function() {
    app.doScript('Save for PNG', 'demo', false);
  }
};
{% endhighlight %}

### Debugging

虽然在 eclipse 里通过 debug 方式可以在宿主软件载入扩展，但这种方式调试起来并不方便。因为使用的是 Web 技术，最方便的还是在浏览器环境下调试。

首先，在项目根目录下创建一个名为 `.debug` 的配置文件。但本例使用 eclipse 的新建向导创建，故此处根目录指代 ExtensionContent 目录。由于文件名是 `.` 开头的，在图形界面不容易创建。在 macOS 可以直接在终端 `touch .debug`，在 Windows 则在命令行使用 `copy con .debug` 后再按 `ctrl + z` 来创建一个空文件。

这个配置文件里写的是当前扩展各个面板的调试端口。例如我们的扩展只有一个面板，是针对 Illustrator 的，则配置文件会这么写：

{% highlight xml linenos %}
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
  <Extension Id="io.github.kfitfk.GraphBuilder.extension1">
    <HostList>
      <Host Name="ILST" Port="8000"/>
    </HostList>
  </Extension>
</ExtensionList>
{% endhighlight %}

至于面板的 ID，可以在 eclipse 里查看 manifest 信息，切换到 Extension 标签页里查看。注意，如果你要修改配置，一定切换到文本编辑器的模式，手动改 xml 配置项。不然在图形界面修改保存之后，eclipse 会把我们前面修改过的软件版本号覆盖回去。

![扩展面板 ID 配置][20]

保存上述文件，并重新载入插件到 Illustrator。打开插件面板，此时便可打开 Google Chrome（由于扩展面板是基于 Chromium 的，故推荐使用 Chrome），根据所配端口打开相应调试页面。上述例子即为 `localhost:8000`。

![在浏览器中调试][21]

根据扩展包含面板个数不同，这里显示的链接数也会不同。我们仅有一个面板，因此点击 GraphBuilder。浏览器会跳转到一个类似开发者工具的界面。如果你是 Web 开发者，那对这个界面一定非常熟悉了。你可以像平常调试网页那样，去修改 HTML 和 CSS，给 JS 打断点等，这些修改会即时反馈到 Illustrator 的扩展里。

如过你不太了解 Chrome 浏览器调试的话，可以参看 [Chrome DevTools Overview](https://developer.chrome.com/devtools)。

在说下一个内容之前，我必须再指出一点。可能你已经发现，新建向导给我们生成的 `ext.js` 文件，在处理面板主色调同步的时候，是会报错的，错误信息类似 `Uncaught ReferenceError: panelBgColor is not defined`。如果你使用的是 Illustrator 默认的暗色系界面，你实际上一开始就会注意到扩展的主背景还是白的。

![修复 ext.js 两个主题配色错误][22]

不过这两个问题非常容易解决。首先，在 `ext.js` 里搜索 `panelBgColor`，你只能找到一处，将其改为 `panelBackgroundColor` 即可；然后，找到 `appName == "PHXS" || appName == "PPRO" || appName == "PRLD"` 这串条件判断，你会发现它下方有一堆注释，说这个 `if` 块里的代码仅适用于 Photoshop。在 2014 年第一版 Adobe CC 套件发布的时候确实是这样。不过后来新版的 Illustrator 也有暗色系界面了。因此，我们在这个条件判断最后再加上 Illustrator 即可。也就是将其改为 `appName == "PHXS" || appName == "PPRO" || appName == "PRLD" || appName == "ILST"`。

### Panel Icons

我们观察到，Adobe 系列软件里，每一个面板在收起时的图标都是不同的。我们可以在 `manifest.xml` 里指定扩展的图标。屏幕可根据尺寸和像素简单分为普通屏和高清屏，软件又有亮色系和暗色系之分，因此我们至少需要准备 2x2=4 个图标文件。倘若你还想区分普通状态和鼠标悬浮状态，则应该有 8 个图标文件。

图标文件可以放在扩展目录下的任何位置，但为方便管理，通常会创建一个 `images` 目录来存放。根据我自己的测试，1x 的图标为 23x23，2x 的图标为 46x46，且 1x 和 2x 的图标文件名应保持一致，后者末尾添加 `@2x` 后缀。例如 `lightNormal.png` 和 `lightNormal@2x.png`。

准备好图标后，手动编辑 `manifest.xml` 文件，在面板的 `<UI />` 下一级，添加 `<Icons />` 信息，例如

{% highlight xml linenos %}
<Icons>
  <Icon Type="Normal">./images/lightNormal.png</Icon>
  <Icon Type="RollOver">./images/lightHover.png</Icon>
  <Icon Type="DarkNormal">./images/darkNormal.png</Icon>
  <Icon Type="DarkRollOver">./images/darkHover.png</Icon>
</Icons>
{% endhighlight %}

## Packaging and publishing

开发并调试完成后，我们就可以准备将插件打包上传到扩展市场了。扩展市场里有免费和收费两种扩展。和所有发布到各类市场的机制一样，我们需要在打包时带上签名文件，否则扩展不能上传到市场中。倘若你直接将扩展包分发给用户，除非用户机器页也像我们一样，配置了 `PlayerDebugMode`，否则即使安装到指定目录，扩展依旧不可用。至于签名证书文件呢，免费扩展可以使用自签名证书（马上会介绍）；收费扩展必须使用受信任的第三方机构所颁发的证书，[详见此处](https://www.adobeexchange.com/resources/7#signcert)。

**NOTE** 建议在打包前移除之前创建的 `.debug` 文件。

如果只是发布免费应用，在 Extension Builder 里就可以生成自签名证书。

首先，在 Project 面板选中当前项目，在右键菜单或者 File 菜单下选择 Export 选项，打开项目的导出对话框。

![打开 Export 窗口][23]

之后，在导出向导选择框里，展开 Adobe Extension Builder 3 一项，选择 Application Extension 并进入下一步。此时，在 Certificate 一栏右侧，会看到 Create 按钮，点击在下图所示对话框中输入你的证书信息。

![创建 P12 证书][24]

确认之后，eclipse 会自动将证书信息填好。

![打包配置项][25]

如果你已经有证书，则点击 Certificate 一栏右侧的 Browser 进行选择，并手动输入证书密码。TSA 服务地址一定要是可用的，否则提交扩展时可能被拒。

所有选项配置完成后，点击 Finish 就会生成一个 zxp 文件。这其实就是一个 zip 文件。如果你想直接将扩展分发给用户，那么告知用户将扩展名改为 zip 后，解压缩，拷贝到软件对应的扩展目录即可（在 CC 2014 及以前的版本，可以直接通过 [Adobe Extension Manager CC](http://www.adobe.com/products/extension-manager.html) 安装 zip 文件）；如果你要发布到扩展市场，可以到 [Adobe Add-ons 站点](https://creative.adobe.com/addons) 登录，按相应提示进行上传。

## Wrapping up

本篇主要讲解在 eclipse 使用 Adobe Extension Builder 3 开发扩展的流程，并以 Illustrator 为例演示了一个例子。扩展可以做的事情是很多的，我只是叙述了必要步骤和最常用的一些内容。即使如此，本篇的篇幅已经相当长了。若要更加深入，建议各位查看开篇时提到的 Adobe-CEP 的 [Github 仓库](https://github.com/Adobe-CEP/CEP-Resources)。

至此，和 Illustrator 自动化相关的介绍暂告一段落。下一篇我会转到 Photoshop，介绍目前只有 PS 支持的 Adobe Generator。

[1]:https://img.alicdn.com/tfscom/TB1AKnPPVXXXXc2XFXXXXXXXXXX.png
[2]:https://img.alicdn.com/tfscom/TB1ccLTPVXXXXbpXFXXXXXXXXXX.png
[3]:https://img.alicdn.com/tfscom/TB1UHbsPVXXXXbUaXXXXXXXXXXX.png
[4]:https://img.alicdn.com/tfscom/TB1Ob_xPVXXXXaIaXXXXXXXXXXX.png
[5]:https://img.alicdn.com/tfscom/TB1zpTwPVXXXXcraXXXXXXXXXXX.png
[6]:https://img.alicdn.com/tfscom/TB1yUMXPVXXXXanXXXXXXXXXXXX.png
[7]:https://img.alicdn.com/tfscom/TB1WRv_PVXXXXbnXXXXXXXXXXXX.png
[8]:https://img.alicdn.com/tfscom/TB1ugbAPVXXXXbNaXXXXXXXXXXX.png
[9]:https://img.alicdn.com/tfscom/TB1BKPpPVXXXXXVapXXXXXXXXXX.png
[10]:https://img.alicdn.com/tfscom/TB197HRPVXXXXXVXFXXXXXXXXXX.png
[11]:https://img.alicdn.com/tfscom/TB1Ltf1PVXXXXXOXpXXXXXXXXXX.png
[12]:https://img.alicdn.com/tfscom/TB1F.zkPVXXXXcBapXXXXXXXXXX.png
[13]:https://img.alicdn.com/tfscom/TB1TIrMPVXXXXX5XVXXXXXXXXXX.png
[14]:https://img.alicdn.com/tfscom/TB1ClbtPVXXXXaEaXXXXXXXXXXX.png
[15]:https://img.alicdn.com/tfscom/TB1pvY1PVXXXXXFXpXXXXXXXXXX.png
[16]:https://img.alicdn.com/tfscom/TB1x_rQPVXXXXanXFXXXXXXXXXX.png
[17]:https://img.alicdn.com/tfscom/TB1RQPDPVXXXXa8XVXXXXXXXXXX.png
[18]:https://img.alicdn.com/tfscom/TB1e4Y.PVXXXXaOXXXXXXXXXXXX.png
[19]:https://img.alicdn.com/tfscom/TB17Kz3PVXXXXbbXpXXXXXXXXXX.png
[20]:https://img.alicdn.com/tfscom/TB1BOngPVXXXXaTaFXXXXXXXXXX.png
[21]:https://img.alicdn.com/tfscom/TB1jdY4PVXXXXaJXpXXXXXXXXXX.png
[22]:https://img.alicdn.com/tfscom/TB1egj7PVXXXXclXXXXXXXXXXXX.png
[23]:https://img.alicdn.com/tfscom/TB1v0nIPVXXXXcCXVXXXXXXXXXX.png
[24]:https://img.alicdn.com/tfscom/TB1iC2aPVXXXXbnaFXXXXXXXXXX.png
[25]:https://img.alicdn.com/tfscom/TB1LXPmPVXXXXcgapXXXXXXXXXX.png