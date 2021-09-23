// 引数: 'zhōng'
// 戻値: 1
export const getChineseAccentNum = (sound) => {
  try {
    if (!sound) return 0;
    //   console.log('getChineseAccentNum', sound)
    //   throw Error('sound')
    // }

    if (sound.match(/[āīūēōǖ]/)) return 1
    else if (sound.match(/[áíúéóǘ]/)) return 2
    else if (sound.match(/[ǎǐǔěǒǚ]/)) return 3
    else if (sound.match(/[àìùèòǜ]/)) return 4
    else return 0
  } catch (e) {
    console.error('getChineseAccentNum', e.message)
    return 0
  }
}

// 引数: 'zhōng'
// 戻値: sound: 'zhong'
export const removeChineseAccentSign = (sound) => {
  try {

  } catch (e) {
    console.error('removeChineseAccentSign', e.message)
    //return ????
  }


  // if (sound.match(/[āīūēōǖ]/)) return 1
  // else if (sound.match(/[áíúéóǘ]/)) return 2
  // else if (sound.match(/[ǎǐǔěǒǚ]/)) return 3
  // else if (sound.match(/[àìùèòǜ]/)) return 4
  // else return 0
}