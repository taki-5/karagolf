#!/bin/bash
# KARA PREMIUM GOLF & BAR — シミュレーター/盛り上がりシーンの雰囲気イラストを生成する。
# 実写风の一枚絵ではなく、黒×ゴールドのシルエット+ボケ光で「らしさ」を出す仮イラスト。
# 実写真が届いたら images/ 内の同名ファイルを差し替えるだけでOK。
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)/images"
mkdir -p "$DIR"

# ---------------------------------------------------------------------------
# シミュレーター3面(構え/バックスイング/フォロースルー x 時間帯違い)
# ---------------------------------------------------------------------------
gen_simulator() {
  local num="$1" label="$2" sky_top="$3" sky_bottom="$4" ground_top="$5" ground_bottom="$6" sun_color="$7" golfer_pose="$8"

  cat > "$DIR/simulator-$num-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${label}(仮イラスト・実写真差し替え予定)">
  <defs>
    <linearGradient id="room$num" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#211a12"/>
      <stop offset="100%" stop-color="#0b0b0c"/>
    </linearGradient>
    <linearGradient id="sky$num" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sky_top}"/>
      <stop offset="100%" stop-color="${sky_bottom}"/>
    </linearGradient>
    <linearGradient id="ground$num" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ground_top}"/>
      <stop offset="100%" stop-color="${ground_bottom}"/>
    </linearGradient>
    <radialGradient id="glow$num" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f2c94c" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#f2c94c" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur$num" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <rect width="800" height="500" fill="url(#room$num)"/>
  <circle cx="140" cy="120" r="130" fill="url(#glow$num)" opacity="0.5"/>
  <circle cx="700" cy="420" r="160" fill="url(#glow$num)" opacity="0.3"/>

  <!-- 天井のペンダントライト -->
  <g stroke="#3a2e1c" stroke-width="2" opacity="0.8">
    <line x1="150" y1="0" x2="150" y2="55"/>
    <line x1="330" y1="0" x2="330" y2="40"/>
    <line x1="620" y1="0" x2="620" y2="45"/>
  </g>
  <g fill="#f2c94c">
    <circle cx="150" cy="60" r="7"/>
    <circle cx="330" cy="45" r="6"/>
    <circle cx="620" cy="50" r="6"/>
  </g>
  <circle cx="150" cy="60" r="26" fill="url(#glow$num)"/>

  <!-- シミュレーター用スクリーン(コース映像) -->
  <rect x="470" y="50" width="290" height="330" rx="10" fill="url(#glow$num)" filter="url(#blur$num)" opacity="0.6"/>
  <rect x="478" y="58" width="274" height="314" rx="8" fill="#0b0b0c" stroke="#ad7d24" stroke-width="4"/>
  <clipPath id="screenClip$num"><rect x="478" y="58" width="274" height="314" rx="8"/></clipPath>
  <g clip-path="url(#screenClip$num)">
    <rect x="478" y="58" width="274" height="200" fill="url(#sky$num)"/>
    <circle cx="700" cy="110" r="34" fill="${sun_color}" opacity="0.9"/>
    <rect x="478" y="258" width="274" height="114" fill="url(#ground$num)"/>
    <ellipse cx="620" cy="270" rx="70" ry="14" fill="#1c3a1e" opacity="0.4"/>
    <line x1="705" y1="230" x2="705" y2="270" stroke="#e8e2d0" stroke-width="3"/>
    <path d="M705,230 L730,238 L705,246 Z" fill="#b83a2e"/>
    <circle cx="520" cy="300" r="10" fill="#12220f" opacity="0.5"/>
    <circle cx="600" cy="330" r="14" fill="#12220f" opacity="0.4"/>
  </g>

  <!-- 打席マット -->
  <rect x="60" y="400" width="620" height="70" rx="6" fill="#1a1510"/>
  <rect x="60" y="400" width="620" height="70" rx="6" fill="none" stroke="#3a2e1c" stroke-width="2"/>
  <g stroke="#2a2114" stroke-width="1.5" opacity="0.6">
    <line x1="90" y1="400" x2="90" y2="470"/>
    <line x1="150" y1="400" x2="150" y2="470"/>
    <line x1="210" y1="400" x2="210" y2="470"/>
  </g>

  <!-- ゴルファーを画面の光で後ろから照らし、シルエットとして際立たせる -->
  <ellipse cx="300" cy="340" rx="180" ry="200" fill="url(#glow$num)" opacity="0.85"/>

  ${golfer_pose}
</svg>
SVG
}

