---
layout: post
title: Git 的配置和使用
categories: development
description: My Git config.
keywords: Git, config
---

Git 配置和一些参考链接。

## 我的 Git 配置

```
[diff]
	tool = tortoisediff
[difftool]
	prompt = false
[difftool "tortoisediff"]
	cmd = \""c:/Program Files/TortoiseGIT/bin/TortoiseGitMerge.exe"\" -mine "$REMOTE" -base "$LOCAL"
[merge]
	tool = tortoisemerge
[mergetool]
	prompt = false
	keepBackup = false
[mergetool "tortoisemerge"]
	cmd = \""c:/Program Files/TortoiseGIT/bin/TortoiseGitMerge.exe"\" -base "$BASE" -theirs "$REMOTE" -mine "$LOCAL" -merged "$MERGED"
[url "https://"]
	insteadOf = git://
[http]
	sslverify = false
[core]
[user]
	name = fangchd
[alias]
	lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
	co = checkout
	ci = commit
	br = branch
	st = status
	ds = diff --stat
	dt = difftool
```

## 常用 git 命令

**查看 git 配置**

    git config -l --show-origin

**测试 github 连接**

    git ls-remote --exit-code -h "https://github.com/reactjs/redux.git"

**避免git每次提交都输入密码**

	git config --global credential.helper store

**懒人必备alias**

	[alias]
		d = "!git add . \
	; git commit -m \"update\" \
	; git push \
	"











 