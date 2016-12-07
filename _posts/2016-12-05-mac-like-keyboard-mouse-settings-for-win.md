---
layout: post
title: macOS like keyboard and mouse settings for Windows
category: programming
poster: https://img.alicdn.com/tps/TB1xYWFOFXXXXbYXpXXXXXXXXXX-2400-500.jpg
summary: I bought a new PC recently. I've been a Mac user for a long time. It is so easy for me to hit the wrong modifier keys in Windows. I still use a Mac for work. So it's important that I find a way to adjust the keys.
---

最近自己配了个机器。由于 GTX 1080 还没有 MacOS 的 Pasacal 驱动，所以不能拿黑苹果来作为日常系统。于是多年之后又开始体验 Windows。用了几天，只能说太不习惯。但为了方便日常生活，还是得想点办法。本篇记录如何切换键盘修饰键以及反向鼠标滚轮的行为。

## macOS style keyboard layout

我用的键盘就是苹果的 G6 全尺寸键盘，默认的键位和普通的 Windows 键盘稍有区别。苹果键盘在 Windows 上默认的键位是，Control 对应 Ctrl，Option 对应 Alt，Command 对应 Windows。为了让拷贝粘贴等操作和我在 Mac 下一致，需要在 Windows 下将 Command 键和 Control 键的功能对调一下。用第三方软件是可以达到基本的效果的，但是不见得对所有应用有效，并且不能覆盖某一些 Windows 键加字母键的快捷键。所以改注册表来得最省事。

