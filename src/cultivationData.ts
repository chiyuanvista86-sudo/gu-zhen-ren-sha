import type { GeneralId } from './data';
export const GAME_NAME = '蛊道争仙';
export const GAME_VERSION = '3.1.0';
export type HeroId = 'fangyuan' | 'baininbing' | 'he Loulan' | 'taibai';
export type GuEffect = 'attack' | 'guard' | 'heal' | 'repair' | 'income' | 'shred';
export interface GuRecipe {
  id:string; name:string; owner?:HeroId; rank:number; cost:number; activation:number;
  durability:number; effect:GuEffect; power:number; tags:string[]; art:string; description:string;
}
export interface MoveRecipe {
  id:string; name:string; owner?:HeroId; rank:number; research:number; cost:number; needs:string[];
  cooldown:number; damage?:number; shield?:number; heal?:number; repair?:number; shred?:number; ward?:number; description:string;
}
export interface ImmortalSkill { id:string; name:string; cost:number; damage?:number; heal?:number; shield?:number; repair?:number; cleanse?:boolean; description:string }
export interface CultHero {
  id:HeroId; portrait:GeneralId; name:string; path:string; color:string; talent:string; talentText:string;
  core:string; exclusive:string[]; move:string; immortal:ImmortalSkill; plan:string; unlockAfter:number;
}
export const RULES = {
  version:3, life:30, lifespan:8, lifespanCap:12, actions:3, slots:4, yuanIncome:2, yuanCap:10,
  immortalIncome:3, immortalCap:6, ascensionCost:4, initialTribulation:6, tribulationInterval:3,
  maxRound:26, commonLoadout:5, moveLoadout:2, handLimit:6, copies:8,
} as const;
export const STAGES = ['初阶','中阶','高阶','巅峰'] as const;
export const GU:GuRecipe[] = [
  {id:'fy-core',name:'逆炼蛊',owner:'fangyuan',rank:5,cost:2,activation:2,durability:4,effect:'attack',power:2,tags:['攻击','炼道'],art:'refine',description:'造成2点伤害，占用本轮攻伐机会。此蛊为同人战斗组件。'},
  {id:'fy-repair',name:'回炉蛊',owner:'fangyuan',rank:5,cost:3,activation:1,durability:3,effect:'repair',power:2,tags:['恢复','炼道'],art:'mend',description:'修复己方耐久损失最多的一只蛊虫2点。'},
  {id:'bn-core',name:'冰刃蛊',owner:'baininbing',rank:5,cost:2,activation:2,durability:4,effect:'attack',power:2,tags:['攻击','冰道'],art:'ice',description:'造成2点伤害；本轮首次有效伤害附加1层寒意。'},
  {id:'bn-guard',name:'冰甲蛊',owner:'baininbing',rank:5,cost:2,activation:1,durability:4,effect:'guard',power:4,tags:['防御','冰道'],art:'armor',description:'获得4点本轮护盾，保护人物及蛊虫，也可抵挡灾劫。'},
  {id:'hl-core',name:'熊力蛊',owner:'he Loulan',rank:5,cost:2,activation:2,durability:4,effect:'attack',power:2,tags:['攻击','力道'],art:'force',description:'造成2点伤害；本轮首次有效伤害积累1层力势。'},
  {id:'hl-bone',name:'铁骨蛊',owner:'he Loulan',rank:5,cost:3,activation:1,durability:5,effect:'guard',power:4,tags:['防御','力道'],art:'bone',description:'获得4点本轮护盾，较高耐久适合保护杀招组件。'},
  {id:'tb-core',name:'云刃蛊',owner:'taibai',rank:5,cost:2,activation:2,durability:4,effect:'attack',power:2,tags:['攻击','宙道'],art:'cloud',description:'造成2点伤害，恢复型人物也有固定进攻手段。'},
  {id:'tb-life',name:'生息蛊',owner:'taibai',rank:5,cost:2,activation:1,durability:3,effect:'heal',power:3,tags:['恢复','宙道'],art:'leaf',description:'恢复3体魄；本轮疗伤与攻伐二选一，不增加寿元。'},
  {id:'moon',name:'月光蛊',rank:5,cost:2,activation:2,durability:3,effect:'attack',power:2,tags:['攻击','月道'],art:'moon',description:'造成2点伤害，可作为攻击标签的杀招组件。'},
  {id:'armor',name:'铁甲蛊',rank:5,cost:2,activation:1,durability:4,effect:'guard',power:3,tags:['防御','金道'],art:'armor',description:'获得3点本轮护盾，轮末渡劫后消散。'},
  {id:'grass',name:'生机草',rank:5,cost:2,activation:1,durability:3,effect:'heal',power:3,tags:['恢复','木道'],art:'leaf',description:'恢复3体魄；与本轮攻伐二选一。'},
  {id:'stride',name:'疾行蛊',rank:5,cost:2,activation:1,durability:3,effect:'guard',power:2,tags:['移动','防御'],art:'wind',description:'获得2点护盾，可作为流光突袭组件。'},
  {id:'wine',name:'酒虫',rank:5,cost:2,activation:1,durability:2,effect:'income',power:2,tags:['经营','水道'],art:'wine',description:'获得2当前资源；凡人为元石，仙人为仙元。每轮经营蛊最多发动一次。'},
  {id:'repair',name:'补蛊虫',rank:5,cost:2,activation:1,durability:3,effect:'repair',power:2,tags:['恢复','炼道'],art:'mend',description:'修复己方耐久损失最多的一只蛊虫2点。'},
  {id:'fang',name:'锯齿蛊',rank:5,cost:3,activation:2,durability:3,effect:'attack',power:3,tags:['攻击','金道'],art:'fang',description:'造成3点伤害，可指定敌方人物或蛊虫。'},
  {id:'shell',name:'磐石蛊',rank:5,cost:3,activation:1,durability:5,effect:'guard',power:4,tags:['防御','土道'],art:'rock',description:'获得4点护盾，作为渡劫与防守构筑组件。'},
  {id:'wing',name:'逐风蛊',rank:5,cost:3,activation:2,durability:3,effect:'attack',power:2,tags:['移动','攻击'],art:'wing',description:'造成2点伤害，提供移动标签。'},
  {id:'refinery',name:'炼炉蛊',rank:5,cost:3,activation:1,durability:4,effect:'repair',power:3,tags:['炼道','经营'],art:'refine',description:'修复己方一只蛊虫3点；凡蛊组件，不是通用仙蛊。'},
];
export const MOVES:MoveRecipe[] = [
  {id:'fy-move',name:'逆炼破阵',owner:'fangyuan',rank:5,research:2,cost:3,needs:['炼道','攻击'],cooldown:1,damage:4,shred:2,description:'造成4伤害，再侵蚀耐久最低的敌蛊2点。占用本轮攻伐机会。'},
  {id:'bn-move',name:'冰魄封窍',owner:'baininbing',rank:5,research:2,cost:3,needs:['冰道','防御'],cooldown:1,damage:4,shield:3,description:'造成4伤害，获得3护盾，并使对手寒意达到2层。'},
  {id:'hl-move',name:'大力真武',owner:'he Loulan',rank:5,research:2,cost:3,needs:['力道','攻击'],cooldown:1,damage:4,description:'造成4伤害，消耗全部力势，每层额外造成1伤害。'},
  {id:'tb-move',name:'复旧回春',owner:'taibai',rank:5,research:2,cost:3,needs:['宙道','恢复'],cooldown:1,heal:6,repair:3,shield:2,description:'恢复6体魄、修复一只己蛊3耐久，获得2护盾；不延寿。'},
  {id:'slash',name:'月刃连斩',rank:5,research:2,cost:3,needs:['攻击','攻击'],cooldown:1,damage:6,description:'两只不同攻击蛊合击，造成6伤害。'},
  {id:'bastion',name:'铁壁护身',rank:5,research:2,cost:3,needs:['防御','防御'],cooldown:1,shield:8,description:'获得8点本轮护盾。'},
  {id:'renew',name:'回春护身',rank:5,research:2,cost:3,needs:['恢复','防御'],cooldown:1,heal:5,repair:2,description:'恢复5体魄、修复一只己蛊2耐久；不延寿。'},
  {id:'rift',name:'裂窍锋芒',rank:5,research:2,cost:4,needs:['攻击','炼道'],cooldown:1,damage:3,shred:3,description:'造成3伤害，再侵蚀耐久最低敌蛊3耐久。'},
  {id:'flash',name:'流光突袭',rank:5,research:2,cost:3,needs:['移动','攻击'],cooldown:1,damage:5,shield:2,description:'造成5伤害，并获得2护盾。'},
  {id:'ward',name:'破劫护阵',rank:5,research:2,cost:3,needs:['防御','炼道'],cooldown:1,ward:8,description:'获得8点护劫屏障，上限10，跨轮保留且只抵灾劫。'},
];
export const HEROES:CultHero[] = [
  {id:'fangyuan',portrait:'fangyuan',name:'方源',path:'炼道',color:'#a9c7a8',talent:'逆炼',talentText:'每轮首次炼制费用减1，最低1；每轮首次拆解额外回收1当前资源。',core:'fy-core',exclusive:['fy-core','fy-repair'],move:'fy-move',immortal:{id:'fixed-travel',name:'定仙游',cost:2,shield:5,cleanse:true,description:'1行动、2仙元：获得5护盾，解除自身寒意与当前风灾封位。每轮一次，战术转移的竞技改编。'},plan:'更换组件、建立炼道护阵，在交易和突破之间分配资源。',unlockAfter:0},
  {id:'baininbing',portrait:'baininbing',name:'白凝冰',path:'冰雪道',color:'#9bd6e7',talent:'冰魄',talentText:'每轮首次造成有效伤害附加1寒意，上限2；2寒意使目标下一次催动或杀招多付1真元后清空。',core:'bn-core',exclusive:['bn-core','bn-guard'],move:'bn-move',immortal:{id:'ice-soul',name:'冰魄仙蛊',cost:2,damage:4,shield:2,description:'1行动、2仙元：造成4伤害并获得2护盾，占用攻伐机会，每轮一次。此名称与效果为同人设计。'},plan:'冰甲防守，寒意扰乱，用仙道技能衔接杀招。',unlockAfter:0},
  {id:'he Loulan',portrait:'he Loulan',name:'黑楼兰',path:'力道',color:'#e2ad83',talent:'大力',talentText:'每轮首次造成有效伤害获得1力势，上限3；专属杀招或我力仙蛊消耗力势强化伤害。',core:'hl-core',exclusive:['hl-core','hl-bone'],move:'hl-move',immortal:{id:'self-strength',name:'我力仙蛊',cost:2,damage:4,description:'1行动、2仙元：造成4伤害并消耗全部力势，每层额外1伤害。占用攻伐机会，每轮一次。'},plan:'保留力道组件，积累力势，在突破空档集中爆发。',unlockAfter:1},
  {id:'taibai',portrait:'taibai',name:'太白云生',path:'宙道',color:'#c5d2b0',talent:'复旧',talentText:'每轮首次实际修复己方蛊虫时，额外恢复1体魄；不增加寿元。',core:'tb-core',exclusive:['tb-core','tb-life'],move:'tb-move',immortal:{id:'man-as-before',name:'人如故',cost:2,heal:5,description:'1行动、2仙元：恢复5体魄。与本轮攻伐二选一，每轮一次，不延寿、不回收资源。'},plan:'保护与修复组件，经营寿元，承受周期灾劫。',unlockAfter:2},
];
export const COMMON_GU=GU.filter(g=>!g.owner);
export const COMMON_MOVES=MOVES.filter(m=>!m.owner);
export const DEFAULT_GU=['moon','armor','grass','repair','wine'];
export const DEFAULT_MOVES=['slash','ward'];
export const getGu=(id:string)=>GU.find(g=>g.id===id)!;
export const getMove=(id:string)=>MOVES.find(m=>m.id===id)!;
export const getHero=(id:HeroId)=>HEROES.find(h=>h.id===id)!;
export const TRIBULATIONS=[
  {id:'thunder',name:'九霄雷劫',detail:'分两段承受本次强度的体魄伤害。',prepare:'护盾与护劫屏障共享消耗。'},
  {id:'fire',name:'地火焚蛊',detail:'侵蚀两只不同的最低耐久蛊虫，人物另受2伤。',prepare:'修复组件，留好替换蛊方。'},
  {id:'erosion',name:'蚀元阴灾',detail:'承受本次强度伤害，下一轮仙元补给减1。',prepare:'储备仙元，不要耗尽资源。'},
  {id:'wind',name:'罡风灾',detail:'承受本次强度伤害，下一轮封锁一个有蛊位置。',prepare:'不要依赖单一组件。'},
] as const;
