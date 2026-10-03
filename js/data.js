/* =========================================================
 *  二次元植物大战僵尸 · 数据层
 *  植物 / 僵尸 / 关卡 全部在此定义
 * ========================================================= */
(function (global) {
  'use strict';

  var P = 'assets/portraits/';

  /* ---------------- 植物（二次元形象 ⇄ 原版植物） ---------------- */
  var PLANTS = [
    {
      id: 'sunflower', name: '向日 葵', origin: '向日葵', en: 'Himawari', cost: 50, cd: 7.5, hp: 300,
      kind: 'produce', produce: { amount: 25, interval: 22 },
      look: { hair: '#ffd24a', hairStyle: 'long', dress: '#ffe066', accent: '#ffb300', eye: '#ff9a3d', top: 'leaf', hold: 'sun-staff' },
      tag: '阳光生产', desc: '元气的阳光少女。每隔一段时间产出 25 点阳光，是所有阵型的能量核心。'
    },
    {
      id: 'peashooter', name: '豌豆 咲', origin: '豌豆射手', en: 'Saki', cost: 100, cd: 7.5, hp: 300,
      kind: 'shoot', shoot: { dmg: 20, interval: 1.4, count: 1, rows: 1 },
      look: { hair: '#7ed957', hairStyle: 'twin', dress: '#8fe06a', accent: '#5fbf3a', eye: '#4fbf6a', top: 'leaf', hold: 'pea-staff' },
      tag: '直线射手', desc: '以豌豆荚法杖射出绿色弹丸，单体伤害，稳定输出的基础战力。'
    },
    {
      id: 'wallnut', name: '盾姬 胡桃', origin: '坚果墙', en: 'Kurumi', cost: 50, cd: 30, hp: 4000,
      kind: 'wall',
      look: { hair: '#c98f56', hairStyle: 'bob', dress: '#b3763f', accent: '#8a5a2b', eye: '#a8541f', top: 'helmet', hold: 'shield' },
      tag: '肉盾', desc: '身披硬壳铠甲的守护者，血量极高，为后排争取宝贵时间。'
    },
    {
      id: 'potatomine', name: '地雷娘 芋子', origin: '土豆雷', en: 'Imoko', cost: 25, cd: 30, hp: 300,
      kind: 'mine', mine: { dmg: 1800, arm: 14, aoe: 1 },
      look: { hair: '#a9814f', hairStyle: 'short', dress: '#6b5a44', accent: '#4a4a55', eye: '#6b6b78', top: 'mine', hold: 'mine-bomb' },
      tag: '埋雷', desc: '埋入土中 14 秒后武装完毕，任何踩上来的僵尸都会被瞬间炸飞。'
    },
    {
      id: 'snowpea', name: '冰室 雪', origin: '寒冰射手', en: 'Yuki', cost: 175, cd: 7.5, hp: 300,
      kind: 'shoot', shoot: { dmg: 20, interval: 1.4, count: 1, rows: 1, slow: true },
      look: { hair: '#bfe9ff', hairStyle: 'long', dress: '#cdeeff', accent: '#8ec9e8', eye: '#4aa6e0', top: 'snow', hold: 'ice-staff' },
      tag: '减速', desc: '射出寒冰弹丸，命中后使僵尸减速，是控场的关键。'
    },
    {
      id: 'repeater', name: '双叶 双子', origin: '双发射手', en: 'Futaba', cost: 200, cd: 7.5, hp: 300,
      kind: 'shoot', shoot: { dmg: 20, interval: 1.4, count: 2, rows: 1 },
      look: { hair: '#79d24f', hairStyle: 'twin', dress: '#6fc44a', accent: '#4f9e3a', eye: '#4fbf6a', top: 'heart', hold: 'twin-staff' },
      tag: '双发', desc: '一次射出两发豌豆，火力翻倍。'
    },
    {
      id: 'chomper', name: '吞噬姬 咲夜', origin: '大嘴花', en: 'Sakuya', cost: 150, cd: 7.5, hp: 300,
      kind: 'chomp', chomp: { chew: 42, range: 1.6 },
      look: { hair: '#b06be0', hairStyle: 'pony', dress: '#8f4bd6', accent: '#d8b4ff', eye: '#a24fd6', top: 'fang', hold: 'chomp-fork' },
      tag: '近战吞噬', desc: '一口吞下靠近的僵尸，但咀嚼需要 42 秒，需要队友掩护。'
    },
    {
      id: 'threepeater', name: '三叶 三叉', origin: '三线射手', en: 'Mitsuba', cost: 325, cd: 7.5, hp: 300,
      kind: 'shoot', shoot: { dmg: 20, interval: 1.4, count: 1, rows: 3 },
      look: { hair: '#6fbf4f', hairStyle: 'twin', dress: '#8fbf4f', accent: '#5f9e3a', eye: '#4fbf6a', top: 'clover', hold: 'trident' },
      tag: '三行齐射', desc: '同时向所在行及上下两行射击，一夫当关。'
    },
    {
      id: 'cherrybomb', name: '双子 樱&桃', origin: '樱桃炸弹', en: 'Sakura & Momo', cost: 150, cd: 50, hp: 300,
      kind: 'instant', instant: { mode: 'aoe3', dmg: 1800, fuse: 1.0 },
      look: { hair: '#ff6f91', hairStyle: 'twin', dress: '#e0374a', accent: '#ff5f86', eye: '#e04a6a', top: 'cherry', hold: 'bomb-ball' },
      tag: '范围爆发', desc: '引爆后清空 3×3 范围内的全部僵尸，一次性消耗品。'
    },
    {
      id: 'jalapeno', name: '焰巫女 唐辛', origin: '火爆辣椒', en: 'Karashi', cost: 125, cd: 50, hp: 300,
      kind: 'instant', instant: { mode: 'row', dmg: 1800, fuse: 1.0 },
      look: { hair: '#ff8a2b', hairStyle: 'pony', dress: '#e13b3b', accent: '#ffb300', eye: '#e0602b', top: 'flame', hold: 'chili' },
      tag: '整行焚烧', desc: '释放烈焰，焚烧同一条纵向通道上的所有僵尸。'
    },
    {
      id: 'sunshroom', name: '夜光菇娘 木灵', origin: '阳光菇', en: 'Korine', cost: 25, cd: 7.5, hp: 300,
      kind: 'produce', produce: { amount: 20, interval: 18, growAt: 34, growAmount: 25 },
      look: { hair: '#c47be0', hairStyle: 'bob', dress: '#b98cd0', accent: '#ffd54a', eye: '#a24fd6', top: 'mushroom', hold: 'mushroom-staff' },
      tag: '夜间阳光', desc: '夜间与墓地的阳光来源。初期只产 15 点，长大之后产量翻倍。'
    },
    {
      id: 'spikeweed', name: '荆棘娘 伊薔薇', origin: '地刺', en: 'Ibara', cost: 100, cd: 7.5, hp: 200,
      kind: 'spike', spike: { dps: 22 },
      look: { hair: '#3f9142', hairStyle: 'short', dress: '#4a7a44', accent: '#8fbf4f', eye: '#4f9e3a', top: 'thorn', hold: 'spade' },
      tag: '地面陷阱', desc: '铺满尖刺的地面，踩过的僵尸持续受伤，且不会被啃食。'
    },
    {
      id: 'magnetshroom', name: '磁力娘 玛格', origin: '磁力菇', en: 'Magne', cost: 100, cd: 7.5, hp: 300,
      kind: 'magnet', magnet: { interval: 5, range: 3 },
      look: { hair: '#e0433f', hairStyle: 'short', dress: '#6b7a8f', accent: '#e0433f', eye: '#e0433f', top: 'magnet', hold: 'magnet-prop' },
      tag: '吸附铁器', desc: '隔空吸走僵尸身上的铁桶、铁门、头盔等金属装备。'
    },
    {
      id: 'melonpult', name: '西瓜姬 澄华', origin: '西瓜投手', en: 'Sumika', cost: 300, cd: 7.5, hp: 300,
      kind: 'lob', lob: { dmg: 80, splash: 40, splashR: 90, interval: 3 },
      look: { hair: '#3fae4a', hairStyle: 'long', dress: '#2f8f3f', accent: '#f05b5b', eye: '#4fbf6a', top: 'melon', hold: 'melon-prop' },
      tag: '范围投掷', desc: '抛射西瓜，落地溅射伤害一片僵尸，无视前排阻挡。'
    },
    {
      id: 'torchwood', name: '焰树娘 火乃', origin: '火炬树桩', en: 'Hono', cost: 175, cd: 7.5, hp: 300,
      kind: 'torch',
      look: { hair: '#8a5a2b', hairStyle: 'short', dress: '#a8703c', accent: '#ff7a1a', eye: '#ff8a2b', top: 'torch', hold: 'torch-prop' },
      tag: '增益', desc: '穿过她的豌豆会被点燃，伤害翻倍（寒冰弹则会被解冻）。'
    },
    {
      id: 'cobcannon', name: '玉米炮姬 加音', origin: '玉米加农炮', en: 'Kanon', cost: 500, cd: 50, hp: 300,
      kind: 'cannon', cannon: { dmg: 1800, aoe: 1.5, interval: 6 },
      look: { hair: '#f6d34a', hairStyle: 'bob', dress: '#8a9aa6', accent: '#f6d34a', eye: '#e0a83d', top: 'corn', hold: 'corn-cannon' },
      tag: '重炮', desc: '自动装填的重炮，每隔 6 秒轰击僵尸最密集的区域，造成大范围爆炸伤害。'
    }
  ];

  var PLANT_MAP = {};
  PLANTS.forEach(function (p) { p.portrait = P + p.id + '.png'; PLANT_MAP[p.id] = p; });

  /* ---------------- 僵尸 ---------------- */
  function hat(svg) { return svg; }
  var ZOMBIES = {
    normal: {
      id: 'normal', name: '普通僵尸', hp: 270, speed: 22, dmg: 60,
      look: { hair: '#6d7f6a', hairStyle: 'short', dress: '#8ba086', skin: '#dcefdd', accent: '#b6d0b4', eye: '#415c41' }
    },
    conehead: {
      id: 'conehead', name: '路障僵尸', hp: 370, speed: 22, dmg: 60, metal: false,
      look: { hair: '#7d6a52', hairStyle: 'short', dress: '#9b8672', skin: '#dcefdd', accent: '#e0a95e', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><path d="M50 4 L30 52 H70 Z" fill="#f0a03c" stroke="#c97c22" stroke-width="3"/><path d="M34 40 h32 M40 26 h20" stroke="#c97c22" stroke-width="3"/></svg>')
    },
    buckethead: {
      id: 'buckethead', name: '铁桶僵尸', hp: 1370, speed: 21, dmg: 60, metal: true,
      look: { hair: '#6a6a7a', hairStyle: 'short', dress: '#86909c', skin: '#dcefdd', accent: '#c3d2e0', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><path d="M18 54 V26 a32 24 0 0 1 64 0 V54 Z" fill="#c3ccd6" stroke="#8d99a6" stroke-width="3"/><rect x="14" y="50" width="72" height="8" rx="4" fill="#9fadba"/><path d="M30 34 q20 -10 40 0" stroke="#e8eef4" stroke-width="3" fill="none" opacity=".8"/></svg>')
    },
    pole: {
      id: 'pole', name: '撑杆跳僵尸', hp: 500, speed: 46, dmg: 60, vault: true,
      look: { hair: '#8f6a52', hairStyle: 'pony', dress: '#a3846b', skin: '#dcefdd', accent: '#edc780', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="26" ry="22" fill="#d9c07a" stroke="#b39a52" stroke-width="3"/><path d="M24 34 h52" stroke="#b39a52" stroke-width="3"/></svg>')
    },
    news: {
      id: 'news', name: '报纸僵尸', hp: 400, speed: 22, dmg: 60, enrage: { hp: 200, mul: 1.9 },
      look: { hair: '#5c5c6b', hairStyle: 'short', dress: '#a8a8b6', skin: '#dcefdd', accent: '#f2f2f7', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><rect x="16" y="14" width="68" height="36" rx="3" fill="#f2f2f0" stroke="#b9b9b0" stroke-width="2"/><path d="M24 22 h24 M24 30 h52 M24 38 h52 M24 44 h40" stroke="#a9a9a0" stroke-width="2.4"/></svg>')
    },
    football: {
      id: 'football', name: '橄榄球僵尸', hp: 1670, speed: 44, dmg: 70, metal: true,
      look: { hair: '#9c4d38', hairStyle: 'short', dress: '#b04d38', skin: '#dcefdd', accent: '#f2724f', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><path d="M18 50 q0 -30 32 -30 q32 0 32 30 Z" fill="#e0433f" stroke="#a82f2c" stroke-width="3"/><path d="M50 20 V50" stroke="#f2f2f2" stroke-width="4"/><rect x="14" y="46" width="72" height="8" rx="4" fill="#a82f2c"/></svg>')
    },
    screendoor: {
      id: 'screendoor', name: '铁门僵尸', hp: 1370, speed: 22, dmg: 60, metal: true,
      look: { hair: '#6a6a7a', hairStyle: 'short', dress: '#86909c', skin: '#dcefdd', accent: '#c3d2e0', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><rect x="18" y="6" width="52" height="50" rx="3" fill="#b9c4cf" stroke="#8d99a6" stroke-width="3"/><path d="M26 12 v38 M38 12 v38 M50 12 v38 M62 12 v38" stroke="#98a4b0" stroke-width="2"/></svg>')
    },
    dancer: {
      id: 'dancer', name: '舞王僵尸', hp: 500, speed: 26, dmg: 60, summon: { interval: 12, count: 1 },
      look: { hair: '#453f58', hairStyle: 'long', dress: '#d4629d', skin: '#dcefdd', accent: '#ff92cd', eye: '#415c41' },
      hat: hat('<svg viewBox="0 0 100 60"><path d="M22 30 q28 -26 56 0 q-28 12 -56 0Z" fill="#f2d24a" stroke="#c9a52c" stroke-width="3"/><circle cx="50" cy="28" r="5" fill="#c04a8a"/></svg>')
    },
    /* ---- 新关卡专属 ---- */
    oiran: {
      id: 'oiran', name: '花魁僵尸', hp: 700, speed: 20, dmg: 60, ranged: { dmg: 25, interval: 1.6, range: 2.6 }, isNew: true,
      look: { hair: '#8a3d63', hairStyle: 'long', dress: '#a63d73', skin: '#dcefdd', accent: '#ff7eb3', eye: '#d05f9e' },
      hat: hat('<svg viewBox="0 0 100 60"><path d="M20 40 q0 -8 10 -10 l20 -4 l20 4 q10 2 10 10Z" fill="#e05a9e" stroke="#b03a72" stroke-width="3"/><circle cx="34" cy="28" r="4" fill="#ffd54a"/><circle cx="66" cy="28" r="4" fill="#ffd54a"/><rect x="47" y="10" width="6" height="18" rx="3" fill="#ffd54a"/></svg>')
    },
    gargantuar: {
      id: 'gargantuar', name: '铁壁巨人', hp: 3200, speed: 12, dmg: 60, smash: true, big: true, isNew: true,
      look: { hair: '#5a5a68', hairStyle: 'short', dress: '#6f7280', skin: '#c9dfc9', accent: '#9aa6b3', eye: '#38552f' },
      hat: hat('<svg viewBox="0 0 100 60"><path d="M16 52 q0 -34 34 -34 q34 0 34 34Z" fill="#8e9aa6" stroke="#6b7683" stroke-width="3"/><rect x="12" y="48" width="76" height="9" rx="4" fill="#6b7683"/><path d="M34 26 l16 -10 l16 10" stroke="#c8d2dc" stroke-width="3" fill="none"/></svg>')
    }
  };

  /* ---------------- 难度档位 ----------------
   * 全部为乘算系数，在关卡自身系数之上再叠乘。
   * 「挑战」= 全部 1.0，即未做任何调整前的原始强度，用于保留硬核体验。
   * ------------------------------------------ */
  var DIFFICULTIES = [
    {
      id: 'casual', name: '休闲', stars: '★☆☆☆☆', badge: '轻松体验',
      desc: '僵尸更脆更慢、阳光更宽裕、波次更舒缓，每行还有两台小推车兜底。',
      hpMul: 0.68, speedMul: 0.86, startSunMul: 2.10,
      waveMul: 1.34, sunRateMul: 1.55, mowerCount: 2
    },
    {
      id: 'standard', name: '标准', stars: '★★★☆☆', badge: '推荐',
      desc: '需要合理搭配阵容与节奏，但不会出现「数值上打不过」的情况。',
      hpMul: 0.80, speedMul: 0.93, startSunMul: 1.70,
      waveMul: 1.20, sunRateMul: 1.35, mowerCount: 1
    },
    {
      id: 'challenge', name: '挑战', stars: '★★★★★', badge: '原版强度',
      desc: '保留下调之前的全部强度，供硬核玩家挑战。',
      hpMul: 1.00, speedMul: 1.00, startSunMul: 1.00,
      waveMul: 1.00, sunRateMul: 1.00, mowerCount: 1
    }
  ];
  var DEFAULT_DIFFICULTY = 'standard';

  /* ---------------- 关卡 ---------------- */
  // 波次由「批次表」定义，运行时展开
  function expandWaves(batches) {
    // batches: [{at, flag, list:{type:count}}]
    var waves = [];
    for (var i = 0; i < batches.length; i++) {
      var b = batches[i], list = [];
      for (var k in b.list) {
        for (var n = 0; n < b.list[k]; n++) list.push(k);
      }
      // 交错排布
      var t = 0;
      for (var j = 0; j < list.length; j++) {
        waves.push({ at: +(b.at + t).toFixed(1), type: list[j], flag: !!b.flag && j === 0, last: !!b.last && j === 0 });
        t += b.spread || 0.55;
      }
    }
    waves.sort(function (a, b2) { return a.at - b2.at; });
    return waves;
  }

  var ALL_PLANTS = PLANTS.map(function (p) { return p.id; });

  var LEVELS = [
    {
      id: 'l1',
      name: '青空草坪 · 白昼',
      subtitle: '第一关 · 入门',
      difficulty: 1,
      theme: 'day',
      lanes: 5, cols: 9,
      skySun: true, startSun: 50, slots: 6,
      zombieSpeedMul: 1.0,
      pool: ALL_PLANTS.slice(),
      desc: '阳光充足的白天草坪。熟悉向日葵与豌豆咲的配合，是最适合练手的战场。',
      batches: [
        { at: 18, list: { normal: 1 } },
        { at: 26, list: { normal: 2 }, spread: 0.9 },
        { at: 44, list: { normal: 2, conehead: 1 }, spread: 0.8 },
        { at: 64, list: { conehead: 2, normal: 1 }, spread: 0.7 },
        { at: 84, list: { conehead: 2, buckethead: 1 }, spread: 0.7 },
        { at: 104, list: { normal: 3, conehead: 2 }, spread: 0.6 },
        { at: 124, list: { buckethead: 2, conehead: 2 }, spread: 0.6 },
        { at: 146, list: { football: 1, conehead: 2 }, spread: 0.6 },
        { at: 168, list: { buckethead: 2, football: 1, normal: 2 }, spread: 0.55 },
        { at: 196, flag: true, last: true, list: { normal: 4, conehead: 3, buckethead: 2, football: 1 }, spread: 0.5 }
      ]
    },
    {
      id: 'l2',
      name: '沙暴荒野 · 黄昏',
      subtitle: '第二关 · 进阶',
      difficulty: 2,
      theme: 'dusk',
      lanes: 5, cols: 9,
      skySun: true, startSun: 75, slots: 6,
      zombieSpeedMul: 1.06,
      pool: ['sunflower', 'peashooter', 'wallnut', 'potatomine', 'snowpea', 'repeater', 'cherrybomb', 'spikeweed', 'magnetshroom', 'melonpult'],
      desc: '黄昏的荒野，僵尸更加凶悍且装备精良。活用磁力娘与冰室雪来拆解铁制护具。',
      batches: [
        { at: 18, list: { normal: 2 }, spread: 0.9 },
        { at: 28, list: { conehead: 2, normal: 1 }, spread: 0.8 },
        { at: 46, list: { buckethead: 2 }, spread: 0.9 },
        { at: 66, list: { news: 2, conehead: 1 }, spread: 0.8 },
        { at: 86, list: { screendoor: 2, normal: 2 }, spread: 0.7 },
        { at: 106, list: { football: 1, buckethead: 2 }, spread: 0.7 },
        { at: 128, list: { pole: 2, news: 2 }, spread: 0.7 },
        { at: 150, flag: true, list: { normal: 3, conehead: 2, buckethead: 2 }, spread: 0.6 },
        { at: 176, list: { screendoor: 2, football: 2 }, spread: 0.6 },
        { at: 200, list: { pole: 3, buckethead: 2, news: 2 }, spread: 0.55 },
        { at: 226, list: { football: 2, screendoor: 2, conehead: 3 }, spread: 0.5 },
        { at: 254, flag: true, last: true, list: { normal: 5, conehead: 3, buckethead: 3, football: 2, pole: 2 }, spread: 0.45 }
      ]
    },
    {
      id: 'l3',
      name: '樱花墓地 · 月夜',
      subtitle: '第三关 · 新增关卡',
      difficulty: 3,
      theme: 'night',
      lanes: 5, cols: 9,
      skySun: false, startSun: 100, slots: 6,
      zombieSpeedMul: 1.12,
      tombstone: { cols: [0, 1], count: 3 },
      isNew: true,
      pool: ['sunflower', 'sunshroom', 'wallnut', 'snowpea', 'chomper', 'potatomine', 'spikeweed', 'melonpult'],
      desc: '全新关卡。月光下的樱花墓地，天空中不再掉落阳光，前两列被墓碑占据。僵尸更快、更硬，并会出现远程的花魁僵尸与压轴的铁壁巨人。记得带上盾姬胡桃——她是这里唯一的肉盾。',
      brief: {
        map: '夜间墓地草坪 · 5 行 × 9 列；第 1–2 列被 3 座墓碑占据，墓碑所在格无法种植。',
        waves: '共 18 波、3 面旗帜波（第 6 / 12 / 18 波），第 18 波为铁壁巨人压轴的 BOSS 波。',
        zombies: '普通 / 路障 / 铁桶 / 撑杆跳 / 报纸 / 橄榄球 / 铁门 / 舞王 + 专属「花魁僵尸」「铁壁巨人」。',
        plants: '共 8 种可选、6 个卡槽：向日 葵、夜光菇娘（两大经济来源）、盾姬胡桃（坚果墙，唯一的肉盾）、冰室雪、吞噬姬咲夜、地雷娘芋子、荆棘娘伊薔薇、西瓜姬澄华。',
        rules: '夜间无天降阳光（经济全靠夜光菇娘）；墓碑阻挡种植。',
        difficulty: '★★★☆☆ 中等偏难（可在选卡界面切换 休闲/标准/挑战）'
      },
      batches: [
        { at: 20, list: { normal: 2 }, spread: 0.9 },
        { at: 30, list: { conehead: 2 }, spread: 0.8 },
        { at: 48, list: { normal: 2, conehead: 2 }, spread: 0.75 },
        { at: 68, list: { buckethead: 2, normal: 1 }, spread: 0.8 },
        { at: 88, list: { pole: 2, conehead: 2 }, spread: 0.7 },
        { at: 110, flag: true, list: { normal: 3, conehead: 2, buckethead: 2 }, spread: 0.6 },
        { at: 134, list: { oiran: 1, news: 2 }, spread: 0.8 },
        { at: 156, list: { football: 1, screendoor: 2 }, spread: 0.7 },
        { at: 178, list: { oiran: 2, conehead: 2 }, spread: 0.7 },
        { at: 200, list: { buckethead: 3, pole: 2 }, spread: 0.6 },
        { at: 224, list: { dancer: 1, normal: 3 }, spread: 0.7 },
        { at: 248, flag: true, list: { football: 2, screendoor: 2, oiran: 1 }, spread: 0.6 },
        { at: 274, list: { buckethead: 3, oiran: 2 }, spread: 0.55 },
        { at: 298, list: { football: 2, pole: 3, news: 2 }, spread: 0.5 },
        { at: 322, list: { oiran: 2, screendoor: 3 }, spread: 0.5 },
        { at: 348, list: { dancer: 2, buckethead: 3, football: 2 }, spread: 0.5 },
        { at: 376, list: { oiran: 2, football: 1 }, spread: 0.7 },
        { at: 410, flag: true, last: true, list: { gargantuar: 1, normal: 4, conehead: 3, buckethead: 3, oiran: 2, football: 2 }, spread: 0.45 }
      ]
    }
  ];

  LEVELS.forEach(function (lv) {
    lv.waves = expandWaves(lv.batches);
    lv.totalWaves = lv.waves.length;   // 单体僵尸出怪总数
    lv.waveCount = lv.batches.length;  // 波次数量
  });

  global.PVZData = {
    PLANTS: PLANTS, PLANT_MAP: PLANT_MAP, ALL_PLANTS: ALL_PLANTS,
    ZOMBIES: ZOMBIES, LEVELS: LEVELS,
    DIFFICULTIES: DIFFICULTIES, DEFAULT_DIFFICULTY: DEFAULT_DIFFICULTY
  };
})(window);
