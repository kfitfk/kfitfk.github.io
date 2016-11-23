---
layout: post
title: Flash Runtime Font Embedding
category: programming
poster: https://img.alicdn.com/tps/i4/TB1ab3YHFXXXXcCXVXXg4LTVXXX-1200-250.jpg
summary: This article talks about how to create a SWF font file and load that file at runtime. We'll discover two common ways of creating such a SWF font file, by using the GUI of Flash Pro IDE and with pure ActionScript 3. Then onto the loading process, either from a local file system or from an online service. A potential naming conflict is covered as well. Finally, a simple unicode range generator.
---

## The purpose

最近研究 Flash 广告创意内嵌入字体的问题，主要解决两种产品需求。一是用户可编辑的文字能够使用特殊字体；二是用户可编辑的文字支持旋转效果。这里说的用户可编辑，是指我在项目里制作的 Flash 广告创意，最终会放到网页上，供用户填写一些宝贝的标题、价格、促销等信息。

为了防止最后生成的 SWF 体积过大，不能把整个字体嵌入 SWF 中。就算可以这么做，也是非常不合理的，因为一个广告创意里的文字再怎么多，也就那么一些文字。按需嵌入字体比起完整引用，体积要小得多。

由于最终创意用到的字体是未知的，所以要在使用 mxmlc 编译前，再去解析用户填的数据，并生成相应的 `unicodeRange`。不过这一步涉及广告工具的后台逻辑了，所以下面并不会讨论。

接下去要说的主要内容有：

- 在 Flash Professional 里使用 `Embed` 语法嵌入字体；
- 制作、加载和使用 SWF 字体文件；
- 处理同名字体的冲突；
- 生成 `Embed` 使用的 `unicodeRange` 字符串。

另外我自己熟悉的 IDE 是 Flash Professional，所以接下去的讨论是基于这个 IDE 的。

## SWF font file

广告创意在线上编辑的时候，是要即时预览的。这里有两种处理字体的方案：一是专门提供一个文件体积较大的编辑用 SWF，里边嵌入了完整的字体；二是在编辑时加载外部 SWF 字体文件。

这里选择方案二。这样的话 SWF 字体文件可以被多个创意复用，字体独立于创意，方便维护。

### Creating a SWF font file

有两种方式来创建一个 SWF 字体文件。一是在使用 Flash Pro 的 Library（库）面板；二是通过 ActionScript 来嵌入。

下面以嵌入微软雅黑为例，来展示两种方法的步骤。

#### Using the library panel

