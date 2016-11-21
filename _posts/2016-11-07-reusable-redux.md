---
layout: post
title: 编写可重用的 redux
categories: development
description: redux
keywords: redux
---

可重用的reducer\action

思路一,
generic reducer

// reducer
import {wrapReducer} from '../util/'
import {pagination} from './paginate'
const rootReducer = combineReducers({
  entities: makeEntitiesReducer({ users: {}, repos: {} }),
  pagination: makeEmptyReducer({ starredByUser: {}, stargazersByRepo: {} }),
  errorMessage,
  routing
})
let genericReducer = pagination();
let app = wrapReducer(rootReducer, genericReducer)
// action
call(dispatch, { actions, endpoint, schema, path: ['pagination', 'starredByUser', login] })

优点:
- generic reducer可以嵌套组合。
缺点:
- path需要hard code，或者在view逐级添加。
- 无法重写或者扩展geneneric reducer。

思路二,
扩展actions， 扩展reducers

// action
export const doLoadStarred = createAsyncAction(api.loadStarred, 'LOAD_STARRED', 'nextPageUrl', 'id');
// reducer
let defaultState = {
    isFetching: false,
    nextPageUrl: undefined,
    pageCount: 0,
    ids: []
};

const itemReducer = createReducer(defaultState, assign(asyncReducer.handlers, {
    [asyncActions.success](state, {id, response}) {
        return assign(state, {
            isFetching: false,
            ids: union(state.ids, response.result),
            nextPageUrl: response.nextPageUrl,
            pageCount: state.pageCount + 1
        });
    },
}));

const baseReducer = (state = {}, action) => {
    return assign(state, {[action.id]: itemReducer(state[action.id], action)});
};

export const pagination = combineReducers({
    starredByUser: createReducerBy(baseReducer, loadStarredActions),
    stargazersByRepo: createReducerBy(baseReducer, loadStargazerActions)
});

// common
export const asyncReducer = createReducer({ isFetching: false }, {
    [asyncActions.request](state) {
        return assign(state, { isFetching: true });
    },
    [asyncActions.success](state, {response}) {
        return assign(state, {
            isFetching: false,
        })
    },
    [asyncActions.failure](state) {
        return assign(state, { isFetching: false });
    },
});

缺点:
- 不能动态嵌套state

