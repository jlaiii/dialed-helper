// ==UserScript==
// @name         Dialed.gg Helper
// @namespace    https://github.com/jlaiii/dialed-helper
// @version      2.1.0
// @description  Auto-capture colors and auto-play rounds on dialed.gg with adjustable accuracy modes
// @author       jlaiii
// @match        https://dialed.gg/*
// @match        https://www.dialed.gg/*
// @icon         https://dialed.gg/favicon.ico
// @grant        none
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/jlaiii/dialed-helper/main/dialed-helper.user.js
// @updateURL    https://raw.githubusercontent.com/jlaiii/dialed-helper/main/dialed-helper.user.js
// ==/UserScript==

(function () {
  "use strict";

  const STYLES = `
    #dh-panel {
      position: fixed; bottom: 16px; right: 16px; z-index: 99999;
      background: rgba(13, 16, 20, 0.94); backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.13);
      border-radius: 14px; padding: 14px; font-family: -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, sans-serif; font-size: 12px; color: #c9d1d9;
      min-width: 230px; max-width: 290px; box-shadow: 0 8px 32px rgba(0,0,0,0.55);
      display: none; user-select: none;
    }
    #dh-panel.on { display: block; }
    #dh-panel h3 { margin: 0 0 10px; font-size: 12px; font-weight: 700; color: #f0f6fc; display: flex; align-items: center; gap: 8px; }
    #dh-panel h3 .dh-status { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
    #dh-panel h3 .dh-status.auto { background: rgba(46,160,67,0.2); color: #2ea043; border: 1px solid rgba(46,160,67,0.3); }
    #dh-panel h3 .dh-status.manual { background: rgba(139,148,158,0.15); color: #8b949e; border: 1px solid rgba(139,148,158,0.2); }
    #dh-swabs { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px; }
    #dh-swabs .sw { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.14);
      cursor: pointer; position: relative; transition: transform 0.12s, border-color 0.12s; }
    #dh-swabs .sw:hover { transform: scale(1.14); border-color: rgba(255,255,255,0.4); z-index: 2; }
    #dh-swabs .sw.em { background: rgba(255,255,255,0.04); border-style: dashed; }
    #dh-swabs .sw .rn { position: absolute; top: -5px; right: -5px; background: rgba(0,0,0,0.85);
      color: #8b949e; font-size: 8px; width: 14px; height: 14px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-weight: 700;
      border: 1px solid rgba(255,255,255,0.14); }
    #dh-values { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 10px; color: #8b949e; line-height: 1.55; }
    #dh-values .cr { display: flex; align-items: center; gap: 5px; padding: 2px 3px; border-radius: 4px; cursor: pointer; transition: background 0.12s; }
    #dh-values .cr:hover { background: rgba(255,255,255,0.06); }
    #dh-values .ms { width: 11px; height: 11px; border-radius: 3px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.14); }
    #dh-values .vl { color: #c9d1d9; }
    #dh-values .hs { color: #58a6ff; margin-left: 3px; }
    #dh-controls { display: flex; gap: 5px; margin-top: 6px; flex-wrap: wrap; }
    #dh-controls button { flex: 1; padding: 5px 8px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04); color: #c9d1d9; font-size: 10px; font-weight: 600;
      cursor: pointer; transition: background 0.12s, border-color 0.12s; font-family: inherit; min-width: 0; }
    #dh-controls button:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
    #dh-controls button.active { background: rgba(46,160,67,0.18); color: #2ea043; border-color: rgba(46,160,67,0.35); }
    #dh-controls button.solve-active { background: rgba(88,166,255,0.18); color: #58a6ff; border-color: rgba(88,166,255,0.35); }
    #dh-controls button.set-active { background: rgba(210,153,34,0.18); color: #d29922; border-color: rgba(210,153,34,0.35); }
    #dh-mode-row { display: flex; gap: 4px; margin-top: 5px; }
    #dh-mode-row button { flex: 1; padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #8b949e; font-size: 9px; font-weight: 600;
      cursor: pointer; transition: all 0.12s; font-family: inherit; }
    #dh-mode-row button:hover { background: rgba(255,255,255,0.08); color: #c9d1d9; }
    #dh-mode-row button.active { background: rgba(210,153,34,0.2); color: #d29922; border-color: rgba(210,153,34,0.4); }
    #dh-toggle { position: fixed; bottom: 16px; right: 16px; z-index: 99998;
      width: 36px; height: 36px; border-radius: 50%; background: rgba(13,16,20,0.9);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.13); color: #8b949e; font-size: 16px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4); transition: transform 0.12s, border-color 0.12s, color 0.12s; line-height: 1; }
    #dh-toggle:hover { transform: scale(1.1); border-color: rgba(255,255,255,0.25); }
    #dh-toggle.has { border-color: rgba(88,166,255,0.5); color: #58a6ff; }
    #dh-toggle.auto-active { border-color: rgba(46,160,67,0.5); color: #2ea043; }
    #dh-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999;
      background: rgba(13,16,20,0.94); backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(46,160,67,0.35);
      border-radius: 10px; padding: 8px 18px; font-family: -apple-system, BlinkMacSystemFont,
      "Segoe UI", Roboto, sans-serif; font-size: 12px; color: #c9d1d9; font-weight: 600;
      pointer-events: none; opacity: 0; transition: opacity 0.25s; }
    #dh-toast.show { opacity: 1; }
    #dh-toast.warn { border-color: rgba(210,153,34,0.5); }
  `;

  let capturedColors = [];
  let currentRound = 0;
  let totalRounds = 5;
  let panelOn = false;
  let autoCapture = true;
  let autoSolve = false;
  let solveInProgress = false;
  let lastSolvedRound = 0;
  let solveDelay = 150;
  let accuracyMode = "pro";

  function $(id) { return document.getElementById(id); }

  function injectStyles() {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.appendChild(s);
  }

  function createUI() {
    const toast = document.createElement("div");
    toast.id = "dh-toast";
    document.body.appendChild(toast);

    const toggle = document.createElement("button");
    toggle.id = "dh-toggle";
    toggle.innerHTML = "&#9670;";
    toggle.title = "Dialed Helper | Ctrl+` to toggle";
    toggle.addEventListener("click", () => togglePanel());
    document.body.appendChild(toggle);

    const panel = document.createElement("div");
    panel.id = "dh-panel";
    panel.innerHTML = `
      <h3><span>Color Memory</span><span id="dh-status-badge" class="dh-status manual">manual</span></h3>
      <div id="dh-swabs"></div>
      <div id="dh-values"></div>
      <div id="dh-controls">
        <button id="dh-btn-capture" class="active" title="Toggle auto color capture">Capture</button>
        <button id="dh-btn-set" title="Set sliders to target (no submit)">Set Color</button>
        <button id="dh-btn-solve" title="Toggle auto-solve (sets color + submits)">Auto-Solve</button>
      </div>
      <div id="dh-mode-row">
        <button data-mode="perfect" title="Exact match, perfect 10/10">Perfect</button>
        <button data-mode="pro" title="Tiny errors, ~9-10/10">Pro</button>
        <button data-mode="good" title="Moderate errors, ~8-9/10">Good</button>
      </div>
    `;
    document.body.appendChild(panel);

    $("dh-btn-capture").addEventListener("click", function() {
      autoCapture = !autoCapture;
      $("dh-btn-capture").classList.toggle("active", autoCapture);
      showToast(autoCapture ? "Auto-capture ON" : "Auto-capture OFF");
    });

    $("dh-btn-set").addEventListener("click", function() {
      trySetColor(false);
      showToast("Setting sliders to target...");
    });

    $("dh-btn-solve").addEventListener("click", function() {
      autoSolve = !autoSolve;
      $("dh-btn-solve").classList.toggle("solve-active", autoSolve);
      updateStatusBadge();
      showToast(autoSolve ? "Auto-solve ON" : "Auto-solve OFF");
      if (autoSolve) trySetColor(true);
    });

    var modeButtons = document.querySelectorAll("#dh-mode-row button");
    for (var mi = 0; mi < modeButtons.length; mi++) {
      modeButtons[mi].addEventListener("click", function() {
        setAccuracyMode(this.dataset.mode);
      });
      if (modeButtons[mi].dataset.mode === accuracyMode) {
        modeButtons[mi].classList.add("active");
      }
    }

    updateUI();
    updateStatusBadge();
  }

  function togglePanel() {
    panelOn = !panelOn;
    const panel = $("dh-panel");
    const toggle = $("dh-toggle");
    if (panel) panel.classList.toggle("on", panelOn);
    if (toggle) toggle.style.bottom = panelOn ? "310px" : "16px";
  }

  function updateStatusBadge() {
    var badge = $("dh-status-badge");
    if (!badge) return;
    if (autoSolve) {
      badge.textContent = accuracyMode;
      badge.className = "dh-status auto";
    } else {
      badge.textContent = accuracyMode;
      badge.className = "dh-status manual";
    }
    var toggle = $("dh-toggle");
    if (toggle) {
      toggle.classList.toggle("auto-active", autoSolve);
    }
  }

  function showToast(msg, warn) {
    const t = $("dh-toast");
    if (!t) return;
    t.textContent = msg;
    t.className = warn ? "show warn" : "show";
    clearTimeout(t._tid);
    t._tid = setTimeout(() => { t.className = ""; }, 1800);
  }

  function rgbFromString(str) {
    if (!str) return null;
    const m = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    const m2 = str.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\)/);
    if (m2) return { r: +m2[1], g: +m2[2], b: +m2[3] };
    return null;
  }

  function rgbToHsb(r, g, b) {
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === rf) h = ((gf - bf) / delta) % 6;
      else if (max === gf) h = (bf - rf) / delta + 2;
      else h = (rf - gf) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    const s = max === 0 ? 0 : Math.round((delta / max) * 100);
    const v = Math.round(max * 100);
    return { h, s, b: v };
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function hsbToRgb(h, s, b) {
    var hf = h / 60;
    var sf = s / 100;
    var bf = b / 100;
    var c = bf * sf;
    var x = c * (1 - Math.abs((hf % 2) - 1));
    var m = bf - c;
    var rp, gp, bp;
    var hi = Math.floor(hf) % 6;
    if (hi === 0) { rp = c; gp = x; bp = 0; }
    else if (hi === 1) { rp = x; gp = c; bp = 0; }
    else if (hi === 2) { rp = 0; gp = c; bp = x; }
    else if (hi === 3) { rp = 0; gp = x; bp = c; }
    else if (hi === 4) { rp = x; gp = 0; bp = c; }
    else { rp = c; gp = 0; bp = x; }
    return {
      r: (rp + m) * 255,
      g: (gp + m) * 255,
      b: (bp + m) * 255
    };
  }

  function captureColorFromCountdown(el) {
    var bg = el.style.backgroundColor || getComputedStyle(el).backgroundColor;
    var rgb = rgbFromString(bg);
    if (!rgb || (rgb.r === 0 && rgb.g === 0 && rgb.b === 0)) return null;
    if (rgb.r < 5 && rgb.g < 5 && rgb.b < 5) return null;
    return rgb;
  }

  function captureColorFromResult(targetEl) {
    var bg = targetEl.style.background || getComputedStyle(targetEl).background || targetEl.style.backgroundColor || getComputedStyle(targetEl).backgroundColor;
    var rgb = rgbFromString(bg);
    if (!rgb || (rgb.r === 0 && rgb.g === 0 && rgb.b === 0)) return null;
    return rgb;
  }

  function captureRoundFromCountdown(el) {
    var re = el.querySelector('[class*="CountdownScreen"][class*="round"]');
    if (!re) return null;
    var m = re.textContent.trim().match(/(\d+)\s*\/\s*(\d+)/);
    return m ? { round: +m[1], total: +m[2] } : null;
  }

  var lastCapturedBg = "";
  var captureDebounce = {};

  function handleCapturedColor(rgb, roundNum, total) {
    if (!autoCapture) return;
    if (roundNum < 1 || roundNum > 20) return;
    if (total) totalRounds = total;

    var key = roundNum + ":" + rgb.r + ":" + rgb.g + ":" + rgb.b;
    var now = Date.now();
    if (captureDebounce[key] && now - captureDebounce[key] < 2000) return;
    captureDebounce[key] = now;

    var existingIdx = capturedColors.findIndex(function(c) { return c.round === roundNum; });
    if (existingIdx >= 0 && capturedColors[existingIdx].hsb) {
      return;
    }

    var entry = { round: roundNum, r: rgb.r, g: rgb.g, b: rgb.b, ts: now };

    if (existingIdx >= 0) {
      var prev = capturedColors[existingIdx];
      if (prev.r === rgb.r && prev.g === rgb.g && prev.b === rgb.b) return;
      capturedColors[existingIdx] = entry;
    } else {
      capturedColors.push(entry);
      capturedColors.sort(function(a, b) { return a.round - b.round; });
    }

    currentRound = roundNum;
    console.log("[DialedHelper] Color captured - round", roundNum, "RGB:", rgb.r, rgb.g, rgb.b);
    updateUI();
    showToast("Captured round " + roundNum + "/" + totalRounds);

    if (autoSolve) {
      setTimeout(function() { trySetColor(true); }, 600);
    }
  }

  var updateUIPending = false;
  var updateUITimer = null;

  function updateUI() {
    if (updateUIPending) return;
    updateUIPending = true;
    if (updateUITimer) clearTimeout(updateUITimer);
    updateUITimer = setTimeout(doUpdateUI, 150);
  }

  function doUpdateUI() {
    updateUIPending = false;
    updateUITimer = null;
    const swabs = $("dh-swabs");
    const values = $("dh-values");
    const toggle = $("dh-toggle");
    if (!swabs || !values) return;

    swabs.innerHTML = "";
    values.innerHTML = "";

    var displayRounds = Math.max(totalRounds, 5);

    if (capturedColors.length === 0) {
      swabs.innerHTML = '<div class="sw em"></div>'.repeat(displayRounds);
    } else {
      for (var i = 1; i <= displayRounds; i++) {
        var c = capturedColors.find(function(x) { return x.round === i; });
        var div = document.createElement("div");
        div.className = "sw" + (c ? "" : " em");
        if (c) {
          if (c.hsb) {
            var srgb = hsbToRgb(c.hsb.h, c.hsb.s, c.hsb.b);
            div.style.backgroundColor = "rgb(" + Math.round(srgb.r) + "," + Math.round(srgb.g) + "," + Math.round(srgb.b) + ")";
          } else {
            div.style.backgroundColor = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
          }
          div.title = "Round " + i + " - Click to copy hex";
        }
        const num = document.createElement("span");
        num.className = "rn";
        num.textContent = i;
        div.appendChild(num);
        if (c) {
          div.addEventListener("click", (function(color) {
            return function() {
              var h;
              if (color.hsb) {
                var srgb = hsbToRgb(color.hsb.h, color.hsb.s, color.hsb.b);
                h = rgbToHex(Math.round(srgb.r), Math.round(srgb.g), Math.round(srgb.b));
              } else {
                h = rgbToHex(color.r, color.g, color.b);
              }
              navigator.clipboard.writeText(h).then(function() { showToast("Copied " + h); });
            };
          })(c));
        }
        swabs.appendChild(div);
      }
    }

    capturedColors.sort(function(a, b) { return a.round - b.round; });

    for (var ci = 0; ci < capturedColors.length; ci++) {
      var c = capturedColors[ci];
      var row = document.createElement("div");
      row.className = "cr";
      var hsb = c.hsb || rgbToHsb(c.r, c.g, c.b);
      var hex;
      if (c.hsb) {
        var rgb = hsbToRgb(c.hsb.h, c.hsb.s, c.hsb.b);
        hex = rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
        row.innerHTML =
          '<span class="ms" style="background:rgb(' + Math.round(rgb.r) + ',' + Math.round(rgb.g) + ',' + Math.round(rgb.b) + ')"></span>' +
          '<span class="vl">' + hex + '</span>' +
          '<span class="hs">H' + hsb.h + ' S' + hsb.s + ' B' + hsb.b + '</span>';
      } else {
        hex = rgbToHex(c.r, c.g, c.b);
        row.innerHTML =
          '<span class="ms" style="background:rgb(' + c.r + ',' + c.g + ',' + c.b + ')"></span>' +
          '<span class="vl">' + hex + '</span>' +
          '<span class="hs">H' + hsb.h + ' S' + hsb.s + ' B' + hsb.b + '</span>';
      }
      row.title = "Click to copy " + hex;
      row.addEventListener("click", (function(hexVal) {
        return function() {
          navigator.clipboard.writeText(hexVal).then(function() { showToast("Copied " + hexVal); });
        };
      })(hex));
      values.appendChild(row);
    }

    if (toggle) {
      toggle.classList.toggle("has", capturedColors.length > 0);
    }
  }

  function getGameTargetFromFiber() {
    var sliders = findSliders();
    if (sliders.length < 3) return null;
    var fiberKey = Object.keys(sliders[0]).find(function(k) {
      return k.startsWith("__reactFiber$");
    });
    if (!fiberKey) return null;
    var fiber = sliders[0][fiberKey];
    var depth = 0;
    while (fiber && depth < 30) {
      if (fiber.memoizedProps && fiber.memoizedProps.target &&
          typeof fiber.memoizedProps.target.h === "number") {
        return fiber.memoizedProps.target;
      }
      fiber = fiber.return;
      depth++;
    }
    return null;
  }

  function forceGuessRef(hsbValues) {
    var sliders = findSliders();
    if (sliders.length < 3) return false;

    var fiberKey = Object.keys(sliders[0]).find(function(k) {
      return k.startsWith("__reactFiber$");
    });
    if (!fiberKey) return false;

    var fiber = sliders[0][fiberKey];
    var depth = 0;

    while (fiber && depth < 30) {
      var hooks = fiber.memoizedState;
      while (hooks) {
        var hookState = hooks.memoizedState;

        if (hookState && hookState.current && typeof hookState.current.h === "number" &&
            typeof hookState.current.s === "number" && typeof hookState.current.b === "number") {
          hookState.current.h = hsbValues.h;
          hookState.current.s = hsbValues.s;
          hookState.current.b = hsbValues.b;
        }

        if (Array.isArray(hookState) && hookState.length === 2 &&
            typeof hookState[1] === "function" && hookState[0] &&
            typeof hookState[0].h === "number") {
          try { hookState[1]({ h: hsbValues.h, s: hsbValues.s, b: hsbValues.b }); } catch(e) {}
        }

        hooks = hooks.next;
      }
      fiber = fiber.return;
      depth++;
    }
    return true;
  }

  function findSliders() {
    return document.querySelectorAll('[role="slider"]');
  }

  function findSubmitButton() {
    const stripContainer = document.querySelector('[class*="stripContainer"]');
    if (stripContainer) {
      const root = stripContainer.closest('[class*="Input-module"]') ||
                   stripContainer.closest('[class*="root"]') ||
                   stripContainer.parentElement;
      if (root) {
        for (const el of root.querySelectorAll('button, [role="button"]')) {
          if (el.id && el.id.startsWith("dh-")) continue;
          const text = (el.textContent || "").toLowerCase();
          const cls = (el.className || "").toLowerCase();
          if (text.includes("go") || cls.includes("go") || cls.includes("picker") || cls.includes("submit")) {
            return el;
          }
        }
        const buttons = root.querySelectorAll('button:not([id^="dh-"])');
        for (const btn of buttons) {
          const text = (btn.textContent || "").trim().toLowerCase();
          if (text === "go" || text === ">" || text === "" || btn.offsetWidth < 100) {
            return btn;
          }
        }
      }
    }
    const pickerGo = document.querySelector('[class*="pickerGo"], [class*="PickerGo"]');
    if (pickerGo) return pickerGo;
    const goBtn = document.querySelector('[class*="pickerGoWrap"] button, [class*="pickerGoWrap"] [role="button"]');
    if (goBtn) return goBtn;
    return null;
  }

  function clickSubmitSafely(btn) {
    if (!btn) return false;

    var fiberKey = Object.keys(btn).find(function(k) {
      return k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$");
    });
    if (fiberKey) {
      var fiber = btn[fiberKey];
      var propsKey = Object.keys(btn).find(function(k) {
        return k.startsWith("__reactProps$") || k.startsWith("__reactEventHandlers$");
      });
      if (propsKey) {
        var props = btn[propsKey];
        if (typeof props.onClick === "function") {
          console.log("[DialedHelper] Calling React onClick directly");
          props.onClick({ type: "click", preventDefault: function(){}, stopPropagation: function(){} });
          return true;
        }
        if (typeof props.onPointerDown === "function") {
          console.log("[DialedHelper] Calling React onPointerDown directly");
          props.onPointerDown({ type: "pointerdown", preventDefault: function(){}, stopPropagation: function(){} });
          return true;
        }
      }
    }

    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    btn.dispatchEvent(new MouseEvent("click", {
      clientX: cx, clientY: cy, bubbles: true, cancelable: true,
      view: window, button: 0,
    }));
    btn.dispatchEvent(new PointerEvent("pointerdown", {
      clientX: cx, clientY: cy, pointerId: 999, pointerType: "mouse",
      bubbles: true, cancelable: true, button: 0, buttons: 1,
    }));
    btn.dispatchEvent(new PointerEvent("pointerup", {
      clientX: cx, clientY: cy, pointerId: 999, pointerType: "mouse",
      bubbles: true, cancelable: true, button: 0,
    }));
    return true;
  }

  function setSliderValue(sliderEl, targetValue) {
    var origCapture = sliderEl.setPointerCapture;
    sliderEl.setPointerCapture = function() {};

    var origRelease = sliderEl.releasePointerCapture;
    sliderEl.releasePointerCapture = function() {};

    try {
      var min = parseFloat(sliderEl.getAttribute("aria-valuemin")) || 0;
      var max = parseFloat(sliderEl.getAttribute("aria-valuemax")) || 100;
      var targetRatio = Math.max(0, Math.min(1, (targetValue - min) / (max - min)));
      var rect = sliderEl.getBoundingClientRect();
      var clientX = rect.left + rect.width / 2;

      var currentVal = parseFloat(sliderEl.getAttribute("aria-valuenow")) || min;
      var currentRatio = max === min ? 0 : (currentVal - min) / (max - min);

      var pid = 1;

      sliderEl.dispatchEvent(new PointerEvent("pointerdown", {
        clientX: clientX,
        clientY: rect.top + currentRatio * rect.height,
        pointerId: pid, bubbles: true, cancelable: true,
        pointerType: "mouse", button: 0, buttons: 1,
      }));

      var steps = 8;
      for (var i = 1; i <= steps; i++) {
        var t = i / steps;
        var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        var r = currentRatio + (targetRatio - currentRatio) * eased;
        var clientY = rect.top + r * rect.height;
        sliderEl.dispatchEvent(new PointerEvent("pointermove", {
          clientX: clientX, clientY: clientY, pointerId: pid,
          buttons: 1, bubbles: true, cancelable: true, pointerType: "mouse",
        }));
      }

      sliderEl.dispatchEvent(new PointerEvent("pointerup", {
        clientX: clientX,
        clientY: rect.top + targetRatio * rect.height,
        pointerId: pid, bubbles: true, cancelable: true, pointerType: "mouse",
      }));
    } finally {
      sliderEl.setPointerCapture = origCapture;
      sliderEl.releasePointerCapture = origRelease;
    }
  }

  function applyAccuracyNoise(hsb, mode) {
    if (mode === "perfect") return { h: hsb.h, s: hsb.s, b: hsb.b };

    var noiseH, noiseS, noiseB;
    if (mode === "pro") {
      noiseH = (Math.random() - 0.5) * 2;
      noiseS = (Math.random() - 0.5) * 3;
      noiseB = (Math.random() - 0.5) * 3;
    } else {
      noiseH = (Math.random() - 0.5) * 8;
      noiseS = (Math.random() - 0.5) * 10;
      noiseB = (Math.random() - 0.5) * 10;
    }

    return {
      h: Math.max(0, Math.min(360, Math.round(hsb.h + noiseH))),
      s: Math.max(0, Math.min(100, Math.round(hsb.s + noiseS))),
      b: Math.max(0, Math.min(100, Math.round(hsb.b + noiseB)))
    };
  }

  function setAccuracyMode(mode) {
    accuracyMode = mode;
    var buttons = document.querySelectorAll("#dh-mode-row button");
    for (var bi = 0; bi < buttons.length; bi++) {
      buttons[bi].classList.toggle("active", buttons[bi].dataset.mode === mode);
    }
    updateStatusBadge();
    showToast("Accuracy: " + mode.charAt(0).toUpperCase() + mode.slice(1));
  }

  function getSliderChannel(sliderEl) {
    var label = sliderEl.getAttribute("aria-label") || "";
    var l = label.toLowerCase();
    if (l.includes("hue") || l === "h") return "h";
    if (l.includes("sat")) return "s";
    if (l.includes("bright") || l.includes("bri") || l === "b") return "b";

    var cls = sliderEl.className || "";
    if (cls.includes("Hue") || cls.includes("hue")) return "h";
    if (cls.includes("Sat") || cls.includes("sat")) return "s";
    if (cls.includes("Bright") || cls.includes("bright") || cls.includes("Bri")) return "b";

    return null;
  }

  function getCurrentRoundFromDOM() {
    const indicator = document.querySelector('[class*="roundIndicator"]');
    if (indicator) {
      const m = indicator.textContent.trim().match(/(\d+)\s*\/\s*(\d+)/);
      if (m) return { round: +m[1], total: +m[2] };
    }
    const countdown = document.querySelector('[class*="CountdownScreen"][class*="round"]');
    if (countdown) {
      const m = countdown.textContent.trim().match(/(\d+)\s*\/\s*(\d+)/);
      if (m) return { round: +m[1], total: +m[2] };
    }
    return null;
  }

  async function trySetColor(shouldSubmit) {
    if (solveInProgress && shouldSubmit) return;

    var domRound = getCurrentRoundFromDOM();
    var roundNum = domRound ? domRound.round : lastSolvedRound + 1;
    if (domRound && domRound.total) totalRounds = domRound.total;

    var sliders = findSliders();
    if (sliders.length < 3) {
      if (shouldSubmit) showToast("Sliders not found (waiting for input screen)", true);
      if (autoSolve && shouldSubmit) setTimeout(function() { trySetColor(true); }, 400);
      return;
    }

    var fiberTarget = getGameTargetFromFiber();
    var hsb;

    if (fiberTarget) {
      hsb = { h: fiberTarget.h, s: fiberTarget.s, b: fiberTarget.b };
      console.log("[DialedHelper] Got EXACT target from game state - H:" + hsb.h + " S:" + hsb.s + " B:" + hsb.b);

      var color = capturedColors.find(function(c) { return c.round === roundNum; });
      var fiberRgb = hsbToRgb(hsb.h, hsb.s, hsb.b);
      var fiberEntry = {
        round: roundNum,
        r: Math.round(fiberRgb.r),
        g: Math.round(fiberRgb.g),
        b: Math.round(fiberRgb.b),
        ts: Date.now(),
        hsb: hsb
      };

      if (!color) {
        capturedColors.push(fiberEntry);
        capturedColors.sort(function(a, b) { return a.round - b.round; });
        currentRound = roundNum;
        updateUI();
        showToast("Got exact target for round " + roundNum);
      } else if (!color.hsb) {
        color.hsb = hsb;
        color.r = fiberEntry.r;
        color.g = fiberEntry.g;
        color.b = fiberEntry.b;
        updateUI();
      }
    } else {
      var color = capturedColors.find(function(c) { return c.round === roundNum; });
      if (!color) {
        if (shouldSubmit) showToast("No color captured for round " + roundNum + " yet", true);
        return;
      }
      hsb = rgbToHsb(color.r, color.g, color.b);
      console.log("[DialedHelper] Using captured RGB -> HSB - H:" + hsb.h + " S:" + hsb.s + " B:" + hsb.b);
    }

    var noisyHsb = applyAccuracyNoise(hsb, accuracyMode);
    console.log("[DialedHelper] Accuracy mode:", accuracyMode, "-> noisy HSB:", noisyHsb.h, noisyHsb.s, noisyHsb.b);

    if (shouldSubmit) {
      solveInProgress = true;
    }
    showToast((shouldSubmit ? "Solving" : "Setting") + " round " + roundNum + " (" + accuracyMode + ")...");

    var targetByChannel = { h: noisyHsb.h, s: noisyHsb.s, b: noisyHsb.b };

    var sliderChannels = [];
    for (var si = 0; si < sliders.length; si++) {
      var ch = getSliderChannel(sliders[si]);
      sliderChannels.push({ el: sliders[si], channel: ch });
    }

    for (var si = 0; si < sliderChannels.length; si++) {
      var sc = sliderChannels[si];
      if (!sc.channel) continue;
      var target = targetByChannel[sc.channel];
      if (target === undefined) continue;
      setSliderValue(sc.el, target);
      await sleep(solveDelay);
    }

    await sleep(400);

    forceGuessRef(noisyHsb);
    console.log("[DialedHelper] forceGuessRef called with", noisyHsb.h, noisyHsb.s, noisyHsb.b);

    if (!shouldSubmit) {
      showToast("Sliders set to target (" + accuracyMode + "). Press done when ready.");
      return;
    }

    var submitted = false;

    if (fiberTarget) {
      var fiberKey2 = Object.keys(sliders[0]).find(function(k) {
        return k.startsWith("__reactFiber$");
      });
      if (fiberKey2) {
        var fiber2 = sliders[0][fiberKey2];
        var depth2 = 0;
        while (fiber2 && depth2 < 30) {
          if (fiber2.memoizedProps && typeof fiber2.memoizedProps.onSubmit === "function") {
            console.log("[DialedHelper] Submitting directly via React fiber onSubmit with noisy values");
            fiber2.memoizedProps.onSubmit({ h: noisyHsb.h, s: noisyHsb.s, b: noisyHsb.b });
            submitted = true;
            break;
          }
          fiber2 = fiber2.return;
          depth2++;
        }
      }
    }

    if (!submitted) {
      var submitBtn = findSubmitButton();
      if (submitBtn) {
        console.log("[DialedHelper] Found submit button:", submitBtn.tagName, submitBtn.className, (submitBtn.textContent || "").trim());
        if (clickSubmitSafely(submitBtn)) {
          submitted = true;
        } else {
          var me = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
          submitBtn.dispatchEvent(me);
          submitted = true;
        }
      }
    }

    if (!submitted) {
      var activeEl = document.activeElement;
      if (activeEl) {
        activeEl.dispatchEvent(new KeyboardEvent("keydown", {
          key: "Enter", code: "Enter", keyCode: 13, which: 13,
          bubbles: true, cancelable: true,
        }));
        submitted = true;
      }
    }

    if (submitted) {
      showToast("Submitted round " + roundNum);
      lastSolvedRound = roundNum;
    } else {
      console.warn("[DialedHelper] Could not submit. Buttons found:", document.querySelectorAll("button").length);
      showToast("Submit button not found", true);
    }

    solveInProgress = false;

    if (autoSolve && roundNum < totalRounds) {
      setTimeout(function() {
        if (autoSolve) trySetColor(true);
      }, 2000);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  var pollTimer = null;

  function pollForColors() {
    var cd = document.querySelector('[class*="CountdownScreen"][class*="countdown"]');
    if (cd) {
      var rgb = captureColorFromCountdown(cd);
      if (rgb) {
        var ri = captureRoundFromCountdown(cd);
        handleCapturedColor(rgb, ri ? ri.round : currentRound + 1, ri ? ri.total : totalRounds);
      }
    }
  }

  function observeGame() {
    pollTimer = setInterval(pollForColors, 500);

    var observer = new MutationObserver(function(mutations) {
      for (var mi = 0; mi < mutations.length; mi++) {
        var m = mutations[mi];
        for (var ni = 0; ni < m.addedNodes.length; ni++) {
          var node = m.addedNodes[ni];
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          if (node.querySelectorAll) {
            var sliders = node.querySelectorAll('[role="slider"]');
            if (sliders.length >= 3 && autoSolve) {
              setTimeout(function() { trySetColor(true); }, 500);
            }
          }
        }

        if (m.type === "attributes" && m.attributeName === "style") {
          pollForColors();
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    pollForColors();
  }

  function observeSlidersAppearing() {
    setInterval(() => {
      if (!autoSolve || solveInProgress) return;
      const sliders = findSliders();
      if (sliders.length >= 3) {
        const domRound = getCurrentRoundFromDOM();
        const rn = domRound ? domRound.round : lastSolvedRound + 1;
        if (rn > lastSolvedRound) {
          trySetColor(true);
        }
      }
    }, 800);
  }

  function resetOnNewGame() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (
            node.matches &&
            (node.matches('[class*="IntroScreen"]') ||
              node.matches('[class*="TotalScreen"]') ||
              node.matches('[class*="MultiResultScreen"]') ||
              node.matches('[class*="DailyResultsScreen"]'))
          ) {
            capturedColors = [];
            currentRound = 0;
            lastSolvedRound = 0;
            solveInProgress = false;
            updateUI();
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    injectStyles();
    createUI();
    observeGame();
    observeSlidersAppearing();
    resetOnNewGame();

    document.addEventListener("submit", function(e) {
      console.log("[DialedHelper] Blocked form submission from", e.target);
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, { capture: true });

    window.addEventListener("beforeunload", function(e) {
      console.log("[DialedHelper] beforeunload triggered");
    });

    var origPush = history.pushState;
    history.pushState = function() {
      console.log("[DialedHelper] history.pushState", arguments);
      return origPush.apply(this, arguments);
    };
    var origReplace = history.replaceState;
    history.replaceState = function() {
      console.log("[DialedHelper] history.replaceState", arguments);
      return origReplace.apply(this, arguments);
    };

    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        togglePanel();
      }
      if (e.ctrlKey && e.key === "s" && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        autoSolve = !autoSolve;
        var btnSolve = $("dh-btn-solve");
        if (btnSolve) btnSolve.classList.toggle("solve-active", autoSolve);
        updateStatusBadge();
        showToast(autoSolve ? "Auto-solve ON" : "Auto-solve OFF");
        if (autoSolve) trySetColor(true);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
