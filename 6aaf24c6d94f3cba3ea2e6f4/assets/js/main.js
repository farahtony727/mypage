(function () {
  'use strict';

  // 配置：填入你的 Formspree 表单地址（如 https://formspree.io/f/xxxxxx）即启用 AJAX 提交；留空则回退为邮件客户端发送
  var FORMSPREE_ENDPOINT = '';

  // 图库数据：前 3 张为主页默认展示的横版照片，其余在“查看更多”中展开
  var GALLERY = [
    {
      src: 'assets/images/gallery-motto.jpg',
      title: '经世致用 · 明德维新',
      meta: '2025 年 · 湖南大学',
      alt: '刘远航在校园活动中手持“经世致用 明德维新”手举牌'
    },
    {
      src: 'assets/images/gallery-psy.jpg',
      title: '全国心理委员技能大赛',
      meta: '2026 年 7 月 · 南京',
      alt: '参加 2026 年心理委员与朋辈辅导技能展示活动，与队友合影'
    },
    {
      src: 'assets/images/gallery-hike100.jpg',
      title: '百公里，一步一个脚印走完的勋章',
      meta: '百公里 · 完赛纪念',
      alt: '完成百公里徒步挑战，手持证书在终点签名墙前留影'
    },
    {
      src: 'assets/images/gallery-ethnic.jpg',
      title: '返家乡 · 民族服饰',
      meta: '2025 年夏 · 湖南湘西',
      alt: '社会实践期间身着蓝染民族服饰，在石牌坊前留影'
    },
    {
      src: 'assets/images/gallery-waterfall.jpg',
      title: '三下乡 · 湘西深山',
      meta: '2025 年夏 · 湖南湘西',
      alt: '暑期“三下乡”社会实践中，在山间瀑布前留影'
    },
    {
      src: 'assets/images/gallery-ridge.jpg',
      title: '山不来见我，我自去见山',
      meta: '山野 · 徒步途中的自拍',
      alt: '户外徒步时在山坡草地上伸手自拍，身后是蓝天白云'
    },
    {
      src: 'assets/images/gallery-hengshan.jpg',
      title: '梵音古道 · 顶峰相见',
      meta: '湖南 · 南岳衡山',
      alt: '在南岳衡山梵音古道处比出大拇指留影'
    }
  ];
  var FEATURED_COUNT = 3;

  /* ---------- 移动端导航 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '收起菜单' : '打开菜单');
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 滚动高亮当前导航 ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { navObserver.observe(s); });

  /* ---------- 入场动画 ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- 图库渲染 ---------- */
  var grid = document.getElementById('gallery-grid');
  var moreBtn = document.getElementById('gallery-more-btn');
  var shownCount = 0;

  function buildItem(item, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-item reveal';
    btn.setAttribute('aria-label', '全屏查看：' + item.title);

    var img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.width = 1200;
    img.height = 900;
    img.loading = 'lazy';

    var cap = document.createElement('span');
    cap.className = 'gallery-cap';
    var strong = document.createElement('strong');
    strong.textContent = item.title;
    var meta = document.createElement('span');
    meta.textContent = item.meta;
    cap.appendChild(strong);
    cap.appendChild(meta);

    btn.appendChild(img);
    btn.appendChild(cap);
    btn.addEventListener('click', function () { openLightbox(i); });
    return btn;
  }

  function showNext(batch) {
    var target = Math.min(shownCount + batch, GALLERY.length);
    for (var i = shownCount; i < target; i++) {
      var btn = buildItem(GALLERY[i], i);
      grid.appendChild(btn);
      revealObserver.observe(btn);
    }
    shownCount = target;
  }

  showNext(FEATURED_COUNT);
  if (shownCount >= GALLERY.length) moreBtn.hidden = true;

  /* ---------- 灯箱 ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var lbIndex = 0;
  var lastFocus = null;

  function renderLightbox() {
    var item = GALLERY[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.title + ' · ' + item.meta + '（' + (lbIndex + 1) + ' / ' + GALLERY.length + '）';
  }

  function openLightbox(i) {
    lbIndex = i;
    renderLightbox();
    lastFocus = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function stepLightbox(dir) {
    lbIndex = (lbIndex + dir + GALLERY.length) % GALLERY.length;
    renderLightbox();
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', function () { stepLightbox(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { stepLightbox(1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  var touchX = null;
  lightbox.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) stepLightbox(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* ---------- 简历预览弹窗 ---------- */
  var modal = document.getElementById('pdf-modal');
  var frame = document.getElementById('pdf-frame');
  var PDF_SRC = 'assets/resume_2025.pdf';
  var modalLastFocus = null;

  function openModal() {
    modalLastFocus = document.activeElement;
    frame.src = PDF_SRC;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('pdf-close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    frame.src = '';
    document.body.style.overflow = '';
    if (modalLastFocus) modalLastFocus.focus();
  }

  document.getElementById('resume-preview-btn').addEventListener('click', openModal);
  document.getElementById('resume-thumb').addEventListener('click', openModal);
  document.getElementById('pdf-close').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) closeLightbox();
      if (!modal.hidden) closeModal();
    }
    if (!lightbox.hidden) {
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    }
  });

  /* ---------- 查看更多 ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }
  moreBtn.addEventListener('click', function () {
    showNext(GALLERY.length - shownCount);
    if (shownCount >= GALLERY.length) moreBtn.hidden = true;
  });

  /* ---------- 微信：点击复制微信号 ---------- */
  var WECHAT_ID = 'trust_persist16';
  Array.prototype.forEach.call(document.querySelectorAll('.wechat-copy'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var finish = function () {
        showToast('微信号 ' + WECHAT_ID + ' 已复制，去微信搜索添加吧');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(WECHAT_ID).then(finish, finish);
      } else {
        var ta = document.createElement('textarea');
        ta.value = WECHAT_ID;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(ta);
        finish();
      }
    });
  });

  /* ---------- 联系表单 ---------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.className = 'form-status err';
      status.textContent = '请完整填写称呼、邮箱与留言后再提交。';
      return;
    }
    var data = new FormData(form);

    if (FORMSPREE_ENDPOINT) {
      status.className = 'form-status';
      status.textContent = '正在发送…';
      fetch(FORMSPREE_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('send failed');
          form.reset();
          status.className = 'form-status ok';
          status.textContent = '留言已发送，感谢联系，我会尽快回复！';
        })
        .catch(function () {
          status.className = 'form-status err';
          status.textContent = '发送失败，请稍后重试，或直接邮件联系 1823461742@qq.com。';
        });
      return;
    }

    var subject = encodeURIComponent('来自个人主页的留言 - ' + data.get('name'));
    var body = encodeURIComponent('称呼：' + data.get('name') + '\n邮箱：' + data.get('email') + '\n\n' + data.get('message'));
    window.location.href = 'mailto:1823461742@qq.com?subject=' + subject + '&body=' + body;
    status.className = 'form-status ok';
    status.textContent = '已为你打开邮件客户端；若未自动打开，请直接发送邮件至 1823461742@qq.com。';
  });
})();
