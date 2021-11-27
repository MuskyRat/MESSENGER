import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import style from './Chat.module.css';
import {useDispatch, useSelector} from "react-redux";
import defaultUserPhoto from '../../assets/ElonMusk.png';
import {
    selectDialogFirstName,
    selectDialogLastName,
    selectDialogMessages,
    selectDialogUserId,
    selectDialogUserPhoto,
    selectStatus
} from "../../redux/chat-selectors";
import {sendMessage, startMessagesListening, stopMessagesListening} from "../../redux/chat-reducer";
import {ChatMessageType} from "../../api/chat-api";
import classNames from 'classnames';

// Компонент Chat

const Chat: React.FC = () => {

    const status = useSelector(selectStatus);

    const dispatch = useDispatch();

    // Создание/закрытие WebSocket соединения и подписка/отписка на/от диалоги и статус WebSocket соединения

    useEffect(() => {
        dispatch(startMessagesListening());
        return () => {
            stopMessagesListening();
        };
    }, []);

    return (
        <div className={style.wrapper}>
            {status === 'error' && <div className={style.error}>Some Error occurred, please refresh the page</div>}
            <ChatHeader/>
            <Messages/>
            <AddChatMessageForm/>
        </div>
    )

};

// Компонент ChatHeader

const ChatHeader: React.FC = () => {

    const firstName = useSelector(selectDialogFirstName);

    const lastName = useSelector(selectDialogLastName);

    const userPhoto = useSelector(selectDialogUserPhoto);

    return (
        <div className={style.chatHeader}><img src={userPhoto ? userPhoto : defaultUserPhoto}
                                               alt="userPhoto"/><span>{firstName} +{lastName}</span></div>
    )

};

// Компонент Messages

const Messages: React.FC = () => {

    const messages = useSelector(selectDialogMessages);

    // Создание локального стейта для автоскрола сообщений

    const [autoScroll, setAutoScroll] = useState<boolean>(true);

    // Реф для автоскрола

    const messagesAnchorRef = useRef<HTMLDivElement>(null);

    // Обработчик для события 'scroll'

    const scrollHandler = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const element = event.currentTarget;
        if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 300) {
            !autoScroll && setAutoScroll(true);
        } else {
            autoScroll && setAutoScroll(false);
        }
    };

    // Применить автоскрол, если переменная autoScroll = true

    useEffect(() => {
        if (autoScroll) {
            messagesAnchorRef.current?.scrollIntoView({behavior: "smooth"})
        }
    });

    return (
        <div className={style.messagesWrapper}>
            <div className={style.messages} onScroll={scrollHandler}>
                {messages && messages.map((m) => <Message key={m.messageId} currentMessage={m}/>)}
                <div ref={messagesAnchorRef}></div>
            </div>
        </div>
    )

};

// Компонент Message

const Message: React.FC<{ currentMessage: ChatMessageType }> = ({currentMessage}) => {

    const dialogUserId = useSelector(selectDialogUserId);

    const {userPhoto, firstName, lastName, message, time, userId} = currentMessage;

    // Создание объекта Date для обработки времени отправки сообщения

    const timeObject = new Date(time);

    // Инициализация даты заданного формата

    const messageTime = `${timeObject.getHours()}:${timeObject.getMinutes()} ${timeObject.getHours() >= 12 ? 'AM' : 'PM'}`

    // Вспомогательные переменные для динамического определения классов элементов

    const messageBodyClassName = classNames(style.messageBody, {[style.outgoingMessageBody]: dialogUserId !== userId});

    const messageTimeClassName = classNames(style.messageTime, {[style.outgoingMessageTime]: dialogUserId !== userId});

    const messageContainerClassName = classNames(style.messageContainer, {[style.outgoingMessageContainer]: dialogUserId !== userId});

    return (
        <div className={style.message}>

            <div className={messageContainerClassName}>
                {dialogUserId === userId && <div className={style.messagePhoto}><img src={userPhoto ? userPhoto : defaultUserPhoto} alt="userPhoto"/></div>}

                <div className={messageBodyClassName}>

                    {dialogUserId === userId && <div className={style.userName}><span>{firstName} +{lastName}</span></div>}

                    <div className={style.messageContent}>
                        <p className={style.messageText}>{message}</p><span className={messageTimeClassName}>{messageTime}</span>
                    </div>

                </div>
            </div>

        </div>
    )

};

// Компонент AddChatMessageForm

