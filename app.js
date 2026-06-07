const DEFAULT_LANGUAGE = "ja";

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
    noResult: "没有找到符合条件的商品。可以放宽酒款类型或只推荐葡萄酒限制。",
    loading: "AI 正在选择推荐...",
    flavorShortcuts: "风味偏好",
    foodShortcuts: "日本常见搭配"
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
    noResult: "No matching product found. Try relaxing the wine type or wine-only filter.",
    loading: "AI is choosing recommendations...",
    flavorShortcuts: "Flavor preferences",
    foodShortcuts: "Common Japanese pairings"
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
    noResult: "条件に合う商品が見つかりません。タイプ条件やワインのみの条件を緩めてください。",
    loading: "AI が推薦を選んでいます...",
    flavorShortcuts: "味わいの好み",
    foodShortcuts: "和食の定番ペアリング"
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
  { keys: ["sashimi", "刺身", "金枪鱼", "まぐろ", "マグロ", "tuna"], terms: ["tuna sashimi", "sashimi", "tuna", "まぐろ"], label: { zh: "刺身/金枪鱼", en: "sashimi or tuna", ja: "刺身/まぐろ" } },
  { keys: ["chirashi", "散寿司", "ちらし", "ちらし寿司"], terms: ["chirashi sushi", "sushi"], label: { zh: "散寿司", en: "chirashi sushi", ja: "ちらし寿司" } },
  { keys: ["oyster", "fried oyster", "牡蛎", "牡蠣", "カキフライ"], terms: ["oysters", "fried oysters", "oyster"], label: { zh: "牡蛎/炸牡蛎", en: "oysters", ja: "牡蠣/カキフライ" } },
  { keys: ["hot pot", "nabe", "锅", "鍋", "芹菜锅", "せり鍋"], terms: ["hot pot", "seri hot pot", "Japanese cuisine"], label: { zh: "日式锅物", en: "Japanese hot pot", ja: "鍋料理" } },
  { keys: ["nikujaga", "肉じゃが", "土豆炖肉"], terms: ["nikujaga", "Japanese cuisine"], label: { zh: "土豆炖肉", en: "nikujaga", ja: "肉じゃが" } },
  { keys: ["grilled fish", "salmon", "焼き魚", "烤鱼", "鲑鱼", "鮭"], terms: ["salmon", "white fish", "butter-sautéed white fish", "sea bream"], label: { zh: "烤鱼/鲑鱼", en: "grilled fish or salmon", ja: "焼き魚/鮭" } },
  { keys: ["dessert", "sweet", "甜点", "デザート"], terms: ["dessert", "sweet"], label: { zh: "甜点", en: "dessert", ja: "デザート" } }
];

const occasionMap = [
  { keys: ["gift", "present", "送礼", "礼物", "ギフト", "贈答"], term: "gift", label: { zh: "送礼", en: "gift", ja: "ギフト" } },
  { keys: ["dinner", "meal", "晚餐", "吃饭", "食事", "ディナー"], term: "dinner", label: { zh: "正餐", en: "dinner", ja: "食事" } },
  { keys: ["premium", "special", "高级", "特别", "プレミアム", "特別"], term: "premium", label: { zh: "高端/特别场合", en: "premium occasion", ja: "特別な場面" } }
];

