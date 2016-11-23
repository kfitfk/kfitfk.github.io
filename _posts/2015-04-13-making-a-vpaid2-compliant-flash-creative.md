---
layout: post
title: Making a VPAID 2 Compliant Flash Creative
category: programming
poster: https://img.alicdn.com/tps/i2/TB1BM8XHFXXXXcIXpXXg4LTVXXX-1200-250.jpg
summary: This article walks you through the ActionScript 3 part of the VPAID 2 specification. I first comment most of the VPAID inerface properties and methods as well as the events. Then I implement a video player widget for the VPAID creative. After that, I put all the things together to show you how the VPAID creative interacts with the VPAID player. Feel free to download and play with the sample code.
---

## Intro

现在国内的视频站点已陆续开始支持符合 VPAID 2 协议的广告了。VPAID 是 IAB 给出的一个广告规范，可让用户在广告播放期间与之交互，并知会支持 VPAID 创意的播放器相关的用户行为和事件。

VPAID 协议不处理跨平台的问题。一个符合 VPAID 协议的 Flash 广告，不能同 JavaScript 版本的 VPAID 播放器通信。因此，要支持多个平台，必须使用不同的语言制作多种格式的广告，或者经过其他协议转换。下面的内容是针对 Flash 平台的，我用的 IDE 是 Flash Professional CC 2014，和 ActionScript 3.0 语言。

VPAID 2 是可以独立于 VAST 3 工作的，所以下面只在描述一些交集事件的时候，会有和 VAST 3 协同工作的内容。

另外，这篇文章的重点是 VPAID 2 创意，不是 VPAID 2 播放器。下面会先给规范中提到的 Interface 和 Events 做注解，之后提供一个 VPAID 创意内部的视频播放控件，最后描述一个完整的创意展现、交互流程，并给出一份示例创意代码。

## Interface

在 VPAID 2 规范的 6.1 一节里，给出了 VPAID 创意需要实现的方法，和推荐 VPAID 播放器获取到创意之后的封装方法。这里针对广告创意的实现，只关注前者。规范的 3.1 和 3.2 节详细描述了每一个属性和方法，下面列出这些属性和方法，并带上简要注释。

