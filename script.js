// ================================================================
//  CHAMARO HUB PRO — script.js
//  All original admin functionality preserved.
//  Rendering updated for new design system.
// ================================================================

// ======================== DOM References ========================
const matchesContainer = document.getElementById('matchesContainer');
const tipsContainer    = document.getElementById('tipsContainer');
const matchCountSpan   = document.getElementById('matchCount');
const currentDateSpan  = document.getElementById('currentDate');
const scrollTopBtn     = document.getElementById('scrollTopBtn');
const tickerTrack      = document.getElementById('tickerTrack');
const statMatchesEl    = document.getElementById('statMatches');

// Admin elements (IDs unchanged from original)
const adminPanel       = document.getElementById('adminPanel');
const adminToggleBtn   = document.getElementById('adminPanelToggle');
const closeAdminPanel  = document.getElementById('closeAdminPanel');
const addMatchBtnAdmin = document.getElementById('addMatchBtnAdmin');
const homeTeamInput    = document.getElementById('homeTeam');
const awayTeamInput    = document.getElementById('awayTeam');
const exportDataBtn    = document.getElementById('exportDataBtn');
const clearAllBtnAdmin = document.getElementById('clearAllBtnAdmin');
const resetDemoBtnAdmin= document.getElementById('resetDemoBtnAdmin');

// Secret trigger (5 clicks → admin toggle visible)
const secretTrigger = document.getElementById('secretAdminTrigger');
let clickCount = 0;

// ======================== TIPS DATA ========================
const tips = [
  { id: 1,  betType: "Draw or Away",  match: "Mallorca v Real Madrid",        market: "Double Chance",                       odds: 1.16, emoji: "✅" },
  { id: 2,  betType: "Over 1.5",      match: "Atletico Madrid v Barcelona",   market: "Over/Under",                          odds: 1.15, emoji: "✅" },
  { id: 3,  betType: "Over 0.5",      match: "FC Volendam v Feyenoord",       market: "Feyenoord Rotterdam Over/U...",       odds: 1.07, emoji: "✅" },
  { id: 4,  betType: "Over 0.5",      match: "PSV Eindhoven v FC Utrecht",    market: "PSV Eindhoven Over/U...",             odds: 1.08, emoji: "✅" },
  { id: 5,  betType: "Yes",           match: "PSG v Toulouse",                market: "Home Team to Win Either Half",        odds: 1.16, emoji: "✅" },
  { id: 6,  betType: "Over 0.5",      match: "Al Nassr Club v Al-Najma",      market: "2nd Half - Over/Under",               odds: 1.08, emoji: "✅" },
  { id: 7,  betType: "Home",          match: "Al Ahli Saudi FC v Damac FC",   market: "1X2 - 1UP",                           odds: 1.15, emoji: "✅" },
  { id: 8,  betType: "Home",          match: "Al Hilal SFC v Al-Taawoun FC",  market: "1X2 - 1UP",                           odds: 1.12, emoji: "✅" },
  { id: 9,  betType: "Over 1.5",      match: "Freiburg v Bayern Munich",      market: "Over/Under",                          odds: 1.12, emoji: "✅" },
  { id: 10, betType: "Over 0.5",      match: "Glasgow Rangers v Dundee",      market: "Glasgow Rangers Over/U...",           odds: 1.05, emoji: "✅" },
  { id: 11, betType: "Away (0:1)",    match: "Livingston FC v Heart of Midl", market: "Handicap 0:1",                        odds: 1.14, emoji: "✅" }
];

// ======================== MATCHES DATA ========================
let matches = [];

// ======================== Helpers ========================
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function getConfidenceDetails(level) {
  switch (level) {
    case 'low':    return { className: 'badge-low',    text: 'Low' };
    case 'high':   return { className: 'badge-high',   text: 'High' };
    default:       return { className: 'badge-medium', text: 'Medium' };
  }
}