const shortcutGroups = {
  flavors: [
    {
      id: "fresh",
      emoji: "🍋",
      label: { zh: "清爽", en: "Fresh", ja: "さっぱり" },
      text: { zh: "清爽轻盈", en: "fresh and light", ja: "さっぱり軽やか" }
    },
    {
      id: "fruity",
      emoji: "🍓",
      label: { zh: "果香", en: "Fruity", ja: "果実味" },
      text: { zh: "果香明显", en: "fruit-forward", ja: "果実味がある" }
    },
    {
      id: "low-tannin",
      emoji: "🪶",
      label: { zh: "不涩", en: "Low tannin", ja: "渋み控えめ" },
      text: { zh: "不太涩", en: "not too tannic", ja: "渋すぎない" }
    },
    {
      id: "rich",
      emoji: "🪵",
      label: { zh: "浓郁", en: "Rich", ja: "コクあり" },
      text: { zh: "浓郁有厚度", en: "rich and full", ja: "コクがある" }
    },
    {
      id: "sweet",
      emoji: "🍯",
      label: { zh: "偏甜", en: "Slightly sweet", ja: "やや甘口" },
      text: { zh: "带一点甜感", en: "slightly sweet", ja: "やや甘口" }
    },
    {
      id: "sparkling",
      emoji: "🥂",
      label: { zh: "起泡", en: "Sparkling", ja: "泡" },
      text: { zh: "想要起泡酒", en: "sparkling wine", ja: "スパークリングワイン" }
    }
  ],
  foods: [
    {
      id: "teriyaki",
      emoji: "🍗",
      label: { zh: "照烧鸡", en: "Teriyaki chicken", ja: "照り焼きチキン" },
      text: { zh: "搭配照烧鸡", en: "with teriyaki chicken", ja: "照り焼きチキンに合わせたい" }
    },
    {
      id: "sukiyaki",
      emoji: "🥩",
      label: { zh: "寿喜烧", en: "Sukiyaki", ja: "すき焼き" },
      text: { zh: "搭配寿喜烧", en: "with sukiyaki", ja: "すき焼きに合わせたい" }
    },
    {
      id: "sashimi",
      emoji: "🍣",
      label: { zh: "刺身", en: "Sashimi", ja: "刺身" },
      text: { zh: "搭配刺身或金枪鱼", en: "with sashimi or tuna", ja: "刺身やまぐろに合わせたい" }
    },
    {
      id: "chirashi",
      emoji: "🍱",
      label: { zh: "散寿司", en: "Chirashi", ja: "ちらし寿司" },
      text: { zh: "搭配散寿司", en: "with chirashi sushi", ja: "ちらし寿司に合わせたい" }
    },
    {
      id: "oysters",
      emoji: "🦪",
      label: { zh: "炸牡蛎", en: "Fried oysters", ja: "カキフライ" },
      text: { zh: "搭配炸牡蛎", en: "with fried oysters", ja: "カキフライに合わせたい" }
    },
    {
      id: "nabe",
      emoji: "🍲",
      label: { zh: "日式锅物", en: "Nabe", ja: "鍋料理" },
      text: { zh: "搭配日式锅物", en: "with Japanese hot pot", ja: "鍋料理に合わせたい" }
    },
    {
      id: "nikujaga",
      emoji: "🥔",
      label: { zh: "土豆炖肉", en: "Nikujaga", ja: "肉じゃが" },
      text: { zh: "搭配土豆炖肉", en: "with nikujaga", ja: "肉じゃがに合わせたい" }
    },
    {
      id: "grilled-fish",
      emoji: "🐟",
      label: { zh: "烤鱼", en: "Grilled fish", ja: "焼き魚" },
      text: { zh: "搭配烤鱼或鲑鱼", en: "with grilled fish or salmon", ja: "焼き魚や鮭に合わせたい" }
    }
  ]
};

function normalize(text) {
  return String(text || "").toLowerCase();
}

function includesAny(value, terms) {
  const lower = normalize(value);
  return terms.some(term => lower.includes(normalize(term)));
}

function parseBudgetCap(text) {
  const source = String(text || "").replaceAll(",", "").replaceAll("，", "");
  const currencyMatch = source.match(/(?:¥|￥)\s*([0-9]+)|([0-9]+)\s*(?:円|日元|yen|jpy)/i);

  if (currencyMatch) {
    return Number(currencyMatch[1] || currencyMatch[2]);
  }

  const thousandMatch = source.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:k|千)\s*(?:円|日元|yen|jpy)?/i);

  if (thousandMatch) {
    return Math.round(Number(thousandMatch[1]) * 1000);
  }

  const tenThousandMatch = source.match(/([0-9]+(?:\.[0-9]+)?)\s*万\s*(?:円|日元)?/i);

  if (tenThousandMatch) {
    return Math.round(Number(tenThousandMatch[1]) * 10000);
  }

  return null;
}

