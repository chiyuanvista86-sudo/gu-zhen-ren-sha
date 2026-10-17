export type CardKind='attack'|'dodge'|'heal'|'draw'|'duel'|'steal'|'dismantle'|'storm'|'arrows'|'wine'|'weapon'|'armor'|'mount';
export type GeneralId='fangyuan'|'baininbing'|'he Loulan'|'fengjiuge'|'taibai'|'fangzheng'|'yingwuxie'|'xingxiu';
const PORTRAITS:{id:GeneralId;name:string;color:string}[]=[
  {id:'fangyuan',name:'方源',color:'#779f8b'},{id:'baininbing',name:'白凝冰',color:'#83b6cd'},
  {id:'he Loulan',name:'黑楼兰',color:'#bd8a67'},{id:'taibai',name:'太白云生',color:'#a5b4a0'},
  {id:'fengjiuge',name:'凤九歌',color:'#c7ad70'},{id:'fangzheng',name:'古月方正',color:'#ba7070'},
  {id:'yingwuxie',name:'影无邪',color:'#ae90bd'},{id:'xingxiu',name:'星宿',color:'#8d9bc8'},
];
export const general=(id:GeneralId)=>PORTRAITS.find(p=>p.id===id)!;
