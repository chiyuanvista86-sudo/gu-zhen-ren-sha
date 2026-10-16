import { CARDS, COUNTS, GENERALS, general, isRed } from "./data";
import type { Card, CardKind, GeneralId, Role } from "./data";
export interface Player {
  id: number;
  general: GeneralId;
  role: Role;
  hp: number;
  maxHp: number;
  hand: Card[];
  equipment: Partial<Record<"weapon" | "armor" | "mount", Card>>;
  alive: boolean;
  revealed: boolean;
  armorUsed: boolean;
}
export interface Response {
  source: number;
  target: number;
  kind: "attack" | "duel" | "storm" | "arrows";
  required: "attack" | "dodge";
  damage: number;
  remaining: number[];
}
export type Phase = "action" | "discard" | "response" | "over";
export interface Game {
  version: 1;
  seed: number;
  players: Player[];
  deck: Card[];
  discard: Card[];
  active: number;
  turn: number;
  phase: Phase;
  response: Response | null;
  attacks: number;
  bonusAttacks: number;
  skillUsed: boolean;
  damageSkillUsed: boolean;
  wine: boolean;
  wineUsed: boolean;
  logs: { id: number; text: string }[];
  logId: number;
  table: Card[];
  winners: Role[] | null;
  notice: string;
}
export type Action =
  | { type: "play"; cardId: number; target?: number }
  | { type: "skill"; cardIds: number[]; target?: number }
  | { type: "end" }
  | { type: "discard"; cardIds: number[] }
  | { type: "respond"; cardId?: number }
  | { type: "ai" };
