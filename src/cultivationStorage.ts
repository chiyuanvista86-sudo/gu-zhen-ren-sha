import { HEROES, getGu, getMove } from './cultivationData';
import type { CultGame } from './cultivationEngine';

const PREFIX='gu-zhen-ren-sha:cultivation:v2:';
export interface CultProfile { completed:number; wins:number; settled:string[] }
export function readCult<T>(key:string,fallback:T):T {
  try {const raw=localStorage.getItem(PREFIX+key);return raw===null?fallback:JSON.parse(raw) as T;}catch{return fallback;}
}
export function writeCult(key:string,value:unknown){
  try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true;}catch{return false;}
}
export function validCultSave(value:unknown):value is CultGame {
  if(!value||typeof value!=='object')return false;
  const g=value as CultGame;
  if(g.version!==2||typeof g.id!=='string'||!Number.isInteger(g.round)||g.round<1||g.round>26||![0,1].includes(g.actor)||![null,0,1,'draw'].includes(g.winner))return false;
  if(!Array.isArray(g.logs)||!Array.isArray(g.players)||g.players.length!==2)return false;
  return g.players.every(p=>HEROES.some(h=>h.id===p.hero)&&[p.hp,p.rank,p.yuan,p.essence,p.ap,p.shield,p.ward,p.trials].every(Number.isFinite)
    &&p.rank>=1&&p.rank<=6&&p.hp>=0&&p.hp<=30&&p.yuan>=0&&p.yuan<=12&&p.essence>=0&&p.essence<=6&&p.ap>=0&&p.ap<=3
    &&Array.isArray(p.slots)&&p.slots.length===4&&p.slots.every(s=>s===null||getGu(s.recipe)&&s.durability>0&&Number.isFinite(s.usedRound))
    &&Array.isArray(p.loadout)&&p.loadout.length===5&&p.loadout.every(id=>getGu(id)&&!getGu(id).owner)
    &&Array.isArray(p.moves)&&p.moves.length===2&&p.moves.every(id=>getMove(id)&&!getMove(id).owner)
    &&Array.isArray(p.learned)&&p.learned.every(id=>!!getMove(id))&&!!p.cooldowns&&typeof p.cooldowns==='object');
}
export function savedCultGame(){const value=readCult<unknown>('game',null);return validCultSave(value)?value:null;}
export function loadProfile():CultProfile {
  const p=readCult<CultProfile>('profile',{completed:0,wins:0,settled:[]});
  return p&&Number.isInteger(p.completed)&&p.completed>=0&&Number.isInteger(p.wins)&&p.wins>=0&&Array.isArray(p.settled)?p:{completed:0,wins:0,settled:[]};
}
export function settleProfile(p:CultProfile,g:CultGame):CultProfile {
  if(g.winner===null||p.settled.includes(g.id))return p;
  return {completed:p.completed+1,wins:p.wins+(g.winner===0?1:0),settled:[...p.settled,g.id]};
}
