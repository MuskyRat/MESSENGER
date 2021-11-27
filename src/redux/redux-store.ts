import {Action, applyMiddleware, combineReducers, compose, createStore} from "redux";
import thunkMiddleware, {ThunkAction} from "redux-thunk";
import chatReducer from "./chat-reducer";

// Инициализация rootReducer

const rootReducer = combineReducers({
    chat: chatReducer
});

// Определение типа для rootReducer

type RootReducerType = typeof rootReducer;

// Определение типа для state

export type AppStateType = ReturnType<RootReducerType>;

// Создание типа для определения типов actions

export type InferActionsTypes<T> = T extends { [keys: string] : (...args: any[]) => infer U } ? U : never;

// Создание типа для определения типа thunk

export type BaseThunkType<A extends Action = Action, R = Promise<void>> = ThunkAction<R, AppStateType, unknown, A>;

// Redux Devtools Extension

const composeEnhancers = (window && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

// Создание store

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunkMiddleware)));

// Создание глобальной переменной для доступа к store из вкладки devtools браузера

// @ts-ignore
window.store = store;

export default store;