1. 新建一个 ActionScript 3.0 FLA 文件；
2. 点击库面板右上角的菜单按钮，选择 New Font 选项；
    ![New Font](https://img.alicdn.com/tps/i3/TB1M6.1HFXXXXcxXFXXKFs2PpXX-584-228.png)
3. 在弹出的对话框中，选择一个字体，输入自定义的字体名称，并勾选需要嵌入的字符集。这里的名称可以是任意的，后面不会用到，但所选的字体（Family 一栏）必须记住，会在代码中使用。字符集的选择，对于简体中文的话，一般勾选 Uppercase，Lowercase，Numerals，Punctuation 和 Simplified Chinese - Level 1。如果需要更多生僻字或者繁体等支持，可以按需勾选。至于各个字符集内都包含哪些文字，如果你有下载 Flex SDK 的话，可以到 `path_to_flex_sdk/frameworks/flash-unicode-table.xml` 查看。
    ![Font embedding dialogue box step 1](https://img.alicdn.com/tps/i1/TB1QiZYHFXXXXXiXVXXrPhbTpXX-1798-776.png)
4. 把上一步的对话框切换到 ActionScript 选项卡，勾选 Export for ActionScript 和 Export in frame 1。这里的 Class 名默认是根据上一步我说任意填写的 Name 一项生成的，可以改成任何合法的名称，并且需要记住这个 Class 名。
    ![Font embedding dialogue box step 2](https://img.alicdn.com/tps/i2/TB1giwZHFXXXXc3XFXXjTQnOpXX-1790-864.png)
5. 点击上一步的对话框右侧 OK 按钮，发布 SWF。

#### Using ActionScript

1. 新建一个 ActionScript 3.0 FLA 文件和一个 AS 文件；
2. 找到你需要嵌入的字体文件在本地的路径，在 AS 文件中使用以下代码嵌入。

    {% highlight as3 linenos %}
    package  {
      import flash.display.MovieClip;

      public class FontEmbedding extends MovieClip {

        [Embed(source="/Library/Fonts/Microsoft/Microsoft Yahei.ttf",
          fontName = "MicrosoftYahei",
          mimeType = "application/x-font",
          embedAsCFF="false")]
        public static var MicrosoftYahei:Class;

        public function FontEmbedding() {

        }
      }
    }
    {% endhighlight %}

3. 把 FLA 的 Document Class 设置成上述 AS 文件，并发布 SWF。

上述代码只用到了 `Embed` 字体最基本的属性，更多选项请参考 [Adobe 文档](http://help.adobe.com/en_US/flex/using/WS2db454920e96a9e51e63e3d11c0bf69084-7f5f.html)。

另外，如要在 Flash Pro 里通过编译，需要下载 [Flex SDK](http://www.adobe.com/devnet/flex/flex-sdk-download.html) 并在 Flash Pro 的偏好设置里对 Flex SDK 路径做出正确配置。

![Flex SDK 路径配置](https://img.alicdn.com/tps/i4/TB1UDA6HFXXXXbAXFXX2iDV2FXX-1318-378.png)

### Using a SWF font file

有了字体 SWF 文件，便可以在其他 SWF 中引用。引用方式很简单，直接用 Loader 类加载即可。但本地加载/线上同域加载和线上跨域加载，会有所区别。

下面是基本的加载和使用方式，加载的是使用上述 Flash Pro Library（库）面板配置发布的字体文件，适用于本地或线上同域字体文件加载和使用。

{% highlight as3 linenos %}
package  {
  import flash.display.Loader;
  import flash.display.Sprite;
  import flash.events.IOErrorEvent;
  import flash.events.Event;
  import flash.net.URLRequest;
  import flash.system.LoaderContext;
  import flash.text.Font;
  import flash.text.TextField;
  import flash.text.TextFieldAutoSize;
  import flash.text.TextFormat;

  public class FontLoading extends Sprite {

    // 以下两个字符串的值来自嵌入字体的文件配置
    private var _fontNameIde:String = "微软雅黑"; // Family 名称
    private var _fontClassIde:String = "MicrosoftYahei"; // Class 名称

    private var _fontNameAs:String = "MicrosoftYahei";

    private var _loader:Loader;

    public function FontLoading() {
      loadFont();
    }

    private function loadFont():void {
      _loader = new Loader();
      _loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onFontLoaded);
      _loader.addEventListener(IOErrorEvent.IO_ERROR, onFontLoadingFailed);
      _loader.addEventListener(IOErrorEvent.NETWORK_ERROR, onFontLoadingFailed);
      _loader.addEventListener(IOErrorEvent.VERIFY_ERROR, onFontLoadingFailed);
      _loader.addEventListener(IOErrorEvent.DISK_ERROR, onFontLoadingFailed);

      // 本地加载或线上同域加载
      _loader.load(new URLRequest("./font_embedding_ide.swf"));
    }

    private function onFontLoaded(event:Event):void {
      trace("Successfully loaded font: ", _fontNameIde);
      if (event.target.applicationDomain.hasDefinition(_fontClassIde)) {
        var FontClass:Class = event.target.applicationDomain.getDefinition(_fontClassIde) as Class;
        Font.registerFont(FontClass);
        init();
      }
      else {
        trace("Can't access font: ", _fontNameIde);
      }
    }

    private function onFontLoadingFailed(event:IOErrorEvent):void {
      trace("Can't load font: ", _fontNameIde);
    }

    private function init():void {
      var format:TextFormat = new TextFormat();
      format.font = _fontNameIde;
      format.size = 30;
      format.color = 0xff4400;

      var field:TextField = new TextField();
      field.defaultTextFormat = format;
      field.text = "旋转的文字";
      field.embedFonts = true; // 使用外部字体，一定设置为 true
      field.autoSize = TextFieldAutoSize.LEFT;
      field.rotation = 30;
      field.x = 24;
      addChild(field);
    }
  }
}
{% endhighlight %}

如果线上字体 SWF 和加载这份字体的 SWF 是跨域的，则加载代码应做如下修改。

{% highlight as3 linenos %}
// 线上跨域加载
var context:LoaderContext = new LoaderContext(
  true,
  new ApplicationDomain(ApplicationDomain.currentDomain),
  SecurityDomain.currentDomain
);
_loader.load(new URLRequest("http://your_font_address"), context);
{% endhighlight %}

注意，上述修改在 Flash Pro IDE 里面直接发布是会报运行时错误的，发布后需要上传到线上，或使用本地的 HTTP 服务预览。字体 SWF 所在的服务器必须配置 `crossdomain.xml` 确保加载方有权限访问字体 SWF 内容，否则会出现安全报错。

假如加载的是上述 ActionScript 方式生成的 SWF 字体文件，则 `onFontLoaded` 方法可以改成这样。

{% highlight as3 linenos %}
private function onFontLoaded(event:Event):void {
  trace("Successfully loaded font: ", _fontNameAs);

  if (event.target.applicationDomain.hasDefinition("FontEmbedding")) {
    var FontEmbeddingClass:Class = event.target.applicationDomain.getDefinition("FontEmbedding") as Class;
    Font.registerFont(FontEmbeddingClass.MicrosoftYahei);
    init();
  }
  else {
    trace("Can't access font: ", _fontNameAs);
  }
}
{% endhighlight %}

在后续 `init` 方法里，赋给 `format.font` 的值，相应地改为 `Embed` 时使用的 `fontName`，本例为 `MicrosoftYahei`。

因此，通过 Library（库）面板嵌入字体的话，字体名是系统字体名；而使用 ActionScript 方式，则可以指定任意字体名。

## About the font name

假如一个文件内部既有 `Embed` 语法嵌入的字体，或者使用 Flash Pro 字体面板嵌入的字体，又有外部加载的 SWF 字体文件，并且这些方式嵌入字体时都使用了同一个字体名，那么以最先嵌入字体为准。

举例来说，一个 FLA 文件使用 Flash Pro 的字体面板嵌入了微软雅黑字体，并且选择嵌入的字符集为大小写字母。后来在这个 FLA 的 Document Class 里加载了一份外部字体，这份字体包含完整的雅黑中文字符集，且该字体的 `Embed` 语法中使用的 `fontName` 也是 `"微软雅黑"`。那最终将导致使用到微软雅黑字体的所有的中文都无法渲染，因为最初嵌入的那份字体所包含的字符集只有大小写字母，不包括中文。

因此，在使用 ActionScript 方式嵌入字体时，尽量保证 `fontName` 和系统字体名是不一样的，防止不同 SWF 文件发生字体嵌入冲突覆盖。

## The solution to my problem

### Font decision

在我的需求里，一份创意 SWF 仅包含其内部用到的字符，当进入编辑界面时，通过 JavaScript 调用 ActionScript 方法，加载相应的完整字符集字体 SWF 文件。这样，通过一个变量，就能决定是使用预先嵌入的字体，还是使用外部字体，来渲染部分文本框。

最简单的方式，就是使用 Flash Pro 的 Text Tool 创建动态文本框，并配置好字号、颜色、位置等属性，再通过一个 `TextFormat` 实例，仅设置 `font` 属性，赋给该文本框，即可实现外部字体的调用。

### UnicodeRange

当用户编辑完创意后，需要解析用户填写的数据，生成相应的 UnicodeRange 字符串，用于 `Embed` 语句的 `unicodeRange` 属性。解析的具体过程涉及业务逻辑，这里就不叙述了。在拿到所有需要嵌入的文字后，用下述方法生成相应的编码。我的后端应用基于 Node.js，因此这是一个 JavaScript 的方法。

{% highlight js linenos %}
function flexEmbedCharUnicode(charCode) {
  var leadingZeros = '';
  for (var i = 0; i < 4 - charCode.length; i++) {
    leadingZeros += '0';
  }
  return 'U+' + leadingZeros + charCode;
}

function flexEmbedUnicodeRanges(string) {
  var unicodeRange = []
  var temp = '';
  for (var i = 0; i < string.length; i++) {
    temp = flexEmbedCharUnicode(string.charCodeAt(i).toString(16));
    if (unicodeRange.indexOf(temp) === -1) {
      unicodeRange.push(temp);
    }
  }
  return unicodeRange.join(',');
}

// e.g.
flexEmbedUnicodeRanges('生成 UnicodeRange 测试');
// will output:
// U+751f,U+6210,U+0020,U+0055,U+006e,U+0069,U+0063,U+006f,U+0064,U+0065,U+0052,U+0061,U+0067,U+6d4b,U+8bd5
{% endhighlight %}

