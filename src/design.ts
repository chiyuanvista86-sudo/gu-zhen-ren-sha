import { CARDS, COUNTS, GENERALS } from "./data";
import type { CardKind, GeneralId } from "./data";

export const GENERAL_DESIGN: Record<
  GeneralId,
  { position: string; idea: string; review: string }
> = {
  fangyuan: {
    position: "资源运转 / 组合技",
    idea: "用废牌炼成新资源，体现炼道和对利益的算计；弃二摸三，净赚一张并改善手牌。",
    review:
      "目前只有一个换牌技，春秋蝉、逆流护身和复活尚未实现；是否增加第二技能由你决定。",
  },
  baininbing: {
    position: "进攻 / 伤害收益",
    idea: "三体力换取进攻收益，鼓励用月刃、斗蛊和群攻主动争夺节奏。",
    review:
      "“每回合”指任意角色的一个回合；每回合首次造成伤害摸一张，不按伤害点数计算。",
  },
  "he Loulan": {
    position: "卖血爆发 / 多次攻击",
    idea: "把体力兑换为手牌和额外月刃，体现力道强攻；与酒虫、武器形成爆发。",
    review:
      "体力须大于一才能发动；失去体力不视为受到伤害，不触发血脉。回合结束时手牌上限仍取当前体力。",
  },
  fengjiuge: {
    position: "稳定输出 / 新手友好",
    idea: "用常驻第二次月刃体现音律连击，不增加操作步骤，作为简洁输出基准。",
    review:
      "当前仅增加使用次数，不自动获得月刃、不增加范围；九首仙曲未分别实现。",
  },
  taibai: {
    position: "治疗 / 团队辅助",
    idea: "以一张任意手牌交换一点体力，可治疗自己或队友，体现人如故的恢复。",
    review: "仅出牌阶段发动，只能选择已受伤的存活角色；不是濒死救援或复活。",
  },
  fangzheng: {
    position: "受伤补牌 / 防守反击",
    idea: "受伤后补一张牌，缓解损失，为之后回合积累资源。",
    review:
      "每次伤害事件摸一张，受到两点伤害仍只摸一张；当前在濒死自救之前补牌，可能摸到生机草。",
  },
  yingwuxie: {
    position: "手牌干扰 / 控制",
    idea: "一换一干扰对手关键响应资源，以引魂入梦表现失去主动权。",
    review:
      "当前只随机弃一张手牌，不弃装备、不跳过回合；梦道封锁属于可选后续方向。",
  },
  xingxiu: {
    position: "稳定资源 / 智道",
    idea: "每次摸牌阶段多一张，体现推演带来的信息和资源优势，与方源主动换牌区分。",
    review:
      "当前不是观星、看牌或改判；稳定无代价多摸一张可能偏强，尚未完成角色胜率平衡。",
  },
};
export const CARD_DESIGN: Record<
  CardKind,
  { reference: string; idea: string; review: string }
> = {
  attack: {
    reference: "杀",
    idea: "基础进攻资源，用次数与范围限制节奏；默认一伤害。",
    review: "暂未区分普通、火焰、雷电伤害。",
  },
  dodge: {
    reference: "闪",
    idea: "基础防守资源，与月刃和万羽形成明确的响应关系。",
    review: "只能在响应时使用；不抵消兽潮、斗蛊。",
  },
  heal: {
    reference: "桃",
    idea: "九叶生机草对应恢复生命的蛊虫，承担续航与自救。",
    review: "出牌阶段只治疗自己；濒死时自动消耗，不支持他人救援。",
  },
  draw: {
    reference: "无中生有",
    idea: "用元石体现通用资源，使用一张摸两张，净增加一张手牌。",
    review: "目前归类为资源蛊，没有真元费用体系。",
  },
  duel: {
    reference: "决斗",
    idea: "用月刃储备进行持续对抗，让攻击牌也承担防守作用。",
    review: "发起者与目标交替响应；先不能或不愿响应者受一伤害。",
  },
  steal: {
    reference: "顺手牵羊",
    idea: "近距离夺取资源，保留座位和身法的价值。",
    review: "当前从对方手牌与装备的并集随机获得一张，不能指定装备。",
  },
  dismantle: {
    reference: "过河拆桥",
    idea: "无距离限制拆除资源，制约关键装备和防守牌。",
    review: "当前从手牌与装备并集随机弃置一张，不能指定装备。",
  },
  storm: {
    reference: "南蛮入侵",
    idea: "所有其他角色响应月刃，消耗攻击储备；也可能误伤友方。",
    review: "按座位依次结算，不能选目标或跳过盟友。",
  },
  arrows: {
    reference: "万箭齐发",
    idea: "所有其他角色响应移形蛊，消耗防守储备；与兽潮形成资源差异。",
    review: "按座位依次结算，不能选目标或跳过盟友。",
  },
  wine: {
    reference: "酒",
    idea: "先投入一张资源，强化下一张月刃，形成爆发和留闪博弈。",
    review: "本回合限一次；只强化下一张月刃，不能用于濒死自救，也不强化斗蛊。",
  },
  weapon: {
    reference: "攻击范围为三的武器",
    idea: "锯齿金蜈伸展攻击距离，让非相邻座位也成为目标。",
    review: "只把攻击范围设为三；没有额外武器技能。",
  },
  armor: {
    reference: "八卦阵的简化思路",
    idea: "以天蓬蛊护身，在第一次月刃来袭时给一次红色判定防御。",
    review:
      "任意角色的每个回合限判定一次；自动判定，红色直接抵消，黑色仍可打移形蛊。",
  },
  mount: {
    reference: "进攻马（距离减一）",
    idea: "用神行蛊调整自身到其他角色的距离，强化近身攻击和盗天手。",
    review: "只改变你到别人的距离，不改变别人到你的距离；不增加防御距离。",
  },
};

