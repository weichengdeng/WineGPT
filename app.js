const DEFAULT_LANGUAGE = "ja";

const state = {
  products: [],
  language: DEFAULT_LANGUAGE,
  type: "any"
};

const i18n = {
  zh: {
    language: "语言",
    budget: "预算上限",
    wineType: "酒款类型",
    beginner: "优先适合新手",
    onlyWine: "只推荐葡萄酒",
    catalogLoaded: "个商品已载入",
    placeholder: "例如：今晚吃照烧鸡，想要一瓶不太涩、适合新手的红酒，预算 5000 日元以内。",
    recommend: "推荐",
    ranking: "推荐结果",
    hello: "告诉我用餐、预算、颜色偏好、是否送礼或是否适合新手。",
    fallback: "本地规则已完成排序；未配置 AI API Key 时，会显示规则解释。",
    buy: "购买链接",
    score: "规则分",
    reason: "推荐理由",
    reasons: "命中规则",
    noResult: "没有找到符合条件的商品。可以放宽预算或类型限制。",
    loading: "AI 正在选择推荐..."
  },
  en: {
    language: "Language",
    budget: "Budget cap",
    wineType: "Wine type",
    beginner: "Prioritize beginner-friendly",
    onlyWine: "Wine only",
    catalogLoaded: "products loaded",
    placeholder: "Example: Dinner is teriyaki chicken. I want a gentle red wine for beginners under 5,000 JPY.",
    recommend: "Recommend",
    ranking: "Recommendations",
    hello: "Tell me the meal, budget, color preference, gift context, or beginner needs.",
    fallback: "Local rules ranked the wines. Without an AI API key, the app shows a rule-based explanation.",
    buy: "Buy",
    score: "Rule score",
    reason: "Reason",
    reasons: "Matched rules",
    noResult: "No matching product found. Try relaxing the budget or type filter.",
    loading: "AI is choosing recommendations..."
  },
  ja: {
    language: "言語",
    budget: "予算上限",
    wineType: "ワインタイプ",
    beginner: "初心者向けを優先",
    onlyWine: "ワインのみ",
    catalogLoaded: "件の商品を読み込み済み",
    placeholder: "例：今夜は照り焼きチキン。渋すぎず初心者にも飲みやすい赤ワインを5,000円以内で。",
    recommend: "推薦",
    ranking: "推薦結果",
    hello: "料理、予算、色の好み、ギフト用途、初心者向けかどうかを入力してください。",
    fallback: "ローカルルールで順位付けしました。AI API Key が未設定の場合はルール説明を表示します。",
    buy: "購入リンク",
    score: "ルール点",
    reason: "推薦理由",
    reasons: "一致ルール",
    noResult: "条件に合う商品が見つかりません。予算やタイプ条件を緩めてください。",
    loading: "AI が推薦を選んでいます..."
  }
};

const typeLabels = {
  zh: { any: "不限", red: "红", white: "白", rose: "桃红", sparkling: "起泡" },
  en: { any: "Any", red: "Red", white: "White", rose: "Rose", sparkling: "Sparkling" },
  ja: { any: "指定なし", red: "赤", white: "白", rose: "ロゼ", sparkling: "スパーク" }
};

const foodMap = [
  { keys: ["chicken", "teriyaki", "照烧", "照り焼き", "鶏", "鸡"], terms: ["chicken", "teriyaki", "鶏", "チキン"], label: { zh: "鸡肉/照烧", en: "chicken or teriyaki", ja: "鶏料理/照り焼き" } },
  { keys: ["pork", "ginger", "猪", "豚", "生姜"], terms: ["pork", "ginger", "豚"], label: { zh: "猪肉", en: "pork", ja: "豚肉" } },
  { keys: ["beef", "steak", "sukiyaki", "牛", "すきやき", "寿喜烧"], terms: ["sukiyaki", "beef", "すきやき"], label: { zh: "牛肉/寿喜烧", en: "beef or sukiyaki", ja: "牛肉/すきやき" } },
  { keys: ["fish", "seafood", "sushi", "鱼", "海鲜", "魚", "寿司"], terms: ["fish", "seafood", "sushi", "魚"], label: { zh: "鱼类/海鲜", en: "fish or seafood", ja: "魚介" } },
  { keys: ["dessert", "sweet", "甜点", "デザート"], terms: ["dessert", "sweet"], label: { zh: "甜点", en: "dessert", ja: "デザート" } }
];

