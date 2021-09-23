import { configureStore } from '@reduxjs/toolkit';
import dictsReducer from './dictsSlice';

export const store = configureStore({
  reducer: { dicts: dictsReducer },
});