export function designPayload() {
  return {
    version: "1.1.0",
    status: "当前已实现的简化规则；设计理由是原型意图，不代表已经完成平衡。",
    generals: GENERALS.map((g, i) => ({
      number: `G${String(i + 1).padStart(2, "0")}`,
      id: g.id,
      name: g.name,
      hp: g.hp,
      skill: g.skill,
      type: g.active ? "主动" : "被动",
      effect: g.text,
      ...GENERAL_DESIGN[g.id],
      requestedChanges: "",
    })),
    cards: (Object.keys(CARDS) as CardKind[]).map((kind, i) => ({
      number: `C${String(i + 1).padStart(2, "0")}`,
      id: kind,
      name: CARDS[kind].name,
      count: COUNTS[kind],
      category: CARDS[kind].category,
      effect: CARDS[kind].text,
      ...CARD_DESIGN[kind],
      requestedChanges: "",
    })),
    globalRules: {
      players: 5,
      roles: "盟主1、护法1、魔修2、独行者1",
      startingHand: 4,
      drawPerTurn: 2,
      leaderExtraHp: 1,
      handLimit: "回合结束时等于当前体力",
      dying: "只自动使用自己的生机草；无他人救援",
      requestedChanges: "",
    },
  };
}
export function designMarkdown() {
  const d = designPayload();
  return `# 蛊真人杀：卡牌与人物技能设计清单\n\n版本：${d.version}。以下全部是当前已实现的原型规则，未改动本轮 UI 更新前的玩法。人物技能为独立同人设计，不是原作官方设定或三国杀官方技能。\n\n你可以按 G01 / C01 编号提出修改，也可以编辑 DESIGN.json 中的 requestedChanges 字段。修改清单不会自动修改游戏规则，确认后需要同步修改引擎并验证。\n\n## 人物与技能\n\n| 编号 | 人物 | 基础体力 | 技能 | 当前效果 | 定位与思路 | 需确认的细节 | 你的修改 |\n|---|---|---:|---|---|---|---|---|\n${d.generals.map((g) => `| ${g.number} | ${g.name} | ${g.hp} | ${g.skill}（${g.type}） | ${g.effect} | ${g.position}：${g.idea} | ${g.review} | |`).join("\n")}\n\n盟主在所选人物基础体力上额外加一。主动技能均为自己的出牌阶段限一次；“每回合”指任意角色的一个回合，“每次伤害”按伤害事件计算。\n\n## 卡牌\n\n| 编号 | 卡牌 | 数量 | 三国杀对应思路 | 当前效果 | 设计理由 | 简化与边界 | 你的修改 |\n|---|---|---:|---|---|---|---|---|\n${d.cards.map((c) => `| ${c.number} | ${c.name} | ${c.count} | ${c.reference} | ${c.effect} | ${c.idea} | ${c.review} | |`).join("\n")}\n\n共 93 张，13 类。花色和点数当前仅用于展示及天蓬蛊红黑判定，没有独立花色技能或经过平衡的固定牌表。\n\n## 全局规则与待讨论项\n\n- 五人：盟主1、护法1、魔修2、独行者1。盟主先行动，其他身份在阵亡时公开。\n- 起始各摸四张；每回合摸两张；手牌上限为当前体力。星宿额外多摸一张。\n- 盟主与护法清除所有魔修和独行者获胜；盟主死亡通常魔修获胜；若仅剩独行者则独行者获胜。\n- 濒死仅自动使用自己的生机草，没有队友救援。击败魔修摸三张；盟主误杀护法弃置全部手牌和装备。\n- 当前没有无懈可击、延时锦囊、判定区、连环、属性伤害、第二武将技能或联网。\n- 当前 AI 使用自身身份和公开行动作判断，会误判隐藏身份；不是最优策略。\n- 基础技能刻意保持短、易读，角色强度尚未依据大量真人对局胜率调整。\n\n## 本次 UI 设计\n\n参照经典三国杀 OL 身份场的信息层级：环桌武将、竖排姓名、身份角标、玉石体力、装备栏、技能按钮、叠放手牌、羊皮纸卡面、木纹与铜框。立绘、卡牌插画和装饰均为本项目可编辑原创矢量图，并未复制官方美术、卡框、商标或音频；因此整体布局和交互接近经典风格，人物画风并非官方卡面的一比一复刻。\n\n## 建议回复格式\n\n\`G01 方源：体力改为4；炼蛊改为……；增加技能“春秋蝉”：……\`\n\n\`C06 盗天手：改名为……；可指定一件装备，或随机获得一张手牌；距离限制为……\`\n\n\`全局：增加队友濒死救援；身份改回主公/忠臣/反贼/内奸；牌数改为……\`\n`;
}