const occasionMap = [
  { keys: ["gift", "present", "送礼", "礼物", "ギフト", "贈答"], term: "gift", label: { zh: "送礼", en: "gift", ja: "ギフト" } },
  { keys: ["dinner", "meal", "晚餐", "吃饭", "食事", "ディナー"], term: "dinner", label: { zh: "正餐", en: "dinner", ja: "食事" } },
  { keys: ["premium", "special", "高级", "特别", "プレミアム", "特別"], term: "premium", label: { zh: "高端/特别场合", en: "premium occasion", ja: "特別な場面" } }
];

function t(key) {
  return i18n[state.language][key] || i18n[DEFAULT_LANGUAGE][key] || key;
}

function yen(value) {
  return `¥${Number(value || 0).toLocaleString("ja-JP")}`;
}

function normalize(text) {
  return String(text || "").toLowerCase();
}

function setLanguage(lang) {
  state.language = i18n[lang] ? lang : DEFAULT_LANGUAGE;
  document.documentElement.lang = state.language;
  document.querySelector("#language").value = state.language;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("#typeSegments button").forEach(button => {
    button.textContent = typeLabels[state.language][button.dataset.type];
  });
  if (!document.querySelector(".message")) {
    addMessage(t("hello"), "assistant");
  }
}

function parseSignals(text) {
  const lower = normalize(text);
  const signals = {
    requestedTypes: [],
    foods: [],
    occasions: [],
    beginner: document.querySelector("#beginner").checked,
    lowTannin: /不太涩|低涩|少涩|not too tannic|low tannin|渋すぎ|渋くない/.test(lower),
    light: /轻|清爽|light|fresh|軽|さっぱり/.test(lower),
    rich: /浓郁|饱满|rich|full|コク|濃/.test(lower),
    sweet: /甜|sweet|甘/.test(lower)
  };

  const typePatterns = [
    ["red", /红酒|紅|赤|red/],
    ["white", /白酒|白ワイン|白|white|chardonnay|シャルドネ/],
    ["rose", /桃红|桃紅|ロゼ|rose|rosé/],
    ["sparkling", /起泡|气泡|スパークリング|sparkling/]
  ];
  typePatterns.forEach(([type, pattern]) => {
    if (pattern.test(lower)) signals.requestedTypes.push(type);
  });

  foodMap.forEach(item => {
    if (item.keys.some(key => lower.includes(normalize(key)))) signals.foods.push(item);
  });
  occasionMap.forEach(item => {
    if (item.keys.some(key => lower.includes(normalize(key)))) signals.occasions.push(item);
  });

  return signals;
}

function includesAny(value, terms) {
  const lower = normalize(value);
  return terms.some(term => lower.includes(normalize(term)));
}

function typeMatches(product, requested) {
  const type = normalize(product.type || product.category);
  if (requested === "rose") return type.includes("rose") || type.includes("rosé") || type.includes("ロゼ");
  if (requested === "sparkling") return type.includes("sparkling") || type.includes("スパーク");
  return type.includes(requested) || (requested === "red" && type.includes("赤")) || (requested === "white" && type.includes("白"));
}

function getCandidateProducts() {
  const budget = Number(document.querySelector("#budget").value);
  const onlyWine = document.querySelector("#onlyWine").checked;

  return state.products.filter(product => {
    if (onlyWine && product.isWine !== "yes") {
      return false;
    }
    if (Number(product.price) > budget) {
      return false;
    }
    if (state.type !== "any" && !typeMatches(product, state.type)) {
      return false;
    }
    return true;
  });
}

