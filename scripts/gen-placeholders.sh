#!/bin/bash
# 仮画像(プレースホルダー)を生成するスクリプト。
# クライアントから実写真を受領したら images/ 内の同名ファイルを差し替えるだけでOK。
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)/images"
mkdir -p "$DIR"

make_photo_placeholder() {
  local filename="$1" label="$2" sublabel="$3" c1="$4" c2="$5"
  cat > "$DIR/$filename" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <rect width="800" height="500" fill="url(#grid)"/>
  <circle cx="700" cy="80" r="120" fill="rgba(212,175,55,0.12)"/>
  <circle cx="90" cy="440" r="160" fill="rgba(0,0,0,0.18)"/>
  <text x="400" y="245" font-family="'Noto Sans JP',sans-serif" font-size="30" font-weight="700" fill="#f5f1e6" text-anchor="middle">${label}</text>
  <text x="400" y="285" font-family="'Noto Sans JP',sans-serif" font-size="16" fill="rgba(245,241,230,0.65)" text-anchor="middle">${sublabel}</text>
</svg>
SVG
}

make_icon_placeholder() {
  local filename="$1" label="$2" color="$3"
  cat > "$DIR/$filename" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${label}">
  <circle cx="100" cy="100" r="92" fill="none" stroke="${color}" stroke-width="4"/>
  <circle cx="100" cy="100" r="70" fill="${color}" opacity="0.12"/>
  <text x="100" y="108" font-family="'Noto Sans JP',sans-serif" font-size="15" font-weight="700" fill="${color}" text-anchor="middle">${label}</text>
</svg>
SVG
}

# 写真系プレースホルダー(16:10)
# hero/campaign は実際の見出しテキストと重なるため、専用の隅ウォーターマークで別途生成している
make_photo_placeholder "simulator-1-placeholder.svg" "シミュレーター 1号機" "写真は後日差し替え予定" "#14231a" "#0b0b0c"
make_photo_placeholder "simulator-2-placeholder.svg" "シミュレーター 2号機" "写真は後日差し替え予定" "#231414" "#0b0b0c"
make_photo_placeholder "simulator-3-placeholder.svg" "シミュレーター 3号機" "写真は後日差し替え予定" "#22201a" "#0b0b0c"
make_photo_placeholder "gallery-1-placeholder.svg" "盛り上がりシーン 01" "コンペ打ち上げの様子" "#1c1c1c" "#0b0b0c"
make_photo_placeholder "gallery-2-placeholder.svg" "盛り上がりシーン 02" "仲間との一打" "#20180f" "#0b0b0c"
make_photo_placeholder "gallery-3-placeholder.svg" "盛り上がりシーン 03" "乾杯の瞬間" "#141d15" "#0b0b0c"
make_photo_placeholder "gallery-4-placeholder.svg" "盛り上がりシーン 04" "二次会利用の様子" "#1d1414" "#0b0b0c"
make_photo_placeholder "gallery-5-placeholder.svg" "盛り上がりシーン 05" "自慢のフード" "#1c1810" "#0b0b0c"
make_photo_placeholder "gallery-6-placeholder.svg" "盛り上がりシーン 06" "スタッフとの一枚" "#131a1c" "#0b0b0c"
make_photo_placeholder "party-placeholder.svg" "貸切・コンペ利用" "二次会/打ち上げ実績" "#1a1512" "#0b0b0c"

# hero-bg-placeholder / campaign-placeholder は本文の見出しと重ならないよう
# 隅に小さなウォーターマークだけを置く専用テンプレート
make_watermark_placeholder() {
  local filename="$1" watermark="$2" c1="$3" c2="$4"
  cat > "$DIR/$filename" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="${watermark}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <rect width="800" height="500" fill="url(#grid)"/>
  <circle cx="700" cy="80" r="120" fill="rgba(212,175,55,0.12)"/>
  <circle cx="90" cy="440" r="160" fill="rgba(0,0,0,0.18)"/>
  <text x="770" y="470" font-family="'Noto Sans JP',sans-serif" font-size="14" font-weight="700" fill="rgba(245,241,230,0.45)" text-anchor="end">${watermark}</text>
</svg>
SVG
}
make_watermark_placeholder "hero-bg-placeholder.svg" "店内写真 準備中(仮画像)" "#1a1a1d" "#0b0b0c"
make_watermark_placeholder "campaign-placeholder.svg" "背景画像 準備中(仮画像)" "#221a0d" "#0b0b0c"

# アイコン系(1:1)
make_icon_placeholder "icon-simulator.svg" "SIM" "#d4af37"
make_icon_placeholder "icon-drink.svg" "DRINK" "#e8382b"
make_icon_placeholder "icon-food.svg" "FOOD" "#3aa655"
make_icon_placeholder "icon-group.svg" "GROUP" "#d4af37"

echo "placeholders generated in $DIR"
