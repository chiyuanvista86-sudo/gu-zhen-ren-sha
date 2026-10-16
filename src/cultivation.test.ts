import { describe, expect, it } from 'vitest';
import { DEFAULT_GU, DEFAULT_MOVES, GU, HEROES, MOVES, RULES, getGu } from './cultivationData';
import { actionError, activationCost, chooseCultAI, components, createCultGame, forecast, guMaximum, reduceCultGame, resource } from './cultivationEngine';
import type { CultGame } from './cultivationEngine';
import { settleProfile, validCultSave } from './cultivationStorage';

function game(){const g=createCultGame('fangyuan',DEFAULT_GU,DEFAULT_MOVES,10,'baininbing');g.actor=0;return g;}
function addGu(g:CultGame,who:number,slot:number,id:string){g.players[who].slots[slot]={recipe:id,durability:getGu(id).durability,upgraded:false,usedRound:0};}
function finishRound(g:CultGame){let s=g;while(s.winner===null&&s.round===g.round)s=reduceCultGame(s,s.actor,{type:'pass'});return s;}

describe('升仙对决：资源、构筑和行动',()=>{
  it('双方同一起点，只有人物天赋与配方不同',()=>{
    const g=game();for(const p of g.players){expect(p.hp).toBe(30);expect(p.rank).toBe(1);expect(p.yuan).toBe(5);expect(p.essence).toBe(0);expect(p.ap).toBe(3);expect(p.slots.filter(Boolean)).toHaveLength(1);}
    expect(validCultSave(JSON.parse(JSON.stringify(g)))).toBe(true);
    expect(validCultSave({...g,version:1})).toBe(false);
  });
  it('拒绝未携带、重复、专属越权与数量错误的构筑',()=>{
    expect(()=>createCultGame('fangyuan',['moon'],DEFAULT_MOVES)).toThrow();
    expect(()=>createCultGame('fangyuan',['moon','moon','grass','repair','wine'],DEFAULT_MOVES)).toThrow();
    expect(()=>createCultGame('fangyuan',['bn-guard','armor','grass','repair','wine'],DEFAULT_MOVES)).toThrow();
    const g=game();expect(reduceCultGame(g,0,{type:'refine',recipe:'bn-guard',slot:1})).toBe(g);
  });
  it('非法操作不变更原状态或消耗资源',()=>{
    const g=game(),copy=JSON.stringify(g);g.players[0].yuan=0;const snapshot=JSON.stringify(g);
    expect(reduceCultGame(g,0,{type:'refine',recipe:'moon',slot:1})).toBe(g);
    expect(reduceCultGame(g,1,{type:'pass'})).toBe(g);
    expect(reduceCultGame(g,0,{type:'activate',slot:7})).toBe(g);
    expect(JSON.stringify(g)).toBe(snapshot);expect(copy).not.toBe(snapshot);
  });
  it('交替行动，拒绝重复催动，每轮总行动有限',()=>{
    const g=game(),next=reduceCultGame(g,0,{type:'activate',slot:0});
    expect(g.players[1].hp).toBe(30);expect(next.players[1].hp).toBe(28);expect(next.actor).toBe(1);expect(next.players[0].ap).toBe(2);
    const again=reduceCultGame(next,1,{type:'pass'});expect(actionError(again,0,{type:'activate',slot:0})).toMatch(/本轮/);
  });
  it('炼制折扣仅每轮首次，替换不退款且同名不重复',()=>{
    let g=game();g.players[1].ap=0;
    g=reduceCultGame(g,0,{type:'refine',recipe:'moon',slot:1});expect(g.players[0].yuan).toBe(4);
    expect(actionError(g,0,{type:'refine',recipe:'moon',slot:2})).toMatch(/同名/);
    g=reduceCultGame(g,0,{type:'refine',recipe:'armor',slot:1});expect(g.players[0].yuan).toBe(2);expect(g.players[0].slots[1]?.recipe).toBe('armor');
  });
  it('不能提前用仙蛊；升转不增加元石补给',()=>{
    let g=game();expect(actionError(g,0,{type:'refine',recipe:'fy-break',slot:1})).toBe('需要6转');
    g.players[1].ap=0;g=reduceCultGame(g,0,{type:'cultivate'});expect(g.players[0].rank).toBe(2);
    expect(actionError(g,0,{type:'cultivate'})).toMatch(/每轮/);
    const before=g.players[0].yuan;g=finishRound(g);expect(g.players[0].yuan).toBe(Math.min(12,before+5));
  });
  it('护盾保护指定蛊虫，组件可被摧毁',()=>{
    const g=game();g.players[1].shield=1;g.players[1].slots[0]!.durability=1;
    const next=reduceCultGame(g,0,{type:'activate',slot:0,target:0});expect(next.players[1].slots[0]).toBeNull();expect(next.players[1].hp).toBe(30);expect(next.players[1].shield).toBe(0);
  });
  it('寒意仅增加下一次催动费用，付费后清空',()=>{
    const g=game();g.players[0].chill=2;expect(activationCost(g.players[0],'fy-core')).toBe(2);
    const next=reduceCultGame(g,0,{type:'activate',slot:0});expect(next.players[0].yuan).toBe(3);expect(next.players[0].chill).toBe(0);
  });
  it('升炼恢复耐久并增加数值，拆解每轮最多一次',()=>{
    let g=game();g.players[0].rank=3;g.players[1].ap=0;g.players[0].slots[0]!.durability=1;
    g=reduceCultGame(g,0,{type:'upgrade',slot:0});expect(g.players[0].slots[0]!.durability).toBe(5);expect(guMaximum(g.players[0].slots[0]!)).toBe(5);
    g=reduceCultGame(g,0,{type:'salvage',slot:0});expect(g.players[0].slots[0]).toBeNull();
    expect(actionError(g,0,{type:'salvage',slot:1})).toBeTruthy();
  });
  it('每轮经营收益受限制，凝元不能无限使用',()=>{
    let g=game();g.players[1].ap=0;addGu(g,0,1,'wine');g=reduceCultGame(g,0,{type:'activate',slot:1});expect(g.players[0].yuan).toBe(6);
    g=reduceCultGame(g,0,{type:'meditate'});expect(actionError(g,0,{type:'meditate'})).toMatch(/每轮/);
  });
});