{% highlight as3 linenos %}
package {
  public interface IVPAID {
    // ------------ 属性 --------------

    // 是否是线性创意。这个属性可能会根据创意当前的状态而改变。
    // 例如，一个前贴创意应该一直返回 true。
    function get adLinear():Boolean;

    // 创意的宽度。
    function get adWidth():Number

    // 创意的高度。
    function get adHeight():Number

    // 创意是否处于展开状态。
    // 例如，一个 Overlay 式的非线性创意，默认为 false；
    // 在用户交互后，创意展开，变为线性创意，此时则应为 true。
    // 再如，一个 Overlay 式的非线性创意，默认为 false；
    // 在用户交互后，创意尺寸变大，但仍未非线性创意，此时应为 true。
    // 如果一个 Overlay 式的非线性创意有多种尺寸，
    // 则只能在一种尺寸下返回 true，其他尺寸都应返回 false，
    // 一般在其到达最大尺寸时，返回 true。
    // 对于一个尺寸固定的创意，返回 false。
    function get adExpanded():Boolean;

    // 创意是否可以跳过
    function get adSkippableState():Boolean;

    // 创意在当前状态的剩余时间。
    // 当剩余时间未知，例如用户正在交互时，可以返回 -2。
    // 但若剩余时间始终是未知，则说明该属性不可用，应返回 -1。
    // 剩余时间的单位是秒。
    function get adRemainingTime():Number;

    // 创意在当前状态的时长。
    // 当时长未知，例如用户正在交互，可以返回 -2。
    // 但若时长始终未知，说明该属性不可用，应返回 -1。
    function get adDuration():Number;

    // 创意的音量。值在 [0, 1] 之间。
    // 若不提供音量信息，则返回 -1。
    function get adVolume():Number;

    // 设置创意的音量。应该根据入参限制在 [0, 1] 之间。
    // 若不提供音量控制，则该 setter 应留空。
    function set adVolume(value:Number):void;

    // VPAID 创意是可以附带伴随广告信息的。
    // 如果这个属性有值，则应为 VAST 结果中 <AdCompanions>
    // 的字符串表述。否则返回空字符串。
    function get adCompanions():String;

    // 如果 VPAID 创意自带了 Icon，则返回 true。
    // 其他情况都应返回 false。
    function get adIcons():Boolean;

    // ------------ 方法 --------------

    // 这里讨论的是兼容 VPAID 2.0 协议的广告，返回 "2.0"
    function handshakeVersion(playerVPAIDVersion:String):String;

    // 请确保在该方法调用完成后，发送 "AdLoaded" 事件。
    // 应在这个方法内准备好创意所需的所有素材，例如获取创意视频 Metadata
    // 并根据 width 和 height 属性，将其缩放，居中展示。
    // 如果有额外的信息需要和播放器交互，将使用最后一个参数传递。
    // 例如，在我和优酷的合作中，优酷会传递给我一个链接字符串作为
    // environmentVars 的值，用于发送额外的用户交互追踪打点。
    function initAd(width:Number, height:Number, viewMode:String,
        desiredBitrate:Number, creativeData:String="",
        environmentVars:String=""):void;

    // 当外部播放器缩放的时候，可能会调用该方法，通知创意需要缩放。
    // 这里的 width 和 height 理论上是外部播放器允许的最大创意尺寸。
    // 例如，你可以根据这个尺寸做等比缩放。但为保证创意展现完整，
    // 缩放结果不应该超出这个尺寸。
    // 当缩放完成后，需要发送 "AdSizeChange" 事件，并确保
    // 该事件发送后，播放器检查 adWidth 和 adHeight 属性时，
    // 创意能够正确返回新的尺寸信息。
    function resizeAd(width:Number, height:Number, viewMode:String):void;

    // 当 initAd 方法完成，并发出 "AdLoaded" 事件之后，
    // 播放器便随时可以调用该方法启动创意。
    // 在该方法内做完所有操作开始播放创意时，应发送 "AdStarted" 事件。
    // 播放器应该只调用一次该方法。
    function startAd():void;

    // 播放器调用该方法终止或取消创意播放。
    // 在该方法内应清理所有素材，并发送 "AdStopped" 事件。
    // 播放器应该只调用一次该方法。
    function stopAd():void;

    // 暂停创意播放。若当前创意可以被暂停，则应发送 "AdPaused" 事件。
    // 播放器在调用该方法后如果没有接到 "AdPaused" 事件，
    // 便可以认为创意暂停失败或者无法暂停。
    function pauseAd():void;

    // 恢复创意播放。应发送 "AdPlaying" 事件。
    // 如果播放器在调用该方法后没有接到 "AdPlaying" 事件，
    // 则可以认为创意无法恢复播放。
    function resumeAd():void;

    // 在播放器调用以下两个方法后，都应发送 "AdExpandedChange" 事件，
    // 并更新 adExpanded 状态。
    // 一般创意本身有可展开、收起的内容，播放器可以调用这两个方法。
    // 当然，如果播放器不调用，创意本身也是可以自己调用
    // 但只要状态改变，就要发送 "AdExpandedChange" 事件。
    // 如果播放器调用 collapseAd 方法，创意必须要收到最小尺寸。
    function expandAd():void;
    function collapseAd():void;

    // 跳过当前创意。如果播放器在调用该方法时，
    // adSkippableState 属性是 false，则可以忽略此次调用。
    // 若可以跳过，则应该在清理完所有素材之后，
    // 发送 "AdSkipped" 事件。
    function skipAd():void;
  }
}
{% endhighlight %}

## VPAID Events

在 Interface 一节的注释里，提到了一些事件。这些事件都是 VPAID 事件。若配合 VAST 3 规范，这里有一些事件是重合的。

在 VPAID 2 规范的 6.2 一节里，给出了所有事件；规范的 3.3 节详细描述了每一个事件。下面同样完整列出并作注释。

