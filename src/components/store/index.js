import { configureStore } from '@reduxjs/toolkit';
import dictsReducer from './dictsSlice';
//import infoReducer from './infoSlice';

export const store = configureStore({
  reducer: {
    dicts: dictsReducer,
    //info: infoReducer
  },
});