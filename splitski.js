let pts = 340;
let questsDone = 12;
let currentQuest = {};
let uploadedB64 = null;
let scanCount = 2;
let userLoggedIn = false;
let adminLoggedIn = false;
const scanNames = ['Petra Blazevic','Tomislav Grgic','Maja Simic','Luka Horvat','Sara Vukovic','Nikola Baric'];
const pendingReviews = [];

function goNav(name) {
  const wrap = document.querySelector('.phone-wrap');
  const hideNav = name === 'auth' || name === 'admin-login';
  if(hideNav) wrap.classList.add('nav-hidden');
  else wrap.classList.remove('nav-hidden');

  if(name === 'org' && !adminLoggedIn) name = 'admin-login';
  if(name !== 'auth' && name !== 'admin-login' && !userLoggedIn && !adminLoggedIn) name = 'auth';

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  const ni = document.getElementById('nav-' + name);
  if(ni) ni.classList.add('active');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function showAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? 'block' : 'none';
}

function setUserName(name) {
  const safeName = name && name.trim() ? name.trim() : 'Marko Peric';
  document.querySelector('.user-name').textContent = safeName;
  document.querySelector('.qr-user').textContent = safeName;
}

function handleUserLogin() {
  userLoggedIn = true;
  adminLoggedIn = false;
  showToast('Welcome back!');
  goNav('home');
}

function handleUserRegister() {
  const name = document.getElementById('reg-name').value;
  setUserName(name);
  userLoggedIn = true;
  adminLoggedIn = false;
  showToast('Account created. Welcome!');
  goNav('home');
}

function handleAdminLogin() {
  adminLoggedIn = true;
  userLoggedIn = false;
  showToast('Admin access granted');
  goNav('org');
}

function bounceSheep() {
  const w = document.getElementById('sheep-wrap');
  w.classList.remove('bouncing');
  void w.offsetWidth;
  w.classList.add('bouncing');
  setTimeout(() => w.classList.remove('bouncing'), 500);
}

function updatePts(add) {
  pts += add;
  questsDone++;
  document.getElementById('home-pts').textContent = '⭐ ' + pts + ' points';
  document.getElementById('sheep-pts').textContent = pts;
  document.getElementById('sheep-quests').textContent = questsDone;
  document.getElementById('reward-pts').textContent = pts;
  document.getElementById('lb-pts').textContent = pts;
  document.getElementById('prog-lbl').textContent = pts + ' / 600 points → next reward';
  const pct = Math.min(100, Math.round((pts / 600) * 100));
  document.getElementById('prog-fill').style.width = pct + '%';
  updateRewardBtns();
  bounceSheep();
}

function updateRewardBtns() {
  const mb = document.getElementById('museum-btn');
  const vb = document.getElementById('varos-btn');
  if(pts >= 600) {
    mb.textContent = 'Redeem';
    mb.className = 'raction';
    mb.dataset.rewardCost = '600';
  } else {
    mb.textContent = 'Locked: ' + (600 - pts) + ' to go';
    mb.className = 'raction locked-btn';
    delete mb.dataset.rewardCost;
  }

  if(pts >= 1000) {
    vb.textContent = 'Redeem';
    vb.className = 'raction';
    vb.dataset.rewardCost = '1000';
  } else {
    vb.textContent = 'Locked: ' + (1000 - pts) + ' to go';
    vb.className = 'raction locked-btn';
    delete vb.dataset.rewardCost;
  }
}

function redeemReward(cost) {
  if(pts < cost) { showToast('Not enough points yet! 💪'); return; }
  pts -= cost;
  document.getElementById('home-pts').textContent = '⭐ ' + pts + ' points';
  document.getElementById('reward-pts').textContent = pts;
  document.getElementById('lb-pts').textContent = pts;
  document.getElementById('sheep-pts').textContent = pts;
  updateRewardBtns();
  showToast('🎉 Reward redeemed! Show it at the venue.');
}

function filterCat(cat, el) {
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.qcard').forEach(c => {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'flex' : 'none';
  });
}

function openPhoto(qid, title, p) {
  const card = document.getElementById(qid);
  if(card && card.classList.contains('done')) return;
  currentQuest = {qid, title, pts: p};
  document.getElementById('photo-title').textContent = title;
  document.getElementById('step-upload').style.display = 'block';
  document.getElementById('step-thinking').style.display = 'none';
  document.getElementById('step-result').style.display = 'none';
  document.getElementById('photo-preview').style.display = 'none';
  document.getElementById('upload-zone').style.display = 'block';
  document.getElementById('verify-btn').disabled = true;
  uploadedB64 = null;
  document.getElementById('file-input').value = '';
  goNav('photo');
}

function handleFile(e) {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    uploadedB64 = dataUrl.split(',')[1];
    document.getElementById('preview-img').src = dataUrl;
    document.getElementById('photo-preview').style.display = 'flex';
    document.getElementById('upload-zone').style.display = 'none';
    document.getElementById('verify-btn').disabled = false;
  };
  reader.readAsDataURL(file);
}