{% highlight as3 linenos %}
package {

  import flash.events.Event;

  public class VPAIDEvent extends Event {

    // 播放器调用 initAd 方法，创意处理完所有初始化工作后，发送该事件。
    // 若无法完成初始化过程，则应发送 "AdError" 事件。
    // 所有其他事件都应在该事件发送之后发送。
    public static const AdLoaded:String = "AdLoaded";

    // 播放器调用 startAd 方法，创意开始播放时发送该事件。
    public static const AdStarted:String = "AdStarted";

    // 播放器调用 stopAd 方法，创意清理完所有素材后，发送该事件。
    // 创意不能主动发送该事件，去通知播放器调用 stopAd 方法。
    // 该事件发送后，创意再接到任何消息，都不应发送其他事件。
    public static const AdStopped:String = "AdStopped";

    // 播放器调用 skipAd 方法，创意清理完所有素材后，发送该事件。
    // 若支持低版本 VPAID，在该事件发出后立即发送 "AdStopped" 事件。
    public static const AdSkipped:String = "AdSkipped";

    // 通知播放器创意的线性属性变更。
    public static const AdLinearChange:String = "AdLinearChange";

    // 播放器调用 resizeAd 方法，创意完成缩放操作，并更新
    // adWidth 和 adHeight 属性后，发送该事件。
    public static const AdSizeChange:String = "AdSizeChange";

    // 通知播放器创意的扩展状态变更。
    // 例如，某些交互面板展开，从不可用变为可用状态时，应发送该事件。
    // 创意尺寸变更与该事件无关，应发送 "AdSizeChange" 事件。
    public static const AdExpandedChange:String = "AdExpandedChange";

    // 通知播放器创意的可跳过状态变更。
    public static const AdSkippableStateChange:String = "AdSkippableStateChange";

    // 该事件在 VPAID 2.0 中已废弃。
    public static const AdRemainingTimeChange:String = "AdRemainingTimeChange";

    // 通知播放器创意时长变更，请确保该事件发送前已经更新创意的
    // adDuration 和 adRemainingTime 属性。
    public static const AdDurationChange:String = "AdDurationChange";

    // 通知播放器创意的音量变更。
    public static const AdVolumeChange:String = "AdVolumeChange";

    // 通知播放器创意的用户可见部分开始。
    // 例如，一个前贴创意，在 "AdStart" 的同时应该触发该事件；
    // 再如，一个默认状态为 Overlay 非线性创意，在浮层一出现就应该触发该事件。
    public static const AdImpression:String = "AdImpression";

    // 以下 5 个事件分别在创意中的视频开始播放、播放至 1/4 处、播放至一半、
    // 播放至 3/4 处、完成播放时发送。
    public static const AdVideoStart:String = "AdVideoStart";
    public static const AdVideoFirstQuartile:String = "AdVideoFirstQuartile";
    public static const AdVideoMidpoint:String = "AdVideoMidpoint";
    public static const AdVideoThirdQuartile:String = "AdVideoThirdQuartile";
    public static const AdVideoComplete:String = "AdVideoComplete";

    // 当用户点击创意内，会产生页面跳转的地方时，发送该事件。
    // 可以带上点击跳转链接地址、追踪 ID 和是否需要播放器来开启新窗口
    // 这 3 个信息作为 data 一并发送。
    public static const AdClickThru:String = "AdClickThru";

    // 用户和创意有交互操作，但不需要发生页面跳转时，发送该事件。
    // 可以带上追踪 ID 作为 data 一并发送。
    public static const AdInteraction:String = "AdInteraction";

    // 以下 3 个事件同 VAST 3 中的 acceptInvitation，collapse，close。
    // 仅用于通知播放器发送相应的打点统计。
    public static const AdUserAcceptInvitation:String = "AdUserAcceptInvitation";
    public static const AdUserMinimize:String = "AdUserMinimize";
    public static const AdUserClose:String = "AdUserClose";

    // 播放器调用 pauseAd 方法，暂停所有动画和声音后，发送该事件。
    public static const AdPaused:String = "AdPaused";

    // 播放器调用 resumeAd 方法，恢复创意播放后，发送该事件。
    public static const AdPlaying:String = "AdPlaying";

    // 该事件可用于和播放器联调。
    public static const AdLog:String = "AdLog";

    // 创意发生致命错误时发送。
    public static const AdError:String = "AdError";

    private var _data:Object;

    public function VPAIDEvent(type:String, data:Object=null, bubbles:Boolean=false, cancelable:Boolean=false) {
      super(type, bubbles, cancelable);
      _data = data;
    }

    public function get data():Object {
      return _data;
    }

    override public function clone():Event {
      return new VPAIDEvent(type, data, bubbles, cancelable);
    }
  }
}
{% endhighlight %}

