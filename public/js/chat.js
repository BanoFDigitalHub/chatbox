(function () {
  const token = localStorage.getItem('chat_token');
  const myUsername = localStorage.getItem('chat_username');
  const otherUser = localStorage.getItem('chat_otherUser');

  if (!token || !myUsername || !otherUser) {
    window.location.href = '/index.html';
    return;
  }

  // ---------- DOM refs ----------

  const messagesEl = document.getElementById('messages');
  const avatarEl = document.getElementById('avatar');
  const avatarContentEl = document.getElementById('avatarContent');
  const onlineDot = document.getElementById('onlineDot');
  const statusEl = document.getElementById('statusText');
  const composer = document.getElementById('composer');
  const textInput = document.getElementById('textInput');

  const searchBtn = document.getElementById('searchBtn');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');
  const searchCount = document.getElementById('searchCount');
  const closeSearchBtn = document.getElementById('closeSearchBtn');

  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const myAvatarPreview = document.getElementById('myAvatarPreview');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const avatarInput = document.getElementById('avatarInput');
  const nicknameInput = document.getElementById('nicknameInput');
  const saveNicknameBtn = document.getElementById('saveNicknameBtn');
  const wallpaperSwatches = document.getElementById('wallpaperSwatches');
  const themeSwatches = document.getElementById('themeSwatches');

  const emojiBtn = document.getElementById('emojiBtn');
  const emojiPicker = document.getElementById('emojiPicker');
  const emojiGrid = document.getElementById('emojiGrid');

  const attachBtn = document.getElementById('attachBtn');
  const fileInput = document.getElementById('fileInput');
  const previewBar = document.getElementById('previewBar');
  const previewContent = document.getElementById('previewContent');
  const viewOnceToggle = document.getElementById('viewOnceToggle');
  const viewOnceLabel = document.getElementById('viewOnceLabel');
  const sendMediaBtn = document.getElementById('sendMediaBtn');
  const cancelMediaBtn = document.getElementById('cancelMediaBtn');

  const micBtn = document.getElementById('micBtn');
  const recordingBar = document.getElementById('recordingBar');
  const recTimer = document.getElementById('recTimer');
  const stopRecBtn = document.getElementById('stopRecBtn');
  const cancelRecBtn = document.getElementById('cancelRecBtn');

  const modal = document.getElementById('viewOnceModal');
  const modalMediaWrap = document.getElementById('modalMediaWrap');
  const closeModalBtn = document.getElementById('closeModalBtn');

  const replyPreviewBar = document.getElementById('replyPreviewBar');
  const replyPreviewName = document.getElementById('replyPreviewName');
  const replyPreviewSnippet = document.getElementById('replyPreviewSnippet');
  const cancelReplyBtn = document.getElementById('cancelReplyBtn');

  const avatarModal = document.getElementById('avatarModal');
  const avatarViewPhoto = document.getElementById('avatarViewPhoto');
  const avatarViewName = document.getElementById('avatarViewName');
  const closeAvatarModalBtn = document.getElementById('closeAvatarModalBtn');

  const appLoader = document.getElementById('appLoader');

  const eyeIconSvg =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const sentIconSvg =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>';
  const playIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const pauseIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
  const replyIconSvg =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17l-5-5 5-5"/><path d="M4 12h11a5 5 0 0 1 5 5v2"/></svg>';

  const QUICK_REACTIONS = ['❤️', '👍', '😂', '🔥', '😮', '😢'];
  const EMOJI_CATEGORIES = {
    Smileys: ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😜', '🤔', '😎', '😴', '🥲', '😇', '🙂', '😅', '🤗'],
    Gestures: ['👍', '👎', '👏', '🙏', '💪', '🤝', '✌️', '👌', '🤞', '👋', '🙌', '🤙'],
    Hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💖', '💗', '💔'],
    Animals: ['🐶', '🐱', '🦁', '🐼', '🐨', '🦊', '🐸', '🐷', '🐵', '🦋', '🐢', '🐝'],
    Food: ['🍕', '🍔', '🍟', '🍩', '☕', '🍰', '🍎', '🍉', '🥭', '🥤', '🍿', '🍫'],
    Activities: ['⚽', '🏏', '🎮', '🎧', '🎬', '📚', '✈️', '🎉', '🔥', '⭐', '💯', '✅']
  };

  // Media upload cap: choti/lambi dono videos bhejne ke liye 300MB tak allow.
  const MAX_MEDIA_BYTES = 300 * 1024 * 1024;

  const messagesById = new Map();
  const renderedIds = new Set();
  let myProfile = { avatarUrl: '', nicknameForOther: '', wallpaper: 'default', themeColor: 'teal' };
  let otherProfile = { avatarUrl: '' };
  let emojiGridBuilt = false;
  let lastKnownOnline = false;
  let lastKnownSeen = null;
  let replyTarget = null;

  // ---------- mobile keyboard fix (header ko top pr fixed rakhna) ----------
  //
  // Masla: mobile browsers jab keyboard kholte hain to woh "resize" karte hain
  // ya viewport ko chhota kar dete hain, aur 100dvh is change ko turant ya
  // sahi tarah se track nahi karta (khaas kar iOS Safari pr) — jiski wajah se
  // poora .app box upar shift ho jata tha aur header (avatar wala) screen se
  // bahar chala jata tha.
  //
  // Fix: VisualViewport API se asal visible height nikal kar --app-height
  // CSS variable set karte hain. .app ye variable use karta hai (position:
  // fixed + height: var(--app-height)), is liye jab keyboard khulta hai to
  // sirf .app ka total box chhota hota hai — header apni jagah (top: 0) pr
  // hi rehta hai, sirf .messages ka scrollable area kam hota hai. Bilkul
  // WhatsApp jaisa behavior.
  function syncAppHeight() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-height', h + 'px');
    // Jab visualViewport resize ho (keyboard open/close), page ko us offset
    // ke sath top pr pin rakhte hain taake safari khud se scroll na kare.
    if (vv) window.scrollTo(0, 0);
  }

  syncAppHeight();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncAppHeight);
    window.visualViewport.addEventListener('scroll', syncAppHeight);
  }
  window.addEventListener('resize', syncAppHeight);
  window.addEventListener('orientationchange', () => setTimeout(syncAppHeight, 100));

  // Textarea pr focus hote hi turant sync + thoda dobara after keyboard
  // animation settle ho (kuch Android keyboards animate hoke khulte hain).
  textInput.addEventListener('focus', () => {
    syncAppHeight();
    setTimeout(syncAppHeight, 60);
    setTimeout(syncAppHeight, 300);
    setTimeout(scrollToBottom, 320);
  });
  textInput.addEventListener('blur', () => {
    syncAppHeight();
    setTimeout(syncAppHeight, 60);
    setTimeout(syncAppHeight, 300);
  });

  // ---------- small helpers ----------

  function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDuration(secs) {
    const s = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(s / 60);
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }

  function formatBytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(0) + 'MB';
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function toast(text) {
    const el = document.createElement('div');
    el.className = 'system-hint';
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function setAvatarEl(el, url, fallbackInitial) {
    el.innerHTML = '';
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'avatar';
      el.appendChild(img);
    } else {
      el.textContent = fallbackInitial;
    }
  }

  function currentOtherDisplayName() {
    return myProfile.nicknameForOther && myProfile.nicknameForOther.trim()
      ? myProfile.nicknameForOther.trim()
      : otherUser;
  }

  function markSelectedSwatch(container, value) {
    container.querySelectorAll('button').forEach((btn) => {
      const key = btn.dataset.wallpaper || btn.dataset.theme;
      btn.classList.toggle('selected', key === value);
    });
  }

  // ---------- reply (WhatsApp-style) ----------
  //
  // Flow: kisi bhi bubble (apna ya dost ka, text/media/voice/view-once sab)
  // ko long-press karo -> reaction quickbar khulti hai jisme reply icon bhi
  // hai. Reply tap karo -> composer ke upar us message ka mini-quote preview
  // aa jata hai (naam + snippet). Send karne pr wo replyTo payload ke sath
  // jata hai. Dusri taraf jab bubble render hoti hai aur usme replyTo hai,
  // to bubble ke andar chhota quoted-reference box dikhta hai jispe tap
  // karne se original message tak smooth-scroll ho kar highlight hota hai —
  // ye sab already neeche renderMessage() aur attachLongPress() mein wired
  // hai; yahan sirf reply-state helpers hain jo unhe drive karte hain.

  function replySnippetFor(msg) {
    if (msg.viewOnce) return msg.type === 'video' ? 'Video · 1 baar' : 'Photo · 1 baar';
    if (msg.type === 'image') return 'Photo';
    if (msg.type === 'video') return 'Video';
    if (msg.type === 'voice') return 'Voice message';
    return msg.text || '';
  }

  function setReplyTarget(msg) {
    replyTarget = msg;
    const isMine = msg.sender === myUsername;
    replyPreviewName.textContent = isMine ? 'You' : currentOtherDisplayName();
    replyPreviewSnippet.textContent = replySnippetFor(msg);
    replyPreviewBar.classList.remove('hidden');
    textInput.focus();
  }

  function clearReplyTarget() {
    replyTarget = null;
    replyPreviewBar.classList.add('hidden');
  }

  cancelReplyBtn.addEventListener('click', clearReplyTarget);

  function scrollToMessage(id) {
    const row = messagesEl.querySelector(`.bubble-row[data-id="${id}"]`);
    if (!row) {
      toast('Original message nahi mila');
      return;
    }
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('flash');
    setTimeout(() => row.classList.remove('flash'), 900);
  }

  function attachSwipeToReply(row, msg) {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let triggered = false;

    function start(e) {
      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      tracking = true;
      triggered = false;
    }
    function move(e) {
      if (!tracking) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;
      if (Math.abs(dy) > 30) {
        tracking = false;
        row.style.transform = '';
        return;
      }
      if (dx > 0 && dx < 90) row.style.transform = `translateX(${dx}px)`;
      if (dx > 55 && !triggered) {
        triggered = true;
        if (navigator.vibrate) navigator.vibrate(10);
      }
    }
    function end() {
      if (!tracking) return;
      tracking = false;
      row.style.transition = 'transform 0.15s ease';
      row.style.transform = '';
      setTimeout(() => {
        row.style.transition = '';
      }, 160);
      if (triggered) setReplyTarget(msg);
    }

    row.addEventListener('touchstart', start, { passive: true });
    row.addEventListener('touchmove', move, { passive: true });
    row.addEventListener('touchend', end);
  }

  // ---------- overlay management ----------

  function hideEmoji() {
    emojiPicker.classList.add('hidden');
  }
  function hideSettings() {
    settingsPanel.classList.add('hidden');
  }
  function clearSearchFilter() {
    searchInput.value = '';
    searchCount.textContent = '';
    messagesEl.querySelectorAll('.bubble-row').forEach((row) => {
      row.classList.remove('search-hidden', 'search-match');
    });
  }
  function hideSearch() {
    searchBar.classList.add('hidden');
    clearSearchFilter();
  }

  function closeModal() {
    modal.classList.add('hidden');
    modalMediaWrap.innerHTML = '';
  }

  function closeAvatarModal() {
    avatarModal.classList.add('hidden');
    avatarViewPhoto.innerHTML = '?';
  }

  function closeReactionQuickbar() {
    const existing = document.querySelector('.reaction-quickbar');
    if (existing) existing.remove();
    document.removeEventListener('click', onDocClickCloseQuickbar, true);
  }
  function onDocClickCloseQuickbar(e) {
    const bar = document.querySelector('.reaction-quickbar');
    if (bar && !bar.contains(e.target)) closeReactionQuickbar();
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideEmoji();
      hideSettings();
      hideSearch();
      closeModal();
      closeAvatarModal();
      closeReactionQuickbar();
      clearReplyTarget();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      hideSettings();
      hideEmoji();
      searchBar.classList.remove('hidden');
      searchInput.focus();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !modal.classList.contains('hidden')) closeModal();
  });

  // ---------- status / presence ----------

  function setStatus(online, lastSeen) {
    lastKnownOnline = online;
    lastKnownSeen = lastSeen;
    statusEl.classList.remove('typing');
    if (online) {
      statusEl.textContent = 'online';
      statusEl.classList.add('online');
    } else {
      statusEl.classList.remove('online');
      statusEl.textContent = lastSeen ? `last seen ${formatTime(lastSeen)}` : 'offline';
    }
  }

  let typingHideTimeout = null;
  function showTyping() {
    statusEl.classList.remove('online');
    statusEl.classList.add('typing');
    statusEl.innerHTML =
      'type kar raha hai <span class="typing-dots"><span></span><span></span><span></span></span>';
    clearTimeout(typingHideTimeout);
    typingHideTimeout = setTimeout(hideTyping, 3000);
  }
  function hideTyping() {
    statusEl.classList.remove('typing');
    setStatus(lastKnownOnline, lastKnownSeen);
  }

  // ---------- skeleton + app loader ----------

  function showSkeleton() {
    const pattern = ['their', 'own', 'their', 'own', 'their'];
    pattern.forEach((side, i) => {
      const row = document.createElement('div');
      row.className = 'skeleton-row ' + side;
      const bubble = document.createElement('div');
      bubble.className = 'skeleton-bubble';
      bubble.style.width = 90 + (i % 3) * 40 + 'px';
      row.appendChild(bubble);
      messagesEl.appendChild(row);
    });
  }
  function clearSkeleton() {
    messagesEl.querySelectorAll('.skeleton-row').forEach((el) => el.remove());
  }
  function hideAppLoader() {
    appLoader.classList.add('hidden');
    setTimeout(() => appLoader.remove(), 300);
  }

  // ---------- long press (for reactions) ----------

  function attachLongPress(el, onLongPress) {
    let pressTimer = null;
    let triggered = false;
    let startX = 0;
    let startY = 0;

    function start(e) {
      triggered = false;
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      pressTimer = setTimeout(() => {
        triggered = true;
        onLongPress(e);
      }, 450);
    }
    function cancel() {
      clearTimeout(pressTimer);
    }
    function move(e) {
      const point = e.touches ? e.touches[0] : e;
      if (Math.abs(point.clientX - startX) > 10 || Math.abs(point.clientY - startY) > 10) cancel();
    }

    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    return {
      wasTriggered: () => triggered,
      resetTriggered: () => {
        triggered = false;
      }
    };
  }

  function showReactionQuickbar(anchorEl, msg) {
    closeReactionQuickbar();
    const bar = document.createElement('div');
    bar.className = 'reaction-quickbar';

    const replyBtn = document.createElement('button');
    replyBtn.type = 'button';
    replyBtn.innerHTML = replyIconSvg;
    replyBtn.setAttribute('aria-label', 'Reply karo');
    replyBtn.addEventListener('click', () => {
      setReplyTarget(msg);
      closeReactionQuickbar();
    });
    bar.appendChild(replyBtn);

    QUICK_REACTIONS.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        socket.emit('react_message', { messageId: msg._id, emoji }, (ack) => {
          if (!ack || !ack.ok) toast(ack && ack.error ? ack.error : 'Reaction fail ho gayi');
        });
        closeReactionQuickbar();
      });
      bar.appendChild(btn);
    });
    document.body.appendChild(bar);

    const rect = anchorEl.getBoundingClientRect();
    const barWidth = bar.offsetWidth || QUICK_REACTIONS.length * 40;
    let left = rect.left + rect.width / 2 - barWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - barWidth - 8));
    let top = rect.top - 52;
    if (top < 8) top = rect.bottom + 8;
    bar.style.left = `${left}px`;
    bar.style.top = `${top}px`;

    setTimeout(() => document.addEventListener('click', onDocClickCloseQuickbar, true), 0);
  }

  function renderReactions(row, reactions) {
    const existing = row.querySelector('.reaction-row');
    if (existing) existing.remove();
    if (!reactions || reactions.length === 0) return;
    const wrap = document.createElement('div');
    wrap.className = 'reaction-row';
    reactions.forEach((r) => {
      const pill = document.createElement('span');
      pill.className = 'reaction-pill' + (r.username === myUsername ? ' mine' : '');
      pill.textContent = r.emoji;
      wrap.appendChild(pill);
    });
    row.appendChild(wrap);
  }

  // ---------- voice waveform generation ----------

  const WAVE_BAR_COUNT = 32;

  async function generateWaveformPeaks(url, barCount) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    const arrayBuffer = await res.arrayBuffer();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error('no AudioContext');
    const ctx = new AudioCtx();
    let peaks;
    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const rawData = audioBuffer.getChannelData(0);
      const blockSize = Math.max(1, Math.floor(rawData.length / barCount));
      peaks = [];
      for (let i = 0; i < barCount; i++) {
        const start = i * blockSize;
        let sum = 0;
        let count = 0;
        for (let j = 0; j < blockSize; j++) {
          const v = rawData[start + j];
          if (v !== undefined) {
            sum += Math.abs(v);
            count++;
          }
        }
        peaks.push(count ? sum / count : 0);
      }
      const max = Math.max(...peaks, 0.0001);
      peaks = peaks.map((p) => Math.min(1, p / max));
    } finally {
      ctx.close();
    }
    return peaks;
  }

  function fallbackPeaks(barCount) {
    const peaks = [];
    for (let i = 0; i < barCount; i++) {
      const pseudo = Math.abs(Math.sin(i * 12.9898 + i));
      peaks.push(0.25 + pseudo * 0.65);
    }
    return peaks;
  }

  // ---------- custom voice player (waveform, WhatsApp style) ----------

  function buildVoicePlayer(url, knownDuration) {
    const wrap = document.createElement('div');
    wrap.className = 'voice-player';

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'voice-play-btn';
    playBtn.innerHTML = playIconSvg;

    const waveform = document.createElement('div');
    waveform.className = 'voice-waveform';
    const bars = [];
    for (let i = 0; i < WAVE_BAR_COUNT; i++) {
      const bar = document.createElement('span');
      bar.style.height = '4px';
      waveform.appendChild(bar);
      bars.push(bar);
    }

    const time = document.createElement('span');
    time.className = 'voice-time';
    time.textContent = knownDuration ? formatDuration(knownDuration) : '0:00';

    const audio = document.createElement('audio');
    audio.src = url;
    audio.preload = 'metadata';
    audio.style.display = 'none';

    function applyPeaks(peaks) {
      peaks.forEach((p, i) => {
        if (bars[i]) bars[i].style.height = Math.max(3, Math.round(p * 22)) + 'px';
      });
    }

    generateWaveformPeaks(url, WAVE_BAR_COUNT)
      .then(applyPeaks)
      .catch(() => applyPeaks(fallbackPeaks(WAVE_BAR_COUNT)));

    function setPlayedBars(ratio) {
      const playedCount = Math.round(ratio * WAVE_BAR_COUNT);
      bars.forEach((bar, i) => bar.classList.toggle('played', i < playedCount));
    }

    playBtn.addEventListener('click', () => {
      document.querySelectorAll('audio').forEach((a) => {
        if (a !== audio) a.pause();
      });
      if (audio.paused) audio.play();
      else audio.pause();
    });

    audio.addEventListener('play', () => {
      playBtn.innerHTML = pauseIconSvg;
    });
    audio.addEventListener('pause', () => {
      playBtn.innerHTML = playIconSvg;
    });
    audio.addEventListener('ended', () => {
      playBtn.innerHTML = playIconSvg;
      setPlayedBars(0);
      time.textContent = knownDuration ? formatDuration(knownDuration) : formatDuration(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setPlayedBars(audio.currentTime / audio.duration);
        time.textContent = formatDuration(audio.currentTime);
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration)) time.textContent = formatDuration(audio.duration);
    });

    waveform.addEventListener('click', (e) => {
      if (!audio.duration) return;
      const rect = waveform.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
    });

    wrap.appendChild(playBtn);
    wrap.appendChild(waveform);
    wrap.appendChild(time);
    wrap.appendChild(audio);
    return wrap;
  }

  // ---------- view-once ----------

  function buildViewOnceInner(msg) {
    const isMine = msg.sender === myUsername;
    const wrap = document.createElement('div');
    wrap.className = 'view-once-bubble' + (msg.viewed ? ' opened' : '') + (isMine ? ' mine-sent' : '');
    wrap.innerHTML = isMine ? sentIconSvg : eyeIconSvg;

    const label = document.createElement('span');
    if (isMine) {
      label.textContent = msg.viewed
        ? 'Dekh liya gaya'
        : msg.type === 'video'
        ? 'Video bheji · 1 baar'
        : 'Photo bheji · 1 baar';
    } else {
      label.textContent = msg.viewed ? 'Dekh liya' : msg.type === 'video' ? 'Video · 1 baar' : 'Photo · 1 baar';
    }
    wrap.appendChild(label);

    if (!isMine && !msg.viewed) {
      wrap.addEventListener('click', () => {
        if (wrap._longPress && wrap._longPress.wasTriggered()) {
          wrap._longPress.resetTriggered();
          return;
        }
        openViewOnce(msg);
      });
    } else {
      wrap.classList.add('no-open');
    }
    return wrap;
  }

  function buildWatermarkDataUri(label) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120"><text x="0" y="60" fill="rgba(255,255,255,0.16)" font-size="13" font-family="sans-serif" transform="rotate(-30 90 60)">${label}</text></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }

  function openViewOnce(msg) {
    // Sender can never open their own view-once media, even if triggered programmatically.
    if (msg.sender === myUsername) return;
    if (msg.viewed || !msg.mediaUrl) return;
    modalMediaWrap.innerHTML = '';

    let el;
    if (msg.type === 'video') {
      el = document.createElement('video');
      el.controls = true;
      el.autoplay = true;
    } else {
      el = document.createElement('img');
    }
    el.src = msg.mediaUrl;
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    el.addEventListener('dragstart', (e) => e.preventDefault());
    modalMediaWrap.appendChild(el);

    const watermark = document.createElement('div');
    watermark.className = 'watermark-overlay';
    watermark.style.backgroundImage = buildWatermarkDataUri(`${myUsername} · ${formatTime(new Date())}`);
    modalMediaWrap.appendChild(watermark);

    modal.classList.remove('hidden');
    socket.emit('view_once_open', { messageId: msg._id });
  }

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  avatarModal.addEventListener('click', (e) => {
    if (e.target === avatarModal) closeAvatarModal();
  });
  closeAvatarModalBtn.addEventListener('click', closeAvatarModal);

  function openAvatarModal() {
    avatarViewPhoto.innerHTML = '';
    if (otherProfile.avatarUrl) {
      const img = document.createElement('img');
      img.src = otherProfile.avatarUrl;
      img.alt = 'avatar';
      avatarViewPhoto.appendChild(img);
    } else {
      avatarViewPhoto.textContent = otherUser.charAt(0).toUpperCase();
    }
    avatarViewName.textContent = currentOtherDisplayName();
    avatarModal.classList.remove('hidden');
  }

  avatarEl.addEventListener('click', openAvatarModal);
  avatarEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAvatarModal();
    }
  });

  function markBubbleOpened(id) {
    const row = messagesEl.querySelector(`.bubble-row[data-id="${id}"]`);
    if (!row) return;
    const inner = row.querySelector('.view-once-bubble');
    if (!inner) return;
    inner.classList.add('opened');
    const label = inner.querySelector('span');
    if (label) label.textContent = 'Dekh liya';
    inner.replaceWith(inner.cloneNode(true));
  }

  // ---------- rendering messages ----------

  function renderMessage(msg) {
    if (renderedIds.has(msg._id)) return;
    renderedIds.add(msg._id);

    const isMine = msg.sender === myUsername;

    const row = document.createElement('div');
    row.className = 'bubble-row ' + (isMine ? 'own' : 'their');
    row.dataset.id = msg._id;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const senderLabel = document.createElement('span');
    senderLabel.className = 'bubble-sender';
    senderLabel.textContent = isMine ? 'You' : currentOtherDisplayName();
    bubble.appendChild(senderLabel);

    // Reply quote — chahe original message maine bheja ho ya dost ne,
    // dono cases handle hote hain kyunke msg.replyTo.sender se decide
    // hota hai quote ka naam "You" hoga ya dost ka.
    if (msg.replyTo) {
      const quote = document.createElement('div');
      quote.className = 'bubble-quote';
      const isReplyMine = msg.replyTo.sender === myUsername;

      const line = document.createElement('span');
      line.className = 'bubble-quote-line';
      quote.appendChild(line);

      const textWrap = document.createElement('div');
      textWrap.className = 'bubble-quote-text';
      const nameEl = document.createElement('span');
      nameEl.className = 'bubble-quote-name';
      nameEl.textContent = isReplyMine ? 'You' : currentOtherDisplayName();
      const snippetEl = document.createElement('span');
      snippetEl.className = 'bubble-quote-snippet';
      snippetEl.textContent = msg.replyTo.preview || '';
      textWrap.appendChild(nameEl);
      textWrap.appendChild(snippetEl);
      quote.appendChild(textWrap);

      quote.addEventListener('click', () => scrollToMessage(msg.replyTo.id));
      bubble.appendChild(quote);
    }

    if (msg.viewOnce) {
      const inner = buildViewOnceInner(msg);
      bubble.appendChild(inner);
      const lp = attachLongPress(bubble, () => showReactionQuickbar(bubble, msg));
      inner._longPress = lp;
    } else if (msg.type === 'image') {
      const img = document.createElement('img');
      img.className = 'msg-media';
      img.src = msg.mediaUrl;
      img.alt = 'photo';
      img.loading = 'lazy';
      bubble.appendChild(img);
      attachLongPress(bubble, () => showReactionQuickbar(bubble, msg));
    } else if (msg.type === 'video') {
      const vid = document.createElement('video');
      vid.className = 'msg-media';
      vid.src = msg.mediaUrl;
      vid.controls = true;
      vid.preload = 'metadata';
      bubble.appendChild(vid);
      attachLongPress(bubble, () => showReactionQuickbar(bubble, msg));
    } else if (msg.type === 'voice') {
      bubble.appendChild(buildVoicePlayer(msg.mediaUrl, msg.mediaMeta && msg.mediaMeta.duration));
      attachLongPress(bubble, () => showReactionQuickbar(bubble, msg));
    } else {
      const span = document.createElement('span');
      span.className = 'msg-text';
      span.textContent = msg.text;
      bubble.appendChild(span);
      attachLongPress(bubble, () => showReactionQuickbar(bubble, msg));
    }

    const meta = document.createElement('span');
    meta.className = 'bubble-meta';
    meta.textContent = formatTime(msg.createdAt);
    bubble.appendChild(meta);

    row.appendChild(bubble);
    messagesEl.appendChild(row);

    attachSwipeToReply(row, msg);
    renderReactions(row, msg.reactions);
    scrollToBottom();
  }

  // ---------- profile ----------

  async function loadProfile() {
    try {
      const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      myProfile = data.me;
      otherProfile = data.other;
      applyProfile();
    } catch (err) {
      toast('Profile load nahi ho saka');
    }
  }

  function applyProfile() {
    document.documentElement.setAttribute('data-theme', myProfile.themeColor || 'teal');
    messagesEl.className = 'messages wallpaper-' + (myProfile.wallpaper || 'default');

    setAvatarEl(avatarEl, otherProfile.avatarUrl, otherUser.charAt(0).toUpperCase());
    document.getElementById('otherName').textContent = currentOtherDisplayName();

    setAvatarEl(myAvatarPreview, myProfile.avatarUrl, myUsername.charAt(0).toUpperCase());
    nicknameInput.value = myProfile.nicknameForOther || '';
    markSelectedSwatch(wallpaperSwatches, myProfile.wallpaper || 'default');
    markSelectedSwatch(themeSwatches, myProfile.themeColor || 'teal');
  }

  async function savePrefs(partial) {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(partial)
      });
      if (!res.ok) toast('Setting save nahi hui');
    } catch (err) {
      toast('Setting save nahi hui');
    }
  }

  changeAvatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Sirf image select karo');
      avatarInput.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast('Image 8MB se choti honi chahiye');
      avatarInput.value = '';
      return;
    }
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || 'Upload fail ho gaya');
        return;
      }
      myProfile.avatarUrl = data.avatarUrl;
      setAvatarEl(myAvatarPreview, data.avatarUrl, myUsername.charAt(0).toUpperCase());
      toast('Profile picture update ho gayi');
    } catch (err) {
      toast('Upload nahi ho saka');
    } finally {
      avatarInput.value = '';
    }
  });

  saveNicknameBtn.addEventListener('click', async () => {
    const value = nicknameInput.value.trim();
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nicknameForOther: value })
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || 'Save nahi hua');
        return;
      }
      myProfile.nicknameForOther = data.nicknameForOther;
      document.getElementById('otherName').textContent = currentOtherDisplayName();
      messagesEl.querySelectorAll('.bubble-row.their .bubble-sender').forEach((el) => {
        el.textContent = currentOtherDisplayName();
      });
      messagesEl.querySelectorAll('.bubble-quote-name').forEach((el) => {
        if (el.textContent !== 'You') el.textContent = currentOtherDisplayName();
      });
      toast('Naam save ho gaya');
    } catch (err) {
      toast('Save nahi hua');
    }
  });

  wallpaperSwatches.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-wallpaper]');
    if (!btn) return;
    const value = btn.dataset.wallpaper;
    messagesEl.className = 'messages wallpaper-' + value;
    markSelectedSwatch(wallpaperSwatches, value);
    myProfile.wallpaper = value;
    savePrefs({ wallpaper: value });
  });

  themeSwatches.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-theme]');
    if (!btn) return;
    const value = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', value);
    markSelectedSwatch(themeSwatches, value);
    myProfile.themeColor = value;
    savePrefs({ themeColor: value });
  });

  settingsBtn.addEventListener('click', () => {
    hideEmoji();
    hideSearch();
    settingsPanel.classList.remove('hidden');
  });
  closeSettingsBtn.addEventListener('click', hideSettings);
  settingsBackdrop.addEventListener('click', hideSettings);

  // ---------- search ----------

  searchBtn.addEventListener('click', () => {
    hideSettings();
    hideEmoji();
    searchBar.classList.remove('hidden');
    searchInput.focus();
  });
  closeSearchBtn.addEventListener('click', hideSearch);

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const rows = Array.from(messagesEl.querySelectorAll('.bubble-row'));
    if (!q) {
      rows.forEach((row) => row.classList.remove('search-hidden', 'search-match'));
      searchCount.textContent = '';
      return;
    }
    let matchCount = 0;
    rows.forEach((row) => {
      const textEl = row.querySelector('.msg-text');
      const text = textEl ? textEl.textContent.toLowerCase() : '';
      const isMatch = text.includes(q);
      row.classList.toggle('search-hidden', !isMatch);
      row.classList.toggle('search-match', isMatch);
      if (isMatch) matchCount += 1;
    });
    searchCount.textContent = matchCount ? `${matchCount} mile` : 'koi nahi mila';
  });

  // ---------- emoji picker ----------

  function buildEmojiGrid() {
    emojiGrid.innerHTML = '';
    Object.entries(EMOJI_CATEGORIES).forEach(([cat, emojis]) => {
      const label = document.createElement('div');
      label.className = 'emoji-cat-label';
      label.textContent = cat;
      emojiGrid.appendChild(label);
      emojis.forEach((emo) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = emo;
        btn.addEventListener('click', () => insertEmoji(emo));
        emojiGrid.appendChild(btn);
      });
    });
  }

  function insertEmoji(emo) {
    const start = textInput.selectionStart != null ? textInput.selectionStart : textInput.value.length;
    const end = textInput.selectionEnd != null ? textInput.selectionEnd : textInput.value.length;
    textInput.value = textInput.value.slice(0, start) + emo + textInput.value.slice(end);
    const cursor = start + emo.length;
    textInput.focus();
    textInput.setSelectionRange(cursor, cursor);
    autoGrow();
  }

  emojiBtn.addEventListener('click', () => {
    hideSettings();
    hideSearch();
    if (!emojiGridBuilt) {
      buildEmojiGrid();
      emojiGridBuilt = true;
    }
    emojiPicker.classList.toggle('hidden');
  });

  // ---------- socket ----------

  const socket = io({ auth: { token } });

  socket.on('connect_error', () => {
    statusEl.textContent = 'connection error';
  });

  socket.on('presence', (p) => {
    if (p.username === otherUser) setStatus(p.online, p.lastSeen);
  });

  socket.on('typing', (p) => {
    if (p.username === otherUser) showTyping();
  });
  socket.on('stop_typing', (p) => {
    if (p.username === otherUser) hideTyping();
  });

  socket.on('new_message', (msg) => {
    messagesById.set(msg._id, msg);
    renderMessage(msg);
  });

  socket.on('message_viewed', ({ id }) => {
    const m = messagesById.get(id);
    if (m) {
      m.viewed = true;
      m.mediaUrl = '';
    }
    markBubbleOpened(id);
  });

  socket.on('reaction_updated', ({ id, reactions }) => {
    const m = messagesById.get(id);
    if (m) m.reactions = reactions;
    const row = messagesEl.querySelector(`.bubble-row[data-id="${id}"]`);
    if (row) renderReactions(row, reactions);
  });

  socket.on('profile_updated', (p) => {
    if (p.username === otherUser) {
      otherProfile.avatarUrl = p.avatarUrl;
      setAvatarEl(avatarEl, p.avatarUrl, otherUser.charAt(0).toUpperCase());
    }
  });

  // ---------- history ----------

  async function loadHistory() {
    try {
      const res = await fetch(`/api/messages?otherUser=${encodeURIComponent(otherUser)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      clearSkeleton();
      data.forEach((m) => {
        messagesById.set(m._id, m);
        renderMessage(m);
      });
    } catch (err) {
      clearSkeleton();
      toast('Purane messages load nahi ho sakay');
    }
  }

  // ---------- text send + typing + shortcuts ----------

  function autoGrow() {
    textInput.style.height = 'auto';
    textInput.style.height = Math.min(textInput.scrollHeight, 120) + 'px';
  }

  let typingTimeout = null;
  let isTypingSent = false;

  textInput.addEventListener('input', () => {
    autoGrow();
    if (!isTypingSent) {
      socket.emit('typing');
      isTypingSent = true;
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stop_typing');
      isTypingSent = false;
    }, 1500);
  });

  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      composer.requestSubmit();
    }
  });

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (!text) return;
    textInput.value = '';
    autoGrow();
    clearTimeout(typingTimeout);
    if (isTypingSent) {
      socket.emit('stop_typing');
      isTypingSent = false;
    }
    const payload = { text, type: 'text', receiver: otherUser };
    if (replyTarget) {
      payload.replyTo = { id: replyTarget._id, sender: replyTarget.sender, preview: replySnippetFor(replyTarget) };
    }
    socket.emit('send_message', payload, (ack) => {
      if (!ack || !ack.ok) toast(ack && ack.error ? ack.error : 'Message bhejne mein masla hua');
    });
    clearReplyTarget();
  });

  // ---------- media attach ----------

  let selectedFile = null;
  let selectedObjectUrl = null;

  attachBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (!/^image\/|^video\//.test(file.type)) {
      toast('Sirf photo ya video bhej saktay ho');
      fileInput.value = '';
      return;
    }
    // Chhoti ya lambi, koi bhi video chal jayegi — bas 300MB tak.
    if (file.size > MAX_MEDIA_BYTES) {
      toast(`File ${formatBytes(MAX_MEDIA_BYTES)} se choti honi chahiye`);
      fileInput.value = '';
      return;
    }
    selectedFile = file;
    selectedObjectUrl = URL.createObjectURL(file);
    previewContent.innerHTML = '';
    const el = file.type.startsWith('video') ? document.createElement('video') : document.createElement('img');
    el.src = selectedObjectUrl;
    if (el.tagName === 'VIDEO') el.muted = true;
    previewContent.appendChild(el);
    viewOnceToggle.checked = false;
    viewOnceLabel.classList.remove('active');
    previewBar.classList.remove('hidden');
  });

  viewOnceToggle.addEventListener('change', () => {
    viewOnceLabel.classList.toggle('active', viewOnceToggle.checked);
  });

  function resetMediaPreview() {
    previewBar.classList.add('hidden');
    previewContent.innerHTML = '';
    if (selectedObjectUrl) URL.revokeObjectURL(selectedObjectUrl);
    selectedObjectUrl = null;
    selectedFile = null;
    fileInput.value = '';
  }

  cancelMediaBtn.addEventListener('click', resetMediaPreview);

  sendMediaBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    sendMediaBtn.disabled = true;
    const wasViewOnce = viewOnceToggle.checked;
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch('/api/messages/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || 'Upload fail ho gaya');
        return;
      }
      socket.emit(
        'send_message',
        {
          type: data.mediaType,
          mediaUrl: data.url,
          viewOnce: wasViewOnce,
          receiver: otherUser,
          mediaMeta: { fileName: data.fileName, size: data.size },
          ...(replyTarget
            ? { replyTo: { id: replyTarget._id, sender: replyTarget.sender, preview: replySnippetFor(replyTarget) } }
            : {})
        },
        (ack) => {
          if (!ack || !ack.ok) toast(ack && ack.error ? ack.error : 'Message bhejne mein masla hua');
        }
      );
      resetMediaPreview();
      clearReplyTarget();
    } catch (err) {
      toast('Upload nahi ho saka');
    } finally {
      sendMediaBtn.disabled = false;
    }
  });

  // ---------- voice recording ----------

  let mediaRecorder = null;
  let recChunks = [];
  let recStream = null;
  let recStartedAt = 0;
  let recTimerInterval = null;
  let discardRecording = false;

  function stopStreamTracks() {
    if (recStream) {
      recStream.getTracks().forEach((t) => t.stop());
      recStream = null;
    }
  }

  async function startRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') return;
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Ye browser voice recording support nahi karta');
      return;
    }
    try {
      recStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      toast('Mic ki permission nahi mili');
      return;
    }

    discardRecording = false;
    recChunks = [];
    mediaRecorder = new MediaRecorder(recStream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recChunks.push(e.data);
    };
    mediaRecorder.onstop = onRecordingStop;
    mediaRecorder.start();

    recStartedAt = Date.now();
    recTimer.textContent = '0:00';
    recTimerInterval = setInterval(() => {
      recTimer.textContent = formatDuration((Date.now() - recStartedAt) / 1000);
    }, 500);

    recordingBar.classList.remove('hidden');
  }

  async function onRecordingStop() {
    clearInterval(recTimerInterval);
    const duration = Math.round((Date.now() - recStartedAt) / 1000);
    stopStreamTracks();
    recordingBar.classList.add('hidden');

    if (discardRecording || recChunks.length === 0) {
      recChunks = [];
      return;
    }

    const blob = new Blob(recChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
    recChunks = [];

    try {
      const form = new FormData();
      form.append('file', blob, 'voice.webm');
      const res = await fetch('/api/messages/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.message || 'Voice upload fail ho gaya');
        return;
      }
      socket.emit(
        'send_message',
        {
          type: 'voice',
          mediaUrl: data.url,
          viewOnce: false,
          receiver: otherUser,
          mediaMeta: { duration, fileName: data.fileName, size: data.size },
          ...(replyTarget
            ? { replyTo: { id: replyTarget._id, sender: replyTarget.sender, preview: replySnippetFor(replyTarget) } }
            : {})
        },
        (ack) => {
          if (!ack || !ack.ok) toast(ack && ack.error ? ack.error : 'Voice message bhejne mein masla hua');
        }
      );
      clearReplyTarget();
    } catch (err) {
      toast('Voice upload nahi ho saka');
    }
  }

  micBtn.addEventListener('click', startRecording);

  stopRecBtn.addEventListener('click', () => {
    discardRecording = false;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  });

  cancelRecBtn.addEventListener('click', () => {
    discardRecording = true;
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  });

  // ---------- logout ----------

  function logout() {
    socket.close();
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_username');
    localStorage.removeItem('chat_otherUser');
    window.location.href = '/index.html';
  }

  document.getElementById('logoutBtn').addEventListener('click', logout);

  // ---------- init ----------

  showSkeleton();
  Promise.all([loadProfile(), loadHistory()]).finally(hideAppLoader);
})();