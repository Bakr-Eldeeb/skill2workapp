import QRCode from 'qrcode';
import { FairRegistration } from './models';
export function ticketPayload(r: FairRegistration) {
  return 'skill2work:fair-ticket:' + r.ticketToken;
}
export function ticketSvg(r: FairRegistration) {
  const qr = QRCode.create(ticketPayload(r), { errorCorrectionLevel: 'M' });
  const n = qr.modules.size;
  let path = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) path += `M${x + 4} ${y + 4}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n + 8} ${n + 8}" width="240" height="240"><rect width="100%" height="100%" fill="white"/><path d="${path}" fill="#111729"/></svg>`;
}
