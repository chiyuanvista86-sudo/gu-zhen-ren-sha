import type { GeneralId } from './data';

export type HeroId = 'fangyuan' | 'baininbing' | 'he Loulan' | 'taibai';
export type GuEffect = 'attack' | 'guard' | 'heal' | 'repair' | 'income' | 'shred' | 'force';
export interface GuRecipe {
  id: string; name: string; owner?: HeroId; rank: number; cost: number; activation: number;
  durability: number; effect: GuEffect; power: number; tags: string[]; art: string; description: string;
}
export interface MoveRecipe {
  id: string; name: string; owner?: HeroId; rank: number; research: number; cost: number;
  needs: string[]; cooldown: number; damage?: number; shield?: number; heal?: number;
  repair?: number; shred?: number; ward?: number; description: string;
}
export interface CultHero {
  id: HeroId; portrait: GeneralId; name: string; path: string; color: string;
  talent: string; talentText: string; core: string; exclusive: string[]; move: string;
  plan: string; unlockAfter: number;
}
export const RULES = {
  version: 2, life: 30, actions: 3, slots: 4, yuanIncome: 5, yuanCap: 12,
  immortalIncome: 3, immortalCap: 6, ascensionCost: 5, initialTribulation: 6,
  tribulationInterval: 3, pressureStart: 18, maxRound: 26,
  cultivationCosts: [0, 2, 3, 4, 5], commonLoadout: 5, moveLoadout: 2,
} as const;

