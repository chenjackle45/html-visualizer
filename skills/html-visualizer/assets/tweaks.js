/* 風格設定面板 — 與 tweaks.css 成對，由 scripts/stamp.py 在 verify 時注入頁尾（作者不用複製）。
 * 按鈕「風格設定」：頁面有範本底部列的「預覽摘要」（#preview-btn）就停在它左邊，各寬度都是（窄螢幕只顯示圖示）；
 * 沒有底部列就固定在左下角（右下角是評論工具的位置）。面板從按鈕上方打開。
 * 底部列一律用範本的，按鈕不偵測、不閃避頁面自己做的固定列。
 * （本檔任何地方都不能出現 script 的結尾標籤字樣，否則內嵌時瀏覽器會在那裡把腳本切斷。）
 *
 * 固定層（每頁都有）：字級 90%–200%、密度、內容寬度，寫在 <html> 的 --fs／--dens／--wrap-max。
 * 內容層（作者選配，預設 0 項）：頁面放一個 type 為 application/json、id 為 vt-tweaks 的 script 區塊，
 *   內容是 [{id,label,options:[[值,顯示],...],hint}]。
 * 選了之後在 <html> 設 data-tw-<id>="值"，作者只寫對應的 CSS，不寫 JS。hint 必填（這項會改到頁面上的什麼）。
 * 調過的值只改畫面、不進複製摘要。讀者按「存成我的預設」才產生「設定檔變更」段落（給 AI 執行的一行
 * profile.py 指令，使用者不用自己跑）：有拍板摘要的頁經 window.vtCollectComments 接進摘要，沒有的頁直接複製。
 * 介面有中英兩種，面板頂端可切換（「設定檔變更」段落也跟著換語言）。
 */