# ゴルファーのシルエット(構え/バックスイング/フォロースルー)
POSE_ADDRESS='
  <ellipse cx="300" cy="440" rx="60" ry="10" fill="#000" opacity="0.4"/>
  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <circle cx="300" cy="330" r="19"/>
    <path d="M281,352 C278,375 278,400 285,420 L275,438 L295,438 L302,412 L308,438 L328,438 L318,418 C324,398 322,372 316,352 C306,344 291,344 281,352 Z"/>
    <path d="M282,355 C265,368 255,388 250,408 L242,406 C247,382 258,360 278,347 Z"/>
    <path d="M316,355 C330,364 340,378 345,392 L352,388 C346,372 335,358 320,348 Z"/>
  </g>
  <line x1="345" y1="390" x2="380" y2="430" stroke="#cfd8dc" stroke-width="4" stroke-linecap="round"/>
  <circle cx="384" cy="433" r="4" fill="#f2e6cf"/>
'
POSE_BACKSWING='
  <ellipse cx="300" cy="440" rx="60" ry="10" fill="#000" opacity="0.4"/>
  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <circle cx="296" cy="328" r="19"/>
    <path d="M278,350 C275,374 277,400 286,420 L276,438 L296,438 L302,412 L310,438 L330,438 L320,418 C328,398 327,372 320,350 C308,340 290,341 278,350 Z"/>
    <path d="M280,352 C260,340 245,320 238,300 L246,294 C255,314 268,332 286,346 Z"/>
    <path d="M318,352 C300,344 288,332 280,318 L288,312 C296,326 308,338 322,346 Z"/>
  </g>
  <line x1="238" y1="298" x2="200" y2="255" stroke="#cfd8dc" stroke-width="4" stroke-linecap="round"/>
  <circle cx="196" cy="251" r="4" fill="#f2e6cf"/>
'
POSE_FOLLOW='
  <ellipse cx="300" cy="440" rx="60" ry="10" fill="#000" opacity="0.4"/>
  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <circle cx="304" cy="328" r="19"/>
    <path d="M285,350 C280,374 282,400 290,420 L280,438 L300,438 L306,412 L314,438 L334,438 L324,418 C332,398 330,372 322,350 C310,342 295,342 285,350 Z"/>
    <path d="M288,352 C302,338 322,328 342,324 L344,332 C326,338 310,346 296,358 Z"/>
    <path d="M320,350 C336,338 352,332 368,330 L370,338 C356,342 342,348 330,356 Z"/>
  </g>
  <line x1="368" y1="328" x2="410" y2="300" stroke="#cfd8dc" stroke-width="4" stroke-linecap="round"/>
  <circle cx="414" cy="298" r="4" fill="#f2e6cf"/>
'

gen_simulator 1 "シミュレーター1号機 デイタイムコース映像" "#4a7fb5" "#bcd7e8" "#2e5c2a" "#1c3a1e" "#f2d675" "$POSE_ADDRESS"
gen_simulator 2 "シミュレーター2号機 ゴールデンタイムコース映像" "#b5652f" "#e8b45a" "#3a4a1e" "#22300f" "#f2c94c" "$POSE_BACKSWING"
gen_simulator 3 "シミュレーター3号機 ナイトコース映像" "#241a3a" "#4a3a6a" "#1a2e2a" "#0f1c18" "#e8dfc8" "$POSE_FOLLOW"

echo "simulator scenes generated"