## Security

为确保播放器能够和创意交互，在创意内需要配置 `Security.allowDomain("*")`。如果你知道你的创意只被某几个服务商加载，那么也可以配置具体的域名。但除了单独使用 `"*"` 之外， `Security.allowDomain` 方法并不支持通配符，所以配置具体域名的可能性比较小。

## Video in VPAID Creative

一个常见的 VPAID 创意由两部分组成：视频和交互元素。创意的时长一般为视频的时长。当发生交互时，最常见的方式为视频暂停，并触发 `AdDurationChange` 事件。

在 VPAID Events 一节中提到的多数事件都是由播放器调用创意的一个方法，创意再发送对应事件。但视频播放事件是创意主动发送的。因此，这里需要一个视频播放控件，方便管理视频播放进度。

下面描述的视频控件有以下功能：

- 加载、播放视频；
- 提供视频的尺寸、时长信息；
- 追踪视频的播放进度，在 VPAID 描述的 5 个视频进度点发送通知；
- 可选择使用视频长度或用户指定的时长发送上一点所述通知。

这个控件作为一个 ActionScript 3 Class 使用，这里定义其名称为 `AdVideoPlayer`。

首先，是加载和播放视频的功能。

{% highlight as3 linenos %}
// 使用以下 3 个私有变量来播放视频
private var _video:Video;
private var _nc:NetConnection;
private var _ns:NetStream;

// 用于追踪 metadata 信息
private var _isMetaDataApplied:Boolean = false;

// 用于追踪视频是否开始播放
private var _isVideoStarted:Boolean = false;

// 其中，_video 是需要被创意展现的对象，
// 因此提供一个 getter
public function get video():Video {
  return _video;
}

// 使用 load 方法，传递一个视频地址，以加载视频
public function load(url:String):void {
  resetProgressTimer();
  _isVideoStarted = false;
  _isMetaDataApplied = false;

  _nc = new NetConnection();
  _nc.connect(null);
  _ns = new NetStream(_nc);
  _ns.client = this;
  _ns.play(updateTbUgcUrl(url));
  _ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);

  _video = new Video();
  _video.attachNetStream(_ns);

  // 准备就绪后将视频暂停。
  _ns.pause();
}
{% endhighlight %}

接下去提供一个可选的 `duration` 属性，表示强制时长，单位为秒。假如创意中配置了这个属性，则忽略视频文件本身的时长，所有视频进度事件的发送，以 `duration` 为基准进行计算。否则，以视频本身时长为基准来计算。
在看代码之前，先解释一下为什么需要这个属性。
例如，视频文件本身有 20s，需要投放在两个媒体。媒体 A 要求创意时长为 15s，媒体 B 则为 20s。那么可以和两个媒体约定，在创意的 `initAd` 方法里，通过最后一个参数，告知创意所需的时长。创意拿到时长后，新建一个 `AdVideoPlayer` 实例（假设实例名为 `adVideoPlayer`），并判断当前投放媒体。若为 A，则配置 `adVideoPlayer.duartion = 15`；若为 B，则不配置该属性，或者配置 `adVideoPlayer.duartion=20`。
这样，当创意投放在媒体 A 时，视频的 5 个进度事件将分别于 0s，3.75s，7.5s，11.25s 和 15s 处发送；当创意投放在媒体 B 时，视频的 5 个进度事件将分别于 0s，5s，10s，15s 和 20s 处发送。

{% highlight as3 linenos %}
private var _duration:Number = 0;
private var _videoDuration:Number = -1;

// 创意通过 duration 获取视频时长。
// 假如该属性没有设置过，则返回 _videoDuration。
// 初始化 AdVideoPlayer 时，默认给 _videoDuration
// 设置 -1，和 VPAID 中不支持获取 duration 对应。
public function get duration():Number {
  if (_duration > 0) {
    return _duration;
  }
  else {
    return _videoDuration;
  }
}

