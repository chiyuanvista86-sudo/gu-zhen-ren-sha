import { DEFAULT_GU, DEFAULT_MOVES, HEROES, RULES, TRIBULATIONS, getGu, getHero, getMove } from './cultivationData';
import type { HeroId, MoveRecipe } from './cultivationData';

export interface GuInstance { recipe: string; durability: number; upgraded: boolean; usedRound: number }
export interface CultPlayer {
  hero: HeroId; hp: number; rank: number; yuan: number; essence: number; ap: number;
  shield: number; ward: number; force: number; chill: number;
  slots: (GuInstance | null)[]; loadout: string[]; moves: string[];
  learned: string[]; cooldowns: Record<string, number>;
  ascensionDue: number | null; nextTribulation: number | null; trials: number;
  blockedSlot: number | null; blockedRound: number; reducedIncome: boolean;
  cultivatedRound: number; refinedRound: number; salvagedRound: number;
  damagedRound: number; repairedRound: number; incomeRound: number; meditatedRound: number;
}
export interface CultGame {
  version: 2; id: string; seed: number; round: number; actor: number; initiative: number;
  players: [CultPlayer, CultPlayer]; winner: number | 'draw' | null;
  logs: {id:number; text:string}[]; logId: number;
}
export type CultAction =
  | {type:'refine'; recipe:string; slot:number}
  | {type:'activate'; slot:number; target?:number}
  | {type:'cultivate'} | {type:'ascend'} | {type:'meditate'} | {type:'pass'}
  | {type:'learn'; move:string} | {type:'move'; move:string; target?:number}
  | {type:'repair'; slot:number} | {type:'upgrade'; slot:number} | {type:'salvage'; slot:number};

export function resource(p:CultPlayer) { return p.rank===6 ? p.essence : p.yuan; }
export function currency(p:CultPlayer) { return p.rank===6 ? '仙缘' : '元石'; }
export function scaledCost(p:CultPlayer, cost:number) { return p.rank===6 ? Math.ceil(cost/2) : cost; }
export function guMaximum(g:GuInstance) { return getGu(g.recipe).durability + (g.upgraded ? 1:0); }
export function recipes(p:CultPlayer) { return [...getHero(p.hero).exclusive,...p.loadout]; }
export function moveRecipes(p:CultPlayer) { return [getHero(p.hero).move,...p.moves]; }
export function refinementCost(game:CultGame,p:CultPlayer,id:string) {
  return Math.max(1,scaledCost(p,getGu(id).cost)-(p.hero==='fangyuan' && p.refinedRound!==game.round ? 1:0));
}
export function activationCost(p:CultPlayer,id:string) { return scaledCost(p,getGu(id).activation)+(p.chill>=2?1:0); }
function addLog(g:CultGame,text:string) { g.logs.push({id:++g.logId,text}); if(g.logs.length>180)g.logs.shift(); }
function spend(p:CultPlayer,n:number) { if(p.rank===6)p.essence-=n;else p.yuan-=n; }
function gain(p:CultPlayer,n:number) { if(p.rank===6)p.essence=Math.min(RULES.immortalCap,p.essence+n);else p.yuan=Math.min(RULES.yuanCap,p.yuan+n); }
function title(p:CultPlayer) {return getHero(p.hero).name;}

