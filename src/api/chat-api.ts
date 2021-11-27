
// Создание объекта для хранения подписчиков на диалоги и статус соединения WebSocket

let subscribers = {
    'dialogs-received': [] as DialogsReceivedSubscriberType[],
    'status-changed': [] as StatusChangedSubscriberType[]
}

// Мемоизация WebSocket

let ws: WebSocket | null = null;

// Инициализация функциии для информирования подписчиков о статусе соединения WebSocket

const notifySubscribersAboutStatus = (status: StatusType) => {
    subscribers['status-changed'].forEach((s) => s(status));
};

// Обработчик события 'open' WebSocket

const openHandler = () => {
    notifySubscribersAboutStatus('ready');
};

// Обработчик события 'close' WebSocket

const closeHandler = () => {
    notifySubscribersAboutStatus('pending');
    setTimeout(createChannel, 3000);
};

// Обработчик события 'error' WebSocket

const errorHandler = () => {
    notifySubscribersAboutStatus('error');
    console.log('Some error occurred, please refresh the page');
};

// Обработчик события 'message' WebSocket

const messageHandler = (e: MessageEvent) => {
    subscribers['dialogs-received'].forEach((s) => s(JSON.parse(e.data)));
};

// Инициализация функции для очистки памяти и закрытия предшествующего соединения WebSocket

const cleanUp = () => {
    ws?.removeEventListener('open', openHandler);
    ws?.removeEventListener('close', closeHandler);
    ws?.removeEventListener('error', errorHandler);
    ws?.removeEventListener('message', messageHandler);
    ws?.close();
};

// Инициализация функции для создания соединения WebSocket, назначения обработчиков на события 'open', 'close', 'error', 'message'
// и информирования подписчиков о статусе соединения 'pending'

const createChannel = () => {
    cleanUp();
    ws = new WebSocket('wss://ws.qexsystems.ru');
    notifySubscribersAboutStatus('pending');
    ws.addEventListener('open', openHandler);
    ws.addEventListener('close', closeHandler);
    ws.addEventListener('error', errorHandler);
    ws.addEventListener('message', messageHandler);
};

// Создание объекта Chat API

export const chatAPI = {
    start () {
        createChannel();
    },
    stop () {
        subscribers['dialogs-received'] = [];
        subscribers['status-changed'] = [];
        cleanUp();
    },
    subscribe (eventName: EventsNamesType, callback: DialogsReceivedSubscriberType | StatusChangedSubscriberType) {
        // @ts-ignore
        subscribers[eventName].push(callback);
        return () => {
            // @ts-ignore
            subscribers[eventName] = subscribers[eventName].filter((s) => s !== callback);
        };
    },
    unsubscribe (eventName: EventsNamesType, callback: DialogsReceivedSubscriberType | StatusChangedSubscriberType) {
        // @ts-ignore
        subscribers[eventName] = subscribers[eventName].filter((s) => s !== callback);
    },
    sendMessage (newMessage: string) {
        ws?.send(newMessage);
    }
};

// Определение типа подписчика на диалоги

type DialogsReceivedSubscriberType = (dialogs: ChatDialogType[]) => void;

// Определение типа подписчика на статус соединения WebSocket

type StatusChangedSubscriberType = (status: StatusType) => void;

// Определение типа для диалога

export type ChatDialogType = {
    userId: number,
    firstName: string,
    lastName: string,
    userPhoto: string | null,
    messages: ChatMessageType[]
};

// Определение типа для сообщения

export type ChatMessageType = {
    userId: number
    firstName: string,
    lastName: string,
    message: string,
    time: string,
    messageId: number,
    userPhoto: string | null
};

// Определение типа для статуса соединения WebSocket

export type StatusType = 'pending' | 'ready' | 'error';

// Определение типа для EventsNames

type EventsNamesType = 'dialogs-received' | 'status-changed';