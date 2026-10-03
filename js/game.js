/* =========================================================
 *  二次元植物大战僵尸 · 战斗引擎
 *  DOM + CSS 渲染，requestAnimationFrame 驱动
 * ========================================================= */
(function (global) {
  'use strict';

  var CELL_W = 78, CELL_H = 96, ROWS = 5, COLS = 9, MOWER_W = 56;
  var BOARD_W = MOWER_W + COLS * CELL_W;   // 758
  var BOARD_H = ROWS * CELL_H;             // 480

  function colX(c) { return MOWER_W + c * CELL_W; }
  function rowY(r) { return r * CELL_H; }
  function cx(c) { return MOWER_W + c * CELL_W + CELL_W / 2; }
  function cy(r) { return r * CELL_H + CELL_H / 2; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var D = null; // PVZData

  function el(tag, cls, html) {
    var e = document.createElement(tag || 'div');
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function spritesData(def, usePortrait) {
    var svg = global.AnimeSprites.chibi(def.look);
    var h = '<div class="svgwrap">' + svg + '</div>';
    if (usePortrait && def.portrait) {
      h += '<img class="portrait" src="' + def.portrait + '" alt="" onerror="this.remove()">';
    }
    return h;
  }

  function createGame(container, level, chosen, cb) {
    D = global.PVZData;
    var usePortrait = !global.PVZ_CONFIG || global.PVZ_CONFIG.usePortraits !== false;

    var G = {
      level: level, chosen: chosen, cb: cb || {}, over: false,
      t: 0, sun: level.startSun, status: 'playing',
      plants: [], zombies: [], projs: [], suns: [], mowers: [],
      grid: [], spawnIdx: 0, waves: level.waves.slice(),
      sunTimer: rnd(5, 8), lastFrame: 0, hud: { sun: -1, prog: -1 }, ready: false
    };

    /* ---------- 构建 DOM ---------- */
    container.innerHTML = '';
    var board = el('div', 'board theme-' + (level.theme || 'day'));
    board.style.width = BOARD_W + 'px';
    board.style.height = BOARD_H + 'px';

    // 背景行
    var lanes = el('div', 'lanes');
    for (var r = 0; r < ROWS; r++) {
      var lane = el('div', 'lane');
      for (var c = 0; c < COLS; c++) {
        var cell = el('div', 'cell');
        // 墓碑
        if (level.tombstone) {
          var isTomb = false;
          var tc = level.tombstone.cols;
          if (tc.indexOf(c) >= 0) {
            if (!G._tomb) G._tomb = {};
            var key = r + '_' + c;
            if (G._tombSeed == null) G._tombSeed = Math.random();
            // 用稳定伪随机决定
            var seedv = (Math.sin((r + 1) * 12.9898 + (c + 1) * 78.233) * 43758.5453) % 1;
            seedv = Math.abs(seedv);
            if (seedv < level.tombstone.count / (ROWS * tc.length)) isTomb = true;
          }
          if (isTomb) { cell.classList.add('tomb'); cell.innerHTML = '<div class="tomb-svg"></div>'; G._tombUsed = true; }
        }
        lane.appendChild(cell);
      }
      lanes.appendChild(lane);
    }
    board.appendChild(lanes);

    var mowerLayer = el('div', 'layer mowers');
    var entLayer = el('div', 'layer entities');
    var prjLayer = el('div', 'layer projectiles');
    var sunLayer = el('div', 'layer suns');
    var banner = el('div', 'banner');
    var grid = el('div', 'hitgrid');
    board.appendChild(mowerLayer);
    board.appendChild(entLayer);
    board.appendChild(prjLayer);
    board.appendChild(sunLayer);
    board.appendChild(banner);

    // 点击网格（占位/种植）
    var hoverGhost = el('div', 'place-ghost');
    hoverGhost.style.display = 'none';
    board.appendChild(hoverGhost);

    // 记录占位（墓碑）
    var blocked = {};
    Array.prototype.forEach.call(lanes.querySelectorAll('.cell'), function (cell2, i) {
      var rr = Math.floor(i / COLS), cc = i % COLS;
      if (cell2.classList.contains('tomb')) blocked[rr + '_' + cc] = true;
    });
    G.blocked = blocked;

    // 交互网格
    for (var r2 = 0; r2 < ROWS; r2++) {
      for (var c2 = 0; c2 < COLS; c2++) {
        (function (rr, cc) {
          var hc = el('div', 'hcell');
          hc.style.cssText = 'position:absolute;left:' + colX(cc) + 'px;top:' + rowY(rr) + 'px;width:' + CELL_W + 'px;height:' + CELL_H + 'px;';
          hc.dataset.r = rr; hc.dataset.c = cc;
          hc.addEventListener('mouseenter', function () {
            if (!G.sel) return;
            hoverGhost.style.display = 'block';
            hoverGhost.style.left = colX(cc) + 'px';
            hoverGhost.style.top = rowY(rr) + 'px';
            hoverGhost.classList.toggle('bad', !canPlant(rr, cc));
          });
          hc.addEventListener('mouseleave', function () { hoverGhost.style.display = 'none'; });
          hc.addEventListener('click', function () { tryPlant(rr, cc); });
          grid.appendChild(hc);
        })(r2, c2);
      }
    }
    board.appendChild(grid);
    container.appendChild(board);
    G.board = board;
    G.entLayer = entLayer; G.prjLayer = prjLayer; G.sunLayer = sunLayer; G.mowerLayer = mowerLayer;
    G.bannerEl = banner;

    /* ---------- 小推车 ---------- */
    for (var mr = 0; mr < ROWS; mr++) {
      var m = { row: mr, x: 6, used: false, running: false, el: el('div', 'mower', '<svg viewBox="0 0 40 46"><rect x="6" y="14" width="28" height="18" rx="5" fill="#c9d2dc" stroke="#8d99a6" stroke-width="3"/><rect x="2" y="8" width="30" height="6" rx="3" fill="#e05a3a"/><circle cx="12" cy="34" r="6" fill="#4a4a55"/><circle cx="28" cy="34" r="6" fill="#4a4a55"/><circle cx="12" cy="34" r="2" fill="#9aa4b0"/><circle cx="28" cy="34" r="2" fill="#9aa4b0"/></svg>') };
      m.el.style.top = (rowY(mr) + CELL_H - 46) + 'px';
      m.el.style.left = m.x + 'px';
      mowerLayer.appendChild(m.el);
      G.mowers.push(m);
    }

    /* ---------- 外部 API ---------- */
    G.selectSeed = function (id) {
      if (G.over) return;
      G.sel = id;
      var def = D.PLANT_MAP[id];
      if (G.cb.onSelectSeed) G.cb.onSelectSeed(id);
    };
    G.cancelSeed = function () { G.sel = null; if (G.cb.onSelectSeed) G.cb.onSelectSeed(null); };

    function canPlant(r, c) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
      if (G.blocked[r + '_' + c]) return false;
      if (G.grid[r] && G.grid[r][c]) return false;
      return true;
    }
    G.canPlant = canPlant;

    function tryPlant(r, c) {
      if (G.over || !G.sel) return;
      var def = D.PLANT_MAP[G.sel];
      if (!def) return;
      if (!canPlant(r, c)) { flash('这里不能种'); return; }
      if (G.cb.getCooldown && G.cb.getCooldown(G.sel) > 0) { flash('冷却中'); return; }
      if (G.sun < def.cost) { flash('阳光不足'); return; }
      G.sun -= def.cost;
      if (G.cb.onPlant) G.cb.onPlant(G.sel, def.cost);
      plantAt(def, r, c);
      G.sel = null;
      hoverGhost.style.display = 'none';
      if (G.cb.onSelectSeed) G.cb.onSelectSeed(null);
      updateHUD(true);
    }
    G.tryPlant = tryPlant;

    /* ---------- 种植 ---------- */
    function plantAt(def, r, c) {
      if (!G.grid[r]) G.grid[r] = [];
      var p = { def: def, row: r, col: c, hp: def.hp, maxHp: def.hp, t: 0, dead: false, chewing: 0, armed: false, bombed: false };
      p.el = el('div', 'ent plant kind-' + def.kind, spritesData(def, usePortrait));
      p.el.style.left = colX(c) + 'px';
      p.el.style.top = rowY(r) + 'px';
      p.el.dataset.id = def.id;
      p.el.appendChild(el('div', 'hpbar', '<i style="width:100%"></i>'));
      entLayer.appendChild(p.el);
      p.el.classList.add('planted');
      G.grid[r][c] = p;
      G.plants.push(p);
      // 一次性植物
      if (def.kind === 'instant') { p.fuse = def.instant.fuse; }
      if (def.kind === 'mine') { p.armT = def.mine.arm; }
      return p;
    }
    G.plantAt = plantAt;

    /* ---------- 阳光 ---------- */
    function spawnSun(x, y, amount, vy) {
      var s = { x: x, y: y, amount: amount, vy: vy, target: y, t: 0, collected: false };
      s.el = el('div', 'sun', '<span>' + amount + '</span>');
      s.el.style.left = x + 'px'; s.el.style.top = y + 'px';
      s.el.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (s.collected) return;
        s.collected = true;
        G.sun += s.amount;
        s.el.classList.add('collected');
        setTimeout(function () { s.el.remove(); }, 300);
        updateHUD(true);
      });
      sunLayer.appendChild(s.el);
      G.suns.push(s);
      return s;
    }
    G.spawnSun = spawnSun;

    function updateHUD(force) {
      if (G.cb.onHUD) {
        if (force || G.hud.sun !== G.sun) { G.hud.sun = G.sun; G.cb.onHUD('sun', G.sun); }
      }
    }

    function flash(msg) {
      var f = el('div', 'flash', msg);
      board.appendChild(f);
      setTimeout(function () { f.remove(); }, 900);
    }

    function banner(text, cls) {
      banner.innerHTML = '<div class="banner-inner ' + (cls || '') + '">' + text + '</div>';
      banner.classList.add('show');
      setTimeout(function () { banner.classList.remove('show'); }, 2200);
    }

    /* ---------- 伤害 & 爆炸 ---------- */
    function damageZombie(z, dmg, opt) {
      if (z.dead) return;
      z.hp -= dmg;
      z.hit = 0.12;
      if (z.hp <= 0) { killZombie(z); }
      else {
        if (opt && opt.slow) z.slowT = 3;
        if (z.def.enrage && z.hp <= z.def.enrage.hp) z.rage = true;
        bar(z);
      }
    }
    G.damageZombie = damageZombie;

    function killZombie(z) {
      z.dead = true;
      z.el.classList.add('dying');
      setTimeout(function () { z.el.remove(); }, 420);
    }

    function bar(z) {
      if (!z.hpEl) return;
      var r = Math.max(0, z.hp / z.def.hp);
      z.hpEl.style.width = (r * 100) + '%';
      z.hpEl.style.background = r > 0.6 ? '#6ee06e' : r > 0.3 ? '#f5d24a' : '#f26b6b';
    }

    function explode(x, y, radius, dmg, cls) {
      var e = el('div', 'boom ' + (cls || ''), '');
      e.style.left = (x - radius) + 'px'; e.style.top = (y - radius) + 'px';
      e.style.width = radius * 2 + 'px'; e.style.height = radius * 2 + 'px';
      prjLayer.appendChild(e);
      setTimeout(function () { e.remove(); }, 460);
      G.zombies.forEach(function (z) {
        if (z.dead) return;
        var zx = z.x + 22, zy = cy(z.row);
        if (Math.hypot(zx - x, zy - y) <= radius + 14) damageZombie(z, dmg);
      });
    }
    G.explode = explode;

    function torched(x, y, w) {
      var e = el('div', 'fireline');
      e.style.left = MOWER_W + 'px'; e.style.top = (y - 30) + 'px';
      e.style.width = w + 'px';
      prjLayer.appendChild(e);
      setTimeout(function () { e.remove(); }, 600);
    }

    /* ---------- 僵尸 ---------- */
    function spawnZombie(type, row) {
      var def = D.ZOMBIES[type];
      if (!def) return;
      var z = {
        def: def, row: row, x: BOARD_W + rnd(10, 60), hp: def.hp, t: 0,
        slowT: 0, freezeT: 0, dead: false, vaulted: false, smashCd: 0, summonT: 4, shootT: 0, metal: !!def.metal
      };
      z.el = el('div', 'ent zombie z-' + type, '<div class="svgwrap">' + global.AnimeSprites.chibi(def.look) + '</div>');
      if (def.hat) z.el.appendChild(el('div', 'hat', def.hat));
      z.el.appendChild(el('div', 'zhpbar', '<i></i>'));
      z.hpEl = z.el.querySelector('.zhpbar i');
      z.el.style.top = rowY(row) + 'px';
      z.el.style.left = z.x + 'px';
      if (def.big) z.el.classList.add('big');
      entLayer.appendChild(z.el);
      G.zombies.push(z);
      return z;
    }
    G.spawnZombie = spawnZombie;

    /* ---------- 回合循环 ---------- */
    function step(dt) {
      G.t += dt;
      var spd = G.level.zombieSpeedMul || 1;

      /* 天降阳光 */
      if (G.level.skySun) {
        G.sunTimer -= dt;
        if (G.sunTimer <= 0) {
          G.sunTimer = rnd(8, 11);
          var sx = rnd(MOWER_W + 40, BOARD_W - 60);
          spawnSun(sx, -30, 25, 42);
        }
      }

      /* 波次调度 */
      while (G.spawnIdx < G.waves.length && G.t >= G.waves[G.spawnIdx].at) {
        var w = G.waves[G.spawnIdx];
        var row = Math.floor(Math.random() * ROWS);
        spawnZombie(w.type, row);
        if (w.flag) banner('一大波僵尸来袭！', 'warn');
        G.spawnIdx++;
        updateHUD(true);
        if (G.cb.onProgress) G.cb.onProgress(G.spawnIdx, G.waves.length);
      }

      /* 植物 */
      G.plants.forEach(function (p) {
        if (p.dead) return;
        p.t += dt;
        var d = p.def;
        if (d.kind === 'produce') {
          var itv = d.produce.interval;
          var amt = d.produce.amount;
          if (d.produce.growAt && p.t >= d.produce.growAt) { amt = d.produce.growAmount; p.el.classList.add('grown'); }
          if (p.t >= itv) { p.t = 0; spawnSun(cx(p.col) + rnd(-14, 14), cy(p.row) - 6, amt, 24); }
        }
        if (d.kind === 'shoot' || d.kind === 'lob') {
          var rows = d.kind === 'lob' ? [p.row] : (d.shoot.rows === 3 ? [p.row - 1, p.row, p.row + 1] : [p.row]);
          var anyTarget = rows.some(function (rr) { return rr >= 0 && rr < ROWS && rowHasZombie(rr, cx(p.col)); });
          if (anyTarget && p.t >= (d.kind === 'lob' ? d.lob.interval : d.shoot.interval)) {
            p.t = 0;
            p.el.classList.add('attacking');
            setTimeout(function () { p.el.classList.remove('attacking'); }, 180);
            rows.forEach(function (rr) {
              if (rr < 0 || rr >= ROWS) return;
              if (d.kind === 'lob') {
                fireLob(p, rr, d.lob);
              } else {
                var cnt = d.shoot.count || 1;
                for (var i = 0; i < cnt; i++) {
                  setTimeout(function () { if (!p.dead) firePea(p, rr, d.shoot); }, i * 130);
                }
              }
            });
          }
        }
        if (d.kind === 'mine') {
          p.armT -= dt;
          if (p.armT <= 0 && !p.armed) { p.armed = true; p.el.classList.add('armed'); }
          if (p.armed) {
            var zz = frontZombie(p.row, colX(p.col) - 6, colX(p.col) + CELL_W);
            if (zz) { explode(cx(p.col), cy(p.row), 88, d.mine.dmg, 'big'); removePlant(p); }
          }
        }
        if (d.kind === 'spike') {
          G.zombies.forEach(function (z) {
            if (z.dead) return;
            if (z.row === p.row && z.x + 22 > colX(p.col) - 6 && z.x + 22 < colX(p.col) + CELL_W + 6) {
              damageZombie(z, d.spike.dps * dt);
            }
          });
        }
        if (d.kind === 'magnet') {
          if (p.t >= d.magnet.interval) {
            p.t = 0;
            var tz = G.zombies.filter(function (z) { return !z.dead && z.metal && Math.abs(z.row - p.row) <= 1 && z.x > colX(p.col) && z.x < colX(p.col) + d.magnet.range * CELL_W; })[0];
            if (tz) {
              tz.metal = false;
              if (tz.def.isNew ? false : true) { /* noop */ }
              tz.hp = Math.min(tz.hp, 270);
              if (tz.el.querySelector('.hat')) tz.el.querySelector('.hat').classList.add('gone');
              bar(tz);
              p.el.classList.add('attacking');
              setTimeout(function () { p.el.classList.remove('attacking'); }, 240);
            }
          }
        }
        if (d.kind === 'chomp') {
          if (p.chewing > 0) { p.chewing -= dt; p.el.classList.add('chewing'); }
          else {
            p.el.classList.remove('chewing');
            var tz2 = frontZombie(p.row, cx(p.col), cx(p.col) + d.chomp.range * CELL_W, true);
            if (tz2) { damageZombie(tz2, 99999); p.chewing = d.chomp.chew; }
          }
        }
        if (d.kind === 'instant') {
          p.fuse -= dt;
          if (p.fuse <= 0) {
            if (d.instant.mode === 'aoe3') explode(cx(p.col), cy(p.row), 118, d.instant.dmg, 'big');
            else { torched(cx(0), cy(p.row), BOARD_W - MOWER_W); G.zombies.forEach(function (z) { if (!z.dead && z.row === p.row) damageZombie(z, d.instant.dmg); }); }
            removePlant(p);
          }
        }
        if (d.kind === 'cannon') {
          if (p.t >= d.cannon.interval) {
            p.t = 0;
            var target = densestCluster(d.cannon.aoe);
            if (target) {
              p.el.classList.add('attacking');
              setTimeout(function () { p.el.classList.remove('attacking'); }, 260);
              fireCannon(p, target.x, target.y, d.cannon);
            }
          }
        }
      });

      /* 弹道 */
      G.projs.forEach(function (pr) {
        if (pr.dead) return;
        if (pr.type === 'arc') {
          pr.t += dt;
          var k = Math.min(1, pr.t / pr.dur);
          pr.x = pr.x0 + (pr.x1 - pr.x0) * k;
          pr.y = pr.y0 + (pr.y1 - pr.y0) * k - Math.sin(Math.PI * k) * pr.arc;
          pr.el.style.left = pr.x + 'px';
          pr.el.style.top = pr.y + 'px';
          pr.el.style.transform = 'rotate(' + (k * 540) + 'deg)';
          if (k >= 1) {
            pr.dead = true; pr.el.remove();
            if (pr.splash) {
              // 溅射
              pr.el2 = pr.el2;
              explode(pr.x1, pr.y1, pr.splashR, pr.splash, 'splash');
              G.zombies.forEach(function (z) {
                if (z.dead) return;
                if (Math.abs(z.x + 22 - pr.x1) <= pr.splashR + 40 && Math.abs(cy(z.row) - pr.y1) <= 70) damageZombie(z, pr.dmg * 0.7);
              });
            } else {
              explode(pr.x1, pr.y1, pr.radius, pr.dmg, 'big');
            }
          }
        } else {
          pr.x += pr.vx * dt;
          pr.el.style.left = pr.x + 'px';
          if (pr.x > BOARD_W + 20) { pr.dead = true; pr.el.remove(); return; }
          var hit = null;
          G.zombies.forEach(function (z) {
            if (hit || z.dead) return;
            if (z.row !== pr.row) return;
            if (pr.x >= z.x + 4 && pr.x <= z.x + 46) hit = z;
          });
          if (hit) {
            pr.dead = true; pr.el.remove();
            damageZombie(hit, pr.dmg, pr.kind === 'ice' ? { slow: true } : null);
          }
        }
      });

      /* 僵尸 */
      G.zombies.forEach(function (z) {
        if (z.dead) return;
        z.t += dt;
        if (z.hit > 0) { z.hit -= dt; z.el.classList.toggle('hit', z.hit > 0); }

        var speed = z.def.speed * spd;
        if (z.rage) speed *= z.def.enrage.mul;
        if (z.slowT > 0) { z.slowT -= dt; speed *= 0.5; z.el.classList.add('slow'); }
        else z.el.classList.remove('slow');

        // 远程僵尸（花魁）
        var acted = false;
        if (z.def.ranged) {
          var front = frontPlant(z.row, z.x);
          if (front && (front.colX - z.x) <= z.def.ranged.range * CELL_W) {
            acted = true;
            z.shootT -= dt;
            z.el.classList.add('attacking');
            if (z.shootT <= 0) {
              z.shootT = z.def.ranged.interval;
              var pl = plantAtPixel(z.row, z.x - 10);
              if (pl) { pl.hp -= z.def.ranged.dmg; pbar(pl); if (pl.hp <= 0) removePlant(pl); }
            }
          } else z.el.classList.remove('attacking');
        }

        // 舞王召唤
        if (z.def.summon) {
          z.summonT -= dt;
          if (z.summonT <= 0) {
            z.summonT = z.def.summon.interval;
            for (var i = 0; i < z.def.summon.count; i++) {
              var rr = Math.max(0, Math.min(ROWS - 1, z.row + (i === 0 ? -1 : 1)));
              var nz = spawnZombie('normal', rr);
              nz.x = z.x + 30; nz.el.style.left = nz.x + 'px';
            }
          }
        }

        if (!acted && z.smashCd <= 0) {
          // 啃食/砸击
          var target = plantAtPixel(z.row, z.x + 8);
          if (target && target.def.kind !== 'spike') {
            if (z.def.vault && !z.vaulted) {
              // 撑杆跳
              z.vaulted = true;
              z.el.classList.add('vault');
              z.x -= CELL_W * 1.15;
              setTimeout(function () { z.el.classList.remove('vault'); }, 500);
            } else if (z.def.smash) {
              // 巨人一击必杀
              removePlant(target);
              z.smashCd = 1.6;
              z.el.classList.add('smash');
              setTimeout(function () { z.el.classList.remove('smash'); }, 380);
            } else {
              acted = true;
              z.el.classList.add('eating');
              target.hp -= z.def.dmg * dt;
              pbar(target);
              if (target.hp <= 0) { removePlant(target); z.el.classList.remove('eating'); }
            }
          } else {
            z.el.classList.remove('eating');
          }
        } else if (z.smashCd > 0) { z.smashCd -= dt; z.el.classList.remove('eating'); }

        if (!acted) {
          z.x -= speed * dt;
          z.el.style.left = z.x + 'px';
          z.el.style.top = rowY(z.row) + 'px';
        }

        // 到达左侧 → 小推车
        if (z.x <= MOWER_W + 4) {
          var mw = G.mowers[z.row];
          if (mw && !mw.used) {
            mw.used = true; mw.running = true;
            mw.el.classList.add('run');
          } else if (!mw || !mw.running) {
            lose();
          }
        }
      });

      /* 小推车运行 */
      G.mowers.forEach(function (mw) {
        if (!mw.running) return;
        mw.x += 520 * dt;
        mw.el.style.left = mw.x + 'px';
        G.zombies.forEach(function (z) {
          if (!z.dead && z.row === mw.row && z.x < mw.x + 40 && z.x > mw.x - 40) damageZombie(z, 99999);
        });
        if (mw.x > BOARD_W) { mw.running = false; mw.el.style.opacity = '.25'; }
      });

      /* 阳光下落 */
      G.suns.forEach(function (s) {
        if (s.collected) return;
        s.t += dt;
        if (s.vy > 0) {
          s.y += s.vy * dt;
          if (s.y >= s.target && s.target > 0) s.vy = 0;
          else if (s.target < 0 && s.y > rnd(120, 380)) s.vy = 0;
          if (s.y > BOARD_H - 70) s.vy = 0;
          s.el.style.top = s.y + 'px';
        }
      });

      // 清理
      G.zombies = G.zombies.filter(function (z) { return !z.dead; });
      G.projs = G.projs.filter(function (p) { return !p.dead; });
      G.plants = G.plants.filter(function (p) { return !p.dead; });
      G.suns = G.suns.filter(function (s) { return !s.collected; });

      // 胜利
      if (!G.over && G.spawnIdx >= G.waves.length && G.zombies.length === 0 && G.t > G.waves[G.waves.length - 1].at + 1) {
        win();
      }
    }

    /* ---------- 辅助 ---------- */
    function rowHasZombie(row, fromX) {
      return G.zombies.some(function (z) { return !z.dead && z.row === row && z.x + 40 > fromX - 10; });
    }
    function frontZombie(row, x0, x1, aheadOnly) {
      var best = null;
      G.zombies.forEach(function (z) {
        if (z.dead || z.row !== row) return;
        var zx = z.x + 22;
        if (zx >= x0 - 20 && zx <= x1 + 20) { if (!best || zx < best.x) best = z; }
      });
      return best;
    }
    function plantAtPixel(row, px) {
      if (!G.grid[row]) return null;
      for (var c = 0; c < COLS; c++) {
        var p = G.grid[row][c];
        if (!p || p.dead) continue;
        if (px >= colX(c) && px <= colX(c) + CELL_W) return p;
      }
      return null;
    }
    function frontPlant(row, zx) {
      if (!G.grid[row]) return null;
      var best = null;
      for (var c = 0; c < COLS; c++) {
        var p = G.grid[row][c];
        if (!p || p.dead) continue;
        if (colX(c) + CELL_W < zx) { if (!best || colX(c) > colX(best.col)) best = p; }
      }
      return best ? { col: best.col, colX: colX(best.col) + CELL_W } : null;
    }
    function densestCluster(aoe) {
      var best = null, bestScore = 0;
      G.zombies.forEach(function (z) {
        if (z.dead) return;
        var sc = G.zombies.filter(function (o) { return !o.dead && Math.abs(o.x - z.x) < CELL_W * aoe && Math.abs(o.row - z.row) <= Math.floor(aoe); }).length;
        if (sc > bestScore) { bestScore = sc; best = { x: z.x + 22, y: cy(z.row) }; }
      });
      return best;
    }
    function pbar(p) {
      var bar2 = p.el.querySelector('.hpbar i');
      if (bar2) bar2.style.width = Math.max(0, p.hp / p.maxHp * 100) + '%';
    }
    function removePlant(p) {
      if (p.dead) return;
      p.dead = true;
      if (G.grid[p.row]) G.grid[p.row][p.col] = null;
      p.el.classList.add('dead');
      setTimeout(function () { p.el.remove(); }, 300);
    }
    G.removePlant = removePlant;

    function firePea(p, row, cfg) {
      var kind = cfg.slow ? 'ice' : 'pea';
      var pr = { type: 'pea', row: row, x: cx(p.col) + 16, y: cy(row) - 6, dmg: cfg.dmg, vx: 340, kind: kind, dead: false };
      // 火炬效果：同行前方有火炬树桩
      var torchCol = -1;
      if (G.grid[row]) {
        for (var c = p.col + 1; c < COLS; c++) {
          var tp = G.grid[row][c];
          if (tp && !tp.dead && tp.def.kind === 'torch') { torchCol = c; break; }
        }
      }
      if (torchCol >= 0) { pr.dmg *= 2; pr.kind = kind === 'ice' ? 'pea' : 'fire'; }
      pr.el = el('div', 'proj ' + pr.kind);
      pr.el.style.left = pr.x + 'px'; pr.el.style.top = pr.y + 'px';
      prjLayer.appendChild(pr.el);
      G.projs.push(pr);
    }

    function fireLob(p, row, cfg) {
      // 找到该行最近的僵尸作为落点
      var zs = G.zombies.filter(function (z) { return !z.dead && z.row === row && z.x > cx(p.col); }).sort(function (a, b) { return a.x - b.x; });
      var landX = zs.length ? zs[0].x + 22 : BOARD_W - 40;
      var pr = {
        type: 'arc', row: row, x0: cx(p.col), y0: cy(row) - 10, x1: landX, y1: cy(row) + 10,
        arc: 150, dur: Math.max(0.5, (landX - cx(p.col)) / 420), t: 0, dmg: cfg.dmg, splash: cfg.splash, splashR: cfg.splashR, dead: false,
        x: cx(p.col), y: cy(row)
      };
      pr.el = el('div', 'proj melon');
      prjLayer.appendChild(pr.el);
      G.projs.push(pr);
    }

    function fireCannon(p, tx, ty, cfg) {
      var pr = {
        type: 'arc', row: p.row, x0: cx(p.col), y0: cy(p.row) - 10, x1: tx, y1: ty,
        arc: 170, dur: Math.max(0.45, Math.hypot(tx - cx(p.col), ty - cy(p.row)) / 520), t: 0,
        dmg: cfg.dmg, radius: CELL_W * cfg.aoe, splash: 0, dead: false, x: cx(p.col), y: cy(p.row)
      };
      pr.el = el('div', 'proj corn');
      prjLayer.appendChild(pr.el);
      G.projs.push(pr);
    }

    function win() {
      G.over = true; G.status = 'win';
      if (G.cb.onWin) G.cb.onWin();
    }
    function lose() {
      if (G.over) return;
      G.over = true; G.status = 'lose';
      if (G.cb.onLose) G.cb.onLose();
    }
    G.lose = lose;

    /* ---------- 主循环 ---------- */
    function frame(ts) {
      if (G.destroyed) return;
      if (!G.lastFrame) G.lastFrame = ts;
      var dt = Math.min(0.05, (ts - G.lastFrame) / 1000);
      G.lastFrame = ts;
      if (!G.over) step(dt);
      G.raf = requestAnimationFrame(frame);
    }
    G.start = function () { G.raf = requestAnimationFrame(frame); };
    G.destroy = function () { G.destroyed = true; cancelAnimationFrame(G.raf); container.innerHTML = ''; };

    G.boardsize = { w: BOARD_W, h: BOARD_H };
    return G;
  }

  global.PVZGame = { create: createGame, CELL_W: CELL_W, CELL_H: CELL_H, ROWS: ROWS, COLS: COLS, MOWER_W: MOWER_W };
})(window);