export function createCultGame(hero:HeroId='fangyuan',loadout:string[]=DEFAULT_GU,moves:string[]=DEFAULT_MOVES,seed=Date.now(),enemy?:HeroId):CultGame {
  const legalGu=loadout.length===RULES.commonLoadout && new Set(loadout).size===loadout.length && loadout.every(id=>getGu(id)&&!getGu(id).owner);
  const legalMoves=moves.length===RULES.moveLoadout && new Set(moves).size===moves.length && moves.every(id=>getMove(id)&&!getMove(id).owner);
  if(!legalGu||!legalMoves||!getHero(hero))throw new Error('Invalid cultivation loadout');
  const opponent=enemy??HEROES.filter(h=>h.id!==hero)[Math.abs(seed)%3].id;
  function player(id:HeroId,gs:string[],ms:string[]):CultPlayer {
    return {hero:id,hp:RULES.life,rank:1,yuan:RULES.yuanIncome,essence:0,ap:RULES.actions,
      shield:0,ward:0,force:0,chill:0,slots:[{recipe:getHero(id).core,durability:4,upgraded:false,usedRound:0},null,null,null],
      loadout:[...gs],moves:[...ms],learned:[],cooldowns:{},ascensionDue:null,nextTribulation:null,trials:0,
      blockedSlot:null,blockedRound:0,reducedIncome:false,cultivatedRound:0,refinedRound:0,salvagedRound:0,
      damagedRound:0,repairedRound:0,incomeRound:0,meditatedRound:0};
  }
  const enemyGu=seed%2===0?['moon','armor','grass','repair','refinery']:['moon','shell','grass','stride','repair'];
  const game:CultGame={version:2,id:`cult-${seed}-${Math.random().toString(36).slice(2,8)}`,seed,round:1,
    actor:Math.abs(seed)%2,initiative:Math.abs(seed)%2,players:[player(hero,loadout,moves),player(opponent,enemyGu,['slash','ward'])],winner:null,logs:[],logId:0};
  addLog(game,`升仙对决开始：${title(game.players[0])} 对阵 ${title(game.players[1])}。双方一转、30生命、5元石，本命蛊就位。`);
  return game;
}

export function readySlot(g:CultGame,p:CultPlayer,index:number) {
  const gu=p.slots[index];
  return !!gu && gu.usedRound!==g.round && !(p.blockedRound===g.round&&p.blockedSlot===index);
}
export function components(g:CultGame,p:CultPlayer,m:MoveRecipe):number[]|null {
  function match(at:number,used:number[]):number[]|null {
    if(at===m.needs.length)return used;
    for(let i=0;i<p.slots.length;i++) {
      if(!used.includes(i)&&readySlot(g,p,i)&&getGu(p.slots[i]!.recipe).tags.includes(m.needs[at])) {
        const found=match(at+1,[...used,i]); if(found)return found;
      }
    }
    return null;
  }
  return match(0,[]);
}
export function actionError(g:CultGame,who:number,a:CultAction):string|null {
  if(g.winner!==null)return '对局已经结束';
  if(who!==g.actor)return '等待对手行动';
  const p=g.players[who],e=g.players[1-who];
  if(!p||p.ap<=0)return '本轮行动已用完';
  const canPay=(cost:number)=>resource(p)>=cost?null:`需要${cost}${currency(p)}`;
  const slot=('slot'in a&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<RULES.slots)?p.slots[a.slot]:null;
  if('slot'in a&&(!Number.isInteger(a.slot)||a.slot<0||a.slot>=RULES.slots))return '请选择有效蛊位';
  if('target'in a&&a.target!==undefined&&(!Number.isInteger(a.target)||a.target<0||a.target>=4||!e.slots[a.target]))return '目标蛊虫已经离场';
  switch(a.type) {
    case 'pass':return null;
    case 'meditate':return p.meditatedRound===g.round?'每轮只能凝元一次':resource(p)>=(p.rank===6?RULES.immortalCap:RULES.yuanCap)?'资源已满':null;
    case 'refine': {
      const r=getGu(a.recipe);
      if(!r||!recipes(p).includes(a.recipe))return '未携带该蛊方';
      if(p.rank<r.rank)return `需要${r.rank}转`;
      if(p.slots.some(x=>x?.recipe===r.id))return '同名蛊只能装备一只';
      return canPay(refinementCost(g,p,r.id));
    }
    case 'activate': {
      if(!slot)return '该蛊位为空';
      if(!readySlot(g,p,a.slot))return '本轮已经使用或位置被风灾封锁';
      const r=getGu(slot.recipe);
      if(r.effect==='income'&&p.incomeRound===g.round)return '每轮最多发动一只经营蛊';
      if(r.effect==='heal'&&p.hp>=RULES.life)return '人物生命已满';
      if(r.effect==='repair'&&!p.slots.some(s=>s&&s.durability<guMaximum(s)))return '没有需要修复的蛊虫';
      if(r.effect==='shred'&&!e.slots.some(Boolean))return '对手没有蛊虫';
      if(r.effect==='force'&&p.force>=3)return '力势已满';
      if(r.effect==='income'&&resource(p)>=(p.rank===6?RULES.immortalCap:RULES.yuanCap))return '资源已满';
      return canPay(activationCost(p,r.id));
    }
    case 'cultivate':return p.rank>=5?'五转后请宣告升仙':p.cultivatedRound===g.round?'每轮只能升转一次':canPay(RULES.cultivationCosts[p.rank]);
    case 'ascend':return p.rank!==5?'需要先达到五转':p.ascensionDue!==null?'已经在准备升仙':canPay(RULES.ascensionCost);
    case 'learn': {
      const m=getMove(a.move);
      if(!m||!moveRecipes(p).includes(a.move))return '未携带该杀招配方';
      if(p.learned.includes(m.id))return '已经参悟';
      if(p.rank<m.rank)return `需要${m.rank}转`;
      return canPay(scaledCost(p,m.research));
    }
    case 'move': {
      const m=getMove(a.move);
      if(!m||!p.learned.includes(a.move))return '需要先参悟杀招';
      if((p.cooldowns[m.id]??0)>g.round)return `第${p.cooldowns[m.id]}轮恢复`;
      if(!components(g,p,m))return `需要两只不同、可用的蛊虫：${m.needs.join('＋')}`;
      return canPay(scaledCost(p,m.cost));
    }
    case 'repair':return !slot?'该蛊位为空':slot.durability>=guMaximum(slot)?'耐久已满':canPay(1);
    case 'upgrade':return !slot?'该蛊位为空':p.rank<3?'三转开放升炼':slot.upgraded?'每只蛊虫最多升炼一次':canPay(scaledCost(p,2));
    case 'salvage':return !slot?'该蛊位为空':p.salvagedRound===g.round?'每轮只能拆解一次':null;
  }
}