# ---------------------------------------------------------------------------
# 盛り上がりシーン(ギャラリー)6枚 — シルエット+暖色ボケ光の共通スタイル
# ---------------------------------------------------------------------------
scene_head() {
  local num="g$1"
  cat <<SVG
  <defs>
    <linearGradient id="room$num" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#221a10"/>
      <stop offset="100%" stop-color="#0b0b0c"/>
    </linearGradient>
    <radialGradient id="glow$num" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f2c94c" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#f2c94c" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowRed$num" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8382b" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#e8382b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="url(#room$num)"/>
SVG
}

# ---- gallery-1: 3人で乾杯 ----
cat > "$DIR/gallery-1-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="仲間との乾杯シーン(仮イラスト・実写真差し替え予定)">
$(scene_head 1)
  <ellipse cx="400" cy="300" rx="260" ry="180" fill="url(#glowg1)" opacity="0.7"/>
  <circle cx="140" cy="120" r="120" fill="url(#glowRedg1)" opacity="0.5"/>
  <circle cx="660" cy="130" r="120" fill="url(#glowg1)" opacity="0.4"/>

  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <!-- 左の人物 -->
    <circle cx="270" cy="280" r="26"/>
    <path d="M240,310 C235,345 237,390 248,430 L232,460 L262,460 L270,420 L280,460 L308,460 L294,428 C304,392 302,346 296,310 C280,298 256,298 240,310 Z"/>
    <path d="M244,314 C220,300 202,278 192,250 L204,242 C214,268 230,290 252,306 Z"/>
    <line x1="192" y1="248" x2="170" y2="205" stroke="#f2c94c" stroke-width="5" stroke-linecap="round"/>
    <path d="M162,190 L178,200 L172,225 L154,222 Z" fill="#e8382b" stroke="#f2c94c" stroke-width="1.5"/>

    <!-- 中央の人物(手前・大きめ) -->
    <circle cx="410" cy="255" r="32"/>
    <path d="M370,292 C364,336 366,390 380,438 L360,474 L396,474 L406,426 L418,474 L452,474 L436,436 C448,392 446,338 438,292 C420,278 390,278 370,292 Z"/>
    <path d="M374,296 C346,280 324,254 312,222 L326,212 C338,242 358,268 384,286 Z"/>
    <line x1="312" y1="220" x2="284" y2="168" stroke="#f2c94c" stroke-width="6" stroke-linecap="round"/>
    <path d="M274,150 L294,162 L286,192 L262,188 Z" fill="#f2e6cf" stroke="#f2c94c" stroke-width="1.5"/>

    <!-- 右の人物 -->
    <circle cx="546" cy="280" r="26"/>
    <path d="M516,310 C511,345 513,390 524,430 L508,460 L538,460 L546,420 L556,460 L584,460 L570,428 C580,392 578,346 572,310 C556,298 532,298 516,310 Z"/>
    <path d="M572,314 C596,300 614,278 624,250 L612,242 C602,268 586,290 564,306 Z"/>
    <line x1="624" y1="248" x2="646" y2="205" stroke="#f2c94c" stroke-width="5" stroke-linecap="round"/>
    <path d="M638,190 L654,200 L648,222 L630,218 Z" fill="#3aa655" stroke="#f2c94c" stroke-width="1.5"/>
  </g>

  <!-- 乾杯の光の弾け -->
  <g fill="#f2e6cf" opacity="0.9">
    <circle cx="210" cy="185" r="3"/>
    <circle cx="230" cy="170" r="2"/>
    <circle cx="440" cy="150" r="3"/>
    <circle cx="460" cy="170" r="2"/>
    <circle cx="600" cy="185" r="3"/>
  </g>
</svg>
SVG

