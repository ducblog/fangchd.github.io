---
layout: post
title: React Fiber Architecture 笔记
categories: notes
description: React Fiber Architecture 摘录和笔记。
keywords: react, fiber, reconciliation, notes
---

原文：[https://github.com/acdlite/react-fiber-architecture](https://github.com/acdlite/react-fiber-architecture)

## Introduction  

The goal of React Fiber: incremental rendering

> React Fiber 的目标：增量渲染。

### Other key features:

- the ability to pause, abort, or reuse work as new updates come in; 
- the ability to assign priority to different types of updates; 
- and new concurrency primitives.

### Prerequisites

- [React Components, Elements, and Instances](https://facebook.github.io/react/blog/2015/12/18/react-components-elements-and-instances.html) - "Component" is often an overloaded term. A firm grasp of these terms is crucial.
- [Reconciliation](https://facebook.github.io/react/docs/reconciliation.html) - A high-level description of React's reconciliation algorithm.
- [React Basic Theoretical Concepts](https://github.com/reactjs/react-basic) - A description of the conceptual model of React without implementation burden. Some of this may not make sense on first reading. That's okay, it will make more sense with time.
- [React Design Principles](https://facebook.github.io/react/contributing/design-principles.html) - Pay special attention to the section on scheduling. It does a great job of explaining the *why* of React Fiber.

## Review

### What is reconciliation?

<dl>
  <dt>reconciliation</dt>
  <dd>The algorithm React uses to diff one tree with another to determine which parts need to be changed.</dd>

  <dt>update</dt>
  <dd>A change in the data used to render a React app. Usually the result of `setState`. Eventually results in a re-render.</dd>
</dl>

The central idea of React's API is to think of updates as if they cause the entire app to re-render.

> React 的核心概念：`component = function(data)`
> 
> 可以认为，每次数据更新，都会让整个 app 重新 render。

React has optimizations which create the appearance of whole app re-rendering while maintaining great performance. The bulk of these optimizations are part of a process called **reconciliation**.

The key points are:

- Different component types are assumed to generate substantially different trees. React will not attempt to diff them, but rather replace the old tree completely.
- Differing of lists is performed using keys. Keys should be "stable, predictable, and unique."

### Reconciliation versus rendering

In React, reconciliation and rendering are separate phases. 

Fiber reimplements the reconciler. It is not principally concerned with rendering.

> 在 React 中，reconciliation 和 rendering 是两个不同的阶段。
> 
> React Fiber 重新实现了 reconciler。它和 rendering 基本无关。   

React's [Design Principles](https://facebook.github.io/react/contributing/design-principles.html#scheduling) document is so good on this subject that I'll just quote it here:

> In its current implementation React walks the tree recursively and calls render functions of the whole updated tree during a single tick. However in the future it might start delaying some updates to avoid dropping frames.
>
> This is a common theme in React design. Some popular libraries implement the "push" approach where computations are performed when the new data is available. React, however, sticks to the "pull" approach where computations can be delayed until necessary.
>
> React is not a generic data processing library. It is a library for building user interfaces. We think that it is uniquely positioned in an app to know which computations are relevant right now and which are not.
>
> If something is offscreen, we can delay any logic related to it. If data is arriving faster than the frame rate, we can coalesce and batch updates. We can prioritize work coming from user interactions (such as an animation caused by a button click) over less important background work (such as rendering new content just loaded from the network) to avoid dropping frames.

The key points are:

- In a UI, it's not necessary for every update to be applied immediately; in fact, doing so can be wasteful, causing frames to drop and degrading the user experience.
- Different types of updates have different priorities — an animation update needs to complete more quickly than, say, an update from a data store.
- A push-based approach requires the app (you, the programmer) to decide how to schedule work. A pull-based approach allows the framework (React) to be smart and make those decisions for you.

> 目前，React 会在每一个 tick 的时间间隔，遍历组件树，调用其 render 方法。然而，不是每次 UI 更新都需要立即生效。
> 
> React 把 UI 更新分为 reconciliation 和 rendering 两个过程。React Fiber 重新实现了 reconciler，避免连续大负荷的 reconciliation 导致 UI 界面失去响应。让 reconciliation 的过程，尽可能的不被用户觉察。
> 
> 与 iOS 系统类似，React Fiber 通过提高 UI 动画的优先级，带来更佳的用户体验。
> 
> React 是声明式的，而不是命令式的。React 帮你决定怎样 schedule 这些 UI 更新。

## What is a fiber?

Primary goal of Fiber

- pause work and come back to it later.
- assign priority to different types of work.
- reuse previously completed work.
- abort work if it's no longer needed.

A fiber represents a **unit of work**.

The way computers typically track a program's execution is using the [call stack](https://en.wikipedia.org/wiki/Call_stack). When a function is executed, a new **stack frame** is added to the stack. That stack frame represents the work that is performed by that function.

Newer browsers (and React Native) implement APIs that help address this exact problem: `requestIdleCallback` schedules a low priority function to be called during an idle period, and `requestAnimationFrame` schedules a high priority function to be called on the next animation frame. 

Fiber is reimplementation of the stack, specialized for React components. You can think of a single fiber as a **virtual stack frame**.

The advantage of reimplementing the stack is that you can [keep stack frames in memory](https://www.facebook.com/groups/2003630259862046/permalink/2054053404819731/) and execute them however (and *whenever*) you want. This is crucial for accomplishing the goals we have for scheduling.

Aside from scheduling, manually dealing with stack frames unlocks the potential for features such as concurrency and error boundaries. 

### Structure of a fiber

In concrete terms, a fiber is a JavaScript object that contains information about a component, its input, and its output.

A fiber corresponds to a stack frame, but it also corresponds to an instance of a component.

#### `type` and `key`

The type of a fiber describes the component that it corresponds to. For composite components, the type is the function or class component itself. For host components (`div`, `span`, etc.), the type is a string.

#### `child` and `sibling`

These fields point to other fibers, describing the recursive tree structure of a fiber.

#### `return`

The return fiber is the fiber to which the program should return after processing the current one. It is conceptually the same as the return address of a stack frame. It can also be thought of as the parent fiber.

#### `pendingProps` and `memoizedProps`

Conceptually, props are the arguments of a function. A fiber's `pendingProps` are set at the beginning of its execution, and `memoizedProps` are set at the end.

#### `pendingWorkPriority`

A number indicating the priority of the work represented by the fiber. The [ReactPriorityLevel](https://github.com/facebook/react/blob/master/src/renderers/shared/fiber/ReactPriorityLevel.js) module lists the different priority levels and what they represent.

#### `alternate`

<dl>
  <dt>flush</dt>
  <dd>To flush a fiber is to render its output onto the screen.</dd>

  <dt>work-in-progress</dt>
  <dd>A fiber that has not yet completed; conceptually, a stack frame which has not yet returned.</dd>
</dl>

At any time, a component instance has at most two fibers that correspond to it: the current, flushed fiber, and the work-in-progress fiber.

#### `output`

<dl>
  <dt>host component</dt>
  <dd>The leaf nodes of a React application. They are specific to the rendering environment (e.g., in a browser app, they are `div`, `span`, etc.). In JSX, they are denoted using lowercase tag names.</dd>
</dl>

Conceptually, the output of a fiber is the return value of a function.

Every fiber eventually has output, but output is created only at the leaf nodes by **host components**. The output is then transferred up the tree.

## Future sections

That's all there is for now, but this document is nowhere near complete. Future sections will describe the algorithms used throughout the lifecycle of an update. Topics to cover include:

- how the scheduler finds the next unit of work to perform.
- how priority is tracked and propagated through the fiber tree.
- how the scheduler knows when to pause and resume work.
- how work is flushed and marked as complete.
- how side-effects (such as lifecycle methods) work.
- what a coroutine is and how it can be used to implement features like context and layout.

## 一些想法

- React Fiber 借鉴了操作系统中 Process、Thread、Fiber 等相关概念。
- React Fiber 可能会导致，在某些场景下性能测试的结果比原来差一些，但是用户体验却会比原来要好。
- 目前，React 的每次 UI 更新都会很快执行。React Fiber 则可以 schedule 和 abort。这意味着有很多优化场景。
- 很好奇，vue 是如何知道控件的依赖关系的，vue 号称不需要写 key 和 SCU 是怎么做到的。








