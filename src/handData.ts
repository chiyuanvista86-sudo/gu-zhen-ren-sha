export type HandKind='life'|'relic'|'heaven'|'mind'|'soul'|'book'|'memory'|'window';
export interface HandCard { uid:string; kind:HandKind; disturbedUntil?:number }
export interface HandDefinition {id:HandKind;code:string;name:string;qi:number;type:string;glyph:string;description:string}
export const HANDS:HandDefinition[]=[
  {id:'life',code:'G01',name:'寿蛊',qi:0,type:'消耗 · 延寿',glyph:'寿',description:'寿元+3，上限12。成功使用后放逐，不恢复体魄。'},
  {id:'relic',code:'G02',name:'紫晶舍利蛊',qi:1,type:'消耗 · 修行',glyph:'晶',description:'提升一个五转小境界，省下3元石和1寿元。每轮升境一次，不能直接成仙；用后放逐。'},
  {id:'heaven',code:'G03',name:'通天蛊',qi:1,type:'交易 · 交割',glyph:'天',description:'先锁定1至2张市场牌或自己订单；可先卖一张其他旧手牌得1资源。市场每张1资源，订单零尾款。买完再补货。'},
  {id:'mind',code:'G04',name:'神念蛊',qi:1,type:'心神 · 储备',glyph:'念',description:'获得2神念，上限2。可抵通天、搜魂、书虫、东窗的1真元，或抵抗搜魂。跨轮保留。'},
  {id:'soul',code:'G05',name:'搜魂蛊',qi:2,type:'情报 · 干扰',glyph:'魂',description:'本轮实际伤害过对手人物后，随机看其2张手牌，可扰动一张非消耗蛊，下次用多付1真元，至其下轮结束。对手花1神念可改为只看1张且无扰动。'},
  {id:'book',code:'G06',name:'书虫',qi:1,type:'知识 · 筛选',glyph:'书',description:'查看顶4张，选择2张入手，其余按点击顺序置底。只移动现有库存。'},
  {id:'memory',code:'G07',name:'铭心蛊',qi:1,type:'经验 · 专长',glyph:'心',description:'展示另一张非消耗、非铭心手牌，记录牌名。此后每轮第一次使用同名牌，真元费用减1。每人一个记录位，不复制卡牌。'},
  {id:'window',code:'G08',name:'东窗蛊',qi:1,type:'情报 · 订货',glyph:'窗',description:'先付1资源定金，再查询牌堆与弃牌的有货品种，选一张实体放订单位。普通采购付1尾款或通天零尾款领取。下轮末过期退库，定金不退。'},
];
export const getHand=(id:HandKind)=>HANDS.find(h=>h.id===id)!;
export const consumable=(id:HandKind)=>id==='life'||id==='relic';
export const mindEligible=(id:HandKind)=>['heaven','soul','book','window'].includes(id);
export const memorable=(id:HandKind)=>!consumable(id)&&id!=='memory';
