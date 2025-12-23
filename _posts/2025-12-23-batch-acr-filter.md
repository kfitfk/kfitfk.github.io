---
layout: post
title: Batch Processing Images with Adobe Camera Raw AI filters
category: programming
poster: https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d7d3c620-dfaa-11f0-a1a4-5b430a24389f.jpg
summary: This article talks about how to update masks automatically when batch processing images with Adobe Camera Raw AI Filters, using techniques like UXP scripting, Alchemist plugin, and AppleScript or AutoHotKey Script.
---

# Adobe Camera Raw AI 滤镜批处理

## The Problem

最近设计师在给 AI 训练提供图片素材，在 Photoshop 里用动作脚本批处理文件时，遇到一个问题。以下是复现步骤。

1. 启动 Photoshop 后，在 Actions（动作）面板里新建一个动作录制
2. 打开一张 jpg 或 png 图片
3. 选择 Filter（滤镜）- Camera Raw Filter
4. 在弹出的 Camera Raw 界面，右侧选择 Presets（预设），选择若干 AI 滤镜，例如 Adaptive: Portrait（自适应：人像）下面的 Gritty Protrait，和 Texture Hair
5. 点击确定关闭对话框
6. 另存为一张 jpg，然后结束动作录制

在第 4 步应用 Camera Raw Filter Presets 时，软件会针对当前图片创建一些蒙版，再应用滤镜。这时，如果打开另一张图片，重播 Camera Raw Filter 步骤，会发现使用的蒙版依然是动作录制时的那些。

![动作录制播放时，ACR里的蒙版不会更新](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d5ea5790-dfa8-11f0-bebd-e3cadbfb66d4.jpg)

## The Reason

在 Reddit 和 Adobe Forum 上都有人提过类似的问题