describe('杀招必须使用两只不同且可用的组件',()=>{
  it('同一只双标签蛊不能兼任两个组件，使用过的组件不可参与',()=>{
    const g=game(),m=MOVES.find(m=>m.id==='fy-move')!;expect(components(g,g.players[0],m)).toBeNull();
    addGu(g,0,1,'moon');expect(components(g,g.players[0],m)).toEqual([0,1]);
    g.players[0].slots[1]!.usedRound=g.round;expect(components(g,g.players[0],m)).toBeNull();
  });
  it('参悟和发动分别收费，组件休眠，冷却不可绕过',()=>{
    let g=game();g.players[0].rank=3;g.players[0].yuan=12;g.players[1].ap=0;addGu(g,0,1,'moon');
    g=reduceCultGame(g,0,{type:'learn',move:'slash'});expect(g.players[0].yuan).toBe(10);
    g=reduceCultGame(g,0,{type:'move',move:'slash'});expect(g.players[0].yuan).toBe(7);expect(g.players[1].hp).toBe(24);
    expect(g.players[0].slots[0]!.usedRound).toBe(1);expect(g.players[0].slots[1]!.usedRound).toBe(1);
    expect(actionError(g,0,{type:'move',move:'slash'})).toMatch(/第3轮/);
  });
  it('黑楼兰杀招消耗原有力势，再由本轮首次伤害获得新的一层',()=>{
    const g=createCultGame('he Loulan',DEFAULT_GU,DEFAULT_MOVES,10,'fangyuan');g.actor=0;g.players[0].rank=3;g.players[0].force=3;g.players[0].learned=['hl-move'];addGu(g,0,1,'moon');
    const next=reduceCultGame(g,0,{type:'move',move:'hl-move'});expect(next.players[1].hp).toBe(23);expect(next.players[0].force).toBe(1);
  });
});

