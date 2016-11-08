---
layout: post
title: npm 和 yarn 常用命令对照表
categories: development
description: table mapping npm commands to yarn commands
keywords: yarn, npm, commands, mapping
---

## 参考链接：

- [Migrating from npm - yarnpkg.com](https://yarnpkg.com/en/docs/migrating-from-npm)

- [Add table mapping npm commands to yarn commands #16](https://github.com/yarnpkg/website/issues/16)

## 常用命令对照表

|  功能   |               npm                 |             yarn              |
|:--------|:----------------------------------|:------------------------------|
|  安装   | npm install                       | yarn                          |
|         | npm install [package]             | (N/A)                         |
|         | npm install --save [package]      | yarn add [package]            |
|         | npm install --save-dev [package]  | yarn add [package] [--dev/-D] |
|         | npm install --global [package]    | yarn global add [package]     |
|         | npm rebuild                       | yarn install --force          |
|  卸载   | npm uninstall [package]           | (N/A)                         |
|         | npm uninstall --save [package]    | yarn remove [package]         |
|         | npm uninstall --save-dev [package]| yarn remove [package]         |
|         | rm -rf node_modules && npm install| yarn upgrade                  |

### 小结

- yarn 的 install，对应 npm 的 install 不带参数。
- yarn 的 add，对应 npm 的 install 加上 --save。
- yarn 的 add 加上 -D，对应 npm 的 install 加上 --save-dev。
- yarn 的 remove, 不需要加参数，对应 npm 的 npm uninstall [--save/-save-dev]

yarn 和 npm 相比，省略了一些不必要的参数，去掉了一些不常用的命令。
但是 yarn 没有 类似 `npm i` 和 `npm un`、`npm i -g` 这样的缩写，是一个退步。 

## 两者一致的常用命令

|  功能   |               npm                 |             yarn              |
|:--------|:----------------------------------|:------------------------------|
|         | npm cache clean                   | yarn cache clean              |
|         | npm info [package]                | yarn info [package]           |
|         | npm init                          | yarn init                     |
|         | npm run                           | yarn run                      |
|         | npm test                          | yarn test                     |

## yarn 的一些其它命令

- `yarn link`
Symlink a package folder during development.

- `yarn licenses ls`
List licenses for installed packages.

- `yarn ls`
List installed packages.

- `yarn self-update`
Updates Yarn to the latest version.

- `yarn version`
Updates the package version.

- `yarn why`
Show information about why a package is installed.