function getConfidenceBorderColor(level) {
  if (level === 'low')  return '#e63946';
  if (level === 'high') return '#10b981';
  return '#f59e0b';
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

function updateMatchCount() {
  const n = matches.length;
  matchCountSpan.textContent = `${n} ${n === 1 ? 'match' : 'matches'}`;
  if (statMatchesEl) statMatchesEl.textContent = n;
}

// ======================== Ticker ========================
function renderTicker() {
  if (!tickerTrack) return;
  // Build items × 2 for seamless loop
  const items = [...tips, ...tips].map(tip => `
    <span class="ticker-item">
      <span class="t-match">${escapeHtml(tip.match)}</span>
      <span class="t-bullet">·</span>
      <span class="t-bet">${escapeHtml(tip.betType)}</span>
      <span class="t-bullet">·</span>
      <span class="t-odds">${tip.odds.toFixed(2)}</span>
    </span>
  `).join('');
  tickerTrack.innerHTML = items;
}

// ======================== Render Tips ========================
function renderTips() {
  if (!tipsContainer) return;
  if (tips.length === 0) {
    tipsContainer.innerHTML = `<div class="empty-state"><p class="empty-title">No tips available today.</p></div>`;
    return;
  }
  tipsContainer.innerHTML = tips.map((tip, i) => `
    <div class="tip-card" style="animation: fadeUp 0.6s ${(i * 0.05).toFixed(2)}s both">
      <div class="tip-card-top">
        <span class="tip-bet-tag">${escapeHtml(tip.betType)}</span>
        <span class="tip-odds">${tip.odds.toFixed(2)}</span>
      </div>
      <div class="tip-match">${escapeHtml(tip.match)}</div>
      <div class="tip-market">${escapeHtml(tip.market)}</div>
      <span class="tip-status-dot">${tip.emoji}</span>
    </div>
  `).join('');
}

// ======================== Render Matches ========================
function renderMatches() {
  if (!matchesContainer) return;
  if (matches.length === 0) {
    matchesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-futbol"></i></div>
        <p class="empty-title">No matches posted yet</p>
        <p class="empty-sub">Check back later for tomorrow's predictions</p>
      </div>
    `;
    return;
  }

  matchesContainer.innerHTML = matches.map((match, i) => {
    const conf = getConfidenceDetails(match.confidence);
    const borderColor = getConfidenceBorderColor(match.confidence);

    // Stars
    let starsHtml = '';
    for (let s = 1; s <= 5; s++) {
      starsHtml += `<i class="fas fa-star ${s <= match.starRating ? 'star-active' : 'star-inactive'}"></i>`;
    }

    // Bet options
    let optionsHtml = '';
    if (!match.betOptions || match.betOptions.length === 0) {
      optionsHtml = `<div class="no-options-msg">No bet options available</div>`;
    } else {
      optionsHtml = match.betOptions.map(opt => `
        <div class="bet-option-item">
          <span class="bet-option-name">${escapeHtml(opt.name)}</span>
          <span class="bet-option-odds">${opt.odds.toFixed(2)}</span>
        </div>
      `).join('');
    }

    return `
      <div class="match-card reveal-card" style="border-left-color: ${borderColor}; animation-delay: ${i * 0.06}s">
        <div class="match-card-inner">
          <div class="match-card-top">
            <div class="match-card-info">
              <h3 class="match-title">
                ${escapeHtml(match.home)}
                <span class="vs">vs</span>
                ${escapeHtml(match.away)}
              </h3>
              <div class="match-meta">
                <div class="match-meta-item">
                  <span class="match-meta-label">Confidence</span>
                  <span class="${conf.className}">${conf.text}</span>
                </div>
                <div class="match-meta-item">
                  <span class="match-meta-label">Rating</span>
                  <div class="star-rating-static">${starsHtml}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="match-options-block">
            <div class="match-options-title">
              <i class="fas fa-chart-line" style="color: var(--gold); font-size: 0.7rem;"></i>
              BET OPTIONS
            </div>
            <div class="bet-options-list">${optionsHtml}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Scroll-reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal-card').forEach(c => observer.observe(c));
}

// ======================== Admin Functions ========================
function addMatch() {
  const home = homeTeamInput.value.trim();
  const away = awayTeamInput.value.trim();
  if (!home || !away) {
    alert('Please enter both home and away team names.');
    return;
  }
  matches.unshift({ id: generateId(), home, away, confidence: 'medium', starRating: 0, betOptions: [] });
  renderMatches();
  updateMatchCount();
  homeTeamInput.value = '';
  awayTeamInput.value = '';
}

function clearAllMatches() {
  if (matches.length && confirm('⚠️ Remove ALL matches? This cannot be undone.')) {
    matches = [];
    renderMatches();
    updateMatchCount();
  }
}

function loadDemoMatches() {
  if (matches.length && !confirm('Replace current matches with demo data?')) return;
  matches = [
    {
      id: generateId(),
      home: 'Arsenal', away: 'Tottenham',
      confidence: 'high', starRating: 4,
      betOptions: [
        { name: 'Arsenal Win', odds: 2.10 },
        { name: 'Draw', odds: 3.50 },
        { name: 'Tottenham Win', odds: 3.20 }
      ]
    },
    {
      id: generateId(),
      home: 'AC Milan', away: 'Inter',
      confidence: 'medium', starRating: 3,
      betOptions: [
        { name: 'AC Milan Win', odds: 2.45 },
        { name: 'Draw', odds: 3.30 },
        { name: 'Inter Win', odds: 2.80 }
      ]
    }
  ];
  renderMatches();
  updateMatchCount();
}

function exportMatches() {
  const blob = new Blob([JSON.stringify(matches, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `matches_export_${new Date().toISOString().slice(0,19)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert('Matches exported! Replace the default matches array in script.js with this data and redeploy.');
}

// ======================== Admin Panel Toggle ========================
secretTrigger.addEventListener('click', () => {
  clickCount++;
  if (clickCount >= 5) {
    adminToggleBtn.classList.remove('hidden');
    secretTrigger.style.cursor = 'default';
    clickCount = 0;
  }
  setTimeout(() => { clickCount = 0; }, 3000);
});
adminToggleBtn.addEventListener('click', () => {
  adminPanel.classList.remove('hidden');
  adminToggleBtn.classList.add('hidden');
  adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
closeAdminPanel.addEventListener('click', () => {
  adminPanel.classList.add('hidden');
  adminToggleBtn.classList.remove('hidden');
});

// ======================== Admin Event Bindings ========================
addMatchBtnAdmin.addEventListener('click', addMatch);
clearAllBtnAdmin.addEventListener('click', clearAllMatches);
resetDemoBtnAdmin.addEventListener('click', loadDemoMatches);
exportDataBtn.addEventListener('click', exportMatches);
[homeTeamInput, awayTeamInput].forEach(input => {
  input.addEventListener('keypress', e => { if (e.key === 'Enter') addMatch(); });
});

// ======================== Bet Code Copy ========================
const copyCodeBtn = document.getElementById('copyCodeBtn');
const codeEl      = document.getElementById('codeInput');
if (copyCodeBtn && codeEl) {
  copyCodeBtn.addEventListener('click', () => {
    const code = codeEl.textContent.trim();

    // Copy to clipboard (modern API with fallback)
    const doCopy = () => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(code);
      } else {
        const tmp = document.createElement('input');
        tmp.value = code;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        return Promise.resolve();
      }
    };

    doCopy().then(() => {
      // Flash the code
      codeEl.classList.add('copy-flash');
      setTimeout(() => codeEl.classList.remove('copy-flash'), 700);

      // Animate button
      const originalHTML = copyCodeBtn.innerHTML;
      copyCodeBtn.style.transform = 'scale(0.95)';
      copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        copyCodeBtn.style.transform = '';
        copyCodeBtn.innerHTML = originalHTML;
      }, 1600);
    });
  });
}

// ======================== Scroll Behaviour ========================
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.remove('opacity-0', 'invisible');
    scrollTopBtn.classList.add('opacity-100');
  } else {
    scrollTopBtn.classList.add('opacity-0', 'invisible');
    scrollTopBtn.classList.remove('opacity-100');
  }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ======================== Date ========================
function setCurrentDate() {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateSpan.textContent = new Date().toLocaleDateString(undefined, opts);
}

// ======================== Init ========================
function init() {
  setCurrentDate();
  renderTicker();
  renderTips();
  renderMatches();
  updateMatchCount();
}

init();
