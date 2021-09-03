import { z2h_zh, z2h_en } from '../lib/z2h_zh'

// ===========================================================
// ローカル関数
// 文章を走査、idx 番目の文字から、字数 max を切り取り配列に
// 文末まで、または記号やホワイトスペース、数字などは文字の切れ目と判断して中断
// ===========================================================
const getWordsArray = (
  sentence,    // 元文字列
  idx,         // 開始index
  max = 4      // 文字数
) => {
  if (idx === undefined || !sentence) return [];
  if (idx < 0 || idx >= sentence.length - 1) return [];

  const rebreakingChars = "[。，\s0-9a-zA-Z.,()[\]{}<>《》（）]";  //熟語の切れ目とする記号
  const re = RegExp(rebreakingChars);

  const MAX = Math.min(max, sentence.length - idx);
  let charArr = [];

  for (let i = 1; i < MAX; i++) {
    const nextChar = sentence.substr(idx + i, 1)
    //console.log('nextChar', nextChar)
    if (re.test(nextChar)) break
    charArr.push(sentence.substr(idx, i + 1));
  }
  if (charArr.length) charArr.sort((a, b) => a.length < b.length)
  return charArr;
};

// ===========================================================
// ローカル関数
// Buffer 要素置換関数
// 見つかった熟語を登録して、その文字数分の要素に delete flag を設定
// ===========================================================
const searchDict = ({
  buffer,    //入力文字列バッファ配列(1文字ずつ)
  found,     //オブジェクト: {"P": ["hé", "féi"]}
  keyword,   //字母
  i          //Buffer の index
}) => {
  //console.log('keyword/found', keyword, found);

  buffer[i] = {          // Buffer の idx 番目の内容を置換え
    idx: i,              // react map用のindex
    word: keyword,       //
    entry: found,        // 見つかった辞書のオブジェクト(上参照) 拡張可能
    isFound: true,       // 検索終了Boolean
    isDeletable: false,  // Delete Flag = false (有効な要素)
  }

  // 熟語と判明した部分(idxの次から文字数)に ['isDeletable'] Delete flag = true
  for (let k = 1; k < keyword.length; k++) {
    buffer[i + k].isDeletable = true;
  }
}

// ===========================================================
// export 関数
// 
//
// ===========================================================
const makeLetterColored = async ({
  sentence,  //文字列
  idbJibo,   //字母: [{"W": "一", "S": ["yī"]}, {"W": "乙", "S": ["yǐ"]}]
  idbMain,   //Main: 
  idbPron,   //固有: [{"W": "安徽", "S": ["ān", "huī"]}]
  idbExtra,  //優先: [{"W": "行不行", "S": ["xíngbùxíng"]}]
}) => {
  if (!sentence || !idbMain || !idbExtra || !idbJibo || !idbPron) return []

  const altSentence = z2h_zh(z2h_en(sentence))

  //入力文字列から配列作成(この配列を走査、更新して戻す)
  let buffer = altSentence.split('').map((n, i) => {
    return {
      idx: i,              // Index
      word: n,             // 単語
      entry: { "W": n, "S": [] },     // 辞書のエントリそのままコピー(後日の拡張のために)
      isFound: false,      //検索終了
      isDeletable: false,  //削除OK flag(熟語の一部)
    }
  })

  // 辞書検索
  for (let i = 0; i < sentence.length; i++) {

    // 辞書照会用の文字列配列取得して回す
    for (const keyword of getWordsArray(sentence, i)) {
      //console.log('辞書検索', keyword)

      //4. 優先辞書(Extra)
      const exFound = await idbExtra.getOne(keyword);
      if (exFound) {
        //console.log('発見(優先)', JSON.stringify(exFound))
        searchDict({ buffer, found: exFound, keyword, i })
        i += keyword.length - 1
        break;
      }

      //3. 固有名詞(Pronoun)
      const proFound = await idbPron.getOne(keyword);
      if (proFound) {
        //console.log('発見(固有)', JSON.stringify(proFound))
        searchDict({ buffer, found: proFound, keyword, i })
        i += keyword.length - 1
        break;
      }

      //2. 一般辞書
      const mainFound = await idbMain.getOne(keyword);
      if (mainFound) {
        //console.log('発見(一般)', JSON.stringify(mainFound))
        searchDict({ buffer, found: mainFound, keyword, i })
        i += keyword.length - 1  //i カウント修正
        break;
      }
    }
  }

  //[重要] 配列再整理: 空白(熟語発見による)削除
  buffer = buffer.filter(elem => !elem.isDeletable)  //'isDeletable'==true 以外を残す

  //1. 辞書にない字母(非熟語)には字母辞書から発音取得(複数ある時は[0]取得)
  for (const i in buffer) {
    if (buffer[i].isFound || buffer[i].word.includes(['，', '。'])) continue;

    const found = await idbJibo.getOne(buffer[i].word);
    //console.log('found', buffer[i].word, found)

    if (found && found["S"][0]) {   //'S':発音配列
      buffer[i].entry = { 'W': buffer[i].word, 'S': found["S"] };  //[0]取得->辞書形式統一
      buffer[i].isFound = true;
    }
  }
  console.log(buffer);
  return buffer;
}

export default makeLetterColored

// 0: Object { idx: 0, word: "当然", isFound: true, … }
// ​​entry: Object { W: "当然", S: (2) […] }
//    ​​S: Array [ "dānɡ", "rán" ]
//    ​​W: "当然"
// ​​idx: 0
// ​​isDeletable: false
// ​​isFound: true
// ​​word: "当然"