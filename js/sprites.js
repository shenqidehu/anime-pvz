/* =========================================================
 *  二次元植物大战僵尸 · 矢量角色精灵生成器 (SVG)
 *  纯内联 SVG，无外部依赖，保证 100% 加载成功（作为 AI 立绘的兜底）
 * ========================================================= */
(function (global) {
  'use strict';

  function shade(hex, amt) {
    var c = hex.replace('#', '');
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    var r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var SKIN = '#ffe3d2', SKIN_LINE = '#f0bda6';

  /* ---------- 眼睛 ---------- */
  function eyes(eyeColor) {
    function one(cx) {
      return (
        '<ellipse cx="' + cx + '" cy="47" rx="6.4" ry="7.8" fill="#ffffff"/>' +
        '<ellipse cx="' + cx + '" cy="48" rx="4.9" ry="6.4" fill="' + eyeColor + '"/>' +
        '<ellipse cx="' + cx + '" cy="50.4" rx="2.7" ry="3.6" fill="#2b2438"/>' +
        '<circle cx="' + (cx - 2) + '" cy="45" r="1.9" fill="#ffffff"/>' +
        '<circle cx="' + (cx + 1.8) + '" cy="52" r="1" fill="#ffffff" opacity=".8"/>'
      );
    }
    return '<g>' + one(39.5) + one(60.5) + '</g>' +
      '<path d="M33 38 q5 -3 10 -1" stroke="#4a3b52" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M57 37 q5 -2 10 1" stroke="#4a3b52" stroke-width="1.7" fill="none" stroke-linecap="round" opacity=".55"/>';
  }

  /* ---------- 发型 ---------- */
  function hair_(cfg) {
    var h = cfg.hair, h2 = shade(h, -26), style = cfg.hairStyle || 'twin';
    var back = '', front = '';
    // 后发
    if (style === 'long') {
      back = '<path d="M23 42 q-4 40 6 56 q6 -6 8 -20 q-8 -10 -6 -32 Z" fill="' + h2 + '"/>' +
        '<path d="M77 42 q4 40 -6 56 q-6 -6 -8 -20 q8 -10 6 -32 Z" fill="' + h2 + '"/>';
    } else if (style === 'twin') {
      back = '<path d="M18 46 q-12 6 -13 22 q-1 12 8 12 q7 0 8 -10 q1 -12 -3 -24 Z" fill="' + h2 + '"/>' +
        '<path d="M82 46 q12 6 13 22 q1 12 -8 12 q-7 0 -8 -10 q-1 -12 3 -24 Z" fill="' + h2 + '"/>';
    } else if (style === 'pony') {
      back = '<path d="M74 34 q20 6 22 26 q2 18 -10 22 q-4 -14 -2 -26 q-6 -14 -14 -16 Z" fill="' + h2 + '"/>';
    } else if (style === 'bob') {
      back = '<path d="M24 44 q-2 20 4 26 q10 4 22 4 q12 0 22 -4 q6 -6 4 -26 Z" fill="' + h2 + '"/>';
    }
    // 前发 / 刘海
    front = '<path d="M24 41 q2 -26 26 -26 q24 0 26 26 q-9 -12 -26 -12 q-17 0 -26 12 Z" fill="' + h + '"/>' +
      '<path d="M24 41 q-1 12 2 18 q5 -6 5 -16 Z" fill="' + h + '"/>' +
      '<path d="M76 41 q1 12 -2 18 q-5 -6 -5 -16 Z" fill="' + h + '"/>' +
      '<path d="M46 16 q8 -4 14 2 q-8 -1 -14 -2 Z" fill="' + shade(h, 34) + '" opacity=".8"/>';
    if (style === 'twin') {
      front += '<circle cx="20" cy="52" r="3.4" fill="' + (cfg.ribbon || '#ff6f91') + '"/>' +
        '<circle cx="80" cy="52" r="3.4" fill="' + (cfg.ribbon || '#ff6f91') + '"/>';
    }
    return { back: back, front: front };
  }

  /* ---------- 头顶配饰 ---------- */
  function accessory(kind, cfg) {
    var c = cfg.accent || '#ffd54a';
    switch (kind) {
      case 'leaf':
        return '<g transform="translate(50,12)"><path d="M0 0 q-9 -10 -3 -18 q7 5 3 18Z" fill="#6cc24a"/><path d="M0 0 q9 -10 3 -18 q-7 5 -3 18Z" fill="#57ad38"/></g>';
      case 'sun':
        return '<g transform="translate(50,10)">' + ring(7, '#ffcc33', '#ff9c00') + '</g>';
      case 'helmet':
        return '<g transform="translate(50,18)"><path d="M-16 6 a16 16 0 0 1 32 0 Z" fill="#c7ced8" stroke="#8d97a6" stroke-width="1.6"/><rect x="-17" y="5" width="34" height="3.4" rx="1.7" fill="#98a3b3"/></g>';
      case 'mine':
        return '<g transform="translate(50,12)"><circle r="5.5" fill="#4a4a55"/><path d="M0 -5 q6 -6 10 -3" stroke="#e0a850" stroke-width="1.8" fill="none"/><circle cx="10" cy="-8" r="2" fill="#ff8a3d"/></g>';
      case 'snow':
        return '<g transform="translate(50,11)" stroke="#bfe9ff" stroke-width="2" stroke-linecap="round">' +
          '<path d="M0 -7 V7 M-6 -3.5 L6 3.5 M6 -3.5 L-6 3.5"/></g>';
      case 'heart':
        return '<g transform="translate(50,10)"><path d="M0 6 C-9 0 -7 -7 -3 -7 C-0.6 -7 0 -5 0 -5 C0 -5 0.6 -7 3 -7 C7 -7 9 0 0 6Z" fill="#ff5f86"/></g>';
      case 'fang':
        return '<g transform="translate(50,12)"><path d="M0 -9 L-7 2 L7 2 Z" fill="#7b4bd6"/><path d="M-2 6 l2 4 l2 -4" fill="#fff"/></g>';
      case 'clover':
        return '<g transform="translate(50,11)"><circle cx="0" cy="-5" r="4.2" fill="#5cc45c"/><circle cx="-5" cy="2" r="4.2" fill="#4bb04b"/><circle cx="5" cy="2" r="4.2" fill="#4bb04b"/><rect x="-1" y="3" width="2" height="7" rx="1" fill="#3d8a3d"/></g>';
      case 'cherry':
        return '<g transform="translate(50,8)"><circle cx="-6" cy="8" r="6" fill="#e0374a"/><circle cx="6" cy="8" r="6" fill="#f4536a"/><path d="M-6 2 q2 -8 6 -9 M6 2 q0 -8 -6 -9" stroke="#4d8b3d" stroke-width="1.6" fill="none"/><ellipse cx="-8" cy="6" rx="1.6" ry="2.2" fill="#fff" opacity=".7"/></g>';
      case 'flame':
        return '<g transform="translate(50,12)"><path d="M0 -12 C6 -4 10 0 5 5 C2 8 -2 8 -5 5 C-10 0 -6 -4 0 -12Z" fill="#ff8a2b"/><path d="M0 -5 C3 -1 4 1 2 3 C1 4 -1 4 -2 3 C-4 1 -3 -1 0 -5Z" fill="#ffd84a"/></g>';
      case 'mushroom':
        return '<g transform="translate(50,16)"><path d="M-17 3 a17 13 0 0 1 34 0 Z" fill="#c47be0"/><circle cx="-8" cy="-2" r="2.6" fill="#fff"/><circle cx="5" cy="-4" r="3" fill="#fff"/><circle cx="12" cy="1" r="1.8" fill="#fff"/></g>';
      case 'thorn':
        return '<g transform="translate(50,10)" fill="#3f9142">' +
          '<path d="M0 -11 L-5 0 L5 0 Z"/><path d="M-13 -2 L-4 -2 L-4 7 Z"/><path d="M13 -2 L4 -2 L4 7 Z"/></g>';
      case 'magnet':
        return '<g transform="translate(50,11)"><path d="M-11 6 a11 11 0 0 1 22 0" stroke="#e0433f" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="-13.5" y="4" width="5" height="6" rx="1" fill="#dfe4ea"/><rect x="8.5" y="4" width="5" height="6" rx="1" fill="#9fb4c9"/></g>';
      case 'melon':
        return '<g transform="translate(50,13)"><path d="M-16 0 a16 16 0 0 1 32 0 Z" fill="#3fae4a"/><path d="M-13 0 a13 13 0 0 1 26 0 Z" fill="#f05b5b"/><circle cx="-5" cy="-2" r="1.6" fill="#2b2438"/><circle cx="3" cy="-1" r="1.6" fill="#2b2438"/><circle cx="9" cy="-3" r="1.4" fill="#2b2438"/></g>';
      case 'torch':
        return '<g transform="translate(50,13)"><path d="M0 -13 C7 -5 11 0 5 5 C2 8 -2 8 -5 5 C-11 0 -7 -5 0 -13Z" fill="#ff7a1a"/><path d="M0 -6 C4 -2 5 1 3 3 C2 4 -2 4 -3 3 C-5 1 -4 -2 0 -6Z" fill="#ffe066"/></g>';
      case 'corn':
        return '<g transform="translate(50,12)"><ellipse cx="0" cy="0" rx="7" ry="10" fill="#f6d34a"/><path d="M-7 -2 h14 M-7 2 h14 M-5 -6 q5 3 10 0" stroke="#d9ae2e" stroke-width="1.2" fill="none"/><path d="M-7 6 q-6 -2 -7 -9 q6 2 7 9Z" fill="#5aa84f"/></g>';
      default: return '';
    }
  }
  function ring(r, c1, c2) {
    var s = '';
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      s += '<line x1="0" y1="0" x2="' + (Math.cos(a) * r).toFixed(1) + '" y2="' + (Math.sin(a) * r).toFixed(1) + '" stroke="' + c2 + '" stroke-width="3" stroke-linecap="round"/>';
    }
    return s + '<circle r="6" fill="' + c1 + '"/>';
  }

  /* ---------- 手持道具 ---------- */
  function prop(kind, cfg) {
    var c = cfg.accent || '#ffd54a';
    switch (kind) {
      case 'pea-staff':
        return '<g transform="translate(72,74) rotate(18)"><rect x="-1.6" y="-30" width="3.2" height="46" rx="1.6" fill="#8a5a2b"/><ellipse cx="0" cy="-32" rx="6" ry="9" fill="#5fbf3a"/><circle cx="-3" cy="-33" r="2.6" fill="#9be06a"/><circle cx="3" cy="-30" r="2.3" fill="#9be06a"/></g>';
      case 'sun-staff':
        return '<g transform="translate(72,74) rotate(14)"><rect x="-1.6" y="-28" width="3.2" height="44" rx="1.6" fill="#c98f3f"/>' + '<g transform="translate(0,-32)">' + ring(8, '#ffcc33', '#ff9c00') + '</g></g>';
      case 'shield':
        return '<g transform="translate(24,78)"><path d="M0 -16 q10 4 0 20 q-10 -16 0 -20Z" fill="#a8703c" stroke="#8a5a2b" stroke-width="1.6"/><path d="M0 -12 q6 3 0 13 q-6 -10 0 -13Z" fill="#c98f56"/></g>';
      case 'mine-bomb':
        return '<g transform="translate(70,80)"><circle r="9" fill="#4a4a55"/><rect x="-3" y="-14" width="6" height="6" rx="2" fill="#6a6a78"/><path d="M0 -14 q5 -6 9 -3" stroke="#e0a850" stroke-width="1.6" fill="none"/><circle cx="9" cy="-17" r="2.4" fill="#ff8a3d"/></g>';
      case 'ice-staff':
        return '<g transform="translate(72,74) rotate(18)"><rect x="-1.6" y="-30" width="3.2" height="46" rx="1.6" fill="#8ec9e8"/><g transform="translate(0,-33)" stroke="#bfe9ff" stroke-width="2.4" stroke-linecap="round"><path d="M0 -8 V8 M-7 -4 L7 4 M7 -4 L-7 4"/></g></g>';
      case 'twin-staff':
        return '<g transform="translate(72,74) rotate(18)"><rect x="-1.6" y="-30" width="3.2" height="46" rx="1.6" fill="#7a9b3f"/><ellipse cx="-4" cy="-34" rx="5" ry="7" fill="#5fbf3a"/><ellipse cx="5" cy="-32" rx="5" ry="7" fill="#79d24f"/></g>';
      case 'chomp-fork':
        return '<g transform="translate(72,74) rotate(16)"><rect x="-1.6" y="-26" width="3.2" height="42" rx="1.6" fill="#7b4bd6"/><path d="M-5 -30 q5 -6 10 0" stroke="#c9a7ff" stroke-width="2.6" fill="none"/><path d="M-6 -26 l4 -8 l4 8 Z" fill="#c9a7ff"/></g>';
      case 'trident':
        return '<g transform="translate(72,72) rotate(16)"><rect x="-1.8" y="-26" width="3.6" height="46" rx="1.8" fill="#6f8f3a"/><path d="M-9 -30 v-6 M0 -32 v-8 M9 -30 v-6 M-9 -30 h18" stroke="#8fbf4f" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
      case 'bomb-ball':
        return '<g transform="translate(70,80)"><circle r="10" fill="#2f2b3a"/><path d="M2 -10 q4 -6 8 -3" stroke="#ffcf5c" stroke-width="2" fill="none"/><circle cx="10" cy="-13" r="2.6" fill="#ff8a3d"/><circle cx="-4" cy="-4" r="3" fill="#fff" opacity=".25"/></g>';
      case 'chili':
        return '<g transform="translate(71,82) rotate(-16)"><path d="M-4 -12 q8 4 6 14 q-2 -8 -10 -10Z" fill="#e13b3b"/><path d="M4 -12 q3 -4 6 -3" stroke="#4d8b3d" stroke-width="1.8" fill="none"/></g>';
      case 'mushroom-staff':
        return '<g transform="translate(72,74) rotate(16)"><rect x="-1.6" y="-24" width="3.2" height="42" rx="1.6" fill="#b98cd0"/><ellipse cx="0" cy="-28" rx="8" ry="6" fill="#c47be0"/><circle cx="-3" cy="-29" r="1.8" fill="#fff"/><circle cx="3" cy="-30" r="1.4" fill="#fff"/></g>';
      case 'spade':
        return '<g transform="translate(70,74) rotate(16)"><rect x="-1.6" y="-20" width="3.2" height="38" rx="1.6" fill="#5d3f2a"/><path d="M0 -34 q7 8 0 14 q-7 -6 0 -14Z" fill="#3f9142"/></g>';
      case 'magnet-prop':
        return '<g transform="translate(70,80)"><path d="M-10 6 a10 10 0 0 1 20 0" stroke="#e0433f" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="-12.5" y="4" width="5" height="6" rx="1" fill="#dfe4ea"/><rect x="7.5" y="4" width="5" height="6" rx="1" fill="#9fb4c9"/></g>';
      case 'melon-prop':
        return '<g transform="translate(70,80)"><circle r="10" fill="#3fae4a"/><path d="M-10 0 a10 10 0 0 0 20 0 Z" fill="#f05b5b"/><circle cx="-4" cy="3" r="1.5" fill="#2b2438"/><circle cx="3" cy="4" r="1.5" fill="#2b2438"/></g>';
      case 'torch-prop':
        return '<g transform="translate(70,76) rotate(14)"><rect x="-1.8" y="-8" width="3.6" height="26" rx="1.8" fill="#8a5a2b"/><path d="M0 -22 C6 -14 9 -10 4 -4 C2 -2 -2 -2 -4 -4 C-9 -10 -6 -14 0 -22Z" fill="#ff7a1a"/><path d="M0 -14 C4 -10 5 -7 3 -5 C2 -4 -2 -4 -3 -5 C-5 -7 -4 -10 0 -14Z" fill="#ffe066"/></g>';
      case 'corn-cannon':
        return '<g transform="translate(70,74) rotate(12)"><rect x="-4" y="-30" width="8" height="34" rx="4" fill="#8a9aa6"/><rect x="-7" y="-34" width="14" height="10" rx="3" fill="#5d6b76"/><ellipse cx="0" cy="-30" rx="4.4" ry="5" fill="#f6d34a"/></g>';
      default: return '';
    }
  }

  /**
   * 生成 chibi 角色 SVG
   * cfg: {hair, hairStyle, dress, accent, eye, ribbon, top(配饰), hold(道具), skin}
   */
  function chibi(cfg) {
    var hair = hair_(cfg);
    var dress = cfg.dress || '#7fd44f';
    var dress2 = shade(dress, -38);
    var d3 = shade(dress, 22);
    var legY = 88;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 122" width="100%" height="100%">' +
      '<ellipse cx="50" cy="117" rx="23" ry="4.6" fill="#000" opacity=".16"/>' +
      hair.back +
      // 腿 + 鞋
      '<rect x="41.5" y="' + legY + '" width="7" height="21" rx="3.5" fill="' + (cfg.skin || SKIN) + '"/>' +
      '<rect x="51.5" y="' + legY + '" width="7" height="21" rx="3.5" fill="' + (cfg.skin || SKIN) + '"/>' +
      '<ellipse cx="44" cy="110" rx="7" ry="4.6" fill="' + dress2 + '"/>' +
      '<ellipse cx="56" cy="110" rx="7" ry="4.6" fill="' + dress2 + '"/>' +
      // 裙装
      '<path d="M50 61 C33 61 27 73 24 96 Q50 102 76 96 C73 73 67 61 50 61 Z" fill="' + dress + '"/>' +
      '<path d="M50 61 C33 61 27 73 24 96 Q50 102 76 96 C73 73 67 61 50 61 Z" fill="none" stroke="' + dress2 + '" stroke-width="1.6"/>' +
      '<path d="M43 61 h14 l-3 10 h-8 Z" fill="' + shade(dress, 30) + '" opacity=".55"/>' +
      '<circle cx="50" cy="76" r="3" fill="' + (cfg.accent || '#ffd54a') + '"/>' +
      // 手臂
      '<path d="M34 70 q-9 12 -7 24" stroke="' + (cfg.skin || SKIN) + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M66 70 q9 12 7 24" stroke="' + (cfg.skin || SKIN) + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      // 头
      '<circle cx="50" cy="44" r="25" fill="' + (cfg.skin || SKIN) + '"/>' +
      '<circle cx="50" cy="44" r="25" fill="none" stroke="' + SKIN_LINE + '" stroke-width="1" opacity=".5"/>' +
      hair.front +
      eyes(cfg.eye || '#4fbf6a') +
      // 腮红 + 嘴
      '<ellipse cx="31" cy="55" rx="4.4" ry="2.6" fill="#ff9db0" opacity=".7"/>' +
      '<ellipse cx="69" cy="55" rx="4.4" ry="2.6" fill="#ff9db0" opacity=".7"/>' +
      '<path d="M46.5 57 q3.5 3.4 7 0" stroke="#c0576a" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
      accessory(cfg.top, cfg) +
      prop(cfg.hold, cfg) +
      '</svg>';
  }

  function dataUri(cfg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(chibi(cfg));
  }

  global.AnimeSprites = { chibi: chibi, dataUri: dataUri, shade: shade };
})(window);
