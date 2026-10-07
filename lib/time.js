// All session times are Budapest local time. Stored in the database as UTC.
export const TZ = 'Europe/Budapest';

function parts(ts) {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
  const o = {};
  for (const p of f.formatToParts(new Date(ts))) o[p.type] = p.value;
  return o;
}

function offsetMs(ts) {
  const p = parts(ts);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return asUtc - Math.floor(ts / 60000) * 60000;
}

// "2026-10-15" + "12:30" (Budapest time) -> Date (UTC instant)
export function zonedToUtc(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let res = guess - offsetMs(guess);
  const off2 = offsetMs(res);
  if (guess - off2 !== res) res = guess - off2;
  return new Date(res);
}

// For <input type="datetime-local"> values (Budapest local)
export function toLocalInput(iso) {
  const p = parts(new Date(iso).getTime());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function localInputToUtc(value) {
  const [d, t] = value.split('T');
  return zonedToUtc(d, t);
}
export function dayKey(iso) {
  const p = parts(new Date(iso).getTime());
  return `${p.year}-${p.month}-${p.day}`;
}
export const fmtDay = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });
export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export const fmtStamp = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' }) : '';
