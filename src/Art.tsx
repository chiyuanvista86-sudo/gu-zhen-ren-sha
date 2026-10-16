import { general } from "./data";
import type { GeneralId } from "./data";
export function Portrait({
  id,
  large = false,
}: {
  id: GeneralId;
  large?: boolean;
}) {
  const g = general(id),
    ice = id === "baininbing",
    woman = ["he Loulan", "xingxiu"].includes(id),
    elder = id === "taibai";
  const uid = id.replace(/ /g, "") + (large ? "large" : "small");
  return (
    <svg
      className="portrait"
      viewBox="0 0 240 300"
      role="img"
      aria-label={`${g.name}写意立绘`}
    >
      <defs>
        <linearGradient id={`bg${uid}`} x2="0" y2="1">
          <stop stopColor={g.color} stopOpacity=".55" />
          <stop offset="1" stopColor="#0c1414" />
        </linearGradient>
        <linearGradient id={`robe${uid}`} x2="1" y2="1">
          <stop stopColor={ice ? "#cadde1" : g.color} />
          <stop offset=".45" stopColor={ice ? "#647f90" : "#253434"} />
          <stop offset="1" stopColor="#0b1417" />
        </linearGradient>
      </defs>
      <path fill={`url(#bg${uid})`} d="M0 0h240v300H0z" />
      <circle
        cx="143"
        cy="86"
        r="69"
        fill="none"
        stroke={g.color}
        strokeOpacity=".35"
      />
      <circle
        cx="143"
        cy="86"
        r="57"
        fill="none"
        stroke={g.color}
        strokeOpacity=".15"
      />
      <path
        d="M0 196 43 138 70 166 103 125 149 195 182 151 240 188V300H0"
        fill="#132324"
        opacity=".7"
      />
      <path
        d="M0 220 62 188 95 224 153 191 198 216 240 190V300H0"
        fill="#0c1719"
      />
      <path
        d="M81 114Q61 42 112 31Q170 19 176 91L183 210 146 228 79 196Z"
        fill={ice || elder ? "#b9d0d3" : "#10191d"}
      />
      <path
        d="m103 121-9 30-45 26-26 123h195l-24-115-48-34-9-36Z"
        fill={`url(#robe${uid})`}
      />
      <path d="m105 123-5 31 24 29 22-31-10-36" fill="#bda797" />
      <path d="M97 70q26-33 52-4l-3 47-22 22-23-19Z" fill="#cfbeb0" />
      <path
        d="M87 86q-7-58 40-53 43 1 42 49l-22-14-14-22-22 30-18 11Z"
        fill={ice || elder ? "#d3e1df" : "#10191d"}
      />
      <path d="m103 89 12-2m17 0 11 3" stroke="#263034" strokeWidth="2" />
      <path d="m118 112 13-1" stroke="#8c7270" strokeWidth="1.5" />
      {elder && <path d="m105 115 20 39 17-41-16 10Z" fill="#d2ddd1" />}
      <path
        d="m99 151 25 33-23 61-24-71m69-22-22 32 17 61 32-69"
        fill="none"
        stroke={g.color}
        strokeWidth="6"
        strokeOpacity=".65"
      />
      <path
        d="m68 187-24 108m126-108 30 110M124 184l-6 116"
        fill="none"
        stroke="#121f23"
        strokeWidth="3"
      />
      {woman && (
        <>
          <path d="m85 73-16 110 22-30M159 65l18 122-20-29" fill="#132025" />
          <path
            d="M96 40q27-23 52 0"
            fill="none"
            stroke={g.color}
            strokeWidth="4"
          />
        </>
      )}
      <path d="m0 277 240-24v47H0" fill="#0c1517" opacity=".55" />
      <g fill={g.color} opacity=".5">
        <circle cx="33" cy="63" r="2" />
        <circle cx="200" cy="122" r="1.5" />
        <circle cx="44" cy="117" r="1" />
        <circle cx="194" cy="38" r="1" />
      </g>
    </svg>
  );
}
export function GuMark({ kind = "attack" }: { kind?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`gu-mark gu-${kind}`}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M50 13c-9 13-14 25-14 38s6 26 14 35c8-9 14-22 14-35S59 26 50 13Z" />
        <path d="M50 14v72M36 37 21 24 13 28m51 9 15-13 8 4M35 48 16 43 9 50m56-2 19-5 7 7M36 61 19 67l-7 14m52-20 17 6 7 14M44 22l-5-13m17 13 5-13" />
        <path d="m37 38 26 26M63 38 37 64" opacity=".6" />
        <circle cx="50" cy="50" r="23" strokeDasharray="2 5" />
      </g>
    </svg>
  );
}