function random(s: Game) {
  let n = s.seed | 0;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  s.seed = n >>> 0;
  return s.seed / 4294967296;
}
function shuffle<T>(s: Game, a: T[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const name = (s: Game, id: number) => general(s.players[id].general).name;
function log(s: Game, text: string) {
  s.logs.push({ id: ++s.logId, text });
  s.logs = s.logs.slice(-100);
  s.notice = text;
}
export function draw(s: Game, id: number, n: number) {
  for (let i = 0; i < n; i++) {
    if (!s.deck.length) {
      s.deck = shuffle(s, s.discard.splice(0));
    }
    const c = s.deck.pop();
    if (c) s.players[id].hand.push(c);
  }
}
export function createGame(
  hero: GeneralId = "fangyuan",
  role: Role = "rebel",
  seed = Date.now() >>> 0,
): Game {
  const s: Game = {
    version: 1,
    seed: seed || 1,
    players: [],
    deck: [],
    discard: [],
    active: 0,
    turn: 0,
    phase: "action",
    response: null,
    attacks: 0,
    bonusAttacks: 0,
    skillUsed: false,
    damageSkillUsed: false,
    wine: false,
    wineUsed: false,
    logs: [],
    logId: 0,
    table: [],
    winners: null,
    notice: "",
  };
  const roles: Role[] = ["leader", "loyalist", "rebel", "rebel", "renegade"];
  roles.splice(roles.indexOf(role), 1);
  shuffle(s, roles);
  roles.unshift(role);
  const others = shuffle(
    s,
    GENERALS.filter((g) => g.id !== hero).map((g) => g.id),
  );
  s.players = roles.map((r, id) => {
    const g = general(id === 0 ? hero : others[id - 1]);
    const hp = g.hp + (r === "leader" ? 1 : 0);
    return {
      id,
      general: g.id,
      role: r,
      hp,
      maxHp: hp,
      hand: [],
      equipment: {},
      alive: true,
      revealed: r === "leader",
      armorUsed: false,
    };
  });
  let id = 0;
  for (const [kind, count] of Object.entries(COUNTS)) {
    for (let i = 0; i < count; i++) {
      s.deck.push({
        id: ++id,
        kind: kind as CardKind,
        suit: (["♠", "♥", "♣", "♦"] as const)[id % 4],
        rank: [
          "A",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "J",
          "Q",
          "K",
        ][id % 13],
      });
    }
  }
  shuffle(s, s.deck);
  s.players.forEach((p) => draw(s, p.id, 4));
  s.active = s.players.findIndex((p) => p.role === "leader");
  log(s, "五域争锋开始。盟主身份已公开，其余身份隐藏。");
  startTurn(s);
  return s;
}
function startTurn(s: Game) {
  s.turn++;
  s.phase = "action";
  s.attacks = 0;
  s.bonusAttacks = 0;
  s.skillUsed = false;
  s.damageSkillUsed = false;
  s.wine = false;
  s.wineUsed = false;
  s.players.forEach((p) => (p.armorUsed = false));
  const p = s.players[s.active];
  const n = p.general === "xingxiu" ? 3 : 2;
  draw(s, p.id, n);
  log(s, `第 ${s.turn} 回合 · ${name(s, p.id)} 摸了 ${n} 张牌。`);
}
export function distance(s: Game, from: number, to: number) {
  const living = s.players.filter((p) => p.alive);
  const a = living.findIndex((p) => p.id === from),
    b = living.findIndex((p) => p.id === to);
  const raw = Math.min(Math.abs(a - b), living.length - Math.abs(a - b));
  return Math.max(1, raw - (s.players[from].equipment.mount ? 1 : 0));
}
export function attackLimit(s: Game) {
  return (s.players[s.active].general === "fengjiuge" ? 2 : 1) + s.bonusAttacks;
}
export function validTargets(s: Game, kind: CardKind, from = s.active) {
  const p = s.players[from];
  return s.players
    .filter(
      (t) =>
        t.alive &&
        t.id !== from &&
        (!CARDS[kind].range ||
          distance(s, from, t.id) <=
            (kind === "steal" ? 1 : p.equipment.weapon ? 3 : 1)) &&
        (!["steal", "dismantle"].includes(kind) ||
          t.hand.length + Object.keys(t.equipment).length > 0),
    )
    .map((p) => p.id);
}
export function canPlay(s: Game, c: Card) {
  const p = s.players[s.active];
  if (s.phase !== "action" || !p.alive) return false;
  if (CARDS[c.kind].response) return false;
  if (c.kind === "attack" && s.attacks >= attackLimit(s)) return false;
  if (c.kind === "heal" && p.hp >= p.maxHp) return false;
  if (c.kind === "wine" && s.wineUsed) return false;
  return !CARDS[c.kind].target || validTargets(s, c.kind).length > 0;
}
function removeCard(s: Game, p: Player, id: number, table = true) {
  const i = p.hand.findIndex((c) => c.id === id);
  if (i < 0) return undefined;
  const [c] = p.hand.splice(i, 1);
  s.discard.push(c);
  if (table) s.table = [...s.table, c].slice(-5);
  return c;
}
function checkWin(s: Game) {
  const alive = s.players.filter((p) => p.alive);
  if (!alive.some((p) => p.role === "leader")) {
    s.winners =
      alive.length === 1 && alive[0].role === "renegade"
        ? ["renegade"]
        : ["rebel"];
  } else if (!alive.some((p) => p.role === "rebel" || p.role === "renegade"))
    s.winners = ["leader", "loyalist"];
  if (s.winners) {
    s.phase = "over";
    s.response = null;
    log(s, "本局结束。所有身份已揭晓。");
    s.players.forEach((p) => (p.revealed = true));
  }
}
function damage(s: Game, target: number, amount: number, source: number) {
  const p = s.players[target];
  p.hp -= amount;
  log(s, `${name(s, target)} 受到 ${amount} 点伤害。`);
  if (
    source !== target &&
    s.players[source].general === "baininbing" &&
    !s.damageSkillUsed
  ) {
    s.damageSkillUsed = true;
    draw(s, source, 1);
    log(s, `${name(s, source)} 发动「冰魄」，摸一张牌。`);
  }
  if (p.general === "fangzheng" && p.alive) {
    draw(s, target, 1);
    log(s, `${name(s, target)} 发动「血脉」，摸一张牌。`);
  }
  while (p.hp <= 0) {
    const heal = p.hand.find((c) => c.kind === "heal");
    if (!heal) break;
    removeCard(s, p, heal.id);
    p.hp++;
    log(s, `${name(s, target)} 用九叶生机草自救。`);
  }
  if (p.hp <= 0) {
    p.alive = false;
    p.revealed = true;
    log(s, `${name(s, target)} 阵亡，身份揭晓。`);
    s.discard.push(...p.hand.splice(0), ...Object.values(p.equipment));
    p.equipment = {};
    checkWin(s);
    if (!s.winners && source !== target && s.players[source].alive) {
      if (p.role === "rebel") {
        draw(s, source, 3);
        log(s, `${name(s, source)} 击败魔修，摸三张牌。`);
      }
      if (p.role === "loyalist" && s.players[source].role === "leader") {
        const killer = s.players[source];
        s.discard.push(
          ...killer.hand.splice(0),
          ...Object.values(killer.equipment),
        );
        killer.equipment = {};
        log(s, "盟主误杀护法，弃置全部手牌和装备。");
      }
    }
  }
}
function stolen(s: Game, target: number) {
  const p = s.players[target];
  const all = [...p.hand, ...Object.values(p.equipment)];
  if (!all.length) return;
  const c = all[Math.floor(random(s) * all.length)];
  const idx = p.hand.findIndex((x) => x.id === c.id);
  if (idx >= 0) p.hand.splice(idx, 1);
  else delete p.equipment[c.kind as "weapon" | "armor" | "mount"];
  return c;
}
function response(s: Game, r: Response) {
  if (s.winners) return;
  s.response = r;
  s.phase = "response";
  if (r.kind === "attack") {
    const p = s.players[r.target];
    if (p.equipment.armor && !p.armorUsed) {
      p.armorUsed = true;
      if (!s.deck.length) s.deck = shuffle(s, s.discard.splice(0));
      const judged = s.deck.pop();
      if (judged) {
        s.discard.push(judged);
        log(
          s,
          `${name(s, r.target)} 的天蓬蛊判定：${judged.suit}${judged.rank}${isRed(judged) ? "，抵消月刃。" : "，未生效。"}`,
        );
        if (isRed(judged)) {
          finishResponse(s);
        }
      }
    }
  }
}
function finishResponse(s: Game) {
  if (s.winners) return;
  const r = s.response;
  if (r && r.remaining.length) {
    const [target, ...remaining] = r.remaining;
    response(s, { ...r, target, remaining });
    return;
  }
  s.response = null;
  s.phase = "action";
  if (!s.players[s.active].alive) nextTurn(s);
}
function respond(s: Game, id?: number) {
  const r = s.response;
  if (!r || s.phase !== "response") return;
  const p = s.players[r.target];
  const c = p.hand.find((c) => c.id === id && c.kind === r.required);
  if (id !== undefined && !c) return;
  if (c) {
    removeCard(s, p, c.id);
    log(s, `${name(s, p.id)} 打出「${CARDS[c.kind].name}」。`);
    if (r.kind === "duel") {
      response(s, { ...r, source: r.target, target: r.source });
      return;
    }
  } else {
    damage(s, r.target, r.damage, r.source);
    if (s.winners) return;
  }
  finishResponse(s);
}
function nextTurn(s: Game) {
  if (s.winners) return;
  for (let i = 1; i <= s.players.length; i++) {
    const n = (s.active + i) % s.players.length;
    if (s.players[n].alive) {
      s.active = n;
      startTurn(s);
      return;
    }
  }
}
function end(s: Game) {
  const p = s.players[s.active];
  if (s.phase !== "action") return;
  if (p.hand.length > Math.max(0, p.hp)) {
    s.phase = "discard";
    log(
      s,
      `${name(s, p.id)} 需要弃置 ${p.hand.length - Math.max(0, p.hp)} 张牌。`,
    );
  } else nextTurn(s);
}
function play(s: Game, id: number, target?: number) {
  const p = s.players[s.active];
  const c = p.hand.find((c) => c.id === id);
  if (!c || !canPlay(s, c)) return;
  if (
    CARDS[c.kind].target &&
    (target === undefined || !validTargets(s, c.kind).includes(target))
  )
    return;
  removeCard(s, p, id);
  log(
    s,
    `${name(s, p.id)} 使用「${CARDS[c.kind].name}」${target !== undefined ? ` → ${name(s, target)}` : ""}。`,
  );
  switch (c.kind) {
    case "attack": {
      s.attacks++;
      const amount = s.wine ? 2 : 1;
      s.wine = false;
      response(s, {
        source: p.id,
        target: target!,
        kind: "attack",
        required: "dodge",
        damage: amount,
        remaining: [],
      });
      break;
    }
    case "heal":
      p.hp = Math.min(p.maxHp, p.hp + 1);
      break;
    case "draw":
      draw(s, p.id, 2);
      break;
    case "wine":
      s.wine = true;
      s.wineUsed = true;
      break;
    case "weapon":
    case "armor":
    case "mount": {
      const old = p.equipment[c.kind];
      if (old) s.discard.push(old);
      s.discard.splice(
        s.discard.findIndex((x) => x.id === c.id),
        1,
      );
      p.equipment[c.kind] = c;
      break;
    }
    case "steal":
    case "dismantle": {
      const taken = stolen(s, target!);
      if (taken) {
        if (c.kind === "steal") p.hand.push(taken);
        else s.discard.push(taken);
        log(s, `${name(s, target!)} 失去一张牌。`);
      }
      break;
    }
    case "duel":
      response(s, {
        source: p.id,
        target: target!,
        kind: "duel",
        required: "attack",
        damage: 1,
        remaining: [],
      });
      break;
    case "storm":
    case "arrows": {
      const targets = Array.from(
        { length: s.players.length - 1 },
        (_, i) => (p.id + i + 1) % s.players.length,
      ).filter((id) => s.players[id].alive);
      response(s, {
        source: p.id,
        target: targets[0],
        kind: c.kind,
        required: c.kind === "storm" ? "attack" : "dodge",
        damage: 1,
        remaining: targets.slice(1),
      });
      break;
    }
  }
}
function skill(s: Game, ids: number[], target?: number) {
  const p = s.players[s.active],
    g = general(p.general);
  if (s.phase !== "action" || s.skillUsed || !g.active) return;
  const cards = [...new Set(ids)]
    .map((id) => p.hand.find((c) => c.id === id))
    .filter((c): c is Card => !!c);
  if (p.general === "fangyuan") {
    if (cards.length !== 2) return;
    cards.forEach((c) => removeCard(s, p, c.id));
    draw(s, p.id, 3);
  } else if (p.general === "he Loulan") {
    if (p.hp <= 1) return;
    p.hp--;
    draw(s, p.id, 2);
    s.bonusAttacks++;
  } else if (p.general === "taibai") {
    const t = s.players[target ?? -1];
    if (cards.length !== 1 || !t?.alive || t.hp >= t.maxHp) return;
    removeCard(s, p, cards[0].id);
    t.hp++;
  } else if (p.general === "yingwuxie") {
    const t = s.players[target ?? -1];
    if (cards.length !== 1 || !t?.alive || t.id === p.id || !t.hand.length)
      return;
    removeCard(s, p, cards[0].id);
    const n = Math.floor(random(s) * t.hand.length);
    s.discard.push(...t.hand.splice(n, 1));
  }
  s.skillUsed = true;
  log(s, `${g.name} 发动「${g.skill}」。`);
}
export function hostility(s: Game, from: number, to: number) {
  const a = s.players[from],
    b = s.players[to];
  if (from === to) return -100;
  const rebels = s.players.filter((p) => p.alive && p.role === "rebel").length;
  if (a.role === "leader" || a.role === "loyalist") {
    if (b.role === "leader") return -100;
    if (!b.revealed)
      return (
        3 +
        (s.logs.some((l) =>
          l.text.includes(
            `${name(s, to)} 使用「月刃」 → ${name(s, s.players.find((p) => p.role === "leader")!.id)}`,
          ),
        )
          ? 5
          : 0)
      );
    return b.role === "loyalist" ? -20 : 10;
  }
  if (a.role === "rebel") {
    if (b.role === "leader") return 12;
    if (!b.revealed) return 3;
    return b.role === "rebel" ? -10 : 7;
  }
  if (s.players.filter((p) => p.alive).length === 2) return 12;
  if (b.role === "leader") return rebels > 0 ? -10 : 0;
  return 8;
}
function value(c: Card, p: Player) {
  return {
    heal: p.hp < p.maxHp ? 10 : 7,
    dodge: 8,
    attack: 5,
    draw: 9,
    wine: 3,
    duel: 4,
    storm: 4,
    arrows: 4,
    steal: 6,
    dismantle: 5,
    weapon: p.equipment.weapon ? 1 : 6,
    armor: p.equipment.armor ? 1 : 8,
    mount: p.equipment.mount ? 1 : 5,
  }[c.kind];
}
export function aiDecision(s: Game): Action {
  if (s.phase === "response") {
    const p = s.players[s.response!.target];
    return {
      type: "respond",
      cardId: p.hand.find((c) => c.kind === s.response!.required)?.id,
    };
  }
  const p = s.players[s.active];
  if (s.phase === "discard")
    return {
      type: "discard",
      cardIds: [...p.hand]
        .sort((a, b) => value(a, p) - value(b, p))
        .slice(0, p.hand.length - Math.max(0, p.hp))
        .map((c) => c.id),
    };
  const low = [...p.hand].sort((a, b) => value(a, p) - value(b, p));
  if (!s.skillUsed) {
    if (p.general === "fangyuan" && p.hand.length >= 4)
      return { type: "skill", cardIds: low.slice(0, 2).map((c) => c.id) };
    if (p.general === "he Loulan" && p.hp > 2)
      return { type: "skill", cardIds: [] };
    if (p.general === "taibai" && low.length) {
      const ally = s.players
        .filter(
          (t) =>
            t.alive &&
            t.hp < t.maxHp &&
            (t.id === p.id || hostility(s, p.id, t.id) < 0),
        )
        .sort((a, b) => a.hp - b.hp)[0];
      if (ally) return { type: "skill", cardIds: [low[0].id], target: ally.id };
    }
    if (p.general === "yingwuxie" && low.length) {
      const enemy = s.players
        .filter(
          (t) =>
            t.alive &&
            t.id !== p.id &&
            t.hand.length &&
            hostility(s, p.id, t.id) > 0,
        )
        .sort((a, b) => hostility(s, p.id, b.id) - hostility(s, p.id, a.id))[0];
      if (enemy)
        return { type: "skill", cardIds: [low[0].id], target: enemy.id };
    }
  }
  const order: CardKind[] = [
    "heal",
    "draw",
    "armor",
    "weapon",
    "mount",
    "steal",
    "dismantle",
    "wine",
    "attack",
    "duel",
    "arrows",
    "storm",
  ];
  for (const kind of order) {
    const c = p.hand.find((c) => c.kind === kind && canPlay(s, c));
    if (!c) continue;
    if (
      kind === "wine" &&
      (!p.hand.some((c) => c.kind === "attack") || s.attacks >= attackLimit(s))
    )
      continue;
    if (
      ["armor", "weapon", "mount"].includes(kind) &&
      p.equipment[kind as "armor" | "weapon" | "mount"]
    )
      continue;
    if (kind === "arrows" || kind === "storm") {
      const score = s.players
        .filter((t) => t.alive && t.id !== p.id)
        .reduce((n, t) => n + Math.sign(hostility(s, p.id, t.id)), 0);
      if (score <= 0) continue;
    }
    if (CARDS[kind].target) {
      const targets = validTargets(s, kind)
        .filter((id) => hostility(s, p.id, id) > 0)
        .sort(
          (a, b) =>
            hostility(s, p.id, b) -
            s.players[b].hp / 3 -
            (hostility(s, p.id, a) - s.players[a].hp / 3),
        );
      if (!targets.length) continue;
      return { type: "play", cardId: c.id, target: targets[0] };
    }
    return { type: "play", cardId: c.id };
  }
  return { type: "end" };
}
export function reduceGame(state: Game, action: Action): Game {
  if (state.phase === "over") return state;
  const s = structuredClone(state);
  if (action.type === "ai") action = aiDecision(s);
  switch (action.type) {
    case "play":
      play(s, action.cardId, action.target);
      break;
    case "skill":
      skill(s, action.cardIds, action.target);
      break;
    case "end":
      end(s);
      break;
    case "respond":
      respond(s, action.cardId);
      break;
    case "discard": {
      if (s.phase !== "discard") break;
      const p = s.players[s.active];
      const ids = [...new Set(action.cardIds)];
      if (
        ids.length !== p.hand.length - Math.max(0, p.hp) ||
        ids.some((id) => !p.hand.some((c) => c.id === id))
      )
        break;
      ids.forEach((id) => removeCard(s, p, id, false));
      log(s, `${name(s, p.id)} 弃置了 ${ids.length} 张牌。`);
      nextTurn(s);
      break;
    }
  }
  return s;
}
export function humanActing(s: Game) {
  return s.phase === "response"
    ? s.response?.target === 0
    : s.active === 0 && s.phase !== "over";
}
