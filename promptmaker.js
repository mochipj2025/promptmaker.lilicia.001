const FIXED_PROMPT = [
  "score_9", "score_8_up", "score_7_up", "photorealistic", "real human texture",
  "dslr", "soft focus", "film grain", "candid moment", "subtle imperfections",
  "Lilithia", "silver hair", "medium length, layered hairstyle", "golden eyes",
  "sexy and cute face", "large breasts", "slim waist", "alluring", "confident",
  "does not resist desire", "goddess of lust", "succubus queen",
  "white_button_shirt", "denim_mini_skirt", "thong", "long_boots", "vintage_leather",
  "garter_belt", "holding_object", "rusted_bastard_sword", "bird_eye_view",
  "spotlight", "rim_light", "dark_world", "smoke", "mist"
].join(', ');

const categoryMeta = [
  { name: "tops", label: "トップス" },
  { name: "bottoms", label: "ボトムス" },
  { name: "onepiece", label: "ワンピース" },
  { name: "outer", label: "アウター" },
  { name: "lingerie", label: "ランジェリー" },
  { name: "footwear", label: "靴・レッグウェア" },
  { name: "material", label: "素材" },
  { name: "accessory", label: "装飾品" },
  { name: "fetish", label: "フェティッシュ" },
  { name: "cosplay", label: "コスプレ" },
  { name: "masturbation_pose", label: "マスターベーション" },
  { name: "pose_normal", label: "通常ポーズ" },
  { name: "antique_weapons", label: "アンティーク武器" },
  { name: "camera_work", label: "カメラワーク" },
  { name: "lighting", label: "ライティング" },
  { name: "background", label: "背景" },
  { name: "effect", label: "演出エフェクト" }
];

const loadedData = {};

window.onload = async function() {
  // form-areaが無い場合はエラーを出す
  const area = document.getElementById('form-area');
  if (!area) {
    alert("index.htmlに<div id='form-area'></div>がありません！");
    return;
  }
  // データ取得
  for (const cat of categoryMeta) {
    try {
      const res = await fetch(`data/${cat.name}.json`);
      loadedData[cat.name] = await res.json();
    } catch(e) {
      loadedData[cat.name] = [];
    }
  }
  renderForm();
  updatePrompt();
};

function renderForm() {
  const area = document.getElementById('form-area');
  area.innerHTML = '';
  categoryMeta.forEach(cat => {
    const block = document.createElement('div');
    block.className = "category-block";
    const title = document.createElement('div');
    title.className = "cat-title";
    title.textContent = cat.label;
    block.appendChild(title);
    const selRow = document.createElement('div');
    selRow.className = "select-row";
    const data = loadedData[cat.name] || [];
    // チェックボックス or セレクト切替
    if (data.length < 8) {
      data.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.className = "toggle-btn";
        btn.textContent = opt.label;
        btn.dataset.value = opt.value;
        btn.onclick = () => {
          btn.classList.toggle('selected');
          updatePrompt();
        };
        selRow.appendChild(btn);
      });
    } else {
      const select = document.createElement('select');
      select.innerHTML = `<option value="">選択してください</option>`;
      data.forEach(opt => {
        select.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
      });
      select.onchange = updatePrompt;
      selRow.appendChild(select);
    }
    block.appendChild(selRow);
    area.appendChild(block);
  });
}

function updatePrompt() {
  const promptArr = [FIXED_PROMPT];
  document.querySelectorAll('.category-block').forEach(block => {
    block.querySelectorAll('.toggle-btn.selected').forEach(btn => {
      promptArr.push(btn.dataset.value);
    });
    const select = block.querySelector('select');
    if (select && select.value) promptArr.push(select.value);
  });
  document.getElementById('prompt-output').value = promptArr.join(', ');
}

document.getElementById('copy-prompt').onclick = function() {
  const ta = document.getElementById('prompt-output');
  ta.select();
  document.execCommand('copy');
};