const AddChatMessageForm: React.FC = () => {

    const dialogUserId = useSelector(selectDialogUserId);

    const status = useSelector(selectStatus);

    const dispatch = useDispatch();

    // Локальный стейт для текста сообщения

    const [message, setMessage] = useState<string>('');

    // Обработчик события 'change' элемента textarea

    const messageChangedHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value)
    }

    // Обработчик события click кнопки

    const sendMessageHandler = () => {
        if (!message || !dialogUserId) return;
        dispatch(sendMessage(message, dialogUserId));
        setMessage('');
    };

    // Обработчик события 'keypress' нажатия кнопок ctrl + Enter для отправки сообщения с клавиатуры

    const keyPressHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.ctrlKey && event.code === 'Enter') {
            sendMessageHandler();
        }
    };

    return (
        <div className={style.form}>
            <textarea onChange={messageChangedHandler} value={message} onKeyPress={keyPressHandler} className={style.textarea}></textarea>
            {!message && <span className={style.placeholder}>Enter text message...</span>}
            <button disabled={status !== 'ready'} onClick={sendMessageHandler} className={style.button}>
                {message && <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M34.9229 1.5002C35.0025 1.30144 35.0219 1.08369 34.9789 0.873962C34.9359 0.664233 34.8323 0.471742 34.6809 0.320352C34.5295 0.168963 34.337 0.0653337 34.1273 0.0223111C33.9175 -0.0207115 33.6998 -0.00123505 33.501 0.0783258L33.2932 0.161451L1.67945 12.8052L1.67727 12.8074L0.688515 13.2011C0.501244 13.2758 0.338265 13.4008 0.217581 13.5624C0.0968965 13.7239 0.0232045 13.9156 0.00464454 14.1164C-0.0139154 14.3171 0.0233791 14.5191 0.112409 14.7C0.201438 14.8809 0.338737 15.0337 0.50914 15.1415L1.40602 15.7102L1.4082 15.7146L11.3898 22.0649L12.3348 22.6665L12.9363 23.6115L19.2866 33.593L19.291 33.5974L19.8598 34.4943C19.9679 34.664 20.1207 34.8006 20.3015 34.8891C20.4823 34.9776 20.6839 35.0144 20.8843 34.9957C21.0847 34.9769 21.276 34.9032 21.4372 34.7827C21.5984 34.6622 21.7232 34.4996 21.7979 34.3127L22.1938 33.3218L34.8398 1.70583L34.9229 1.49801V1.5002ZM30.9132 5.63458L31.9435 3.0577L29.3666 4.08801L12.9735 20.4811L13.7129 20.9515C13.8486 21.0376 13.9636 21.1526 14.0498 21.2883L14.5201 22.0277L30.9132 5.63458V5.63458Z" fill="#14FF72"/>
                </svg>}
                {!message && <svg width="36" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M34.9229 1.5002C35.0025 1.30144 35.0219 1.08369 34.9789 0.873962C34.9359 0.664233 34.8323 0.471742 34.6809 0.320352C34.5295 0.168963 34.337 0.0653337 34.1273 0.0223111C33.9175 -0.0207115 33.6998 -0.00123505 33.501 0.0783258L33.2932 0.161451L1.67945 12.8052L1.67727 12.8074L0.688515 13.2011C0.501244 13.2758 0.338265 13.4008 0.217581 13.5624C0.0968965 13.7239 0.0232045 13.9156 0.00464454 14.1164C-0.0139154 14.3171 0.0233791 14.5191 0.112409 14.7C0.201438 14.8809 0.338737 15.0337 0.50914 15.1415L1.40602 15.7102L1.4082 15.7146L11.3898 22.0649L12.3348 22.6665L12.9363 23.6115L19.2866 33.593L19.291 33.5974L19.8598 34.4943C19.9679 34.664 20.1207 34.8006 20.3015 34.8891C20.4823 34.9776 20.6839 35.0144 20.8843 34.9957C21.0847 34.9769 21.276 34.9032 21.4372 34.7827C21.5984 34.6622 21.7232 34.4996 21.7979 34.3127L22.1938 33.3218L34.8398 1.70583L34.9229 1.49801V1.5002ZM30.9132 5.63458L31.9435 3.0577L29.3666 4.08801L12.9735 20.4811L13.7129 20.9515C13.8486 21.0376 13.9636 21.1526 14.0498 21.2883L14.5201 22.0277L30.9132 5.63458V5.63458Z" fill="#9B9B9B"/>
                </svg>}
            </button>
        </div>
    )

};


export default Chat;