import React from 'react'
import './KanjiHTML.css'
import { getChineseAccentNum } from './chineseSoundFuncs'

const colors = ['#AAA', '#444', 'RoyalBlue', 'ForestGreen', 'Crimson'];

//=======================================
//  
//=======================================
export const KanjiHTML = ({ item, withPY }) => {

  console.log(item)

  if (item.kanjiChar.length > 1) {
    let sounds = item.sound.split(' ')
    let chars = item.kanjiChar.split('')

    return (
      <span style={{ borderBottom: '2px solid #CCC' }}>
        {
          chars.map((n, i) => { //1文字ずつ配列化
            //console.log('Chars', chars[i], sounds[i])
            const obj = { item: { idx: 'm' + i, kanjiChar: chars[i], sound: sounds[i] } }
            if (withPY) return KanjiHTMLUnitCoreRuby(obj)
            else return KanjiHTMLUnitCore(obj)
          })
        }
      </span>
    )
  } else {
    return (
      withPY ? KanjiHTMLUnitCoreRuby({ item }) : KanjiHTMLUnitCore({ item })
    )
  }
}

const KanjiHTMLUnitCore = ({ item }) => {
  const soundNum = getChineseAccentNum(item.sound)
  //console.log(item)

  return (
    <span key={item.idx} className="kanji" style={{ color: colors[soundNum] }}>
      {item.kanjiChar}
    </span>
  )
}

//=======================================
//  
//=======================================
const KanjiHTMLUnitCoreRuby = ({ item }) => {
  const soundNum = getChineseAccentNum(item.sound)

  return (
    <span key={item.idx} className="kanji">
      <ruby style={{ color: colors[soundNum] }}>
        <ruby className="kanjiChar">
          {item.kanjiChar}
        </ruby>
        <rp>（</rp><rt className="kanjiSound">{item.sound}</rt><rp>）</rp>
      </ruby>
    </span>
  )
}