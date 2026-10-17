import { DEFAULT_GU, DEFAULT_MOVES, GAME_NAME, HEROES, RULES, TRIBULATIONS, getGu, getHero, getMove } from './cultivationData';
import type { HeroId, MoveRecipe } from './cultivationData';
import { HANDS, consumable, getHand, memorable, mindEligible } from './handData';
import type { HandCard, HandKind } from './handData';
export interface GuInstance {recipe:string;durability:number;upgraded:boolean;usedRound:number}
export interface CultPlayer {
  hero:HeroId;hp:number;rank:number;stage:number;lifespan:number;qi:number;thought:number;yuan:number;essence:number;ap:number;
  shield:number;ward:number;force:number;chill:number;slots:(GuInstance|null)[];loadout:string[];moves:string[];
  learned:string[];cooldowns:Record<string,number>;ascensionDue:number|null;nextTribulation:number|null;trials:number;
  blockedSlot:number|null;blockedRound:number;reducedIncome:boolean;cultivatedRound:number;refinedRound:number;salvagedRound:number;
  damagedRound:number;contactRound:number;repairedRound:number;incomeRound:number;meditatedRound:number;attackedRound:number;restedRound:number;immortalRound:number;
  hand:HandCard[];usedHand:HandKind[];memory:{card:HandCard;kind:HandKind}|null;order:{card:HandCard;expires:number}|null;
}
type Pending =
  | {kind:'book';owner:number;card:HandCard;cards:HandCard[]}
  | {kind:'window';owner:number;card:HandCard;options:HandKind[]}
  | {kind:'soul-defense';owner:number;card:HandCard}
  | {kind:'soul-mark';owner:number;card:HandCard;uids:string[];resisted:boolean}
  | {kind:'discard';owner:number;count:number};
export interface CultGame {
  version:3;id:string;seed:number;random:number;round:number;actor:number;initiative:number;
  players:[CultPlayer,CultPlayer];winner:number|'draw'|null;deck:HandCard[];discard:HandCard[];exiled:HandCard[];market:HandCard[];pending:Pending|null;
  logs:{id:number;text:string;privateTo?:number}[];logId:number;
}
export type CultAction =
  | {type:'refine';recipe:string;slot:number} | {type:'activate';slot:number;target?:number}
  | {type:'cultivate'} | {type:'ascend'} | {type:'meditate'} | {type:'pass'} | {type:'strike';target?:number} | {type:'rest'} | {type:'immortal';target?:number}
  | {type:'learn';move:string} | {type:'move';move:string;target?:number}
  | {type:'repair';slot:number} | {type:'upgrade';slot:number} | {type:'salvage';slot:number}
  | {type:'hand';uid:string;useMind?:boolean;buys?:string[];sell?:string;memory?:HandKind}
  | {type:'buy';uid:string} | {type:'sell';uid:string}
  | {type:'chooseBook';keep:string[];bottom?:string[]} | {type:'chooseOrder';kind:HandKind}
  | {type:'resistSoul';resist:boolean} | {type:'markSoul';uid?:string} | {type:'discard';uids:string[]};