export const GU: GuRecipe[] = [
  {id:'fy-core',name:'逆炼蛊',owner:'fangyuan',rank:1,cost:2,activation:1,durability:4,effect:'attack',power:2,tags:['攻击','炼道'],art:'refine',description:'造成2点伤害。方源的本命蛊，兼作炼道杀招核心。'},
  {id:'fy-repair',name:'回炉蛊',owner:'fangyuan',rank:2,cost:3,activation:1,durability:3,effect:'repair',power:2,tags:['恢复','炼道'],art:'mend',description:'修复己方耐久损失最多的一只蛊虫2点。'},
  {id:'fy-break',name:'逆炼仙蛊',owner:'fangyuan',rank:6,cost:6,activation:2,durability:4,effect:'shred',power:4,tags:['攻击','炼道'],art:'break',description:'成仙后可炼制。侵蚀指定敌蛊4点耐久，另享仙缘驱动加成。'},
  {id:'bn-core',name:'冰刃蛊',owner:'baininbing',rank:1,cost:2,activation:1,durability:4,effect:'attack',power:2,tags:['攻击','冰道'],art:'ice',description:'造成2点伤害；冰魄天赋会为本轮首次有效伤害附加寒意。'},
  {id:'bn-guard',name:'冰甲蛊',owner:'baininbing',rank:1,cost:2,activation:1,durability:4,effect:'guard',power:4,tags:['防御','冰道'],art:'armor',description:'获得4点护盾，抵挡本轮人物或蛊虫受到的攻击与灾劫。'},
  {id:'bn-spike',name:'冰魄仙蛊',owner:'baininbing',rank:6,cost:6,activation:2,durability:4,effect:'attack',power:4,tags:['攻击','冰道'],art:'spike',description:'成仙后可炼制。造成4点伤害，另享仙缘驱动加成。'},
  {id:'hl-core',name:'熊力蛊',owner:'he Loulan',rank:1,cost:2,activation:1,durability:4,effect:'attack',power:2,tags:['攻击','力道'],art:'force',description:'造成2点伤害，可为大力天赋积累力势。'},
  {id:'hl-bone',name:'铁骨蛊',owner:'he Loulan',rank:2,cost:3,activation:1,durability:5,effect:'guard',power:4,tags:['防御','力道'],art:'bone',description:'获得4点护盾；较高耐久适合护住力道杀招组件。'},
  {id:'hl-charge',name:'我力仙蛊',owner:'he Loulan',rank:6,cost:6,activation:2,durability:4,effect:'force',power:2,tags:['经营','力道'],art:'charge',description:'成仙后可炼制。获得2层力势，上限3层，为大力真武准备爆发。'},
  {id:'tb-core',name:'云刃蛊',owner:'taibai',rank:1,cost:2,activation:1,durability:4,effect:'attack',power:2,tags:['攻击','宙道'],art:'cloud',description:'造成2点伤害，为恢复型人物提供基础进攻手段。'},
  {id:'tb-life',name:'生息蛊',owner:'taibai',rank:1,cost:2,activation:1,durability:3,effect:'heal',power:3,tags:['恢复','宙道'],art:'leaf',description:'回复3点人物生命。'},
  {id:'tb-repair',name:'人如故仙蛊',owner:'taibai',rank:6,cost:6,activation:2,durability:4,effect:'repair',power:4,tags:['恢复','宙道'],art:'time',description:'成仙后可炼制。修复己方耐久损失最多的一只蛊虫4点，另享仙缘驱动加成。'},
  {id:'moon',name:'月光蛊',rank:1,cost:2,activation:1,durability:3,effect:'attack',power:2,tags:['攻击','月道'],art:'moon',description:'造成2点伤害；通用低费用攻击组件。'},
  {id:'armor',name:'铁甲蛊',rank:1,cost:2,activation:1,durability:4,effect:'guard',power:3,tags:['防御','金道'],art:'armor',description:'获得3点护盾。护盾同时保护人物与蛊虫，本轮末渡劫后消散。'},
  {id:'grass',name:'生机草',rank:1,cost:2,activation:1,durability:3,effect:'heal',power:3,tags:['恢复','木道'],art:'leaf',description:'回复3点人物生命。'},
  {id:'stride',name:'疾行蛊',rank:1,cost:2,activation:1,durability:3,effect:'guard',power:2,tags:['移动','防御'],art:'wind',description:'获得2点护盾，可组成流光突袭。首版采用主动护盾，不弹出响应窗口。'},
  {id:'wine',name:'酒虫',rank:1,cost:2,activation:1,durability:2,effect:'income',power:2,tags:['经营','水道'],art:'wine',description:'获得2元石；成仙后获得2仙缘。每轮最多发动一只经营蛊，且占用行动。'},
  {id:'repair',name:'补蛊虫',rank:1,cost:2,activation:1,durability:3,effect:'repair',power:2,tags:['恢复','炼道'],art:'mend',description:'修复己方耐久损失最多的一只蛊虫2点。'},
  {id:'fang',name:'锯齿蛊',rank:2,cost:3,activation:2,durability:3,effect:'attack',power:3,tags:['攻击','金道'],art:'fang',description:'造成3点伤害，可直接攻击人物或指定敌蛊。'},
  {id:'shell',name:'磐石蛊',rank:2,cost:3,activation:1,durability:5,effect:'guard',power:4,tags:['防御','土道'],art:'rock',description:'获得4点护盾，是渡劫和防守构筑的稳定组件。'},
  {id:'spike',name:'裂窍仙蛊',rank:6,cost:6,activation:2,durability:4,effect:'shred',power:4,tags:['攻击','金道'],art:'spike',description:'成仙后可炼制。侵蚀敌蛊4点耐久，另享仙缘驱动加成，仍可被共享护盾抵挡。'},
  {id:'lotus',name:'仙莲蛊',rank:6,cost:6,activation:2,durability:4,effect:'heal',power:5,tags:['恢复','木道'],art:'lotus',description:'成仙后可炼制。回复5点人物生命，另享仙缘驱动加成。'},
  {id:'wing',name:'逐风蛊',rank:2,cost:3,activation:1,durability:3,effect:'attack',power:2,tags:['移动','攻击'],art:'wing',description:'造成2点伤害，并提供移动标签。'},
  {id:'refinery',name:'仙炼蛊',rank:6,cost:6,activation:2,durability:4,effect:'repair',power:4,tags:['炼道','经营'],art:'refine',description:'成仙后可炼制。修复己方一只蛊虫4点，另享仙缘驱动加成；可组成炼道杀招。'},
];

