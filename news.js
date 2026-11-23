(function () {
  'use strict';
  function newsDate(cell) {
    const raw = cell && cell.v;
    let parts;
    if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
      parts = [raw.getFullYear(), raw.getMonth() + 1, raw.getDate()];
    } else {
      const value = String((cell && cell.f) || raw || '').trim();
      const iso = value.match(/^(\d{4})[-./]\s*(\d{1,2})[-./]\s*(\d{1,2})\.?$/);
      const google = String(raw || '').match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,[\d,]+)?\)$/);
      if (iso) parts = iso.slice(1).map(Number);
      else if (google) parts = [Number(google[1]), Number(google[2]) + 1, Number(google[3])];
      else return null;
    }
    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (year < 1900 || year > 2200 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  function safeCafeLink(value) {
    try {
      const url = new URL(String(value || '').trim());
      if (url.protocol !== 'https:' || url.username || url.password || url.port || !['cafe.naver.com', 'm.cafe.naver.com'].includes(url.hostname)) return null;
      return url.href;
    } catch { return null; }
  }
  function entries(response) {
    if (!response || response.status !== 'ok' || !response.table || !Array.isArray(response.table.cols) || !Array.isArray(response.table.rows)) throw new Error('Invalid news response');
    const expected = ['게시 여부', '날짜', '제목', '카페 글 링크'];
    if (expected.some((label, i) => String(response.table.cols[i]?.label || '').trim() !== label)) throw new Error('Invalid news headers');
    const result = response.table.rows.slice(0, 1000).flatMap(row => {
      const cells = row.c || [];
      if (cells[0]?.v !== true && String(cells[0]?.v).trim().toUpperCase() !== 'TRUE') return [];
      const date = newsDate(cells[1]);
      const title = String(cells[2]?.v || '').trim();
      const url = safeCafeLink(cells[3]?.v);
      return date && title && title.length <= 200 && url && url.length <= 2048 ? [{date, title, url}] : [];
    }).sort((a, b) => b.date.localeCompare(a.date));
    const seen = new Set();
    return result.filter(item => !seen.has(item.url) && seen.add(item.url)).slice(0, 3);
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = {newsDate, safeCafeLink, entries}; return; }
  const loader = document.currentScript;
  const section = document.getElementById('recent-news');
  if (!loader || !section) return;
  const list = section.querySelector('[data-news-list]');
  const status = section.querySelector('[data-news-status]');
  const retry = section.querySelector('[data-news-retry]');
  const sheetId = loader.dataset.sheetId;
  const gid = loader.dataset.sheetGid;
  let busy = false;
  function show(items) {
    list.replaceChildren();
    for (const item of items) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const date = document.createElement('time');
      date.dateTime = item.date;
      date.textContent = item.date.replaceAll('-', '.');
      const title = document.createElement('span');
      title.textContent = item.title;
      const hint = document.createElement('span');
      hint.className = 'visually-hidden';
      hint.textContent = ' (네이버 카페, 새 창)';
      link.append(date, title, hint);
      li.append(link);
      list.append(li);
    }
    list.hidden = !items.length;
    status.hidden = !!items.length;
    status.textContent = items.length ? '' : '새로운 모집·일정은 학교 소식 게시판에서도 확인하실 수 있어요.';
  }
  function load() {
    if (busy) return;
    busy = true;
    retry.hidden = true;
    status.hidden = false;
    status.textContent = '학교 소식을 불러오고 있어요.';
    section.setAttribute('aria-busy', 'true');
    const name = '__dmzSchoolNews' + Date.now();
    const script = document.createElement('script');
    let timer;
    function finish(error, response) {
      if (!busy) return;
      clearTimeout(timer);
      script.remove();
      window[name] = function () {};
      setTimeout(() => { delete window[name]; }, 60000);
      busy = false;
      section.setAttribute('aria-busy', 'false');
      try {
        if (error) throw error;
        show(entries(response));
      } catch {
        list.replaceChildren();
        list.hidden = true;
        status.hidden = false;
        status.textContent = '지금은 소식 목록을 불러오지 못했어요. 아래 학교 소식 게시판에서 확인해 주세요.';
        retry.hidden = false;
      }
    }
    window[name] = response => finish(null, response);
    const url = new URL(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`);
    url.search = new URLSearchParams({gid, range: 'A1:D1001', headers: '1', tqx: `out:json;responseHandler:${name}`}).toString();
    script.src = url.href;
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.onerror = () => finish(new Error('News unavailable'));
    timer = setTimeout(() => finish(new Error('News timed out')), 10000);
    document.head.append(script);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(sheetId || '') || !/^\d+$/.test(gid || '')) return;
  retry.addEventListener('click', load);
  load();
})();
