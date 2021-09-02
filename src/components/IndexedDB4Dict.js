import { idbSTATUS } from './IndexedDBClass'
import { getJson } from '../api/getJson';

const IndexedDB4Dict = async ({ idbClass }) => {
  try {
    //console.log(idbClass.file)

    const res = await idbClass.getStatus();
    //console.log('IndexedDB4Dict getStatus: ', res)

    switch (res) {
      case idbSTATUS.OK: //(1)辞書存在 console.log('字母辞書存在')
        console.log(idbClass.file, 'Already Set');
        return true
      case idbSTATUS.NEW: //(2)新規作成
        const res = await getJson(idbClass.file)
        if (!res) throw Error('File OPEN Failed')
        // const startTime = Date.now(); // 開始時間
        // console.log('addAll Start', startTime)

        const resAdd = await idbClass.addAll(res);   //全登録

        // console.log('addAll Result', resAdd)
        // const endTime = Date.now();   // 終了時間
        // console.log(idbClass.file, 'rebuilt Done', (endTime - startTime) / 1000);
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