const { createApp, nextTick } = Vue;

createApp({
  data() {
    return {
      products: [],
      language: DEFAULT_LANGUAGE,
      type: "any",
      beginner: false,
      onlyWine: true,
      requestText: "",
      messages: [],
      results: [],
      loading: false,
      messageId: 0,
      wineTypes: ["any", "red", "white", "rose", "sparkling"],
      shortcutGroups
    };
  },

  computed: {
    typeLabelsForCurrentLanguage() {
      return typeLabels[this.language] || typeLabels[DEFAULT_LANGUAGE];
    },

    flavorShortcuts() {
      return this.shortcutGroups.flavors;
    },

    foodShortcuts() {
      return this.shortcutGroups.foods;
    }
  },

  watch: {
    language(value) {
      if (!i18n[value]) {
        this.language = DEFAULT_LANGUAGE;
        return;
      }

      document.documentElement.lang = value;
    }
  },

  async mounted() {
    document.documentElement.lang = this.language;
    this.addMessage("", "assistant", { i18nKey: "hello" });
    await this.loadProducts();
  },

  methods: {
    t(key) {
      return i18n[this.language]?.[key] || i18n[DEFAULT_LANGUAGE][key] || key;
    },

    yen(value) {
      return `¥${Number(value || 0).toLocaleString("ja-JP")}`;
    },

    shortcutLabel(shortcut) {
      return shortcut.label[this.language] || shortcut.label[DEFAULT_LANGUAGE] || shortcut.id;
    },

    shortcutText(shortcut) {
      return shortcut.text[this.language] || shortcut.text[DEFAULT_LANGUAGE] || "";
    },

    hasShortcut(shortcut) {
      const text = this.shortcutText(shortcut);
      return Boolean(text && this.requestText.includes(text));
    },

    applyShortcut(shortcut) {
      const text = this.shortcutText(shortcut);

      if (!text || this.hasShortcut(shortcut)) {
        nextTick(() => this.$refs.requestText?.focus());
        return;
      }

      const separator = this.requestText.trim() ? "、" : "";
      this.requestText = `${this.requestText.trim()}${separator}${text}`;
      nextTick(() => this.$refs.requestText?.focus());
    },

    async loadProducts() {
      const response = await fetch("products.json");
      this.products = await response.json();
    },

    messageText(message) {
      return message.i18nKey ? this.t(message.i18nKey) : message.text;
    },

    addMessage(text, role, options = {}) {
      const message = {
        id: ++this.messageId,
        role,
        text,
        thinking: Boolean(options.thinking),
        i18nKey: options.i18nKey || ""
      };

      this.messages.push(message);
      nextTick(this.scrollMessagesToEnd);
      return message.id;
    },

    replaceThinkingMessage(messageId, text) {
      const message = this.messages.find(item => item.id === messageId);

      if (!message) {
        return;
      }

      message.thinking = false;
      message.i18nKey = "";
      message.text = text;
      nextTick(this.scrollMessagesToEnd);
    },

    scrollMessagesToEnd() {
      const messages = this.$refs.messages;

      if (!messages) {
        return;
      }

      messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth"
      });
    },

    parseSignals(text) {
      const lower = normalize(text);
      const signals = {
        requestedTypes: [],
        foods: [],
        occasions: [],
        beginner: this.beginner,
        lowTannin: /不太涩|低涩|少涩|not too tannic|low tannin|渋すぎ|渋くない/.test(lower),
        light: /轻|清爽|light|fresh|軽|さっぱり/.test(lower),
        rich: /浓郁|饱满|rich|full|コク|濃/.test(lower),
        sweet: /甜|sweet|甘/.test(lower),
        fruity: /果香|果味|fruit|fruity|fruit-forward|果実/.test(lower),
        budgetCap: parseBudgetCap(text)
      };

      const typePatterns = [
        ["red", /红酒|紅|赤|red/],
        ["white", /白酒|白ワイン|白|white|chardonnay|シャルドネ/],
        ["rose", /桃红|桃紅|ロゼ|rose|rosé/],
        ["sparkling", /起泡|气泡|スパークリング|sparkling/]
      ];

      typePatterns.forEach(([wineType, pattern]) => {
        if (pattern.test(lower)) {
          signals.requestedTypes.push(wineType);
        }
      });

      foodMap.forEach(item => {
        if (item.keys.some(key => lower.includes(normalize(key)))) {
          signals.foods.push(item);
        }
      });

      occasionMap.forEach(item => {
        if (item.keys.some(key => lower.includes(normalize(key)))) {
          signals.occasions.push(item);
        }
      });

      return signals;
    },

    typeMatches(product, requested) {
      const productType = normalize(product.type || product.category);

      if (requested === "rose") {
        return productType.includes("rose") || productType.includes("rosé") || productType.includes("ロゼ");
      }

      if (requested === "sparkling") {
        return productType.includes("sparkling") || productType.includes("スパーク");
      }

      return productType.includes(requested) ||
        (requested === "red" && productType.includes("赤")) ||
        (requested === "white" && productType.includes("白"));
    },

    getCandidateProducts(signals = {}) {
      return this.products.filter(product => {
        if (this.onlyWine && product.isWine !== "yes") {
          return false;
        }

        if (signals.budgetCap && Number(product.price) > signals.budgetCap) {
          return false;
        }

        if (this.type !== "any" && !this.typeMatches(product, this.type)) {
          return false;
        }

        return true;
      });
    },

    scoreProduct(product, signals) {
      const reasons = [];
      let score = 0;

      if (product.isWine === "yes") {
        score += 20;
      }

      if (signals.budgetCap) {
        if (Number(product.price) <= signals.budgetCap) {
          score += 15;
          reasons.push(`${this.t("budget")}: ${this.yen(product.price)}`);
        } else {
          score -= 30;
        }
      }

      const requestedTypes = this.type === "any" ? signals.requestedTypes : [this.type];

      if (requestedTypes.length) {
        if (requestedTypes.some(wineType => this.typeMatches(product, wineType))) {
          score += 24;
          reasons.push(`${this.t("wineType")}: ${product.type || product.category}`);
        } else {
          score -= 18;
        }
      }

      signals.foods.forEach(food => {
        if (includesAny(product.pairings, food.terms) || includesAny(product.aiNotes, food.terms)) {
          score += 18;
          reasons.push(food.label[this.language]);
        }
      });

      signals.occasions.forEach(occasion => {
        if (includesAny(product.occasions, [occasion.term]) || includesAny(product.aiNotes, [occasion.term])) {
          score += 12;
          reasons.push(occasion.label[this.language]);
        }
      });

      if (signals.beginner && normalize(product.beginner).includes("yes")) {
        score += 16;
        reasons.push(this.t("beginner"));
      }

      if (signals.lowTannin && /soft|low|やわらか|少|低/.test(normalize(`${product.tannin} ${product.aiNotes}`))) {
        score += 12;
        reasons.push(this.language === "en" ? "gentle tannin" : this.language === "ja" ? "渋みが穏やか" : "涩感较低");
      }

      if (signals.light && /light|fresh|軽|清爽|フレッシュ/.test(normalize(`${product.body} ${product.flavors} ${product.description}`))) {
        score += 10;
        reasons.push(this.language === "en" ? "lighter profile" : this.language === "ja" ? "軽やかな味わい" : "风格轻盈");
      }

      if (signals.fruity && /fruit|berry|果実|フルーツ|fresh/.test(normalize(`${product.flavors} ${product.description} ${product.aiNotes}`))) {
        score += 10;
        reasons.push(this.language === "en" ? "fruit-forward" : this.language === "ja" ? "果実味がある" : "果香明显");
      }

      if (signals.rich && /rich|full|depth|コク|奥行|premium/.test(normalize(`${product.flavors} ${product.description} ${product.aiNotes}`))) {
        score += 10;
        reasons.push(this.language === "en" ? "richer profile" : this.language === "ja" ? "コクがある" : "更有厚度");
      }

      if (signals.sweet && /dessert|sweet|甘/.test(normalize(`${product.type} ${product.sweetness} ${product.category}`))) {
        score += 10;
        reasons.push(this.language === "en" ? "sweet/dessert cue" : this.language === "ja" ? "甘口/デザート向け" : "偏甜/甜点场景");
      }

      if (normalize(product.stock).includes("out")) {
        score -= 60;
      }

      return { ...product, score, reasons: [...new Set(reasons)].slice(0, 6) };
    },

    localExplanation(top) {
      const name = top?.name || "";
      const reasonText = top?.reasons?.length ? top.reasons.join(" / ") : this.t("reasons");

      if (this.language === "en") {
        return `${name} scored highest on ${reasonText}. The alternates are kept visible for comparison, but the top bottle has the strongest fit against the stated constraints.`;
      }

      if (this.language === "ja") {
        return `${name} は「${reasonText}」の条件で最も高いルール点になったため第一候補です。他の候補も比較用に表示していますが、入力条件との一致度はこの商品が最も高いです。`;
      }

      return `${name} 是规则分最高的选择，主要命中：${reasonText}。下面也保留了备选酒，便于比较。`;
    },

    resolveImage(product) {
      return product.image || product.mainImage || "";
    },

    productTags(product) {
      return [product.type, product.grapes, product.occasions]
        .filter(Boolean)
        .join("; ")
        .split(";")
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 5);
    },

    cardReason(product) {
      const base = product.aiNotes || product.description || "";
      return base.length > 170 ? `${base.slice(0, 170)}...` : base;
    },

    toRecommendationCandidate(product) {
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
    },

    rankLocally(candidates, signals) {
      return candidates
        .map(product => this.scoreProduct(product, signals))
        .sort((a, b) => b.score - a.score || Number(a.price) - Number(b.price));
    },

    async recommend() {
      const userText = this.requestText.trim();

      if (!userText || this.loading) {
        return;
      }

      let fallbackRanked = [];
      let fallbackExplanation = "";

      this.addMessage(userText, "user");
      this.requestText = "";
      this.loading = true;

      const thinkingMessageId = this.addMessage("", "assistant", {
        thinking: true,
        i18nKey: "loading"
      });

      try {
        const signals = this.parseSignals(userText);
        const candidates = this.getCandidateProducts(signals);
        const localRanked = this.rankLocally(candidates, signals)
          .filter(product => product.score > -20)
          .slice(0, 3);
        fallbackRanked = localRanked.length
          ? localRanked
          : this.rankLocally(candidates, signals).slice(0, 3);

        if (!candidates.length) {
          this.replaceThinkingMessage(thinkingMessageId, this.t("noResult"));
          this.results = [];
          return;
        }

        fallbackExplanation = this.localExplanation(fallbackRanked[0] || candidates[0]);

        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: this.language,
            userText,
            signals,
            filters: {
              budget: signals.budgetCap,
              wineType: this.type,
              onlyWine: this.onlyWine
            },
            fallbackExplanation,
            fallbackIds: fallbackRanked.map(product => product.id),
            candidates: candidates.map(this.toRecommendationCandidate)
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

        this.results = data.provider === "fallback" || !aiRanked.length
          ? fallbackRanked
          : aiRanked.slice(0, 3);
        this.replaceThinkingMessage(thinkingMessageId, data.explanation || fallbackExplanation);
      } catch {
        this.results = fallbackRanked;
        this.replaceThinkingMessage(thinkingMessageId, fallbackExplanation || this.t("fallback"));
      } finally {
        this.loading = false;
      }
    }
  }
}).mount("#app");
