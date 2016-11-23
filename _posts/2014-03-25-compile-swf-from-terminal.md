---
layout: post
title: Compile SWF from Terminal
category: programming
poster: https://img.alicdn.com/tps/i1/T1wYToFCxcXXcgJj7X-1200-250.png
summary: Flex SDK offers the mxmlc command line tool which allows user to compile a SWF file from the terminal. This article talks about how to use Flash Professinal to create an SWC file and use the mxmlc command to compile.
---

## 业务背景

最近在业务上有个 Flash 相关的内容。设计师会在 Flash Professional 里面使用时间轴动画，和复杂的影片剪辑嵌套，来制作一些效果比较绚丽的模板。用户可以在网页上预览模板的效果，并上传他们自己的宝贝图片，来制作一个新的创意。

在技术上来看，比较麻烦的地方是，需要在命令行编译一个 SWF 文件，这个文件包含设计师所制作的时间轴动画和交互，并且能够在编译时将用户上传的图片嵌入到 SWF 文件中。

图片在编译时嵌入 SWF 文件，可以使用 Flex SDK 支持的 Embed 语法来实现。命令行的重新编译，在我们的[技术专家如彼同学](http://weibo.com/qhwa)的指导下，也得以成功实现。在一开始要先感谢如彼哥，花了一个下午的时间帮我调试这个过程。

## 目标描述

下面会通过一个示例，抽象出上述业务，描述相关的解决方法。

示例主要做的事情如下。

1. 在一个 ActionScript 3.0 的 FLA 文件中，制作一张图片淡入，同时略微放大，最后淡出的动画效果。用户点击图片本身，会切换播放/暂停的状态。点击事件的绑定在 Document Class 内进行；
2. 上一步骤的图片会通过 IDE 提供的 UILoader 组件加载。为了完成动画效果，这个 UILoader 会在一个 MovieClip 里边。而这个 MovieClip，会关联一个自定义的 UILoaderMc Class，方便加载图片的操作；
3. 将上述动画导出为一个 SWC 文件，修改 Document Class 使其支持命令行加 SWC 文件的编译，且能在编译时嵌入图片。

在我的业务里，第三步应该分为两个内容。一是设计师在制作动画的时候就要把 Document Class 写成支持 SWC 文件编译的结构。二是在服务端，是用 Node.js 读取这个 AS 文件，查询到图片地址，并修改为编译时嵌入图片的结构。

这里为了说明过程，和简化操作，我们就手动来做这两件事。

## 系统环境

下面的操作是在 Mac OS X 里面进行的，所有的快捷键请自行对应 PC 键盘。终端编译的时候在 PC 上应该使用 .exe 的那个文件。这里我的机器只安装了 Flash Professional CC，没有安装 Flash Builder，后面会给出独立的 Flex SDK 下载地址。

## 目标实现

### FLA 文件

这里我们假设图片本身的尺寸为 420x280，并且我们把舞台大小就设置为 420x280。在 Flash 里面，通过 Window - Components (Cmd + F7) 来打开 Components 面板，找到并拖出一个 UILoader 组件到舞台上。当然，这个 UILoader 我们也要调整尺寸为 420x280，完成之后将其转换为一个 MovieClip 元件。

![Convert UILoader to MovieClip](https://img.alicdn.com/tps/i1/TB1V70eHFXXXXc0XVXXMN6FUFXX-840-346.jpg)

此时，舞台上的内容类似下图这样。

![State of current stage](https://img.alicdn.com/tps/i2/TB1TwdlHFXXXXXoXpXXGaph0FXX-848-670.jpg)

下面就是补间动画的创建。为了保证最大兼容性，这里我全都用 Class Tween 来实现。下面这个是动画结束时，刚才的 MovieClip 的属性值。这里要特别指出一点，下图面板的 Display 选项卡下面，有一个 Render 选项。

![Properties panel](https://img.alicdn.com/tps/i3/TB1SiVeHFXXXXbRXVXXuWgZ.VXX-716-1100.jpg)

没记错的话这是 Flash CS5.5 引入的功能，可以把元件缓存为 Bitmap，优化性能。但是这里不能使用这个选项，不然在后面使用 Flex 4.6 SDK 编译完成后，会造成 SWF 文件崩溃，而且在 Debugger 里不会报任何错误。保持 Original 被选中就好。

动画的实现反正很简单，我就不多说了。不过前面我说“略微”放大，也就是缩放的量是非常小的，这是为了稍后指出一个平滑动画的问题。

### Document Class

因为这是个演示嘛，所以我就取名 Document Class 为 Demo 好了。在 Demo.as 里面就是一个很简单的事件绑定。当然，为了和舞台上的那个 MovieClip 交互，需要给它设置一个 Instance Name，这里我就叫它 img_mc 好了。

Demo.as 的代码如下，应该不需要多解释了吧。

{% highlight as3 linenos %}
package  {

	import flash.display.MovieClip;
	import flash.events.MouseEvent;

	public class Demo extends MovieClip {
		private var _isStopped:Boolean = false;

		public function Demo() {
			img_mc.addEventListener(MouseEvent.CLICK, _toggleAnimation);
		}

		private function _toggleAnimation(event:MouseEvent):void {
			if (_isStopped) {
				_isStopped = false;
				MovieClip(root).play();
			}
			else {
				_isStopped = true;
				MovieClip(root).stop();
			}
		}
	}
}
{% endhighlight %}

保存 Demo.as 之后记得到 FLA 里面绑定 Document Class。这个时候如果测试影片，会看到一片空白，因为 UILoader 没有加载任何图片。如果想确认一下代码是否正常，此时可以到 Properties 面板给 UILoader 的 source 属性赋值测试。

### UILoaderMc Class

在业务里，肯定不止一个 UILoader，而且我们需要动态加载图片的功能，因此就需要创建一个 Class，作为 FLA 文件中加载图片元件的 Base Class。这里我们叫它 UILoaderMc。它提供一个 load 方法，方便加载图片。

构造函数很简单，就是在绑定的元件内，找到 UILoader 组件。

{% highlight as3 linenos %}
public class UILoaderMc extends MovieClip {

	private var _uiLoader:UILoader;
	private var _bmpImage:Bitmap;

	// To use this Class, you need to have a UILoader
	// component inside the MovieClip

	public function UILoaderMc(asset:* = "") {
		_setupLoader();

		if (asset) {
			this.load(asset);
		}
	}

	private function _setupLoader():void {
		for (var i:int = 0; i < this.numChildren; i++) {
			if (this.getChildAt(i) is UILoader) {
				_uiLoader = this.getChildAt(i) as UILoader;
				break;
			}
		}
	}
}
{% endhighlight %}

上述 load 方法考虑两种场景，一个是传入图片 URL 字符串，另一个是传入嵌入到 SWF 的 Bitmap 实例。

{% highlight as3 linenos %}
public function load(asset:* = ""):void {
	if (!asset) return;

	if (asset is String) {
		_uiLoader.addEventListener(Event.COMPLETE, _smoothImage);
		_uiLoader.source = asset;
	}
	else if (asset is Bitmap) {
		_uiLoader.source = asset;
		asset.smoothing = true;
	}
}
private function _smoothImage(event:Event):void {
	_uiLoader.removeEventListener(Event.COMPLETE, _smoothImage);

	_bmpImage = event.target.content as Bitmap;
	_bmpImage.smoothing = true;
}
{% endhighlight %}

这里的设置 Bitmap 实例的 smoothing 属性为 true，就是为上面讲到的“略微放大”效果服务的。如果不设置这个属性，当动画非常缓慢时，会看到 UILoader 加载的图片有明显的刷新过程，即看到图片很抖。设置 smoothing 属性能够使动画在速度不快的时候看起来更加平滑。

另外，如果传入 URL 的话，需要监听图片加载完成的事件，再更改 smoothing 属性。若直接给 UILoader 实例的 source 属性赋一个 Bitmap 值，则直接操作即可。

### 使用 UILoaderMc Class 加载图片

在这个示例中，我们假设所有的 AS 文件都和 FLA 文件在一个目录下。回到 FLA 文件里，在 Libraries 面板下找到之前创建的 ImageLoader，在右键菜单中选择 Properties，在弹出的对话框里展开 Advanced 选项，勾选 Export for ActionScript，并修改 Base Class 为 UILoaderMc。

![Export for ActionScript](https://img.alicdn.com/tps/i4/TB1dTReHFXXXXcWXVXXN3m0HFXX-702-784.jpg)

设置完成后到 Demo.as 里边，在构造函数内加载图片。

{% highlight as3 linenos %}
public function Demo() {
	img_mc.addEventListener(MouseEvent.CLICK, _toggleAnimation);
	img_mc.load("./shadow.jpg");
}
{% endhighlight %}

上述代码假设当前目录下一张名为 shadow.jpg 的图片。

此时测试影片，应该就能看到动画效果了。你可以注释掉 UILoaderMc.as 中 _smoothImage 方法内的 smoothing 赋值语句，对比一下动画效果。

### 导出 SWC

为了在命令行编译，我们要把刚才在舞台上制作的动画效果转换为一个 MovieClip 元件，并将其导出为 SWC。

使用 Cmd + F8 创建一个新的 MovieClip 元件，这里我起名为 Animation。在主时间轴上选中所有帧，在右键菜单中选择 Copy Frames。

![Copy Frames](https://img.alicdn.com/tps/i1/TB12xXiHFXXXXabXFXX5b56WpXX-1202-226.jpg)

在 Library 面板里双击 Animation 元件，在时间轴第一帧上右键选择 Paste Frames。此时 Flash 会把内容居中粘贴。 为了后面用 AS 来添加元素的时候方便定位，我在这里手动将元素的左上角移动到元件注册点上。

这里要特别说明一下，其实为了方便导出 SWC，应该在项目一开始就应该创建一个空白 MovieClip，所有的动画都在它里边创建。因为后续移动原点是个很麻烦的事情。我在这里把动画从舞台挪到 MovieClip 里面，主要是对比一下相应 AS 文件的不同，我在项目里面就经历了这个过程。

完成上述操作之后，在 Library 里面的 Animation 原件上选择右键菜单里的 Properties，勾选 Export for ActionScript 和 Export in frame 1。Class 名称我就接受默认的 Animation。

![Export main animation for ActionScript](https://img.alicdn.com/tps/i2/TB1IthhHFXXXXbDXFXXQbf.SpXX-696-778.jpg)

最后，在 Animation 元件的右键菜单里选择 Export SWC file，会弹出保存对话框，我就存在当前 FLA 所在目录里，文件名为 Animation.swc。

### 更新 Document Class

这个示例比较简单。之前看到 Document Class 里面就是加了个事件监听，加载了一张图片。而这些内容都是针对舞台上的一个 img_mc 示例来操作的。现在我们要修改一点代码，去刚才的 Animation Class 里面获取这个 img_mc。

下面列出修改后的代码，并且把原先代码用注释写在旁边方便对比。

{% highlight as3 linenos %}
package  {

	import flash.display.MovieClip;
	import flash.events.MouseEvent;

	public class Demo extends MovieClip {
		private var _isStopped:Boolean = false;
		private var _animation:Animation;

		public function Demo() {
			_animation = new Animation();
			addChild(_animation);

			// img_mc.addEventListener(MouseEvent.CLICK, _toggleAnimation);
			// img_mc.load("./shadow.jpg");
			_animation.img_mc.addEventListener(MouseEvent.CLICK, _toggleAnimation);
			_animation.img_mc.load("./shadow.jpg");
		}

		private function _toggleAnimation(event:MouseEvent):void {
			if (_isStopped) {
				_isStopped = false;

				//MovieClip(root).play();
				_animation.play();
			}
			else {
				_isStopped = true;

				//MovieClip(root).stop();
				_animation.stop();
			}
		}
	}
}
{% endhighlight %}

当上述代码修改完成后，在 Flash IDE 里面使用 Cmd + Return 是能够编译成功的。如果你发现此时编译报错，那在下一步终端编译中一定是失败的。

### 终端编译

通过上述步骤，我们就有了一个 Animation.swc 文件和一个修改后的 Demo.as 文件。至于 UILoaderMc.as 这个文件，由 swc 文件内的 MovieClip 直接引用，因此编译的时候不用考虑它，只要保证文件存在且目录正确即可。

编译需要使用 Flex SDK，可以[点击这里](http://www.adobe.com/devnet/flex/flex-sdk-download.html)下载。

下载完成后解压缩，通过终端进入 SDK 的 bin 目录。

下面假设我的 Demo 相关内容都放在桌面的 swf_terminal 目录下，执行下述命令即可完成打包。

`./mxmlc ~/Desktop/swf_terminal/Demo.as -l ~/Desktop/swf_terminal/Animation.swc -default-size=420,280 -debug=false`

这时应该会编译成功，且双击 Demo.swf 能够看到和 Flash IDE 里边相同的编译结果。但可能会有一个这样的警告。

`Warning: This compilation unit did not have a factoryClass specified in Frame metadata to load the configured runtime shared libraries. To compile without runtime shared libraries either set the -static-link-runtime-shared-libraries option to true or remove the -runtime-shared-libraries option.`

我们会在下一步使用警告里边所说的选项。现在暂且忽略。

至于 Flex SDK 提供的参数，就请各位直接参考 [Adobe 文档](http://help.adobe.com/en_US/flex/using/WS2db454920e96a9e51e63e3d11c0bf69084-7a92.html)了。

### 嵌入图片

刚才编译的结果，图片仍然是外链的。这个步骤我们要把图片嵌入到 swf 文件里。
在我的项目里面，我要通过一个基于 Node.js 的应用，去修改刚才更新过的 Document Class，重新生成一份类似于下面这样子的 Document Class。

{% highlight as3 linenos %}
package  {

	import mx.core.BitmapAsset;
	import flash.display.MovieClip;
	import flash.display.Bitmap;
	import flash.events.MouseEvent;

	public class Demo extends MovieClip {
		// Embed image
		[Embed(source="/Volumes/Macintosh SSD/Users/haoye/Desktop/swf_terminal/shadow.jpg")]
		private var SampleImageClass:Class;
		private var _sampleImage:Bitmap = new SampleImageClass() as Bitmap;

		private var _isStopped:Boolean = false;
		private var _animation:Animation;

		public function Demo() {
			_animation = new Animation();
			addChild(_animation);

			_animation.img_mc.addEventListener(MouseEvent.CLICK, _toggleAnimation);
			_animation.img_mc.load(_sampleImage);
		}

		private function _toggleAnimation(event:MouseEvent):void {
			if (_isStopped) {
				_isStopped = false;
				_animation.play();
			}
			else {
				_isStopped = true;
				_animation.stop();
			}
		}
	}
}
{% endhighlight %}

注意第一行 `import` 了一个 `BitmapAsset` 类，在 class 定义之后有 3 行 Embed 相关的语句。如果你有多张图片，那么需要重复这 3 行代码多次。注意 `[Embed(source="")]` 最后不要加分号。

这时的 Demo.as 文件就是上述代码。重新回到终端编译，此时我们要加上前面警告里面所说的选项，就像这样：

`./mxmlc -static-link-runtime-shared-libraries=true ~/Desktop/swf_terminal/Demo.as -l ~/Desktop/swf_terminal/Animation.swc -default-size=420,280 -debug=false`

回车后如果报错，且报错内容如下：

`Error: The definition of base class BitmapAsset was not found.`

那么，我们需要在编译的时候引入一个 library。这个 library 是在刚才下载到的 Flex SDK 的 frameworks/libs 目录下面的 framework.swc。
使用下述命令重新编译，应该会成功。

`./mxmlc -static-link-runtime-shared-libraries=true ~/Desktop/swf_terminal/Demo.as -l ~/Desktop/swf_terminal/Animation.swc /Volumes/DATA/yehao/Downloads/flex_sdk_4.6/frameworks/libs/framework.swc -default-size=420,280 -debug=false`

注意在 `-l` 后面除了我们导出的 Animation.swc 之外，还引用了 framework.swc。

示例中使用的图片是 138KB，最后对比一下嵌入图片前后的 swf 文件体积，从 20KB 上涨到 149KB，符合预期。

![Comparing SWF files’ size](https://img.alicdn.com/tps/i3/TB10GBfHFXXXXbYXVXXw3hOKVXX-996-464.jpg)

## 注意事项

上面的描述是一个发现问题，解决问题的过程。前面也指出了，在真实开发过程中，有些步骤应该合并。下面把几个要注意的地方再重复一下。

- 在一开始制作动画的时候，就在一个空白的 MovieClip 里面进行，不要直接在舞台上制作；
- 对于 UILoader 组件，不要选择 Cache as Bitmap 优化项；
- 在 Document Class 里面，不要直接操作舞台。本应针对舞台的操作，都转到上述 MovieClip 实例上进行；
- 终端编译时，需要手动指定导出文件的尺寸（即 default-size），并且需要引入相应的 SWC 文件；
- 嵌入图片的 Embed 语句最后不要加分号。

此外，对于动态加载图片的 SWF，如果 SWF 的线上路径和引用图片路径是跨域的话，最好不要使用 Flash IDE 封装好的 UILoader 组件。建议自己在 ActionScript 里面用 Loader 加载图片。若后续要读取或操作图片像素信息，在调用 Loader 实例的 load 方法是，需要传递第二个 Context 参数，类似这样：

{% highlight as3 linenos %}
var loader:Loader = new Loader();
loader.load(new URLRequest("http://example.com/sample.jpg"), new LoaderContext(true));
{% endhighlight %}

这样才会去下载 Policy 文件以确保权限足够。