function scoreProduct(product, signals) {
  const reasons = [];
  let score = 0;

  if (product.isWine === "yes") {
    score += 20;
  }

  if (Number(product.price) <= Number(document.querySelector("#budget").value)) {
    score += 15;
    reasons.push(`${t("budget")}: ${yen(product.price)}`);
  } else {
    score -= 30;
  }

  const selectedType = state.type;
  const requestedTypes = selectedType === "any" ? signals.requestedTypes : [selectedType];
  if (requestedTypes.length) {
    if (requestedTypes.some(type => typeMatches(product, type))) {
      score += 24;
      reasons.push(`${t("wineType")}: ${product.type || product.category}`);
    } else {
      score -= 18;
    }
  }

  signals.foods.forEach(food => {
    if (includesAny(product.pairings, food.terms) || includesAny(product.aiNotes, food.terms)) {
      score += 18;
      reasons.push(food.label[state.language]);
    }
  });

  signals.occasions.forEach(occasion => {
    if (includesAny(product.occasions, [occasion.term]) || includesAny(product.aiNotes, [occasion.term])) {
      score += 12;
      reasons.push(occasion.label[state.language]);
    }
  });

  if (signals.beginner && normalize(product.beginner).includes("yes")) {
    score += 16;
    reasons.push(t("beginner"));
  }

  if (signals.lowTannin && /soft|low|やわらか|少|低/.test(normalize(product.tannin + " " + product.aiNotes))) {
    score += 12;
    reasons.push(state.language === "en" ? "gentle tannin" : state.language === "ja" ? "渋みが穏やか" : "涩感较低");
  }

  if (signals.light && /light|fresh|軽|清爽|フレッシュ/.test(normalize(product.body + " " + product.flavors + " " + product.description))) {
    score += 10;
    reasons.push(state.language === "en" ? "lighter profile" : state.language === "ja" ? "軽やかな味わい" : "风格轻盈");
  }

  if (signals.rich && /rich|full|depth|コク|奥行|premium/.test(normalize(product.flavors + " " + product.description + " " + product.aiNotes))) {
    score += 10;
    reasons.push(state.language === "en" ? "richer profile" : state.language === "ja" ? "コクがある" : "更有厚度");
  }

  if (signals.sweet && /dessert|sweet|甘/.test(normalize(product.type + " " + product.sweetness + " " + product.category))) {
    score += 10;
    reasons.push(state.language === "en" ? "sweet/dessert cue" : state.language === "ja" ? "甘口/デザート向け" : "偏甜/甜点场景");
  }

  if (normalize(product.stock).includes("out")) {
    score -= 60;
  }

  return { ...product, score, reasons: [...new Set(reasons)].slice(0, 6) };
}

function localExplanation(top) {
  const name = top?.name || "";
  const reasonText = top?.reasons?.length ? top.reasons.join(" / ") : t("reasons");
  if (state.language === "en") {
    return `${name} scored highest on ${reasonText}. The alternates are kept visible for comparison, but the top bottle has the strongest fit against the stated constraints.`;
  }
  if (state.language === "ja") {
    return `${name} は「${reasonText}」の条件で最も高いルール点になったため第一候補です。他の候補も比較用に表示していますが、入力条件との一致度はこの商品が最も高いです。`;
  }
  return `${name} 是规则分最高的选择，主要命中：${reasonText}。下面也保留了备选酒，便于比较。`;
}

function addMessage(text, role, options = {}) {
  const node = document.createElement("div");
  node.className = `message ${role}${options.thinking ? " thinking" : ""}`;
  if (options.thinking) {
    node.innerHTML = `
      <span class="thinkingText">${text}</span>
      <span class="thinkingDots" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    `;
  } else {
    node.textContent = text;
  }
  document.querySelector("#messages").appendChild(node);
  node.scrollIntoView({ block: "end" });
  return node;
}

function resolveImage(product) {
  return product.image || product.mainImage || "";
}

function cardReason(product) {
  const base = product.aiNotes || product.description || "";
  return base.length > 170 ? `${base.slice(0, 170)}...` : base;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCards(items) {
  const cards = document.querySelector("#cards");
  cards.innerHTML = "";
  items.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = `card ${index === 0 ? "top" : ""}`;
    const tags = [product.type, product.grapes, product.occasions].filter(Boolean).join("; ").split(";").map(x => x.trim()).filter(Boolean).slice(0, 5);
    const hasScore = Number.isFinite(Number(product.score));
    const details = product.recommendationReason
      ? `<p class="recommendReason"><strong>${t("reason")}:</strong> ${escapeHtml(product.recommendationReason)}</p>`
      : `<div class="scoreRows">
          ${[
            hasScore ? `<span>${t("score")}: ${Math.round(product.score)}</span>` : "",
            `<span>${t("reasons")}: ${escapeHtml(product.reasons?.join(" / ") || "-")}</span>`
          ].filter(Boolean).join("")}
        </div>`;
    card.innerHTML = `
      <img class="photo" src="${escapeHtml(resolveImage(product))}" alt="${escapeHtml(product.name)}">
      <div>
        <h3>${index + 1}. ${escapeHtml(product.name)}</h3>
        <div class="meta">${yen(product.price)} / ${escapeHtml(product.vintage || "")} / ${escapeHtml(product.stock)}</div>
        <div class="tags">${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        <p class="why">${escapeHtml(cardReason(product))}</p>
        ${details}
        <a class="buy" href="${escapeHtml(product.url)}" target="_blank" rel="noopener">${t("buy")}</a>
      </div>
    `;
    cards.appendChild(card);
  });
}

