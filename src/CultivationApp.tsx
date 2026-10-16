import { useEffect, useRef, useState } from 'react';
import { BookOpen, Download, Flame, Pause, Play, Shield, Sparkles, Swords, X, Zap } from 'lucide-react';
import { Portrait, CardIllustration } from './ClassicArt';
import type { CardKind } from './data';
import { COMMON_GU, COMMON_MOVES, DEFAULT_GU, DEFAULT_MOVES, HEROES, RULES, TRIBULATIONS, getGu, getHero, getMove } from './cultivationData';
import type { GuRecipe, HeroId } from './cultivationData';
import { actionError, activationCost, chooseCultAI, components, createCultGame, currency, forecast, guMaximum, moveRecipes, readySlot, recipes, reduceCultGame, refinementCost, resource, scaledCost } from './cultivationEngine';
import type { CultAction, CultGame, CultPlayer } from './cultivationEngine';
import { cultivationMarkdown, cultivationPayload } from './cultivationDesign';
import { loadProfile, readCult, savedCultGame, settleProfile, writeCult } from './cultivationStorage';
import { download } from './download';

const ART:Record<string,CardKind>={attack:'attack',guard:'armor',heal:'heal',repair:'draw',income:'wine',shred:'dismantle',force:'duel'};
function GuArt({gu}:{gu:GuRecipe}){
  const kind:CardKind=gu.art==='ice'?'arrows':gu.art==='moon'?'attack':gu.art==='cloud'?'storm':gu.art==='wind'||gu.art==='wing'?'mount':ART[gu.effect];
  return <div className={`c-gu-art art-${gu.art}`}><CardIllustration kind={kind}/><span>{gu.rank===6?'仙':gu.tags[0].slice(0,1)}</span></div>;
}
function GuCard({gu,selected,onClick,small=false}:{gu:GuRecipe;selected?:boolean;onClick?:()=>void;small?:boolean}){
  return <button className={`c-card ${selected?'selected':''} ${gu.rank===6?'immortal':''} ${small?'compact':''}`} onClick={onClick} aria-pressed={!!selected} title={gu.description}>
    <span className="c-card-rank">{gu.rank===6?'六转仙蛊':`${gu.rank}转凡蛊`}</span><strong>{gu.name}</strong><GuArt gu={gu}/>
    <span className="c-card-tags">{gu.tags.join(' · ')}</span><span className="c-card-cost">炼 {gu.rank===6?Math.ceil(gu.cost/2):gu.cost} / 催 {gu.rank===6?Math.ceil(gu.activation/2):gu.activation} {gu.rank===6?'仙缘':'元石'}</span>
    {small&&<span className="c-card-description">{gu.description}</span>}
    {gu.owner&&<span className="c-exclusive">专</span>}
  </button>;
}

