import { describe, it, expect } from "vitest";
import {
  createGame,
  reduceGame,
  validTargets,
  canPlay,
  distance,
  attackLimit,
} from "./engine";
import type { Game } from "./engine";
import { COUNTS } from "./data";
import type { Card, CardKind } from "./data";
function fixture(): Game {
  const s = createGame("fangyuan", "leader", 42);
  s.players.forEach((p) => {
    s.deck.push(...p.hand.splice(0));
    p.general = "fengjiuge";
  });
  s.players[0].general = "fangyuan";
  s.active = 0;
  s.phase = "action";
  return s;
}
function give(s: Game, to: number, kind: CardKind) {
  const i = s.deck.findIndex((c) => c.kind === kind);
  const [c] = s.deck.splice(i, 1);
  s.players[to].hand.push(c);
  return c;
}
function use(s: Game, kind: CardKind, target?: number) {
  const c = give(s, 0, kind);
  return reduceGame(s, { type: "play", cardId: c.id, target });
}
function conserved(s: Game) {
  const cards: Card[] = [
    ...s.deck,
    ...s.discard,
    ...s.players.flatMap((p) => [...p.hand, ...Object.values(p.equipment)]),
  ];
  expect(cards.length).toBe(Object.values(COUNTS).reduce((a, b) => a + b, 0));
  expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length);
}
describe("五域身份局引擎", () => {
  it("按照种子生成牌堆，盟主先手且有额外体力", () => {
    const a = createGame("fangyuan", "rebel", 8),
      b = createGame("fangyuan", "rebel", 8);
    expect(a).toEqual(b);
    expect(a.players[a.active].role).toBe("leader");
    expect(a.players[a.active].hand.length).toBeGreaterThanOrEqual(6);
    expect(a.players.filter((p) => p.role === "rebel")).toHaveLength(2);
    conserved(a);
  });
  it("月刃需要移形响应；伤害只在放弃响应时结算", () => {
    let s = fixture();
    const hp = s.players[1].hp;
    s = use(s, "attack", 1);
    expect(s.phase).toBe("response");
    expect(s.players[1].hp).toBe(hp);
    const dodge = give(s, 1, "dodge");
    s = reduceGame(s, { type: "respond", cardId: dodge.id });
    expect(s.players[1].hp).toBe(hp);
    expect(s.phase).toBe("action");
    conserved(s);
  });
  it("拒绝错误响应牌和超次数月刃", () => {
    let s = fixture();
    s = use(s, "attack", 1);
    const heal = give(s, 1, "heal");
    expect(reduceGame(s, { type: "respond", cardId: heal.id })).toEqual(s);
    s = reduceGame(s, { type: "respond" });
    const c = give(s, 0, "attack");
    expect(canPlay(s, c)).toBe(false);
    expect(reduceGame(s, { type: "play", cardId: c.id, target: 1 })).toEqual(s);
  });
  it("酒虫使下一张月刃造成两点伤害并自动消耗生机草自救", () => {
    let s = fixture();
    s.players[1].hp = 1;
    give(s, 1, "heal");
    give(s, 1, "heal");
    s = use(s, "wine");
    s = use(s, "attack", 1);
    s = reduceGame(s, { type: "respond" });
    expect(s.players[1].hp).toBe(1);
    expect(s.players[1].alive).toBe(true);
    expect(s.players[1].hand).toHaveLength(0);
    expect(s.wine).toBe(false);
    conserved(s);
  });
  it("斗蛊交替打出月刃，先放弃的一方受伤", () => {
    let s = fixture();
    const hp = s.players[0].hp;
    const c = give(s, 1, "attack");
    s = use(s, "duel", 1);
    s = reduceGame(s, { type: "respond", cardId: c.id });
    expect(s.response?.target).toBe(0);
    s = reduceGame(s, { type: "respond" });
    expect(s.players[0].hp).toBe(hp - 1);
    expect(s.phase).toBe("action");
    conserved(s);
  });
  it("兽潮依座位顺序结算所有目标", () => {
    let s = fixture();
    const hps = s.players.map((p) => p.hp);
    s = use(s, "storm");
    for (let i = 1; i < 5; i++) {
      expect(s.response?.target).toBe(i);
      s = reduceGame(s, { type: "respond" });
    }
    expect(s.phase).toBe("action");
    expect(s.players.map((p) => p.hp)).toEqual(
      hps.map((hp, i) => hp - (i ? 1 : 0)),
    );
    conserved(s);
  });
  it("武器、身法、阵亡座位影响距离", () => {
    let s = fixture();
    expect(distance(s, 0, 2)).toBe(2);
    expect(validTargets(s, "attack")).not.toContain(2);
    s = use(s, "weapon");
    expect(validTargets(s, "attack")).toContain(2);
    s = use(s, "mount");
    expect(distance(s, 0, 2)).toBe(1);
    s.players[1].alive = false;
    expect(distance(s, 0, 2)).toBe(1);
    conserved(s);
  });
  it("装备替换时旧装备进入弃牌堆", () => {
    let s = fixture();
    s = use(s, "weapon");
    const old = s.players[0].equipment.weapon!.id;
    s = use(s, "weapon");
    expect(s.discard.some((c) => c.id === old)).toBe(true);
    conserved(s);
  });
  it("天蓬蛊红色判定抵消攻击", () => {
    let s = fixture();
    const armor = give(s, 1, "armor");
    s.players[1].hand = [];
    s.players[1].equipment.armor = armor;
    const i = s.deck.findIndex((c) => c.suit === "♥");
    const [red] = s.deck.splice(i, 1);
    s.deck.push(red);
    const hp = s.players[1].hp;
    s = use(s, "attack", 1);
    expect(s.phase).toBe("action");
    expect(s.players[1].hp).toBe(hp);
    conserved(s);
  });
  it("炼蛊去重检查且每回合仅能发动一次", () => {
    let s = fixture();
    const a = give(s, 0, "dodge"),
      b = give(s, 0, "dodge");
    expect(reduceGame(s, { type: "skill", cardIds: [a.id, a.id] })).toEqual(s);
    s = reduceGame(s, { type: "skill", cardIds: [a.id, b.id] });
    expect(s.players[0].hand.length).toBe(3);
    expect(s.skillUsed).toBe(true);
    expect(
      reduceGame(s, {
        type: "skill",
        cardIds: s.players[0].hand.slice(0, 2).map((c) => c.id),
      }),
    ).toEqual(s);
    conserved(s);
  });
  it("黑楼兰和凤九歌能增加攻击次数", () => {
    let s = fixture();
    s.players[0].general = "he Loulan";
    const hp = s.players[0].hp;
    s = reduceGame(s, { type: "skill", cardIds: [] });
    expect(attackLimit(s)).toBe(2);
    expect(s.players[0].hp).toBe(hp - 1);
    s.players[0].general = "fengjiuge";
    expect(attackLimit(s)).toBe(3);
  });
  it("弃牌必须精确匹配超出当前体力的张数", () => {
    let s = fixture();
    s.players[0].hp = 1;
    give(s, 0, "dodge");
    give(s, 0, "dodge");
    give(s, 0, "dodge");
    s = reduceGame(s, { type: "end" });
    expect(s.phase).toBe("discard");
    expect(
      reduceGame(s, { type: "discard", cardIds: [s.players[0].hand[0].id] }),
    ).toEqual(s);
    s = reduceGame(s, {
      type: "discard",
      cardIds: s.players[0].hand.slice(0, 2).map((c) => c.id),
    });
    expect(s.active).toBe(1);
    expect(s.turn).toBe(2);
    conserved(s);
  });
  it("牌堆耗尽时洗回弃牌，卡牌不会丢失", () => {
    let s = fixture();
    s.discard.push(...s.deck.splice(0));
    const c = s.discard.splice(
      s.discard.findIndex((c) => c.kind === "draw"),
      1,
    )[0];
    s.players[0].hand.push(c);
    s = reduceGame(s, { type: "play", cardId: c.id });
    expect(s.players[0].hand).toHaveLength(2);
    conserved(s);
  });
  it("独行者单独击败盟主时获胜", () => {
    let s = fixture();
    s.players[1].role = "renegade";
    s.players.slice(2).forEach((p) => {
      p.alive = false;
      s.discard.push(...p.hand.splice(0));
    });
    s.players[0].hp = 1;
    s.active = 1;
    const c = give(s, 1, "attack");
    s = reduceGame(s, { type: "play", cardId: c.id, target: 0 });
    s = reduceGame(s, { type: "respond" });
    expect(s.phase).toBe("over");
    expect(s.winners).toEqual(["renegade"]);
  });
  it("击败全部敌对角色后盟主和护法共同获胜", () => {
    let s = fixture();
    s.players.forEach((p, i) => {
      p.role = i === 0 ? "leader" : i === 1 ? "rebel" : "loyalist";
    });
    s.players[1].hp = 1;
    s = use(s, "attack", 1);
    s = reduceGame(s, { type: "respond" });
    expect(s.winners).toEqual(["leader", "loyalist"]);
    conserved(s);
  });
  it("多个随机种子的完整 AI 对局保持状态有效并能够结算", () => {
    let finished = 0;
    for (let seed = 1; seed <= 30; seed++) {
      let s = createGame("fangyuan", "rebel", seed);
      for (let i = 0; i < 3500 && s.phase !== "over"; i++) {
        s = reduceGame(s, { type: "ai" });
        if (i % 100 === 0) conserved(s);
      }
      if (s.phase === "over") finished++;
      conserved(s);
      expect(s.players.filter((p) => p.alive).every((p) => p.hp > 0)).toBe(
        true,
      );
    }
    expect(finished).toBe(30);
  }, 20000);
});
