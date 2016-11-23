---
layout: post
title: 如何写一个开源 javascript library 
categories: development
description:  笔记
keywords: opensource, javascript, library 
---

- [Introducing: How to Contribute to Open Source - medium](https://medium.com/@kentcdodds/introducing-how-to-contribute-to-open-source-be67917eb704#.yt5exq9tf)
- [Introduction to How to Write an Open Source JavaScript Library - egghead](https://egghead.io/lessons/javascript-how-to-write-a-javascript-library-introduction)
- [How to Contribute to an Open Source Project on GitHub - egghead](https://egghead.io/lessons/javascript-introduction-to-github)
- [https://github.com/kentcdodds/starwars-names/](https://github.com/kentcdodds/starwars-names/)


### npm

www.npmjs.com

```
npm set init-author-name ''
npm set init-author-email ''
npm set init-author-url ''
npm set init.license ''
npm set save-exact true
npm adduser
npm publish
npm i -D mocha chai
npm t
npm t -- -w
```

### travis

.travis.yml

### git

```
git add -A
git tag 1.0.0
git push --tags
git tag 1.1.0-beta.0
```

github.com/github/gitignore

```
ls -all ~/.ssh
ssh-keygen -t rsa -b 4096 -C idfc@qq.com
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
pbcopy < ~/.ssh/id_rsa.pub
ssh -T git@github.com
github error permission dennied public key
```

```
git remote add upstream
git fetch upstream
git branch --set-upstream-to=upstream/master master
git checkout -b pr/padLeftt
git push origin pr/padLeft
git push -u origin pr/padLeft
git push --no-verify
```

### chai / mocha

```
var expect = require('chai').expect;
var starWars = require('./index');
describe('starwars-names', function () {
	it('should work!', function () {
		expect(true).to.be.true;
	});
});

expect(starWars.all).to.satisfy();

expect(starWars.all).include();
```

```
mocha src/index.test.js -w
```

### semantic-release-cli

```
npm install -g semantic-release-cli
```

### git-cz

### ghooks

```
script:
  - npm run test
```

```
config: {
	ghooks: {
		"pre-commit": "npm run test:single"
	}
}
```

### istanbul

### codecov

### shields.io

badge

### rimraf

for windows

### babel-cli / babel-preset

### babel-register

for mocha

### nyc

for istanbul

```
nyc npm t
```

### webpack / json-loader / babel-loader

for umd

### npmcdn.com




