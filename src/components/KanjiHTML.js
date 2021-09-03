import React from 'react'
import style from './KanjiHTML.module.css'
import { getChineseAccentNum } from './chineseSoundFuncs'

//=======================================
//  
//=======================================
export const KanjiHTML = ({ item, withPY, colors, withColor }) => {
  //console.log(JSON.stringify(item))

  let chars = item.word.split('');
  let borderColor = chars.length > 1 ? "#CCC" : "#FFF";

  return (
    <>
      <div className={style.jukugo} style={{ borderBottom: "2px dotted " + borderColor }}>
        {
          chars.map((n, i) => {
            const clr = colors[(withColor ? getChineseAccentNum(item.entry['S'][i]) : 5)]

            return <div key={i} className={style.kanjiSet}>
              <div className={style.kanjiSound}>{withPY && item.entry['S'][i]}</div>
              <div className={style.kanjiChar}
                lang="zh-Hans"
                translate="no"
                style={{ color: clr }}>
                {n}
              </div>
            </div>
          })
        }
      </div>
    </>
  )
}
