import React from 'react'
import style from './KanjiHTML.module.css'
import { getChineseAccentNum } from './chineseSoundFuncs'

const colors = ['#AAA', '#666', 'DodgerBlue', 'SeaGreen', 'Tomato'];

//=======================================
//  
//=======================================
export const KanjiHTML = ({ item, withPY }) => {

  //console.log(item)
  //{ 'I': n, 'C': '有',   'P': ['you'], 'X': true }
  //{ 'I': n, 'C': '出来', 'P': ["chū","lái"], 'X': true }

  //文字以外
  if (!item.X) {
    return (
      <span key={item.I} className={style.kanji}>
        {item.C}
      </span>
    )
  }

  //単語
  if (item['P'].length === 1) {
    return (
      withPY ? KanjiHTMLUnitCoreRuby({ item }) : KanjiHTMLUnitCore({ item })
    )
  }
  //熟語
  else {
    let chars = item.C.split('')
    let sounds = item.P

    return (
      <div className={style.jukugo}>
        {
          chars.map((n, i) => { //1文字ずつ配列化
            //console.log('Chars', chars[i], sounds['P'][i])
            const idx = parseInt(item.I) + (i + 1)
            const obj = { item: { 'I': idx, 'C': chars[i], 'P': [sounds.P[i]] } }
            if (withPY) return KanjiHTMLUnitCoreRuby(obj)
            else return KanjiHTMLUnitCore(obj)
          })
        }
      </div>
    )
  }
}

//=======================================
//  Ruby なし
//=======================================
const KanjiHTMLUnitCore = ({ item }) => {
  const soundNum = getChineseAccentNum(...item.P) || 0
  // console.log(item)
  // { 'I': n, 'C': '有',   'P': ['you'], 'X': true }
  // { 'I': n, 'C': '出来', 'P': ["chū","lái"], 'X': true }

  return (
    <div key={item.I} className={style.kanji} style={{ color: colors[soundNum] }}>
      {item.C}
    </div>
  )
}

//=======================================
//  Ruby 付き
//=======================================
const KanjiHTMLUnitCoreRuby = ({ item }) => {
  const soundNum = getChineseAccentNum(...item.P || 0)
  //  console.log(item)

  return (
    <div key={item.I} className={style.kanji}>
      <ruby className={style.kanjiChar} style={{ color: colors[soundNum] }}>
        {item.C}
        <rt className={style.kanjiSound}>{item.P}</rt>
      </ruby>
    </div>
  )
}