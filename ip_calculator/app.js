
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}
function intToIp(n) {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>>  8) & 255,
     n         & 255
  ].join('.');
}

function isValidIp(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => !isNaN(p) && parseInt(p) >= 0 && parseInt(p) <= 255);
}

function getIpClass(firstOctet) {
  if (firstOctet < 128) return { label: 'A', style: 'ca' };
  if (firstOctet < 192) return { label: 'B', style: 'cb' };
  if (firstOctet < 224) return { label: 'C', style: 'cc' };
  return { label: 'Other', style: 'ca' };
}

function isPrivateIp(ip) {
  const [a, b] = ip.split('.').map(Number);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function calculate() {
  const ip   = document.getElementById('ip').value.trim();
  const cidr = parseInt(document.getElementById('cidr').value);
  const err  = document.getElementById('err');
  const res  = document.getElementById('results');

  if (!isValidIp(ip)) {
    err.style.display = 'block';
    res.style.display = 'none';
    return;
  }
  err.style.display = 'none';

  const mask      = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const ipInt     = ipToInt(ip);
  const network   = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const firstHost = (network + 1) >>> 0;
  const lastHost  = (broadcast - 1) >>> 0;
  const hostCount = Math.pow(2, 32 - cidr) - 2;
  const wildcard  = intToIp((~mask) >>> 0);

  document.getElementById('r-net').textContent   = intToIp(network) + '/' + cidr;
  document.getElementById('r-mask').textContent  = intToIp(mask);
  document.getElementById('r-wild').textContent  = wildcard;
  document.getElementById('r-first').textContent = hostCount > 0 ? intToIp(firstHost) : 'N/A';
  document.getElementById('r-last').textContent  = hostCount > 0 ? intToIp(lastHost)  : 'N/A';
  document.getElementById('r-bcast').textContent = intToIp(broadcast);
  document.getElementById('r-hosts').textContent = hostCount > 0
    ? hostCount.toLocaleString() + ' hosts'
    : 'Point-to-point link';

  const { label, style } = getIpClass(parseInt(ip.split('.')[0]));
  document.getElementById('r-class').innerHTML =
    `<span class="class-badge ${style}">Class ${label}</span>`;

  document.getElementById('r-type').textContent = isPrivateIp(ip)
    ? 'Private (RFC 1918)'
    : 'Public';

  res.style.display = 'block';
}