public function set duration(value:Number):void {
  if (value > 0) {
    _duration = value;
  }
}

public function get videoDuration():Number {
  return _videoDuration;
}
{% endhighlight %}

在上述 `duration` 的 getter 里，还用到了一个私有变量，`_videoDuration`。这个变量仅在 `duration` 没有被配置的情况下会用到，用于返回视频的真实时长。当然，即使在配置了 `duration` 之后，仍可以通过 `videoDuration` 这个 getter 来获取视频真实时长。

这就说到了视频长度的来源。在上述 `load` 方法里， 配置了 `_ns.client = this`。Flash 会自动在当前类的实例上，调用以下方法。

{% highlight as3 linenos %}
public static const METADATA_FETCHED:String = "AdMetaDataFetched";
private var _width:Number = 320;
private var _height:Number = 240;

public function onMetaData(info:Object):void {
  if (!_isMetaDataApplied) {
    // 防止此方法可能多次被调用，导致信息变更
    _isMetaDataApplied = true;

    _width = info.width;
    _height = info.height;

    // 从 metadata 更新视频时长。
    _videoDuration = Number(info.duration);

    // 此处必须覆盖 Video 实例的尺寸。
    // 否则视频将以默认 320x240 拉伸缩放展现。
    // 这也是默认给 _width 和 _height 设置这两个值的原因，
    // 当 metadata 获取失败，返回默认的尺寸。
    _video.width = _width;
    _video.height = _height;

    dispatchEvent(new Event(METADATA_FETCHED));
  }
}
{% endhighlight %}

创意需要在播放器调用其 `initAd` 方法之后，准备好所有的素材，并发送 `adLoaded` 事件。那么，视频 metadata 成功获取后，便是一个合适的时间来发送这个事件。所以在上述 `onMetaData` 方法末尾，发送一个 `METADATA_FETCHED` 事件，供创意选择监听。

此外，上述 `_width` 和 `_height` 是否暴露都无所谓，因为最初的 `_video` 实例已经是公开属性。

下面就要处理视频的播放进度了。

{% highlight as3 linenos %}
// 每 500ms 检查一次播放进度。
private const TIMER_STEP:Number = 500;

// 视频的当前播放时间。
private var _time:Number;

// 视频播放进度追踪 Timer。
private var _progressTimer:Timer;

// 以下 4 个状态，外加上述 _isVideoStarted，
// 用于处理视频进度事件。
private var _isFirstQuartilePassed:Boolean = false;
private var _isMidpointPassed:Boolean = false;
private var _isThirdQuartilePassed:Boolean = false;
private var _isVideoPlayCompleted:Boolean = false;

// 初始化进度追踪 Timer。
private function resetProgressTimer():void {
  if (_progressTimer) {
    _progressTimer.reset();
  }
  else {
    _progressTimer = new Timer(TIMER_STEP);
    _progressTimer.addEventListener(TimerEvent.TIMER, trackProgress);
  }
}

private function trackProgress(event:TimerEvent):void {
  // 因为视频播放完成并不代表创意结束，可能是通过 _duration
  // 来计算进度事件发送时间点的。因此视频结束后，时间可能继续往前。
  if (_isVideoPlayCompleted) {
    _time += TIMER_STEP / 1000;
  }
  else {
    _time = _ns.time;
  }

  var percent:Number = Math.round(_time / this.duration * 100);

  if (percent >= 25 && !_isFirstQuartilePassed) {
    _isFirstQuartilePassed = true;
    dispatchEvent(new VPAIDEvent(VPAIDEvent.AdVideoFirstQuartile));
  }

  if (percent >= 50 && !_isMidpointPassed) {
    _isMidpointPassed = true;
    dispatchEvent(new VPAIDEvent(VPAIDEvent.AdVideoMidpoint));
  }

  if (percent >= 75 && !_isThirdQuartilePassed) {
    _isThirdQuartilePassed = true;
    dispatchEvent(new VPAIDEvent(VPAIDEvent.AdVideoThirdQuartile));
  }

  if (percent >= 100) {
    _progressTimer.stop();
    dispatchEvent(new VPAIDEvent(VPAIDEvent.AdVideoComplete));
  }
}
{% endhighlight %}

