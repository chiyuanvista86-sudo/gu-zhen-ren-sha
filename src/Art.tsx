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
