import { createSlice } from '@reduxjs/toolkit';
import { apiInitDB, apiAdd, apiUpdate, apiDelete, apiGetOne, apiGetAll, apiClear } from './infoAPI';

//===========================================
//  SLICE
//===========================================
export const infoSlice = createSlice({
  name: 'info',
  initialState: {
    loading: false, error: null, result: null,
  },
  reducers: {
    fetchStart(state, action) {
      state.loading = true;
      state.error = null;
    },
    fetchFailure(state, action) {
      state.loading = true;
      state.error = action.payload;
      console.log('fetchFailure', action.payload)
    },
    fetchSuccess(state, action) {
      state.loading = true;
      state.error = null;
      state.result = action.payload;  //info
    }
  }
})
const { fetchStart, fetchFailure, fetchSuccess } = infoSlice.actions;

//===========================================
//  Functions for DISPATCH
//===========================================
export const infoInitDB = () => async dispatch => {
  try {
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiInitDB()));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const infoGetOne = ({ key, debug = false } = {}) => async dispatch => {
  try {
    if (!key) throw Error('Key 必須')
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiGetOne({ key, debug })));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const infoGetAll = ({ key = null, debug = false } = {}) => async dispatch => {
  try {
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiGetAll({ key, debug })));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const infoAdd = ({ data, debug = false } = {}) => async dispatch => {
  try {
    if (!data) throw Error('Data 必須')
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiAdd({ data, debug })));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const infoUpdate = ({ data, key, debug = false } = {}) => async dispatch => {
  try {
    if (!data || !key) throw Error('Dataとkey 必須')
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiUpdate({ data, key, debug })));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const infoDelete = ({ key, debug = false } = {}) => async dispatch => {
  try {
    if (!key) throw Error('key 必須')
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiDelete({ key, debug })));
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

export const infoClear = ({ debug = false } = {}) => async dispatch => {
  try {
    console.log('infoClear')
    dispatch(fetchStart());
    dispatch(fetchSuccess(await apiClear({ debug })));
  } catch (error) {
    console.log('infoClear Catch Error: ', error)
    dispatch(fetchFailure(error.stack))
  }
}
//===========================================
//  SELECT
//===========================================
export const selectInfo = ({ info }) => info;

export default infoSlice.reducer;