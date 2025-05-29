// ===== 固定prompt（必須） =====
const FIXED_PROMPT = [
  "score_9", "score_8_up", "score_7_up", "photorealistic", "real human texture", "dslr",
  "soft focus", "film grain", "candid moment", "subtle imperfections",
  "Lilithia", "silver hair", "medium length", "layered hairstyle", "golden eyes",
  "sexy and cute face", "large breasts", "slim waist", "alluring", "confident",
  "does not resist desire", "goddess of lust", "succubus queen"
];

// ===== 固定negative prompt（必須） =====
const FIXED_NEG_PROMPT = [
  "score_6", "score_5", "score_4", "simplified", "abstract", "unrealistic", "impressionistic",
  "low resolution", "lowres", "bad anatomy", "bad hands", "missing fingers", "worst quality", "low quality",
  "normal quality", "cartoon", "anime", "drawing", "sketch", "illustration", "artificial", "poor quality"
];

// ===== LoRA管理用サンプル（本番はlora.json推奨） =====
let loraList = [
  {
    name: "cinematic_style_v1",
    display: "Cinematic Style",
    file: "cinematicStyle_v1.safetensors",
    size: "299MB",
    date: "2025/05/18",
    desc: "シネマ風フィルム粒子強調",
    tag: ["safe", "detail"],
    nsfw: false,
    default_weight: 0.6
  },
  {
    name: "Pussy_LLM_v5",
    display: "Pussy LLM v5",
    file: "Pussy_LLM_v5XL.safetensors",
    size: "665MB",
    date: "2025/05/15",
    desc: "超リアルなディティール/NSFW特化",
    tag: ["nsfw", "detail"],
    nsfw: true,
    default_weight: 0.7
  }
  // …必要に応じて追加
];

// ===== dataフォルダの全カテゴリ（2025/05/29最新版） =====
const JSON_DIR = "./data/";
const jsonFiles = [
  "accessory.json",
  "antique_weapon.json",
  "background.json",
  "bottoms.json",
  "camera_angle.json",
  "camera_work.json",
  "fetish.json",
  "fixed_character.json",
  "footwear.json",
  "lighting.json",
  "lingerie.json",
  "masturbation_pose.json",
  "material.json",
  "onepiece.json",
  "outer.json",
  "pose_normal.json",
  "tops.json"
];
const categories = {};

// ===== ページ起動時 =====
window.addEventListener('DOMContentLoaded', async () => {
  for (let file of jsonFiles) {
    try {
      const res = await fetch(JSON_DIR + file);
      if (res.ok) categories[file.replace(/\.json$/, "")] = await res.json();
    } catch {}
  }
  buildCategoryUI();
  buildLoraUI();
  updatePrompt();
  addEventListeners();
});

// ===== カテゴリUI自動生成 =====
function buildCategoryUI() {
  const container = document.getElementById('prompt-controls');
  container.innerHTML = "";
  for (let [cat, data] of Object.entries(categories)) {
    const block = document.createElement('div');
    block.className = "category-block";
    const h3 = document.createElement('h3');
    h3.innerHTML = `<span>📁</span>${cat}`;
    block.appendChild(h3);
    // カテゴリ説明は空（必要ならあとで追加OK）
    const selRow = document.createElement('div');
    selRow.className = "select-row";
    if (Array.isArray(data) && data.length > 0) {
      if (data.length < 8) {
        data.forEach(opt => {
          const btn = document.createElement('button');
          btn.type = "button";
          btn.className = "toggle-btn";
          btn.textContent = opt;
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
          select.innerHTML += `<option value="${opt}">${opt}</option>`;
        });
        select.onchange = updatePrompt;
        selRow.appendChild(select);
      }
    }
    block.appendChild(selRow);
    container.appendChild(block);
  }
}

