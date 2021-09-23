// const idbClass = new IndexedDBClass({
//   db: { name: "chinesePingYinDic125", version: 1 },
//   store: {
//     name: "jibo",
//     // 1) storeOptions 必須
//     storeOptions: { keyPath: "idx", autoIncrement: true },
//     indexes: [  //main key 以外の検索用 index 作成
//       { idxName: "JB", unique: false },  
//     ]
//
//     2) storeOptions: { keyPath: "JB", autoIncrement: false },   <<--Firefox 必須!!!!
//     indexes: [  //これは main key 以外の
//       { idxName: "JB", unique: true },  
//     ]
//   }
// });


export const idbStatus = {
  ERR: 0,
  OK: 1,
  NEW: 2,
  NOREC2UPD: 3
}

export const idbTYPE = {
  Add: 'Add',
  Update: 'Update',
  Delete: 'Delete',
  Clear: 'Clear',
  GetOne: 'GetOne',
  GetAll: 'GetAll',
}

class IndexedDBClass { // extends Promise
  constructor({ db, store, file }) {
    this.dbObj = { ...db };
    this.storeObj = { ...store };
    this.status = idbStatus.ERR;
  }

  //===========================================
  //  DBの状態をチェックして Status を返す
  //  DBインデックス定義(onupgradeneeded)を行うのはここだけ
  //===========================================
  initDB({ debug = false } = {}) {

    const debug_pref = 'IndexedDBClass[' + this.dbObj.name + ']: initDB: '
    if (debug) console.log(debug_pref)

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

        //■ Open Request: 成功 (既存の DB name/version が同じ)
        request.onsuccess = (event) => {     //event.target.result;
          if (debug) console.log(debug_pref, 'onsuccess')

          this.status = idbStatus.OK; //DB Class 成功、Add/Upd/Delが使用可能
          //resolve(idbStatus.OK);
          resolve({ status: idbStatus.OK, result: 0 });

          const db = request.result
          db.close();
        }

        //■ Open Request: 成功 (既存の DB name or version 異なる)
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (debug) console.log(debug_pref, 'onupgradeneeded')

          //名前が同じ -> バージョン更新: 以前の DB 削除
          if (Array.from(db.objectStoreNames).includes(this.storeObj.name)) {
            db.deleteObjectStore(this.storeObj.name);
            if (debug) console.log(debug_pref, '旧DB削除')
          }

          //■ 新規作成
          const objectStore = db.createObjectStore(this.storeObj.name, this.storeObj.storeOptions);

          //■ Set index(もしあれば)
          if (this.storeObj.indeces) {
            if (debug) console.log(debug_pref, 'Indeces再構成')
            for (const idx of this.storeObj.indeces) {
              if (idx.idxName && idx.idxName)
                objectStore.createIndex(idx.idxName, idx.idxName, { unique: idx.unique || false });
            }
          }
          this.status = idbStatus.OK; //DB Class 成功、Add/Upd/Delが使用可能
          if (debug) console.log(debug_pref, '新DB作成')

          resolve({ status: idbStatus.NEW, result: 0 });
          //resolve(idbStatus.NEW);

          // この後に request.onsuccess が再度呼ばれるが、resolve は再度返らない。
        }

