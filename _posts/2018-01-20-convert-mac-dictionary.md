---
layout: post
title: Converting a Dictionary for macOS
category: programming
poster: https://img.alicdn.com/tfscom/TB1du3JliqAXuNjy1XdXXaYcVXa.jpg
summary: I've been perusing Verbal Advantage for almost 3 months. As the program suggested, I bought the hefty unabridged Random House Dictionary of American English Language. The hardcover dictionary is great. Though a digital version might be even better. In this article, I go through all the dependencies and steps to convert a dictionary file compatible with the macOS dictionary.app.
---

去年我买了一本 10 来斤重的未删节版英文词典。但现在阅读大多都在屏幕前，并且这么大一本词典翻起来也不是很方便，看久了老觉得要买个放大镜。所以我就压了一本数字版的，丢到 macOS 的 Dictionary.app 里，方便使用。在介绍怎么转换词典格式之前，先扯一下字典及相关软件吧。

## Dictionaries that comes with macOS

macOS 自带的字典应用，包含 New Oxford American Dictionary (NOA) 和牛津英汉汉英词典。

前者有非常丰富的词源解释，大多数词的意思都写的蛮不错的。但有一点我不喜欢，即音标。大多数美式发音确实是把 t 读得很接近 d，但是这本词典直接给写成了 d，例如 better 的音标是 | ˈbedər |；而有些词汇的注音完全不是美式偏好的，例如 dilettante 在 NOA 里的音标是 | ˌdiləˈtänt, diləˈtäntē |，重音在字母 a 上面。但再看美国本土的字典，例如 American Heritage Dictionary 4th Edition，给的音标是 (dĭlʹĭ-tänt')，重音在第一个 i 上面。其他的字典，像我买的 Random House Dictionary of The American English Language Unabridged 2nd Edition (RHD)，也是给的 /dil"i tahnt'/。在 Merriam-Webster's Advanced Learner's Dictionary 里，则标注 /ˈdıləˌtɑːnt, Brit ˌdıləˈtænti/。所以在用 NOA 的时候，要格外注意音标是否反映了当地主流发音。此外，NOA 收录的词汇没有其他美国本土词典丰富，像 irrefrangible 就没有收录，只能查 refrangible。

后者是我见过的中文释义最精炼的一本英汉词典。例如前面说到的 dilettante，在多数英汉词典里会解释为“浮泛的涉猎者; 浅尝辄止者”，因为英文字典大多是这么写的：a person who takes up an art, activity, or subject merely for amusement, esp. in a desultory or superficial way; dabbler (摘自 RHD)。而 macOS 自带的这本牛津英汉汉英词典的释义是“半吊子”，个人感觉挺精辟的。而像 suave 则直接解释为“圆滑的”，相较其他英汉词典的“自信而老于世故的”。但也有一些词，我感觉不是那么贴切。这本英汉词典给 loquacious 的定义是“健谈的”，是个偏向褒义或者中性的解释。但多数英文词典的释义都是偏向贬义的，例如 RHD 解释为 talking or tending to talk much or freely; talkative; chattering; babbling; garrulous。但也可能是我对中文的理解有偏差吧。

总之，再给系统增加一本地道的英文词典不是什么坏事。

## American Dictionaries

美式英文字典有删节版 (abridged) 和完整版 (unabridged)，后者大概是前者的 4 倍厚度。一般市面上看到的 College 或者 Collegiate 的，都属于删节版，但更新频次相对高一些。完整版的字典更新频次较低，我买的 RHD 是 1987 年出版的。

针对本土用户出的字典，可能在学英语的人看来，很多解释并不能理解。例如前面对 loquacious 的解释里，会出现 garrulous 之类的高级词汇。所以各出版商还会有一本针对英语学习者的词典，一般叫做 learner's dictionary，是用初高中英语课学到的那些基本词汇来解释单词的。我比较喜欢 RHD 配合 Merriam-Webster's Advanced Learner's Dictionary。

现在删节版字典基本都能在各自官网上免费用到，或者 App Store 里有免费版可下载。不负责任地说几句我用过的几本词典。

- American Heritage Dictionary 现在出到第五版了，释义清晰，全彩印刷，图片丰富，有详细的词汇发展历史、近义词使用区分等。所以这本词典特别厚，看起来就像完整版词典一样；
- Merriam-Webster’s Collegiate Dictionary 我买过 2011 版，印刷特别密，看起来很吃力。这本词典的解释我经常看不懂。但它是全美国销量第一的词典。它对应的 Mac 版应用很久没更新了，界面在 Retina 屏幕上不清晰；
- Random House Dictionary of The American English Language Unabridged 2nd Edition 如果你特别在意词条的完整解释，那就买一本这个吧。虽然很古老，除了例句少点，其他都好；
- Merriam-Webster's Advanced Learner's Dictionary 解释清晰易懂，示例特别丰富。不过音标是 IPA 的。但美式的 IPA 和英式的 IPA 在某些长短音上符号又是不一样的，我记得初高中课本用的是英式 IPA，所以有时候我会搞混。还是用变音符号 (Diacritical) 的音标更好看懂。

## Dictionary apps for macOS

列举几个我用过的字典应用。

- Dictionary 系统自带，包含前述 New Oxford American Dictionary 和牛津英汉汉英词典；
- [Lingvo Dictionary](https://www.lingvolive.com/en-us) 俄罗斯的一款字典软件，可以自己编译字典，自带 Oxford American Dictionary, Random House Webster's College Dictionary 和 Collins Cobuild Dictionary。此外支持多国语言词典，但 Mac 版不支持中文。价格比较贵，大概 $40，但肯定比你单独去买齐它默认附带的词典要便宜。这个 App 最大的特点是用户可以自己添加词典，但要编译词典的话，得有个 Windows 的电脑；
- [GoldenDict](http://goldendict.org/) 一个开源的字典应用，支持各家的字典格式。这只是一个空的 App，字典是要用户自己添加的。

## Dictionary complilation for macOS

鉴于我比较喜欢系统自带的牛津英汉，又不想同时开着两个 App 查词，因此想把 Lingvo 格式的 RHD 重新编译成系统 App 支持的文件格式。网上搜索了一下，确实在 Github 上有一个工具，叫做 [pyglossary](https://github.com/ilius/pyglossary/)。

### Dependencies

首先，安装 Xcode command line tools。不管是去苹果官网下载，还是在命令行用 `xcode-select --install` 都可以。前者的话，装完之后记得开一下 Xcode，可能需要同意协议。

接着，到苹果的开发者下载页面，下载 [Auxiliary Tools for Xcode 7](https://developer.apple.com/download/more/)。尽管当前 Xcode 版本已经更新了，但这个工具还是可以用的。

加载刚刚下载到的 DMG 文件，执行下述命令，把 Dictionary Development Kit 目录拷贝到 `/Developer/Extras/` 目录下：

```bash
sudo mkdir -p /Developer/Extras/
sudo cp -r '/Volumes/Auxiliary Tools/Dictionary Development Kit' /Developer/Extras
```

pyglossary 需要 Python 3，但 macOS 自带的是 Python 2.7。你可以用 Homebrew 来安装 `python3` 这个包。不过这里我使用 [pyenv](https://github.com/pyenv/pyenv)。

```bash
brew update
brew install pyenv
```

完成后，把 `eval "$(pyenv init -)" 加到你的 shell 里。我用的是 bash，所以可以这么操作

```bash
echo -e 'if command -v pyenv 1>/dev/null 2>&1; then\n  eval "$(pyenv init -)"\nfi' >> ~/.bash_profile
```

接着，使用 `pyenv install -l` 就能看到所有可用的 Python 版本。这里我安装写这篇文章时的稳定版，即 3.6.4。

```bash
pyenv install 3.6.4
```

如果上述命令出现 `zlib not available` 的报错，可能是你更新了 Xcode 但没有更新相应的 Command line tools，去苹果官网重新下载安装一个即可。

有了 Python 3 之后，便默认有了 `pip3` 包管理工具。用它来安装以下几个依赖。

```bash
pip3 install lxml beautifulsoup4 --user
```

把 [pyglossary](https://github.com/ilius/pyglossary/) 仓库拖到本地后，在终端进入该目录，执行 `pyenv local 3.6.4` 即可锁定当前目录的 Python 版本。

最后，由于我的词典文件是 ABBY Lingvo DSL 格式的，可能由于编码之类的原因，在用 pyglossary 转换格式前，需要先使用[这段 gist](https://gist.github.com/elFua/3f9d41a0ccc4b6abf7174e5ef470b372) 重新编码一次。所以下载这个文件到本地，用你喜欢的编辑器打开它，把下面这一行的 `PYGLOSSARY_HOME` 路径改成你的 pyglossary 路径：

```
PYGLOSSARY_HOME="~/projects/pyglossary"
```

再用 `chmod +x path_to_the_gist_file.sh` 给它加上可执行权限。

### Conversion

一切就绪。这里我的 pyglossary 放在 `~/Sites/libraries/pyglossary/` 目录，词典 DSL 文件放在 `~/Documents/dictionaries/RHWUD/` 目录，重新编码脚本放在 `~/Documents/sh/appledict_create_from_dsl.sh`。

首先，重新编码词典的 DSL 文件。非 DSL 词典文件直接跳过。

```bash
~/Documents/sh/appledict_create_from_dsl.sh ~/Documents/dictionaries/RHWUD/En-En-RHWUD.dsl
```

该命令执行到一半会问你 `run make clean?`，回车继续，便会在词典所在目录生成一份文件名带 `_utf-8` 的词典文件。

接着，进入 pyglossary 所在目录，开始转换词典。

```bash
python3 pyglossary.pyw --read-options=resPath=OtherResources --write-format=AppleDict ~/Documents/dictionaries/RHWUD/En-En-RHWUD_utf8.dsl ~/Desktop/RHWUD.xml
```

这里最后一个参数是输出路径。我这里填写 `~/Desktop/RHWUD.xml`，则会在桌面上创建一个 RHWUD 文件夹，转换后的文件都会放到这里。同时，这里的文件名会作为 Dictionary.app 的 Source Name (见后方软件截图)。

转换过程视词典文件大小而定。若文件较大，在上述命令开始执行后一两分钟之内，屏幕都不会有任何更新，所以耐心等待，不要随意终止操作。

然后就可以用一开始下载的 Dictionary Development Kit 编译了。

```bash
cd ~/Desktop/RHWUD
make
make install
```

同样，此处 `make` 对于大字典来说，可能会要好几分钟。最后的 `make install` 即把编译好的词典文件放到 `~/Library/Dictionaries/` 目录下，重启 Dictionary.app，即可在偏好设置里找到新增的词典。

![Random House Webster's Unabridged in Dictionary.app](https://img.alicdn.com/tfscom/TB1QOJWekfb_uJjSsD4XXaqiFXa.jpg)

## Wrap up

最后，你可能注意到我截图里还有一个 Webster's Unabridged Dictionary。这本是 1913 年的 Webster's Unabridged Dictionary。现在已经可以免费下载使用了。如果你不想自己找源文件编译，可以直接到[这个仓库](https://github.com/aparks517/convert-websters)下载安装。

在网上看文章，或者玩游戏的时候，如果养成翻字典的习惯，把不懂的词汇记录到本子或者卡片上，时不时回顾一下，对词汇量还是挺有帮助的。