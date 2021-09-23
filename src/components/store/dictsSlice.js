import { createSlice } from '@reduxjs/toolkit';
import { getDicts } from './dictsAPI';

export const dictsSlice = createSlice({
  name: 'dicts',
  initialState: {
    loading: false, error: null, status: false,
  },
  reducers: {
    fetchStart(state, action) {
      state.loading = true;
      state.error = null;
    },
    fetchFailure(state, action) {
      state.loading = true;
      state.error = action.payload;
    },
    fetchSuccess(state, action) {
      state.loading = true;
      state.error = null;
      state.status = action.payload;  //Dicts
    }
  }
})

const { fetchStart, fetchFailure, fetchSuccess } = dictsSlice.actions;

export const fetchDicts = () => async dispatch => {
  try {
    dispatch(fetchStart());
    dispatch(fetchSuccess(await getDicts()));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const selectDicts = ({ dicts }) => dicts;
export default dictsSlice.reducer;