        //■ Open Request: エラー
        request.onerror = (e) => { throw Error(e.message) }

      } catch (e) {
        console.error(debug_pref, 'Error ', e.message);
        resolve({ status: idbStatus.ERR, result: 0 });
        //resolve(idbStatus.ERR);
      }
    });
  }

  checkParam({ type, data, key, debug = false, debug_pref = "" }) {
    try {
      switch (type) {
        case idbTYPE.Add:
          if (!data) return Error('no data')
          break;
        case idbTYPE.Update:
          if (!data) throw Error('no data')
          if (!key) throw Error('no key')
          break;
        case idbTYPE.Delete:
          if (!key) throw Error('no key')
          break;
        case idbTYPE.GetOne:
          if (!key) throw Error('no key')
          break;
        case idbTYPE.Clear:
        case idbTYPE.GetAll:
          break;
        default:
          throw Error('no Type')
      }
      return true
    } catch (e) {
      console.error(debug_pref, "checkParam Error ", e.message);
      return false;
    }
  }

  //==============================
  // 追加(put) 複数 (戻り値: Boolean; 最終保存終了後)
  //
  //  objStore.addAll(data); //Chrome OK, Firefox NG(後日変更)
  //==============================
  exec({ type, data, key, debug = false }) {  //data=[{'KEY':VALUE,'TTL1':VALUE,...},{'KEY':VALUE,...}]
    let debug_pref = 'IndexedDBClass[' + this.dbObj.name + ']: ' + type;

    return new Promise((resolve, reject) => {
      try {
        if (this.status === idbStatus.ERR) throw Error('DB is not Ready')
        if (!this.checkParam({ type, data, key, debug, debug_pref })) throw Error('Check Failed')
        if (debug) console.log(debug_pref, 'Started')

        const request = window.indexedDB.open(this.dbObj.name, this.dbObj.version);

        //■ Open Request: 成功
        request.onsuccess = (event) => {
          if (debug) console.log(debug_pref, 'DB opened')

          const db = event.target.result;
          const transaction = db.transaction(this.storeObj.name, "readwrite");
          const objStore = transaction.objectStore(this.storeObj.name);

          let numSucess = 0;
          let storeReq = null;

          //======================
          //  ■ [挿入(複数)]
          //======================
          if (type === idbTYPE.Add && Array.isArray(data)) {
            for (const n of [...data]) {       //add では Error が表示されない
              storeReq = objStore.put(n);    //PUT!!!
              numSucess++;
            }
            resolve({ status: idbStatus.OK, result: numSucess });
          } else
            //======================
            //  ■ [更新(単数)]
            //======================
            if (type === idbTYPE.Update) {
              storeReq = objStore.get(key);  //Key 存在の確認
              storeReq.onsuccess = (e) => {
                if (debug) console.log(debug_pref, '単数 DATA 更新: ', e.target.result)
                if (!e.target.result || e.target.result === 0) {
                  reject({ status: idbStatus.NOREC2UPD, result: key });
                } else {
                  //console.log('Update', 'OK')
                  let storeReqPut = objStore.put(data);
                  storeReqPut.onsuccess = (e) => {
                    resolve({ status: idbStatus.OK, result: e.target.result });
                  }
                  storeReqPut.onerror = (e) => {
                    reject({ status: idbStatus.NOREC2UPD, result: key });
                  }
                }
              }
              storeReq.onerror = (e) => { throw Error(e.message); }
            }
            //======================
            // ■ [挿入(単数)], [削除(単数/全体)], [取得(単数/全体)]
            //======================
            else {
              switch (type) {
                case idbTYPE.Add:
                  storeReq = objStore.put(data); break; //■ 単数 DATA 挿入
                case idbTYPE.Delete:
                  storeReq = objStore.delete(key); break; //■ 単数 DATA 削除
                case idbTYPE.Clear:
                  storeReq = objStore.clear(); break;//■ DATA 全削除
                case idbTYPE.GetOne:
                  storeReq = objStore.get(key); break;//■ 単数 DATA 取得
                case idbTYPE.GetAll:
                  storeReq = objStore.getAll(key || null); break;//■ 全体 DATA 取得
                default:
              }
              storeReq.onsuccess = (e) => {
                resolve({ status: idbStatus.OK, result: e.target.result || 0 });
              }
              storeReq.onerror = (e) => {
                reject({ status: idbStatus.ERR, result: e.message });
              }
            }

          //■ Transaction: 成功
          transaction.oncomplete = () => {
            //if (debug) console.log(debug_pref, 'Transaction complete')
            const db = request.result
            db.close();
          }

          //■ Transaction: エラー
          transaction.onerror = (e) => {
            const db = request.result
            db.close();
            throw Error(e.message);
          }
        }

        //■ Open Request: エラー
        request.onerror = (e) => { throw Error(e.message) }

      } catch (e) {
        console.log(debug_pref, "Error ", e.message);
        reject({ status: idbStatus.ERR, result: e.message });
      }
    });
  }
}

export default IndexedDBClass;