export default function CultivationApp({active}:{active:boolean}){
  const [game,setGame]=useState<CultGame|null>(savedCultGame);
  const [screen,setScreen]=useState<'lobby'|'battle'>(()=>savedCultGame()?'battle':'lobby');
  const [hero,setHero]=useState<HeroId>(()=>savedCultGame()?.players[0].hero??'fangyuan');
  const [loadout,setLoadout]=useState<string[]>(()=>{const a=readCult<string[]>('loadout',DEFAULT_GU);return Array.isArray(a)&&a.length===5&&new Set(a).size===5&&a.every(id=>getGu(id)&&!getGu(id).owner)?a:DEFAULT_GU;});
  const [moves,setMoves]=useState<string[]>(()=>{const a=readCult<string[]>('moves',DEFAULT_MOVES);return Array.isArray(a)&&a.length===2&&new Set(a).size===2&&a.every(id=>getMove(id)&&!getMove(id).owner)?a:DEFAULT_MOVES;});
  const [profile,setProfile]=useState(loadProfile);
  const [paused,setPaused]=useState(false),[speed,setSpeed]=useState(650),[auto,setAuto]=useState(false);
  const [modal,setModal]=useState<'rules'|'design'|'restart'|null>(null);
  const [selected,setSelected]=useState('moon'),[ownSlot,setOwnSlot]=useState(1),[target,setTarget]=useState<number|undefined>();
  const [hint,setHint]=useState(''),[saved,setSaved]=useState(true);
  const logBox=useRef<HTMLDivElement>(null);
  const me=game?.players[0],enemy=game?.players[1],acting=!!game&&game.actor===0&&game.winner===null&&!paused&&!auto;
  const chosen=getHero(hero),unlocked=profile.completed>=chosen.unlockAfter;
  useEffect(()=>{if(game)setSaved(writeCult('game',game));},[game]);
  useEffect(()=>{writeCult('loadout',loadout);writeCult('moves',moves);},[loadout,moves]);
  useEffect(()=>{if(game&&game.winner!==null)setProfile(p=>{const next=settleProfile(p,game);if(next!==p)writeCult('profile',next);return next;});},[game]);
  useEffect(()=>{
    if(!game||game.winner!==null||paused||modal||!active||screen!=='battle'||game.actor===0&&!auto)return;
    const timer=setTimeout(()=>setGame(g=>g&&g.winner===null?reduceCultGame(g,g.actor,chooseCultAI(g)):g),speed);return()=>clearTimeout(timer);
  },[game,paused,modal,active,screen,speed,auto]);
  useEffect(()=>{if(logBox.current)logBox.current.scrollTop=logBox.current.scrollHeight;if(game&&target!==undefined&&!game.players[1].slots[target])setTarget(undefined);},[game,target]);
  function start(){setGame(createCultGame(hero,loadout,moves));setScreen('battle');setPaused(false);setAuto(false);setTarget(undefined);setOwnSlot(1);setHint('');setModal(null);}
  function act(a:CultAction){
    if(!game||!acting)return;
    const error=actionError(game,0,a);if(error){setHint(error);return;}
    setGame(reduceCultGame(game,0,a));setHint('');
  }
  function toggle(id:string,items:string[],set:(xs:string[])=>void,limit:number){
    if(items.includes(id))set(items.filter(x=>x!==id));else if(items.length<limit)set([...items,id]);else setHint(`先取消一项，再选择新的配方（最多${limit}项）。`);
  }
  function button(label:string,a:CultAction,primary=false){
    const reason=game?actionError(game,0,a):'尚未开局';
    return <button className={primary?'c-primary':'c-action'} disabled={!acting||!!reason} title={reason??label} onClick={()=>act(a)}>{label}</button>;
  }
  const inspected=getGu(selected);
  const detailed=me?me.slots[ownSlot]:null;

  function playerPanel(p:CultPlayer,index:number){
    if(!game)return null;
    const h=getHero(p.hero),f=forecast(game,p);
    return <section className={`c-player ${index===0?'self':'opponent'} ${game.actor===index&&game.winner===null?'turn':''} ${p.rank===6?'ascended':''}`}>
      <div className="c-portrait"><Portrait id={h.portrait}/><span>{h.name}</span><i>{p.rank===6?'六转蛊仙':`${p.rank}转蛊师`}</i></div>
      <div className="c-player-info"><div className="c-player-title"><strong>{index===0?'你':'对手 AI'} · {h.name}</strong><span>{p.ap} / 3 行动</span></div>
        <div className="c-life" aria-label={`${index===0?'你':'对手'}的生命 ${p.hp}/30`}><i style={{width:`${p.hp/30*100}%`}}/><b>{p.hp} / 30</b></div>
        <div className="c-resource"><span className={p.rank===6?'essence':''}><Sparkles size={14}/>{resource(p)} / {p.rank===6?6:12} {currency(p)}</span><span><Shield size={14}/>{p.shield} 护盾</span><span>◈ {p.ward} 护劫</span></div>
        <div className="c-statuses"><span title={h.talentText}>{h.talent} · {h.path}</span>{p.force>0&&<span>力势 {p.force}</span>}{p.chill>0&&<span>寒意 {p.chill}/2</span>}{p.rank===6&&p.yuan>0&&<span>封存 {p.yuan} 元石</span>}</div>
        {f?<div className={`c-forecast ${f.due<=game.round+1?'urgent':''}`}><Flame size={16}/><div><b>{f.name} · 第{f.due}轮末 / {Math.max(0,f.due-game.round)}轮后</b><small>{f.detail} {p.rank===6?`强度${f.strength}。`:''}</small></div></div>:<p className="c-player-note">五转后可宣告升仙，下一完整准备轮末渡劫。</p>}
      </div>
    </section>;
  }
  function board(p:CultPlayer,index:number){
    if(!game)return null;
    return <div className={`c-board ${index===1?'enemy-board':''}`}>
      {p.slots.map((s,i)=>{const r=s?getGu(s.recipe):null,blocked=p.blockedRound===game.round&&p.blockedSlot===i;
        return <button key={i} aria-label={`${index===0?'己方':'敌方'}蛊位${i+1}${r?` ${r.name}`:' 空位'}`} className={`c-slot ${s?'occupied':''} ${index===0&&ownSlot===i?'chosen':''} ${index===1&&target===i?'targeted':''} ${s&&!readySlot(game,p,i)?'exhausted':''} ${r?.rank===6?'immortal':''}`} onClick={()=>{if(index===0){setOwnSlot(i);if(r)setSelected(r.id);}else if(s)setTarget(target===i?undefined:i);}}>
          <span className="c-slot-number">{i+1}号蛊位 {blocked?'· 风灾封锁':s?.usedRound===game.round?'· 本轮休眠':''}</span>
          {r&&s?<><GuArt gu={r}/><strong>{r.name}{s.upgraded?'·升炼':''}</strong><div className="c-durability"><i style={{width:`${s.durability/guMaximum(s)*100}%`}}/></div><small>耐久 {s.durability}/{guMaximum(s)} · 催 {activationCost(p,r.id)}{currency(p)}</small><span className="c-slot-tags">{r.tags.join(' / ')}</span></>:<span className="c-empty">＋<small>{index===0?'选择此位炼蛊':'空蛊位'}</small></span>}
        </button>;
      })}
    </div>;
  }

  return <div className="cult">
    <header className="c-header"><button className="c-brand" onClick={()=>setScreen('lobby')}><span>蛊</span><div>升仙对决<small>天地为炉 · 万蛊成道</small></div></button><nav>
      {game&&<button onClick={()=>setScreen('battle')}>继续对局</button>}<button onClick={()=>setModal('rules')}><BookOpen size={15}/>玩法指南</button><button onClick={()=>setModal('design')}>设计与修改清单</button>
    </nav><span className="c-version">v2.0.0 · 规则原型</span></header>
    {!saved&&<p className="c-warning">浏览器未能保存存档，本次仍可游玩；关闭页面后可能无法恢复。</p>}
    {screen==='lobby'?<main className="c-lobby">
      <section className="c-intro"><span className="c-eyebrow">全新原创规则 / 单人对战 AI</span><h1>炼一身蛊，<br/>争一线<span>仙缘。</span></h1><p>从一转蛊师起步，经营元石、组合蛊虫。<br/>升仙之前准备渡劫，成仙之后仍须步步为营。</p><div className="c-principles"><span>局内获取全部资源</span><span>通用配方全部开放</span><span>账号仅解锁人物</span></div><div className="c-intro-stats"><strong>{profile.completed}<small>已完成对局</small></strong><strong>{profile.wins}<small>获胜场次</small></strong><strong>{HEROES.filter(h=>profile.completed>=h.unlockAfter).length}/4<small>永久可用人物</small></strong></div><div className="c-tribulation-sequence"><small>周期灾劫 · 双方独立计数</small><div>{TRIBULATIONS.map((t,i)=><span key={t.id}>{i+1}. {t.name}</span>)}</div><p>公开预告 · 三轮一劫 · 强度递增</p></div></section>
      <section className="c-setup"><div className="c-section-label">01 / 选择人物 <small>专属体系随人物完整开放</small></div><div className="c-heroes">{HEROES.map(h=><button key={h.id} className={`c-hero-option ${hero===h.id?'selected':''}`} aria-pressed={hero===h.id} onClick={()=>{setHero(h.id);setHint('');}}><Portrait id={h.portrait}/><strong>{h.name}</strong><span>{h.path}</span>{profile.completed<h.unlockAfter&&<i>完成{h.unlockAfter}局解锁</i>}</button>)}</div><div className="c-talent"><b>{chosen.talent}</b><p>{chosen.talentText}</p></div><p className="c-plan">{chosen.plan}</p><div className="c-exclusive-list">专属：{chosen.exclusive.map(id=>getGu(id).name).join(' / ')}<br/>杀招：{getMove(chosen.move).name} · {getMove(chosen.move).description}</div>
      <div className="c-section-label">02 / 通用蛊方 <small>已选{loadout.length}/5 · 紫框为六转仙蛊</small></div><div className="c-loadout-grid">{COMMON_GU.map(r=><GuCard key={r.id} gu={r} small selected={loadout.includes(r.id)} onClick={()=>toggle(r.id,loadout,setLoadout,5)}/>)}</div>
      <div className="c-section-label">03 / 通用杀招 <small>已选{moves.length}/2</small></div><div className="c-move-selection">{COMMON_MOVES.map(m=><button key={m.id} className={moves.includes(m.id)?'selected':''} aria-pressed={moves.includes(m.id)} onClick={()=>toggle(m.id,moves,setMoves,2)}><b>{m.name}</b><small>{m.needs.join('＋')} · {m.rank}转</small><p>{m.description}</p></button>)}</div>
      {hint&&<p role="status" className="c-hint">{hint}</p>}<div className="c-start-row"><button className="c-primary" disabled={loadout.length!==5||moves.length!==2} onClick={()=>game&&game.winner===null?setModal('restart'):start()}>{unlocked?'踏入仙途':'试玩此人物'} <Swords size={17}/></button><button className="c-action" onClick={()=>{setLoadout(DEFAULT_GU);setMoves(DEFAULT_MOVES);setHint('已恢复通用默认构筑。');}}>恢复默认构筑</button></div><p className="c-footnote">方源、白凝冰初始开放；完成1局解锁黑楼兰，完成2局解锁太白云生。试玩也可正常结算。人物无等级或永久属性。</p></section>
    </main>:game&&me&&enemy?<main className="c-battle-layout"><section className="c-arena"><div className="c-arena-top"><span><b>第 {game.round} 轮</b> · {game.winner!==null?'对局结束':game.actor===0?'你的行动':'对手行动'}</span><div><button aria-label={paused?'继续 AI':'暂停 AI'} onClick={()=>setPaused(!paused)}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><select aria-label="AI速度" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={1000}>从容</option><option value={650}>标准</option><option value={150}>快速</option></select><button onClick={()=>setModal('restart')}>重新开局</button></div></div>
      {playerPanel(enemy,1)}<div className="c-target-row"><span>攻击目标</span><button className={target===undefined?'active':''} onClick={()=>setTarget(undefined)}>敌方人物</button><small>{target===undefined?'点击敌方蛊虫，可改为拆除组件':`已锁定敌方${target+1}号蛊位`}</small></div>{board(enemy,1)}
      <div className="c-center-line"><span>蛊 虫 为 基 · 杀 招 成 势</span><small>{game.round>=18?'天地压迫已开始':`第18轮起天地压迫 · 当前先手：${getHero(game.players[game.initiative].hero).name}`}</small></div>
      {board(me,0)}{playerPanel(me,0)}
      <div className="c-action-bar"><div><b>{paused?'对局已暂停':auto?'AI正在托管你的人物':acting?'选择蛊虫，执行一次行动':'等待对手行动'}</b><small>{hint||`己方${ownSlot+1}号蛊位${detailed?`：${getGu(detailed.recipe).name}`:'：空位'} · ${target===undefined?'攻击敌方人物':`攻击敌方${target+1}号蛊位`}`}</small></div><div>{button(`升转${me.rank<5?` · ${RULES.cultivationCosts[me.rank]}元石`:''}`,{type:'cultivate'})}{button('宣告升仙 · 5元石',{type:'ascend'})}{button('凝元 +1',{type:'meditate'})}{button('结束本轮',{type:'pass'})}</div></div>
      <div className="c-current-gu"><b>当前蛊位操作</b>{button(`催动${detailed?` · ${activationCost(me,detailed.recipe)}${currency(me)}`:''}`,{type:'activate',slot:ownSlot,target},true)}{button('维护 · 1资源',{type:'repair',slot:ownSlot})}{button('升炼 · 数值+1',{type:'upgrade',slot:ownSlot})}{button('拆解回收',{type:'salvage',slot:ownSlot})}</div>
      {game.winner!==null&&<div className="c-result" role="status"><Sparkles/><strong>{game.winner==='draw'?'本局平局':game.winner===0?'你赢得了这场仙途之争':'本局落败，重整蛊方再战'}</strong><p>本局资源结清 · 已完成{profile.completed}局 · {profile.completed>=2?'四个人物均已解锁':profile.completed>=1?'黑楼兰已解锁，完成2局可解锁太白云生':'完成对局可解锁新人物'}</p><button className="c-primary" onClick={()=>setScreen('lobby')}>调整构筑</button></div>}
      <section className="c-recipe-panel"><div className="c-section-label">随身蛊方 <small>点击查看，再炼入选中位置</small></div><div className="c-recipe-row">{recipes(me).map(id=><GuCard key={id} gu={getGu(id)} selected={selected===id} onClick={()=>setSelected(id)}/>)}</div><div className="c-inspector"><div><b>{inspected?.name}</b><p>{inspected?.description}</p><small>成仙后改用仙缘；升炼及仙缘驱动会增加适用效果的数值。</small></div>{inspected&&recipes(me).includes(inspected.id)&&button(`炼入${ownSlot+1}号位 · ${refinementCost(game,me,inspected.id)}${currency(me)}${detailed?'（替换旧蛊）':''}`,{type:'refine',recipe:inspected.id,slot:ownSlot},true)}</div></section>
      <section className="c-killers"><div className="c-section-label">杀招配方 <small>两只不同组件 · 发动后本轮休眠</small></div><div className="c-killer-grid">{moveRecipes(me).map(id=>{const m=getMove(id),parts=components(game,me,m),learned=me.learned.includes(id);return <article key={id}><span>{m.owner?'专属杀招':'通用杀招'} · {m.rank}转</span><h3>{m.name}</h3><small>{m.needs.join(' ＋ ')}</small><p>{m.description}</p><div className="c-components">{parts?`组件就绪：${parts.map(i=>getGu(me.slots[i]!.recipe).name).join('＋')}`:'组件不足或本轮已休眠'}</div>{learned?button(`发动 · ${scaledCost(me,m.cost)}${currency(me)}`,{type:'move',move:id,target},true):button(`参悟 · ${scaledCost(me,m.research)}${currency(me)}`,{type:'learn',move:id})}<small>{(me.cooldowns[id]??0)>game.round?`冷却至第${me.cooldowns[id]}轮`:'发动后间隔1轮恢复'}</small></article>;})}</div></section>
    </section><aside className="c-sidebar"><div className="c-side-title"><Zap size={17}/>仙途战报<button onClick={()=>download('升仙对决-战报.json',JSON.stringify(game,null,2),'application/json')}>导出</button></div><div className="c-logs" ref={logBox} aria-live="polite">{game.logs.map(l=><p key={l.id}><small>{String(l.id).padStart(2,'0')}</small>{l.text}</p>)}</div><div className="c-side-help"><b>对手公开构筑</b><p>{recipes(enemy).map(id=>getGu(id).name).join(' · ')}</p><small>杀招：{moveRecipes(enemy).map(id=>getMove(id).name).join(' / ')}</small><b>渡劫规则</b><p>五转宣告 → 完整准备轮 → 升仙地劫 → 六转。成仙后每三轮渡劫，按各自渡劫次数递增强度。</p><button className="c-action" onClick={()=>setAuto(!auto)} disabled={game.winner!==null}>{auto?'收回人物控制':'托管人物给 AI'}</button><small>托管使用相同公开信息与资源规则。离开此模式会暂停AI。</small></div></aside></main>:null}
    <footer className="c-footer">蛊真人同人策略卡牌 · 原创规则与SVG插画 · 单人本地存档<span>元石 / 仙缘仅存在于本局 · 人物完整解锁</span></footer>
    {modal&&<div className="c-modal-backdrop" onClick={()=>setModal(null)}><section className={`c-modal ${modal==='design'?'wide':''}`} role="dialog" aria-modal="true" aria-label={modal==='rules'?'升仙对决玩法指南':modal==='design'?'设计与修改清单':'重新开局'} onClick={e=>e.stopPropagation()}><button className="c-close" aria-label="关闭" onClick={()=>setModal(null)}><X size={20}/></button>
      {modal==='restart'?<><h2>开始一场新对局</h2><p>当前新模式对局将由新局替换。经典身份局存档独立保留。</p><button className="c-primary" onClick={start}>确认开局</button></>:modal==='design'?<><h2>设计与修改清单</h2><p>这里是本版实际规则。可按人物N、蛊虫U、杀招K编号反馈修改。</p><div className="c-downloads"><button className="c-action" onClick={()=>download('升仙对决-设计清单.md',cultivationMarkdown())}><Download size={15}/>下载完整清单</button><button className="c-action" onClick={()=>download('升仙对决-修改表.json',JSON.stringify(cultivationPayload(),null,2),'application/json')}>下载修改表 JSON</button></div><pre>{cultivationMarkdown()}</pre></>:<><h2>升仙对决 · 玩法指南</h2><p>胜利目标：使对方生命归零。双方30生命、一转和免费本命蛊开局。每轮3次行动，交替执行；双方行动用尽后换轮，交换先手。</p><ol><li>选择空蛊位，再点随身蛊方，花元石炼入；选中己方蛊虫，点「催动」发动。点击敌蛊可指定攻击组件。</li><li>每轮补给5元石，上限12。升转也消耗元石和行动；升到三转可以升炼蛊虫。资源与蛊虫不会带出对局。</li><li>先参悟杀招，再凑齐两只不同、尚可用的组件发动。组件本轮休眠，杀招间隔一轮恢复。</li><li>五转可花5元石宣告升仙。下一完整轮末承受6点地劫；用护盾或护劫屏障准备。存活后六转，开始产出仙缘。</li><li>成仙后元石封存，每轮补给3仙缘，上限6，所有费用按元石的一半向上取整；开放仙蛊，适用催动效果+1。</li><li>成仙后每三轮渡一次灾劫：雷、火、蚀元、风，循环增强。护盾轮末渡劫后清空，护劫屏障跨轮保留。</li><li>第18轮起天地压迫，双方持续损失生命。完成对局解锁人物，通用配方一开始全部开放。</li></ol><p>首版防御采用主动护盾；没有手动响应、联网、七至九转或局外资源成长。数值仍需试玩调整。</p><button className="c-primary" onClick={()=>setModal(null)}>开始筹谋</button></>}
    </section></div>}
  </div>;
}