# ---- gallery-2: ゴルフで盛り上がる ----
cat > "$DIR/gallery-2-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="ナイスショットで盛り上がるシーン(仮イラスト・実写真差し替え予定)">
$(scene_head 2)
  <g stroke="#f2c94c" stroke-width="2" opacity="0.35">
    <line x1="400" y1="260" x2="400" y2="60"/>
    <line x1="400" y1="260" x2="540" y2="110"/>
    <line x1="400" y1="260" x2="620" y2="220"/>
    <line x1="400" y1="260" x2="580" y2="350"/>
    <line x1="400" y1="260" x2="260" y2="110"/>
    <line x1="400" y1="260" x2="180" y2="220"/>
    <line x1="400" y1="260" x2="220" y2="350"/>
  </g>
  <ellipse cx="400" cy="280" rx="220" ry="200" fill="url(#glowg2)" opacity="0.8"/>

  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <circle cx="400" cy="260" r="30"/>
    <path d="M362,296 C356,340 358,392 372,438 L352,474 L388,474 L398,428 L410,474 L446,474 L428,436 C442,392 440,340 432,296 C412,282 382,282 362,296 Z"/>
    <path d="M366,300 C338,280 314,250 300,214 L316,206 C328,238 348,264 376,290 Z"/>
    <path d="M432,300 C458,280 480,250 494,214 L478,206 C466,238 448,264 422,290 Z"/>
    <path d="M382,434 L360,470 L344,468 L368,428 Z"/>
    <path d="M420,434 L440,470 L458,466 L432,426 Z"/>
  </g>

  <!-- 飛んでいくゴルフボール -->
  <circle cx="560" cy="140" r="9" fill="#f2e6cf" stroke="#0a0805" stroke-width="1.5"/>
  <g stroke="#f2c94c" stroke-width="3" stroke-linecap="round" opacity="0.8">
    <line x1="520" y1="175" x2="500" y2="192"/>
    <line x1="535" y1="190" x2="518" y2="212"/>
  </g>

  <!-- 紙吹雪 -->
  <g fill="#e8382b">
    <rect x="180" y="120" width="8" height="8" transform="rotate(20 184 124)"/>
    <rect x="620" y="300" width="8" height="8" transform="rotate(-15 624 304)"/>
  </g>
  <g fill="#3aa655">
    <rect x="230" y="330" width="8" height="8" transform="rotate(35 234 334)"/>
    <rect x="580" y="150" width="8" height="8" transform="rotate(-25 584 154)"/>
  </g>
  <g fill="#f2c94c">
    <circle cx="260" cy="200" r="4"/>
    <circle cx="550" cy="260" r="4"/>
    <circle cx="300" cy="380" r="4"/>
  </g>
</svg>
SVG

# ---- gallery-3: 乾杯の瞬間(クローズアップ) ----
cat > "$DIR/gallery-3-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="グラスを合わせる乾杯の瞬間(仮イラスト・実写真差し替え予定)">
$(scene_head 3)
  <ellipse cx="400" cy="260" rx="240" ry="170" fill="url(#glowg3)" opacity="0.85"/>

  <!-- 左のグラス(ワイン) -->
  <g stroke="#f2c94c" stroke-width="3" fill="none">
    <path d="M300,180 C300,230 260,240 260,280 C260,310 285,330 315,330 C345,330 370,310 370,280 C370,240 330,230 330,180 Z"/>
    <line x1="315" y1="330" x2="315" y2="400"/>
    <line x1="280" y1="410" x2="350" y2="410"/>
  </g>
  <path d="M270,220 C270,255 290,275 315,275 C340,275 360,255 360,220 C360,240 340,255 315,255 C290,255 270,240 270,220 Z" fill="#b83a2e" opacity="0.85"/>

  <!-- 右のグラス(カクテル) -->
  <g stroke="#f2c94c" stroke-width="3" fill="none">
    <path d="M430,190 L560,190 L500,300 Z"/>
    <line x1="500" y1="300" x2="500" y2="400"/>
    <line x1="465" y1="410" x2="535" y2="410"/>
  </g>
  <path d="M448,205 L542,205 L500,282 Z" fill="#f2c94c" opacity="0.75"/>
  <circle cx="512" cy="260" r="9" fill="#3aa655"/>

  <!-- ぶつかる瞬間の光の弾け -->
  <g fill="#f2e6cf">
    <circle cx="400" cy="245" r="6"/>
    <circle cx="378" cy="220" r="3"/>
    <circle cx="420" cy="215" r="3"/>
    <circle cx="392" cy="270" r="3"/>
    <circle cx="415" cy="260" r="2.5"/>
  </g>
  <g stroke="#f2e6cf" stroke-width="2" opacity="0.8">
    <line x1="400" y1="245" x2="380" y2="200"/>
    <line x1="400" y1="245" x2="425" y2="195"/>
    <line x1="400" y1="245" x2="360" y2="250"/>
    <line x1="400" y1="245" x2="440" y2="250"/>
  </g>
