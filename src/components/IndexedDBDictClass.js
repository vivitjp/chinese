//===========================================
//  IndexedDBClass の ラッパー
//  
//===========================================

import { idbSTATUS } from './IndexedDBClass'
import { getJson } from '../api/getJson';
import IndexedDBClass from './IndexedDBClass'

class IndexedDBDictClass { // extends Promise
  constructor({ db, store, file, indeces }) {   // ??????????? indeces
    this.idb = new IndexedDBClass({
      db: { ...db },
      store: { ...store },
      indeces: { ...indeces } || {}
    });
    this.file = file || null;
  }

  //===========================================
  // 
  //===========================================
  async setDict() {
    try {
      //console.log(idbClass.file)

      const res = await this.idb.initDB({ debug: true });
      //console.log('IndexedDB4Dict initDB: ', res)

      switch (res) {
        case idbSTATUS.OK: //(1)辞書存在 console.log('辞書存在')
          console.log(this.idb.dbObj.name, 'Already Set');
          return true
        case idbSTATUS.NEW: //(2)新規作成
          const data = await getJson(this.file)
          if (!data) throw Error('DATA が空')
          if (!Array.isArray(data)) throw Error('DATA 形式不正: 配列のみ')

          //console.log('idbClass.file: SIZE: ', data.length)
          await this.idb.add({ data: data });   //全登録
          return true
        default:
          throw Error('Status Error')
      }

    } catch (err) {
      console.error('IndexedDB4Dict', err.message)
      return false
    }
  }

  //===========================================
  // Wrapper Exec()
  //===========================================
  async exec({ type, data, key, debug = false }) {
    return await this.idb.exec({ type, data, key, debug });
  }
}

export default IndexedDBDictClass