export const MOVES: MoveRecipe[] = [
  {id:'fy-move',name:'逆炼破阵',owner:'fangyuan',rank:3,research:2,cost:3,needs:['炼道','攻击'],cooldown:1,damage:4,shred:2,description:'对选定目标造成4点伤害，再侵蚀耐久最低的一只敌蛊2点。'},
  {id:'bn-move',name:'冰魄封窍',owner:'baininbing',rank:3,research:2,cost:3,needs:['冰道','防御'],cooldown:1,damage:4,shield:3,description:'造成4点伤害，获得3点护盾，并使敌方寒意直接达到2层。'},
  {id:'hl-move',name:'大力真武',owner:'he Loulan',rank:3,research:2,cost:3,needs:['力道','攻击'],cooldown:1,damage:4,description:'造成4点伤害，消耗全部力势，每层额外造成1点伤害。'},
  {id:'tb-move',name:'人如故',owner:'taibai',rank:3,research:2,cost:3,needs:['宙道','恢复'],cooldown:1,heal:6,repair:3,shield:2,description:'回复6点人物生命，修复一只己蛊3点，并获得2点护盾。'},
  {id:'slash',name:'月刃连斩',rank:2,research:2,cost:3,needs:['攻击','攻击'],cooldown:1,damage:6,description:'由两只不同的攻击蛊合击，造成6点伤害。'},
  {id:'bastion',name:'铁壁护身',rank:2,research:2,cost:3,needs:['防御','防御'],cooldown:1,shield:8,description:'获得8点本轮护盾。'},
  {id:'renew',name:'回春如故',rank:2,research:2,cost:3,needs:['恢复','防御'],cooldown:1,heal:5,repair:2,description:'回复5点生命，修复一只己蛊2点耐久。'},
  {id:'rift',name:'裂窍锋芒',rank:3,research:2,cost:4,needs:['攻击','炼道'],cooldown:1,damage:3,shred:3,description:'对选定目标造成3点伤害，再侵蚀耐久最低的一只敌蛊3点。'},
  {id:'flash',name:'流光突袭',rank:2,research:2,cost:3,needs:['移动','攻击'],cooldown:1,damage:5,shield:2,description:'造成5点伤害，并获得2点护盾。'},
  {id:'ward',name:'破劫护阵',rank:3,research:2,cost:3,needs:['防御','炼道'],cooldown:1,ward:8,description:'获得8点护劫屏障，跨轮保留，只抵挡灾劫，上限10点。'},
];

export const HEROES: CultHero[] = [
  {id:'fangyuan',portrait:'fangyuan',name:'方源',path:'炼道',color:'#a9c7a8',talent:'逆炼',talentText:'每轮首次炼制蛊虫费用减少1，最低1。每轮首次拆解额外回收1当前资源。',core:'fy-core',exclusive:['fy-core','fy-repair','fy-break'],move:'fy-move',plan:'回收与改换组件，寻找进攻或渡劫的最优组合。',unlockAfter:0},
  {id:'baininbing',portrait:'baininbing',name:'白凝冰',path:'冰雪道',color:'#9bd6e7',talent:'冰魄',talentText:'每轮首次造成有效伤害，使敌方获得1层寒意，上限2；2层寒意令其下一次催动费用增加1，随后清空。',core:'bn-core',exclusive:['bn-core','bn-guard','bn-spike'],move:'bn-move',plan:'用冰甲稳住场面，以寒意干扰对方资源安排。',unlockAfter:0},
  {id:'he Loulan',portrait:'he Loulan',name:'黑楼兰',path:'力道',color:'#e2ad83',talent:'大力',talentText:'每轮首次造成有效伤害，获得1层力势，上限3；大力真武消耗力势增加伤害。',core:'hl-core',exclusive:['hl-core','hl-bone','hl-charge'],move:'hl-move',plan:'积蓄力势，在对方升仙或渡劫前集中爆发。',unlockAfter:1},
  {id:'taibai',portrait:'taibai',name:'太白云生',path:'宙道',color:'#c5d2b0',talent:'复旧',talentText:'每轮首次实际修复己方蛊虫后，额外回复1点人物生命。',core:'tb-core',exclusive:['tb-core','tb-life','tb-repair'],move:'tb-move',plan:'保护组件、修复损耗，凭恢复能力承受周期灾劫。',unlockAfter:2},
];
export const COMMON_GU = GU.filter(g=>!g.owner);
export const COMMON_MOVES = MOVES.filter(m=>!m.owner);
export const DEFAULT_GU = ['moon','armor','grass','repair','wine'];
export const DEFAULT_MOVES = ['slash','ward'];
export const getGu = (id:string) => GU.find(g=>g.id===id)!;
export const getMove = (id:string) => MOVES.find(g=>g.id===id)!;
export const getHero = (id:HeroId) => HEROES.find(h=>h.id===id)!;
export const TRIBULATIONS = [
  {id:'thunder',name:'九霄雷劫',detail:'对人物造成两段伤害，护劫屏障与护盾可抵挡。',prepare:'预留护盾或护劫屏障，注意对手拆除护身蛊。'},
  {id:'fire',name:'地火焚蛊',detail:'侵蚀两只耐久最低的蛊虫，并对人物造成少量伤害。',prepare:'修复受损组件，备好替代蛊；共享护盾也能保护蛊虫。'},
  {id:'erosion',name:'蚀元阴灾',detail:'对人物造成伤害，下一轮仙缘补给减少1。',prepare:'储备仙缘，避免在灾劫前耗尽资源。'},
  {id:'wind',name:'罡风灾',detail:'对人物造成伤害，下一轮封锁一处有蛊虫的位置。',prepare:'准备其他位置的攻击与防御，避免依赖单个核心。'},
] as const;
