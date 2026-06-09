const axios = require('axios');
const CONFIG = require('../config');
const { sendZaloText } = require('../utils/zaloApi');

const BASE_URL = 'https://portal.dawaco.com.vn';
let tokenCache = { token: null, expiry: 0 };

async function getToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) return tokenCache.token;
  console.log('[DAWACO] Đang lấy token...');
  const res = await axios.post(
    `${BASE_URL}/api/Account/Login`,
    { email: CONFIG.DAWACO_EMAIL, password: CONFIG.DAWACO_PASSWORD },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  );
  const token = res.data?.token || res.data?.accessToken || res.data?.access_token;
  if (!token) throw new Error('Không lấy được token DAWACO');
  tokenCache = { token, expiry: Date.now() + 20 * 60 * 60 * 1000 };
  console.log('[DAWACO] Lấy token thành công');
  return token;
}

async function fetchOutages() {
  const token = await getToken();
  const res = await axios.get(`${BASE_URL}/api/LichCatNuoc`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15000,
  });
  return Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.items || []);
}

function formatOutageItem(item) {
  const ngay    = item.NgayCatNuoc || item.ngayCatNuoc || item.date || '—';
  const tuGio   = item.TuGio       || item.tuGio       || item.timeFrom || '';
  const denGio  = item.DenGio      || item.denGio      || item.timeTo   || '';
  const khuVuc  = item.KhuVuc      || item.khuVuc      || item.area     || '—';
  const lyDo    = item.LyDo        || item.lyDo        || item.reason   || '';
  const thoiGian = tuGio && denGio ? `${tuGio} – ${denGio}` : (tuGio || denGio || '—');

  return (
    `📍 Khu vực: ${khuVuc}\n` +
    `📅 Ngày: ${ngay}\n` +
    `⏰ Thời gian: ${thoiGian}` +
    (lyDo ? `\n📌 Lý do: ${lyDo}` : '')
  );
}

function matchesFilter(item, query) {
  const q = query.toLowerCase().trim();
  if (!q || q === 'tất cả' || q === 'tat ca') return true;

  const khuVuc = (item.KhuVuc || item.khuVuc || item.area || '').toLowerCase();
  const ngay   = (item.NgayCatNuoc || item.ngayCatNuoc || item.date || '').toLowerCase();

  // Tìm theo tên phường/xã
  if (khuVuc.includes(q)) return true;
  // Tìm theo ngày (dd/mm hoặc dd-mm)
  const dateNorm = q.replace(/-/g, '/');
  if (ngay.includes(dateNorm)) return true;

  return false;
}

async function sendWaterOutageCard(userId, query) {
  const items = await fetchOutages();

  const matched = items.filter(item => matchesFilter(item, query));

  if (!matched.length) {
    const hint = (query.toLowerCase() === 'tất cả' || query.toLowerCase() === 'tat ca')
      ? 'Hiện tại không có lịch tạm ngưng cấp nước nào.'
      : `Không tìm thấy lịch cắt nước cho "${query}".\n\nVui lòng thử tên phường/xã khác hoặc nhắn "tất cả" để xem toàn bộ.`;
    await sendZaloText(userId, `💧 ${hint}`);
    return;
  }

  const MAX_ITEMS = 5;
  const shown = matched.slice(0, MAX_ITEMS);
  const lines = shown.map((item, i) => `${i + 1}. ${formatOutageItem(item)}`).join('\n\n');
  const footer = matched.length > MAX_ITEMS
    ? `\n\n(Hiển thị ${MAX_ITEMS}/${matched.length} kết quả. Nhập tên phường/xã cụ thể hơn để thu hẹp.)`
    : '';

  await sendZaloText(userId,
    `💧 LỊCH TẠM NGƯNG CẤP NƯỚC\n` +
    `${'─'.repeat(28)}\n\n` +
    lines +
    footer +
    `\n\n📞 Hotline DAWACO: 0236 3800 115`
  );
}

module.exports = { sendWaterOutageCard };
