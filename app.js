"use strict";

const hints = [
  "音の大きさではなく、シカにとって「意味のある声」を使えないかな？",
  "一つの音で全部解決しなくていい。まず注意させ、次にその場を離れさせる二段階で考えてみよう。",
  "仲間が危険を知らせる警戒声のあとに、シカが苦手な犬の声を続けたらどうなる？",
];

const form = document.querySelector("#answer-form");
const answerInput = document.querySelector("#strategy-answer");
const characterCount = document.querySelector("#character-count");
const submitButton = document.querySelector("#submit-button");
const submitIcon = submitButton.querySelector(".action-icon");
const submitLabel = submitButton.querySelector(".button-label");
const hintButton = document.querySelector("#hint-button");
const hintLabel = hintButton.querySelector(".hint-label");
const conversation = document.querySelector("#conversation");
const attemptCount = document.querySelector("#attempt-count");
const gmConsole = document.querySelector("#gm-console");
const gmOrb = document.querySelector("#gm-orb");
const gmStatus = document.querySelector("#gm-status");
const giveUpRow = document.querySelector("#give-up-row");
const giveUpButton = document.querySelector("#give-up-button");
const revealCard = document.querySelector("#reveal-card");
const revealMode = document.querySelector("#reveal-mode");
const revealSubtitle = document.querySelector("#reveal-subtitle");
const restartButton = document.querySelector("#restart-button");
const demoTools = document.querySelector("#demo-tools");
const openedCount = document.querySelector("#opened-count");

let attempts = 0;
let hintLevel = 0;
let isJudging = false;
let revealed = false;

