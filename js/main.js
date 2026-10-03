/* =========================================================
 *  二次元植物大战僵尸 · 界面流程
 * ========================================================= */
(function (global) {
  'use strict';
  var D = global.PVZData;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var state = {
    level: null, chosen: [], cooldown: {}, game: null, cdTimer: null
  };

  function showScreen(id) {
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
    $('#app').dataset.screen = id;
  }

  /* ---------------- 关卡选择 ---------------- */
  function renderLevels() {
    var wrap = $('#levelList');
    wrap.innerHTML = '';
    D.LEVELS.forEach(function (lv, i) {
      var card = document.createElement('div');
      card.className = 'level-card' + (lv.isNew ? ' new' : '');
      var stars = '★'.repeat(lv.difficulty) + '☆'.repeat(5 - lv.difficulty);
      card.innerHTML =
        (lv.isNew ? '<div class="ribbon">NEW</div>' : '') +
        '<div class="lv-thumb theme-' + lv.theme + '"><span class="lv-no">0' + (i + 1) + '</span></div>' +
        '<h3>' + lv.name + '</h3>' +
        '<div class="lv-sub">' + lv.subtitle + '</div>' +
        '<div class="lv-stars">' + stars + '</div>' +
        '<p class="lv-desc">' + lv.desc + '</p>' +
        '<div class="lv-tags"><span>' + lv.lanes + '×' + lv.cols + ' 格</span><span>' + lv.waveCount + ' 波 · ' + lv.totalWaves + ' 只</span><span>' + lv.pool.length + ' 种植物</span></div>' +
        '<div class="lv-actions">' +
        (lv.brief ? '<button class="btn ghost" data-brief="' + i + '">关卡详情</button>' : '') +
        '<button class="btn primary" data-go="' + i + '">开始</button>' +
        '</div>';
      wrap.appendChild(card);
    });
    wrap.querySelectorAll('[data-go]').forEach(function (b) {
      b.onclick = function () { openPicker(D.LEVELS[+b.dataset.go]); };
    });
    wrap.querySelectorAll('[data-brief]').forEach(function (b) {
      b.onclick = function () { showBrief(D.LEVELS[+b.dataset.brief]); };
    });
  }

  function showBrief(lv) {
    var b = lv.brief;
    var html =
      '<h2>' + lv.name + ' <span class="badge">新增关卡</span></h2>' +
      '<div class="brief-grid">' +
      '<div><b>地图布局</b><p>' + b.map + '</p></div>' +
      '<div><b>僵尸波次</b><p>' + b.waves + '</p></div>' +
      '<div><b>出场僵尸</b><p>' + b.zombies + '</p></div>' +
      '<div><b>可用植物</b><p>' + b.plants + '</p></div>' +
      '<div><b>特殊规则</b><p>' + b.rules + '</p></div>' +
      '<div><b>难度设定</b><p class="diff">' + b.difficulty + '</p></div>' +
      '</div>';
    openModal(html);
  }

  /* ---------------- 选卡 ---------------- */
  function openPicker(lv) {
    state.level = lv;
    state.chosen = [];
    var grid = $('#pickerGrid');
    grid.innerHTML = '';
    lv.pool.forEach(function (id) {
      var p = D.PLANT_MAP[id];
      var c = document.createElement('div');
      c.className = 'pick-card';
      c.dataset.id = id;
      c.innerHTML = cardInner(p);
      c.onclick = function () { togglePick(id, c); };
      grid.appendChild(c);
    });
    $('#pickerTitle').textContent = '选择植物 · ' + lv.name;
    $('#pickerLimit').textContent = '最多 ' + lv.slots + ' 种';
    updatePickCount();
    showScreen('picker');
  }

  function cardInner(p) {
    return '<div class="seed-thumb"><img src="' + p.portrait + '" alt="" onerror="this.remove()"><div class="svgwrap">' + global.AnimeSprites.chibi(p.look) + '</div></div>' +
      '<div class="seed-name">' + p.name + '</div>' +
      '<div class="seed-tag">' + p.tag + '</div>' +
      '<div class="seed-cost">☀ ' + p.cost + '</div>';
  }

  function togglePick(id, c) {
    var idx = state.chosen.indexOf(id);
    if (idx >= 0) { state.chosen.splice(idx, 1); c.classList.remove('on'); }
    else {
      if (state.chosen.length >= state.level.slots) { toast('最多选择 ' + state.level.slots + ' 种植物'); return; }
      state.chosen.push(id); c.classList.add('on');
    }
    updatePickCount();
  }

  function updatePickCount() {
    $('#pickCount').textContent = state.chosen.length + ' / ' + state.level.slots;
    $('#pickerGo').disabled = state.chosen.length === 0;
  }

  /* ---------------- 开始游戏 ---------------- */
  function startLevel() {
    var lv = state.level;
    state.cooldown = {};
    lv.pool.forEach(function (id) { state.cooldown[id] = 0; });

    showScreen('game');
    $('#gameLevelName').textContent = lv.name;
    $('#gameLevelSub').textContent = lv.subtitle;
    $('#sunCount').textContent = lv.startSun;

    // 种子栏
    var bank = $('#seedbank');
    bank.innerHTML = '';
    state.chosen.forEach(function (id) {
      var p = D.PLANT_MAP[id];
      var el = document.createElement('div');
      el.className = 'seed';
      el.dataset.id = id;
      el.innerHTML = cardInner(p) + '<div class="cdmask"><i></i></div>';
      el.onclick = function () {
        if (state.cooldown[id] > 0) return;
        if (state.game.sun < p.cost) { toast('阳光不足'); return; }
        state.game.selectSeed(id);
        $$('.seed').forEach(function (s) { s.classList.toggle('sel', s.dataset.id === id); });
      };
      bank.appendChild(el);
    });

    // 进度条
    $('#progressFill').style.width = '0%';

    var host = $('#boardHost');
    if (state.game) state.game.destroy();
    state.game = global.PVZGame.create(host, lv, state.chosen, {
      onHUD: function (k, v) {
        if (k === 'sun') $('#sunCount').textContent = v;
        updateAffordability();
      },
      onProgress: function (i, n) {
        $('#progressFill').style.width = (i / n * 100) + '%';
      },
      onPlant: function (id, cost) {
        state.cooldown[id] = D.PLANT_MAP[id].cd;
        var seed = bank.querySelector('.seed[data-id="' + id + '"]');
        if (seed) seed.classList.add('cooling');
      },
      onSelectSeed: function (id) {
        if (!id) $$('.seed').forEach(function (s) { s.classList.remove('sel'); });
        updateAffordability();
      },
      onWin: function () { finish(true); },
      onLose: function () { finish(false); }
    });
    state.game.start();

    // 冷却循环
    clearInterval(state.cdTimer);
    var last = performance.now();
    state.cdTimer = setInterval(function () {
      var now = performance.now(), dt = (now - last) / 1000; last = now;
      var changed = false;
      for (var id in state.cooldown) {
        if (state.cooldown[id] > 0) {
          state.cooldown[id] = Math.max(0, state.cooldown[id] - dt);
          changed = true;
          var seed = bank.querySelector('.seed[data-id="' + id + '"]');
          if (seed) {
            var mask = seed.querySelector('.cdmask i');
            var p = D.PLANT_MAP[id];
            mask.style.height = (state.cooldown[id] / p.cd * 100) + '%';
            if (state.cooldown[id] === 0) seed.classList.remove('cooling');
          }
        }
      }
      if (changed) updateAffordability();
    }, 100);
  }

  function updateAffordability() {
    if (!state.game) return;
    $$('.seed').forEach(function (seed) {
      var id = seed.dataset.id, p = D.PLANT_MAP[id];
      var ok = state.game.sun >= p.cost && state.cooldown[id] <= 0;
      seed.classList.toggle('poor', !ok);
    });
  }

  function finish(win_) {
    var lv = state.level;
    var ov = $('#overlay');
    ov.querySelector('.ov-title').textContent = win_ ? '关卡通过！' : '僵尸吃掉了你的脑子…';
    ov.querySelector('.ov-title').className = 'ov-title ' + (win_ ? 'win' : 'lose');
    ov.querySelector('.ov-text').textContent = win_
      ? '你守住了「' + lv.name + '」，二次元少女们大获全胜！'
      : '再来一次吧，调整阵型与植物搭配会更容易取胜。';
    ov.classList.add('show');
  }

  /* ---------------- 图鉴 ---------------- */
  function renderAlmanac() {
    var wrap = $('#almanacGrid');
    wrap.innerHTML = '';
    D.PLANTS.forEach(function (p) {
      var c = document.createElement('div');
      c.className = 'al-card';
      c.innerHTML =
        '<div class="al-pic"><img src="' + p.portrait + '" alt="" onerror="this.remove()"><div class="svgwrap">' + global.AnimeSprites.chibi(p.look) + '</div></div>' +
        '<div class="al-info"><h4>' + p.name + ' <small>' + p.en + '</small></h4>' +
        '<div class="al-origin">原型：' + p.origin + ' · ' + p.tag + '</div>' +
        '<div class="al-stats"><span>阳光 ' + p.cost + '</span><span>冷却 ' + p.cd + 's</span></div>' +
        '<p>' + p.desc + '</p></div>';
      wrap.appendChild(c);
    });
    var zwrap = $('#almanacZombies');
    zwrap.innerHTML = '<h3 class="sec-title">僵尸图鉴</h3>';
    var zg = document.createElement('div');
    zg.className = 'al-grid';
    Object.keys(D.ZOMBIES).forEach(function (k) {
      var z = D.ZOMBIES[k];
      var c = document.createElement('div');
      c.className = 'al-card small';
      c.innerHTML = '<div class="al-pic small"><div class="svgwrap">' + global.AnimeSprites.chibi(z.look) + '</div>' + (z.hat ? '<div class="hat">' + z.hat + '</div>' : '') + '</div>' +
        '<div class="al-info"><h4>' + z.name + (z.isNew ? ' <span class="badge mini">新增</span>' : '') + '</h4>' +
        '<div class="al-stats"><span>血量 ' + z.hp + '</span><span>速度 ' + z.speed + '</span></div></div>';
      zg.appendChild(c);
    });
    zwrap.appendChild(zg);
  }

  /* ---------------- 弹窗/提示 ---------------- */
  function openModal(html) {
    var m = $('#modal');
    m.querySelector('.modal-body').innerHTML = html;
    m.classList.add('show');
  }
  function closeModal() { $('#modal').classList.remove('show'); }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1400);
  }

  /* ---------------- 初始化 ---------------- */
  // 供页面在解析阶段（首帧前）直接进入某界面 / 直接开局
  window.PVZApp = window.PVZApp || {};
  window.PVZApp.autoStart = function (pid, ps, demo) {
    var lv = D.LEVELS.filter(function (x) { return x.id === pid; })[0];
    if (!lv) return false;
    state.level = lv;
    state.chosen = ps ? ps.split(',').filter(function (i) { return D.PLANT_MAP[i]; }) : lv.pool.slice(0, lv.slots);
    startLevel();
    if (demo) {
      setTimeout(function () {
        var g = state.game;
        [['sunshroom', 1, 0], ['sunshroom', 3, 0], ['snowpea', 0, 2], ['snowpea', 2, 2],
        ['snowpea', 4, 2], ['melonpult', 1, 4], ['chomper', 3, 4], ['spikeweed', 2, 6]].forEach(function (t) {
          if (g && g.canPlant(t[1], t[2])) g.plantAt(D.PLANT_MAP[t[0]], t[1], t[2]);
        });
      }, 60);
    }
    return true;
  };

  function init() {
    renderLevels();
    renderAlmanac();
    $('#btnStart').onclick = function () { showScreen('levels'); };
    $('#btnAlmanac').onclick = function () { showScreen('almanac'); };
    $('#almanacBack').onclick = function () { showScreen('levels'); };
    $('#pickerBack').onclick = function () { showScreen('levels'); };
    $('#pickerGo').onclick = function () { if (state.chosen.length) startLevel(); };
    $('#gameQuit').onclick = function () {
      if (state.game) { state.game.destroy(); state.game = null; }
      clearInterval(state.cdTimer);
      showScreen('levels');
    };
    $('#overlayRetry').onclick = function () { $('#overlay').classList.remove('show'); startLevel(); };
    $('#overlayBack').onclick = function () {
      $('#overlay').classList.remove('show');
      if (state.game) { state.game.destroy(); state.game = null; }
      clearInterval(state.cdTimer);
      showScreen('levels');
    };
    $('#modalClose').onclick = closeModal;
    $('#modal').onclick = function (e) { if (e.target.id === 'modal') closeModal(); };

    if (!window.__pvzHandled) showScreen('title');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