function toRecommendationCandidate(product) {
  return {
    id: product.id,
    name: product.name,
    type: product.type,
    vintage: product.vintage,
    price: product.price,
    stock: product.stock,
    grapes: product.grapes,
    sweetness: product.sweetness,
    acidity: product.acidity,
    tannin: product.tannin,
    body: product.body,
    flavors: product.flavors,
    pairings: product.pairings,
    occasions: product.occasions,
    beginner: product.beginner,
    description: product.description,
    aiNotes: product.aiNotes
  };
}

function replaceThinkingMessage(node, text) {
  node.classList.remove("thinking");
  node.textContent = text;
}

async function recommend(event) {
  event.preventDefault();
  const userText = document.querySelector("#requestText").value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  const thinkingMessage = addMessage(t("loading"), "assistant", { thinking: true });

  const signals = parseSignals(userText);
  const candidates = getCandidateProducts();
  const localRanked = candidates
    .map(product => scoreProduct(product, signals))
    .filter(product => product.score > -20)
    .sort((a, b) => b.score - a.score || Number(a.price) - Number(b.price))
    .slice(0, 3);
  const fallbackRanked = localRanked.length
    ? localRanked
    : candidates
      .map(product => scoreProduct(product, signals))
      .sort((a, b) => b.score - a.score || Number(a.price) - Number(b.price))
      .slice(0, 3);

  if (!candidates.length) {
    replaceThinkingMessage(thinkingMessage, t("noResult"));
    renderCards([]);
    return;
  }

  const fallbackExplanation = localExplanation(fallbackRanked[0] || candidates[0]);
  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: state.language,
        userText,
        signals,
        filters: {
          budget: Number(document.querySelector("#budget").value),
          wineType: state.type,
          onlyWine: document.querySelector("#onlyWine").checked
        },
        fallbackExplanation,
        fallbackIds: fallbackRanked.map(product => product.id),
        candidates: candidates.map(toRecommendationCandidate)
      })
    });

    if (!response.ok) {
      throw new Error("AI recommendation request failed");
    }

    const data = await response.json();
    const productsById = new Map(candidates.map(product => [String(product.id), product]));
    const reasonById = new Map((data.recommendations || []).map(item => [String(item.id), item.reason || ""]));
    const aiRanked = (data.recommendations || [])
      .map(item => productsById.get(String(item.id)))
      .filter(Boolean)
      .map(product => ({
        ...product,
        recommendationReason: reasonById.get(String(product.id))
      }));

    renderCards(data.provider === "fallback" || !aiRanked.length ? fallbackRanked : aiRanked.slice(0, 3));
    replaceThinkingMessage(thinkingMessage, data.explanation || fallbackExplanation);
  } catch {
    renderCards(fallbackRanked);
    replaceThinkingMessage(thinkingMessage, fallbackExplanation);
  }
}

async function init() {
  const response = await fetch("products.json");
  state.products = await response.json();
  document.querySelector("#catalogCount").textContent = state.products.length;
  document.querySelector("#budgetValue").textContent = yen(document.querySelector("#budget").value);
  document.querySelector("#budget").addEventListener("input", event => {
    document.querySelector("#budgetValue").textContent = yen(event.target.value);
  });
  document.querySelector("#language").addEventListener("change", event => setLanguage(event.target.value));
  document.querySelector("#typeSegments").addEventListener("click", event => {
    if (!event.target.matches("button")) return;
    document.querySelectorAll("#typeSegments button").forEach(button => button.classList.remove("active"));
    event.target.classList.add("active");
    state.type = event.target.dataset.type;
  });
  document.querySelector("#recommendForm").addEventListener("submit", recommend);
  setLanguage(DEFAULT_LANGUAGE);
}

init();
