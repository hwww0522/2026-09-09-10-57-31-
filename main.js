/* ============================================================
   AI 行业日报看板 · 交互脚本
   机制：data-completed 属性 + .completed 类的 Toggle；
        data-priority 筛选只控制 display，两者互不干扰。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 顶部日期（YYYY-MM-DD） ---------- */
  var now = new Date();
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var y = now.getFullYear();
  var m = pad(now.getMonth() + 1);
  var d = pad(now.getDate());
  var week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
  document.getElementById('today').textContent = y + '-' + m + '-' + d;
  document.getElementById('weekday').textContent = '星期' + week;

  /* ---------- 实时时钟 ---------- */
  var clockEl = document.getElementById('clock');
  function tick() {
    var t = new Date();
    clockEl.textContent = '实时 ' + pad(t.getHours()) + ':' + pad(t.getMinutes()) + ':' + pad(t.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 阅读完成按钮（data-completed 属性 + .completed 类 的 Toggle 机制） ---------- */
  var cards = document.querySelectorAll('.card[data-completed]');
  var counter = document.getElementById('doneCount');
  var readFill = document.getElementById('readFill');
  var readPct = document.getElementById('readPct');
  var statDone = document.getElementById('statDone');
  function refreshCount() {
    var n = document.querySelectorAll('.card[data-completed="true"]').length;
    counter.textContent = n;
    var pct = cards.length ? Math.round(n / cards.length * 100) : 0;
    if (readFill) readFill.style.width = pct + '%';
    if (readPct) readPct.textContent = pct + '%';
    if (statDone) statDone.textContent = n;
  }
  refreshCount();
  cards.forEach(function (card) {
    var btn = card.querySelector('.done-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      /* 仅切换属性与类名，不重绘卡片 DOM */
      var done = card.getAttribute('data-completed') === 'true';
      card.setAttribute('data-completed', done ? 'false' : 'true');
      card.classList.toggle('completed', !done);
      btn.classList.toggle('is-done', !done);
      btn.textContent = !done ? '已完成' : '阅读完成';
      refreshCount();
    });
  });

  /* ---------- 重要程度筛选（只控制 display，不影响 data-completed / .completed） ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var newsCards = document.querySelectorAll('.news-list .card[data-priority]');
  filterBtns.forEach(function (fb) {
    fb.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.toggle('active', b === fb); });
      var f = fb.getAttribute('data-filter');
      newsCards.forEach(function (c) {
        var show = (f === 'all') || (c.getAttribute('data-priority') === f);
        c.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---------- 趋势百分比滚动动画 + 进度条展开 ---------- */
  var rows = document.querySelectorAll('.trow');
  rows.forEach(function (row, idx) {
    var num = row.querySelector('.num');
    var bar = row.querySelector('.bar i');
    if (!num || !bar) return;
    var target = parseFloat(num.getAttribute('data-v'));
    var isUp = target >= 0;
    var sign = isUp ? '+' : '-';
    var v = Math.abs(target);
    var dur = 1100 + idx * 90;
    var t0 = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function frame(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      num.textContent = sign + (v * ease(p)).toFixed(1);
      if (p < 1) { requestAnimationFrame(frame); }
      else { bar.style.width = bar.getAttribute('data-w') + '%'; }
    }
    /* 延迟启动：等卡片入场动画结束后再播放数字 */
    setTimeout(function () { requestAnimationFrame(frame); }, 350 + idx * 110);
  });

  /* ---------- 滚动入场（IntersectionObserver） ---------- */
  var ioEls = document.querySelectorAll('.io');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    ioEls.forEach(function (el) { io.observe(el); });
  } else {
    ioEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 回到顶部 ---------- */
  var backtop = document.getElementById('backtop');
  window.addEventListener('scroll', function () {
    backtop.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  backtop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