</svg>
SVG

# ---- gallery-4: 仲間との集合写真 ----
cat > "$DIR/gallery-4-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="仲間との集合写真(仮イラスト・実写真差し替え予定)">
$(scene_head 4)
  <ellipse cx="400" cy="320" rx="300" ry="170" fill="url(#glowg4)" opacity="0.75"/>

  <!-- 天井の電飾ライト -->
  <path d="M60,60 Q400,150 740,60" fill="none" stroke="#5a4526" stroke-width="2"/>
  <g fill="#f2c94c">
    <circle cx="120" cy="80" r="4"/><circle cx="220" cy="112" r="4"/><circle cx="320" cy="132" r="4"/>
    <circle cx="420" cy="138" r="4"/><circle cx="520" cy="128" r="4"/><circle cx="620" cy="102" r="4"/><circle cx="700" cy="75" r="4"/>
  </g>

  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <circle cx="220" cy="290" r="24"/>
    <path d="M192,318 C188,352 190,392 200,428 L246,428 C254,392 254,352 250,318 C230,306 208,306 192,318 Z"/>

    <circle cx="330" cy="265" r="27"/>
    <path d="M298,296 C293,336 296,382 308,424 L358,424 C368,382 368,336 362,296 C340,282 316,282 298,296 Z"/>

    <circle cx="450" cy="255" r="30"/>
    <path d="M414,290 C408,334 411,384 425,430 L480,430 C492,384 490,334 483,290 C458,275 432,275 414,290 Z"/>

    <circle cx="565" cy="266" r="27"/>
    <path d="M534,297 C529,336 531,382 543,424 L592,424 C602,382 601,336 596,297 C574,283 552,283 534,297 Z"/>

    <circle cx="668" cy="290" r="24"/>
    <path d="M640,318 C636,352 638,392 648,428 L694,428 C702,392 702,352 698,318 C678,306 656,306 640,318 Z"/>

    <!-- 肩を組む腕 -->
    <path d="M244,320 C270,308 300,304 322,306 L322,318 C300,317 274,320 250,332 Z"/>
    <path d="M356,300 C382,288 412,284 434,286 L434,298 C412,297 386,300 362,312 Z"/>
    <path d="M478,300 C452,288 422,284 400,286 L400,298 C422,297 448,300 472,312 Z"/>
    <path d="M590,320 C564,308 534,304 512,306 L512,318 C534,317 560,320 584,332 Z"/>
  </g>
</svg>
SVG

# ---- gallery-5: 自慢のフード ----
cat > "$DIR/gallery-5-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="自慢のフードメニュー(仮イラスト・実写真差し替え予定)">
$(scene_head 5)
  <ellipse cx="400" cy="280" rx="260" ry="150" fill="url(#glowg5)" opacity="0.6"/>

  <!-- 木のボード -->
  <ellipse cx="400" cy="330" rx="260" ry="70" fill="#3a2c1a" stroke="#5a4526" stroke-width="3"/>
  <ellipse cx="400" cy="330" rx="230" ry="56" fill="#2a2014"/>

  <!-- 串焼き -->
  <g stroke="#c99a35" stroke-width="4" stroke-linecap="round">
    <line x1="230" y1="320" x2="330" y2="300"/>
  </g>
  <g fill="#b5652f" stroke="#4a2f18" stroke-width="1.5">
    <circle cx="252" cy="315" r="14"/>
    <circle cx="282" cy="308" r="14"/>
    <circle cx="312" cy="302" r="14"/>
  </g>

  <!-- フライドポテト -->
  <path d="M420,340 L470,340 L462,270 L428,270 Z" fill="#e8382b"/>
  <g stroke="#f2d675" stroke-width="6" stroke-linecap="round">
    <line x1="432" y1="272" x2="425" y2="330"/>
    <line x1="445" y1="268" x2="445" y2="330"/>
    <line x1="458" y1="272" x2="462" y2="330"/>
  </g>

  <!-- ドリンク -->
  <g stroke="#f2c94c" stroke-width="3" fill="none">
    <path d="M540,270 L600,270 L590,340 L550,340 Z"/>
  </g>
  <rect x="546" y="276" width="48" height="30" fill="#f2c94c" opacity="0.5"/>
  <line x1="565" y1="250" x2="575" y2="278" stroke="#3aa655" stroke-width="4" stroke-linecap="round"/>

  <!-- 湯気/香りの演出 -->
  <g stroke="#f2e6cf" stroke-width="2" fill="none" opacity="0.5">
    <path d="M270,260 C265,245 280,240 275,225"/>
    <path d="M300,255 C295,240 310,235 305,220"/>
  </g>