function heal(p:CultPlayer,n:number){const old=p.hp;p.hp=Math.min(RULES.life,p.hp+n);return p.hp-old;}
function repair(g:CultGame,p:CultPlayer,n:number,index?:number) {
  const candidates=p.slots.map((s,i)=>({s,i})).filter(x=>x.s&&x.s.durability<guMaximum(x.s));
  const target=index===undefined?candidates.sort((a,b)=>(guMaximum(b.s!)-b.s!.durability)-(guMaximum(a.s!)-a.s!.durability))[0]?.s:p.slots[index];
  if(!target)return 0;
  const amount=Math.min(n,guMaximum(target)-target.durability);target.durability+=amount;
  if(amount>0&&p.hero==='taibai'&&p.repairedRound!==g.round){heal(p,1);p.repairedRound=g.round;addLog(g,'太白云生「复旧」：修复蛊虫，额外回复1生命。');}
  return amount;
}
function damage(g:CultGame,victim:number,amount:number,source:number|null,target?:number,hazard=false) {
  const p=g.players[victim];let left=amount;
  if(hazard){const saved=Math.min(left,p.ward);p.ward-=saved;left-=saved;}
  const shielded=Math.min(left,p.shield);p.shield-=shielded;left-=shielded;
  let actual=0;
  if(target!==undefined&&p.slots[target]) {
    const s=p.slots[target]!; actual=Math.min(left,s.durability);s.durability-=actual;
    if(s.durability<=0){addLog(g,`${title(p)}的${getGu(s.recipe).name}被摧毁。`);p.slots[target]=null;}
  }else if(target===undefined){actual=Math.min(left,p.hp);p.hp-=actual;}
  if(actual>0&&source!==null){
    const attacker=g.players[source];
    if(attacker.damagedRound!==g.round){
      if(attacker.hero==='baininbing')p.chill=Math.min(2,p.chill+1);
      if(attacker.hero==='he Loulan')attacker.force=Math.min(3,attacker.force+1);
      attacker.damagedRound=g.round;
    }
  }
  return actual;
}
function lowestSlot(p:CultPlayer,exclude:number[]=[]){
  return p.slots.map((s,i)=>({s,i})).filter(x=>x.s&&!exclude.includes(x.i)).sort((a,b)=>a.s!.durability-b.s!.durability)[0]?.i;
}
function checkWinner(g:CultGame){
  const [a,b]=g.players;
  if(a.hp<=0&&b.hp<=0)g.winner='draw';else if(a.hp<=0)g.winner=1;else if(b.hp<=0)g.winner=0;
}
export function forecast(_g:CultGame,p:CultPlayer) {
  if(p.ascensionDue!==null)return {name:'升仙地劫',due:p.ascensionDue,strength:RULES.initialTribulation,detail:'轮末受到6点灾劫伤害，存活后成仙。',prepare:'用完整准备轮安排护盾或提前建立护劫屏障。'};
  if(p.nextTribulation!==null){const t=TRIBULATIONS[p.trials%TRIBULATIONS.length];return {...t,due:p.nextTribulation,strength:4+p.trials*2};}
  return null;
}
function resolveTribulation(g:CultGame,who:number){
  const p=g.players[who];
  if(p.ascensionDue===g.round){
    const n=damage(g,who,RULES.initialTribulation,null,undefined,true);
    addLog(g,`${title(p)}渡升仙地劫，实际损失${n}生命。`);
    if(p.hp>0){p.rank=6;p.ascensionDue=null;p.essence=2;p.nextTribulation=g.round+RULES.tribulationInterval;
      addLog(g,`${title(p)}升为六转！仙窍初始产出2仙缘；元石封存，后续改领仙缘。现有蛊虫以仙缘催动，攻击/防御/恢复效果额外+1。`);}
    return;
  }
  if(p.nextTribulation!==g.round)return;
  const t=TRIBULATIONS[p.trials%TRIBULATIONS.length],strength=4+p.trials*2;
  addLog(g,`${title(p)}遭遇${t.name}，强度${strength}。`);
  if(t.id==='thunder'){damage(g,who,Math.ceil(strength/2),null,undefined,true);damage(g,who,Math.floor(strength/2),null,undefined,true);}
  if(t.id==='fire'){
    const first=lowestSlot(p),second=lowestSlot(p,first===undefined?[]:[first]);
    if(first!==undefined)damage(g,who,Math.ceil(strength/2),null,first,true);
    if(second!==undefined)damage(g,who,Math.ceil(strength/2),null,second,true);
    damage(g,who,2,null,undefined,true);
  }
  if(t.id==='erosion'){damage(g,who,strength,null,undefined,true);p.reducedIncome=true;}
  if(t.id==='wind'){damage(g,who,strength,null,undefined,true);p.blockedSlot=lowestSlot(p)??0;p.blockedRound=g.round+1;}
  p.trials++;p.nextTribulation=g.round+RULES.tribulationInterval;
}
function endRound(g:CultGame){
  resolveTribulation(g,0);resolveTribulation(g,1);
  if(g.round>=RULES.pressureStart){const n=2+g.round-RULES.pressureStart;g.players.forEach(p=>p.hp=Math.max(0,p.hp-n));addLog(g,`天地压迫：双方各失去${n}生命，无视护盾。`);}
  checkWinner(g);
  if(g.winner!==null)return;
  if(g.round>=RULES.maxRound){g.winner=g.players[0].hp===g.players[1].hp?'draw':g.players[0].hp>g.players[1].hp?0:1;addLog(g,'达到对局轮数上限，按剩余生命判定。');return;}
  g.round++;g.initiative=1-g.initiative;g.actor=g.initiative;
  g.players.forEach(p=>{p.ap=RULES.actions;p.shield=0;gain(p,p.rank===6?RULES.immortalIncome-(p.reducedIncome?1:0):RULES.yuanIncome);p.reducedIncome=false;});
  addLog(g,`第${g.round}轮：补给到账，${title(g.players[g.actor])}先行动。`);
}

