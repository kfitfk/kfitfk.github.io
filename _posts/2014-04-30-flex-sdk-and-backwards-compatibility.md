---
layout: post
title: Flex SDK and Backwards Compatibility
category: programming
poster: https://img.alicdn.com/tps/i3/T16fSKFUBXXXXEHz7X-1200-250.jpg
summary: "This article talks about Flash Player's compatibility issues when targeting different versions. Mainly it focuses on this error message - VerifyError: Error #1053: Illegal override of z in mx.core.BitmapAsset."
---

## Target version support

上一篇文章讲了如何在终端把 SWC 文件和 AS 文件编译成 SWF 文件。在文章里提到的 Flex SDK 使用的是 4.6 的版本。目前从 Adobe 官网下载到的 SDK，默认仅包含一个目标 Flash 版本，即 11.1。可以在 SDK 目录的 frameworks/libs/player/ 里面查看当前 SDK 编译所支持的目标 Flash 版本。

如果想要支持其他版本，可以到 [Adobe 的 Archive 页面](https://helpx.adobe.com/flash-player/kb/archived-flash-player-versions.html#playerglobal)，或者这个 [Github 仓库](https://github.com/nexussays/playerglobal)，下载对应的 SWC 文件，并新建相应的目录即可。例如，下图就在 4.6 的 SDK 里添加了 9.0，10.0 和 10.3 三个版本的 playerglobal.swc。

![Different version of playerglobal.swc](https://img.alicdn.com/tps/i1/TB1NUNeHFXXXXcnXVXXb05.SVXX-2514-1092.png)

## Backwards compatibility issue

使用 Flex SDK 4.6 编译的 SWF 文件，在项目测试中碰到了 Flash Player 版本兼容性的问题。

我的 SWC 文件里不包含任何需要 Flash Player 10+ 支持的功能，所以使用 mxmlc 命令编译得到的 SWF 文件，即时默认目标版本是 11.1，在低版本的 Flash Player 里应该也不至于出错。

我同事以一个针对 Flash Player 9 所发布的 SWF 作为 Loader，去加载我的 SWF，结果内容无法展现。在 Flash Professional CS6 里面主要报错如下：

`VerifyError: Error #1053: Illegal override of z in mx.core.BitmapAsset.`

在上一篇文章里讲到，`mx.core.BitmapAsset` 是用来做图片 Embed 的。根据[这篇文章](http://www.benfarrell.com/2011/05/26/embeds-are-broken-in-flash-10-0-with-flex-sdk-4-5/)的描述，应该是 Flash Player 10 和 9 在处理 z 坐标的 getter/setter 上有很大的改动，导致两者不兼容。

于是我下载到 9.0 版本的 playerglobal.swc 文件，使用 Flex SDK 4.6 面向 Flash Player 9 重新编译一个 SWF 文件。结果还是上述报错。

Google 一下这个错误，有很多人也[都遇到过](https://github.com/nexussays/playerglobal)。

## The solution

我这个场景，最简单的解决方案当然是把 Loader 的目标版本升级到 Flash Player 10.3。但是之前有测试场景出现过不知名的问题，所以保险起见，能不升级就不升级。

既然是 SDK 版本过高所带来的问题，那就尝试 Flex SDK 3.6 吧。旧版的 Flex SDK 可以在 [SourceGorge 的这个页面](http://sourceforge.net/adobe/flexsdk/wiki/Downloads/)下载。3.6a 的这个 SDK 默认带了 9.0 和 10.0 两个 playerglobal.swc。这里即使 SWF Loader 本身是针对 9.0 发布的，被加载的 SWF 针对 10.0 版本发布也是可以的，只要最后所在客户端的 Flash Player 版本足够高就行了。