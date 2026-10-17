import { HEROES, getGu, getHero, getMove } from './cultivationData';
import { allCards } from './cultivationEngine';
import type { CultGame } from './cultivationEngine';
import { HANDS, getHand, memorable } from './handData';
const PREFIX='gu-zhen-ren-sha:cultivation:v3:';
const OLD_PREFIX='gu-zhen-ren-sha:cultivation:v2:';
export interface CultProfile {completed:number;wins:number;settled:string[]}
export function readCult<T>(key:string,fallback:T):T {try{const raw=localStorage.getItem(PREFIX+key);return raw===null?fallback:JSON.parse(raw) as T;}catch{return fallback;}}
export function writeCult(key:string,value:unknown){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true;}catch{return false;}}
const integer=(x:unknown,min:number,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&(x as number)>=min&&(x as number)<=max;
export function validCultSave(value:unknown):value is CultGame {
  try{
    if(!value||typeof value!=='object')return false;const g=value as CultGame;
    if(g.version!==3||typeof g.id!=='string'||!integer(g.round,1,26)||!integer(g.random,0,4294967295)||!Number.isSafeInteger(g.seed)||![0,1].includes(g.actor)||![0,1].includes(g.initiative)||![null,0,1,'draw'].includes(g.winner))return false;
    if(!Array.isArray(g.logs)||!integer(g.logId,0)||!g.logs.every(l=>integer(l.id,1)&&typeof l.text==='string'&&(l.privateTo===undefined||[0,1].includes(l.privateTo))))return false;
    if(!Array.isArray(g.players)||g.players.length!==2||g.players[0].hero===g.players[1].hero)return false;
    if(!g.players.every(p=>{
      if(!HEROES.some(h=>h.id===p.hero)||![5,6].includes(p.rank)||!integer(p.stage,0,3)||!integer(p.hp,0,30)||!integer(p.lifespan,0,12)||!integer(p.qi,0,p.rank===6?7:4+p.stage)||!integer(p.thought,0,2)||!integer(p.yuan,0,10)||!integer(p.essence,0,6)||!integer(p.ap,0,3)||!integer(p.shield,0,15)||!integer(p.ward,0,10)||!integer(p.force,0,3)||!integer(p.chill,0,2)||!integer(p.trials,0))return false;
      if(![p.cultivatedRound,p.refinedRound,p.salvagedRound,p.damagedRound,p.contactRound,p.repairedRound,p.incomeRound,p.meditatedRound,p.attackedRound,p.restedRound,p.immortalRound,p.blockedRound].every(x=>integer(x,0)))return false;
      if(![p.ascensionDue,p.nextTribulation].every(x=>x===null||integer(x,1))||!(p.blockedSlot===null||integer(p.blockedSlot,0,3))||typeof p.reducedIncome!=='boolean')return false;
      if(!Array.isArray(p.loadout)||p.loadout.length!==5||new Set(p.loadout).size!==5||!p.loadout.every(id=>getGu(id)&&!getGu(id).owner)||!Array.isArray(p.moves)||p.moves.length!==2||new Set(p.moves).size!==2||!p.moves.every(id=>getMove(id)&&!getMove(id).owner))return false;
      const allowed=[...getHero(p.hero).exclusive,...p.loadout];
      if(!Array.isArray(p.slots)||p.slots.length!==4||!p.slots.every(s=>s===null||allowed.includes(s.recipe)&&integer(s.durability,1,getGu(s.recipe).durability+(s.upgraded?1:0))&&typeof s.upgraded==='boolean'&&integer(s.usedRound,0)))return false;
      const slotted=p.slots.filter(Boolean).map(s=>s!.recipe);if(new Set(slotted).size!==slotted.length)return false;
      if(!Array.isArray(p.learned)||!p.learned.every(id=>[getHero(p.hero).move,...p.moves].includes(id))||!p.cooldowns||typeof p.cooldowns!=='object'||!Object.values(p.cooldowns).every(x=>integer(x,0)))return false;
      if(!Array.isArray(p.hand)||!Array.isArray(p.usedHand)||new Set(p.usedHand).size!==p.usedHand.length||!p.usedHand.every(id=>!!getHand(id)))return false;
      if(p.memory!==null&&(!p.memory||p.memory.card.kind!=='memory'||!getHand(p.memory.kind)||!memorable(p.memory.kind)))return false;
      if(p.order!==null&&(!p.order||!integer(p.order.expires,g.round)))return false;return true;
    }))return false;
    if(![g.deck,g.discard,g.exiled,g.market].every(Array.isArray)||g.market.length>5||g.exiled.some(c=>!['life','relic'].includes(c.kind)))return false;
    if(g.pending!==null){const q=g.pending;if(!q||![0,1].includes(q.owner)||!['book','window','soul-defense','soul-mark','discard'].includes(q.kind))return false;
      if(q.kind==='discard'){if(!integer(q.count,1)||q.count!==g.players[q.owner].hand.length-6||g.players.some(p=>p.ap>0))return false;}
      else if(q.card.kind!==({book:'book',window:'window','soul-defense':'soul','soul-mark':'soul'} as const)[q.kind])return false;
      if(q.kind==='book'&&(!Array.isArray(q.cards)||q.cards.length<1||q.cards.length>4))return false;
      if(q.kind==='window'&&(!Array.isArray(q.options)||!q.options.length||!q.options.every(id=>!!getHand(id))))return false;
      if(q.kind==='soul-mark'&&(!Array.isArray(q.uids)||q.uids.length<1||q.uids.length>2||!q.uids.every(id=>g.players[1-q.owner].hand.some(c=>c.uid===id))||typeof q.resisted!=='boolean'))return false;
      if(g.actor!==(q.kind==='soul-defense'?1-q.owner:q.owner))return false;
    }
    const cards=allCards(g),ids=new Set(cards.map(c=>c.uid));
    return cards.length===64&&ids.size===64&&cards.every(c=>c&&HANDS.some(h=>h.id===c.kind)&&Array.from({length:8},(_,i)=>c.kind+'-'+i).includes(c.uid)&&(c.disturbedUntil===undefined||integer(c.disturbedUntil,g.round)));
  }catch{return false;}
}
export function savedCultGame(){const value=readCult<unknown>('game',null);return validCultSave(value)?value:null;}
function validProfile(p:CultProfile){return p&&integer(p.completed,0)&&integer(p.wins,0,p.completed)&&Array.isArray(p.settled)&&p.settled.every(x=>typeof x==='string')&&new Set(p.settled).size===p.settled.length;}
export function loadProfile():CultProfile {
  const current=readCult<CultProfile|null>('profile',null);if(current&&validProfile(current))return current;
  try{const old=JSON.parse(localStorage.getItem(OLD_PREFIX+'profile')??'null') as CultProfile;if(old&&validProfile(old))return old;}catch{/* start a clean profile when old data is invalid */}
  return {completed:0,wins:0,settled:[]};
}
export function settleProfile(p:CultProfile,g:CultGame):CultProfile {return g.winner===null||p.settled.includes(g.id)?p:{completed:p.completed+1,wins:p.wins+(g.winner===0?1:0),settled:[...p.settled,g.id]};}
