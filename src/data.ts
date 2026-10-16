export type Role = "leader" | "loyalist" | "rebel" | "renegade";
export type CardKind =
  | "attack"
  | "dodge"
  | "heal"
  | "draw"
  | "duel"
  | "steal"
  | "dismantle"
  | "storm"
  | "arrows"
  | "wine"
  | "weapon"
  | "armor"
  | "mount";
export type GeneralId =
  | "fangyuan"
  | "baininbing"
  | "he Loulan"
  | "fengjiuge"
  | "taibai"
  | "fangzheng"
  | "yingwuxie"
  | "xingxiu";
export interface General {
  id: GeneralId;
  name: string;
  title: string;
  path: string;
  hp: number;
  color: string;
  skill: string;
  text: string;
  active?: boolean;
  quote: string;
}
export const GENERALS: General[] = [
  {
    id: "fangyuan",
    name: "方源",
    title: "大爱仙尊",
    path: "炼道",
    hp: 4,
    color: "#779f8b",
    skill: "炼蛊",
    text: "出牌阶段限一次：弃置两张手牌，摸三张牌。",
    active: true,
    quote: "纵是身死魂消，魔心依旧不改。",
  },
  {
    id: "baininbing",
    name: "白凝冰",
    title: "北冥冰魄",
    path: "冰雪道",
    hp: 3,
    color: "#83b6cd",
    skill: "冰魄",
    text: "每回合首次造成伤害后，摸一张牌。",
    quote: "精彩的人生，才值得去追逐。",
  },
  {
    id: "he Loulan",
    name: "黑楼兰",
    title: "大力真武",
    path: "力道",
    hp: 4,
    color: "#bd8a67",
    skill: "真武",
    text: "出牌阶段限一次：失去一点体力，摸两张牌，并增加一次月刃使用次数。",
    active: true,
    quote: "走自己的路，成自己的道。",
  },
  {
    id: "fengjiuge",
    name: "凤九歌",
    title: "天地一曲",
    path: "音道",
    hp: 4,
    color: "#c7ad70",
    skill: "九歌",
    text: "出牌阶段可使用两次月刃。",
    quote: "非魔非正，天地有凤九歌。",
  },
  {
    id: "taibai",
    name: "太白云生",
    title: "人如故",
    path: "宙道",
    hp: 3,
    color: "#a5b4a0",
    skill: "人如故",
    text: "出牌阶段限一次：弃一张牌，令一名存活角色回复一点体力。",
    active: true,
    quote: "山川依旧，人可如故。",
  },
  {
    id: "fangzheng",
    name: "古月方正",
    title: "血海新生",
    path: "血道",
    hp: 4,
    color: "#ba7070",
    skill: "血脉",
    text: "受到伤害后，摸一张牌。",
    quote: "昔日的影子，终将走出。",
  },
  {
    id: "yingwuxie",
    name: "影无邪",
    title: "引魂入梦",
    path: "梦道",
    hp: 3,
    color: "#ae90bd",
    skill: "引魂",
    text: "出牌阶段限一次：弃一张牌，弃置一名其他角色的一张随机手牌。",
    active: true,
    quote: "梦境深处，谁能独醒？",
  },
  {
    id: "xingxiu",
    name: "星宿",
    title: "智道仙尊",
    path: "智道",
    hp: 3,
    color: "#8d9bc8",
    skill: "星演",
    text: "摸牌阶段额外摸一张牌。",
    quote: "以星为棋，天地为局。",
  },
];
export const general = (id: GeneralId) => GENERALS.find((g) => g.id === id)!;
export const ROLES: Record<
  Role,
  { name: string; short: string; color: string; goal: string }
> = {
  leader: {
    name: "盟主",
    short: "主",
    color: "#d9ad60",
    goal: "与护法一起击败所有魔修和独行者。",
  },
  loyalist: {
    name: "护法",
    short: "忠",
    color: "#7aa7c6",
    goal: "保护盟主，击败所有魔修和独行者。",
  },
  rebel: {
    name: "魔修",
    short: "反",
    color: "#ca7469",
    goal: "击败盟主；若只剩独行者，独行者获胜。",
  },
  renegade: {
    name: "独行者",
    short: "内",
    color: "#ac8ac3",
    goal: "先清除其余角色，最后单独击败盟主。",
  },
};
export interface Card {
  id: number;
  kind: CardKind;
  suit: "♠" | "♥" | "♣" | "♦";
  rank: string;
}
export const CARDS: Record<
  CardKind,
  {
    name: string;
    category: string;
    glyph: string;
    text: string;
    target?: boolean;
    range?: boolean;
    response?: boolean;
  }
> = {
  attack: {
    name: "月刃",
    category: "基本蛊",
    glyph: "☽",
    text: "对攻击范围内一名其他角色造成一点伤害，可用移形蛊抵消。每回合限一次。",
    target: true,
    range: true,
  },
  dodge: {
    name: "移形蛊",
    category: "基本蛊",
    glyph: "彡",
    text: "响应月刃或万羽齐发，抵消一次效果。",
    response: true,
  },
  heal: {
    name: "九叶生机草",
    category: "基本蛊",
    glyph: "✿",
    text: "回复自己一点体力；濒死时可用于自救。",
  },
  draw: { name: "元石", category: "资源蛊", glyph: "◈", text: "摸两张牌。" },
  duel: {
    name: "斗蛊",
    category: "战术蛊",
    glyph: "⚔",
    text: "与一名其他角色轮流打出月刃，先无法打出者受到一点伤害。",
    target: true,
  },
  steal: {
    name: "盗天手",
    category: "战术蛊",
    glyph: "手",
    text: "获得距离一以内一名其他角色的一张随机手牌或装备。",
    target: true,
    range: true,
  },
  dismantle: {
    name: "离散蛊",
    category: "战术蛊",
    glyph: "散",
    text: "弃置一名其他角色的一张随机手牌或装备。",
    target: true,
  },
  storm: {
    name: "兽潮",
    category: "战术蛊",
    glyph: "兽",
    text: "其他角色依次打出一张月刃，否则受到一点伤害。",
  },
  arrows: {
    name: "万羽齐发",
    category: "战术蛊",
    glyph: "羽",
    text: "其他角色依次打出一张移形蛊，否则受到一点伤害。",
  },
  wine: {
    name: "酒虫",
    category: "基本蛊",
    glyph: "酒",
    text: "本回合下一张月刃伤害增加一点，每回合限用一次。",
  },
  weapon: {
    name: "锯齿金蜈",
    category: "武器蛊",
    glyph: "蜈",
    text: "装备后攻击范围为三，同类装备会替换。",
  },
  armor: {
    name: "天蓬蛊",
    category: "防御蛊",
    glyph: "甲",
    text: "每回合首次受到月刃时，判定：若为红色，抵消这次月刃。",
  },
  mount: {
    name: "神行蛊",
    category: "身法蛊",
    glyph: "行",
    text: "你计算到其他角色的距离减一，最小为一。",
  },
};
export const COUNTS: Record<CardKind, number> = {
  attack: 25,
  dodge: 16,
  heal: 9,
  draw: 8,
  duel: 5,
  steal: 5,
  dismantle: 6,
  storm: 3,
  arrows: 3,
  wine: 4,
  weapon: 3,
  armor: 3,
  mount: 3,
};
export const isRed = (c: Card) => c.suit === "♥" || c.suit === "♦";
