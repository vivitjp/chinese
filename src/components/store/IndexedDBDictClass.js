//===========================================
//  IndexedDBClass の ラッパー
//  
//===========================================

import { idbStatus } from '../../lib/IndexedDBClass'
import { getJson } from '../../api/getJson';
import IndexedDBClass, { idbTYPE } from '../../lib/IndexedDBClass'

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
  async setDict({ debug = false } = {}) {
    try {
      const res = await this.idb.initDB({ debug });
      if (debug) console.log('IndexedDB4Dict initDB: ', res)

      switch (res.status) {
        case idbStatus.OK: //(1)辞書存在 console.log('辞書存在')
          if (debug) console.log(this.idb.dbObj.name, 'Already Set');
          return true
        case idbStatus.NEW: //(2)新規作成
          const data = await getJson(this.file)
          if (!data) throw Error('DATA が空')
          if (!Array.isArray(data)) throw Error('DATA 形式不正: 配列のみ')

          //console.log('SIZE: ', this.idb.dbObj.name, data.length)
          await this.idb.exec({ type: idbTYPE.Add, data: data })   //全登録
          //await this.idb.add({ data: data });
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