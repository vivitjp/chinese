// const _A_ = "[aāáǎà]"
// const _I_ = "[iīíǐì]"
// const _U_ = "[uūúǔù]"
// const _E_ = "[eēéěè]"
// const _O_ = "[oōóǒò]"
// const _Ü_ = "[üǖǘǚǜ]"

const _SD1_ = /[āīūēōǖ]/i
const _SD2_ = /[áíúéóǘ]/i
const _SD3_ = /[ǎǐǔěǒǚ]/i
const _SD4_ = /[àìùèòǜ]/i

export const shengdiaoNum = (pinyinWithAccent) => {
  if (_SD1_.test(pinyinWithAccent)) return 1
  if (_SD2_.test(pinyinWithAccent)) return 2
  if (_SD3_.test(pinyinWithAccent)) return 3
  if (_SD4_.test(pinyinWithAccent)) return 4
  return 0
}

// let sample = [
//   ['児童', 'értóng'],
//   ['花儿', 'huār'],
//   ['歌儿', 'gēr'],
//   ['儿子', 'érzi'],
//   ['一会儿', 'yíhuìr'],
//   ['瓜子儿', 'guāzĭr'],
//   ['事儿', 'shìr'],
//   ['慢慢儿', 'mànr'],
//   ['空儿', 'kòngr'],
// ]

// for (let i of sample) {
//   let a = shengdiaoNum(i[1])
//   console.log(i[0], i[1], a);
// }