import {BaseThunkType, InferActionsTypes} from "./redux-store";
import {chatAPI, ChatDialogType, ChatMessageType, StatusType} from "../api/chat-api";
import {Dispatch} from "redux";

// Инициализация Initial State

let initialState = {
    dialogs: [
        {userId: 1, firstName: 'First name', lastName: 'Last name', userPhoto: null, messages: [
                {userId: 1, firstName: 'First name', lastName: 'Last name', message: 'Hi John, what do you think about corporate messengers? I know some new apps on UC market', messageId: 1, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
                {userId: 1, firstName: 'First name', lastName: 'Last name', message: 'I did’t have time to study all unified communications market. The real issue is overload.', messageId: 2, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
                {userId: 2, firstName: 'First name', lastName: 'Last name', message: 'Hi First name, I need some time for creating study peport. 3 hours for everything', messageId: 3, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
                {userId: 1, firstName: 'First name', lastName: 'Last name', message: 'Ok, just do it', messageId: 4, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
            ]}
    ] as ChatDialogType[],

    // Поставленная задача не требует реализации выбора диалога из списка диалогов, предполагается наличие функционала по выбору диалога и,
    // соответственно, инициализации параметров selectedDialog..., представленных ниже.

    selectedDialogUserId: 1 as number | null,

    selectedDialogFirstName: 'First name' as string | null,
    selectedDialogLastName: 'Last name' as string | null,
    selectedDialogUserPhoto: null as string | null,
    selectedDialogMessages: [
        {userId: 1, firstName: 'First name', lastName: 'Last name', message: 'Hi John, what do you think about corporate messengers?\n I know some new apps on UC market', messageId: 1, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
        {userId: 1, firstName: 'First name', lastName: 'Last name', message: 'I did’t have time to study all unified communications market.\n The real issue is overload.', messageId: 2, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
        {userId: 2, firstName: 'First name', lastName: 'Last name', message: 'Hi First name, I need some time for creating study peport.\n 3 hours for everything', messageId: 3, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},
        {userId: 1, firstName: 'First name', lastName: 'Last name', message: 'Ok, just do it', messageId: 4, time: '2021-11-24T19:41:00.000+03:00', userPhoto: null},

    ] as ChatMessageType[] | null,

    status: 'pending' as StatusType
};

// Инициализация Chat Reducer

const chatReducer = (state = initialState, action: ActionsTypes): InitialStateType => {
    switch(action.type) {
        case 'QEX/CHAT/SET_DIALOGS':
            let selectedDialog = state.selectedDialogUserId ? action.newDialogs.filter((d) => d["userId"] === state.selectedDialogUserId)[0] : null;
            return {...state, dialogs: action.newDialogs,
                selectedDialogFirstName: selectedDialog ? selectedDialog.firstName : state.selectedDialogFirstName,
                selectedDialogLastName: selectedDialog ? selectedDialog.lastName : state.selectedDialogLastName,
                selectedDialogUserPhoto: selectedDialog ? selectedDialog.userPhoto : state.selectedDialogUserPhoto,
                selectedDialogMessages: selectedDialog ? selectedDialog.messages : state.selectedDialogMessages};
        case 'QEX/CHAT/SET_STATUS':
            return {...state, status: action.status};
        case 'QEX/CHAT/DELETE_DIALOGS':
            return {...state, dialogs: [],
                selectedDialogUserId: null,
                selectedDialogFirstName: null,
                selectedDialogLastName: null,
                selectedDialogUserPhoto: null,
                selectedDialogMessages: null};
        default:
            return state;
    }
};

// Создание объекта с actions

export const actions = {
    setDialogs: (newDialogs: ChatDialogType[]) => ({type: 'QEX/CHAT/SET_DIALOGS', newDialogs} as const),
    deleteDialogs: () => ({type: 'QEX/CHAT/DELETE_DIALOGS'} as const),
    setStatus: (status: StatusType) => ({type: 'QEX/CHAT/SET_STATUS', status} as const),
};

// Создание переменной для мемоизации

let _newMessageHandler: ((dialogs: ChatDialogType[]) => void) | null = null;

// Создание функции высшего порядка для передачи коллбэку метода dispatch

const newMessageHandlerCreator = (dispatch: Dispatch) => {
    if(_newMessageHandler === null) {
        _newMessageHandler = (dialogs) => {
            dispatch(actions.setDialogs(dialogs));
        }
    }
    return _newMessageHandler;
};

// Создание переменной для мемоизации

let _statusChangedHandler: ((status: StatusType) => void) | null = null;

// Создание функции высшего порядка для передачи коллбэку метода dispatch

const statusChangedHandlerCreator = (dispatch: Dispatch) => {
    if(_statusChangedHandler === null) {
        _statusChangedHandler = (status) => {
            dispatch(actions.setStatus(status));
        }
    }
    return _statusChangedHandler;
};

// Инициализация thunk для создания WebSocket соединения и подписки на диалоги и статус WebSocket соединения

export const startMessagesListening = (): ThunkType => async (dispatch) => {
    chatAPI.start();
    chatAPI.subscribe('dialogs-received', newMessageHandlerCreator(dispatch));
    chatAPI.subscribe('status-changed', statusChangedHandlerCreator(dispatch));
};

// Инициализация thunk для закрытия WebSocket соединения и отписки от диалогов и статуса WebSocket соединения

export const stopMessagesListening = (): ThunkType => async (dispatch) => {
    chatAPI.stop();
    chatAPI.unsubscribe('dialogs-received', newMessageHandlerCreator(dispatch));
    chatAPI.unsubscribe('status-changed', statusChangedHandlerCreator(dispatch));
    dispatch(actions.deleteDialogs());
};

// Инициализация thunk для отправки сообщений

export const sendMessage = (message: string, id: number): ThunkType => async  (dispatch) => {
    const newMessage = JSON.stringify({message, id})
    chatAPI.sendMessage(newMessage);
}

// Определение типа для Initial State

export type InitialStateType = typeof initialState;

// Определение типов для actions

type ActionsTypes = InferActionsTypes<typeof actions>;

// Определение типа для thunk

type ThunkType = BaseThunkType<ActionsTypes>;

export default chatReducer;