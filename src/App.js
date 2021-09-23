import React from 'react';
import { Provider } from 'react-redux';
import { store } from './components/store';

import XxxData from './components/XxxData';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <XxxData />
      </div>
    </Provider>
  );
}

export default App;