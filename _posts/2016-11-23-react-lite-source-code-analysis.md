---
layout: post
title: React-lite 源码阅读
categories: development
description:  源代码分析
keywords: react, react-lite, frontend
---

本来是想进行 React 源码阅读的，发现 React-lite 貌似更合适一些。

# React-lite 源码解析


首先运行 

    C:\Users\dongf\MyStuff\git\react-lite-master\examples\simple\index.html

设置断点。

## displayName 和 jsx

对照
    
    C:\Users\dongf\MyStuff\git\react-lite-master\__tests__\ReactClass-test.js

line 52:

```javascript
  it('should copy `displayName` onto the Constructor', function() {
    var TestComponent = React.createClass({
      render: function() {
        return <div />;
      },
    });

    expect(TestComponent.displayName)
      .toBe('TestComponent');
  });
```

TestComponent 怎么自动生成 displayName 的呢？

打开

    http://babeljs.io/repl

输入

```javascript
    var TestComponent = React.createClass({
      render: function() {
        return <div />;
      },
    });
```

会发现 babel 编译 jsx 生成的代码，自动添加了 displayName: "TestComponent",

```javascript
"use strict";

var TestComponent = React.createClass({
  displayName: "TestComponent",

  render: function render() {
    return React.createElement("div", null);
  }
});
```

那 test 的代码应该也使用了 babel 编译。

test 入口

    C:\Users\dongf\MyStuff\git\react-lite-master\package.json

line 7:

```
  "scripts": {
    "test": "jest",
```

line 20:

```javascript
  "jest": {
    "scriptPreprocessor": "<rootDir>/jest/preprocessor.js",
    "persistModuleRegistryBetweenSpecs": true,
    "unmockedModulePathPatterns": [
      ""
    ]
  },
```

果然使用了 bebel

    C:\Users\dongf\MyStuff\git\react-lite-master\jest\preprocessor.js

```javascript
var babelJest = require('babel-jest')
var webpackAlias = require('jest-webpack-alias')
```

## createClass

createClass() 生成的类继承了 Component

    C:\Users\dongf\MyStuff\git\react-lite-master\src\createClass.js

line 90:

```javascript
let proto = Klass.prototype = new Facade()
```

line 61:

```javascript
Facade.prototype = Component.prototype
```

如果有 mixin，会将多个 mixin 的 getInitialState 合并到 $getInitialStates。
如果有同名的生命周期事件，则用 _.pipe() 将它们串起来。
否则，后面覆盖前面。

line 15:

```javascript
function combineMixinToProto(proto, mixin) {
	for (let key in mixin) {
	...
		if (key === 'getInitialState') {
			_.addItem(proto.$getInitialStates, value)
			continue
		}
		let curValue = proto[key]
		if (_.isFn(curValue) && _.isFn(value)) {
			proto[key] = _.pipe(curValue, value)
		} else {
			proto[key] = value
		}
    }
}
```

class 的 propTypes，contextTypes，statics 会通过 _.extend() 合并。
getDefaultProps 会合并到 defaultProps 。
也就是说，getDefaultProps() 是最先执行的。在 createClass() 的时候就会执行。

line 34:

```javascript
function combineMixinToClass(Component, mixin) {
	...
		_.extend(Component.propTypes, mixin.propTypes)
	...
		_.extend(Component.contextTypes, mixin.contextTypes)
	...
		_.extend(Component, mixin.statics)
	...
		_.extend(Component.defaultProps, mixin.getDefaultProps())
}
```

## createElement

    C:\Users\dongf\MyStuff\git\react-lite-master\src\createElement.js

先通过 type 得到 vtype
React 有四种类型的 element ，
    VELEMENT, VSTATELESS, VCOMPONENT, VCOMMENT

line 10:

```javascript
export default function createElement(type, props, children) {
	let vtype = null
	if (typeof type === 'string') {
		vtype = VELEMENT
	} else if (typeof type === 'function') {
		if (type.prototype && typeof type.prototype.forceUpdate === 'function') {
			vtype = VCOMPONENT
		} else {
			vtype = VSTATELESS
		}
    }
}
```

createElement() 会将 key 和 ref 从 props 里面单独抽出来。
把 children 和 type 的 defaultProps 还有 其他属性都放到 finalProps 上面去。

line 24:

```javascript
	let key = null
	let ref = null
	let finalProps = {}
	if (props != null) {
	...
					key = '' + props.key
	...
					ref = props.ref
	...
			} else {
				finalProps[propKey] = props[propKey]
	...
	}

	let defaultProps = type.defaultProps
	...
				finalProps[propKey] = defaultProps[propKey]
	...
		finalProps.children = finalChildren
	...
	return createVnode(vtype, type, finalProps, key, ref)
}
```