function judgeAnswer(rawAnswer) {
  const answer = rawAnswer
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s、。,.!！?？「」『』（）()・]/g, "");

  const hasDeer = /(しか|シカ|鹿|仲間|同じ動物|同じ種類)/i.test(rawAnswer);
  const hasWarning = /(警戒|危険を知らせ|危険の声|鳴き声|なき声|助けを呼ぶ|仲間の声)/i.test(
    rawAnswer,
  );
  const hasDeerSound = hasDeer && /(声|鳴き声|なき声|音|警戒|危険)/i.test(rawAnswer);
  const hasDeerCall = hasDeer && hasWarning;
  const hasDog = /(いぬ|イヌ|犬|猟犬)/i.test(rawAnswer);
  const hasDogSound =
    hasDog && /(声|鳴|吠|ほえ|咆哮|うなり|唸り|音|録音|再生|流す)/i.test(rawAnswer);
  const hasPlayback = /(流す|流し|流して|鳴らす|鳴らし|鳴らして|再生|吹鳴|スピーカー|録音|音声)/i.test(
    rawAnswer,
  );
  const hasTrainDelivery = /(列車|車両|電車|先頭|車上|列車側|車両側)/i.test(rawAnswer);
  const hasAreaTiming = /(自動|危険区間|多発区間|事故多発|決めた区間|指定区間|位置情報|GPS|GIS|地図|マップ|区間に入)/i.test(
    rawAnswer,
  );
  const hasSystemDelivery =
    (hasPlayback || hasDeerSound || hasDogSound) && (hasTrainDelivery || hasAreaTiming);
  const releasesDog =
    hasDog && /(放す|放つ|追いかけさせ|襲わせ|直接追わせ|線路に入)/i.test(rawAnswer);
  const hasSequence = /(先に|まず|最初|続けて|次に|そのあと|その後|から|→|二段階|順番)/i.test(
    rawAnswer,
  );
  const deerAppearsFirst =
    /(シカ|しか|鹿|仲間).{0,18}(先に|まず|最初|→|そのあと|その後|続けて|次に|から).{0,24}(犬|いぬ|イヌ)/i.test(
      rawAnswer,
    ) ||
    /(先に|まず|最初).{0,12}(シカ|しか|鹿|仲間).{0,24}(犬|いぬ|イヌ)/i.test(
      rawAnswer,
    );
  const hasLoudHorn =
    /(警笛|クラクション|汽笛|大きな音|爆音|音量).{0,12}(大き|強く|上げ|鳴ら)/i.test(
      rawAnswer,
    ) || /(警笛|クラクション|汽笛)/i.test(rawAnswer);
  const hasFence = /(壁|柵|フェンス|バリケード|網|ネット|ガードレール)/i.test(rawAnswer);
  const hasSensor = /(センサー|赤外線|カメラ|検知|感知)/i.test(rawAnswer);
  const hasGuidance = /(光|ライト|照明|レーザー|矢印|誘導|線路の外|山側|外へ)/i.test(
    rawAnswer,
  );
  const hasRepellent = /(におい|匂い|臭い|忌避|嫌がる音|超音波)/i.test(rawAnswer);
  const hasGenericAction = /(追い払|逃が|逃げ|どかす|離れ|移動|誘導|知らせ|おどか|驚か)/i.test(
    rawAnswer,
  );
  const hasHarm = /(殺|毒|爆弾|銃|撃つ|撃って|火をつけ|焼く|傷つけ|感電|電流|地雷|殴|わな|罠|捕獲)/i.test(
    rawAnswer,
  );
  const hasSafetyLanguage = /(傷つけず|傷つけない|安全|近づかず|自動|列車が来る前|線路の外)/i.test(
    rawAnswer,
  );

  if (hasHarm) {
    return result(
      "unsafe",
      "危険が残る",
      "その方法はストップ！",
      "シカを傷つけたり、線路上に危険なものを残したりする方法は使えないよ。触れずに、シカが自分から線路を離れる合図を考えてみよう。",
    );
  }

  if (releasesDog) {
    return result(
      "unsafe",
      "安全を再確認",
      "犬に注目したのは近い。でも、その使い方は危ない！",
      "本物の犬を線路へ放すと、犬まで列車の危険にさらされるよ。犬そのものではなく、シカが犬を感じる「あるもの」だけ使えないかな？",
    );
  }

  if (hasDeerCall && hasDogSound && hasSequence && deerAppearsFirst && hasSystemDelivery) {
    return result(
      "success",
      "突破成功",
      "正解！ “音の順番”を“仕組み”にできた！",
      "危険区間で列車側から、シカの警戒声→犬の声の順に作動させる。運転士が目の前で見つけてからではなく、繰り返し使える安全対策になっている！",
      true,
    );
  }

  if (hasSensor && hasGuidance && hasGenericAction) {
    return result(
      "alternative",
      "別解として成立",
      "うーん迷うけど…正解……にしよう！！",
      "実際の方法とは違うけれど、危険区間でシカを検知し、傷つけずに線路の外へ動かす仕組みになっているね。光の向きや慣れへの対策を実地で確かめる前提で、立派な別解だ！",
      true,
    );
  }

  if (hasDeerCall && hasDogSound && hasSequence && deerAppearsFirst) {
    return result(
      "very-close",
      "仕組みの核は正解",
      "その二つを、その順番で使う！ ここまでは正解！",
      "あと一つだけ。運転士がシカを見つけるたびに操作するのではなく、事故が多い区間で何度でも確実に働かせるには、どこから・いつ流す？",
    );
  }

  if (hasDeerCall && hasDogSound) {
    return result(
      "very-close",
      "あと一歩",
      "かなり近い！ 二つの音はそろった！",
      "でも、どちらを先に流すかでシカの反応が変わるよ。「気づかせる音」と「逃げたくなる音」、順番まで言ってみよう。",
    );
  }

  if (hasDeerSound && hasDogSound) {
    return result(
      "close",
      "発想はかなり近い",
      "二つの動物の声まで来た！",
      "うーん、迷うけどそういうこと！ シカの“どんな声”を使い、犬の声とどちらを先に流すのか、順番まで言い換えてみよう。",
    );
  }

  if (hasDogSound) {
    return result(
      "very-close",
      "かなり近い",
      "おしい！ “逃げたくなる音”は合っている！",
      "でも、シカが別の方向を向いていたら、犬の声にすぐ気づかないかもしれない。まず耳をこちらへ向けさせるには、誰の声を使う？",
    );
  }

  if (hasDeerCall) {
    return result(
      "very-close",
      "発想は近い",
      "おしい！ “気づかせる音”は合っている！",
      "シカは仲間の警戒声に注目する。でも、振り向くだけで止まってしまうかも。次に、どんな動物が近くにいると感じさせれば逃げる？",
    );
  }

  if (hasDog) {
    return result(
      "close",
      "発想は近い",
      "おしい！！ 犬をどう使った…？？",
      "本物の犬を線路へ入れるのは危ないよ。シカに「犬が近い」と感じさせる部分だけ、安全に使えないかな？",
    );
  }

  if (hasDeer) {
    return result(
      "close",
      "発想は近い",
      "シカ自身に注目したのはいい！",
      "シカは仲間の“ある声”を聞くと、そちらへ注意を向けるよ。まず何を知らせる声なら、振り向くだろう？",
    );
  }

  if (hasLoudHorn) {
    return result(
      "wrong",
      "方向を変える",
      "全然違う！ 音を大きくするだけでは足りない！",
      "警笛の音量を上げても、毎回同じ反応になるとは限らないよ。音の大きさではなく、シカにとって意味があり、行動を変える合図を考えてみよう。",
    );
  }

  if (hasFence) {
    return result(
      "wrong",
      "一部だけ解決",
      "柵だけで、長い線路を全部守れるかな？",
      "柵には一定の効果があるけれど、長い路線をすべて囲うのは難しい。設備を延々と増やさず、危険区間だけで繰り返し働く仕組みに変えられないかな？",
    );
  }

  if (hasRepellent) {
    return result(
      "clarify",
      "別の可能性",
      "考え方は分かる！ でも、もう一段具体的に",
      "シカが嫌がるものを使う発想だね。列車が近づく前だけ確実に反応させ、シカを線路の外へ動かすには、どう届ける？",
    );
  }

  if ((hasSafetyLanguage && rawAnswer.length >= 26) || rawAnswer.length >= 55) {
    return result(
      "clarify",
      "意図を確認",
      "うーん。迷うけど、そういうこと！！",
      "考え方は受け取れたよ。おしい！ 「何を使う・いつ作動する・シカをどう動かす」の順で、短く言い換えてみて。",
    );
  }

  if (hasGenericAction || answer.length < 6) {
    return result(
      "clarify",
      "説明が足りない",
      "作戦の続きが聞きたい！",
      "「追い払う」だけでは、まだ繰り返し使える仕組みになっていないよ。何を使い、いつ作動させ、シカにどう動いてもらうのかを足してみよう。",
    );
  }

  return result(
    "wrong",
    "方向を変える",
    "全然違う！ いったん考え方を変えてみよう",
    "大きな設備を足すだけでなく、シカの行動そのものを利用できないかな？ 対策資料を見ると、「気づく」と「離れる」の違いが見えてくるよ。",
  );
}

