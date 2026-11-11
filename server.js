// Ud på jakt på lokalnettet: serverer spillet og videresender meldinger mellom nettleserne.
// Ingen avhengigheter. Bygg først (bash build.sh), start så med: node --watch server.js
// (--watch starter serveren på nytt når denne fila endres; endringer i src/ bygges og lastes inn i nettleserne av seg selv)
// Én nettleser (verten) simulerer dyra; serveren velger vert og sender meldingene videre.
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path'), os = require('os'), { execFile } = require('child_process');

const PORT = Number(process.env.PORT) || 8080;
const PAGE = path.join(__dirname, 'dist', 'test.html');
const MAX_FRAME = 4 * 1024 * 1024;

const clients = new Map();
let nextId = 1, hostId = 0;

function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === 'IPv4' && !n.internal) out.push(`http://${n.address}:${PORT}`);
  return out;
}

// Nettlesere på maskinen som kjører serveren, kan kaste ut andre (localhost eller maskinens egne adresser)
function isLocal(addr) {
  const a = String(addr || '').replace(/^::ffff:/, '');
  if (a === '::1' || a.startsWith('127.')) return true;
  for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.address === a) return true;
  return false;
}

// ---------- WebSocket (RFC 6455), bare det spillet trenger ----------
function frame(op, payload) {
  const n = payload.length;
  let head;
  if (n < 126) head = Buffer.from([0x80 | op, n]);
  else if (n < 65536) { head = Buffer.alloc(4); head[0] = 0x80 | op; head[1] = 126; head.writeUInt16BE(n, 2); }
  else { head = Buffer.alloc(10); head[0] = 0x80 | op; head[1] = 127; head.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([head, payload]);
}
function write(c, buf) { if (!c.sock.destroyed) c.sock.write(buf); }
function send(c, obj) { write(c, frame(1, Buffer.from(JSON.stringify(obj)))); }
function broadcast(obj, except) {
  const f = frame(1, Buffer.from(JSON.stringify(obj)));
  for (const c of clients.values()) if (c !== except) write(c, f);
}

function onData(c, chunk) {
  c.buf = c.buf.length ? Buffer.concat([c.buf, chunk]) : chunk;
  for (;;) {
    const b = c.buf;
    if (b.length < 2) return;
    const fin = b[0] & 0x80, op = b[0] & 0x0f, masked = b[1] & 0x80;
    let len = b[1] & 0x7f, off = 2;
    if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
    if (!masked || len > MAX_FRAME) { c.sock.destroy(); return; }
    if (b.length < off + 4 + len) return;
    const mask = b.subarray(off, off + 4), data = Buffer.from(b.subarray(off + 4, off + 4 + len));
    for (let i = 0; i < len; i++) data[i] ^= mask[i & 3];
    c.buf = b.subarray(off + 4 + len);
    c.alive = true;
    if (op === 8) { write(c, frame(8, Buffer.alloc(0))); c.sock.end(); return; }
    if (op === 9) { write(c, frame(10, data)); continue; }
    if (op === 1 || op === 0) {
      c.parts.push(data);
      if (fin) { const text = Buffer.concat(c.parts).toString('utf8'); c.parts = []; onMessage(c, text); }
    }
  }
}

// ---------- rom: én vert, resten speiler ----------
function elect() {
  const cur = clients.get(hostId);
  if (cur && !cur.away) return;
  const all = [...clients.values()], pick = all.find(c => !c.away) || all[0], id = pick ? pick.id : 0;
  if (id !== hostId) { hostId = id; if (id) broadcast({ t: 'host', id }); }
}

function onMessage(c, text) {
  let m;
  try { m = JSON.parse(text); } catch (e) { return; }
  if (!m || typeof m !== 'object') return;
  if (m.t === 'away') { c.away = !!m.v; elect(); return; }
  if (m.t === 'kick') {
    const t = clients.get(m.id);
    if (c.admin && t && t !== c) { send(t, { t: 'kicked' }); t.sock.end(); console.log(`Jeger ${t.id} ble kastet ut`); }
    return;
  }
  m.from = c.id;
  if (m.to) { const t = clients.get(m.to); if (t) send(t, m); }
  else broadcast(m, c);
}

function join(sock) {
  const c = { id: nextId++, sock, buf: Buffer.alloc(0), parts: [], away: false, alive: true, admin: isLocal(sock.remoteAddress) };
  clients.set(c.id, c);
  elect();
  send(c, { t: 'hello', id: c.id, host: hostId, peers: [...clients.keys()].filter(id => id !== c.id), urls: lanUrls(), admin: c.admin });
  broadcast({ t: 'join', id: c.id }, c);
  console.log(`Jeger ${c.id} koblet til (${clients.size} totalt)`);
  sock.on('data', d => onData(c, d));
  const leave = () => {
    if (!clients.delete(c.id)) return;
    broadcast({ t: 'leave', id: c.id }); elect();
    console.log(`Jeger ${c.id} gikk (${clients.size} igjen)`);
  };
  sock.on('close', leave);
  sock.on('error', leave);
  return c;
}

// Ping jevnlig, og kast ut nettlesere som ikke svarer (f.eks. en maskin som har sovnet)
setInterval(() => {
  for (const c of clients.values()) {
    if (!c.alive) { c.sock.destroy(); continue; }
    c.alive = false; write(c, frame(9, Buffer.alloc(0)));
  }
}, 15000);

// ---------- omlasting: endres noe i src/, bygges spillet på nytt og nettleserne laster inn siden ----------
const SRC = path.join(__dirname, 'src');
let buildT = null, building = false, again = false;
function rebuild() {
  if (building) { again = true; return; }
  building = true;
  execFile('bash', [path.join(__dirname, 'build.sh')], (err, out, errOut) => {
    building = false;
    // feiler bygget (f.eks. en syntaksfeil), får nettleserne beholde versjonen de har
    if (err) console.log('Bygget feilet, nettleserne beholder den gamle versjonen:\n' + String(errOut || err.message).trim());
    else { console.log(`Bygget på nytt, laster inn siden hos ${clients.size} nettleser${clients.size === 1 ? '' : 'e'}`); broadcast({ t: 'reload' }); }
    if (again) { again = false; rebuild(); }
  });
}
// editorer lagrer gjerne i flere steg, så den venter litt før den bygger
if (fs.existsSync(SRC)) fs.watch(SRC, (ev, file) => { if (!file || !/\.(js|html)$/.test(file)) return; clearTimeout(buildT); buildT = setTimeout(rebuild, 150); });

// ---------- http ----------
const server = http.createServer((req, res) => {
  if (req.method !== 'GET' || req.url.split('?')[0] !== '/') { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Ikke funnet'); return; }
  fs.readFile(PAGE, (err, data) => {
    if (err) { res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Fant ikke dist/test.html. Kjør «bash build.sh» først.'); return; }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(data);
  });
});

server.on('upgrade', (req, sock, head) => {
  const key = req.headers['sec-websocket-key'];
  if (req.url !== '/ws' || !key || String(req.headers.upgrade).toLowerCase() !== 'websocket') { sock.destroy(); return; }
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  sock.setNoDelay(true);
  const c = join(sock);
  if (head && head.length) onData(c, head);
});

server.listen(PORT, () => {
  console.log(`Ud på jakt kjører på http://localhost:${PORT}`);
  const urls = lanUrls();
  if (urls.length) console.log('Andre på samme nett kan åpne:\n  ' + urls.join('\n  '));
});
