---
layout: post
title: 在 Windows 上搭建本地 Jekyll 编译环境
categories: blog
description: 在 Windows 上搭建本地 Jekyll 环境。
keywords: blog, github, Jekyll
---

按照 [在 Windows 上安装 Jekyll](http://cn.yizeng.me/2013/05/10/setup-jekyll-on-windows/) 操作。  

## 参考链接

* [在 Windows 上安装 Jekyll](http://cn.yizeng.me/2013/05/10/setup-jekyll-on-windows/) 
* [Setting up your GitHub Pages site locally with Jekyll - github](https://help.github.com/articles/setting-up-your-github-pages-site-locally-with-jekyll/)  
* [Run Jekyll on Windows](http://jekyll-windows.juthilo.com/) 

## 故障诊断

### 问题一

        C:\WINDOWS\system32>gem install jekyll
        ERROR:  While executing gem ... (Errno::EINVAL)
        Invalid argument @ rb_file_s_stat - H:/

HOMEDRIVE 被设置到了 H 盘。

**解决办法**：

        SET HOMEDRIVE=C:

**参考链接**：[Error running gem install on Windows 7 64 bit](http://stackoverflow.com/questions/4987300/error-running-gem-install-on-windows-7-64-bit)

### 问题二

        C:\WINDOWS\system32>gem install jekyll
        ERROR:  Could not find a valid gem 'jekyll' (>= 0), here is why:
                Unable to download data from https://rubygems.org/ - SSL_connect returned=1 errno=0 state=SSLv3 read server certificate B: certificate verify failed (https://api.rubygems.org/specs.4.8.gz)

公司网络无法使用 https 访问 rubygems 官网。 

**解决办法**：

        gem install jekyll -r --source http://rubygems.org/

或者修改根目录下面的 Gemfile 文件，将 `source 'https://rubygems.org'` 改为 `source 'http://rubygems.org'`

**参考链接**：[gem 2.0.3 Unable to download data from https://rubygems.org/ - ... bad ecpoint](https://github.com/rubygems/rubygems/issues/515)

### 问题三 

        jekyll serve                                                     
        C:/Ruby23-x64/lib/ruby/2.3.0/rubygems/core_ext/kernel_require.rb:55:in `require': cannot load such file -- bun
        dler (LoadError)                                                                                              
                from C:/Ruby23-x64/lib/ruby/2.3.0/rubygems/core_ext/kernel_require.rb:55:in `require'                 
                from C:/Ruby23-x64/lib/ruby/gems/2.3.0/gems/jekyll-3.3.0/lib/jekyll/plugin_manager.rb:34:in `require_f
        rom_bundler'                                                                                                  
                from C:/Ruby23-x64/lib/ruby/gems/2.3.0/gems/jekyll-3.3.0/exe/jekyll:9:in `<top (required)>'           
                from C:/Ruby23-x64/bin/jekyll:23:in `load'                                                            
                from C:/Ruby23-x64/bin/jekyll:23:in `<main>'  

**解决办法**：

        gem install bundler -r --source http://rubygems.org/

或者，从 rubygems.org 下载 [gem](https://rubygems.org/gems/bundler)，本地安装

        gem install bundler-1.13.6.gem

**参考链接**：[cannot load such file — bundler/setup (LoadError)](http://stackoverflow.com/questions/19061774/cannot-load-such-file-bundler-setup-loaderror#answer-34575728)

### 问题四

        jekyll serve
        C:/Ruby23-x64/lib/ruby/gems/2.3.0/gems/bundler-1.13.6/lib/bundler/resolver.rb:366:in `block in verify_gemfile_
        dependencies_are_found!': Could not find gem 'github-pages x64-mingw32' in any of the gem sources listed in yo
        ur Gemfile or available on this machine. (Bundler::GemNotFound)
                from C:/Ruby23-x64/lib/ruby/gems/2.3.0/gems/bundler-1.13.6/lib/bundler/resolver.rb:341:in `each'
                from C:/Ruby23-x64/lib/ruby/gems/2.3.0/gems/bundler-1.13.6/lib/bundler/resolver.rb:341:in `verify_gemf
        ile_dependencies_are_found!'

**解决办法**：

通过 bundler 安装依赖，

        bundle install

或者

        gem install github-pages -r --source http://rubygems.org/
        gem install wdm -r --source http://rubygems.org/

### 问题五

        C:/Ruby23-x64/lib/ruby/gems/2.3.0/gems/bundler-1.13.6/lib/bundler/runtime.rb:40:in `block in setup': You have already act
        ivated jekyll-sass-converter 1.4.0, but your Gemfile requires jekyll-sass-converter 1.3.0. Prepending `bundle exec` to yo
        ur command may solve this. (Gem::LoadError)  

**解决办法**：

版本冲突，删除

        /Users/Air/git/fangchd/Gemfile.lock

或者

        gem uninstall jekyll-sass-converter
        Select gem to uninstall:
        1. jekyll-sass-converter-1.3.0
        2. jekyll-sass-converter-1.4.0
        3. All versions
        > 2
        Successfully uninstalled jekyll-sass-converter-1.4.0  

        gem uninstall kramdown
        gem uninstall jekyll 

**参考链接**：[You have already activated X, but your Gemfile requires Y](http://stackoverflow.com/questions/6317980/you-have-already-activated-x-but-your-gemfile-requires-y)

### 问题六

        jekyll serve
        ...
        Generating...
        Liquid Exception: No repo name found. Specify using PAGES_REPO_NWO environment variables, 'repository' in your configur
        ation, or set up an 'origin' git remote pointing to your github.com repository. in /Users/dongf/MyStuff/git/fangchd.githu
        b.io/_layouts/default.html
                ERROR: YOUR SITE COULD NOT BE BUILT:
                        ------------------------------------
                        No repo name found. Specify using PAGES_REPO_NWO environment variables, 'repository' in your configur
        ation, or set up an 'origin' git remote pointing to your github.com repository.

**解决办法**：

在 fangchd.github.io\_config.yml 中添加

        repository: fangchd/fangchd.github.io

**参考链接**：[Cannot run Jekyll locally with "No repo name found".](https://github.com/jekyll/jekyll/issues/4705#issuecomment-200991736)

### 问题七

        GitHub Metadata: No GitHub API authentication could be found. Some fields may be missing or have incorrect data.

**解决办法**：

在系统环境变量中添加 JEKYLL_GITHUB_TOKEN 和 SSL_CERT_FILE。 

如果通过代理才能访问 GitHub，设置环境变量 HTTP_PROXY

        SET HTTP_PROXY=http://domain%5Cusername:password@proxy:port

如果是在 MacOS 下，则需要使用

        export http_proxy='http://127.0.0.1:4411/'

**参考链接**：

* [Fix the errors of GitHub Metadata and SSL certificate when running Jekyll serve](https://www.hieule.info/programming/fix-errors-github-metadata-ssl-certificate-running-jekyll-serve/)  
* [GitHub Module Shows Out-of-Date Metadata](https://github.com/DONGChuan/Yummy-Jekyll/issues/6)  
* [How do I update Ruby Gems from behind a Proxy (ISA-NTLM)](http://stackoverflow.com/questions/4418/how-do-i-update-ruby-gems-from-behind-a-proxy-isa-ntlm#answer-4431)
