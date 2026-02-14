create_logo() {
  local id=$1
  local name=$2
  local color=$3
  cat > "team-${id}.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${color}" rx="12"/>
  <text x="50" y="60" font-size="42" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">${name}</text>
</svg>
EOF
  echo "✅ team-${id}.svg"
}

create_logo "rr" "RR" "#ec4899"
create_logo "dc" "DC" "#1e40af"
create_logo "srh" "SRH" "#f97316"
create_logo "gt" "GT" "#1d4ed8"
create_logo "kkr" "KKR" "#7c3aed"
create_logo "pbks" "PBKS" "#dc2626"
create_logo "lsg" "LSG" "#0891b2"

echo "✅ All 7 remaining team logos created!"