describe('升仙与周期灾劫',()=>{
  it('宣告后留完整准备轮，成功前没有仙缘，成功后独立补给且不回血',()=>{
    let g=game();g.players[0].rank=5;g.players[0].yuan=12;
    g=reduceCultGame(g,0,{type:'ascend'});expect(g.players[0].ascensionDue).toBe(2);expect(g.players[0].rank).toBe(5);expect(g.players[0].essence).toBe(0);
    g=finishRound(g);expect(g.round).toBe(2);expect(g.players[0].rank).toBe(5);
    g=finishRound(g);expect(g.round).toBe(3);expect(g.players[0].rank).toBe(6);expect(g.players[0].hp).toBe(24);expect(g.players[0].essence).toBe(5);expect(g.players[0].nextTribulation).toBe(5);
    const yuan=g.players[0].yuan;g=finishRound(g);expect(g.players[0].yuan).toBe(yuan);expect(g.players[0].essence).toBe(6);
  });
  it('护盾在渡劫后才清空，护劫屏障跨轮保留',()=>{
    let g=game();g.players[0].rank=5;g.players[0].ascensionDue=1;g.players[0].shield=2;g.players[0].ward=5;
    g=finishRound(g);expect(g.players[0].hp).toBe(30);expect(g.players[0].rank).toBe(6);expect(g.players[0].ward).toBe(0);expect(g.players[0].shield).toBe(0);
    g.players[0].ward=8;g=finishRound(g);expect(g.players[0].ward).toBe(8);
  });
  it('升仙失败直接判负，不会先发仙缘或回满生命',()=>{
    const g=game();g.players[0].hp=6;g.players[0].rank=5;g.players[0].ascensionDue=1;
    const next=finishRound(g);expect(next.winner).toBe(1);expect(next.players[0].rank).toBe(5);expect(next.players[0].essence).toBe(0);
  });
  it('双方同轮渡劫阵亡为平局',()=>{
    const g=game();g.players.forEach(p=>{p.hp=6;p.rank=5;p.ascensionDue=1;});expect(finishRound(g).winner).toBe('draw');
  });
  it('周期三轮一次、双方独立计数，灾劫逐渐增强',()=>{
    let g=game();g.players[0].rank=6;g.players[0].essence=3;g.players[0].nextTribulation=1;
    expect(forecast(g,g.players[0])?.name).toBe('九霄雷劫');g=finishRound(g);
    expect(g.players[0].hp).toBe(26);expect(g.players[0].trials).toBe(1);expect(g.players[0].nextTribulation).toBe(4);expect(g.players[1].trials).toBe(0);
    expect(forecast(g,g.players[0])?.strength).toBe(6);
  });
  it('地火打击两只不同蛊；风灾封位；蚀元扣下一轮收入',()=>{
    let fire=game();fire.players[0].rank=6;fire.players[0].trials=1;fire.players[0].nextTribulation=1;addGu(fire,0,1,'moon');fire=finishRound(fire);
    expect(fire.players[0].slots[1]).toBeNull();expect(fire.players[0].slots[0]!.durability).toBe(1);expect(fire.players[0].hp).toBe(28);
    let wind=game();wind.players[0].rank=6;wind.players[0].trials=3;wind.players[0].nextTribulation=1;wind=finishRound(wind);wind.actor=0;
    expect(wind.players[0].blockedRound).toBe(2);expect(actionError(wind,0,{type:'activate',slot:0})).toMatch(/封锁/);
    let erosion=game();erosion.players[0].rank=6;erosion.players[0].essence=0;erosion.players[0].trials=2;erosion.players[0].nextTribulation=1;erosion=finishRound(erosion);expect(erosion.players[0].essence).toBe(2);
  });
  it('仙蛊成仙后可炼制，封存元石不能支付仙人费用',()=>{
    let g=game();g.players[0].rank=6;g.players[0].yuan=12;g.players[0].essence=0;
    expect(actionError(g,0,{type:'refine',recipe:'fy-break',slot:1})).toMatch(/仙缘/);
    g.players[0].essence=6;g=reduceCultGame(g,0,{type:'refine',recipe:'fy-break',slot:1});expect(g.players[0].slots[1]?.recipe).toBe('fy-break');expect(g.players[0].yuan).toBe(12);
  });
  it('长局压迫不会被护盾或护劫屏障抵消，终局不能继续操作',()=>{
    let g=game();g.round=18;g.players.forEach(p=>{p.hp=2;p.ward=10;p.shield=15;});g=finishRound(g);expect(g.winner).toBe('draw');expect(reduceCultGame(g,g.actor,{type:'meditate'})).toBe(g);
  });
});

