/* 結構圖探索層 — 與 diagram-explore.css 成對，整段內嵌進頁面 body 結尾前的 script 標籤裡。
 * （本檔任何地方都不能出現 script 的結尾標籤字樣，否則內嵌時瀏覽器會在那裡把腳本切斷。）
 *
 * 作者只要：① 圖包在 div.xp[data-explore] 裡；② svg 加 class xplore；
 * ③ 每個節點 g.node[data-id][data-kind][data-title] 內含 rect.box；
 * ④ 每條線 g.edge[data-from][data-to][data-label] 內含 path.hit（透明寬）與 path.ln；
 * ⑤ 線的標籤 g.elabel（文字＝data-label 才能一起變亮）；圖例項 g.lg[data-kind]；
 * ⑥ 選配：容器內 script[type=application/json].xp-views，內容 [{id,label,focus:[ids],note}]。
 * 側欄與章節按鈕由本腳本自己建，作者不用寫。深連結：#focus=id / #focus=id&reach=up|down / #route=a~b / #view=id。
 * 多張圖各自獨立；深連結只作用在第一張圖（一頁通常只有一張要探索的圖）。
 */
(function () {
  const IDLE =
    '<h3>怎麼看這張圖</h3><ul><li><b>點一格</b>：只留它和直接相連的上下游</li><li><b>追到底</b>：沿箭頭把整條上游或下游鏈點亮</li><li><b>shift＋點第二格</b>：找兩格之間的路徑，逐步編號</li><li><b>章節</b>：作者寫好的幾組視角，圖上方按鈕切</li><li><b>圖例</b>：點一項暫時藏掉那一類格子</li></ul><div class="hint">網址的 # 會跟著變，可以把某個視角的連結直接貼給人。<kbd>esc</kbd> 清除。</div>';
  const SVGNS = "http://www.w3.org/2000/svg";

  function setup(root, idx) {
    const svg = root.querySelector("svg.xplore");
    if (!svg) return null;
    let views = [];
    const vj = root.querySelector("script.xp-views");
    if (vj) {
      try {
        views = JSON.parse(vj.textContent);
      } catch (e) {
        console.error("xp-views JSON 壞了", e);
      }
    }
    // 版面：把 figure 包進 xp-main，建章節列、說明、側欄
    const fig = svg.closest(".figure") || svg;
    const main = document.createElement("div");
    main.className = "xp-main";
    fig.parentNode.insertBefore(main, fig);
    const viewsBar = document.createElement("div");
    viewsBar.className = "xp-views";
    const noteEl = document.createElement("div");
    noteEl.className = "xp-note";
    main.append(viewsBar, noteEl, fig);
    const side = document.createElement("aside");
    side.className = "xp-side";
    side.innerHTML = IDLE;
    root.appendChild(side);
    if (!views.length) viewsBar.remove();
    // 高亮用的箭頭 marker（每張圖自己一顆，id 不撞）
    const uid = "xp" + idx + "-hot";
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(SVGNS, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }
    const mk = document.createElementNS(SVGNS, "marker");
    mk.setAttribute("id", uid);
    mk.setAttribute("markerWidth", "8");
    mk.setAttribute("markerHeight", "6");
    mk.setAttribute("refX", "7");
    mk.setAttribute("refY", "3");
    mk.setAttribute("orient", "auto");
    const poly = document.createElementNS(SVGNS, "polygon");
    poly.setAttribute("points", "0 0, 8 3, 0 6");
    poly.setAttribute("class", "ordbg");
    mk.appendChild(poly);
    defs.appendChild(mk);

    const nodes = [...svg.querySelectorAll(".node")],
      edges = [...svg.querySelectorAll(".edge")];
    const byId = Object.fromEntries(nodes.map((n) => [n.dataset.id, n]));
    const out = {},
      inn = {};
    nodes.forEach((n) => {
      out[n.dataset.id] = [];
      inn[n.dataset.id] = [];
    });
    const bad = [];
    edges.forEach((e) => {
      if (!byId[e.dataset.from] || !byId[e.dataset.to]) {
        bad.push(e.dataset.from + "→" + e.dataset.to);
        return;
      }
      out[e.dataset.from].push(e);
      inn[e.dataset.to].push(e);
    });
    if (bad.length)
      console.error("探索層：這些線的端點沒有對應的 data-id", bad);
    const labelOf = {};
    svg.querySelectorAll(".elabel").forEach((g) => {
      labelOf[g.textContent.trim()] = g;
    });
    edges.forEach((e) => {
      e._label = labelOf[(e.dataset.label || "").trim()] || null;
    });

    const state = { focus: null, mode: "focus", view: null };
    const title = (id) => byId[id].dataset.title || id;
    function clear() {
      svg.classList.remove("has-focus");
      nodes.forEach((n) => {
        n.classList.remove("on", "is-focus");
        n.querySelectorAll(".ordwrap").forEach((x) => x.remove());
      });
      edges.forEach((e) => {
        e.classList.remove("on");
        e.querySelector(".ln").style.markerEnd = "";
        e._label && e._label.classList.remove("on");
      });
    }
    const lightNodes = (ids) =>
      ids.forEach((id) => byId[id] && byId[id].classList.add("on"));
    function lightEdge(e) {
      e.classList.add("on");
      e.querySelector(".ln").style.markerEnd = "url(#" + uid + ")";
      e._label && e._label.classList.add("on");
    }
    function reach(id, dir) {
      const seen = new Set([id]),
        q = [id],
        es = [];
      while (q.length) {
        const c = q.shift();
        (dir === "down" ? out[c] : inn[c]).forEach((e) => {
          es.push(e);
          const n = dir === "down" ? e.dataset.to : e.dataset.from;
          if (!seen.has(n)) {
            seen.add(n);
            q.push(n);
          }
        });
      }
      return { nodes: [...seen], edges: es };
    }
    function path(a, b) {
      const prev = { [a]: null },
        q = [a];
      while (q.length) {
        const c = q.shift();
        if (c === b) break;
        for (const e of out[c]) {
          const n = e.dataset.to;
          if (!(n in prev)) {
            prev[n] = { from: c, edge: e };
            q.push(n);
          }
        }
      }
      if (!(b in prev)) return null;
      const steps = [];
      let c = b;
      while (prev[c]) {
        steps.unshift(prev[c]);
        c = prev[c].from;
      }
      return steps;
    }
    const setHash = (h) => {
      if (idx === 0)
        history.replaceState(
          null,
          "",
          h ? "#" + h : location.pathname + location.search,
        );
    };
    function order(id, i) {
      const n = byId[id],
        r = n.querySelector(".box");
      const x = +r.getAttribute("x"),
        y = +r.getAttribute("y");
      const g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "ordwrap");
      g.innerHTML =
        '<circle class="ordbg" cx="' +
        x +
        '" cy="' +
        y +
        '" r="9"/><text class="ord" x="' +
        x +
        '" y="' +
        (y + 3.5) +
        '" text-anchor="middle">' +
        i +
        "</text>";
      n.appendChild(g);
    }
    function setActiveView(id) {
      viewsBar
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("active", b.dataset.view === id));
    }
    function showFocus(id) {
      clear();
      state.focus = id;
      state.view = null;
      setActiveView(null);
      svg.classList.add("has-focus");
      byId[id].classList.add("on", "is-focus");
      const up = inn[id].map((e) => e.dataset.from),
        down = out[id].map((e) => e.dataset.to);
      lightNodes(up.concat(down));
      inn[id].concat(out[id]).forEach(lightEdge);
      side.innerHTML =
        "<h3>" +
        title(id) +
        '</h3><div class="hint">直接相連的格子</div><ul><li>上游 ' +
        up.length +
        "：" +
        (up.map(title).join("、") || "—") +
        "</li><li>下游 " +
        down.length +
        "：" +
        (down.map(title).join("、") || "—") +
        "</li></ul>" +
        '<div class="btns"><button data-act="up">往上游追到底</button><button data-act="down">往下游追到底</button><button data-act="route">從這裡找路徑…</button><button data-act="clear">清除</button></div>' +
        '<div class="hint">再點另一格＝切換焦點；<kbd>shift</kbd>＋點另一格＝找兩點路徑；<kbd>esc</kbd> 清除。</div>';
      noteEl.textContent = "";
      setHash("focus=" + id);
    }
    function showReach(id, dir) {
      clear();
      svg.classList.add("has-focus");
      byId[id].classList.add("on", "is-focus");
      const r = reach(id, dir);
      lightNodes(r.nodes);
      r.edges.forEach(lightEdge);
      const others = r.nodes.filter((n) => n !== id);
      side.innerHTML =
        "<h3>" +
        title(id) +
        " 的" +
        (dir === "down" ? "下游" : "上游") +
        '全部</h3><div class="hint">沿箭頭方向可達的每一格（只看圖上畫出來的關係，不推論）</div><ul>' +
        (others.map((n) => "<li>" + title(n) + "</li>").join("") ||
          "<li>—</li>") +
        '</ul><div class="btns"><button data-act="back">回到焦點</button><button data-act="clear">清除</button></div>';
      setHash("focus=" + id + "&reach=" + dir);
    }
    function showRoute(a, b) {
      const st = path(a, b);
      clear();
      state.view = null;
      setActiveView(null);
      svg.classList.add("has-focus");
      if (!st) {
        side.innerHTML =
          "<h3>" +
          title(a) +
          " → " +
          title(b) +
          '</h3><div class="hint">圖上沒有這個方向的路徑。</div><div class="btns"><button data-act="rev" data-a="' +
          b +
          '" data-b="' +
          a +
          '">反向找</button><button data-act="clear">清除</button></div>';
        byId[a].classList.add("on");
        byId[b].classList.add("on");
        return;
      }
      byId[a].classList.add("on", "is-focus");
      order(a, 1);
      st.forEach((s, i) => {
        lightEdge(s.edge);
        byId[s.edge.dataset.to].classList.add("on");
        order(s.edge.dataset.to, i + 2);
      });
      side.innerHTML =
        "<h3>" +
        title(a) +
        " → " +
        title(b) +
        '</h3><div class="hint">' +
        st.length +
        " 步，最短有向路徑</div><ol>" +
        st
          .map(
            (s) =>
              "<li>" +
              title(s.from) +
              ' <span class="hint">' +
              (s.edge.dataset.label ? "—" + s.edge.dataset.label + "→" : "→") +
              "</span> " +
              title(s.edge.dataset.to) +
              "</li>",
          )
          .join("") +
        '</ol><div class="btns"><button data-act="clear">清除</button></div>';
      setHash("route=" + a + "~" + b);
    }
    function showView(v) {
      clear();
      state.view = v.id;
      svg.classList.add("has-focus");
      lightNodes(v.focus);
      const set = new Set(v.focus);
      edges.forEach((e) => {
        if (set.has(e.dataset.from) && set.has(e.dataset.to)) lightEdge(e);
      });
      setActiveView(v.id);
      noteEl.textContent = v.note || "";
      side.innerHTML =
        "<h3>" +
        v.label +
        '</h3><div class="hint">這一章點亮 ' +
        v.focus.length +
        " 格</div><ul>" +
        v.focus
          .filter((id) => byId[id])
          .map((id) => "<li>" + title(id) + "</li>")
          .join("") +
        '</ul><div class="btns"><button data-act="prev">上一章</button><button data-act="next">下一章</button><button data-act="clear">清除</button></div>';
      setHash("view=" + v.id);
    }
    function reset() {
      clear();
      state.focus = null;
      state.view = null;
      state.mode = "focus";
      setActiveView(null);
      side.innerHTML = IDLE;
      noteEl.textContent = "";
      setHash("");
    }

    views.forEach((v) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.view = v.id;
      b.textContent = v.label;
      b.addEventListener("click", () => showView(v));
      viewsBar.appendChild(b);
    });
    nodes.forEach((n) => {
      n.addEventListener("click", (ev) => {
        const id = n.dataset.id;
        if (
          (ev.shiftKey || state.mode === "route") &&
          state.focus &&
          state.focus !== id
        ) {
          state.mode = "focus";
          showRoute(state.focus, id);
        } else showFocus(id);
      });
      n.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          n.click();
        }
      });
    });
    edges.forEach((e) => {
      e.addEventListener("click", () => {
        clear();
        svg.classList.add("has-focus");
        lightEdge(e);
        byId[e.dataset.from].classList.add("on");
        byId[e.dataset.to].classList.add("on");
        side.innerHTML =
          "<h3>" +
          title(e.dataset.from) +
          " → " +
          title(e.dataset.to) +
          '</h3><div class="hint">' +
          (e.dataset.label || "（無標籤）") +
          '</div><div class="btns"><button data-act="clear">清除</button></div>';
      });
    });
    svg.querySelectorAll(".lg").forEach((l) => {
      l.addEventListener("click", () => {
        const k = l.dataset.kind;
        l.classList.toggle("off");
        const off = l.classList.contains("off");
        nodes.forEach((n) => {
          if (n.dataset.kind === k) n.classList.toggle("off", off);
        });
      });
    });
    side.addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      const a = b.dataset.act;
      if (a === "clear") reset();
      else if (a === "up" || a === "down") showReach(state.focus, a);
      else if (a === "back") showFocus(state.focus);
      else if (a === "route") {
        state.mode = "route";
        b.classList.add("active");
        noteEl.textContent = "現在點第二格。";
      } else if (a === "rev") showRoute(b.dataset.a, b.dataset.b);
      else if (a === "prev" || a === "next") {
        const i = views.findIndex((v) => v.id === state.view);
        showView(
          views[(i + (a === "next" ? 1 : views.length - 1)) % views.length],
        );
      }
    });
    return {
      applyHash() {
        const h = new URLSearchParams(location.hash.slice(1));
        if (h.get("view")) {
          const v = views.find((v) => v.id === h.get("view"));
          v ? showView(v) : reset();
        } else if (h.get("route")) {
          const [a, b] = h.get("route").split("~");
          byId[a] && byId[b] ? showRoute(a, b) : reset();
        } else if (h.get("focus") && byId[h.get("focus")]) {
          h.get("reach")
            ? showReach(h.get("focus"), h.get("reach"))
            : showFocus(h.get("focus"));
        } else reset();
      },
      reset,
    };
  }

  const instances = [...document.querySelectorAll("[data-explore]")]
    .map(setup)
    .filter(Boolean);
  if (!instances.length) return;
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") instances.forEach((i) => i.reset());
  });
  instances[0].applyHash();
  window.addEventListener("hashchange", () => instances[0].applyHash());
})();
