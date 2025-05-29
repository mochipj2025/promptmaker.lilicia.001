const FIXED_PROMPT = [
  "score_9", "score_8_up", "score_7_up", "photorealistic", "real human texture",
  "dslr", "soft focus", "film grain", "candid moment", "subtle imperfections",
  "Lilithia", "silver hair", "medium length, layered hairstyle", "golden eyes",
  "sexy and cute face", "large breasts", "slim waist", "alluring", "confident",
  "does not resist desire", "goddess of lust", "succubus queen",
  // 初期装備/演出
  "white_button_shirt", "denim_mini_skirt", "thong", "long_boots", "vintage_leather",
  "garter_belt", "holding_object", "rusted_bastard_sword", "bird_eye_view",
  "spotlight", "rim_light", "dark_world", "smoke", "mist"
].join(', ');

const FIXED_NEGATIVE_PROMPT = [
  "score_6", "score_5", "score_4", "simplified", "abstract", "unrealistic", "impressionistic",
  "low resolution", "((adult body))", "lowres", "bad anatomy", "bad hands", "missing fingers",
  "worst quality", "low quality", "normal quality", "cartoon", "anime", "drawing", "sketch",
  "illustration", "artificial", "poor quality"
].join(', ');

// 必ずカテゴリjsonファイルも { value: "英語プロンプト", label: "日本語ラベル" } 形式に！
const categoryMeta = [
  { name: "tops", label: "トップス", selectType: "multiple" },
  { name: "bottoms", label: "ボトムス", selectType: "multiple" },
  { name: "onepiece", label: "ワンピース", selectType: "multiple" },
  { name: "outer", label: "アウター", selectType: "multiple" },
  { name: "lingerie", label: "ランジェリー", selectType: "multiple" },
  { name: "footwear", label: "靴・レッグウェア", selectType: "multiple" },
  { name: "material", label: "素材", selectType: "single" },
  { name: "accessory", label: "装飾品", selectType: "multiple" },
  { name: "fetish", label: "フェティッシュ", selectType: "multiple" },
  { name: "cosplay", label: "コスプレ", selectType: "multiple" },
  { name: "masturbation_pose", label: "マスターベーション", selectType: "multiple" },
  { name: "pose_normal", label: "通常ポーズ", selectType: "single" },
  { name: "antique_weapons", label: "アンティーク武器", selectType: "multiple" },
  { name: "camera_work", label: "カメラワーク", selectType: "single" },
  { name: "lighting", label: "ライティング", selectType: "multiple" },
  { name: "background", label: "背景", selectType: "single" },
  { name: "effect", label: "演出エフェクト", selectType: "multiple" }
];

const loadedData = {};

window.onload = async function() {
  for (const cat of categoryMeta) {
    const res = await fetch(`data/${cat.name}.json`);
    loadedData[cat.name] = await res.json();
  }
  renderForm();
  updatePrompt();
  document.getElementById('negprompt-output').value = FIXED_NEGATIVE_PROMPT;
};

function renderForm() {
  const area = document.getElementById('form-area');
  area.innerHTML = '';
  categoryMeta.forEach(cat => {
    const card = document.createElement('div');
    card.className = "category-card";

    // カテゴリ名
    const header = document.createElement('button');
    header.className = "cat-accordion";
    header.type = "button";
    header.textContent = cat.label;
    header.setAttribute("aria-expanded", "false");

    // パネル
    const panel = document.createElement('div');
    panel.className = "cat-panel";
    panel.style.display = "none";

    header.onclick = function () {
      const isOpen = panel.style.display === "block";
      panel.style.display = isOpen ? "none" : "block";
      header.classList.toggle('active', !isOpen);
    };

    // 選択肢（select or checkbox）
    if (cat.selectType === "single") {
      const select = document.createElement('select');
      select.name = cat.name;
      select.onchange = updatePrompt;
      select.appendChild(new Option("選択してください", ""));
      loadedData[cat.name].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;              // 英語プロンプト
        option.textContent = opt.label;        // 日本語ラベル
        select.appendChild(option);
      });
      panel.appendChild(select);
    } else {
      loadedData[cat.name].forEach(opt => {
        const id = `${cat.name}_${opt.value}`;
        const input = document.createElement('input');
        input.type = "checkbox";
        input.id = id;
        input.name = cat.name;
        input.value = opt.value;              // 英語プロンプト
        input.addEventListener('change', updatePrompt);

        const lab = document.createElement('label');
        lab.htmlFor = id;
        lab.textContent = opt.label;          // 日本語ラベル
        lab.className = "checkbox-label";

        panel.appendChild(input);
        panel.appendChild(lab);
      });
    }
    card.appendChild(header);
    card.appendChild(panel);
    area.appendChild(card);
  });
}

function updatePrompt() {
  let prompt = [FIXED_PROMPT];
  categoryMeta.forEach(cat => {
    if (cat.selectType === "single") {
      const sel = document.querySelector(`select[name="${cat.name}"]`);
      if (sel && sel.value) {
        prompt.push(sel.value); // 必ず「value（英語）」のみ
      }
    } else {
      const checked = Array.from(document.querySelectorAll(`input[name="${cat.name}"]:checked`));
      checked.forEach(el => {
        prompt.push(el.value); // 必ず「value（英語）」のみ
      });
    }
  });
  document.getElementById('prompt-output').value = prompt.join(', ');
}

document.getElementById('copy-prompt').onclick = function() {
  const ta = document.getElementById('prompt-output');
  ta.select();
  document.execCommand('copy');
};
document.getElementById('copy-negprompt').onclick = function() {
  const ta = document.getElementById('negprompt-output');
  ta.select();
  document.execCommand('copy');
};
