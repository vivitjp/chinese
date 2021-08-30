import React from 'react'
import style from './KanjiHTML.module.css'
import { getChineseAccentNum } from './chineseSoundFuncs'

//=======================================
//  
//=======================================
export const KanjiHTML = ({ item, dispType, colors }) => {

  //console.log(item)
  //{ 'I': n, 'WORD': '有',   'P': ['you'], 'isFound': true }   //'P'に注意(辞書内では'P')
  //{ 'I': n, 'WORD': '出来', 'P': ["chū","lái"], 'isFound': true }

  //発見されたもの以外
  if (!item.isFound) {
    return (
      <span key={item.I} className={style.kanji}>{item.WORD}</span>
    )
  }

  let chars = item.WORD.split('')

  return (
    <>
      <div className={style.jukugo} style={chars.length > 1 ? { borderBottom: "2px dotted #CCC" } : {}}>
        {
          chars.map((n, i) => { //1文字ずつ配列化
            //console.log('Chars', chars[i], item.PRON['P'][i])

            const idx = parseInt(item.I) + (i + 1)
            const obj = { item: { 'I': idx, 'WORD': chars[i], 'PRON': item.PRON['P'][i] || '' } }
            switch (dispType) {
              case 1: return KanjiHTMLUnitCore(colors, { ...obj, ...{ colored: false } });
              case 2: return KanjiHTMLUnitCore(colors, obj);
              case 3: return KanjiHTMLUnitCoreRuby(colors, obj);
              default: return null;
            }
          })
        }
      </div>
    </>
  )
}

//=======================================
//  原文 / 拼音 Ruby なし
//=======================================
const KanjiHTMLUnitCore = (colors, { item, colored = true }) => {
  const soundNum = getChineseAccentNum(item.PRON) || 0
  // console.log(item)

  return (
    <div key={item.I} className={style.kanji} lang="zh-Hans" translate="no"
      style={colored ? { color: colors[soundNum] } : { color: '#555' }}>
      {item.WORD}
    </div>
  )
}

//=======================================
//  拼音 Ruby 付き
//=======================================
const KanjiHTMLUnitCoreRuby = (colors, { item }) => {
  const soundNum = getChineseAccentNum(item.PRON || 0)
  //  console.log(item)

  return (
    <div key={item.I} className={style.kanji}>
      <ruby lang="zh-Hans" translate="no" className={style.kanjiChar} style={{ color: colors[soundNum] }}>
        {item.WORD}
        <rt className={style.kanjiSound}>{item.PRON}</rt>
      </ruby>
    </div>
  )
}