function startVerification() {
  if(!uploadedB64) return;
  document.getElementById('step-upload').style.display = 'none';
  document.getElementById('step-thinking').style.display = 'block';
  document.getElementById('thinking-img').src = document.getElementById('preview-img').src;
  const msgs = ['Submitting evidence...','Queued for admin review...','Almost done...'];
  let ti = 0;
  const iv = setInterval(() => {
    ti = (ti + 1) % msgs.length;
    document.getElementById('thinking-text').textContent = msgs[ti];
  }, 900);

  setTimeout(() => {
    clearInterval(iv);
    queueReview();
    showSubmissionResult();
  }, 1200);
}

function queueReview() {
  const userName = document.querySelector('.user-name').textContent || 'User';
  const review = {
    id: Date.now(),
    qid: currentQuest.qid,
    title: currentQuest.title,
    pts: currentQuest.pts,
    user: userName,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    img: document.getElementById('preview-img').src
  };
  pendingReviews.unshift(review);
  renderReviewList();
}

function showSubmissionResult() {
  document.getElementById('step-thinking').style.display = 'none';
  document.getElementById('step-result').style.display = 'block';
  document.getElementById('result-img').src = document.getElementById('preview-img').src;
  document.getElementById('result-card').className = 'result-card success';
  document.getElementById('result-icon').textContent = '🕒';
  document.getElementById('result-title').textContent = 'Submitted for review';
  document.getElementById('pts-earned').textContent = 'Pending approval';
  document.getElementById('pts-earned').style.color = '#2d5a27';
  document.getElementById('result-desc').textContent = 'Admins will review your proof soon.';
  document.getElementById('result-hdr-title').textContent = 'Submitted for review';
  document.getElementById('result-hdr-sub').textContent = 'Waiting for admin decision';
  document.getElementById('result-back-btn').textContent = 'Back to quests';
  showToast('Submitted for admin review');
}

function markQuestDone(qid) {
  const card = document.getElementById(qid);
  if(card) {
    card.classList.add('done');
    const btn = card.querySelector('.qbtn');
    if(btn) { btn.textContent = '✓ Done'; btn.className = 'qbtn done-btn'; }
  }
}

function renderReviewList() {
  const list = document.getElementById('review-list');
  if(!list) return;
  list.innerHTML = '';
  if(!pendingReviews.length) {
    list.innerHTML = '<div class="att-row"><div><div class="att-name">No submissions yet</div><div class="att-time">Waiting for users</div></div><div class="att-pts">—</div></div>';
    return;
  }

  pendingReviews.forEach(r => {
    const row = document.createElement('div');
    row.className = 'att-row';
    row.innerHTML = `
      <div>
        <div class="att-name">${r.title}</div>
        <div class="att-time">${r.user} • ${r.time}</div>
      </div>
      <div class="review-actions">
        <div class="att-pts">+${r.pts}</div>
        <button class="review-btn approve">Approve</button>
        <button class="review-btn deny">Reject</button>
      </div>`;
    row.querySelector('.review-btn.approve').addEventListener('click', () => approveReview(r.id));
    row.querySelector('.review-btn.deny').addEventListener('click', () => rejectReview(r.id));
    list.appendChild(row);
  });
}

function approveReview(id) {
  const idx = pendingReviews.findIndex(r => r.id === id);
  if(idx === -1) return;
  const review = pendingReviews[idx];
  const card = document.getElementById(review.qid);
  if(!card || !card.classList.contains('done')) {
    updatePts(review.pts);
    markQuestDone(review.qid);
  }
  pendingReviews.splice(idx, 1);
  renderReviewList();
  showToast('Approved: +' + review.pts + ' points');
}

function rejectReview(id) {
  const idx = pendingReviews.findIndex(r => r.id === id);
  if(idx === -1) return;
  pendingReviews.splice(idx, 1);
  renderReviewList();
  showToast('Rejected submission');
}

function simulateScan() {
  const name = scanNames[scanCount % scanNames.length];
  const now = new Date();
  const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  const list = document.getElementById('att-list');
  const row = document.createElement('div');
  row.className = 'att-row';
  row.innerHTML = '<div><div class="att-name">'+name+'</div><div class="att-time">'+time+'</div></div><div class="att-pts">+120</div>';
  list.appendChild(row);
  scanCount++;
  document.getElementById('scan-count').textContent = scanCount;
  showToast('Scanned! ' + name + ' earns 120 points');
}

function setupEventListeners() {
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action], [data-nav], [data-auth-tab], [data-cat-filter], [data-photo-qid], [data-reward-cost]');
    if(!target) return;

    if(target.dataset.authTab) showAuthTab(target.dataset.authTab);
    if(target.dataset.nav) goNav(target.dataset.nav);
    if(target.dataset.catFilter) filterCat(target.dataset.catFilter, target);
    if(target.dataset.photoQid) openPhoto(target.dataset.photoQid, target.dataset.photoTitle, Number(target.dataset.photoPts));
    if(target.dataset.rewardCost) redeemReward(Number(target.dataset.rewardCost));

    const action = target.dataset.action;
    if(action === 'user-login') handleUserLogin();
    if(action === 'user-register') handleUserRegister();
    if(action === 'admin-login') handleAdminLogin();
    if(action === 'bounce-sheep') bounceSheep();
    if(action === 'open-file') document.getElementById('file-input').click();
    if(action === 'start-verification') startVerification();
    if(action === 'simulate-scan') simulateScan();
  });

  document.getElementById('file-input').addEventListener('change', handleFile);
}
setupEventListeners();
goNav('auth');
