// 引数: 'zhōng'
// 戻値: 1
export const getChineseAccentNum = (sound) => {

  if (!sound) {
    //console.log('getChineseAccentNum: Error')
    return 0;
  }
  if (sound.match(/[āīūēōǖ]/)) return 1
  else if (sound.match(/[áíúéóǘ]/)) return 2
  else if (sound.match(/[ǎǐǔěǒǚ]/)) return 3
  else if (sound.match(/[àìùèòǜ]/)) return 4
  else return 0
}

// 引数: 'zhōng'
// 戻値: sound: 'zhong'
export const removeChineseAccentSign = (sound) => {
  // if (sound.match(/[āīūēōǖ]/)) return 1
  // else if (sound.match(/[áíúéóǘ]/)) return 2
  // else if (sound.match(/[ǎǐǔěǒǚ]/)) return 3
  // else if (sound.match(/[àìùèòǜ]/)) return 4
  // else return 0
}