export function reduceCultGame(state:CultGame,who:number,action:CultAction):CultGame {
  if(actionError(state,who,action))return state;
  const g=structuredClone(state),p=g.players[who],enemy=g.players[1-who];
  const a=action;
  p.ap--;
  switch(a.type){
    case 'refine':{
      const r=getGu(a.recipe),cost=refinementCost(g,p,r.id);spend(p,cost);p.refinedRound=g.round;
      p.slots[a.slot]={recipe:r.id,durability:r.durability,upgraded:false,usedRound:0};
      addLog(g,`${title(p)}花费${cost}${currency(p)}，在${a.slot+1}号蛊位炼制${r.name}。${p.rank===6?'仙缘驱动已启用。':''}`);break;
    }
    case 'activate':{
      const s=p.slots[a.slot]!,r=getGu(s.recipe),cost=activationCost(p,r.id);
      spend(p,cost);if(p.chill>=2)p.chill=0;s.usedRound=g.round;
      const n=r.power+(s.upgraded?1:0)+(p.rank===6&&['attack','guard','heal','repair','shred'].includes(r.effect)?1:0);
      let actual=0;
      if(r.effect==='attack')actual=damage(g,1-who,n,who,a.target);
      if(r.effect==='shred'){const target=a.target??lowestSlot(enemy);if(target!==undefined)actual=damage(g,1-who,n,who,target);}
      if(r.effect==='guard')p.shield=Math.min(15,p.shield+n);
      if(r.effect==='heal')actual=heal(p,n);
      if(r.effect==='repair')actual=repair(g,p,n);
      if(r.effect==='income'){gain(p,n);p.incomeRound=g.round;}
      if(r.effect==='force')p.force=Math.min(3,p.force+n);
      addLog(g,`${title(p)}催动${r.name}，消耗${cost}${currency(p)}${actual?`，实际${['attack','shred'].includes(r.effect)?'造成':'恢复'}${actual}点`:''}。`);break;
    }
    case 'cultivate':spend(p,RULES.cultivationCosts[p.rank]);p.rank++;p.cultivatedRound=g.round;addLog(g,`${title(p)}修炼至${p.rank}转。基础补给保持不变。`);break;
    case 'ascend':spend(p,RULES.ascensionCost);p.ascensionDue=g.round+1;addLog(g,`${title(p)}宣告升仙！第${p.ascensionDue}轮为完整准备轮，轮末承受6点升仙地劫。`);break;
    case 'learn':{const m=getMove(a.move);spend(p,scaledCost(p,m.research));p.learned.push(m.id);addLog(g,`${title(p)}参悟杀招「${m.name}」。`);break;}
    case 'move':{
      const m=getMove(a.move),parts=components(g,p,m)!;spend(p,scaledCost(p,m.cost));
      parts.forEach(i=>p.slots[i]!.usedRound=g.round);p.cooldowns[m.id]=g.round+m.cooldown+1;
      let bonus=p.rank===6?1:0;if(m.id==='hl-move'){bonus+=p.force;p.force=0;}
      if(m.damage)damage(g,1-who,m.damage+bonus,who,a.target);
      if(m.shred){const target=lowestSlot(enemy);if(target!==undefined)damage(g,1-who,m.shred,who,target);}
      if(m.heal)heal(p,m.heal+bonus);
      if(m.shield)p.shield=Math.min(15,p.shield+m.shield+bonus);
      if(m.repair)repair(g,p,m.repair+bonus);
      if(m.ward)p.ward=Math.min(10,p.ward+m.ward);
      if(m.id==='bn-move')enemy.chill=2;
      addLog(g,`${title(p)}发动「${m.name}」，组件本轮休眠，第${p.cooldowns[m.id]}轮冷却结束。`);break;
    }
    case 'repair':spend(p,1);repair(g,p,2,a.slot);addLog(g,`${title(p)}花费1${currency(p)}维护${getGu(p.slots[a.slot]!.recipe).name}。`);break;
    case 'upgrade':{const s=p.slots[a.slot]!;spend(p,scaledCost(p,2));s.upgraded=true;s.durability=guMaximum(s);addLog(g,`${title(p)}升炼${getGu(s.recipe).name}：耐久上限与催动数值+1，并修满耐久。`);break;}
    case 'salvage':{const s=p.slots[a.slot]!,n=Math.max(1,Math.floor(scaledCost(p,getGu(s.recipe).cost)/2))+(p.hero==='fangyuan'?1:0);gain(p,n);p.slots[a.slot]=null;p.salvagedRound=g.round;addLog(g,`${title(p)}拆解${getGu(s.recipe).name}，回收${n}${currency(p)}。`);break;}
    case 'meditate':gain(p,1);p.meditatedRound=g.round;addLog(g,`${title(p)}凝元，获得1${currency(p)}。`);break;
    case 'pass':p.ap=0;addLog(g,`${title(p)}结束本轮行动。`);break;
  }
  checkWinner(g);
  if(g.winner===null){if(g.players.every(x=>x.ap===0))endRound(g);else g.actor=g.players[1-who].ap>0?1-who:who;}
  if(g.winner!==null)addLog(g,g.winner==='draw'?'双方同归于尽，本局平局。':`${title(g.players[g.winner])}获胜！本局资源不带出对局。`);
  return g;
}

