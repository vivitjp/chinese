import { idbSTATUS } from './IndexedDBClass'
import { getJson } from '../api/getJson';

const IndexedDB4Dict = async ({ idbClass }) => {
  try {
    //console.log(idbClass.file)

    const res = await idbClass.getStatus();
    //console.log('IndexedDB4Dict getStatus: ', res)

    switch (res) {
      case idbSTATUS.OK: //(1)辞書存在 console.log('辞書存在')
        console.log(idbClass.dbObj.name, 'Already Set');
        return true
      case idbSTATUS.NEW: //(2)新規作成
        const res2 = await getJson(idbClass.file)
        if (!res2) throw Error('File OPEN Failed')
        //console.log('idbClass.file: SIZE: ', Object.keys(res2).length)
        await idbClass.addAll(res2);   //全登録
        return true
      default:
        throw Error('Status Error')
    }

  } catch (err) {
    console.error('IndexedDB4Dict', err.message)
    return false
  }
}

export default IndexedDB4Dict