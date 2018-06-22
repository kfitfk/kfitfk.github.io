---
layout: post
title: Setup Ruby on Mac
category: programming
poster: https://img.alicdn.com/tfscom/TB1y71ZiTtYBeNjy1XdXXXXyVXa.jpg
summary: A brief summary of installing and using rbenv to install and manage Ruby
---

## Update 2018/06/22

文末提到的 [Ruby China](https://gems.ruby-china.com/) 的镜像域名由于[备案问题](https://ruby-china.org/topics/37030)发生变化，从 `.org` 改为 `.com`。

去年末更新博客的时候就发现 Github 提示我的 github-pages gem 内部有个依赖有安全问题。

![Github RubyGem vulnerability warning](https://img.alicdn.com/tfscom/TB1wB9ZiTtYBeNjy1XdXXXXyVXa.png)

鉴于很久没动过环境了，怕出问题便一直放着。刚刚到博客目录下执行了 `bundle update` 想更新一下，发现 `bundle` 命令不存在。估计是中途重装过一次系统，自己都忘了。也好，重新配置 Ruby 环境。

首先确保机器装了 Xcode 并启动过一次，同意了协议。再安装 [Homebrew](https://brew.sh/)，之后在终端里执行下述命令安装 rbenv。

## rbenv

```bash
brew update
brew install rbenv
```

rbenv 只是用来管理 Ruby 版本的。安装它的同时，会安装 ruby-build 依赖，用来安装 Ruby。

打开 `~/.bash_profile` 文件，在最后添加下面的代码，启用 rbenv。

```bash
eval "$(rbenv init -)"
```

这样每次打开一个终端窗口，都会执行这行语句。如果以后决定不要 rbenv 了，把这行删掉就好了。

使用 `rbenv install --list` 命令查看所有可以安装的 Ruby 版本。我写这篇文章的时候，Ruby 最新的稳定版是 2.5.1，用下述命令安装它。

```bash
rbenv install 2.5.1
```

每当安装完一个新版本的 Ruby 或者 Ruby Gem 之后，执行 `rbenv rehash` 以确保新安装的东西能在命令行被访问到。

现在，执行 `rbenv versions` 会列出当前系统所有可用的 Ruby 版本。第一次执行操作，会看到 system 前面有 `*` 号，代表目前使用的是系统自带的 Ruby。使用 `rbenv global 2.5.1` 即可将全局 Ruby 版本置为 `2.5.1`。

当然，用 rbenv 还可以使用 `rbenv local` 为某个目录指定 Ruby 版本；或者用 `rbenv shell` 来为当前会话指定一个 Ruby 版本。

最后，与 `rbenv install` 对应，用 `rbenv uninstall` 来写在某个 Ruby 版本。

## RubyGem

装完 Ruby 之后默认会提供 gem 命令来管理 RubyGem。使用 `gem update --system` 可以升级包管理工具到最新。

然后就能用 `gem install bundler` 来安装 [bundler](http://bundler.io/) 了。

这里还可以把 RubyGem 的源改成 [Ruby China](https://gems.ruby-china.com/) 的，这样会快一些。

最后，到我的博客目录下，执行 `bundle update` 来更新 github pages gem 及其依赖。再把新的 Gemfile.lock 推到 github 仓库即可解决安全提示问题。
