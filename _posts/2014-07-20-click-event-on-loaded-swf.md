---
layout: post
title: Click Event on Loaded SWF
category: programming
poster: http://gtms03.alicdn.com/tps/i3/TB1KuukFVXXXXa_XFXXg4LTVXXX-1200-250.jpg
summary: This article talks about the click mouse event listener on a loaded SWF file. I encounter a problem that when the user clicks the loaded SWF file, the event listener on the loader cannot be notified. The solution is simple. But I guess the process of solving the problem is insteresting and worth an article.
---

最近在做 VAST 3 的 Flash 实现。至于 VAST 3 是什么，简单地说，就是一个视频媒体和广告投放服务器之间的通用交互协议。具体的可以在 IAB 的[这个页面](http://www.iab.net/guidelines/508676/digitalvideo/vsuite/vast)里查看。这几天主要解决一个 SWF 加载之后点击无法捕获的问题。最后同事帮我查出来之后还是蛮简单的，与安全相关。下面具体地说说这个过程，挺有意思的。

## 广告类型和点击事件监听方式

VAST 3 中给出 5 种广告类型，但就媒体文件类型来说，主要有 3 种：视频，图片和 Flash。简单描述一下这 3 种广告的点击事件监听方式。

### 视频

在展现视频广告的时候，直接使用 ActionScript 3 提供的 `NetConnection`，`NetStream` 和 `Video` 类就可以了。因为 `Video` 类没有继承于 `InteractiveObject`，要在 `Video` 类的实例外套一层 `Sprite`，来可捕获点击事件。

### 图片

图片广告使用 `Loader` 类来加载，可以直接监听 `Loader` 实例上的点击。

### Flash

理论上来说，Flash 类型的广告在用 `Loader` 类加载之后，也是直接监听 `Loader` 实例上的点击。问题就出在这里。在本地测试的时候，可能会发现异常；放到线上之后，出现异常的概率可能要大一些。

## Flash 广告的点击监听问题

### 问题重现

一开始我使用的是[淘宝线上的一个 Flash 广告](http://strip.taobaocdn.com/tfscom/T13sAUFIBXXXXtxVjX.swf)来做测试，为了说明问题，把这个广告的加载和展现的代码抽出为下面这样：

{% highlight as3 linenos %}
package  {
    import flash.display.Sprite;
    import flash.display.Loader;
    import flash.net.URLRequest;
    import flash.events.MouseEvent;
    import flash.events.Event;

    public class Main extends Sprite {

        private var _container:Sprite;
        private var _loader:Loader;

        public function Main() {
            _container = new Sprite();

            _loader = new Loader();
            _loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onComplete);
            _loader.load(new URLRequest("http://strip.taobaocdn.com/tfscom/T13sAUFIBXXXXtxVjX.swf"));

            _container.addEventListener(MouseEvent.CLICK, onClick);
            _container.addChild(_loader);

            addChild(_container);
        }

        private function onComplete(event:Event):void {
            trace(_loader.contentLoaderInfo.width);
            trace(_loader.width); // 0
            trace(_container.width); // 0
        }

        // onClick is never triggered in my case
        private function onClick(event:MouseEvent):void {
            trace("clicked");
        }
    }
}
{% endhighlight %}

对于这个广告，在加载完成之后，发现点击广告的任何区域，上述 `onClick` 方法都没有触发，而且 `Loader` 和 `Sprite` 实例的宽度并没有发生变化。

### 不太完善的解决方案

一开始以为是容器尺寸的问题，所以我自己在 `_container` 上画了一个跟广告尺寸一样大的矩形。

代码里删去 Main 构造方法里的这一行：

{% highlight as3 linenos %}
_container.addChild(_loader);
{% endhighlight %}

在 `onComplete` 里面画完矩形之后再添加：

{% highlight as3 linenos %}
private function onComplete(event:Event):void {
	_container.graphics.beginFill(0xffffff);
	_container.graphics.drawRect(0, 0, _loader.contentLoaderInfo.width, _loader.contentLoaderInfo.height);
	_container.graphics.endFill();
    _container.addChild(_loader);
}
{% endhighlight %}

结果当然是没有任何效果。

于是在 [StackOverflow](http://stackoverflow.com/questions/24694528/how-to-listen-to-click-event-on-a-container-which-contains-a-loader-which-loads) 上面咨询了一下，有人评论说直接把点击事件加在 `_loader.content` 上面。于是我就把 `onComplete` 方法改成了这样：

{% highlight as3 linenos %}
function onComplete(event:Event):void {
	_container.addChild(_loader);
	_loader.content.addEventListener(MouseEvent.CLICK, onSwfClick);
}

function onSwfClick(event:MouseEvent):void {
	trace("Loaded SWF clicked");
}
{% endhighlight %}

测试发现 onSwfClick 这个方法确实在点击的时候被调用了，在浏览器里边也测试通过。

### 新的问题

因为这个 VAST SDK 最终是给第三方播放器用的，所以还是多测试一些影片比较好。刚好前两天淘宝网的 Logo 是个静态 SWF，我就拿过来再验证一下，结果碰到了新的问题。

要重新这个问题，只要把最初的那段代码里，`Main` 构造方法内的广告地址更换一下即可。

{% highlight as3 linenos %}
_loader.load(new URLRequest("http://gtms04.alicdn.com/tps/i4/TB1Fzd.FVXXXXaOXXXXeflbFXXX.swf"));
{% endhighlight %}

本地测试影片，发现点击淘宝网的 Logo，调用了 `onSwfClick` 方法；点击空白区域或者渐变背景，则会调用 `onClick` 方法。

这个问题看起来感觉有些怪异，于是又去 Adobe 的 ActionScript 论坛上面咨询了一下。Adobe 的 MVP 首先建议我设置容器对象的 `mouseChildren` 为 `false`，这样肯定能监听到容器上的点击。但很明显会导致无法与被加载的 SWF 文件交互的问题。后来怀疑是否被加载的 SWF 本身有阻止事件冒泡的代码，确认之后，这只是个补间动画和逐帧动画组成的文件，不含任何 ActionScript 代码。那说明问题还是处在我的代码上面。

### 解决方案

我把上面的问题代码发给我们这专门做 Flash 和图表的同学帮忙看看，在一个多小时之后，终于发现是安全上的问题。

最简单的解决方式，是在我的 SDK 里边，只在 `_container` 上监听点击事件，并在加载完广告之后，调用一下 `Security.allowDomain` 这个方法。就像这样：

{% highlight as3 linenos %}
// Other import statements here
import flash.system.Security;

function onComplete(event:Event):void {
	Security.allowDomain(_loader.contentLoaderInfo.url);
	_container.addChild(_loader);
}
{% endhighlight %}

这个方法能够保证被加载的 SWF 在跨域的情况下有权限访问 SDK 中的内容。也就是说，被加载的 SWF 可以把点击事件冒泡到上层容器。

### 细节说明
在第二个例子里点击淘宝网会触发 `onSwfClick`，而点击背景则是触发 `onClick`，是因为这个 SWF 文件的背景就是一张位图，即 `Bitmap` 的实例。在 ActionScript 里面，`Bitmap` 类不是 `InteractiveObject` 的子类，即不能响应任何点击事件，事件冒泡也就不会在被加载的 SWF 上进行。而淘宝网那个 Logo 是套在一个 `MovieClip` 里的，所以点击 Logo 的话，这个 `MovieClip` 实例会开始冒泡点击事件，结果因为安全问题，无法冒泡到 `_loader`。

而第一个测试用的 SWF 广告之所以能够在浏览器里面也测试成功，是因为 SWF 内已经有对应的 `Security.allowDomain` 调用了，所以访问 `_loader.content` 是不会抛出异常的。

这也说明了 `Security.allowDomain` 是单向的，若要在跨域的情况下互相访问，得在两个 SWF 内都做出对应的声明才行。