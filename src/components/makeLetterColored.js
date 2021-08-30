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

  buffer[i] = {    // Buffer の idx 番目の内容を置換え
    I: i,        // react map用のindex
    WORD: keyword,  // 字母
    PRON: found,    // 見つかった辞書のオブジェクト(上参照) 拡張可能
    isFound: true,     // 検索終了Boolean
    isDeletable: false,    // Delete Flag = false (有効な要素)
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
  sentence,    //文字列
  dict_main,   //メイン辞書  // 例: {"吖": {"P": ["ā"]}, "吖嗪": {"P": ["ā", "qín"]}, "阿": {"P": ["ē"]}, 
  dict_extra,  //優先辞書(固有名詞、文法的) // 例: {"安徽": {"P": ["ān", "huī"]}, "合肥": {"P": ["hé", "féi"]}
  idbClassJB,   //字母辞書(字母:["番号",["発音1","発音2"],"発音個数"])  // 例: {"乙": ["2", ["yǐ"], "1"]}
}) => {
  if (!sentence ||
    Object.keys(dict_main).length === 0 ||
    Object.keys(dict_extra).length === 0 ||
    !idbClassJB
  ) return []

  let buffer = sentence.split('').map((n, i) => {
    return {
      I: i,
      WORD: n,
      PRON: '',     //
      isFound: false,  //検索終了
      isDeletable: false,  //削除OK flag(熟語の一部)
    }
  })

  // 辞書検索
  for (let i = 0; i < sentence.length; i++) {

    //1. 文法優先
    if (['把'].includes(sentence.substr(i, 1))) continue

    // 辞書照会用の文字列配列取得して回す
    for (const keyword of getWordsArray(sentence, i)) {
      //2. 優先辞書
      let found = dict_extra[keyword];
      if (found) {
        searchDict({ buffer, found, keyword, i })
        i += keyword.length - 1
        break;
      }

      //3. 一般辞書
      found = dict_main[keyword];
      if (found) {
        searchDict({ buffer, found, keyword, i })
        i += keyword.length - 1  //i カウント修正
        break;
      }
    }
  }

  //[重要] 配列再整理: 空白(熟語発見による)削除
  buffer = buffer.filter(elem => !elem.isDeletable)  //'isDeletable'==true 以外を残す

  //4. 辞書にない字母(非熟語)には字母辞書から発音取得(複数ある時はindex[0]のもの取得)
  for (const i in buffer) {
    if (buffer[i].isFound || buffer[i].WORD.includes(['，', '。'])) continue;

    const found = await idbClassJB.getOne([buffer[i].WORD]);

    if (found && found[1] && found[1][0]) {
      buffer[i].PRON = { 'P': [found[1][0]] };  //辞書の形式に統一
      buffer[i].isFound = true;
    }
  }

  console.log(buffer);

  return buffer;
}

export default makeLetterColored