## React.render()

    C:\Users\dongf\MyStuff\git\react-lite-master\src\ReactDOM.js

line 87:

```javascript
export function render(vnode, container, callback) {
	return renderTreeIntoContainer(vnode, container, callback)
}
```

再找到 renderTreeIntoContainer() 。貌似一个 container 只能 render 一个 react element 。

line 21:

```javascript
let pendingRendering = {}
let vnodeStore = {}
function renderTreeIntoContainer(vnode, container, callback, parentContext) {
    ...
	pendingRendering[id] = true
	let oldVnode = null
	let rootNode = null
	if (oldVnode = vnodeStore[id]) {
		rootNode = compareTwoVnodes(oldVnode, vnode, container.firstChild, parentContext)
	} else {
		rootNode = initVnode(vnode, parentContext, container.namespaceURI)
		var childNode = null
		while (childNode = container.lastChild) {
			container.removeChild(childNode)
		}
		container.appendChild(rootNode)
	}
    ...
}
```

initVnode() 方法定义在

    C:\Users\dongf\MyStuff\git\react-lite-master\src\virtual-dom.js

line 32:

```javascript
export function initVnode(vnode, parentContext, namespaceURI) {
    let { vtype } = vnode
    let node = null
    if (!vtype) { // init text
        node = document.createTextNode(vnode)
    } else if (vtype === VELEMENT) { // init element
        node = initVelem(vnode, parentContext, namespaceURI)
    } else if (vtype === VCOMPONENT) { // init stateful component
        node = initVcomponent(vnode, parentContext, namespaceURI)
    } else if (vtype === VSTATELESS) { // init stateless component
        node = initVstateless(vnode, parentContext, namespaceURI)
    } else if (vtype === VCOMMENT) { // init comment
        node = document.createComment(`react-text: ${ vnode.uid || _.getUid() }`)
    }
    return node
}
```

先看 initVcomponent()，会先根据 contextTypes 获取 componentContext 。
然后调用 Component 的构造函数。

line 399:

```javascript
function initVcomponent(vcomponent, parentContext, namespaceURI) {
    let { type: Component, props, uid } = vcomponent
    let componentContext = getContextByTypes(parentContext, Component.contextTypes)
    let component = new Component(props, componentContext)
    ...
}
```

 `let component = new Component(props, componentContext)` 会调用

    C:\Users\dongf\MyStuff\git\react-lite-master\src\createClass.js

```javascript
export default function createClass(spec) {
    ...
	function Klass(props, context) {
		Component.call(this, props, context)
		this.constructor = Klass
		spec.autobind !== false && bindContext(this, Klass.prototype)
		this.state = this.getInitialState() || this.state
	}
    ...
}
```

此时，会执行 `getInitialState()` 获取初始 state。并会自动为 creaeClass 里面定义的函数绑定 this。

回到

    C:\Users\dongf\MyStuff\git\react-lite-master\src\virtual-dom.js

的 initVcomponent()。

接下来会调用 componentWillMount()。然后通过 `updater.getState()` 获取更新后的 state 。

```javascript
function initVcomponent(vcomponent, parentContext, namespaceURI) {
    ...
    if (component.componentWillMount) {
        component.componentWillMount()
        component.state = updater.getState()
    }
    let vnode = renderComponent(component)
    let node = initVnode(vnode, getChildContext(component, parentContext), namespaceURI)
    node.cache = node.cache || {}
    node.cache[uid] = component
    cache.vnode = vnode
    cache.node = node
    cache.isMounted = true
    _.addItem(pendingComponents, component)

    if (vcomponent.refs && vcomponent.ref != null) {
        _.addItem(pendingRefs, vcomponent)
        _.addItem(pendingRefs, component)
    }

    return node
}
```

因为，componentWillMount() 里面可以通过 this.setState() 来更新 state ，先回去看一下 setSate() 方法的实现。

    C:\Users\dongf\MyStuff\git\react-lite-master\src\Component.js

line 128:

```javascript
Component.prototype = {
    ...
	setState(nextState, callback) {
		let { $updater } = this
		$updater.addCallback(callback)
		$updater.addState(nextState)
	},
}
```

调用了 $updater.addState(nextState)，

line 46:

```javascript
Updater.prototype = {
	emitUpdate(nextProps, nextContext) {
		this.nextProps = nextProps
		this.nextContext = nextContext
		// receive nextProps!! should update immediately
		nextProps || !updateQueue.isPending
		? this.updateComponent()
		: updateQueue.add(this)
	},
    ...
	addState(nextState) {
		if (nextState) {
			_.addItem(this.pendingStates, nextState)
			if (!this.isPending) {
				this.emitUpdate()
			}
		}
	},
```