</svg>
SVG

# ---- gallery-6: スタッフとお客様 ----
cat > "$DIR/gallery-6-placeholder.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="スタッフとお客様の交流シーン(仮イラスト・実写真差し替え予定)">
$(scene_head 6)
  <ellipse cx="400" cy="260" rx="260" ry="180" fill="url(#glowg6)" opacity="0.7"/>

  <!-- 背面棚のボトル -->
  <g fill="#3a2c1a" opacity="0.8">
    <rect x="120" y="120" width="18" height="60" rx="4"/>
    <rect x="150" y="110" width="18" height="70" rx="4"/>
    <rect x="180" y="125" width="18" height="55" rx="4"/>
    <rect x="600" y="115" width="18" height="65" rx="4"/>
    <rect x="630" y="125" width="18" height="55" rx="4"/>
  </g>
  <g fill="#f2c94c" opacity="0.6">
    <rect x="125" y="120" width="8" height="14"/>
    <rect x="155" y="110" width="8" height="14"/>
    <rect x="605" y="115" width="8" height="14"/>
  </g>

  <!-- バーカウンター -->
  <rect x="60" y="360" width="680" height="26" fill="#4a3620"/>
  <rect x="60" y="330" width="680" height="34" rx="4" fill="#2a2014" stroke="#5a4526" stroke-width="3"/>

  <g fill="#0a0805" stroke="#f2c94c" stroke-width="1.5">
    <!-- スタッフ(奥・カウンターの向こう) -->
    <circle cx="330" cy="210" r="27"/>
    <path d="M300,240 C295,275 297,315 306,340 L360,340 C368,315 368,275 362,240 C340,226 316,226 300,240 Z"/>
    <path d="M304,244 C282,254 266,272 258,294 L268,300 C276,280 290,264 310,254 Z"/>
    <line x1="258" y1="292" x2="240" y2="330" stroke="#f2c94c" stroke-width="5" stroke-linecap="round"/>

    <!-- お客様(手前) -->
    <circle cx="520" cy="255" r="27"/>
    <path d="M490,286 C485,320 488,364 500,404 L546,404 C556,364 556,320 550,286 C528,272 506,272 490,286 Z"/>
    <path d="M494,290 C472,300 456,316 448,336 L458,342 C466,324 480,310 500,300 Z"/>
    <line x1="448" y1="334" x2="428" y2="366" stroke="#f2c94c" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- 注がれるグラス -->
  <g stroke="#f2c94c" stroke-width="2.5" fill="none">
    <path d="M232,326 L250,326 L245,352 L237,352 Z"/>
  </g>
  <rect x="234" y="332" width="14" height="16" fill="#f2c94c" opacity="0.6"/>
  <g stroke="#f2c94c" stroke-width="2.5" fill="none">
    <path d="M420,354 L438,354 L433,380 L425,380 Z"/>
  </g>
  <rect x="422" y="360" width="14" height="16" fill="#e8382b" opacity="0.6"/>
</svg>
SVG

echo "gallery scenes generated"
