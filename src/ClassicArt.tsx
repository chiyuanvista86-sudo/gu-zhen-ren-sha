import { useId } from "react";
import { general } from "./data";
import type { CardKind, GeneralId } from "./data";

// Original, editable vector illustrations. Shared lighting, distinct costumes and props.
export function Portrait({
  id,
  large = false,
}: {
  id: GeneralId;
  large?: boolean;
}) {
  const g = general(id),
    u = useId().replace(/:/g, "");
  const ice = id === "baininbing",
    elder = id === "taibai",
    female = id === "he Loulan" || id === "xingxiu";
  const hair = ice ? "#e4e9ec" : elder ? "#d0cbb8" : "#111721";
  const robe = {
    fangyuan: "#343b42",
    baininbing: "#9dbdcd",
    "he Loulan": "#633b35",
    fengjiuge: "#d2c6a0",
    taibai: "#aaa991",
    fangzheng: "#6c3035",
    yingwuxie: "#413452",
    xingxiu: "#344f73",
  }[id];
  return (
    <svg
      className={`portrait ${large ? "portrait-large" : ""}`}
      viewBox="0 0 240 330"
      role="img"
      aria-label={`${g.name}写意立绘`}
    >
      <defs>
        <linearGradient id={`${u}bg`} x2=".8" y2="1">
          <stop stopColor={g.color} />
          <stop offset=".45" stopColor="#425057" />
          <stop offset="1" stopColor="#111c23" />
        </linearGradient>
        <linearGradient id={`${u}skin`} x2="1" y2=".4">
          <stop stopColor="#9c8071" />
          <stop offset=".4" stopColor={ice ? "#eee2d5" : "#dcc0a2"} />
          <stop offset=".75" stopColor="#b8957e" />
          <stop offset="1" stopColor="#6e554e" />
        </linearGradient>
        <linearGradient id={`${u}robe`} x2="1" y2=".7">
          <stop stopColor="#101b26" />
          <stop offset=".4" stopColor={robe} />
          <stop offset=".65" stopColor={robe} />
          <stop offset="1" stopColor="#151c26" />
        </linearGradient>
        <radialGradient id={`${u}halo`}>
          <stop stopColor="#e6d4aa" stopOpacity=".5" />
          <stop offset="1" stopColor="#eee1b3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M0 0h240v330H0z" fill={`url(#${u}bg)`} />
      <circle cx="130" cy="92" r="105" fill={`url(#${u}halo)`} />
      <circle
        cx="143"
        cy="79"
        r="60"
        fill="#e0d9bd"
        opacity={ice ? ".3" : ".09"}
      />
      <path
        d="m-20 232 52-109 24 34 34-65 39 95 25-41 36 29 34-75 47 141v100H0"
        fill="#1f3037"
        opacity=".6"
      />
      <path
        d="m-20 270 44-57 36 21 50-58 39 71 42-40 50 39v84H0"
        fill="#19232d"
        opacity=".6"
      />
      <g fill="none" stroke="#e2d3ad" opacity=".13">
        <path d="M-20 230q80-43 170-9t110-21M-10 257q110-41 260-4M-10 288q110-31 260-9" />
        <circle cx="137" cy="89" r="73" />
        <circle cx="137" cy="89" r="78" strokeDasharray="2 9" />
      </g>
      {id === "xingxiu" && (
        <g stroke="#e7d9a8" fill="#e7d9a8" opacity=".7">
          <path
            d="m26 27 35 21 29-27 17 40 67-22 35 40"
            fill="none"
            strokeWidth=".6"
          />
          {[
            [26, 27],
            [61, 48],
            [90, 21],
            [107, 61],
            [174, 39],
            [209, 79],
            [29, 102],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="1.6" />
          ))}
        </g>
      )}
      {ice && (
        <path
          d="m3 231 13-116 29 83 11-151 23 147-3 49ZM167 221l26-133 4 99 31-58-9 126Z"
          fill="#cfedf3"
          opacity=".4"
        />
      )}
      {id === "yingwuxie" && (
        <path
          d="M20 288Q87 208 23 141T65 26M218 276Q159 205 211 152T186 47"
          fill="none"
          stroke="#b79fc8"
          opacity=".3"
          strokeWidth="7"
        />
      )}
      <path
        d="M79 169Q66 104 79 64 90 31 122 29q50-1 52 54l-6 106-40 44Z"
        fill={hair}
      />
      <path
        d="m92 150-11 22-38 21Q17 221 6 330h229q-11-98-29-126l-47-34-14-27Z"
        fill={`url(#${u}robe)`}
      />
      <path d="m96 133-3 29 29 32 28-30-10-35Z" fill={`url(#${u}skin)`} />
      <path
        d="m94 157 28 37-31 44-22-48ZM149 158l-27 36 29 43 24-51Z"
        fill={ice ? "#dfdfd0" : elder ? "#c3bea2" : "#b4a78c"}
      />
      <path
        d="m88 175 20 28-26 109M157 174l-22 30 30 126M46 205l31 60-13 65M198 205l-32 58 21 67"
        fill="none"
        stroke="#0e1b26"
        strokeWidth="9"
        opacity=".6"
      />
      <path
        d="m84 178 22 25-25 108M161 179l-23 24 27 113"
        fill="none"
        stroke={g.color}
        strokeWidth="2"
        opacity=".8"
      />
      <path
        d="M91 75q24-27 54-4l6 21-7 33q-11 19-23 20-17-5-27-23l-6-32Z"
        fill={`url(#${u}skin)`}
      />
      <path
        d="m89 95 10 28 23 22-19-6-12-21ZM146 84l-4 30-15 22 16-8 9-26Z"
        fill="#79645b"
        opacity=".23"
      />
      <path
        d="M76 96q-6-57 37-64 38-8 53 31l-6 40-17-32-17-19q-8 22-30 27l-10 31Z"
        fill={hair}
      />
      <path
        d="M84 74q16-34 43-32M90 71q19-24 35-25m8-5q23 11 26 37"
        fill="none"
        stroke={ice ? "#fff" : "#777e85"}
        strokeWidth="1.2"
        opacity=".32"
      />
      <path
        d={female ? "m97 94 13-3m20 1 13 4" : "m97 93 15-2m16 0 15 4"}
        fill="none"
        stroke="#403431"
        strokeWidth={female ? "1.6" : "2.4"}
      />
      <path
        d="m99 100q6-3 12 0m19 0q6-2 11 2"
        fill="none"
        stroke="#332d2d"
        strokeWidth="1.2"
      />
      <path d="m105 99 1 2m29-1 1 2" stroke="#1b252a" strokeWidth="2.2" />
      <path
        d="m122 101-3 15 7 1"
        fill="none"
        stroke="#8f7060"
        strokeWidth=".9"
      />
      <path
        d={female ? "m113 126q9 4 17-1" : "m113 126q9 1 17-1"}
        fill="none"
        stroke="#80574f"
        strokeWidth="1.3"
      />
      <path
        d="m99 109 9 5m26-4 8 6"
        fill="none"
        stroke="#9e7162"
        opacity=".22"
        strokeWidth="3"
      />
      {elder && (
        <>
          <path
            d="m98 119q8 21 23 12 13 9 23-12l-6 43-17 35-17-36Z"
            fill="#d0cdbc"
          />
          <path
            d="m103 135 18 48m15-48-12 47"
            stroke="#89948e"
            fill="none"
            strokeWidth="1.5"
          />
          <path d="m98 91 12-2m20 1 11 4" stroke="#dbd7c6" strokeWidth="2" />
        </>
      )}
      {ice && (
        <>
          <path
            d="m87 73-9 146 19-30-4-66M150 66l25 163-23-31-7-78"
            fill="#c4d6de"
          />
          <path d="m85 93-2 105m74-107 11 115" stroke="#f0f4e8" opacity=".6" />
        </>
      )}
      {female && (
        <>
          <path
            d="m88 71-18 150 24-26-1-72M153 72l27 157-24-24-11-83"
            fill={hair}
          />
          <path
            d="M87 51q36-29 70 9"
            fill="none"
            stroke={g.color}
            strokeWidth="3"
          />
          <path d="m106 36 15-17 13 20-12-5Z" fill="#bda774" />
        </>
      )}
      {id === "fangyuan" && (
        <>
          <path d="m30 240 55 28 79-12 49 27-69 39-76-4-54-30" fill="#283441" />
          <path
            d="m49 249 45 20 37-4 25 15-31 19-35-6-43-21"
            fill={`url(#${u}skin)`}
          />
          <g transform="translate(129 260) rotate(-18)">
            <ellipse rx="10" ry="17" fill="#c2a66b" />
            <path
              d="M0-16V17m0-23-13-7-9 13L0 7 22 0 13-13Z"
              fill="none"
              stroke="#e1c989"
              strokeWidth="2"
            />
          </g>
          <path d="m93 271 19 6m-22 0 21 7" stroke="#8c7360" fill="none" />
        </>
      )}
      {ice && (
        <g transform="rotate(17 187 250)">
          <path d="M182 114h10l-2 194-4 15-5-16Z" fill="#d1e9ed" />
          <path d="M184 128v170" stroke="#748e9f" />
          <path d="m164 275 47-3-3 8-41 2Z" fill="#c9b88a" />
        </g>
      )}
      {id === "he Loulan" && (
        <>
          <path
            d="m39 198 37-16 16 27-8 42-39-9ZM165 187l37 18-3 46-43-8-7-32Z"
            fill="#635852"
            stroke="#a48c63"
            strokeWidth="2"
          />
          <path
            d="m45 208 29-10m-25 23 26-9m92-10 25 12m-27 1 26 12"
            stroke="#b29b72"
            opacity=".6"
          />
          <path
            d="M39 277q7-26 23-19l19 13-2 25-30 3Z"
            fill={`url(#${u}skin)`}
          />
          <path d="m48 265 7 18m5-21 8 20" stroke="#806556" />
        </>
      )}
      {id === "fengjiuge" && (
        <>
          <path
            d="m32 277 171-47 4 12-171 49Z"
            fill="#8d7950"
            stroke="#c2b381"
          />
          <path d="m48 277 140-39" stroke="#e1d4ad" />
          <path
            d="m69 270 2 7m18-13 2 7m21-13 2 7m20-13 2 7"
            stroke="#31382c"
            strokeWidth="3"
          />
          <path
            d="m70 258 10-10 17 7 5 22-15 4-11-13m67-30 11-15 17 5 8 15-15 13"
            fill={`url(#${u}skin)`}
          />
        </>
      )}
      {elder && (
        <>
          <path
            d="m42 238 123-9 21 55-124 14Z"
            fill="#d0c6a0"
            stroke="#90835e"
            strokeWidth="2"
          />
          <path
            d="m51 241 17 47m91-54 18 45"
            stroke="#796c4d"
            strokeWidth="7"
          />
          <path
            d="m79 248 62-5m-59 13 63-5m-59 14 45-4m-41 13 55-5"
            stroke="#7f856f"
            opacity=".7"
          />
          <path d="m37 252 14-5 20 20-3 14-15-5Z" fill={`url(#${u}skin)`} />
        </>
      )}
      {id === "fangzheng" && (
        <>
          <path d="m25 252 159 57-4 11L19 265Z" fill="#a0a2a0" />
          <path d="m37 261 134 47" stroke="#ded1b4" />
          <path d="m82 257-10 39" stroke="#b6a071" strokeWidth="7" />
          <path d="m90 265 14-5 23 11-7 13-22-5Z" fill={`url(#${u}skin)`} />
          <path
            d="M25 160q17 27-7 54m185-68q-22 34 10 71"
            stroke="#c37868"
            fill="none"
            strokeWidth="3"
            opacity=".5"
          />
        </>
      )}
      {id === "yingwuxie" && (
        <>
          <ellipse
            cx="128"
            cy="263"
            rx="44"
            ry="39"
            fill="#8a79ac"
            opacity=".17"
          />
          <circle cx="127" cy="263" r="24" fill="#595674" stroke="#afa2c0" />
          <path d="m108 272 15-29 18 25-28-6Z" fill="none" stroke="#c5b7d5" />
          <path
            d="m71 283 18-17 21 13 17 8-23 7-23 5m89-31-18 12-9 15 23-4 19-12"
            fill={`url(#${u}skin)`}
          />
        </>
      )}
      {id === "xingxiu" && (
        <>
          <path
            d="m62 280 14-61 26 10 55 45 29 3-37 35Z"
            fill="#8499ab"
            stroke="#c4bb8f"
            strokeWidth="2"
          />
          <path
            d="m77 228 73 76m-54-68 57 64m-37-53 42 47m-16-32 19 25"
            stroke="#c2ba91"
          />
          <path
            d="m57 283 12-12 18 8 18 15-12 10-21-10"
            fill={`url(#${u}skin)`}
          />
          <path
            d="m124 202 2 10 9 1-8 5 2 9-7-6-8 4 3-9-6-7 10 1Z"
            fill="#c2b287"
          />
        </>
      )}
      <path d="M0 310q120-20 240-1v21H0" fill="#111c22" opacity=".55" />
      <g stroke="#e2d4b3" opacity=".1">
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M${i * 19 - 20} 0l-75 330`} strokeWidth=".5" />
        ))}
      </g>
    </svg>
  );
}

export function CardIllustration({ kind }: { kind: CardKind }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 150 155"
      className={`card-illustration art-${kind}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={u}>
          <stop stopColor="#b69b67" stopOpacity=".45" />
          <stop offset="1" stopColor="#bbaa83" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="78" cy="87" rx="69" ry="66" fill={`url(#${u})`} />
      <g fill="none" stroke="#84795e" opacity=".27" strokeWidth=".7">
        <path d="M-4 125q40-30 79-9t83-13M-6 140q69-25 162-8" />
        <circle cx="78" cy="82" r="53" strokeDasharray="1 4" />
      </g>
      {kind === "attack" && (
        <>
          <circle cx="90" cy="55" r="32" fill="#a1a9a1" opacity=".3" />
          <path
            d="M114 28Q38 49 26 128q43-8 77-49-41 23-56 25 12-48 67-76Z"
            fill="#53677a"
            stroke="#283e50"
            strokeWidth="1.3"
          />
          <path
            d="M108 36Q48 62 34 118"
            stroke="#c6d9db"
            fill="none"
            strokeWidth="3"
          />
        </>
      )}
      {kind === "dodge" && (
        <>
          <path
            d="M82 23q-22 0-19 20l9 8-17 19-12 39-20 22 32-10 20-29 21 23 34 11-19-29-12-32-13-17 11-17Z"
            fill="#525e54"
          />
          <path
            d="m24 58 34-11m-44 36 41-14m-40 44 26-13m62-62 27-7"
            stroke="#8c9886"
            strokeWidth="4"
          />
          <path
            d="m63 72 26-18-7 32 23 19"
            stroke="#b6bca0"
            fill="none"
            strokeWidth="2"
          />
        </>
      )}
      {kind === "heal" && (
        <>
          <path
            d="M78 139Q71 84 81 40"
            stroke="#4c6044"
            strokeWidth="3"
            fill="none"
          />
          {[
            [78, 55, -35],
            [75, 76, 30],
            [76, 96, -40],
            [79, 117, 35],
            [82, 39, 0],
          ].map(([x, y, r]) => (
            <g key={y} transform={`translate(${x} ${y}) rotate(${r})`}>
              <path
                d="M0 0q-42-9-32-32Q-5-35 0 0q29-32 41-17Q32 6 0 0"
                fill="#627953"
                stroke="#465c40"
              />
              <path d="M-25-26 0 0l32-13" stroke="#a3ac79" fill="none" />
            </g>
          ))}
        </>
      )}
      {kind === "draw" && (
        <>
          <path
            d="m29 96 18-51 25 15-5 67-27 6Z"
            fill="#829488"
            stroke="#526b61"
          />
          <path
            d="m47 45 9 55-16 33m16-33 16-40"
            stroke="#c3c8ac"
            fill="none"
          />
          <path
            d="m70 120 14-89 27 8 14 69-21 29Z"
            fill="#a2b3a6"
            stroke="#617d70"
          />
          <path
            d="m84 31 19 62 8-54m-8 54 22 15m-22-15 1 44"
            stroke="#e1ddbd"
            fill="none"
          />
        </>
      )}
      {kind === "duel" && (
        <>
          <path d="m29 21 13 6 76 100-10 9Z" fill="#858b87" stroke="#515c5b" />
          <path d="m30 24 83 107" stroke="#e4dbbd" strokeWidth="2" />
          <path d="m91 125 30-19" stroke="#7c6039" strokeWidth="6" />
          <path
            d="m124 20-13 5-80 103 11 10Z"
            fill="#b2b3a1"
            stroke="#52656a"
          />
          <path d="m121 24-83 109" stroke="#ede6ca" strokeWidth="2" />
          <path d="m24 111 32 18" stroke="#956746" strokeWidth="6" />
        </>
      )}
      {kind === "steal" && (
        <>
          <path d="m2 124 29-44 40 22-20 51Z" fill="#4c5560" stroke="#303f4b" />
          <path
            d="m31 87 28-32 20-9 25-2 7 5-28 12 33-6 9 6-42 13 36-5 3 8-38 11 23 1 1 9-30 5-20 15Z"
            fill="#baa184"
            stroke="#756752"
          />
          <path d="m68 105-16-14 20-18 23-3" stroke="#7d6b52" fill="none" />
          <path
            d="m109 104 9-15 15 6-3 23-19 6Z"
            fill="#ac9965"
            stroke="#7b6f4c"
          />
        </>
      )}
      {kind === "dismantle" && (
        <>
          <path
            d="m34 25 42 3-11 39-30-8ZM88 27l31 5 4 46-32-12ZM29 77l38 7-8 44-35-9Zm58 10 36 9-14 38-27-12Z"
            fill="#b4a37c"
            stroke="#77664b"
          />
          <path
            d="m43 40 16 6m-18 6 12 4m47-8 13 3m-12 8 12 3M36 91l17 5m-18 7 12 4m46-4 16 7m-17 4 11 6"
            stroke="#6b6955"
          />
          <path
            d="m77 15-4 42 12 13-13 14 6 52"
            fill="none"
            stroke="#806b57"
            strokeWidth="3"
          />
        </>
      )}
      {kind === "storm" && (
        <>
          <path
            d="m19 111 3-29 17-15 23 4 8 28 25 2 9-26 24-10 15 17 3 39-21 12-15-13-42 6-24-9Z"
            fill="#5f5d4c"
          />
          <path
            d="m27 82-13-28 29 14 10-23 8 34m49 0 4-32 13 21 21-9-12 24"
            fill="#71684f"
            stroke="#4d4a3e"
          />
          <path d="m30 91 13 4m72-3 14-2" stroke="#cfb873" strokeWidth="3" />
        </>
      )}
      {kind === "arrows" && (
        <>
          <path
            d="M28 126 118 28M48 145l78-100M12 104l75-88"
            stroke="#5b665f"
            strokeWidth="3"
          />
          <path
            d="m118 28-3 20 16-24ZM126 45l-3 23 15-30ZM87 16l-2 22 14-28Z"
            fill="#536775"
          />
          <path
            d="m25 116-17-2 18 17 5-5 1-18m14 26-17-3 19 17 6-3-1-18M15 94 1 91l14 18 7-7-1-16"
            fill="#898e77"
          />
        </>
      )}
      {kind === "wine" && (
        <>
          <path
            d="M61 42h37l-2 17q31 14 24 47-4 27-42 27-37 0-42-27-6-30 26-47Z"
            fill="#78614b"
            stroke="#493f35"
            strokeWidth="2"
          />
          <path d="M63 42q13 8 33 0l4-13H60Z" fill="#605b41" />
          <path d="m54 65 46 3-7 40-31-2Z" fill="#c1af88" stroke="#a0926e" />
          <path
            d="m68 76 15 2-8 11 14 1-9 10"
            stroke="#63583f"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M109 65q32-2 22 30l-14 11"
            stroke="#665340"
            fill="none"
            strokeWidth="6"
          />
        </>
      )}
      {kind === "weapon" && (
        <>
          <path
            d="M108 22q25 28-12 55-46 33-48 63"
            fill="none"
            stroke="#5a4e30"
            strokeWidth="17"
          />
          <path
            d="M108 22q25 28-12 55-46 33-48 63"
            fill="none"
            stroke="#b3964d"
            strokeWidth="11"
          />
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`m${i < 4 ? 107 + i * 2 : 112 - (i - 3) * 11} ${29 + i * 12}-18-4-9 10m21-11 21 6 5 12`}
              stroke="#8d733d"
              strokeWidth="2"
              fill="none"
            />
          ))}
          <path d="m103 26-11-17m24 20 9-17" stroke="#74603b" strokeWidth="3" />
        </>
      )}
      {kind === "armor" && (
        <>
          <path
            d="m32 35 42-15 45 15-6 55q-9 27-38 47-31-18-40-46Z"
            fill="#758375"
            stroke="#4b5b51"
            strokeWidth="3"
          />
          <path
            d="m41 42 34-13 35 13-5 43q-9 23-30 42-24-18-29-43Z"
            fill="none"
            stroke="#b2ad84"
            strokeWidth="2"
          />
          <path
            d="m57 59 19-10 18 11-6 25-12 17-17-17Z"
            fill="#adb18e"
            stroke="#4f6357"
          />
          <path
            d="m60 67 10 6m13 0 9-6m-27 18 12-5 10 5"
            stroke="#44594c"
            strokeWidth="3"
          />
        </>
      )}
      {kind === "mount" && (
        <>
          <path
            d="m36 96 18-43 30 5-9 44 35 6 15 18-10 10-66-6-23-15Z"
            fill="#4d6263"
            stroke="#374e52"
          />
          <path d="m50 62 27 6-6 21-27-6Z" fill="#c0b691" />
          <path
            d="m30 115 24 8 61 4"
            stroke="#b7b69a"
            fill="none"
            strokeWidth="3"
          />
          <path
            d="M5 91q24-14 34-3m57-8q27-14 41-4M6 143q54-6 78 6"
            fill="none"
            stroke="#8a9785"
            strokeWidth="3"
          />
        </>
      )}
    </svg>
  );
}