// ===== LoRA管理UI自動生成 =====
function buildLoraUI() {
  const loraListEl = document.getElementById('lora-list');
  loraListEl.innerHTML = '';
  loraList.forEach((item, idx) => {
    const li = document.createElement('li');
    if (item.nsfw) li.innerHTML += `<span class="lora-nsfw">NSFW</span>`;
    else li.innerHTML += `<span class="lora-safe">Safe</span>`;
    li.innerHTML += `<span class="lora-name">${item.display}</span> 
      <span class="lora-size">${item.size}</span>
      <span class="lora-desc">${item.desc}</span>
      <button class="lora-add-btn" data-idx="${idx}">追加</button>`;
    loraListEl.appendChild(li);
  });

  // LoRA検索・フィルタ
  document.getElementById('lora-search').oninput = function() {
    filterLoraList(this.value);
  };
  document.querySelectorAll('.lora-tags button').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.lora-tags button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterLoraList(document.getElementById('lora-search').value, btn.dataset.tag);
    };
  });

  // LoRA追加ボタン
  document.querySelectorAll('.lora-add-btn').forEach(btn => {
    btn.onclick = function() {
      btn.classList.toggle('selected');
      updatePrompt();
    };
  });
}
function filterLoraList(search = "", tag = "all") {
  const loraListEl = document.getElementById('lora-list');
  loraListEl.innerHTML = '';
  loraList.forEach((item, idx) => {
    if (tag && tag !== 'all' && !item.tag.includes(tag)) return;
    if (search && !item.display.toLowerCase().includes(search.toLowerCase())) return;
    const li = document.createElement('li');
    if (item.nsfw) li.innerHTML += `<span class="lora-nsfw">NSFW</span>`;
    else li.innerHTML += `<span class="lora-safe">Safe</span>`;
    li.innerHTML += `<span class="lora-name">${item.display}</span> 
      <span class="lora-size">${item.size}</span>
      <span class="lora-desc">${item.desc}</span>
      <button class="lora-add-btn" data-idx="${idx}">追加</button>`;
    loraListEl.appendChild(li);
  });
  document.querySelectorAll('.lora-add-btn').forEach(btn => {
    btn.onclick = function() {
      btn.classList.toggle('selected');
      updatePrompt();
    };
  });
}

// ===== prompt生成 =====
function updatePrompt() {
  const langEn = document.getElementById('lang-toggle')?.checked;
  let promptArr = [...FIXED_PROMPT];
  let negArr = [...FIXED_NEG_PROMPT];

  // カテゴリー
  document.querySelectorAll('.category-block').forEach(block => {
    block.querySelectorAll('.toggle-btn.selected').forEach(btn => promptArr.push(btn.textContent));
    const select = block.querySelector('select');
    if (select && select.value) promptArr.push(select.value);
  });

  // LoRA
  let loraPrompts = [];
  document.querySelectorAll('.lora-add-btn.selected').forEach(btn => {
    const idx = btn.getAttribute('data-idx');
    const lora = loraList[idx];
    loraPrompts.push(`<lora:${lora.name}:${lora.default_weight}>`);
    // NSFW選択時のみ、neg promptへ追加
    if (lora.nsfw) negArr.push("censored", "blurry", "mosaic", "overexposed");
  });

  // Positive
  let out = promptArr.join(', ');
  if (loraPrompts.length) out = loraPrompts.join(' ') + " " + out;
  // （日本語→英語変換ロジック必要ならここで変換）

  document.getElementById('prompt-output').value = out;

  // Negative
  let neg = [...new Set(negArr)].join(', ');
  document.getElementById('neg-output').value = neg;
}

// ===== コピーボタン等 =====
function addEventListeners() {
  document.getElementById('copy-btn').onclick = () => {
    let val = "Positive prompt:\n" + document.getElementById('prompt-output').value + "\n\n";
    val += "Negative prompt:\n" + document.getElementById('neg-output').value;
    navigator.clipboard.writeText(val);
    document.getElementById('copy-btn').textContent = "コピー完了";
    setTimeout(() => document.getElementById('copy-btn').textContent = "コピペ", 1300);
  };
  document.getElementById('reset-btn').onclick = () => {
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('select').forEach(sel => sel.selectedIndex = 0);
    document.querySelectorAll('.lora-add-btn').forEach(btn => btn.classList.remove('selected'));
    updatePrompt();
  };
  document.getElementById('lang-toggle').onchange = updatePrompt;
}