那么如何知道视频结束？回顾之前的 `_ns.client = this` 配置，Flash 会在视频播放时自动调用下述方法。

{% highlight as3 linenos %}
public function onPlayStatus(status:Object):void {
  if (status.code === "NetStream.Play.Complete") {

    // 若 duration 未曾配置，则在视频播放完成时发送相应事件。
    if (_duration === 0) {
      dispatchEvent(new VPAIDEvent(VPAIDEvent.AdVideoComplete));
      if (_progressTimer) _progressTimer.stop();
    }

    _time = _ns.time;
    _isVideoPlayCompleted = true;
  }
}
{% endhighlight %}

至此，我们还缺一个视频开始播放的事件。在上述 `load` 方法末尾，准备好视频之后，先暂停了视频的播放。这是为了让创意能够先发送 `adLoaded` 事件，待播放器调用 `startAd` 方法时，创意再告知播放控件可以开始播放视频（即下述 `resume` 方法）。此时，应发送视频开始播放事件。

下面的代码将这个步骤和播放、暂停整合在一起。

{% highlight as3 linenos %}
public function pause():void {
  _ns.pause();
  _progressTimer.stop();
}

public function resume():void {
  onVideoStarted();
  _ns.resume();
  _progressTimer.start();
}

private function onVideoStarted():void {
  if (_isVideoStarted) return;
  _isVideoStarted = true;
  dispatchEvent(new VPAIDEvent(VPAIDEvent.AdVideoStart));
  _progressTimer.start();
}
{% endhighlight %}

最后，提供一个清除当前视频的方法，供创意在 `stopAd` 和 `skipAd` 时调用。

{% highlight as3 linenos %}
public function clean():void {
  resetProgressTimer();
  _video.attachNetStream(null);

  _ns.removeEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
  _ns.close();
  _nc.close();
}
{% endhighlight %}

该类的完整代码，见 Sample 一节末尾提供的压缩包。

有一点需要指出，不一定所有的视频都能成功获取到 metadata，或者获取到的 metadata 可能不包含上述逻辑所需信息。因此，在使用该类的时候，建议配置 `duration` 属性，并在创意内部添加 metadata 超时逻辑，避免 `AdLoaded` 事件没有发出。

## Sample

最后提供一个简易的 VPAID 2 创意示例。要运行这个示例，你需要有一个支持 VPAID 2 的播放器。为方便起见，这里我会使用一个非常简单的播放器。
![A simple VPAID 2 compliant player](https://img.alicdn.com/tps/i3/TB1r.xbHFXXXXbpXpXXduvuOpXX-1283-1045.png)

示例中的创意使用 Video in VPAID Creative 一节里的类来播放视频，实现了 Interface 一节所述的接口，并发送 VPAID Events 一节所述的部分事件。

整体流程大致描述为：

- 播放器加载并使用 `getVPAID` 方法获取 VPAID 创意；
- 监听 `AdLoaded` 事件并调用创意的 `initAd` 方法；
- 监听 `AdStarted` 事件并调用创意的 `startAd` 方法；
- 监听视频播放相关的事件和用户交互导致时长变更的相关事件；
- 当创意时长发生变化时，对倒计时做出正确地处理；
- 以视频播放完成事件作为创意结束标识，移除创意。

由于 VPAID 2 协议中没有明确播放器如何确认创意播放完成，可能是 `adRemainingTime` 为 0 时，也可能是 `AdVideoComplete` 事件发送时，或者可以和媒体约定其他时间点。但必须确定这个点，避免创意提供方无法完成某些数据打点，或者媒体播放器无法结束创意。

下面提供[完整的代码](/download/code/20150413_vpaid_demo.zip)，包括：

- VPAID 2 创意主体（creative.fla，creative.as）；
- 包含 VPAID 2 简易播放器的预览工具（demo.fla，demo.as）；
- VPAID 2 Interface，Events，Wrapper。
