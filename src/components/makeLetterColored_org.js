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


//JIBO: [ "你", ["nǐ"], "1" ],[ "好", ["hǎo","hào"], "2" ]
//TREE: [ "你争我夺", "你死我活", "你们", "你来我往", "你追我赶" ]
//DICT: {"娃娃": "wá wá", "娃娃亲": "wá wa qīn", "娃娃脸": "wá wá liǎn",}

const makeLetterColored = ({ sentence, dict, tree, jibo }) => {
  let arrColoredLetters = []
  // console.log(Object.keys(dict).length)
  // console.log(Object.keys(tree).length)
  // console.log(Object.keys(jibo).length)

  const JIBO_PY = 1
  const JIBO_NUM = 2

  let arrIdx = 0;
  for (let i = 0; i < sentence.length; i++) {
    const kanjiChar = sentence[i];
    const jiboHit = jibo[kanjiChar];

    if (!jiboHit) { //[1] 字母に記載なし
      arrColoredLetters.push({
        idx: arrIdx++, kanjiChar: kanjiChar, sound: '',
      })
    }
    else { //[2] 字母に記載あり、発音１つのみ
      const jiboMainSound = jiboHit[JIBO_PY][0] || ''
      //if (!jiboMainSound) continue

      if (jiboHit[JIBO_NUM] === '1' || i === sentence.length - 1) {
        arrColoredLetters.push({
          idx: arrIdx++, kanjiChar: kanjiChar, sound: jiboMainSound,
        })
      } else {
        let hit = false
        for (const n of getWordsArray(sentence, i)) {
          //[3] 熟語Dictに記載あり [ "好人好事", "好几", "好说", , … ]
          if (tree[kanjiChar].includes(n)) {

            arrColoredLetters.push({
              idx: arrIdx++, kanjiChar: n, sound: dict[n],
            })
            i += n.length - 1  //i カウント修正
            hit = true
            break
          }
        }
        if (!hit) {
          //[4] 熟語Dictに記載なし、字母の複数の発音の中から最初の発音を返す
          arrColoredLetters.push({
            idx: arrIdx++, kanjiChar: kanjiChar, sound: jiboMainSound,
          })
        }
      }
    }
  }
  // entry: {idx: Number, KanjiChar: String, sound: String, fourIdx:Number }
  return arrColoredLetters;
}

export default makeLetterColored

// Jibo Array(4) [ "你", "", "nǐ", "1" ]
// Dict undefined
// Tree Array(5) [ "你争我夺", "你死我活", "你们", "你来我往", "你追我赶" ]

// Jibo Array(4) [ "好", "", "hǎo/hào", "2" ]
// Dict undefined
// Tree Array(83) [ "好人好事", "好几", "好说", , … ]

// Jibo Array(4) [ "吗", "嗎", "ma", "1" ]
// Dict undefined
// Tree Array [ "吗啡" ]

// Dict {"娃娃": "wá wá", "娃娃亲": "wá wa qīn", "娃娃脸": "wá wá liǎn",