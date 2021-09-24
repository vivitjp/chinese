import IndexedDBClass, { idbTYPE } from '../../lib/IndexedDBClass'

const idbInfo = new IndexedDBClass({
  db: { name: "info", version: 1 },
  store: { name: "user", storeOptions: { keyPath: "KEY", autoIncrement: false }, },
});

//=====================================
// API: apiInitDB()
//=====================================
export const apiInitDB = async () => {
  try {
    const res = await idbInfo.initDB();
    return { status: true };  //[Redux: Slice] Serialize 可能な形でreturn
  } catch (e) {
    console.log('[apiInitDB]', e.message)
    return Promise.reject('[apiInitDB]: ' + e.message);
  }
}

//=====================================
// API: apiAdd()
//=====================================
export const apiAdd = async ({ data, debug = false }) => {
  //console.log('apiAdd')
  try {
    if (!data) throw Error('Data 空');
    return await idbInfo.exec({ type: idbTYPE.Add, data, debug });
  } catch (e) {
    console.log('[apiAdd]', e.message)
    return Promise.reject('[apiAdd]: ' + e.message);
  }
}

//=====================================
// API: apiAdd()
//=====================================
export const apiUpdate = async ({ key, data, debug = false }) => {
  //console.log('apiUpdate')
  if (!data || !key) throw Error('Data or Key 空');
  try {
    return await idbInfo.exec({ type: idbTYPE.Update, data, key, debug });
  } catch (e) {
    console.log('[apiUpdate]', e.message)
    return Promise.reject('[apiUpdate]: ' + e.message);
  }
}

//=====================================
// API: apiGetOne()
//=====================================
export const apiGetOne = async ({ key, debug = false }) => {
  //console.log('apiGetOne')
  if (!key) throw Error('Key 空');
  try {
    return await idbInfo.exec({ type: idbTYPE.GetOne, key, debug });
  } catch (e) {
    console.log('[apiGetOne]', e.message)
    return Promise.reject('[apiGetOne]: ' + e.message);
  }
}

//=====================================
// API: apiGetAll()
//=====================================
export const apiGetAll = async ({ key = null, debug = false }) => {
  //console.log('apiGetAll')
  try {
    return await idbInfo.exec({ type: idbTYPE.GetAll, key, debug });
  } catch (e) {
    console.log('[apiGetAll]', e.message)
    return Promise.reject('[apiGetAll]: ' + e.message);
  }
}

//=====================================
// API: apiDelete()
//=====================================
export const apiDelete = async ({ key, debug = false }) => {
  //console.log('apiDelete')
  try {
    if (!key) throw Error('Key 空');
    return await idbInfo.exec({ type: idbTYPE.Delete, key, debug });
  } catch (e) {
    console.log('[apiDelete]', e.message)
    return Promise.reject('[apiDelete]: ' + e.message);
  }
}

//=====================================
// API: apiClear()
//=====================================
export const apiClear = async ({ debug = false }) => {
  //console.log('apiClear')
  try {
    return await idbInfo.exec({ type: idbTYPE.Clear, debug });
  } catch (e) {
    console.log('[apiClear]', e.message)
    return Promise.reject('[apiClear]: ' + e.message);
  }
}