键盘上的每一个键位，都有对应的 Scan Code。在 Windows 的注册表里，可以自定义 Scan Code 的映射。在[这个站点](https://www.win.tue.nl/~aeb/linux/kbd/scancodes-1.html)，可以找到多数键位所对应 Scan Code。下面是空格键两侧常见 6 个修饰键的 Scan Code。

| Key           | Scan Code |
|---------------|-----------|
| Left Control  | 1D        |
| Right Control | E0 1D     |
| Left Alt      | 38        |
| Right Alt     | E0 38     |
| Left Windows  | E0 5B     |
| Right Windows | E0 5C     |

下面以我的键位设置为例，来简单说明一下。

```
00000000 00000000
05000000 1D005BE0
5BE01D00 1DE05CE0
5CE01DE0 00000000
```

这里有 8 组数字，每组 8 个数字。前两组永远 0，表示头部版本和标记位；第三组表示除掉前三组之外，剩下的组的长度，我这里就是 8 减去 3，有 5 组；最后一组永远是 0，表示 NULL，就像在 Objective-C 里面用 `initWithObjects:` 方法定义数组的时候必须以 `nil` 结尾，告诉编译器这是数组尾部一样；中间其他组就是键位映射。

以第 4 组为例，`1D005BE0`，表示把 `5BE0` 映射到 `1D00`，即把左边的 Windows 键映射到左边的 Ctrl 键。注意这里的写法。Scan Code 里表左侧 Windows 键是 E0 5B，但这里要反过来写，`5BE0`。而只有单个值的左侧 Ctrl 键，则要用 `0` 来补成 4 位数，`1D00`。

因此这里第 4 组到第 7 组就是把左侧 Windows 和左侧 Ctrl 键互换键位，右侧 Windows 和右侧 Ctrl 键互换键位。

知道了映射关系之后，如何写入注册表呢？我们需要在注册表里面，找到 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout` 这一项，新增一项名为 `Scancode Map`，类型为 `REG_BINARY`，值为上述映射关系的条目。最简单的方式，就是通过记事本来写一个扩展名为 `reg` 文件。以我的配置为例，如下所示。

```
Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
"Scancode Map"=hex:00,00,00,00,00,00,00,00,05,00,00,00,1D,00,5B,E0,5B,E0,1D,00,1D,E0,5C,E0,5C,E0,1D,E0,00,00,00,00
```

将其保存，例如存为 `swap_cmd_ctrl.reg` 之后，双击导入注册表，之后重启操作系统就可以了。

## macOS style keyboard shortcuts

在交换完修饰键之后，有一个严重的问题，就是窗口切换。Windows 的窗口切换是 Alt + Tab，macOS 的窗口切换是 Command + Tab，而正常的键盘布局下，Windows 键盘的 Alt 键和 Mac 键盘的 Command 键键位是一致的。想我这样改过布局之后，空格两侧的键在 Windows 里实际是 Ctrl 键，所以还要覆盖一下快捷键。

再多说一句，macOS 里 Command + Tab 切换的是应用程序，Command + ~ 切换的是当前程序的不同窗口，Control + Tab 切换的是当前程序当前活动窗口的标签页。而 Windows 里没有切换应用程序的概念，只有切换窗口。另外两个系统的 Ctrl + Tab 功能是一样的，但我几乎不用这个功能。所以我就把 Ctrl + Tab 覆盖成和 Alt + Tab 一样，对我来说没有任何损失。

自定义快捷键没有找到好的方法，于是我装了 [AutoHotkey](http://ahkscript.org/)。装好这个软件之后，会在右键的 `New` 菜单下新增一个 `AutoHotkey Script` 选项。我们就用这个菜单新建一个脚本。以下是我的配置。

```
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

;macOS style cmd+tab
^Tab::Send, {LAlt Down}{Tab}
#If WinExist("ahk_class MultitaskingViewFrame")
Ctrl Up::Send, {LAlt Up}
```

当然，为了方便使用，还得把这个脚本添加到开机启动项里。为这个脚本文件创建一个快捷方式，然后在按 Windows + R 呼出运行窗口，输入 `shell:startup` 打开启动项所在文件夹，把刚才的快捷方式剪切到这里。

用 AutoHotkey 可以做的事情很多，脚本也可以很复杂。在网上搜索一下可以看到很多别人的脚本，多数情况都是针对 Mac 和 PC 转换而写的，有需要的话可以多搜索试试。

用第三方软件覆盖快捷键，前面我提到有个缺点是无法在所有软件里完全覆盖。用 Ctrl + Tab 代替 Alt + Tab 就有这个问题。在一般的软件里都是好用的，但是当前应用是注册表的时候，Ctrl + Tab 并不会激活 Alt + Tab。不过还行了，凑合着用。

## macOS style natural scroll

最后这点很多人估计不赞同。在 Mac OS X Lion 发布的时候，苹果新增了一个自然滚动的功能，主要针对触摸板操作。当双指向上滑动，滚动条向下滚动；双指向下滑动，滚动条向上滚动。我特别喜欢这个功能，包括鼠标操作的时候也喜欢滚轮的行为是这样的。在我看来，屏幕就是一张很大的纸。滑动鼠标滚轮，就好像我的手指按着这张纸，往上或往下拖动一样。

反转鼠标滚轮行为也是通过修改注册表。找到 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Enum\HID\VID_???\VID_???\Device Parameters` 这一项，在右侧会看到 `FlipFlopHScroll` 和 `FlipFlopWheel` 两项。默认这两项的值都是 `0`，双击修改为 `1` 即可。这个改动不需要重启，只要把鼠标重新拔插一下就好了。

这里一串 `???` 实际指的是 `Device instance path`。如何查找呢？打开控制面板（在 Windows 10 里面需要打开 Windows 7 风格的那个窗口，而不是新版设置窗口），搜索 Mouse，点击打开设置窗口。切换到最后一个 Hardware 选项卡，点击右下方的 Properties 按钮，在弹出的对话框里切换到 Details 面板，找到 `Device instance path` 一项。这里显示的值，就是上述 `???` 的值。

## Wrap up

以上是我目前的鼠标键盘配置，其实还有很多快捷键想要加，包括启用键盘的 fn 功能键等。目前还没时间研究，以后如果有新的进展再来更新。

最后是所有参考资料。

- [Experts Exchange - Keyboard Remapping: CAPSLOCK to Ctrl and Beyond](https://www.experts-exchange.com/articles/2155/Keyboard-Remapping-CAPSLOCK-to-Ctrl-and-Beyond.html)
- [Keyboard scancodes](https://www.win.tue.nl/~aeb/linux/kbd/scancodes-1.html)
- [Pastie - AutoHotkey script](http://www.pastie.org/1660132)
- [superuser - Inverting direction of mouse scroll wheel](https://superuser.com/questions/310681/inverting-direction-of-mouse-scroll-wheel/364353#364353)