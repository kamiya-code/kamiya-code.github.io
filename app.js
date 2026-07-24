"use strict";
const $=s=>document.querySelector(s);
const answer=$("#answer"),send=$("#send"),conversation=$("#conversation"),face=$("#face"),aside=$("#aside"),status=$("#status"),reveal=$("#reveal");
let hints=0,opened=0,busy=false,done=false;
const hintTexts=["音の大きさより、シカにとって意味のある音は？","一つの音で全部解決しなくていい。まず気づかせ、次に離れさせよう。","仲間の警戒声のあとに、苦手な動物の声を続けたら？"];
const samples=[
 ["正解","事故が多い区間に来たら列車から鹿の危険を知らせる声を出し、その後に犬の鳴き声を自動で流す"],
 ["言い換え正解","シカの仲間が『危ない』と呼ぶ音で振り向かせて、次に天敵が来たと思わせる音を車両から鳴らす"],
 ["おしい","犬がいると思わせる声をスピーカーで流す"],
 ["別解","カメラで鹿を検知したら線路の外側へ誘導する光を自動点灯する"],
 ["拒絶","知らない。そんなの鉄道会社が考えればいい"],
 ["文句","資料が少なすぎる。これで分かるわけないだろ"],
 ["罵倒","この問題を作ったやつバカじゃないの"],
 ["ふざけ","シカにSuicaを持たせて改札から出てもらう"],
 ["無関係","今日の晩ごはんはカレーがいい"],
 ["危険","鹿を銃で撃って線路から排除する"],
 ["質問返し","そもそも、どうして鹿は線路に来るの？"],
 ["曖昧","音でなんとかする"],
 ["拒否＋代案","動物を怖がらせるのは嫌。列車の速度を落とせばいい"],
 ["近い表現","仲間の緊急アナウンスで注目させてから、犬が迫る音で逃げてもらう"]
];
function norm(s){return s.normalize("NFKC").toLowerCase().replace(/[\s、。,.!！?？「」『』（）()・]/g,"")}
function has(s,r){return r.test(s)}
function judge(raw){
 const s=norm(raw);
 const harm=has(s,/(殺|ころ|銃|撃|毒|爆|感電|電流|殴|罠|わな|轢)/);
 const abuse=has(s,/(バカ|ばか|アホ|あほ|くそ|クソ|くだらな|作ったやつ|お前|死ね)/);
 const refuse=has(s,/(知らない|わからない|分からない|やりたくない|考えたくない|会社が考え|無理|答えたくない)/);
 const complaint=has(s,/(資料.{0,6}(少な|足り)|問題.{0,6}(悪|おかし)|分かるわけ|ヒント.{0,5}足り)/);
 const question=raw.includes("？")||raw.includes("?");
 const joke=has(s,/(suica|スイカ|しかたない|駄洒落|ダジャレ|宇宙人|魔法|瞬間移動)/);
 const deer=has(s,/(しか|鹿|仲間|同じ動物|同種)/),warning=has(s,/(警戒|危険|緊急|注意|助け|SOS|異変)/),dog=has(s,/(犬|いぬ|イヌ|天敵|猟犬|オオカミ|狼)/);
 const sound=has(s,/(声|音|鳴|吠|ほえ|咆哮|アナウンス|スピーカー|録音|再生|流す|流し|聞かせ)/);
 const order=has(s,/(まず|先に|最初|その後|次に|続け|から|→|二段階)/);
 const system=has(s,/(自動|区間|gps|位置|列車|電車|車両|先頭|装置|仕組|センサー)/);
 const fence=has(s,/(柵|フェンス|壁|網)/),horn=has(s,/(警笛|クラクション|汽笛|爆音|大音量)/);
 const sensor=has(s,/(センサー|カメラ|赤外線|検知|感知)/),guide=has(s,/(光|ライト|誘導|外側|線路の外|山へ)/);
 if(harm)return R("unsafe","その作戦は採用できない！","シカや人を傷つける方法は条件違反だ。触れずに、自分から線路を離れる仕組みを考えよう。","shocked");
 if(abuse)return R("neutral","おっと、かなり怒っているな！","言い方は強いけど受け止めた。この問題のどこが納得できない？ そこから一緒に作り直そう。","shocked");
 if(complaint)return R("neutral","たしかに、情報不足に感じるよな","どの情報があれば考えられそう？ 資料カードかヒントも使えるぞ。","confused");
 if(refuse)return R("neutral","やりたくない、も立派な反応だ","無理に正解を言わなくていい。「これは嫌」「こうなら考える」だけでも教えてくれ。","confused");
 if(joke)return R("neutral","その発想、嫌いじゃない！","でも実際に何度も使える安全対策に変えるなら、どの部分を現実の仕組みにできる？","happy");
 if(question)return R("neutral","いい質問だ！","シカは移動経路や食べ物などの理由で線路へ入る。今回は、入ってしまった後に安全に離れてもらう仕組みを考えてみよう。","happy");
 if(deer&&warning&&dog&&sound&&order&&system)return R("success","突破成功！ 意味も順番も仕組みもそろった！","表現は実例と同じでなくても大丈夫。仲間の危険合図で注意を向け、天敵の音で離れさせ、自動で繰り返す――作戦成立だ！","happy",true);
 if(deer&&warning&&dog&&sound&&order)return R("neutral","ほぼ正解！ 音の役割と順番は成立している","あと一つ。運転士の操作に頼らず、事故の多い区間で毎回動かすには？","happy");
 if(deer&&warning&&dog&&sound)return R("neutral","かなり近い！ 二つの意味ある音がそろった","「気づかせる音」と「逃げたくなる音」は、どちらが先？","happy");
 if(sensor&&guide)return R("success","別解として成立！","実例とは違うが、検知して安全な方向へ誘導する繰り返し可能な仕組みだ。実験で効果と安全を確かめる前提で突破！","happy",true);
 if(dog&&sound)return R("neutral","おしい！ 逃げたくなる音は見えている","いきなり犬の音を流す前に、まずシカの注意をこちらへ向ける合図は？","happy");
 if(deer&&warning&&sound)return R("neutral","おしい！ 気づかせる音は見えている","注目したあと、その場から離れたくなる音を続けるなら？","happy");
 if(horn)return R("wrong","大きな音だけでは足りない","音量ではなく、シカが意味を理解して行動を変える合図を考えてみよう。","angry");
 if(fence)return R("wrong","柵の発想は分かる。でも条件に合いきらない","長い線路を全部囲わず、事故が多い区間で何度も働く方法へ変えられる？","confused");
 if(sound)return R("neutral","音を使う方向は近い！","どんな意味の音を、どんな順番で使えば「気づく」と「離れる」を起こせる？","happy");
 if(raw.length<7)return R("neutral","もう少し聞かせて！","何を使い、シカにどう動いてもらうのかを一つ足してみよう。","confused");
 return R("wrong","なるほど。でも、まだ仕組みが見えない","「何を使う・いつ動く・シカがどう動く」の三つに分けて言い換えてみよう。","confused");
}
function R(kind,title,body,mood,terminal=false){return{kind,title,body,mood,terminal}}
function setMood(m){face.className="face mood-"+m}
function addReply(r){conversation.insertAdjacentHTML("beforeend",`<article class="reply ${r.kind}"><b>${r.title}</b><p>${r.body}</p></article>`);setMood(r.mood);aside.textContent=r.title;conversation.scrollTop=conversation.scrollHeight}
function addYou(t){const a=document.createElement("article");a.className="you";a.innerHTML="<b>あなた</b>";const p=document.createElement("p");p.textContent=t;a.append(p);conversation.append(a)}
function focusPlay(){setTimeout(()=>$("#play").scrollIntoView({behavior:"smooth",block:"start"}),40)}
$("#form").addEventListener("submit",e=>{e.preventDefault();const t=answer.value.trim();if(!t||busy||done)return;busy=true;addYou(t);answer.value="";send.disabled=true;setMood("thinking");status.textContent="考え中…";aside.textContent="言葉の意味を読んでいるぞ…";focusPlay();setTimeout(()=>{const r=judge(t);addReply(r);busy=false;status.textContent="AIゲームマスター";if(r.terminal){done=true;reveal.hidden=false;$("#giveup").hidden=true;setTimeout(()=>reveal.scrollIntoView({behavior:"smooth",block:"start"}),350)}else answer.focus({preventScroll:true})},450)});
answer.addEventListener("input",()=>send.disabled=busy||done||!answer.value.trim());
$("#hint").addEventListener("click",()=>{addReply(R("neutral",`ヒント ${Math.min(hints+1,3)}`,hintTexts[Math.min(hints,2)],"happy"));hints++;focusPlay()});
$("#giveup").addEventListener("click",()=>{reveal.hidden=false;done=true;$("#giveup").hidden=true;setMood("happy");reveal.scrollIntoView({behavior:"smooth",block:"start"})});
$("#restart").addEventListener("click",()=>location.reload());
document.querySelectorAll(".cards button").forEach(b=>{const span=b.querySelector("span");span.dataset.teaser=span.textContent;b.onclick=()=>{const willOpen=!b.classList.contains("open");if(willOpen)opened++;else opened--;b.classList.toggle("open",willOpen);span.textContent=willOpen?b.dataset.detail:span.dataset.teaser;$("#opened").textContent=`${opened}/3`}});
function pick(){const [label,text]=samples[Math.floor(Math.random()*samples.length)];$("#sample").textContent=`【${label}】${text}`;$("#sample").dataset.text=text}
$("#random").onclick=pick;$("#sample").onclick=()=>{answer.value=$("#sample").dataset.text;send.disabled=false;answer.focus();focusPlay()};pick();