export function resource(p:CultPlayer){return p.rank===6?p.essence:p.yuan;}
export function currency(p:CultPlayer){return p.rank===6?'仙元':'元石';}
export function qiMaximum(p:CultPlayer){return p.rank===6?7:4+p.stage;}
export function scaledCost(p:CultPlayer,cost:number){return p.rank===6?Math.ceil(cost/2):cost;}
export function guMaximum(g:GuInstance){return getGu(g.recipe).durability+(g.upgraded?1:0);}
export function recipes(p:CultPlayer){return [...getHero(p.hero).exclusive,...p.loadout];}
export function moveRecipes(p:CultPlayer){return [getHero(p.hero).move,...p.moves];}
export function refinementCost(g:CultGame,p:CultPlayer,id:string){return Math.max(1,scaledCost(p,getGu(id).cost)-(p.hero==='fangyuan'&&p.refinedRound!==g.round?1:0));}
export function activationCost(p:CultPlayer,id:string){return getGu(id).activation+(p.chill>=2?1:0);}
export function handCost(p:CultPlayer,c:HandCard,useMind=false){
  let n=getHand(c.kind).qi+(c.disturbedUntil!==undefined?1:0)-(p.memory?.kind===c.kind?1:0);
  n=Math.max(0,n);return Math.max(0,n-(useMind&&p.thought>0&&mindEligible(c.kind)?1:0));
}
function addLog(g:CultGame,text:string,privateTo?:number){g.logs.push({id:++g.logId,text,privateTo});if(g.logs.length>180)g.logs.shift();}
function spend(p:CultPlayer,n:number){if(p.rank===6)p.essence-=n;else p.yuan-=n;}
function gain(p:CultPlayer,n:number){if(p.rank===6)p.essence=Math.min(RULES.immortalCap,p.essence+n);else p.yuan=Math.min(RULES.yuanCap,p.yuan+n);}
function title(p:CultPlayer){return getHero(p.hero).name;}
function rng(g:CultGame){g.random=(Math.imul(g.random,1664525)+1013904223)>>>0;return g.random/4294967296;}
function shuffle<T>(g:CultGame,xs:T[]){for(let i=xs.length-1;i>0;i--){const j=Math.floor(rng(g)*(i+1));[xs[i],xs[j]]=[xs[j],xs[i]];}return xs;}
function draw(g:CultGame,n:number){const out:HandCard[]=[];while(out.length<n){if(!g.deck.length&&g.discard.length)g.deck=shuffle(g,g.discard.splice(0));if(!g.deck.length)break;out.push(g.deck.shift()!);}return out;}
function refill(g:CultGame){g.market.push(...draw(g,5-g.market.length));}
function discardCard(g:CultGame,c:HandCard){delete c.disturbedUntil;g.discard.push(c);}
function endCard(g:CultGame,c:HandCard){if(consumable(c.kind))g.exiled.push(c);else discardCard(g,c);}
function canAttack(g:CultGame,p:CultPlayer){return p.attackedRound!==g.round&&p.restedRound!==g.round;}
function canRest(g:CultGame,p:CultPlayer){return p.attackedRound!==g.round&&p.restedRound!==g.round;}
export function createCultGame(hero:HeroId='fangyuan',loadout:string[]=DEFAULT_GU,moves:string[]=DEFAULT_MOVES,seed=Date.now(),enemy?:HeroId):CultGame {
  if(!getHero(hero)||loadout.length!==5||new Set(loadout).size!==5||!loadout.every(id=>getGu(id)&&!getGu(id).owner)||moves.length!==2||new Set(moves).size!==2||!moves.every(id=>getMove(id)&&!getMove(id).owner))throw new Error('Invalid cultivation loadout');
  const opponent=enemy??HEROES.filter(h=>h.id!==hero)[Math.abs(seed)%3].id;
  if(!getHero(opponent)||opponent===hero)throw new Error('同局人物与仙蛊不得重复');
  function player(id:HeroId,gs:string[],ms:string[]):CultPlayer {return {
    hero:id,hp:RULES.life,rank:5,stage:0,lifespan:RULES.lifespan,qi:4,thought:0,yuan:3,essence:0,ap:3,
    shield:0,ward:0,force:0,chill:0,slots:[{recipe:getHero(id).core,durability:4,upgraded:false,usedRound:0},null,null,null],
    loadout:[...gs],moves:[...ms],learned:[],cooldowns:{},ascensionDue:null,nextTribulation:null,trials:0,
    blockedSlot:null,blockedRound:0,reducedIncome:false,cultivatedRound:0,refinedRound:0,salvagedRound:0,
    damagedRound:0,contactRound:0,repairedRound:0,incomeRound:0,meditatedRound:0,attackedRound:0,restedRound:0,immortalRound:0,
    hand:[],usedHand:[],memory:null,order:null,
  };}
  const g:CultGame={version:3,id:'ascend-'+seed+'-'+Math.random().toString(36).slice(2,8),seed,random:seed>>>0,
    round:1,actor:Math.abs(seed)%2,initiative:Math.abs(seed)%2,players:[player(hero,loadout,moves),player(opponent,DEFAULT_GU,DEFAULT_MOVES)],
    winner:null,deck:[],discard:[],exiled:[],market:[],pending:null,logs:[],logId:0};
  for(const h of HANDS)for(let i=0;i<RULES.copies;i++)g.deck.push({uid:h.id+'-'+i,kind:h.id});
  g.players.forEach(p=>{p.hand.push(g.deck.splice(g.deck.findIndex(c=>c.kind==='life'),1)[0]);});
  shuffle(g,g.deck);g.players.forEach(p=>p.hand.push(...draw(g,4)));refill(g);
  addLog(g,GAME_NAME+'：'+title(g.players[0])+' 对阵 '+title(g.players[1])+'。五转初阶，30体魄、8寿元、3元石，手牌各五张且保证寿蛊。');return g;
}
export function readySlot(g:CultGame,p:CultPlayer,i:number){return !!p.slots[i]&&p.slots[i]!.usedRound!==g.round&&!(p.blockedRound===g.round&&p.blockedSlot===i);}
export function components(g:CultGame,p:CultPlayer,m:MoveRecipe):number[]|null {
  function match(at:number,used:number[]):number[]|null {if(at===m.needs.length)return used;for(let i=0;i<4;i++)if(!used.includes(i)&&readySlot(g,p,i)&&getGu(p.slots[i]!.recipe).tags.includes(m.needs[at])){const x=match(at+1,[...used,i]);if(x)return x;}return null;}
  return match(0,[]);
}
function pendingError(g:CultGame,a:CultAction):string|null {
  const q=g.pending!;
  if(q.kind==='book'&&a.type==='chooseBook'){
    const n=Math.min(2,q.cards.length),rest=q.cards.filter(c=>!a.keep.includes(c.uid)).map(c=>c.uid);
    if(a.keep.length!==n||new Set(a.keep).size!==n||!a.keep.every(id=>q.cards.some(c=>c.uid===id)))return '请选择正确数量的查阅牌';
    if(a.bottom&&(a.bottom.length!==rest.length||new Set(a.bottom).size!==rest.length||!a.bottom.every(id=>rest.includes(id))))return '置底顺序必须恰好包含其余牌';return null;
  }
  if(q.kind==='window'&&a.type==='chooseOrder')return q.options.includes(a.kind)?null:'该品种不在本次已付费货源清单';
  if(q.kind==='soul-defense'&&a.type==='resistSoul')return a.resist&&g.players[1-q.owner].thought<1?'神念不足':null;
  if(q.kind==='soul-mark'&&a.type==='markSoul')return a.uid&&(!q.uids.includes(a.uid)||q.resisted||!g.players[1-q.owner].hand.some(c=>c.uid===a.uid&&!consumable(c.kind)))?'不能扰动这张牌':null;
  if(q.kind==='discard'&&a.type==='discard')return a.uids.length===q.count&&new Set(a.uids).size===q.count&&a.uids.every(id=>g.players[q.owner].hand.some(c=>c.uid===id))?null:'请弃置至手牌上限六张';
  return '请先完成当前选择';
}
export function actionError(g:CultGame,who:number,a:CultAction):string|null {
  if(g.winner!==null)return '对局已经结束';if(who!==g.actor)return '等待对手行动';
  if(g.pending)return pendingError(g,a);
  const p=g.players[who],e=g.players[1-who];if(!p||p.ap<=0)return '本轮行动已用完';
  const canPay=(n:number)=>resource(p)>=n?null:'需要'+n+currency(p);
  const qiPay=(n:number)=>p.qi>=n?null:'需要'+n+'真元';
  const slot='slot'in a&&Number.isInteger(a.slot)&&a.slot>=0&&a.slot<4?p.slots[a.slot]:null;
  if('slot'in a&&(!Number.isInteger(a.slot)||a.slot<0||a.slot>=4))return '请选择有效蛊位';
  if('target'in a&&a.target!==undefined&&(!Number.isInteger(a.target)||a.target<0||a.target>=4||!e.slots[a.target]))return '目标蛊虫已经离场';
  switch(a.type){
    case 'pass':return null;
    case 'strike':return !canAttack(g,p)?'每轮只能攻伐一次，且与疗伤二选一':qiPay(2);
    case 'rest':return !canRest(g,p)?'疗伤每轮一次且与攻伐二选一':p.hp>=RULES.life?'体魄已满':canPay(1);
    case 'meditate':return p.meditatedRound===g.round?'每轮采集一次':resource(p)>=(p.rank===6?6:10)?'资源已满':null;
    case 'refine':{const r=getGu(a.recipe);return !r||!recipes(p).includes(a.recipe)?'未携带该蛊方':p.slots.some(s=>s?.recipe===r.id)?'同名蛊只能装备一只':canPay(refinementCost(g,p,r.id));}
    case 'activate':{
      if(!slot)return '该蛊位为空';if(!readySlot(g,p,a.slot))return '本轮已使用或位置被风灾封锁';const r=getGu(slot.recipe);
      if(['attack','shred'].includes(r.effect)&&!canAttack(g,p))return '本轮攻伐机会已使用，或已经疗伤';
      if(r.effect==='heal'&&(!canRest(g,p)||p.hp>=RULES.life))return '不能再疗伤，或体魄已满';
      if(r.effect==='repair'&&!p.slots.some(s=>s&&s.durability<guMaximum(s)))return '没有需要修复的蛊虫';
      if(r.effect==='income'&&(p.incomeRound===g.round||resource(p)>=(p.rank===6?6:10)))return '本轮经营已用或资源已满';
      return qiPay(activationCost(p,r.id));
    }
    case 'cultivate':return p.rank===6||p.stage>=3?'五转巅峰后请准备升仙':p.cultivatedRound===g.round?'每轮最多升一个小境界':p.lifespan<1?'寿元不足':canPay(3);
    case 'ascend':return p.rank!==5||p.stage!==3?'需要五转巅峰':p.ascensionDue!==null?'已经在准备升仙':p.ap<2?'突破需要两次行动':p.lifespan<2?'需要2寿元':canPay(RULES.ascensionCost);
    case 'learn':{const m=getMove(a.move);return !m||!moveRecipes(p).includes(a.move)?'未携带该杀招':p.learned.includes(m.id)?'已经参悟':canPay(scaledCost(p,m.research));}
    case 'move':{
      const m=getMove(a.move);if(!m||!p.learned.includes(m.id))return '需要先参悟杀招';
      if((m.damage||m.shred)&&!canAttack(g,p))return '本轮攻伐机会已使用，或已经疗伤';
      if(m.heal&&!canRest(g,p))return '疗伤与本轮攻伐二选一，每轮一次';
      if((p.cooldowns[m.id]??0)>g.round)return '第'+p.cooldowns[m.id]+'轮恢复';
      if(!components(g,p,m))return '需要两只不同、可用的蛊虫：'+m.needs.join('＋');return qiPay(m.cost+(p.chill>=2?1:0));
    }
    case 'immortal':{const m=getHero(p.hero).immortal;return p.rank!==6?'成仙后才解锁人物仙蛊技能':p.immortalRound===g.round?'仙蛊技能每轮一次':m.damage&&!canAttack(g,p)?'本轮攻伐机会已使用，或已经疗伤':m.heal&&(!canRest(g,p)||p.hp>=30)?'不能再疗伤，或体魄已满':canPay(m.cost);}
    case 'repair':return !slot?'该蛊位为空':slot.durability>=guMaximum(slot)?'耐久已满':canPay(1);
    case 'upgrade':return !slot?'该蛊位为空':slot.upgraded?'每只蛊虫最多升炼一次':canPay(scaledCost(p,2));
    case 'salvage':return !slot?'该蛊位为空':p.salvagedRound===g.round?'每轮拆解一次':null;
    case 'buy':{const order=p.order?.card.uid===a.uid;return !order&&!g.market.some(c=>c.uid===a.uid)?'商品已经不在市场':canPay(order?1:2);}
    case 'sell':return p.hand.some(c=>c.uid===a.uid)?null:'请选择自己的手牌';
    case 'hand':{
      const c=p.hand.find(c=>c.uid===a.uid);if(!c)return '手牌已经离手';if(p.usedHand.includes(c.kind))return '同名手牌每轮只能使用一次';
      if(a.useMind&&(!mindEligible(c.kind)||p.thought<1||handCost(p,c)===0))return '此费用不能再用神念抵扣';
      const qiError=qiPay(handCost(p,c,!!a.useMind));if(qiError)return qiError;
      if(c.kind==='relic')return p.rank!==5||p.stage>=3?'舍利不能直接成仙或提升仙人修为':p.cultivatedRound===g.round?'每轮最多升一个小境界':null;
      if(c.kind==='book')return g.deck.length+g.discard.length>0?null:'没有可查阅的库存';
      if(c.kind==='window')return p.order?'先领取或等待原订单过期':g.deck.length+g.discard.length===0?'没有可订库存':canPay(1);
      if(c.kind==='soul')return p.contactRound!==g.round?'本轮须先实际伤害对手人物':!e.hand.length?'对手没有手牌':null;
      if(c.kind==='memory')return a.memory&&memorable(a.memory)&&p.hand.some(x=>x.uid!==c.uid&&x.kind===a.memory)?null:'需展示另一张可记录手牌';
      if(c.kind==='heaven'){
        const ids=a.buys??[];if(ids.length<1||ids.length>2||new Set(ids).size!==ids.length)return '请选择一至两张现有商品';
        if(!ids.every(id=>g.market.some(x=>x.uid===id)||p.order?.card.uid===id))return '商品已经离开市场';
        if(a.sell&&!p.hand.some(x=>x.uid===a.sell&&x.uid!==c.uid))return '只能出售另一张旧手牌';
        const balance=Math.min(p.rank===6?6:10,resource(p)+(a.sell?1:0));
        return balance<ids.filter(id=>p.order?.card.uid!==id).length?'售牌后的资源仍不足以付清货款':null;
      }
      return null;
    }
    default:return '当前没有这个选择窗口';
  }
}
function heal(p:CultPlayer,n:number){const old=p.hp;p.hp=Math.min(30,p.hp+n);return p.hp-old;}
function repair(g:CultGame,p:CultPlayer,n:number,index?:number){
  const candidates=p.slots.filter((s):s is GuInstance=>!!s&&s.durability<guMaximum(s)).sort((a,b)=>(guMaximum(b)-b.durability)-(guMaximum(a)-a.durability));
  const s=index===undefined?candidates[0]:p.slots[index];if(!s)return 0;const amount=Math.min(n,guMaximum(s)-s.durability);s.durability+=amount;
  if(amount>0&&p.hero==='taibai'&&p.repairedRound!==g.round){heal(p,1);p.repairedRound=g.round;addLog(g,'太白云生「复旧」额外恢复1体魄，不延寿。');}return amount;
}
function damage(g:CultGame,victim:number,n:number,source:number|null,target?:number,hazard=false){
  const p=g.players[victim];let left=n;if(hazard){const x=Math.min(left,p.ward);p.ward-=x;left-=x;}
  const blocked=Math.min(left,p.shield);p.shield-=blocked;left-=blocked;let actual=0;
  if(target!==undefined){const s=p.slots[target];if(s){actual=Math.min(left,s.durability);s.durability-=actual;if(s.durability<=0){addLog(g,title(p)+'的'+getGu(s.recipe).name+'被摧毁。');p.slots[target]=null;}}}
  else {actual=Math.min(left,p.hp);p.hp-=actual;}
  if(actual>0&&source!==null){const a=g.players[source];if(target===undefined)a.contactRound=g.round;
    if(a.damagedRound!==g.round){if(a.hero==='baininbing')p.chill=Math.min(2,p.chill+1);if(a.hero==='he Loulan')a.force=Math.min(3,a.force+1);a.damagedRound=g.round;}}
  return actual;
}
function lowestSlot(p:CultPlayer,except:number[]=[]){return p.slots.map((s,i)=>({s,i})).filter(x=>x.s&&!except.includes(x.i)).sort((a,b)=>a.s!.durability-b.s!.durability)[0]?.i;}
function checkWinner(g:CultGame,life=false){const dead=g.players.map(p=>p.hp<=0||life&&p.lifespan===0);if(dead[0]&&dead[1])g.winner='draw';else if(dead[0])g.winner=1;else if(dead[1])g.winner=0;}
export function forecast(_g:CultGame,p:CultPlayer){
  if(p.ascensionDue!==null)return {name:'升仙地劫',due:p.ascensionDue,strength:6,detail:'轮末承受6点灾劫伤害，存活后成仙。',prepare:'护盾先抵，护劫屏障可跨轮准备。'};
  if(p.nextTribulation!==null)return {...TRIBULATIONS[p.trials%4],due:p.nextTribulation,strength:4+p.trials*2};return null;
}
function resolveTribulation(g:CultGame,who:number){
  const p=g.players[who];if(p.ascensionDue===g.round){const n=damage(g,who,6,null,undefined,true);addLog(g,title(p)+'渡升仙地劫，实际损失'+n+'体魄。');
    if(p.hp>0){p.rank=6;p.ascensionDue=null;p.essence=2;p.nextTribulation=g.round+3;addLog(g,title(p)+'成仙，获得2仙元，解锁'+getHero(p.hero).immortal.name+'。元石封存，交易与炼制改付仙元；凡蛊仍付真元。');}return;}
  if(p.nextTribulation!==g.round)return;const t=TRIBULATIONS[p.trials%4],n=4+p.trials*2;addLog(g,title(p)+'遭遇'+t.name+'，强度'+n+'。');
  if(t.id==='thunder'){damage(g,who,Math.ceil(n/2),null,undefined,true);damage(g,who,Math.floor(n/2),null,undefined,true);}
  if(t.id==='fire'){const a=lowestSlot(p),b=lowestSlot(p,a===undefined?[]:[a]);if(a!==undefined)damage(g,who,Math.ceil(n/2),null,a,true);if(b!==undefined)damage(g,who,Math.ceil(n/2),null,b,true);damage(g,who,2,null,undefined,true);}
  if(t.id==='erosion'){damage(g,who,n,null,undefined,true);p.reducedIncome=true;}
  if(t.id==='wind'){damage(g,who,n,null,undefined,true);p.blockedSlot=lowestSlot(p)??null;p.blockedRound=g.round+1;}
  p.trials++;p.nextTribulation=g.round+3;
}
function endRound(g:CultGame){
  for(let i=0;i<2;i++)if(g.players[i].hand.length>6){g.pending={kind:'discard',owner:i,count:g.players[i].hand.length-6};g.actor=i;return;}
  for(const p of g.players){if(p.order&&p.order.expires<=g.round){g.deck.push(p.order.card);p.order=null;shuffle(g,g.deck);addLog(g,title(p)+'的订单过期，实物退库，定金不退。');}
    for(const c of p.hand)if(c.disturbedUntil!==undefined&&c.disturbedUntil<=g.round)delete c.disturbedUntil;}
  resolveTribulation(g,0);resolveTribulation(g,1);checkWinner(g,true);if(g.winner!==null)return;
  if(g.round>=RULES.maxRound){g.winner=g.players[0].hp===g.players[1].hp?'draw':g.players[0].hp>g.players[1].hp?0:1;return;}
  g.round++;g.initiative=1-g.initiative;g.actor=g.initiative;
  for(const p of g.players){p.ap=3;p.shield=0;p.lifespan=Math.max(0,p.lifespan-1);p.qi=qiMaximum(p);p.usedHand=[];
    gain(p,p.rank===6?3-(p.reducedIncome?1:0):2);p.reducedIncome=false;p.hand.push(...draw(g,2));}
  addLog(g,'第'+g.round+'轮：减寿、恢复真元、补给与摸牌。'+title(g.players[g.actor])+'先行动。寿元为零者须在本轮结束前延寿。');
}
function advance(g:CultGame,who:number){checkWinner(g);if(g.winner!==null)return;if(g.players.every(p=>p.ap===0))endRound(g);else g.actor=g.players[1-who].ap>0?1-who:who;}
function resolvePending(g:CultGame,a:CultAction){
  const q=g.pending!,p=g.players[q.owner];
  if(q.kind==='book'&&a.type==='chooseBook'){
    p.hand.push(...a.keep.map(id=>q.cards.find(c=>c.uid===id)!));const ids=a.bottom??q.cards.filter(c=>!a.keep.includes(c.uid)).map(c=>c.uid);
    g.deck.push(...ids.map(id=>q.cards.find(c=>c.uid===id)!));discardCard(g,q.card);g.pending=null;addLog(g,title(p)+'完成书虫查阅，保留'+a.keep.length+'张，其余置底。');advance(g,q.owner);
  }else if(q.kind==='window'&&a.type==='chooseOrder'){
    const source=g.deck.some(c=>c.kind===a.kind)?g.deck:g.discard;const c=source.splice(source.findIndex(c=>c.kind===a.kind),1)[0];
    p.order={card:c,expires:g.round+1};shuffle(g,g.deck);discardCard(g,q.card);g.pending=null;addLog(g,title(p)+'预订'+getHand(c.kind).name+'，第'+p.order.expires+'轮末过期。');advance(g,q.owner);
  }else if(q.kind==='soul-defense'&&a.type==='resistSoul'){
    const e=g.players[1-q.owner];if(a.resist)e.thought--;const sample=shuffle(g,e.hand.map(c=>c.uid)).slice(0,a.resist?1:2);
    g.pending={kind:'soul-mark',owner:q.owner,card:q.card,uids:sample,resisted:a.resist};g.actor=q.owner;
    addLog(g,title(e)+(a.resist?'消耗1神念，搜魂只看一张且不扰动。':'未抵抗搜魂，随机查看两张。'));
  }else if(q.kind==='soul-mark'&&a.type==='markSoul'){
    const e=g.players[1-q.owner];if(a.uid){const c=e.hand.find(c=>c.uid===a.uid)!;c.disturbedUntil=g.round+1;addLog(g,title(e)+'的一张'+getHand(c.kind).name+'被扰动，下次使用多付1真元。');}
    addLog(g,'搜魂所见：'+q.uids.map(id=>getHand(e.hand.find(c=>c.uid===id)!.kind).name).join('、')+'。',q.owner);
    discardCard(g,q.card);g.pending=null;advance(g,q.owner);
  }else if(q.kind==='discard'&&a.type==='discard'){
    for(const id of a.uids)discardCard(g,p.hand.splice(p.hand.findIndex(c=>c.uid===id),1)[0]);g.pending=null;addLog(g,title(p)+'弃置'+a.uids.length+'张手牌。');endRound(g);
  }
}
export function reduceCultGame(state:CultGame,who:number,a:CultAction):CultGame {
  if(actionError(state,who,a))return state;const g=structuredClone(state),p=g.players[who],enemy=g.players[1-who];
  if(g.pending){resolvePending(g,a);}else{
    p.ap--;
    switch(a.type){
      case 'strike':p.qi-=2;p.attackedRound=g.round;damage(g,1-who,2,who,a.target);addLog(g,title(p)+'基础攻伐，造成至多2伤害。');break;
      case 'rest':spend(p,1);heal(p,1);p.restedRound=g.round;addLog(g,title(p)+'休整，恢复1体魄。');break;
      case 'refine':{const r=getGu(a.recipe),cost=refinementCost(g,p,r.id);spend(p,cost);p.refinedRound=g.round;p.slots[a.slot]={recipe:r.id,durability:r.durability,upgraded:false,usedRound:0};addLog(g,title(p)+'炼制'+r.name+'，花费'+cost+currency(p)+'。');break;}
      case 'activate':{const s=p.slots[a.slot]!,r=getGu(s.recipe),cost=activationCost(p,r.id);p.qi-=cost;if(p.chill>=2)p.chill=0;s.usedRound=g.round;const n=r.power+(s.upgraded?1:0);
        if(r.effect==='attack'||r.effect==='shred'){p.attackedRound=g.round;damage(g,1-who,n,who,r.effect==='shred'?(a.target??lowestSlot(enemy)):a.target);}
        if(r.effect==='guard')p.shield=Math.min(15,p.shield+n);
        if(r.effect==='heal'){heal(p,n);p.restedRound=g.round;}
        if(r.effect==='repair')repair(g,p,n);
        if(r.effect==='income'){gain(p,n);p.incomeRound=g.round;}
        addLog(g,title(p)+'催动'+r.name+'，消耗'+cost+'真元。');break;}
      case 'cultivate':spend(p,3);p.lifespan--;p.stage++;p.cultivatedRound=g.round;addLog(g,title(p)+'提升一个五转小境界，真元上限增加，本轮不补真元。');break;
      case 'ascend':spend(p,4);p.lifespan-=2;p.qi=0;p.ap--;p.ascensionDue=g.round+1;addLog(g,title(p)+'宣告突破：付两行动、4元石、2寿元，真元清零；下一完整轮末渡升仙地劫。');break;
      case 'learn':{const m=getMove(a.move);spend(p,scaledCost(p,m.research));p.learned.push(m.id);addLog(g,title(p)+'参悟「'+m.name+'」。');break;}
      case 'move':{const m=getMove(a.move),parts=components(g,p,m)!;p.qi-=m.cost+(p.chill>=2?1:0);if(p.chill>=2)p.chill=0;parts.forEach(i=>p.slots[i]!.usedRound=g.round);p.cooldowns[m.id]=g.round+m.cooldown+1;
        let bonus=0;if(m.id==='hl-move'){bonus=p.force;p.force=0;}
        if(m.damage||m.shred)p.attackedRound=g.round;if(m.heal)p.restedRound=g.round;
        if(m.damage)damage(g,1-who,m.damage+bonus,who,a.target);
        if(m.shred&&enemy.hp>0){const target=lowestSlot(enemy);if(target!==undefined)damage(g,1-who,m.shred,who,target);}
        if(m.heal)heal(p,m.heal);if(m.shield)p.shield=Math.min(15,p.shield+m.shield);if(m.repair)repair(g,p,m.repair);if(m.ward)p.ward=Math.min(10,p.ward+m.ward);if(m.id==='bn-move')enemy.chill=2;
        addLog(g,title(p)+'发动「'+m.name+'」，两组件本轮休眠。');break;}
      case 'immortal':{const m=getHero(p.hero).immortal;spend(p,m.cost);p.immortalRound=g.round;let extra=0;if(p.hero==='he Loulan'){extra=p.force;p.force=0;}
        if(m.damage){p.attackedRound=g.round;damage(g,1-who,m.damage+extra,who,a.target);}if(m.heal){heal(p,m.heal);p.restedRound=g.round;}
        if(m.shield)p.shield=Math.min(15,p.shield+m.shield);if(m.repair)repair(g,p,m.repair);if(m.cleanse){p.chill=0;if(p.blockedRound===g.round)p.blockedSlot=null;}
        addLog(g,title(p)+'发动人物仙蛊技能「'+m.name+'」，消耗'+m.cost+'仙元。');break;}
      case 'repair':spend(p,1);repair(g,p,2,a.slot);addLog(g,title(p)+'维护蛊虫，恢复至多2耐久。');break;
      case 'upgrade':{const s=p.slots[a.slot]!;spend(p,scaledCost(p,2));s.upgraded=true;s.durability=guMaximum(s);addLog(g,title(p)+'升炼'+getGu(s.recipe).name+'。');break;}
      case 'salvage':{const s=p.slots[a.slot]!,n=Math.max(1,Math.floor(scaledCost(p,getGu(s.recipe).cost)/2))+(p.hero==='fangyuan'?1:0);gain(p,n);p.slots[a.slot]=null;p.salvagedRound=g.round;addLog(g,title(p)+'拆解蛊虫回收'+n+currency(p)+'。');break;}
      case 'meditate':gain(p,2);p.meditatedRound=g.round;addLog(g,title(p)+'采集，获得2'+currency(p)+'。');break;
      case 'buy':{let c:HandCard;if(p.order?.card.uid===a.uid){spend(p,1);c=p.order.card;p.order=null;}else{spend(p,2);c=g.market.splice(g.market.findIndex(c=>c.uid===a.uid),1)[0];}p.hand.push(c);addLog(g,title(p)+'采购'+getHand(c.kind).name+'。');refill(g);break;}
      case 'sell':{const c=p.hand.splice(p.hand.findIndex(c=>c.uid===a.uid),1)[0];discardCard(g,c);gain(p,1);addLog(g,title(p)+'出售'+getHand(c.kind).name+'，获得1'+currency(p)+'。');break;}
      case 'hand':{
        const c=p.hand.splice(p.hand.findIndex(c=>c.uid===a.uid),1)[0],cost=handCost(p,c,!!a.useMind);if(a.useMind)p.thought--;p.qi-=cost;delete c.disturbedUntil;p.usedHand.push(c.kind);
        addLog(g,title(p)+'使用'+getHand(c.kind).name+'，消耗1行动、'+cost+'真元。');
        if(c.kind==='life')p.lifespan=Math.min(12,p.lifespan+3);
        if(c.kind==='relic'){p.stage++;p.cultivatedRound=g.round;}
        if(c.kind==='mind')p.thought=Math.min(2,p.thought+2);
        if(c.kind==='memory'){if(p.memory)discardCard(g,p.memory.card);p.memory={card:c,kind:a.memory!};addLog(g,title(p)+'铭心记录：'+getHand(a.memory!).name+'。');}
        if(c.kind==='heaven'){
          if(a.sell){const sold=p.hand.splice(p.hand.findIndex(x=>x.uid===a.sell),1)[0];discardCard(g,sold);gain(p,1);addLog(g,title(p)+'交易中出售'+getHand(sold.kind).name+'。');}
          for(const id of a.buys!){let x:HandCard;if(p.order?.card.uid===id){x=p.order.card;p.order=null;}else{spend(p,1);x=g.market.splice(g.market.findIndex(x=>x.uid===id),1)[0];}p.hand.push(x);addLog(g,title(p)+'交割'+getHand(x.kind).name+'。');}
        }
        if(c.kind==='book'){const cards=draw(g,4);g.pending={kind:'book',owner:who,card:c,cards};g.actor=who;}
        if(c.kind==='window'){spend(p,1);const options=HANDS.map(h=>h.id).filter(id=>[...g.deck,...g.discard].some(x=>x.kind===id));g.pending={kind:'window',owner:who,card:c,options};g.actor=who;}
        if(c.kind==='soul'){g.pending={kind:'soul-defense',owner:who,card:c};g.actor=1-who;}
        if(!g.pending&&c.kind!=='memory'){endCard(g,c);if(c.kind==='heaven')refill(g);}break;
      }
      case 'pass':p.ap=0;addLog(g,title(p)+'结束本轮行动。');break;
    }
    if(!g.pending)advance(g,who);
  }
  if(g.winner!==null)addLog(g,g.winner==='draw'?'双方本轮败北，本局平局。':title(g.players[g.winner])+'获胜！本局资源不带出对局。');return g;
}
export function candidateActions(g:CultGame):CultAction[]{
  if(g.winner!==null)return [];const p=g.players[g.actor],q=g.pending;
  if(q){
    if(q.kind==='book'){const xs=q.cards.map(c=>c.uid);return [{type:'chooseBook',keep:xs.slice(0,2)}];}
    if(q.kind==='window')return q.options.map(kind=>({type:'chooseOrder' as const,kind}));
    if(q.kind==='soul-defense')return [{type:'resistSoul',resist:false},...(p.thought?[{type:'resistSoul' as const,resist:true}]:[])];
    if(q.kind==='soul-mark')return [{type:'markSoul'},...(!q.resisted?q.uids.filter(id=>!consumable(g.players[1-q.owner].hand.find(c=>c.uid===id)!.kind)).map(uid=>({type:'markSoul' as const,uid})):[])];
    return [{type:'discard',uids:p.hand.slice(0,q.count).map(c=>c.uid)}];
  }
  const actions:CultAction[]=[{type:'strike'},{type:'rest'},{type:'cultivate'},{type:'ascend'},{type:'meditate'},{type:'immortal'},{type:'pass'}];
  for(let i=0;i<4;i++){actions.push({type:'activate',slot:i},{type:'repair',slot:i},{type:'upgrade',slot:i},{type:'salvage',slot:i});for(const recipe of recipes(p))if(!p.slots[i])actions.push({type:'refine',recipe,slot:i});}
  for(const move of moveRecipes(p))actions.push({type:'learn',move},{type:'move',move});
  for(const c of g.market)actions.push({type:'buy',uid:c.uid});if(p.order)actions.push({type:'buy',uid:p.order.card.uid});
  for(const c of p.hand){actions.push({type:'sell',uid:c.uid});const base={type:'hand' as const,uid:c.uid,useMind:mindEligible(c.kind)&&p.thought>0&&handCost(p,c)>0};
    if(c.kind==='memory'){for(const x of p.hand)if(memorable(x.kind))actions.push({...base,memory:x.kind});}
    else if(c.kind==='heaven'){const items=[...(p.order?[p.order.card]:[]),...g.market];for(const x of items)actions.push({...base,buys:[x.uid]});if(items.length>1)actions.push({...base,buys:items.slice(0,2).map(x=>x.uid)});}
    else actions.push(base);
  }
  return actions.filter(a=>!actionError(g,g.actor,a));
}
function cardValue(p:CultPlayer,kind:HandKind){
  if(kind==='life')return p.lifespan<=2?32:p.lifespan<=5?12:2;
  if(kind==='relic')return p.rank===5&&p.stage<3?17:0;
  if(kind==='book')return p.hand.length<5?7:3;
  if(kind==='heaven')return resource(p)>1?7:2;
  if(kind==='window')return p.lifespan<4||p.stage<3?8:3;
  if(kind==='memory')return p.memory?1:5;
  if(kind==='mind')return p.thought<2?5:0;
  return 4;
}
// Decisions use public state, own hand and already-paid private choices. Never simulate an unknown draw or inspect the opponent's hand.
export function chooseCultAI(g:CultGame):CultAction {
  const p=g.players[g.actor],e=g.players[1-g.actor],q=g.pending,trial=forecast(g,p),protect=trial?.due===g.round;
  if(q?.kind==='book')return {type:'chooseBook',keep:[...q.cards].sort((a,b)=>cardValue(p,b.kind)-cardValue(p,a.kind)).slice(0,2).map(c=>c.uid)};
  if(q?.kind==='discard')return {type:'discard',uids:[...p.hand].sort((a,b)=>cardValue(p,a.kind)-cardValue(p,b.kind)).slice(0,q.count).map(c=>c.uid)};
  if(q?.kind==='soul-defense')return {type:'resistSoul',resist:p.thought>0};
  if(q?.kind==='soul-mark'){const id=!q.resisted?q.uids.find(id=>!consumable(e.hand.find(c=>c.uid===id)!.kind)):undefined;return {type:'markSoul',uid:id||undefined};}
  let best:CultAction={type:'pass'},score=-Infinity;
  for(const a of candidateActions(g)){
    let n=-1;
    if(a.type==='chooseOrder')n=cardValue(p,a.kind);
    if(a.type==='hand'){const c=p.hand.find(c=>c.uid===a.uid)!;n=cardValue(p,c.kind);
      if(c.kind==='life'&&p.lifespan>8)n=-8;
      if(c.kind==='heaven')n=3+(a.buys??[]).reduce((sum,id)=>sum+cardValue(p,[...g.market,...(p.order?[p.order.card]:[])].find(c=>c.uid===id)!.kind)*0.5,0);
      if(c.kind==='memory')n=p.memory?0:4;
      if(c.kind==='soul')n=3;
    }
    if(a.type==='cultivate')n=p.lifespan>3?11:0;
    if(a.type==='ascend')n=p.hp>8&&p.lifespan>2?20:-5;
    if(a.type==='strike')n=e.hp<=2?100:4;
    if(a.type==='activate'){
      const r=getGu(p.slots[a.slot]!.recipe);n=r.effect==='attack'?5+(e.hp<=r.power?100:0):r.effect==='guard'?(protect?24:p.hp<14?9:1):r.effect==='heal'?(p.hp<15?15:p.hp<25?7:0):r.effect==='income'?(resource(p)<4?9:2):3;
    }
    if(a.type==='refine'){
      const r=getGu(a.recipe),existing=p.slots.filter(Boolean).map(s=>getGu(s!.recipe).effect);
      n=existing.length<3?8:2;if(r.effect==='guard'&&!existing.includes('guard'))n+=5;if(r.effect==='attack'&&existing.filter(x=>x==='attack').length<2)n+=4;if(r.effect==='heal'&&p.hp<22&&!existing.includes('heal'))n+=4;if(r.effect==='income')n-=2;
    }
    if(a.type==='learn')n=components(g,p,getMove(a.move))?9:0;
    if(a.type==='move'){const m=getMove(a.move);n=m.damage?m.damage*2+(e.hp<=m.damage?100:0):m.ward?(trial&&trial.due<=g.round+1?28:4):m.shield?(protect?25:3):p.hp<22?16:1;}
    if(a.type==='immortal'){const s=getHero(p.hero).immortal;n=s.damage?12+(e.hp<=s.damage?100:0):s.heal?(p.hp<20?18:5):protect?25:5;}
    if(a.type==='buy'){const c=p.order?.card.uid===a.uid?p.order.card:g.market.find(c=>c.uid===a.uid)!;n=cardValue(p,c.kind)*0.6+(p.order?.card.uid===a.uid?4:0);if(p.ap<2&&c.kind==='life'&&p.lifespan===0)n=-20;}
    if(a.type==='sell')n=p.hand.length>6?3:resource(p)===0?1:-6;
    if(a.type==='upgrade')n=3;
    if(a.type==='repair')n=3;
    if(a.type==='rest')n=p.hp<8?8:0;
    if(a.type==='meditate')n=resource(p)<3?10:1;
    if(a.type==='salvage')n=-8;
    if(a.type==='pass')n=-10;
    if(protect&&['cultivate','learn','refine'].includes(a.type))n-=4;
    if(p.lifespan===0&&a.type!=='hand')n-=5;
    if(n>score){score=n;best=a;}
  }
  return best;
}
export function allCards(g:CultGame):HandCard[]{
  return [...g.deck,...g.discard,...g.exiled,...g.market,...g.players.flatMap(p=>[...p.hand,...(p.order?[p.order.card]:[]),...(p.memory?[p.memory.card]:[])]),
    ...(g.pending&&g.pending.kind!=='discard'?[g.pending.card,...(g.pending.kind==='book'?g.pending.cards:[])]:[])];
}
