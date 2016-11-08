---
layout: post
title: 七个小时掌握 mobx
categories: development
description: mobx
keywords: mobx, react, javascript
---


## 参考链接

- [MobX 原理 #3 - sorrycc](https://github.com/sorrycc/blog/issues/3)

## 基本原理

Observable
  - observing: [Derivation]
  - get()
  - set()

Derivation
  - observer: [Observable]

然后，autorun 执行的步骤是这样的：

生成一个 Derivation
执行传入函数，计算出 observing
怎么计算? 访问数据时会走到 Observable 的 get() 方法，通过 get() 方法做的记录
在 observing 的 Observable 的 observer 里添加这个 Derivation

问题：

1. 如果Observable 的 get() 方法是放在onclick的回调函数里面的，那么是否就计算不出来正确的 Derivation 了？
2. Derivation 的传入函数，是否要求是原子性的纯函数，否则怎么判断 Observable 的 get() 方法是不是它调用的？

例一，

	import { observable, autorun } from 'mobx';

	const counter = observable(0);
	autorun(() => {
	  console.log('autorun', counter.get());
	});

	counter.set(1);

例二，

    import { observable, autorun } from 'mobx';

    const counter = observable(0);
    const foo = observable(0);
    const bar = observable(0);
    autorun(() => {
    if (counter.get() === 0) {
        console.log('foo', foo.get());
    } else {
        console.log('bar', bar.get());
    }
    });

    bar.set(10);    // 不触发 autorun
    counter.set(1); // 触发 autorun
    foo.set(100);   // 不触发 autorun
    bar.set(100);   // 触发 autorun

例三，

    import { observable } from 'mobx';
    import { observer } from 'react-mobx';
    import React, { Component } from 'react';
    import ReactDOM from 'react-dom';

    const appState = observable({
    count: 0,
    });
    appState.increment = function() {
    this.count ++;
    };
    appState.decrement = function() {
    this.count --;
    };

    @observer
    class Count extends Component {
    render() {
        return (<div>
        Counter: { appState.count } <br />
        <button onClick={this.handleInc}> + </button>
        <button onClick={this.handleDec}> - </button>
        </div>);
    }
    handleInc() {
        appState.increment();
    }
    handleDec() {
        appState.decrement();
    }
    }

    ReactDOM.render(<Count />, document.getElementById('root'));

mobx 支持的类型有 primitives, arrays, classes 和 objects 。primitives (原始类型) 只能通过 set 和 get 方法取值和设值。而 Object 则可以利用 Object.defineProperty 方法自定义 getter 和 setter，从而直接取值和设值 。

一些概念，

**ComputedValue**

ComputedValue 同时实现了 Observable 和 Derivation 的接口，即可以监听 Observable，也可以被 Derivation 监听。

**Reaction**

Reaction 本质上是 Derivation，但他不能再被其他 Derivation 监听。

**Autorun**

autorun 是 Reaction 的简单封装。

**Transation**

为了批量更新，就引入了 transation 。

    transaction(() => {
    user.firstName = "foo";
    user.lastName = "bar";
    });

**Action**

action 是 transation 是简单封装，支持通过 decorator 的方式调用。并且是 untrack 的，这样可以在 Derivation 里调用他。

**Observe (mobx-react)**

第一次 render 时：

    初始化一个 Reaction，onValidate 时会 forceUpdate Component
    在 reaction.track 里执行 baseRender，建立依赖关系

有数据修改时：

    触发 onValidate 方法，执行 forceUpdate
    触发 render 的执行 (由于在 reaction.track 里执行，所以会重新建立依赖关系)

shouldComponentUpdate：

    和 PureRenderMixin 类似的实现，阻止不必要的更新

componentWillReact:

    数据更新的时候触发
    注意和 componentWillMount 和 componentWillUpdate 的区别


Observable, ComputedValue, Derivation, Action, Transation, Autorun, Reaction, Modifier

## 参考链接

- [Ten minute introduction to MobX and React](https://mobxjs.github.io/mobx/getting-started.html)

### The core idea

MobX makes state management simple again by addressing the root issue: it makes it impossible to produce an inconsistent state. 
The strategy to achieve that is simple: Make sure that everything that can be derived from the application state, will be derived. Automatically.

Actions (Event Handlers / Incoming WebSockets)

    mutate=>
    State (Complex Data Graph / Single Source of Trueth)

        updates=>
        Derivations (Computed Values / Rendering / Serialization)
            =>
            Reactions (IO / DOM updates / Networking)
        =>
        Reactions (IO / DOM updates / Networking)

### Conclusion

    Use the @observable decorator or observable(object or array) functions to make objects trackable for MobX.
    The @computed decorator can be used to create functions that can automatically derive their value from the state.
    Use autorun to automatically run functions that depend on some observable state. This is useful for logging, making network requests, etc.
    Use the @observer decorator from the mobx-react package to make your React components truly reactive. They will update automatically and efficiently. Even when used in large complex applications with large amounts of data.


### MobX is not a state container

In that sense the above examples are contrived and it is recommended to use proper engineering practices like encapsulating logic in methods, organize them in stores or controllers etc. 

Writing in MobX means that using controllers/ dispatchers/ actions/ supervisors or another form of managing dataflow returns to being an architectural concern you can pattern to your application's needs, rather than being something that's required by default for anything more than a Todo app.





