import React from 'react';
import { Provider } from 'react-redux';
import './App.css';
import store from "../../redux/redux-store";
import Chat from '../Chat/Chat';

const App = () => {
  return (
    <div className="App">
        <Provider store={store}>
            <Chat />
        </Provider>
    </div>
  );
}

export default App;