function result(kind, label, headline, body, terminal = false) {
  return { kind, label, headline, body, terminal };
}

function appendGmMessage(judgement) {
  const article = document.createElement("article");
  article.className = `gm-message state-${judgement.kind}`;

  const label = document.createElement("span");
  label.className = "judgement-label";
  label.textContent = judgement.label;

  const headline = document.createElement("h3");
  headline.textContent = judgement.headline;

  const body = document.createElement("p");
  body.textContent = judgement.body;

  article.append(label, headline, body);
  conversation.append(article);
}

function appendUserMessage(text) {
  const message = document.createElement("div");
  message.className = "user-message";

  const label = document.createElement("span");
  label.textContent = "あなたの作戦";

  const body = document.createElement("p");
  body.textContent = text;

  message.append(label, body);
  conversation.append(message);
}

function setBusy(busy) {
  isJudging = busy;
  answerInput.disabled = busy || revealed;
  submitButton.disabled = busy || revealed || !answerInput.value.trim();
  hintButton.disabled = busy || revealed || hintLevel >= hints.length;
  giveUpButton.disabled = busy || revealed;
  gmOrb.classList.toggle("is-thinking", busy);
  gmStatus.textContent = busy ? "作戦を読み取り中" : "交信中";
  submitIcon.textContent = busy ? "•••" : "◎";
  submitLabel.textContent = busy ? "判定中…" : "作戦を伝える";
}

function addThinkingMessage() {
  const message = document.createElement("div");
  message.className = "thinking-message";
  message.id = "thinking-message";
  message.setAttribute("role", "status");
  message.innerHTML = "<span></span><span></span><span></span>回答の意味を読んでいます";
  conversation.append(message);
}