(function () {
  var root = document.documentElement;
  var me = document.currentScript;
  var tool = (me && me.getAttribute("data-profile-tool")) || "profile.py";
  // 介面語言：讀者切換過就記在瀏覽器、之後的頁沿用；沒切過跟頁面的 lang 走。
  // 沙盒 iframe（沒開 allow-same-origin）一碰 localStorage 就丟錯，所以包 try
  var lang = null;
  try {
    lang = localStorage.getItem("vt-tw-lang");
  } catch (e) {}
  if (lang !== "zh" && lang !== "en") lang = /^en/i.test(root.lang) ? "en" : "zh";
  var LANG = {
    zh: {
      name: "風格設定",
      short: "風格設定",
      title: "風格設定（字級、密度、寬度）",
      fixed: "固定層 · 每頁都有",
      content: "內容層 · 這頁專屬",
      swap: "EN",
      reset: "全部還原",
      save: "存成我的預設",
      added: "已加進複製摘要",
      copied: "已複製，貼回對話即可",
      select: "已選取，請按 Cmd+C",
      need: function (n) {
        return "調過" + n.slice(0, -1).join("、") + "或" + n[n.length - 1] + "，才能存成你的預設。";
      },
      undo: "存檔指令已加進這頁的複製摘要，複製後貼回對話即可；再按一次取消。",
      toSummary: "按下後，存檔指令會加進這頁的複製摘要；貼回對話，AI 會寫進你的設定檔，之後的頁都用這組。",
      toCopy: "按下後會複製一段指令；貼回對話，AI 會寫進你的設定檔，之後的頁都用這組。",
      head: "## 設定檔變更\n給 AI：使用者要把這頁的顯示設定存成預設（",
      pair: "：",
      join: "、",
      tail: "）。請執行下面這行寫入 html-visualizer 設定檔，完成後回報前後差異；使用者不用自己跑。\n",
    },
    en: {
      name: "Style settings",
      short: "Style",
      title: "Style settings (text size, density, width)",
      fixed: "Every page",
      content: "This page only",
      swap: "中文",
      reset: "Reset all",
      save: "Save as my default",
      added: "Added to summary",
      copied: "Copied",
      select: "Press Cmd+C",
      need: function (n) {
        n = n.map(function (x) {
          return x.toLowerCase();
        });
        return "Change the " + n.slice(0, -1).join(", ") + " or " + n[n.length - 1] + " to save it as your default.";
      },
      undo: "The save command is in this page's copy summary. Copy the summary and paste it into the chat. Click again to remove it.",
      toSummary: "Adds a save command to this page's copy summary. Paste it into the chat and the AI writes it to your profile; later pages use these settings.",
      toCopy: "Copies a save command. Paste it into the chat and the AI writes it to your profile; later pages use these settings.",
      head: "## Profile changes\nFor the AI: the user wants to save this page's display settings as their default (",
      pair: ": ",
      join: ", ",
      tail: "). Run the line below to write them to the html-visualizer profile, then report the before and after values. The user doesn't need to run it.\n",
    },
  };
  var L = LANG[lang];
  // 固定層的名稱與選項是 {zh, en}；作者寫的內容層（字串或數字）原樣顯示
  function txt(x) {
    return x && typeof x === "object" ? x[lang] : x;
  }
  var cs = getComputedStyle(root);
  function cssNum(name, fallback) {
    var v = parseFloat(cs.getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }
  var baseFs = cssNum("--fs", 1);
  var DENS = [
    ["0.75", { zh: "緊湊", en: "Compact" }, "compact"],
    ["1", { zh: "標準", en: "Standard" }, "standard"],
    ["1.3", { zh: "寬鬆", en: "Relaxed" }, "relaxed"],
  ];
  var baseDens = String(cssNum("--dens", 1));
  if (!DENS.some(function (d) { return d[0] === baseDens; })) baseDens = "1";
  // 內容寬度只在頁面有用 --wrap-max 時提供（範本在 :root 宣告它）；沒宣告的頁按了也不會動，乾脆不顯示
  var rawWrap = cs.getPropertyValue("--wrap-max").trim();
  var baseWrap = parseFloat(rawWrap) || 1760;
  var wrapOpts = [
    ["1760px", { zh: "滿版", en: "Full" }, "1760"],
    ["1080px", { zh: "閱讀寬", en: "Reading" }, "1080"],
  ];
  if (baseWrap !== 1760 && baseWrap !== 1080) wrapOpts.unshift([baseWrap + "px", { zh: "預設", en: "Default" }, String(baseWrap)]);
  var FIXED = [
    { id: "fs", label: { zh: "字級", en: "Text size" }, kind: "range", min: 0.9, max: 2, step: 0.05, def: String(baseFs), css: "--fs", profile: "tokens.type.scale" },
    { id: "dens", label: { zh: "密度", en: "Density" }, css: "--dens", def: baseDens, profile: "tokens.layout.density", options: DENS },
  ];
  if (rawWrap) {
    FIXED.push({ id: "width", label: { zh: "內容寬度", en: "Width" }, css: "--wrap-max", def: baseWrap + "px", profile: "tokens.layout.maxWidth", options: wrapOpts });
  }
  // html.vt-fs：倍率≠1 時才讓 Tailwind 文字 class 的覆寫生效（stamp.py 產生的規則都掛在它底下）
  root.classList.toggle("vt-fs", baseFs !== 1);
  var content = [];
  // 用 querySelector：沒有內容層的頁面本來就沒有這個元素，不該被 verify 的元素參照檢查報成缺漏
  var decl = document.querySelector("script#vt-tweaks");
  if (decl) {
    try {
      content = JSON.parse(decl.textContent);
    } catch (e) {
      console.error("vt-tweaks 宣告不是合法 JSON", e);
    }
  }
  content = content.filter(function (c) {
    var ok =
      c && c.id && c.label && Array.isArray(c.options) && c.options.length >= 2;
    if (!ok) console.error("vt-tweaks 項目缺 id／label／options", c);
    else if (!c.hint)
      console.error(
        "vt-tweaks 項目缺 hint（要寫這項會改到頁面上的什麼）",
        c.id,
      );
    return ok;
  });
  if (content.length > 3) {
    console.error("vt-tweaks 最多 3 項，多的不顯示");
    content = content.slice(0, 3);
  }
  content.forEach(function (c) {
    c.attr = "data-tw-" + c.id;
    c.def = String(c.options[0][0]);
  });
  var ALL = FIXED.concat(content);
  var saved = false; // 按過「存成我的預設」（只在有拍板摘要的頁用得到）
  var state = {};
  ALL.forEach(function (t) {
    state[t.id] = t.def;
  });

  function label(t, v) {
    if (t.kind === "range") return Math.round(parseFloat(v) * 100) + "%";
    for (var i = 0; i < t.options.length; i++)
      if (String(t.options[i][0]) === v) return txt(t.options[i][1]);
    return v;
  }
  function apply(t) {
    if (t.css) root.style.setProperty(t.css, state[t.id]);
    if (t.attr) root.setAttribute(t.attr, state[t.id]);
    if (t.id === "fs") root.classList.toggle("vt-fs", parseFloat(state.fs) !== 1);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // 切換語言時要重寫的文字：登記時先畫一次，切換時全部重跑
  var paint = [];
  function painted(fn) {
    paint.push(fn);
    fn();
  }
  // 頁面自己的介面文字（範本底部列的按鈕等）也跟著換：元素寫 data-en="英文"，原本的中文第一次換掉前先存進 data-zh。
  // <html data-vt-lang> 給頁面腳本讀，組執行期文字（例如「已複製」）時用
  painted(function () {
    root.setAttribute("data-vt-lang", lang);
    document.querySelectorAll("[data-en]").forEach(function (e) {
      // 只換第一段非空白的直接文字、前後空白照留：整個蓋 textContent 會把裡面的子元素（例如計數 span）刪掉
      var t = [].find.call(e.childNodes, function (n) {
        return n.nodeType === 3 && n.nodeValue.trim();
      });
      if (!e.hasAttribute("data-zh")) e.setAttribute("data-zh", t.nodeValue.trim());
      t.nodeValue = t.nodeValue.replace(t.nodeValue.trim(), e.getAttribute(lang === "en" ? "data-en" : "data-zh"));
    });
  });

  var launch = el("button", "vt-tw-launch vt-tw-root");
  launch.type = "button";
  launch.setAttribute("aria-expanded", "false");
  launch.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/></svg>';
  var lbl = launch.appendChild(el("span", "vt-tw-lbl"));
  var pop = el("aside", "vt-tw-pop vt-tw-root");
  pop.hidden = true;
  painted(function () {
    launch.setAttribute("aria-label", L.name);
    launch.title = L.title;
    lbl.textContent = L.short;
    pop.setAttribute("aria-label", L.name);
  });

  function control(t) {
    var wrap = el("div", "vt-tw-item");
    var lab = el("div", "vt-tw-label");
    var name = lab.appendChild(el("span"));
    var val = el("span", "vt-tw-val");
    lab.appendChild(val);
    wrap.appendChild(lab);
    function sync() {
      val.textContent = label(t, state[t.id]);
    }
    if (t.kind === "range") {
      var r = el("input");
      r.type = "range";
      r.min = t.min;
      r.max = t.max;
      r.step = t.step;
      r.value = state[t.id];
      r.addEventListener("input", function () {
        state[t.id] = r.value;
        apply(t);
        sync();
        refreshSave();
      });
      wrap.appendChild(r);
      t.reset = function () {
        r.value = t.def;
      };
    } else {
      var seg = el("div", "vt-tw-seg");
      t.options.forEach(function (o) {
        var b = el("button");
        b.type = "button";
        painted(function () {
          b.textContent = txt(o[1]);
        });
        b.setAttribute("data-v", String(o[0]));
        b.addEventListener("click", function () {
          state[t.id] = String(o[0]);
          apply(t);
          mark();
          sync();
          refreshSave();
        });
        seg.appendChild(b);
      });
      function mark() {
        seg.querySelectorAll("button").forEach(function (b) {
          b.classList.toggle(
            "vt-tw-on",
            b.getAttribute("data-v") === state[t.id],
          );
        });
      }
      mark();
      t.reset = mark;
      wrap.appendChild(seg);
    }
    if (t.hint) wrap.appendChild(el("div", "vt-tw-hint", t.hint));
    t.sync = sync;
    painted(function () {
      name.textContent = txt(t.label);
      if (r) r.setAttribute("aria-label", txt(t.label));
      sync();
    });
    return wrap;
  }
  var first = pop.appendChild(el("div", "vt-tw-sec vt-tw-first"));
  var firstText = first.appendChild(el("span"));
  var langBtn = first.appendChild(el("button", "vt-tw-lang"));
  langBtn.type = "button";
  painted(function () {
    firstText.textContent = L.fixed;
    langBtn.textContent = L.swap;
  });
  FIXED.forEach(function (t) {
    pop.appendChild(control(t));
  });
  if (content.length) {
    var sec = pop.appendChild(el("div", "vt-tw-sec"));
    painted(function () {
      sec.textContent = L.content;
    });
    content.forEach(function (t) {
      pop.appendChild(control(t));
    });
  }
  var actions = el("div", "vt-tw-actions");
  var resetBtn = el("button");
  resetBtn.type = "button";
  painted(function () {
    resetBtn.textContent = L.reset;
  });
  var saveBtn = el("button", "vt-tw-pri");
  saveBtn.type = "button";
  actions.appendChild(resetBtn);
  actions.appendChild(saveBtn);
  pop.appendChild(actions);
  var saveHint = el("div", "vt-tw-hint");
  pop.appendChild(saveHint);
  // 複製不到時的出路：指令放進這裡並全選，使用者按 Cmd+C（純展示頁沒有頁面自帶的複製函式）
  var manual = el("textarea", "vt-tw-manual");
  manual.readOnly = true;
  manual.rows = 4;
  manual.hidden = true;
  pop.appendChild(manual);
  var flashTimer = null;

  function changedFixed() {
    return FIXED.filter(function (t) {
      return state[t.id] !== t.def;
    });
  }
  function profileValue(t, v) {
    if (t.options) {
      for (var i = 0; i < t.options.length; i++)
        if (String(t.options[i][0]) === v) return t.options[i][2];
    }
    return String(Math.round(parseFloat(v) * 100) / 100);
  }
  function hasSummary() {
    return typeof window.vtBuildDecisionExport === "function";
  }
  function saveText(ch) {
    return (
      L.head +
      ch
        .map(function (t) {
          return txt(t.label) + L.pair + label(t, state[t.id]);
        })
        .join(L.join) +
      L.tail +
      // 雙引號：路徑以 $HOME 開頭，單引號裡不會展開
      'python3 "' +
      tool +
      '" set ' +
      ch
        .map(function (t) {
          return t.profile + "=" + profileValue(t, state[t.id]);
        })
        .join(" ")
    );
  }
  function refreshSave() {
    var n = changedFixed().length;
    // 只看目前的值：拖滑桿途中經過預設值那一格不該把已存取消
    var on = saved && n > 0;
    // 失敗時留下的文字框：設定一變，裡面的指令就過時了
    if (!manual.hidden && manual.value !== saveText(changedFixed())) manual.hidden = true;
    saveBtn.disabled = !n;
    if (hasSummary()) saveBtn.setAttribute("aria-pressed", String(on));
    saveBtn.textContent = on ? L.added : L.save;
    saveHint.textContent = !n
      ? L.need(FIXED.map(function (t) {
          return txt(t.label);
        }))
      : on
        ? L.undo
        : hasSummary()
        ? L.toSummary
        : L.toCopy;
  }
  window.vtCollectTweaks = function () {
    var ch = changedFixed();
    return saved && ch.length ? "\n\n" + saveText(ch) : "";
  };
  resetBtn.addEventListener("click", function () {
    saved = false;
    ALL.forEach(function (t) {
      state[t.id] = t.def;
      apply(t);
      t.reset();
      t.sync();
    });
    refreshSave();
  });
  saveBtn.addEventListener("click", async function () {
    if (hasSummary()) {
      saved = !saved;
      refreshSave();
      return;
    }
    // 沒有拍板摘要的頁：按鈕本身就是出口，直接複製
    var text = saveText(changedFixed());
    var ok = false;
    manual.hidden = true;
    if (window.vtCopyText) ok = await window.vtCopyText(text);
    // 沒有頁面的複製函式就直接走下面：在點擊當下同步複製，不先 await 別的 API 把使用者手勢耗掉
    if (!ok) {
      manual.value = text;
      manual.hidden = false;
      manual.select();
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      if (ok) manual.hidden = true;
    }
    saveBtn.textContent = ok ? L.copied : L.select;
    clearTimeout(flashTimer); // 連點時舊計時器不能提早蓋掉新回饋
    flashTimer = setTimeout(refreshSave, ok ? 2000 : 6000);
  });
  // 面板開在按鈕上方：按鈕在右半就右緣對齊、左半就左緣對齊；
  // 按鈕上方不到 200px（視窗矮、底部列展開）就改貼畫面頂端，不讓面板頂端跑出畫面
  function place() {
    var r = launch.getBoundingClientRect();
    var w = Math.min(330, window.innerWidth * 0.92);
    var x = r.left + r.width / 2 > window.innerWidth / 2 ? r.right - w : r.left;
    // 預覽鈕在列中間時（非範本的列）對齊邊緣會出界，夾回畫面內
    pop.style.left = Math.max(8, Math.min(x, window.innerWidth - w - 8)) + "px";
    var low = r.top - 24 < 200;
    pop.style.top = low ? "12px" : "auto";
    pop.style.bottom = low ? "auto" : window.innerHeight - r.top + 10 + "px";
    pop.style.maxHeight = (low ? window.innerHeight - 24 : r.top - 24) + "px";
  }
  langBtn.addEventListener("click", function () {
    lang = lang === "zh" ? "en" : "zh";
    L = LANG[lang];
    try {
      localStorage.setItem("vt-tw-lang", lang);
    } catch (e) {}
    paint.forEach(function (f) {
      f();
    });
    refreshSave();
  });
  function setOpen(open) {
    if (open) place();
    pop.hidden = !open;
    launch.setAttribute("aria-expanded", String(open));
  }
  launch.addEventListener("click", function () {
    setOpen(pop.hidden);
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && !pop.hidden) setOpen(false);
  });
  document.addEventListener("click", function (ev) {
    // 用事件當下的路徑判斷（按鈕若在點擊後被重畫移除，closest 會找不到而誤關）
    var inside = ev.composedPath().some(function (el) {
      return el.classList && el.classList.contains("vt-tw-root");
    });
    if (!pop.hidden && !inside) setOpen(false);
  });
  // 把「設定檔變更」段接進評論收集函式：所有複製摘要都已經照規定拼接它，不必逐一改寫
  function hook() {
    var orig = window.vtCollectComments;
    window.vtCollectComments = function () {
      return window.vtCollectTweaks() + (orig ? orig() : "");
    };
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", hook);
  else hook();
  // querySelector：頁面沒有預覽鈕是正常的，不該讓 verify 的元素參照檢查報缺漏（同上方 vt-tweaks 的寫法）
  var dock = document.querySelector("#preview-btn");
  document.body.appendChild(pop);
  if (dock) {
    launch.classList.add("vt-tw-docked");
    dock.parentNode.insertBefore(launch, dock);
  } else document.body.insertBefore(launch, pop); // Tab 順序：按鈕→面板
  // 縮放、捲動時按鈕會跟著列移動（捲到頁尾，列會被頁尾往上推），開著的面板要跟著對齊
  function follow() {
    if (!pop.hidden) place();
  }
  window.addEventListener("resize", follow);
  window.addEventListener("scroll", follow, { passive: true });
  refreshSave();
})();
