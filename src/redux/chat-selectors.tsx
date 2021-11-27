import {AppStateType} from "./redux-store";

// Селекторы для получения данных из стейта

export const selectDialogs = (state: AppStateType) => {
    return state.chat.dialogs;
};

export const selectDialogUserId = (state: AppStateType) => {
    return state.chat.selectedDialogUserId;
};

export const selectDialogFirstName = (state: AppStateType) => {
    return state.chat.selectedDialogFirstName;
};

export const selectDialogLastName = (state: AppStateType) => {
    return state.chat.selectedDialogLastName;
};

export const selectDialogUserPhoto = (state: AppStateType) => {
    return state.chat.selectedDialogUserPhoto;
};

export const selectDialogMessages = (state: AppStateType) => {
    return state.chat.selectedDialogMessages;
};

export const selectStatus = (state: AppStateType) => {
    return state.chat.status;
}