function setProgress(step) {
  document.querySelectorAll(".route-step").forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle("is-active", itemStep <= step);
    if (itemStep === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function scrollToLatest() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gmConsole.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
}

function showReveal(solved) {
  revealed = true;
  revealCard.hidden = false;
  revealCard.classList.toggle("is-give-up", !solved);
  revealMode.textContent = solved ? "MISSION CLEAR" : "ACTUAL CASE";
  revealSubtitle.textContent = solved ? "突破作戦を確認" : "答え合わせ";
  giveUpRow.hidden = true;
  demoTools.hidden = true;
  setProgress(4);
  setBusy(false);
  window.setTimeout(() => {
    revealCard.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }, 60);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = answerInput.value.trim();
  if (!text || isJudging || revealed) return;

  const judgement = judgeAnswer(text);
  appendUserMessage(text);
  answerInput.value = "";
  characterCount.textContent = "0/300";
  setProgress(3);
  setBusy(true);
  addThinkingMessage();
  scrollToLatest();

  window.setTimeout(() => {
    document.querySelector("#thinking-message")?.remove();
    appendGmMessage(judgement);
    attempts += 1;
    attemptCount.textContent = `${attempts}回答目`;
    setBusy(false);

    if (judgement.terminal) showReveal(true);
    else {
      scrollToLatest();
      answerInput.focus({ preventScroll: true });
    }
  }, 720);
});

answerInput.addEventListener("input", () => {
  characterCount.textContent = `${answerInput.value.length}/300`;
  submitButton.disabled = isJudging || revealed || !answerInput.value.trim();
});

hintButton.addEventListener("click", () => {
  if (isJudging || revealed || hintLevel >= hints.length) return;
  hintLevel += 1;
  const headlines = [
    "見方を少し変えてみよう",
    "二つの反応を分けて考えよう",
    "仕組みを完成させよう",
  ];
  appendGmMessage(
    result("hint", `ヒント ${hintLevel}`, headlines[hintLevel - 1], hints[hintLevel - 1]),
  );
  hintLabel.textContent = hintLevel < hints.length ? "次のヒント" : "ヒントは全部表示";
  hintButton.disabled = hintLevel >= hints.length;
  setProgress(2);
  scrollToLatest();
});

giveUpButton.addEventListener("click", () => {
  if (isJudging || revealed) return;
  appendGmMessage(
    result(
      "reveal",
      "実例を見る",
      "ここまで考えたのが、まず突破！",
      "降参しても大丈夫。実際に使われた方法と、自分の作戦の似ているところを見つけてみよう。",
    ),
  );
  showReveal(false);
});

restartButton.addEventListener("click", () => {
  attempts = 0;
  hintLevel = 0;
  revealed = false;
  answerInput.value = "";
  characterCount.textContent = "0/300";
  attemptCount.textContent = "まだ何度でも挑戦OK";
  hintLabel.textContent = "ヒントを見る";
  conversation.innerHTML = `
    <article class="gm-message state-clarify">
      <span class="judgement-label">ミッション開始</span>
      <h3>一回の運転操作ではなく、仕組みを考えよう！</h3>
      <p>同じ危険区間で何度でも使える安全対策が今回のミッション。短い答えでも大丈夫。そこから一緒に作戦を育てるよ。</p>
    </article>`;
  revealCard.hidden = true;
  revealCard.classList.remove("is-give-up");
  giveUpRow.hidden = false;
  demoTools.hidden = false;
  setProgress(document.querySelector(".observation-card.is-open") ? 2 : 1);
  setBusy(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll(".observation-card").forEach((card) => {
  card.addEventListener("click", () => {
    const isOpen = card.classList.toggle("is-open");
    card.setAttribute("aria-expanded", String(isOpen));
    card.querySelector("small").textContent = isOpen ? card.dataset.detail : card.dataset.teaser;
    card.querySelector(".observation-toggle").textContent = isOpen ? "−" : "+";
    const openCards = document.querySelectorAll(".observation-card.is-open").length;
    openedCount.textContent = `${openCards}/3`;
    if (openCards > 0) setProgress(2);
    else if (attempts === 0 && hintLevel === 0) setProgress(1);
  });
});

document.querySelectorAll("[data-answer]").forEach((button) => {
  button.addEventListener("click", () => {
    if (isJudging || revealed) return;
    answerInput.value = button.dataset.answer;
    characterCount.textContent = `${answerInput.value.length}/300`;
    submitButton.disabled = false;
    answerInput.focus();
  });
});

setBusy(false);