describe('人物解锁与完整AI对局',()=>{
  it('完赛仅累积人物解锁进度，同一对局不能重复结算',()=>{
    const g=game();let p={completed:0,wins:0,settled:[] as string[]};expect(settleProfile(p,g)).toBe(p);
    g.winner=0;p=settleProfile(p,g);expect(p.completed).toBe(1);expect(p.wins).toBe(1);expect(settleProfile(p,g)).toBe(p);expect(Object.keys(p).sort()).toEqual(['completed','settled','wins']);
  });
  it('卡牌定义、归属、配方和数值自洽',()=>{
    expect(GU.filter(g=>!g.owner)).toHaveLength(12);expect(MOVES.filter(m=>!m.owner)).toHaveLength(6);
    expect(new Set(GU.map(g=>g.id)).size).toBe(GU.length);
    for(const h of HEROES){expect(h.exclusive).toHaveLength(3);expect(h.exclusive.every(id=>getGu(id).owner===h.id)).toBe(true);expect(h.exclusive.filter(id=>getGu(id).rank===6)).toHaveLength(1);}
  });
  it('32个不同种子整局均可结束，包含成仙与周期渡劫，无负资源或非法行动',()=>{
    let ascensions=0,tribulations=0;
    const rounds:number[]=[];
    for(let seed=1;seed<=32;seed++){
      let g=createCultGame(HEROES[seed%4].id,DEFAULT_GU,DEFAULT_MOVES,seed);
      let steps=0;
      while(g.winner===null&&steps++<200){
        const action=chooseCultAI(g);expect(actionError(g,g.actor,action)).toBeNull();const next=reduceCultGame(g,g.actor,action);expect(next).not.toBe(g);g=next;
        for(const p of g.players){expect(resource(p)).toBeGreaterThanOrEqual(0);expect(resource(p)).toBeLessThanOrEqual(p.rank===6?6:12);expect(p.ap).toBeGreaterThanOrEqual(0);expect(p.ap).toBeLessThanOrEqual(3);expect(p.hp).toBeGreaterThanOrEqual(0);for(const s of p.slots)if(s){expect(s.durability).toBeGreaterThan(0);expect(s.durability).toBeLessThanOrEqual(guMaximum(s));}}
      }
      expect(g.winner).not.toBeNull();expect(g.round).toBeLessThanOrEqual(RULES.maxRound);ascensions+=g.players.filter(p=>p.rank===6).length;tribulations+=g.players.reduce((n,p)=>n+p.trials,0);rounds.push(g.round);
    }
    console.log(`升仙对决32局：平均${(rounds.reduce((a,b)=>a+b,0)/32).toFixed(1)}轮，${ascensions}人次成仙，${tribulations}次周期渡劫。`);
    expect(ascensions).toBeGreaterThan(0);expect(tribulations).toBeGreaterThan(0);
  },60000);
});
