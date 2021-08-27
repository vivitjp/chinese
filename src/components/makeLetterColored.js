// 字母の発音が2つ以上の時は熟語のヒットを検索する
// そのために、2~4(max default or 文末)文字の配列を取得
// 記号やホワイトスペース、数字などは文字の切れ目と判断して中断
const getWordsArray = (sentence, idx, max = 4) => {
  if (idx === undefined || !sentence) return [];
  if (idx < 0 || idx >= sentence.length - 1) return [];

  const MAX = Math.min(max, sentence.length - idx);
  let charArr = [];

  for (let i = 1; i < MAX; i++) {
    const nextChar = sentence.substr(idx + i, 1)
    //console.log('nextChar', nextChar)
    if (nextChar.match(/[。，\s0-9a-zA-Z.,()[\]{}<>《》（）]/)) break
    charArr.push(sentence.substr(idx, i + 1));
  }
  if (charArr.length) charArr.sort((a, b) => a.length < b.length)
  return charArr;
};

const searchDict = ({ buffer, found, keyword, i }) => {
  //console.log('keyword/found', keyword, found);

  buffer[i] = { 'I': i, 'C': keyword, 'P': found, 'X': true }

  for (let k = 1; k < keyword.length; k++) {
    buffer[i + k]['C'] = '';
    buffer[i + k]['X'] = true;
  }
}

const makeLetterColored = ({ sentence, dict, extra, jibo }) => {
  if (!sentence || Object.keys(dict).length === 0 || Object.keys(extra).length === 0) return []

  let buffer = sentence.split('').map((n, i) => { return { 'I': i, 'C': n, 'P': '', 'X': false } })

  for (let i = 0; i < sentence.length; i++) {

    //1. 文法優先
    if (['把'].includes(sentence.substr(i, 1))) continue

    for (const keyword of getWordsArray(sentence, i)) {
      //2. 固有名詞辞書
      //{"安徽": {"P": ["ān", "huī"]}, "合肥": {"P": ["hé", "féi"]}
      let found = extra[keyword];
      if (found) {
        searchDict({ buffer, found, keyword, i })
        i += keyword.length - 1
        break;
      }

      //3. 一般辞書
      //{"吖": {"P": ["ā"]}, "吖嗪": {"P": ["ā", "qín"]}, "阿": {"P": ["ē"]}, 
      found = dict[keyword];
      if (found) {
        searchDict({ buffer, found, keyword, i })
        i += keyword.length - 1  //i カウント修正
        break;
      }
    }
  }

  buffer = buffer.filter(elem => elem['C'])

  for (const i in buffer) {
    if (buffer[i]['X'] || buffer[i]['C'].includes(['，', '。'])) continue;

    //{"一": ["1", ["yī"], "1"], "乙": ["2", ["yǐ"], "1"], 
    const found = jibo[buffer[i]['C']];
    if (found && found[1] && found[1][0]) {
      buffer[i]['P'] = [found[1][0]];
      buffer[i]['X'] = true;
    }
  }

  //console.log(buffer);

  return buffer;
}

export default makeLetterColored