- [Creating PS actions using PROCEDURAL Camera Raw settings](https://www.reddit.com/r/photoshop/comments/zj1d8c/creating_ps_actions_using_procedural_camera_raw/)
- [AI Camera Raw masks not re-computed when used in an Action](https://community.adobe.com/t5/photoshop-ecosystem-discussions/ai-camera-raw-masks-not-re-computed-when-used-in-an-action/td-p/14176133)

如这些帖子里所说，产生问题的原因，是动作面板记录的，是用户应用滤镜后的结果，而不是记录选择了哪些预设效果。所以，在重播动作时，软件不会根据当前图片，重新去判断它的内容，识别主体，而是直接把录制时记录的蒙版和调色数值给直接应用到了新图片上。

而大家也都提出了解决的方法，就是要录制并修改脚本，去掉写死的蒙版信息，在打开 Camear Raw 界面时，让它重新生成蒙版。而这需要使用 [ScriptingListener plugin](https://helpx.adobe.com/photoshop/kb/downloadable-plugins-and-content.html) 将动作录制转成 JavaScript 代码，并针对特定平台编写模拟键鼠操作的脚本，例如帖子里说 Windows 系统的 [AHK](https://www.autohotkey.com/)，或者 macOS 系统自带的 AppleScript。

但是 ScriptingListener 插件是面向上一代 [CEP 扩展](https://github.com/adobe-cep)使用的，在 2020 年 Adobe Max 上宣布了 [UXP 插件](https://developer.adobe.com/photoshop/uxp/2022/guides/)之后，Adobe 已经在 Apple Silicon 的 Photoshop 里完全移除了 CEP 的支持，如果要使用这个方案，就得打开 [Rosetta](https://support.apple.com/en-us/102527)。而这个功能应该在 2027 年 macOS 28 操作系统发布后被彻底废弃。

不过如果你用的是 Intel 的 mac，或者 Windows，那 ScriptingListener 的链路还是通的。而这篇文章接下去要讲的，是如何用 UXP 脚本来完成 ScriptingListener 做的事情。

## The Solution

### Alchemist

要像 ScriptingListener 插件那样，把用户在 Photoshop 里的操作都录成代码，可以借助 [Alchemist](https://github.com/jardicc/alchemist) 插件。用户可以在 Creative Cloud 的 [Stock & Marketplace 里搜索安装 Alchemist](https://exchange.adobe.com/apps/cc/2bcdb900/alchemist)，也可以[到 Github 下载](https://github.com/jardicc/alchemist/releases)。在写这篇文章时（2025/12/22），这个插件已经很久没有更新了。但 Marketplace 里的最新版本是 2.6.0，Github 上的最新版本是 2.7.0。

如果从 Github 下载安装的话，要先在 Creative Cloud 里安装 [UXP Developer Tools](https://developer.adobe.com/photoshop/uxp/2022/guides/devtool/installation/)。之后启动它，点击 Add Plugin，选择 `alchemist-2.7.0/dist/manifest.json` 载入插件。再启动 Photoshop，回到 UXP Developer Tools 界面，选中插件列表里的 Alchemist 插件后，点击菜单项 "Actions - Load Selected" 来载入它。最后回到 Photoshop，通过 Plugins - Alchemist - Alchemist 菜单，打开 Alchemist 面板。

![Alchemist 插件载入](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d62e1750-dfa8-11f0-bebd-e3cadbfb66d4.jpg)

接下去，要录制添加 Adobe Camera Raw 滤镜的操作。

1. 在 Photoshop 里打开一张图片
2. 到 Alchemist 插件面板里，点击左下角的 Listener 按钮，确保它处于录制状态（按钮会变成绿色）
3. 选择 Filter（滤镜）- Camera Raw Filter
4. 在弹出的 Camera Raw 界面，右侧选择 Presets（预设），选择若干 AI 滤镜，例如 Adaptive: Portrait（自适应：人像）下面的 Gritty Protrait，和 Texture Hair
5. 点击确定关闭对话框
6. 到 Alchemist 插件面板里，停止录制。
7. 在录制的历史记录里，找到并点击 Adobe Camera Raw Filter 一项，右侧面板切换到 Code 选项卡，拷贝全部代码，并粘贴到一个代码编辑器，例如 [VS Code](https://code.visualstudio.com/)。

![使用 Alchemist 插件录制用户行为](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d78c95e0-dfa8-11f0-94ab-8f3ac5e5a244.jpg)

### UXP Script

刚才拷贝到代码，会使用 UXP 提供的 batchPlay 能力，去播放录制的操作。这和通过 Actions（动作）面板，录制一个动作，再去播放它，是一样的。所以这里依然会有蒙版被写死在数据里的问题。但这里拿到了代码，就可以修改蒙版数据了。

在 VSCode 里按 Cmd/Ctrl + F 搜索，打开正则表达式模式，输入 `crs:(Input|Mask)Digest=\\"[^"\\]+\\"\\n` 去匹配所有 InputDigest 或 MaskDigest 的赋值语句，并把它们替换成空白。这样会删去与蒙版相关的信息，下一次使用新的代码打开 Camera Raw 时，它会发现数据不正确，提供选项让用户更新蒙版。

![批量替换蒙版信息的正则表达式](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d664dec0-dfa8-11f0-8cc4-f16dbcfabfa1.jpg)

然后，再搜索 `dontDisplay`，把它替换成 `display`。因为默认的动作录制，会隐藏所有弹窗。这里，我们要把 Camera Raw 界面展示出来，方便之后用 AHK 或 AppleScript 脚本去执行蒙版更新、确认的操作。

这两项改动都完成后，把脚本保存成一个扩展名为 `psjs` 的文件，例如 `acr_filter.psjs`。

接下去，我们可以先验证一下，脚本是可执行的。

在 Photoshop 里，打开一张不是刚才用来录制脚本的图片。接着，选择 File - Scripts - Browse（文件-脚本-浏览），在弹出的对话框里，选择刚才保存的 `acr_filter.psjs` 文件。此时，应该会弹出 Camera Raw 界面，并且会看到 AI Edit Status 图标是黄色高亮的。点击图标，会弹出一个浮层，提示用户 "Highlighted settings need to be updated to properly render your photo"，并且有一个蓝色的 Update All 按钮。

![ACR 蒙版待更新说明](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d69abbd0-dfa8-11f0-8cc4-f16dbcfabfa1.jpg)

先不着急点它。切换到 Masking（蒙版）选项卡，会发现所有的蒙版，都有一个感叹号，这就是刚才删除了脚本里 InputDigest 和 MaskDigest 的效果。此时，按下 Cmd/Ctrl + Shift + U 快捷键，可能会看到一个一闪而过的弹窗，提示用户正在更新蒙版。很快蒙版就会基于当前图片完成更新。这和点击刚刚的 Update All 按钮是一样的。

![ACR 更新蒙版](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d6e1d6f0-dfa8-11f0-8cc4-f16dbcfabfa1.jpg)

点击确定按钮关闭对话框，这样录制好的 Camera Raw 滤镜就正确应用到新图片上了。

### Simulation

为了做自动化图片批处理，就要把刚才执行脚本，打开 Camera Raw 之后的两个操作，即按 Cmd/Ctrl + Shift + U 快捷键，和点击确定关闭对话框这两个操作，用第三方工具给自动化掉。

#### macOS

在 macOS 上，可以使用 AppleScript 来模拟用户操作。AppleScript 本身语法很直观，很像英文叙事。这里就展开说明了，完整的代码贴在下方。用户可以把它拷贝到 VSCode 里，并保存成扩展名为 `scpt` 的文件，例如 `update_masks.scpt`。

```
-- Wait for Adobe Camera Raw window to open
set maxAttempts to 10
set attemptCount to 0

repeat
	set attemptCount to attemptCount + 1

	tell application "System Events"
		try
			set acrWindow to (first window of (first application process whose frontmost is true) whose name contains "Camera Raw")
			if exists acrWindow then
				exit repeat
			end if
		end try
	end tell

	if attemptCount ≥ maxAttempts then
		display alert "Camera Raw Window Not Found" message "Adobe Camera Raw window did not open after " & maxAttempts & " attempts. Script aborted." buttons {"OK"} default button "OK"
		return
	end if

	delay 0.5
end repeat

delay 0.5

-- Send Cmd + Shift + U
tell application "System Events"
	keystroke "u" using {command down, shift down}
end tell

-- Wait for the window to become active again (wait for any processing to complete)
delay 1

set maxWaitAttempts to 10
set waitAttemptCount to 0

repeat
	set waitAttemptCount to waitAttemptCount + 1

	tell application "System Events"
		try
			set acrWindow to (first window of (first application process whose frontmost is true) whose name contains "Camera Raw")
			-- Check if window is responsive by verifying it still exists and is frontmost
			if exists acrWindow then
				exit repeat
			end if
		end try
	end tell

	if waitAttemptCount ≥ maxWaitAttempts then
		display alert "Camera Raw Window Unavailable" message "Adobe Camera Raw window became unavailable after key command. Script aborted." buttons {"OK"} default button "OK"
		return
	end if

	delay 0.5
end repeat

delay 0.5

-- Press Return key
tell application "System Events"
	keystroke return
end tell
```

#### Windows

在 Windows 上，可以安装 AutoHotKey，使用 AHK 脚本来模拟用户操作。这里的代码拷贝自 Adobe Forum 上的 [AI Camera Raw masks not re-computed when used in an Action](https://community.adobe.com/t5/photoshop-ecosystem-discussions/ai-camera-raw-masks-not-re-computed-when-used-in-an-action/td-p/14176133)。用户可以把它拷贝到 VSCode 里，保存成扩展名为 `ahk` 的文件，例如 `update_masks.ahk`。

```
; Allow for partial window title matches
SetTitleMatchMode, 2

; Wait for a window with ahk_class Bridge_WindowClass to become active
WinWaitActive, Camera Raw, , 2
if ErrorLevel
{
    MsgBox, Camera Raw window not activated within timeout. Exiting.
    Exit
}

; Get the window handle (HWND) of the active window
WinGet, hWnd, ID

; Send the Ctrl+Shift+U key combination
Send, ^+u

; After pressing Ctrl+Shift+U for the first time, ACR loses focus
; after some time (in ms). In that time event loop is not buffered
; so we cannot send Enter now. Let's wait for Photoshop to become
; active, then reactivate ACR and send Enter to close the ACR dialog
WinWaitActive, ahk_class Photoshop, , 2
if ErrorLevel
{
    MsgBox, Focus did not went back to Photoshop. Strange... Exiting!
    Exit
}

WinActivate ahk_id %hWnd%
Send, {Enter}
```

### Automation

准备好模拟用户操作的脚本后，要把它集成到脚本里执行。但 UXP Script 是不支持直接调用 shell 脚本来执行 AppleScript 或 AHK 脚本的。唯一能够运行外部程序的方式，是通过 [uxp shelll module](https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/shell/Shell/)。但使用这个方式，在我们的场景里，要满足两个条件：

1. 提前编译好一个能够在 Finder 或 Windows 资源管理器里通过双击直接运行 AppleScript 或 AHK Script 的程序
2. 把之前编写的 UXP script 封装到一个 UXP plugin 里。

但封装成插件的话，就不能在 Photoshop 自带的批处理里去调用了。

前面说过，Adobe 在 Apple Silicon 上已经废弃了 CEP，但 JSX 脚本引擎还留着。所以目前来说，我们还能通过 JSX 的 `app.system` 命令去调用 shell 脚本。

在 VSCode 里新建一个文本文档，在 macOS 里可以使用如下脚本内容（注意更改绝对路径）：

```js
var appleScriptPath = '/Users/haoye/Desktop/ps_actions/doc/update_masks.scpt';
app.system('osascript "' + appleScriptPath + '" &');
```

在 Windows 里可以使用如下脚本内容（注意更改绝对路径）：

```js
var ahkPath = new File("/c/Program Files/AutoHotkey/AutoHotkey.exe");
var scriptPath = new File("/c/whatever_your_path/update_masks.ahk");
var command = 'start "' + ahkPath.fsName + '" "' + scriptPath.fsName + '"';
app.system(command);
```

将其保存为 `update_masks.jsx`。

在 Photoshop 里录制一个新的动作，步骤如下：

1. 打开一张 jpg 或 png 图片
2. 选择 File - Scripts - Browse（文件-脚本-浏览），选择 `update_masks.jsx` 脚本
3. 上一步的脚本有重试次数限制，此时要立即选择 File - Scripts - Browse（文件-脚本-浏览），选择 `acr_filter.psjs` 脚本。若选择脚本的速度足够快，Camera Raw 界面出现后，过一会就会因上一步的脚本执行而自动消失
4. 另存为一张 jpg，然后结束动作录制

最后，通过 File - Automate - Batch（文件 - 自动化 - 批处理），在对话框中配置 Action（动作）为刚才录制的动作，Source（源）选择要批处理的文件所在目录，并勾选 Override Actioin "Open" Commands，在 Destination（目标）选择 Folder（文件夹），勾选 Override Action "Save As" Commands，并选择批处理时要保存文件的目录，点击确定就可以开始批处理了。

![Photoshop 批处理配置](https://ossgw.alicdn.com/creatives-assets/prod/feupload/user/p/d72fcfe0-dfa8-11f0-a089-c9163676cae8.jpg)

在 CEP 编程的文档里，Adobe 明确指出是有内存泄露的，需要在运行一段时间后重启应用。像这种批处理模式，我不太确定 JSX 或 UXP 脚本运行一段时间，或批处理一定数量图片后，软件会不会报错，还得在处理过程中多留意。
