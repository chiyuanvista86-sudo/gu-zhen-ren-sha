import React, { useEffect, useRef, useState } from "react";
import { download } from './download';
import {
  BookOpen,
  Settings,
  Volume2,
  VolumeX,
  ChevronRight,
  RotateCcw,
  ScrollText,
  X,
  Flag,
  Shield,
  Swords,
  Eye,
  Play,
  ArrowRight,
  Check,
  Download,
  HelpCircle,
  Layers,
  Clock,
  Pause,
} from "lucide-react";
import { CARDS, COUNTS, GENERALS, ROLES, general } from "./data";
import type { Card, CardKind, GeneralId, Role } from "./data";
import {
  createGame,
  reduceGame,
  humanActing,
  validTargets,
  canPlay,
  attackLimit,
  distance,
} from "./engine";
import type { Game, Player } from "./engine";
import { GuMark } from "./Art";
import { Portrait } from "./ClassicArt";
import { CardFace } from "./CardFace";
import { GENERAL_DESIGN, CARD_DESIGN, designMarkdown } from "./design";
import { read, write, savedGame } from "./storage";
import "./style.css";
import "./classic.css";
type Modal = "rules" | "settings" | "generals" | "restart" | "design" | null;
export default function LegacyApp() {
  const [game, setGame] = useState<Game | null>(savedGame),
    [hero, setHero] = useState<GeneralId>("fangyuan"),
    [role, setRole] = useState<Role>("rebel"),
    [screen, setScreen] = useState<"lobby" | "game">(() =>
      savedGame() ? "game" : "lobby",
    );
  const [selected, setSelected] = useState<number[]>([]),
    [target, setTarget] = useState<number | null>(null),
    [skillMode, setSkillMode] = useState(false),
    [modal, setModal] = useState<Modal>(null),
    [tab, setTab] = useState<"logs" | "identity">("logs");
  const [inspected, setInspected] = useState<CardKind>("attack");
  const [speed, setSpeed] = useState(() => read("speed", 650)),
    [sound, setSound] = useState(() => read("sound", false)),
    [paused, setPaused] = useState(false),
    [stats, setStats] = useState(() =>
      read("stats", { played: 0, won: 0, last: "" }),
    );
  const logEnd = useRef<HTMLDivElement>(null),
    logList = useRef<HTMLDivElement>(null),
    audio = useRef<AudioContext | null>(null);
  const me = game?.players[0],
    g = me ? general(me.general) : null,
    acting = game ? humanActing(game) : false;
  const selectedCard = me?.hand.find((c) => c.id === selected[0]);
  function clear() {
    setSelected([]);
    setTarget(null);
    setSkillMode(false);
  }
  function dispatch(action: Parameters<typeof reduceGame>[1]) {
    setGame((s) => (s ? reduceGame(s, action) : s));
    clear();
  }
  function start() {
    setGame(createGame(hero, role));
    setScreen("game");
    setPaused(false);
    clear();
    setModal(null);
  }
  useEffect(() => {
    if (game) write("game", game);
  }, [game]);
  useEffect(() => {
    write("speed", speed);
    write("sound", sound);
  }, [speed, sound]);
  useEffect(() => {
    if (
      !game ||
      screen !== "game" ||
      game.phase === "over" ||
      humanActing(game) ||
      paused ||
      modal
    )
      return;
    const timer = setTimeout(
      () => setGame((s) => (s ? reduceGame(s, { type: "ai" }) : s)),
      speed,
    );
    return () => clearTimeout(timer);
  }, [game, screen, speed, paused, modal]);
  useEffect(() => {
    if (logList.current)
      logList.current.scrollTop = logList.current.scrollHeight;
    if (sound && game && screen === "game") {
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume();
        const o = audio.current.createOscillator(),
          v = audio.current.createGain();
        o.type = "sine";
        o.frequency.value = game.phase === "response" ? 440 : 280;
        v.gain.setValueAtTime(0.035, audio.current.currentTime);
        v.gain.exponentialRampToValueAtTime(
          0.001,
          audio.current.currentTime + 0.12,
        );
        o.connect(v);
        v.connect(audio.current.destination);
        o.start();
        o.stop(audio.current.currentTime + 0.13);
      } catch {
        /* Audio is optional. */
      }
    }
  }, [game?.logId, sound, screen]);
  useEffect(() => {
    if (game?.phase === "over") {
      const key =
        game.players.map((p) => p.general + p.role).join("") +
        game.logs[0]?.id +
        game.turn +
        game.logId;
      if (stats.last !== key) {
        const next = {
          played: stats.played + 1,
          won:
            stats.won + (game.winners?.includes(game.players[0].role) ? 1 : 0),
          last: key,
        };
        setStats(next);
        write("stats", next);
      }
    }
  }, [game, stats]);
  function chooseCard(c: Card) {
    if (!game || !acting || paused) return;
    if (skillMode || game.phase === "discard") {
      setSelected((xs) =>
        xs.includes(c.id) ? xs.filter((x) => x !== c.id) : [...xs, c.id],
      );
    } else if (game.phase === "response") {
      if (c.kind === game.response?.required) setSelected([c.id]);
    } else if (canPlay(game, c)) {
      setSelected((xs) => (xs[0] === c.id ? [] : [c.id]));
      setTarget(null);
    }
  }
  function targets(): number[] {
    if (!game || !acting || paused) return [];
    if (skillMode) {
      if (me?.general === "taibai")
        return game.players
          .filter((p) => p.alive && p.hp < p.maxHp)
          .map((p) => p.id);
      if (me?.general === "yingwuxie")
        return game.players
          .filter((p) => p.alive && p.id !== 0 && p.hand.length)
          .map((p) => p.id);
      return [];
    }
    if (
      selectedCard &&
      game.phase === "action" &&
      CARDS[selectedCard.kind].target
    )
      return validTargets(game, selectedCard.kind);
    return [];
  }
  const legalTargets = targets();
  const skillNeed =
    me?.general === "fangyuan" ? 2 : me?.general === "he Loulan" ? 0 : 1;
  const skillTarget = me?.general === "taibai" || me?.general === "yingwuxie";
  const confirmOK =
    !!game &&
    acting &&
    !paused &&
    (game.phase === "discard"
      ? selected.length === me!.hand.length - Math.max(0, me!.hp)
      : skillMode
        ? selected.length === skillNeed && (!skillTarget || target !== null)
        : game.phase === "response"
          ? !!selectedCard
          : !!selectedCard &&
            (!CARDS[selectedCard.kind].target || target !== null));
  function confirm() {
    if (!confirmOK || !game) return;
    if (game.phase === "discard")
      dispatch({ type: "discard", cardIds: selected });
    else if (game.phase === "response")
      dispatch({ type: "respond", cardId: selected[0] });
    else if (skillMode)
      dispatch({
        type: "skill",
        cardIds: selected,
        target: target ?? undefined,
      });
    else
      dispatch({
        type: "play",
        cardId: selected[0],
        target: target ?? undefined,
      });
  }
  function exportLog() {
    if (!game) return;
    download("gu-zhen-ren-sha-record.json", JSON.stringify(
          {
            title: "蛊真人杀对局记录",
            exported: new Date().toISOString(),
            players: game.players.map((p) => ({
              name: general(p.general).name,
              role: ROLES[p.role].name,
              alive: p.alive,
            })),
            logs: game.logs,
          },
          null,
          2,
        ), "application/json");
  }
  function exportDesign() {
    download("蛊真人杀-设计清单.md", designMarkdown());
  }
  let hint = "等待其他角色行动…";
  if (game && acting) {
    if (game.phase === "response")
      hint = `${general(game.players[game.response!.source].general).name} 的${CARDS[game.response!.kind === "attack" ? "attack" : game.response!.kind].name}：请打出${CARDS[game.response!.required].name}，否则受到 ${game.response!.damage} 点伤害。`;
    else if (game.phase === "discard")
      hint = `弃牌阶段：选择 ${me!.hand.length - Math.max(0, me!.hp)} 张手牌弃置。`;
    else if (skillMode)
      hint = `${g!.skill}：${skillNeed ? `选择 ${skillNeed} 张手牌` : "失去一点体力，摸两张牌"}${skillTarget ? "，再选择一名角色" : ""}。`;
    else if (selectedCard)
      hint = CARDS[selectedCard.kind].target
        ? "请点击一名高亮角色，再确认出牌。"
        : "点击「确认出牌」使用这张牌。";
    else hint = "出牌阶段：选择手牌或发动技能。";
  }
  const head = (
    <header className="topbar">
      <button
        className="brand"
        onClick={() => setScreen("lobby")}
        aria-label="返回大厅"
      >
        <span className="brand-seal">蛊</span>
        <span>
          蛊真人杀<small>GU ZHEN REN SHA</small>
        </span>
      </button>
      <nav>
        <button
          className={screen === "game" ? "nav-active" : ""}
          onClick={() => (game ? setScreen("game") : setScreen("lobby"))}
        >
          <Swords size={15} />
          五域争锋
        </button>
        <button onClick={() => setModal("generals")}>
          <Layers size={15} />
          蛊师图鉴
        </button>
        <button onClick={() => setModal("rules")}>
          <BookOpen size={15} />
          玩法指南
        </button>
        <button onClick={() => setModal("design")}>
          <ScrollText size={15} />
          设计清单
        </button>
      </nav>
      <div className="top-right">
        <span className="offline-dot" />
        单人 · 离线可玩
        <button
          className="icon-btn"
          aria-label={sound ? "关闭音效" : "开启音效"}
          onClick={() => setSound(!sound)}
        >
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          className="icon-btn"
          aria-label="设置"
          onClick={() => setModal("settings")}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
  return (
    <>
      {head}
      {screen === "lobby" ? (
        <main className="lobby">
          <section className="lobby-intro">
            <div className="eyebrow">
              <span />
              同人策略卡牌 · 五人身份局
            </div>
            <h1>
              天地为局，
              <br />
              万蛊争锋<span>。</span>
            </h1>
            <p>
              一张蛊牌，一步算计。
              <br />
              入局五域，与四位蛊师争夺最后的生机。
            </p>
            <div className="lobby-meta">
              <span>
                <Swords size={16} /> 1 位玩家 + 4 位 AI
              </span>
              <span>
                <Clock size={16} /> 约 10–20 分钟
              </span>
            </div>
            <div className="hero-quote">
              「{general(hero).quote}」<small>—— {general(hero).name}</small>
            </div>
            <div className="stats">
              <div>
                <strong>{stats.played.toString().padStart(2, "0")}</strong>
                <span>历练场次</span>
              </div>
              <div>
                <strong>{stats.won.toString().padStart(2, "0")}</strong>
                <span>胜场</span>
              </div>
              <div>
                <strong>08</strong>
                <span>可选蛊师</span>
              </div>
            </div>
          </section>
          <section className="choose-panel">
            <div className="section-label">
              <span>01 / 选择本命蛊师</span>
              <span>八位蛊师 · 各有天命</span>
            </div>
            <div className="general-grid">
              {GENERALS.map((x) => (
                <button
                  key={x.id}
                  className={`general-option ${hero === x.id ? "chosen" : ""}`}
                  onClick={() => setHero(x.id)}
                  aria-pressed={hero === x.id}
                >
                  <Portrait id={x.id} />
                  <span className="general-path">{x.path}</span>
                  <div>
                    <strong>{x.name}</strong>
                    <small>{x.title}</small>
                  </div>
                  {hero === x.id && (
                    <span className="chosen-check">
                      <Check size={13} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="chosen-skill">
              <span className="skill-tag">{general(hero).skill}</span>
              <p>{general(hero).text}</p>
              <span className="life-preview">
                {"◆".repeat(general(hero).hp)}
              </span>
            </div>
            <div className="section-label role-label">
              <span>02 / 选择入局身份</span>
              <HelpCircle size={14} />
            </div>
            <div className="role-options">
              {(Object.keys(ROLES) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={role === r ? "selected" : ""}
                  style={{ "--role": ROLES[r].color } as React.CSSProperties}
                >
                  <span>{ROLES[r].short}</span>
                  {ROLES[r].name}
                </button>
              ))}
            </div>
            <p className="goal-preview">{ROLES[role].goal}</p>
            <div className="start-row">
              <button className="primary start" onClick={start}>
                踏入五域 <ArrowRight size={19} />
              </button>
              {game && (
                <button className="secondary" onClick={() => setScreen("game")}>
                  <Play size={15} />
                  继续对局
                </button>
              )}
            </div>
          </section>
          <footer>
            蛊真人同人作品 · 非官方 · 原创规则改编与写意插画
            <span>v1.1.0 / 经典牌桌 · 本地存档</span>
          </footer>
        </main>
      ) : game && me && g ? (
        <main className="game-layout">
          <section className="battle">
            <div className="battle-toolbar">
              <span>
                <span className="tiny-seal">局</span> 五域争锋{" "}
                <em>五人身份场</em>
              </span>
              <div>
                <span className="turn-label">第 {game.turn} 回合</span>
                <button
                  className="icon-btn"
                  aria-label={paused ? "继续 AI" : "暂停 AI"}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? <Play size={15} /> : <Pause size={15} />}
                </button>
                <button
                  className="icon-btn"
                  aria-label="重新开始"
                  onClick={() => setModal("restart")}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
            <div className="opponents">
              {game.players.slice(1).map((p) => (
                <Seat
                  key={p.id}
                  p={p}
                  game={game}
                  selected={target === p.id}
                  targetable={legalTargets.includes(p.id)}
                  onClick={() => legalTargets.includes(p.id) && setTarget(p.id)}
                />
              ))}
            </div>
            <div className="table-field">
              <div className="table-watermark">
                <GuMark />
                <strong>五 域 争 锋</strong>
                <small>万物皆可炼，人心最难测</small>
              </div>
              <div className="deck-badge">
                <Layers size={18} />
                <span>
                  {game.deck.length}
                  <small>牌堆</small>
                </span>
                <i />
                {game.discard.length}
                <small>弃牌</small>
              </div>
              <div className="phase-track" aria-label="回合阶段">
                {["准备", "摸牌", "出牌", "弃牌", "结束"].map((phase, i) => (
                  <span
                    key={phase}
                    className={
                      (game.phase === "action" && i === 2) ||
                      (game.phase === "discard" && i === 3)
                        ? "current"
                        : ""
                    }
                  >
                    {phase}
                  </span>
                ))}
                {game.phase === "response" && <b>响应中</b>}
              </div>
              <div className="table-cards">
                {game.table.slice(-4).map((c, i) => (
                  <div
                    key={`${c.id}-${i}`}
                    className="played-card classic-played"
                    style={{ transform: `rotate(${(i - 1.5) * 4}deg)` }}
                  >
                    <CardFace card={c} />
                  </div>
                ))}
              </div>
              <div className="table-status">
                {game.phase === "over"
                  ? "此局已终，天命已定"
                  : paused
                    ? "对局已暂停"
                    : game.phase === "response"
                      ? `${general(game.players[game.response!.target].general).name} 正在响应…`
                      : `${general(game.players[game.active].general).name} · ${game.phase === "discard" ? "弃牌阶段" : "出牌阶段"}`}
              </div>
            </div>
            <div className={`action-bar ${acting ? "your-action" : ""}`}>
              <span role="status" aria-live="polite">
                <span className="status-dot" />
                {paused ? "已暂停，点击右上角播放按钮继续。" : hint}
              </span>
              <div>
                {(selected.length > 0 || skillMode) && (
                  <button className="text-btn" onClick={clear}>
                    取消
                  </button>
                )}
                <button
                  className="primary"
                  disabled={!confirmOK}
                  onClick={confirm}
                >
                  {game.phase === "discard"
                    ? "确认弃牌"
                    : skillMode
                      ? "发动技能"
                      : game.phase === "response"
                        ? "打出响应"
                        : "确认出牌"}
                </button>
                {game.phase === "response" && acting ? (
                  <button
                    className="secondary"
                    disabled={paused}
                    onClick={() => dispatch({ type: "respond" })}
                  >
                    承受伤害
                  </button>
                ) : (
                  <button
                    className="secondary"
                    disabled={!acting || paused || game.phase !== "action"}
                    onClick={() => dispatch({ type: "end" })}
                  >
                    结束回合
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
            <div className="player-zone">
              <button
                className={`self-seat ${game.active === 0 ? "active" : ""} ${target === 0 ? "target-selected" : ""}`}
                disabled={!legalTargets.includes(0)}
                onClick={() => setTarget(0)}
              >
                <Portrait id={me.general} />
                <span
                  className="self-identity"
                  style={
                    {
                      "--identity": ROLES[me.role].color,
                    } as React.CSSProperties
                  }
                >
                  {ROLES[me.role].short}
                </span>
                <span className="self-path">{g.path}</span>
                <div className="self-caption">
                  <span style={{ color: ROLES[me.role].color }}>
                    {ROLES[me.role].name} · 你
                  </span>
                  <strong>{g.name}</strong>
                  <div className="hp" aria-label={`体力 ${me.hp}/${me.maxHp}`}>
                    {Array.from({ length: me.maxHp }, (_, i) => (
                      <i key={i} className={i < me.hp ? "filled" : ""} />
                    ))}
                  </div>
                </div>
              </button>
              <div className="hand-area">
                <div className="hand-heading">
                  <span>
                    你的手牌 <b>{me.hand.length}</b>
                    <small>上限 {Math.max(0, me.hp)}</small>
                  </span>
                  <span>
                    {game.active === 0
                      ? `月刃 ${game.attacks}/${attackLimit(game)}`
                      : "等待回合"}
                    {game.wine ? " · 酒虫生效" : ""}
                  </span>
                </div>
                <div
                  className={`hand-cards ${me.hand.length > 6 ? "crowded-hand" : ""}`}
                  style={
                    { "--hand-count": me.hand.length } as React.CSSProperties
                  }
                >
                  {me.hand.length ? (
                    me.hand.map((c) => (
                      <button
                        key={c.id}
                        className={`hand-card ${selected.includes(c.id) ? "picked" : ""} ${acting && (skillMode || game.phase === "discard" || (game.phase === "response" && c.kind === game.response?.required) || (game.phase === "action" && canPlay(game, c))) ? "playable" : "unplayable"}`}
                        onClick={() => chooseCard(c)}
                        aria-label={`${CARDS[c.kind].name} ${c.suit}${c.rank}`}
                        aria-pressed={selected.includes(c.id)}
                        title={CARDS[c.kind].text}
                        onMouseEnter={() => setInspected(c.kind)}
                        onFocus={() => setInspected(c.kind)}
                      >
                        <CardFace card={c} />
                        {selected.includes(c.id) && (
                          <span className="card-selected-mark">
                            <Check size={12} />
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <span className="no-cards">空空如也，静待时机。</span>
                  )}
                </div>
                <div className="equipment-row">
                  <Shield size={13} />
                  {(["weapon", "armor", "mount"] as const).map((k) => (
                    <span key={k} className={me.equipment[k] ? "equipped" : ""}>
                      {me.equipment[k]
                        ? CARDS[me.equipment[k]!.kind].name
                        : {
                            weapon: "武器空位",
                            armor: "防御空位",
                            mount: "身法空位",
                          }[k]}
                    </span>
                  ))}
                  <span className="auto-save">
                    <Check size={11} />
                    自动存档
                  </span>
                </div>
              </div>
              <div className="skill-panel">
                <span className="eyebrow">本命技能</span>
                <button
                  className={`skill-button ${skillMode ? "skill-on" : ""}`}
                  disabled={
                    !g.active ||
                    !acting ||
                    paused ||
                    game.phase !== "action" ||
                    game.skillUsed ||
                    (me.general === "he Loulan" && me.hp <= 1)
                  }
                  onClick={() => {
                    clear();
                    setSkillMode(true);
                  }}
                >
                  {g.skill}
                  <small>
                    {g.active
                      ? game.skillUsed
                        ? "本回合已使用"
                        : "点击发动"
                      : "被动技能"}
                  </small>
                </button>
                <p>{g.text}</p>
              </div>
            </div>
          </section>
          <aside className="side-panel">
            <div className="side-tabs">
              <button
                className={tab === "logs" ? "on" : ""}
                onClick={() => setTab("logs")}
              >
                <ScrollText size={14} />
                战局记录
              </button>
              <button
                className={tab === "identity" ? "on" : ""}
                onClick={() => setTab("identity")}
              >
                <Eye size={14} />
                身份
              </button>
            </div>
            {tab === "logs" ? (
              <>
                <div className="log-list" ref={logList}>
                  {game.logs.map((l) => (
                    <div
                      key={l.id}
                      className={l.text.includes("回合") ? "log-turn" : ""}
                    >
                      <span>{String(l.id).padStart(2, "0")}</span>
                      <p>{l.text}</p>
                    </div>
                  ))}
                  <div ref={logEnd} />
                </div>
                <button className="export-btn" onClick={exportLog}>
                  <Download size={13} />
                  导出对局记录
                </button>
              </>
            ) : (
              <div className="identity-info">
                <span
                  className="big-role"
                  style={{ color: ROLES[me.role].color }}
                >
                  {ROLES[me.role].short}
                </span>
                <h3>你的身份：{ROLES[me.role].name}</h3>
                <p>{ROLES[me.role].goal}</p>
                <hr />
                <small>身份配置</small>
                <p>
                  盟主 × 1 · 护法 × 1<br />
                  魔修 × 2 · 独行者 × 1
                </p>
                <p>盟主公开身份并增加一点体力上限。其余角色阵亡后揭晓身份。</p>
                <small>
                  本版本采用自动濒死自救；角色会自动消耗自己的生机草。
                </small>
              </div>
            )}
            <div className="side-tip card-inspector">
              <div className="inspector-heading">
                <Flag size={13} />
                蛊牌详解 <small>悬停 / 选中手牌</small>
              </div>
              <div className="inspector-content">
                <div className="inspector-card">
                  <CardFace
                    card={
                      selectedCard ?? {
                        id: -1,
                        kind: inspected,
                        suit: "♠",
                        rank: "A",
                      }
                    }
                  />
                </div>
                <div>
                  <strong>{CARDS[selectedCard?.kind ?? inspected].name}</strong>
                  <small>
                    {CARDS[selectedCard?.kind ?? inspected].category}
                  </small>
                  <p>{CARDS[selectedCard?.kind ?? inspected].text}</p>
                </div>
              </div>
            </div>
          </aside>
          {game.phase === "over" && (
            <div className="end-overlay">
              <div className="result-card">
                <span className="eyebrow">五域战报</span>
                <GuMark />
                <h2>
                  {game.winners?.includes(me.role)
                    ? "此局，得道。"
                    : "身陨，道未消。"}
                </h2>
                <p>
                  {game.winners?.map((r) => ROLES[r].name).join("与")}获胜 · 共{" "}
                  {game.turn} 回合
                </p>
                <div className="result-players">
                  {game.players.map((p) => (
                    <div key={p.id}>
                      <strong>
                        {general(p.general).name}
                        {p.id === 0 ? "（你）" : ""}
                      </strong>
                      <span style={{ color: ROLES[p.role].color }}>
                        {ROLES[p.role].name}
                      </span>
                      <small>{p.alive ? "存活" : "阵亡"}</small>
                    </div>
                  ))}
                </div>
                <div className="result-buttons">
                  <button
                    className="primary"
                    onClick={() => {
                      setScreen("lobby");
                      clear();
                    }}
                  >
                    再入轮回
                    <RotateCcw size={15} />
                  </button>
                  <button className="secondary" onClick={exportLog}>
                    导出战报
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : null}
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className={`modal ${modal === "generals" || modal === "design" ? "wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "settings"
                ? "设置"
                : modal === "rules"
                  ? "玩法指南"
                  : modal === "restart"
                    ? "重新开始"
                    : modal === "design"
                      ? "设计清单"
                      : "蛊师图鉴"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close icon-btn"
              aria-label="关闭"
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>
            {modal === "rules" ? (
              <>
                <span className="eyebrow">THE WAY OF GU</span>
                <h2>入局之前</h2>
                <p>
                  你与四位 AI 进行五人身份对战。盟主先行动，按座位顺序轮流进行。
                </p>
                <h3>一回合如何进行</h3>
                <p>
                  ① 自动摸两张牌 → ② 使用手牌或技能 → ③ 结束回合 → ④
                  若手牌超过当前体力，选择多余手牌弃置。响应期间请选择对应牌，或承受伤害。
                </p>
                <h3>四种身份</h3>
                {(Object.keys(ROLES) as Role[]).map((r) => (
                  <p key={r}>
                    <b style={{ color: ROLES[r].color }}>{ROLES[r].name}：</b>
                    {ROLES[r].goal}
                  </p>
                ))}
                <h3>关键规则</h3>
                <p>
                  月刃每回合限一次，基础范围为一；距离按存活座位取较短方向。斗蛊轮流响应月刃，兽潮响应月刃，万羽响应移形蛊。酒虫仅强化本回合下一张月刃。天蓬蛊每回合限判定一次。
                </p>
                <p>
                  体力降至零时，自动使用自己的生机草自救，无法自救则阵亡。击败魔修摸三张牌；盟主误杀护法弃置全部手牌与装备。阵亡后可继续观战。
                </p>
                <h3>本作范围</h3>
                <p>
                  本作是蛊真人题材的独立同人改编，采用简化身份规则；AI
                  依自身身份和公开行为选择目标。当前支持单人离线对战，不含联网、无懈可击、延时锦囊或他人濒死救援。
                </p>
              </>
            ) : modal === "settings" ? (
              <>
                <span className="eyebrow">PREFERENCES</span>
                <h2>对局设置</h2>
                <label className="setting">
                  AI 行动速度
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  >
                    <option value={1000}>悠然 · 1 秒</option>
                    <option value={650}>标准 · 0.65 秒</option>
                    <option value={200}>迅捷 · 0.2 秒</option>
                  </select>
                </label>
                <label className="setting">
                  蛊牌音效
                  <input
                    type="checkbox"
                    checked={sound}
                    onChange={(e) => setSound(e.target.checked)}
                  />
                </label>
                <p>设置和对局进度自动保存在当前浏览器。关闭页面后可继续。</p>
              </>
            ) : modal === "restart" ? (
              <>
                <span className="eyebrow">NEW JOURNEY</span>
                <h2>另开一局</h2>
                <p>
                  返回大厅重新选将。开始新局后，当前对局的自动存档会被替换。
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setScreen("lobby");
                    setModal(null);
                    clear();
                  }}
                >
                  返回选将
                </button>
              </>
            ) : modal === "design" ? (
              <>
                <span className="eyebrow">CURRENT DESIGN · 可按编号修改</span>
                <h2>卡牌与人物技能设计清单</h2>
                <p>
                  以下为当前已经实现的规则与原型设计理由。本次只调整
                  UI，技能效果与数量保持原样，尚未完成角色胜率平衡。
                </p>
                <button className="secondary" onClick={exportDesign}>
                  <Download size={14} />
                  下载完整清单
                </button>
                <h3>人物技能 · G01–G08</h3>
                <div className="design-table-wrap">
                  <table className="design-table">
                    <thead>
                      <tr>
                        <th>编号 / 人物</th>
                        <th>体力与技能</th>
                        <th>当前效果</th>
                        <th>设计思路与边界</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GENERALS.map((x, i) => (
                        <tr key={x.id}>
                          <td>
                            G{String(i + 1).padStart(2, "0")}
                            <b>{x.name}</b>
                          </td>
                          <td>
                            {x.hp} 体力<b>{x.skill}</b>
                            {x.active ? "主动" : "被动"}
                          </td>
                          <td>{x.text}</td>
                          <td>
                            {GENERAL_DESIGN[x.id].idea}
                            <small>{GENERAL_DESIGN[x.id].review}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h3>蛊牌 · C01–C13</h3>
                <div className="design-table-wrap">
                  <table className="design-table">
                    <thead>
                      <tr>
                        <th>编号 / 蛊牌</th>
                        <th>数量 / 参考</th>
                        <th>当前效果</th>
                        <th>设计思路与边界</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.keys(CARDS) as CardKind[]).map((kind, i) => (
                        <tr key={kind}>
                          <td>
                            C{String(i + 1).padStart(2, "0")}
                            <b>{CARDS[kind].name}</b>
                          </td>
                          <td>
                            {COUNTS[kind]} 张
                            <b>{CARD_DESIGN[kind].reference}</b>
                          </td>
                          <td>{CARDS[kind].text}</td>
                          <td>
                            {CARD_DESIGN[kind].idea}
                            <small>{CARD_DESIGN[kind].review}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  修改示例：G01 方源，炼蛊改为……；C06
                  盗天手，允许指定装备……。名称、体力、技能数、代价、次数、目标、牌数和全局规则都可以提出修改。
                </p>
              </>
            ) : (
              <>
                <span className="eyebrow">GU MASTERS</span>
                <h2>蛊师图鉴</h2>
                <div className="codex-grid">
                  {GENERALS.map((x) => (
                    <article key={x.id}>
                      <Portrait id={x.id} large />
                      <div>
                        <span className="eyebrow">
                          {x.title} · {x.path}
                        </span>
                        <h3>
                          {x.name}
                          <small>{"◆".repeat(x.hp)}</small>
                        </h3>
                        <b>{x.skill}</b>
                        <p>{x.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <h3>蛊牌图鉴 · 十三类蛊牌</h3>
                <div className="cards-collection">
                  {(Object.keys(CARDS) as CardKind[]).map((kind, i) => (
                    <article key={kind}>
                      <div className="collection-face">
                        <CardFace
                          card={{
                            id: -i,
                            kind,
                            suit: i % 2 ? "♥" : "♠",
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
                            ][i],
                          }}
                        />
                      </div>
                      <b>
                        C{String(i + 1).padStart(2, "0")} · {COUNTS[kind]} 张
                      </b>
                      <p>{CARDS[kind].text}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
function Seat({
  p,
  game,
  selected,
  targetable,
  onClick,
}: {
  p: Player;
  game: Game;
  selected: boolean;
  targetable: boolean;
  onClick: () => void;
}) {
  const g = general(p.general);
  return (
    <button
      className={`seat seat-${p.id} ${game.active === p.id ? "active" : ""} ${!p.alive ? "dead" : ""} ${targetable ? "targetable" : ""} ${selected ? "target-selected" : ""}`}
      style={
        {
          "--general-color": g.color,
          "--identity": p.revealed ? ROLES[p.role].color : "#8b8069",
        } as React.CSSProperties
      }
      onClick={onClick}
      aria-label={`${g.name}，${p.alive ? `体力 ${p.hp}/${p.maxHp}` : "已阵亡"}${targetable ? "，可选择为目标" : ""}`}
      aria-pressed={selected}
    >
      <div className="seat-art">
        <Portrait id={p.general} />
        <span className="seat-number">
          {["一", "二", "三", "四", "五"][p.id]}号位
        </span>
        <span
          className="role-badge"
          style={{
            borderColor: p.revealed ? ROLES[p.role].color : undefined,
            color: p.revealed ? ROLES[p.role].color : undefined,
          }}
        >
          {p.revealed ? ROLES[p.role].short : "?"}
        </span>
        <span className="seat-title">{g.title}</span>
        {!p.alive && <span className="dead-stamp">陨</span>}
      </div>
      <div className="seat-info">
        <strong>
          {g.name}
          <small>{g.path}</small>
        </strong>
        <div className="hp" aria-label={`体力 ${p.hp}/${p.maxHp}`}>
          {Array.from({ length: p.maxHp }, (_, i) => (
            <i key={i} className={i < p.hp ? "filled" : ""} />
          ))}
        </div>
        <div className="seat-meta">
          <span>
            <Layers size={11} />
            {p.hand.length}
          </span>
          <span>{p.alive ? `距 ${distance(game, 0, p.id)}` : "已阵亡"}</span>
          <span className="passive-skill" title={g.text}>
            {g.skill}
          </span>
        </div>
        <div className="enemy-equipment">
          {Object.values(p.equipment).map((c) => (
            <span key={c.id} title={CARDS[c.kind].text}>
              {CARDS[c.kind].name}
            </span>
          ))}
        </div>
      </div>
      {targetable && (
        <span className="target-hint">
          {selected ? "已选目标" : "选择目标"}
        </span>
      )}
    </button>
  );
}