export function candidateActions(g:CultGame):CultAction[]{
  if(g.winner!==null)return [];
  const p=g.players[g.actor],enemy=g.players[1-g.actor];
  const actions:CultAction[]=[{type:'cultivate'},{type:'ascend'},{type:'meditate'},{type:'pass'}];
  for(let i=0;i<4;i++){
    actions.push({type:'activate',slot:i},{type:'repair',slot:i},{type:'upgrade',slot:i},{type:'salvage',slot:i});
    if(p.slots[i]&&['attack','shred'].includes(getGu(p.slots[i]!.recipe).effect))for(let target=0;target<4;target++)if(enemy.slots[target])actions.push({type:'activate',slot:i,target});
    for(const recipe of recipes(p))if(!p.slots[i]||getGu(recipe).rank===6&&getGu(p.slots[i]!.recipe).rank<6)actions.push({type:'refine',recipe,slot:i});
  }
  for(const move of moveRecipes(p))actions.push({type:'learn',move},{type:'move',move});
  return actions.filter(a=>!actionError(g,g.actor,a));
}

export function chooseCultAI(g:CultGame):CultAction{
  const who=g.actor,p=g.players[who],enemy=g.players[1-who],trial=forecast(g,p);
  const urgent=!!trial&&trial.due<=g.round+1;
  const protect=!!trial&&trial.due===g.round;
  const seekAscension=Math.abs(g.seed)%4!==0;
  let best:CultAction={type:'pass'},score=-Infinity;
  for(const a of candidateActions(g)){
    const next=reduceCultGame(g,who,a),q=next.players[who],r=next.players[1-who];
    let n=(enemy.hp-r.hp)*2.3+(q.hp-p.hp)*(p.hp<16?2.4:1.5);
    if(next.winner===who)n+=10000;
    if(next.winner===1-who)n-=10000;
    if(next.winner==='draw')n-=100;
    if(a.type==='activate'){
      const effect=getGu(p.slots[a.slot]!.recipe).effect;
      if(effect==='guard')n+=(q.shield-p.shield)*(protect?3.5:p.hp<15?1.8:enemy.ap>0?0.8:0.05);
      if(effect==='income')n+=2.4;
      if(effect==='force')n+=p.force<2?2.8:0.5;
      if(effect==='repair')n+=p.slots.reduce((sum,s,i)=>sum+(s?((q.slots[i]?.durability??0)-s.durability):0),0)*1.2;
      if(a.target!==undefined)n+=2;
    }
    if(a.type==='refine'){
      const recipe=getGu(a.recipe),existing=p.slots.filter(Boolean).map(s=>getGu(s!.recipe).effect);
      n+=existing.length<3?5.8:1.5;
      if(recipe.effect==='attack')n+=existing.filter(x=>x==='attack').length<2?2:0;
      if(recipe.effect==='guard')n+=!existing.includes('guard')?4:0;
      if(recipe.effect==='heal')n+=p.hp<22&&!existing.includes('heal')?4:0;
      if(recipe.effect==='repair')n+=p.slots.some(s=>s&&s.durability<guMaximum(s))?3:-2;
      if(recipe.effect==='income')n-=1;
      if(recipe.rank===6)n+=6;
      if(protect)n-=5;
    }
    if(a.type==='cultivate')n+=seekAscension?(g.round>=2?12:8):p.rank<3?5:0.5;
    if(a.type==='ascend')n+=seekAscension?(p.hp>=10?20:p.hp>6?10:1):-8;
    if(a.type==='learn'){
      const m=getMove(a.move);n+=components(g,p,m)?5:0;
      if(m.ward&&urgent)n+=4;
      if(protect)n-=4;
    }
    if(a.type==='move'){
      const m=getMove(a.move);n+=(q.shield-p.shield)*(protect?3.5:p.hp<15?1.6:0.4);
      if(m.ward)n+=(q.ward-p.ward)*(urgent?2:0.4);
    }
    if(a.type==='upgrade')n+=4+(getGu(p.slots[a.slot]!.recipe).effect==='attack'?1.6:0);
    if(a.type==='repair')n+=2;
    if(a.type==='meditate')n+=resource(p)<2?3.5:0.7;
    if(a.type==='salvage')n-=8;
    if(a.type==='pass')n-=5;
    if(protect&&q.hp<p.hp)n-=10;
    n+=g.players[1-who].slots.reduce((sum,s,i)=>sum+(s?s.durability-(r.slots[i]?.durability??0):0),0)*0.9;
    if(n>score){score=n;best=a;}
  }
  return best;
}
