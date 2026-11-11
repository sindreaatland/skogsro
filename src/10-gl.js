// ===== 3D-grafikk: én three.js-scene som både kartet og siktet tegnes fra =====
// Verden er (x, høyde, y). Kartet ses i retningen CAM.yaw (dit jegeren ser) og skrått ned (GL_PITCH) uten perspektiv, siktet fra øynene til
// jegeren med samme projeksjon som strålene i 09-aim3d.js regner med. Bildet tegnes i lav oppløsning i et eget
// WebGL-lerret og legges så inn i spillets vanlige lerret, der sikter, merker og tekst tegnes oppå som før.
// Bakken er høydene og den tegnede bakken fra 03-world.js; trær, stein og busker er modeller som settes ut der spillet
// har dem (én tegning per slag for alle bitene som er lastet); husene bygges av de samme veggene og takene som
// kartbildene.
const GL = { r: null, cv: null, scene: null, camO: null, camP: null, amb: null, sun: null, pts: [], night: 0, frame: 0, synced: -1,
  recs: new Map(), inst: new Map(), instDirty: true, instT: 0, geo: {}, hid: new Map(), parts: null, w: 0, h: 0, lamps: [] };
const GL_PITCH = 45 * Math.PI / 180, GL_SIN = Math.sin(GL_PITCH), GL_COS = Math.cos(GL_PITCH), GL_PTS = 8, GL_PARTS = 1200;
const glMat = o => new THREE.MeshPhongMaterial(Object.assign({ specular: 0x000000, shininess: 0 }, o));

// ---------- former ----------
// Hver form er [geometri, farge]; glMerge slår dem sammen til én geometri med farge per hjørne. flat gir skarpe
// fasetter (trær og stein), ellers beholdes de myke normalene (dyr og folk)
const G3 = {
  sph: (rx, ry, rz, col, x = 0, y = 0, z = 0, det = 1) => [new THREE.IcosahedronGeometry(1, det).scale(rx, ry, rz).translate(x, y, z), col],
  // sylinder som står: rt øverst, rb nederst, bunnen i (x, y, z)
  cyl: (rt, rb, h, col, x = 0, y = 0, z = 0, seg = 7) => [new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y + h / 2, z), col],
  // sylinder som ligger langs x: r0 i (x, y, z), r1 i enden len lenger fram
  cylX: (r0, r1, len, col, x = 0, y = 0, z = 0, seg = 7) => [new THREE.CylinderGeometry(r1, r0, len, seg).rotateZ(-Math.PI / 2).translate(x + len / 2, y, z), col],
  cone: (r, h, col, x = 0, y = 0, z = 0, seg = 7) => [new THREE.ConeGeometry(r, h, seg).translate(x, y + h / 2, z), col],
  box: (w, h, d, col, x = 0, y = 0, z = 0) => [new THREE.BoxGeometry(w, h, d).translate(x, y, z), col],
  // pinne mellom to punkter
  stick(a, b, r, col) {
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length(), g = new THREE.CylinderGeometry(r * 0.7, r, len, 5);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()))); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    return [g, col];
  },
  // dreier en form rundt origo før den flyttes på plass
  turn(s, rx, ry, rz, x = 0, y = 0, z = 0) { if (rx) s[0].rotateX(rx); if (ry) s[0].rotateY(ry); if (rz) s[0].rotateZ(rz); s[0].translate(x, y, z); return s; },
};
const _glc = {};
function glRgb(hex) { return _glc[hex] || (_glc[hex] = (() => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; })()); }
function glMerge(parts, flat) {
  parts = parts.filter(Boolean);
  let n = 0;
  const gs = parts.map(([g, c]) => { g = g.index ? g.toNonIndexed() : g; n += g.attributes.position.count; return [g, glRgb(c)]; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const [g, c] of gs) {
    const k = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    for (let i = 0; i < k; i++) { col[(o + i) * 3] = c[0]; col[(o + i) * 3 + 1] = c[1]; col[(o + i) * 3 + 2] = c[2]; }
    o += k;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (flat) out.computeVertexNormals(); else out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}
// Ett nett av flere former, med skygge
function glMesh(parts, flat) { const me = new THREE.Mesh(glMerge(parts, flat), GL.matV); me.castShadow = true; return me; }
function glGroup(x, y, z, ...kids) { const g = new THREE.Group(); g.position.set(x, y, z); for (const k of kids) if (k) g.add(k); return g; }

// ---------- oppstart ----------
function glInit() {
  const r = GL.r = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  r.setPixelRatio(1); r.shadowMap.enabled = true; r.localClippingEnabled = true; GL.cv = r.domElement;
  const sc = GL.scene = new THREE.Scene();
  // disen brukes bare i siktet; på kartet står den så langt ute at den ikke synes (samme program for begge)
  sc.fog = new THREE.Fog(0xa9b6a2, 1e5, 1e6);
  GL.camO = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 9000);
  GL.camP = new THREE.PerspectiveCamera(50, 1, 4, 2000);
  GL.amb = new THREE.AmbientLight(0xffffff, 0.62); sc.add(GL.amb);
  const sun = GL.sun = new THREE.DirectionalLight(0xfff0dc, 0.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0015; sun.shadow.normalBias = 0.6;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 5000;
  sc.add(sun, sun.target);
  // lys fra bål, lykter og vinduer: et fast antall som flyttes dit det trengs (se glLights)
  for (let i = 0; i < GL_PTS; i++) { const p = new THREE.PointLight(0xff9440, 0, 200, 1.5); GL.pts.push(p); sc.add(p); }
  // det første er bålet nærmest deg, og det kaster skygger. Skyggene tegnes bare på kartet og annethvert bilde (se glLights)
  const fs = GL.pts[0].shadow; GL.pts[0].castShadow = true; fs.mapSize.set(512, 512); fs.camera.near = 2; fs.camera.far = 210; fs.bias = -0.004; fs.autoUpdate = false; fs.needsUpdate = true;
  GL.matV = glMat({ vertexColors: true });
  GL.matFar = glMat({ vertexColors: true });
  // det som lyser selv: lykteglass og fakler
  GL.matU = new THREE.MeshBasicMaterial({ vertexColors: true });
  // gress, bregner og siv tegnes ikke helt inntil øyet i siktet (GL.clip flyttes i glAim); der ville de bare dekket bildet
  GL.clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e9);
  GL.matG = glMat({ vertexColors: true, clippingPlanes: [GL.clip] });
  // trærne svaier i vinden: hvert hjørne skyves med vinden etter høyden over rota, mest i kastene som ruller gjennom skogen
  GL.wind = { uT: { value: 0 }, uW: { value: new THREE.Vector3() }, uA: { value: new THREE.Vector2() } };
  GL.matT = glMat({ vertexColors: true });
  GL.matT.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, GL.wind);
    sh.vertexShader = 'uniform float uT; uniform vec3 uW; uniform vec2 uA;\n' + sh.vertexShader.replace('#include <project_vertex>', `
      vec4 wp = vec4( transformed, 1.0 );
      #ifdef USE_INSTANCING
        wp = instanceMatrix * wp; vec3 tb = ( modelMatrix * instanceMatrix[ 3 ] ).xyz;
      #else
        vec3 tb = modelMatrix[ 3 ].xyz;
      #endif
      wp = modelMatrix * wp;
      float tk = clamp( ( wp.y - tb.y ) / 70.0, 0.0, 1.4 );
      float tg = 0.35 + 1.55 * smoothstep( -0.2, 0.9, sin( ( tb.x - uA.x ) * 0.021 ) * sin( ( tb.z - uA.y ) * 0.017 + 1.3 ) );
      float ts = ( sin( uT * 1.3 + tb.x * 0.37 + tb.z * 0.21 ) * 0.8 + 0.6 ) * uW.z * 2.2 * tg * tk * tk;
      wp.x += uW.x * ts; wp.z += uW.y * ts;
      vec4 mvPosition = viewMatrix * wp;
      gl_Position = projectionMatrix * mvPosition;`);
  };
  glGeoInit(); glFigInit();
  // partikler og blod: punkter med egen farge og gjennomsiktighet
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(GL_PARTS * 3), 3)); pg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(GL_PARTS * 4), 4));
  GL.parts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false }));
  GL.parts.frustumCulled = false; sc.add(GL.parts);
  for (const [k, x, y, v] of VOBJ) { const g = SPR[k][v].glow; if (g) for (const [gx, gy, ga] of g) GL.lamps.push([x + gx, y, -gy, ga]); }
  // gatelyktene har hvert sitt lys, så hele landsbyen er opplyst om natta uansett hvor du står (se glLights)
  GL.lampL = GL.lamps.map(() => { const p = new THREE.PointLight(0xffc870, 0, 110, 1.5); p.visible = false; sc.add(p); return p; });
}

// ---------- modellene til det som står stille ----------
// GL.geo[navn] = { geo, mat }. Trær har høyde og kronebredde 1 og strekkes til størrelsen på pikselbildet de erstatter
function glGeoInit() {
  const { sph, cyl, cylX, cone, box, stick } = G3, reg = (k, parts, flat = true, mat = GL.matV, nosh = 0) => { GL.geo[k] = { geo: glMerge(parts, flat), mat, nosh }; };
  const tree = (k, parts) => reg(k, parts, true, GL.matT), soft = (k, parts) => reg(k, parts, true, GL.matG, 1);
  const bark = '#46322a', gr = ['#1d4038', '#24503e', '#295642', '#33644a', '#3e7452'];
  // gran: stamme og kjegler i lag, mørkest nederst
  [[[1, 0.34, 0.1], [0.82, 0.32, 0.31], [0.62, 0.29, 0.52], [0.4, 0.27, 0.73]],
   [[0.92, 0.27, 0.09], [0.84, 0.26, 0.25], [0.68, 0.25, 0.41], [0.52, 0.24, 0.57], [0.34, 0.25, 0.75]],
   [[1, 0.42, 0.12], [0.74, 0.38, 0.4], [0.46, 0.34, 0.66]]].forEach((tiers, v) =>
    tree('spruce' + v, [cyl(0.09, 0.14, 0.2, bark), ...tiers.map(([r, h, y], i) => cone(r, h, gr[Math.min(4, i + (v === 1 ? 0 : 0))], 0, y))]));
  // furu: lang stamme som blir rødbrun oppover, og en flat krone av nålekvaster
  tree('pine0', [cyl(1.5, 2.4, 34, '#564136'), cyl(1.2, 1.5, 32, '#9c5933', 0, 34), sph(13, 8, 13, '#294f35', 0, 66), sph(10, 7, 10, '#3b6b3d', 5, 73, 2), sph(8, 6, 8, '#3b6b3d', -6, 71, -3), sph(7, 5, 7, '#558847', 0, 80)]);
  tree('pine1', [cyl(1.4, 2.3, 30, '#564136'), cyl(1.1, 1.4, 34, '#9c5933', 0, 30), cylX(0.7, 0.4, 9, '#9c5933', 0, 50), sph(7, 4, 7, '#294f35', 10, 51), sph(12, 7, 12, '#294f35', -2, 66), sph(9, 6, 9, '#3b6b3d', -6, 73, 3), sph(8, 5.5, 8, '#558847', 3, 78, -2)]);
  // bjørk, rogn og tørrgran: stamme og krone hver for seg, så fargen kan settes per tre
  tree('trunk', [cyl(1, 1.8, 46, '#ffffff'), cyl(1.85, 1.85, 0.9, '#55524c', 0, 8), cyl(1.6, 1.6, 0.8, '#55524c', 0, 20), cyl(1.35, 1.35, 0.8, '#55524c', 0, 31), cylX(0.6, 0.3, 8, '#e8e8e8', 0, 40), G3.turn(cylX(0.6, 0.3, 7, '#e8e8e8'), 0, 2.4, 0, 0, 36)]);
  tree('crown0', [sph(11, 10, 11, '#cccccc', 0, 48), sph(9, 8, 9, '#ffffff', 5, 56, 2), sph(8, 8, 8, '#f0f0f0', -5, 55, -3), sph(7, 7, 7, '#ffffff', 0, 64)]);
  tree('crown1', [sph(10, 12, 10, '#d4d4d4', 0, 50), sph(8, 7, 8, '#ffffff', -4, 60, 3), sph(7, 6, 7, '#ececec', 5, 52, -4), sph(6, 6, 6, '#ffffff', 2, 66)]);
  reg('snag', [cyl(0.6, 2, 42, '#8a8478'), cyl(0.3, 0.6, 6, '#7a7468', 0, 42), G3.turn(cylX(0.7, 0.3, 9, '#7a7468'), 0, 0.5, 0.5, 0, 22), G3.turn(cylX(0.6, 0.3, 7, '#7a7468'), 0, 3.4, 0.6, 0, 30), G3.turn(cylX(0.5, 0.2, 6, '#6e685e'), 0, 1.9, 0.3, 0, 15)]);
  reg('juniper', [sph(0.6, 0.5, 0.6, '#2c4a44', 0, 0.5), sph(0.45, 0.42, 0.45, '#3a6a5a', 0.3, 0.42, 0.2), sph(0.42, 0.36, 0.42, '#3a6a5a', -0.32, 0.36, -0.15), sph(0.3, 0.3, 0.3, '#4e8270', 0, 0.72)]);
  reg('shrub', [sph(0.7, 0.5, 0.7, '#dddddd', 0, 0.48), sph(0.5, 0.42, 0.5, '#bbbbbb', 0.45, 0.38, 0.12), sph(0.46, 0.4, 0.46, '#ffffff', -0.42, 0.42, -0.12), sph(0.34, 0.3, 0.34, '#ffffff', 0.05, 0.72, 0.05)]);
  reg('heather', [sph(0.9, 0.4, 0.9, '#5a3a5c', 0, 0.2), sph(0.5, 0.36, 0.5, '#9a6490', 0.4, 0.42, 0.15), sph(0.45, 0.34, 0.45, '#c88cb0', -0.35, 0.46, -0.2), sph(0.42, 0.32, 0.42, '#9a6490', -0.1, 0.42, 0.45), sph(0.36, 0.3, 0.36, '#b478a0', 0.15, 0.5, -0.45)]);
  // stein: kule med ujevne hjørner, lys på toppen
  for (let v = 0; v < 2; v++) {
    const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.78 + 0.4 * hash2(Math.round(x * 50), Math.round(y * 50) + Math.round(z * 50) * 131, 60 + v);
      p.setXYZ(i, x * k, Math.max(0, y * k * 0.9 + 0.4), z * k);
      col.push(...glRgb(y > 0.45 ? '#979c94' : y > -0.1 ? '#727876' : '#50565a'));
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    GL.geo['rock' + v] = { geo: g, mat: GL.matV };
  }
  reg('stump', [cyl(0.72, 1, 0.96, '#4a3828'), cyl(0.62, 0.62, 0.05, '#c8a474', 0, 0.96), cyl(0.3, 0.3, 0.06, '#a8845a', 0, 0.97)]);
  reg('log', [cylX(1, 0.9, 1, '#4a3828', -0.5, 1), cylX(0.82, 0.82, 0.02, '#c8a474', 0.49, 1), cylX(0.9, 0.9, 0.02, '#c8a474', -0.51, 1), G3.turn(cyl(0.2, 0.25, 0.9, '#3e2e22'), 0.9, 0, 0, 0.1, 1.6)]);
  // skigard: stolper og tre skrå rajer; palisade: spisse stokker med en bindestokk på tvers
  reg('fence', [cyl(0.8, 0.9, 11, '#6a5c4a', -7), cyl(0.8, 0.9, 11, '#6a5c4a', 7), G3.turn(cylX(0.55, 0.55, 17, '#9a8a70', -8.5), 0, 0, 0.1, 0, 3.4), G3.turn(cylX(0.55, 0.55, 17, '#8a7a62', -8.5), 0, 0, 0.1, 0, 6.2), G3.turn(cylX(0.55, 0.55, 17, '#9a8a70', -8.5), 0, 0, 0.1, 0, 9)]);
  const pal = [];
  for (let i = -2; i <= 2; i++) { const h = 22 + (i & 1) * 2, c = i & 1 ? '#5a4836' : '#74604a'; pal.push(cyl(1.5, 1.7, h, c, i * 3.3), cone(1.5, 3.4, '#8e785c', i * 3.3, h)); }
  reg('pal', [...pal, cylX(0.7, 0.7, 17, '#44342a', -8.5, 15, 1.6), cylX(0.7, 0.7, 17, '#44342a', -8.5, 6, 1.6)]);
  // gress, bregner og siv: strå og blader som står ut fra rota
  for (let v = 0; v < 3; v++) {
    const r = rng(900 + v * 5), g = [];
    for (let i = 0; i < 7 + v; i++) g.push(G3.turn(cone(0.55, 5 + r() * 6, ['#8c9a40', '#bcb858', '#dcd078'][(r() * 3) | 0], 0, 0, 0, 3), (r() - 0.5) * 0.9, r() * TAU, (r() - 0.5) * 0.9, (r() - 0.5) * 6, 0, (r() - 0.5) * 4));
    soft('grass' + v, g);
  }
  { const g = []; for (let i = 0; i < 8; i++) { const fr = cone(1.5, 9 + (i & 1) * 2.5, i & 1 ? '#ffffff' : '#cfcfcf', 0, 0, 0, 3); fr[0].scale(1, 1, 0.25).rotateZ(-0.85 - (i % 3) * 0.12).rotateY(i / 8 * TAU + 0.2); g.push(fr); } soft('fern', g); }
  for (let v = 0; v < 2; v++) {
    const r = rng(950 + v * 5), g = [];
    for (let i = 0; i < 5 + v; i++) {
      const len = 10 + r() * 8, x = (r() - 0.5) * 8, z = (r() - 0.5) * 5, lx = (r() - 0.5) * 0.3;
      g.push(G3.turn(cone(0.45, len, i & 1 ? '#7a9648' : '#58783e', 0, 0, 0, 3), 0, 0, lx, x, 0, z));
      if (r() < 0.6) g.push(G3.turn(cyl(0.7, 0.7, 3, '#6a4428', 0, len - 4.5, 0, 5), 0, 0, lx, x, 0, z));
    }
    soft('reed' + v, g);
  }
  // landemerker: varde av stablet stein, bautastein med mose ved foten, og jakttårn på fire bein med stige
  const st = ['#50565a', '#727876', '#979c94', '#b4b8ac'], wd = ['#38281e', '#5f4632', '#7a5c40', '#a07e52', '#c8a474'], ir = ['#1c1a18', '#34302c', '#4e4842', '#7a7a76'], hay = ['#8a6e2c', '#b89840', '#d8bc58', '#ecd880'];
  reg('cairn', [[7, 3, 3], [5.6, 2.6, 7], [4.6, 2.4, 10.6], [3.4, 2, 14], [2.5, 1.7, 17], [1.5, 1.3, 19.6]].map(([r, h, y], i) => sph(r, h * 1.15, r * 0.9, st[1 + i % 3], i & 1 ? 0.6 : -0.5, y, (i % 3 - 1) * 0.5, 0)));
  { const bs = cyl(1.6, 3.6, 29, st[1], 0, 0, 0, 5); bs[0].scale(1, 1, 0.62); reg('bauta', [bs, sph(4, 1.8, 2.8, '#6a8a3a', 0, 0.8, 0, 0)]); }
  const tw = [box(23, 2, 17, wd[3], 0, 38, 0), box(19, 12, 14, wd[1], 0, 45, 0), box(14, 4, 0.8, '#141210', 0, 46, 7.1), box(14, 1, 1.2, wd[4], 0, 43.6, 7.3), G3.turn(cone(17, 6.5, st[1], 0, 0, 0, 4), 0, Math.PI / 4, 0, 0, 51, 0)];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tw.push(stick([sx * 11, 0, sz * 8], [sx * 7, 37, sz * 5.5], 1.1, wd[sx < 0 ? 1 : 2]));
  for (const sz of [-1, 1]) tw.push(stick([-10.5, 6, sz * 7.6], [8, 22, sz * 6.4], 0.6, wd[0]), stick([10.5, 6, sz * 7.6], [-8, 22, sz * 6.4], 0.6, wd[0]), stick([-8.5, 23, sz * 6.4], [7.2, 36, sz * 5.6], 0.6, wd[0]), stick([8.5, 23, sz * 6.4], [-7.2, 36, sz * 5.6], 0.6, wd[0]));
  tw.push(stick([-2, 0, 9.5], [-2, 37, 6.5], 0.5, wd[3]), stick([2, 0, 9.5], [2, 37, 6.5], 0.5, wd[3]));
  for (let y = 4; y < 36; y += 4) tw.push(box(4, 0.7, 0.7, wd[4], 0, y, 9.5 - y * 0.081));
  reg('tower', tw);
  // landsbyen: brønn med vindebom og tak, boder med stripet seil og varer, og lykter
  reg('well', [cyl(10, 10, 9.5, st[1], 0, 0, 0, 10), cyl(10.4, 10.4, 1, st[3], 0, 9, 0, 10), cyl(7.6, 7.6, 0.4, '#1e3b48', 0, 9.8, 0, 10), cyl(0.9, 0.9, 17, wd[1], -8.5, 9), cyl(0.9, 0.9, 17, wd[1], 8.5, 9), cylX(0.6, 0.6, 17, wd[0], -8.5, 21),
    cyl(0.25, 0.25, 6, '#c8b890', 0, 15), cyl(1.8, 2.2, 3.5, wd[2], 0, 11.5), G3.turn(cone(14.5, 8, '#a8482e', 0, 0, 0, 4), 0, Math.PI / 4, 0, 0, 26, 0)]);
  [['#b03a2e', '#f0ece2'], ['#3a5a84', '#f0ece2'], ['#4e7a4a', '#f0e0a0']].forEach((aw, k) => {
    const sl = [box(32, 2.5, 9, wd[3], 0, 10.5, -3.5), box(30, 9.5, 7.5, wd[1], 0, 4.75, -3.5)];
    for (const x of [-16, 16]) for (const z of [-8, 1]) sl.push(cyl(0.8, 0.8, z < 0 ? 28 : 24, wd[1], x, 0, z));
    for (let i = 0; i < 8; i++) { sl.push(G3.turn(box(4.76, 1, 13.5, aw[i & 1]), 0.3, 0, 0, -16.66 + i * 4.76, 26, -3.5)); if (!(i & 1)) sl.push(box(4.76, 2.4, 0.6, aw[0], -16.66 + i * 4.76, 22.9, 2.9)); }
    for (let i = 0; i < 7; i++) {
      const x = -12 + i * 4;
      sl.push(k === 0 ? sph(1.7, 1.1, 1.3, i & 1 ? '#a86a30' : '#b87a3c', x, 12.6, -3 + (i & 1)) : k === 1 ? sph(2, 0.5, 0.8, i & 1 ? '#8aa0ac' : '#b4c4cc', x, 12.1, -3.5 + (i % 3 - 1)) : sph(1.3, 1.2, 1.3, ['#c8402c', '#7aa048', '#e08a2c', '#d8c050'][i % 4], x, 12.8, -3.5 + (i & 1)));
    }
    reg('stall' + k, sl);
  });
  reg('lamp', [cyl(1.6, 2.1, 1.6, ir[0]), cyl(0.5, 0.65, 23, ir[1], 0, 1), cyl(1, 1, 0.8, ir[2], 0, 16), box(5.4, 0.9, 5.4, ir[0], 0, 23.9, 0), box(5.8, 0.9, 5.8, ir[1], 0, 30.3, 0), cone(2.6, 2, ir[1], 0, 30.7, 0, 4),
    ...[-1, 1].flatMap(a => [-1, 1].map(c => box(0.6, 6, 0.6, ir[0], a * 2.2, 27, c * 2.2)))]);
  reg('lampG', [box(3.8, 5.6, 3.8, '#ffc850', 0, 27.1, 0)], true, GL.matU, 1);
  // småting: 0 tønne, 1 kasse, 2 sekker, 3 høysåte, 4 ambolt på stabbe, 5 vedstabel, 6 kjerre, 7 benk, 8 hesje, 9 hoggestabbe
  reg('vprop0', [cyl(3.3, 3, 5, wd[2], 0, 0, 0, 9), cyl(3, 3.3, 5, wd[2], 0, 5, 0, 9), cyl(3.5, 3.5, 0.8, ir[1], 0, 2.4, 0, 9), cyl(3.5, 3.5, 0.8, ir[1], 0, 7, 0, 9), cyl(2.7, 2.7, 0.3, wd[4], 0, 9.9, 0, 9)]);
  reg('vprop1', [box(9.5, 8, 8, wd[2], 0, 4, 0), box(10, 1, 8.5, wd[4], 0, 8.5, 0), box(10, 1, 8.5, wd[0], 0, 0.5, 0), G3.turn(box(11.5, 1, 0.5, wd[1]), 0, 0, -0.72, 0, 4.2, 4.1)]);
  reg('vprop2', [sph(3.6, 3, 3.2, '#c8b890', -3, 2.8, 0), sph(3.6, 3, 3.2, '#b4a47c', 3, 2.8, 0.6), sph(3.4, 2.8, 3, '#d8ccaa', 0, 6.4, 0.2), sph(0.6, 0.6, 0.6, wd[2], 0, 9.3, 0.2)], false);
  reg('vprop3', [sph(7.5, 6, 7.5, hay[2], 0, 4.5, 0), cone(5.6, 6.5, hay[3], 0, 7, 0, 8), cyl(0.4, 0.4, 3, wd[1], 0, 12.5)]);
  reg('vprop4', [cyl(4, 4.3, 6, wd[1], 0, 0, 0, 8), cyl(3.6, 3.6, 0.3, wd[4], 0, 5.9, 0, 8), box(8, 1.2, 3, ir[2], 0, 6.8, 0), box(5, 2.2, 2.4, ir[1], 0, 8.4, 0), box(11, 2, 3.6, ir[2], -0.5, 10.4, 0), box(11, 0.5, 3.6, ir[3], -0.5, 11.6, 0),
    G3.turn(cone(1.6, 3.4, ir[2], 0, 0, 0, 5), 0, 0, Math.PI / 2, -6, 10.4, 0)]);
  { const w = [];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) {
      const x = -9.5 + i * 3.1 + (j & 1) * 1.5; if (x > 10) continue;
      w.push(G3.turn(cyl(1.5, 1.5, 5, wd[2], 0, 0, 0, 6), Math.PI / 2, 0, 0, x, 1.5 + j * 2.7, -4), G3.turn(cyl(1.15, 1.15, 0.3, (i + j) & 1 ? wd[4] : '#dcc090', 0, 0, 0, 6), Math.PI / 2, 0, 0, x, 1.5 + j * 2.7, 1));
    }
    reg('vprop5', w); }
  { const c = [box(18, 6, 10, wd[2], 0, 9, 0), box(18.6, 1, 10.6, wd[4], 0, 12.2, 0), box(18.4, 1, 10.4, wd[0], 0, 6.2, 0), stick([9, 8, 0], [15, 2, 0], 0.6, wd[3]), sph(5, 2.4, 3.6, hay[2], -1, 13.2, 0), sph(3, 1.8, 3, hay[3], 3, 13.4, 0.5)];
    for (const x of [-5, 5]) for (const z of [-5.9, 5.9]) c.push(G3.turn(cyl(3.5, 3.5, 1.2, wd[0], 0, -0.6, 0, 10), Math.PI / 2, 0, 0, x, 3.5, z), G3.turn(cyl(1.5, 1.5, 1.5, wd[3], 0, -0.75, 0, 8), Math.PI / 2, 0, 0, x, 3.5, z));
    reg('vprop6', c); }
  reg('vprop7', [box(20, 1.6, 5, wd[3], 0, 5.2, 0), box(20, 2.2, 1, wd[3], 0, 9, -2.4), ...[-8, 8].flatMap(x => [box(1.8, 4.4, 1.8, wd[1], x, 2.2, 1.4), box(1.8, 10, 1.6, wd[0], x, 5, -2.4)])]);
  { const h = []; for (let x = -18; x <= 18; x += 9) h.push(cyl(0.6, 0.6, 18, wd[1], x)); for (let i = 0; i < 6; i++) h.push(sph(4.6, 6.4, 2, hay[1 + i % 3], -17.5 + i * 7, 9.2 + (i & 1), 0)); h.push(cylX(0.3, 0.3, 37, wd[0], -18.5, 15.6)); reg('vprop8', h); }
  reg('vprop9', [cyl(4, 4.3, 6, wd[1], 0, 0, 0, 8), cyl(3.7, 3.7, 0.3, wd[4], 0, 5.9, 0, 8), box(3, 3, 3, wd[3], -0.5, 7.7, 0), box(3, 0.4, 3, '#dcc090', -0.5, 9.3, 0)]);
}
// Porten i palisaden: to stolper med jernbånd og fakkel, bjelke og et lite tak over, og portbladene slått opp. w er åpningen
function glGate(w, flame) {
  const { box, cone } = G3, wd = ['#2a2018', '#44342a', '#5a4836', '#74604a', '#8e785c'], ir = '#24211e', hw = w / 2 + 3.5, p = [];
  if (flame) { for (const s of [-1, 1]) p.push(cone(1.3, 1.8, '#f08a2c', s * hw, 32.6, 3.9, 5), cone(0.8, 3, '#ffe08a', s * hw, 32.8, 3.9, 5)); return glMerge(p, true); }
  for (const s of [-1, 1]) p.push(box(7, 35, 7, wd[3], s * hw, 17.5, 0), box(7.4, 1, 7.4, ir, s * hw, 9, 0), box(7.4, 1, 7.4, ir, s * hw, 23, 0), box(1, 25, 13, wd[2], s * (hw - 4.5), 12.5, 8.5),
    box(1.3, 1, 13.2, ir, s * (hw - 4.5), 21, 8.5), box(1.3, 1, 13.2, ir, s * (hw - 4.5), 4, 8.5), box(0.6, 4, 0.6, ir, s * hw, 30.6, 3.9));
  p.push(box(w + 14, 6, 7.6, wd[3], 0, 34, 0), box(w + 14, 1, 8, wd[4], 0, 37.4, 0), G3.turn(box(w + 12, 1.2, 6.5, wd[2]), 0.6, 0, 0, 0, 40, 2.4), G3.turn(box(w + 12, 1.2, 6.5, wd[1]), -0.6, 0, 0, 0, 40, -2.4));
  return glMerge(p, true);
}
// Geometrien til navnet k; portene (gate|bredde og flammene gateF|bredde) lages første gang de trengs
function glGeo(k) {
  let g = GL.geo[k];
  if (!g) { const [kind, w] = k.split('|'); g = GL.geo[k] = kind === 'gateF' ? { geo: glGate(+w, true), mat: GL.matU, nosh: 1 } : { geo: glGate(+w), mat: GL.matV }; }
  return g;
}
const GL_SHRUB = ['#aa522e', '#9c4a2c', '#588444', '#b49a40'], GL_FERN = ['#748832', '#a08430', '#a06428'];
// Delene tingen o består av: e(navn, dreining, sx, sy, sz, farge, dx, dy), der (dx, dy) flytter delen bort fra der tingen står
function glStatic(o, e) {
  const k = o.k, s = SPR[k][o.v], bb = s.bb || (s.bb = s.pix.bbox()), Hh = Math.max(2, s.ay - bb[1]), Wd = bb[2], rot = hash2(o.x, o.y, 6) * TAU;
  if (k === 'spruce') e('spruce' + o.v % 3, rot, Wd * 0.5, Hh, Wd * 0.5);
  else if (k === 'pine') { const q = Hh / 85; e('pine' + (o.v & 1), rot, q, q, q); }
  else if (k === 'birch') { const q = Hh / 71, t = BIRCH_TONES[o.v % BIRCH_TONES.length]; e('trunk', rot, q, q, q, '#e4e0d2'); e('crown' + (o.v >= BIRCH_TONES.length ? 1 : 0), rot, q, q, q, hash2(o.x, o.y, 8) < 0.5 ? t[2] : t[3]); }
  else if (k === 'rowan') { const q = Hh / 71; e('trunk', rot, q, q, q, '#7a6654'); e('crown' + (o.v & 1), rot, q * 1.1, q, q * 1.1, ['#c8642c', '#b4552a', '#d07a34'][o.v % 3]); }
  else if (k === 'snag') { const q = Hh / 48; e('snag', rot, q, q, q); }
  else if (k === 'juniper') e('juniper', rot, Wd * 0.55, Hh, Wd * 0.55);
  else if (k === 'shrub') e('shrub', rot, Wd * 0.5, Hh * 1.05, Wd * 0.45, GL_SHRUB[o.v % 4]);
  else if (k === 'heather') e('heather', rot, Wd * 0.5, Hh * 0.8, Wd * 0.45);
  else if (k === 'rock') e('rock' + (o.v & 1), rot, Wd * 0.48, Hh * 0.8, Wd * 0.4);
  else if (k === 'stump') e('stump', rot, Wd * 0.3, Hh * 0.7, Wd * 0.3);
  else if (k === 'log') e('log', (hash2(o.x, o.y, 6) - 0.5) * 0.7, Wd * 0.9, 2.6, 2.6);
  else if (k === 'fence' || k === 'pal') e(k, o.v === 0 ? 0 : o.v === 1 ? Math.PI / 2 : o.v === 2 ? -Math.PI / 4 : Math.PI / 4, o.v > 1 ? 1.07 : 1, 1, 1);
  else if (k === 'fern') e('fern', rot, 1, 1, 1, GL_FERN[o.v % 3]);
  else if (k === 'grassT') e('grass' + o.v % 3, rot, 1, 1, 1);
  else if (k === 'reed') e('reed' + (o.v & 1), rot, 1, 1, 1);
  else if (k === 'lamp') { e('lamp', 0, 1, 1, 1); e('lampG', 0, 1, 1, 1); }
  else if (k === 'stall' || k === 'vprop') e(k + o.v, 0, 1, 1, 1);
  else if (k === 'gate') {
    // der veien går øst–vest står det en stolpe i nord og en i sør: hele porten tegnes fra den i nord. Bladene slås inn mot landsbyen
    const g = GATES.find(q => q.x === o.x && (q.vert ? q.y - q.w / 2 - 2 === o.y : q.y === o.y));
    if (g) { const r = g.vert ? (g.in > 0 ? Math.PI / 2 : -Math.PI / 2) : g.y > -150 ? Math.PI : 0, dy = g.vert ? g.y - o.y : 0; e('gate|' + g.w, r, 1, 1, 1, null, 0, dy); e('gateF|' + g.w, r, 1, 1, 1, null, 0, dy); }
  }
  else if (GL.geo[k]) e(k, 0, 1, 1, 1);
}

// ---------- hus ----------
// Samme grensesnitt som Model i 02-sprites.js (wall, roof, box, spire, lamp), men bygger flater med veggene og takene
// malt i ett bilde per slags hus. Vinduer og lykter ligger også i et eget bilde som lyser om natta
class GLModel {
  constructor() { this.p = new Pix(512, 256); this.e = new Pix(512, 256); this.x = 1; this.y = 1; this.rowH = 0; this.pos = []; this.uv = []; this.glow = []; }
  lit() { return [1, 1]; }
  scr() { return [0, 0]; }
  // setter av en rute på w × h i bildet og fyller den med col(i, j); gir hjørnet
  area(w, h, col) {
    w = Math.max(1, Math.ceil(w)); h = Math.max(1, Math.ceil(h));
    if (this.x + w + 1 > this.p.w) { this.x = 1; this.y += this.rowH + 1; this.rowH = 0; }
    const x0 = this.x, y0 = this.y;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const c = col(i, j); this.p.d[(y0 + j) * this.p.w + x0 + i] = c; if (GL_LIT.has(c)) this.e.d[(y0 + j) * this.p.w + x0 + i] = c; }
    this.x += w + 1; this.rowH = Math.max(this.rowH, h);
    return [x0, y0, w, h];
  }
  quad(A, B, C2, D2) { for (const q of [A, B, C2, A, C2, D2]) { this.pos.push(q[0], q[1], q[2]); this.uv.push(q[3] / this.p.w, 1 - q[4] / this.p.h); } }
  wall(u0, v0, u1, v1, zt, tex, z0 = 0) {
    const du = u1 - u0, dv = v1 - v0, len = hyp(du, dv), fn = typeof zt === 'function', n = fn ? Math.max(2, Math.round(len / 2)) : 1;
    let zm = z0; for (let i = 0; i <= n; i++) zm = Math.max(zm, fn ? zt(len * i / n) : zt);
    const [ax, ay, w, h] = this.area(len, zm - z0, (i, j) => tex(Math.min(len, i + 0.5), zm - j - 0.5)), ku = w / len;
    for (let i = 0; i < n; i++) {
      const q0 = len * i / n, q1 = len * (i + 1) / n, t0 = fn ? zt(q0) : zt, t1 = fn ? zt(q1) : zt;
      const P = (q, z) => [u0 + du * q / len, z, v0 + dv * q / len, ax + q * ku, ay + (zm - z)];
      this.quad(P(q0, z0), P(q1, z0), P(q1, t1), P(q0, t0));
    }
    return true;
  }
  box(u0, u1, v0, v1, z0, z1, tex, top) {
    this.wall(u0, v0, u1, v0, z1, tex, z0); this.wall(u1, v0, u1, v1, z1, tex, z0); this.wall(u1, v1, u0, v1, z1, tex, z0); this.wall(u0, v1, u0, v0, z1, tex, z0);
    const [ax, ay] = this.area(2, 2, () => top);
    this.quad([u0, z1, v0, ax, ay], [u1, z1, v0, ax + 2, ay], [u1, z1, v1, ax + 2, ay + 2], [u0, z1, v1, ax, ay + 2]);
  }
  roof(u0, u1, hd, ov, z0, hr, kind, rc) {
    const W0 = hd + ov, len = u1 - u0;
    for (const sd of [-1, 1]) {
      const [ax, ay, w, h] = this.area(len, W0 * 1.25, (i, j) => { const t = (j + 0.5) / 1.25, f = t / W0; return f < 0.07 ? rc[4] : f > 0.93 ? rc[0] : i < 1 || i > len - 2 ? rc[1] : roofPix(kind, rc, Math.floor(u0 + i) + 200, j, f); });
      const zr = z0 + hr, ze = z0 + hr * (1 - W0 / hd);
      this.quad([u0, zr, 0, ax, ay], [u1, zr, 0, ax + w, ay], [u1, ze, sd * W0, ax + w, ay + h], [u0, ze, sd * W0, ax, ay + h]);
    }
  }
  spire(uc, vc, hb, z0, hh, rc) {
    const [ax, ay, w, h] = this.area(4, hh, (i, j) => Math.floor((hh - j) * 1.2) % 4 === 0 ? rc[1] : rc[3]);
    for (const [a, b2] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) {
      const T0 = [uc, z0 + hh, vc, ax + 2, ay];
      this.quad([uc + a[0] * hb, z0, vc + a[1] * hb, ax, ay + h], [uc + b2[0] * hb, z0, vc + b2[1] * hb, ax + w, ay + h], T0, T0);
    }
  }
  lamp(u, v, z, a) { this.glow.push([u, v, z, a]); }
  // kors på spiret
  cross(u, v, z) { const g = () => C('#e6b63c'); this.box(u - 0.8, u + 0.8, v - 0.8, v + 0.8, z - 2, z + 8, g, g()); this.box(u - 0.8, u + 0.8, v - 3, v + 3, z + 3.5, z + 5.5, g, g()); }
  // skilt med navnet på bua, hengt opp foran takskjegget over døra. Skiltet får sitt eget nett (se glSigns)
  sign(txt, u, v, z, nu, nv) {
    const sw = txt.length * 4 + 5, ink = C('#2c1e16'), [ax, ay, w, h] = this.area(sw + 2, 9, (i, j) => i === 0 || j === 0 || i === sw + 1 || j === 8 ? ink : C('#e2d2a8'));
    [...txt].forEach((ch, i) => [...GLYPH[ch]].forEach((bit, k) => { if (bit === '1') this.p.d[(ay + 2 + (k / 3 | 0)) * this.p.w + ax + 4 + i * 4 + k % 3] = ink; }));
    const g = this.sg = new THREE.BufferGeometry(), U = (x, y) => [(ax + x) / this.p.w, 1 - (ay + y) / this.p.h];
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, w, 0, 0, w, h, 0, 0, 0, 0, w, h, 0, 0, h, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([...U(0, h), ...U(w, h), ...U(w, 0), ...U(0, h), ...U(w, 0), ...U(0, 0)], 2)); g.computeVertexNormals();
    this.sat = [u, v, z, nu, nv, w / 2];
  }
  finish() {
    const g = new THREE.BufferGeometry(), tex = c => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.computeVertexNormals();
    return { geo: g, map: tex(this.p.canvas()), emap: tex(this.e.canvas()), glow: this.glow, sg: this.sg, sat: this.sat };
  }
}
// Fargene som lyser om natta: vinduer, lykter og glør (se drawWindow, houseDef og churchDef)
const GL_LIT = new Set(['#f0bc50', '#f8dc88', '#ffd060', '#e8742c', '#f8b050', '#5a8ab0', '#c8503c'].map(C));
const GL_HOUSE = {};
function glHouse(kind) {
  let d = GL_HOUSE[kind];
  if (!d) {
    const m = new GLModel();
    if (kind === 'church') { churchDef(m); m.cross(29, 0, 62); }
    else {
      const st = HOUSE_STYLE[CABIN_V[kind]], hl = (st.L || 48) / 2, hd = (st.D || 32) / 2;
      houseDef(m, st);
      if (st.sign) { if (st.end) m.sign(st.sign, hl + 3.2, 0, HOUSE_HW - 2, 1, 0); else m.sign(st.sign, 12.5 - hl, hd + 3.2, HOUSE_HW - 2, 0, 1); }
    }
    d = GL_HOUSE[kind] = m.finish();
  }
  return d;
}

// ---------- bitene: bakke, hus og det som står på dem ----------
function glRec(kx, ky) {
  const key = kx + ',' + ky, ch = getChunk(kx, ky);
  let rec = GL.recs.get(key);
  if (rec && rec.ch === ch) return rec;
  if (rec) glRecDrop(rec);
  const x0 = kx * CS, y0 = ky * CS, n = CS / HG, N = n + 1, pos = new Float32Array(N * N * 3), uv = new Float32Array(N * N * 2), col = new Float32Array(N * N * 3), idx = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const a = j * N + i, c = farCol(x0 + Math.min(i * HG, CS - 1), y0 + Math.min(j * HG, CS - 1));
    pos[a * 3] = x0 + i * HG; pos[a * 3 + 1] = ch.hg[(j + 1) * HN + i + 1]; pos[a * 3 + 2] = y0 + j * HG;
    uv[a * 2] = i / n; uv[a * 2 + 1] = j / n;
    col[a * 3] = (c & 255) / 255; col[a * 3 + 1] = ((c >>> 8) & 255) / 255; col[a * 3 + 2] = ((c >>> 16) & 255) / 255;
    if (i < n && j < n) idx.push(a, a + N, a + 1, a + 1, a + N, a + N + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, GL.matFar); mesh.receiveShadow = true;
  rec = { key, kx, ky, ch, geo, mesh, tex: null, grp: new THREE.Group(), parts: new Map(), tall: [], houses: [], seen: GL.frame };
  rec.grp.add(mesh);
  glRecObjs(rec);
  GL.scene.add(rec.grp); GL.recs.set(key, rec); GL.instDirty = true;
  return rec;
}
// Det som står i biten: modellene samles per slag (matrise og farge per ting), husene og folkene ved dørene får egne nett
function glRecObjs(rec) {
  const ch = rec.ch;
  for (const h of rec.houses) { rec.grp.remove(h); if (h.userData.sign) rec.grp.remove(h.userData.sign); if (h.material && h.material !== GL.matV) h.material.dispose(); }
  rec.parts = new Map(); rec.tall = []; rec.houses = [];
  const lists = new Map();
  for (const o of ch.objs) {
    o._g = null;
    const s = SPR[o.k][o.v];
    if (o.k === 'cabin') {
      const c = [...ch.cabs, ...HOUSES].find(q => q.x === o.x && q.y === o.y); if (!c) continue;
      const d = glHouse(c.kind), me = new THREE.Mesh(d.geo, glMat({ map: d.map, emissiveMap: d.emap, emissive: 0xffffff, emissiveIntensity: 0, side: THREE.DoubleSide }));
      me.position.set(o.x, o.h, o.y); me.rotation.y = -c.rot; me.castShadow = me.receiveShadow = true; me.userData.o = o;
      const cs = Math.cos(c.rot), sn = Math.sin(c.rot);
      me.userData.glow = d.glow.map(([u, v, z, a]) => [o.x + u * cs - v * sn, o.y + u * sn + v * cs, z, a]);
      if (d.sg) {
        const [u, v, z, nu, nv, hw] = d.sat, sg = me.userData.sign = new THREE.Mesh(d.sg, me.material);
        sg.userData.at = [o.x + u * cs - v * sn, o.h + z, o.y + u * sn + v * cs, nu * cs - nv * sn, nu * sn + nv * cs, hw]; rec.grp.add(sg);
      }
      rec.grp.add(me); rec.houses.push(me); rec.tall.push(o); o._me = me;
      continue;
    }
    if (o.k === 'npc') { const f = figHuman([...NPC_PAL, ...VIL_PAL][o.v] || {}); f.root.position.set(o.x, o.h, o.y); f.root.rotation.y = -Math.PI / 2; rec.grp.add(f.root); rec.houses.push(f.root); continue; }
    if (s.tall || s.tallC) rec.tall.push(o);
    glStatic(o, (k, rot, sx, sy, sz, colr, dx = 0, dy = 0) => {
      let L = lists.get(k); if (!L) lists.set(k, L = { m: [], c: [], os: [] });
      const c = Math.cos(rot), sn = Math.sin(rot), cc = colr ? glRgb(colr) : [1, 1, 1];
      L.m.push(c * sx, 0, -sn * sx, 0, 0, sy, 0, 0, sn * sz, 0, c * sz, 0, o.x + dx, o.h, o.y + dy, 1); L.c.push(cc[0], cc[1], cc[2]);
      (o._g || (o._g = [])).push([k, L.os.length]); L.os.push(o);
    });
  }
  for (const [k, L] of lists) rec.parts.set(k, { n: L.os.length, m: new Float32Array(L.m), c: new Float32Array(L.c), off: 0 });
  GL.instDirty = true;
}
function glRecDrop(rec) {
  GL.scene.remove(rec.grp); rec.geo.dispose(); if (rec.tex) { rec.tex.dispose(); rec.mesh.material.dispose(); }
  for (const h of rec.houses) if (h.material && h.material !== GL.matV) h.material.dispose();
  for (const o of rec.ch.objs) if (GL.hid.has(o)) glUnhide(o, true);
  GL.recs.delete(rec.key); GL.instDirty = true;
}
// Et tre er hogd (eller står igjen): biten det står i settes sammen på nytt
function glCut(x, y) { const rec = GL.recs.get(Math.floor(x / CS) + ',' + Math.floor(y / CS)); if (rec) { for (const o of rec.ch.objs) if (GL.hid.has(o)) glUnhide(o, true); glRecObjs(rec); } }
// Bitene i ruta (kx0..kx1, ky0..ky1) skal vises: de som mangler bygges, nærmest (fx, fy) først og høyst max om gangen,
// den tegnede bakken legges på når spillet har laget den, og biter som ikke har vært i bruk på en stund, kastes
function glWant(kx0, ky0, kx1, ky1, fx, fy, max) {
  const miss = [];
  for (let ky = ky0; ky <= ky1; ky++) for (let kx = kx0; kx <= kx1; kx++) {
    const rec = GL.recs.get(kx + ',' + ky);
    if (rec && rec.ch === chunks.get(rec.key)) {
      rec.seen = GL.frame;
      if (!rec.tex && rec.ch.gpix) {
        const t = rec.tex = new THREE.DataTexture(new Uint8Array(rec.ch.gpix.buffer.slice(0)), CS, CS, THREE.RGBAFormat);
        t.magFilter = t.minFilter = THREE.NearestFilter; t.needsUpdate = true; rec.mesh.material = glMat({ map: t });
      }
    } else miss.push([kx, ky, hyp((kx + 0.5) * CS - fx, (ky + 0.5) * CS - fy)]);
  }
  miss.sort((p, q) => p[2] - q[2]);
  for (let i = 0; i < Math.min(max, miss.length); i++) glRec(miss[i][0], miss[i][1]).seen = GL.frame;
  if (GL.recs.size > 150) for (const rec of [...GL.recs.values()]) if (GL.frame - rec.seen > 240) glRecDrop(rec);
}
// Alle ting av samme slag i de lastede bitene tegnes i ett kall; listene settes sammen på nytt når bitene skifter
function glInstRebuild() {
  GL.instDirty = false;
  const tot = new Map();
  for (const rec of GL.recs.values()) for (const [k, p] of rec.parts) tot.set(k, (tot.get(k) || 0) + p.n);
  for (const [k, im] of GL.inst) if (!tot.has(k)) im.count = 0;
  for (const [k, n] of tot) {
    let im = GL.inst.get(k);
    if (!im || im.cap < n) {
      if (im) GL.scene.remove(im);
      const g = glGeo(k), cap = Math.ceil(n * 1.4) + 16;
      im = new THREE.InstancedMesh(g.geo, g.mat, cap); im.cap = cap; im.instanceColor = new THREE.BufferAttribute(new Float32Array(cap * 3), 3);
      im.castShadow = !g.nosh; im.receiveShadow = true; im.frustumCulled = false; GL.scene.add(im); GL.inst.set(k, im);
    }
    let off = 0;
    for (const rec of GL.recs.values()) { const p = rec.parts.get(k); if (!p) continue; im.instanceMatrix.array.set(p.m, off * 16); im.instanceColor.array.set(p.c, off * 3); p.off = off; off += p.n; }
    im.count = n; im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
  }
  for (const o of [...GL.hid.keys()]) glHide(o);
}
// Trær og hus som dekker jegeren, hunden eller et dyr blir gjennomsiktige: tingen tas ut av fellestegningen og
// tegnes for seg med gjennomsiktig farge så lenge
function glPart(o, i) { const [k, li] = o._g[i], rec = GL.recs.get(Math.floor(o.x / CS) + ',' + Math.floor(o.y / CS)), p = rec && rec.parts.get(k); return p ? [k, p, li] : null; }
function glHide(o) {
  let gh = GL.hid.get(o);
  if (o._me) { if (!gh) GL.hid.set(o, gh = []); o._me.material.transparent = true; return; }
  if (!o._g) { GL.hid.delete(o); return; }
  if (!gh) {
    gh = [];
    for (let i = 0; i < o._g.length; i++) {
      const q = glPart(o, i); if (!q) continue;
      const [k, p, li] = q, g = glGeo(k), mt = g.mat.clone(); mt.onBeforeCompile = g.mat.onBeforeCompile; mt.transparent = true; mt.color.setRGB(p.c[li * 3], p.c[li * 3 + 1], p.c[li * 3 + 2]);
      const me = new THREE.Mesh(g.geo, mt); me.matrixAutoUpdate = false; me.matrix.fromArray(p.m, li * 16); me.castShadow = true; GL.scene.add(me); gh.push(me);
    }
    GL.hid.set(o, gh);
  }
  for (let i = 0; i < o._g.length; i++) { const q = glPart(o, i); if (!q) continue; const im = GL.inst.get(q[0]), a = (q[1].off + q[2]) * 16; im.instanceMatrix.array[a] = im.instanceMatrix.array[a + 5] = im.instanceMatrix.array[a + 10] = 0; im.instanceMatrix.array[a + 2] = im.instanceMatrix.array[a + 8] = 0; im.instanceMatrix.needsUpdate = true; }
}
function glUnhide(o, gone) {
  const gh = GL.hid.get(o); GL.hid.delete(o);
  if (o._me) { o._me.material.transparent = false; o._me.material.opacity = 1; return; }
  for (const me of gh || []) { GL.scene.remove(me); me.material.dispose(); }
  if (gone || !o._g) return;
  for (let i = 0; i < o._g.length; i++) { const q = glPart(o, i); if (!q) continue; const im = GL.inst.get(q[0]); im.instanceMatrix.array.set(q[1].m.subarray(q[2] * 16, q[2] * 16 + 16), (q[1].off + q[2]) * 16); im.instanceMatrix.needsUpdate = true; }
}
function glReveal(dt, pts) {
  const kx = Math.floor(P.x / CS), ky = Math.floor(P.y / CS);
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
    const rec = GL.recs.get((kx + i) + ',' + (ky + j)); if (!rec) continue;
    for (const o of rec.tall) {
      const s = SPR[o.k][o.v];
      let ta = 1;
      for (const r of pts) if (o.y > r[1] + 5 && o.y - s.ay * 0.95 < r[1] + 4 && Math.abs(o.x - r[0]) < s.w * 0.42) { ta = 0.35; break; }
      if (ta === 1 && o.a === 1) continue;
      o.a = lerp(o.a, ta, Math.min(1, dt * 6)); if (ta === 1 && o.a > 0.97) o.a = 1;
      if (o.a < 1) { if (!GL.hid.has(o)) glHide(o); if (o._me) o._me.material.opacity = o.a; else for (const me of GL.hid.get(o) || []) me.material.opacity = o.a; }
      else if (GL.hid.has(o)) glUnhide(o);
    }
  }
}

// ---------- lys ----------
function glLightRgb(h) {
  for (let i = 0; i < LIGHT.length - 1; i++) if (h >= LIGHT[i][0] && h <= LIGHT[i + 1][0]) {
    const t = (h - LIGHT[i][0]) / (LIGHT[i + 1][0] - LIGHT[i][0]), a = hexRgb(LIGHT[i][1]), c = hexRgb(LIGHT[i + 1][1]);
    return [lerp(a[0], c[0], t) / 255, lerp(a[1], c[1], t) / 255, lerp(a[2], c[2], t) / 255];
  }
  return [1, 1, 1];
}
// Sol og måne, døgnfargen og lysene fra bål, lykter og vinduer rundt (fx, fy). På kartet farges lyset etter døgnet
// (tint); i siktet legges døgnfargen over hele bildet etterpå (09-aim3d.js), så der er lyset hvitt. R er hvor langt ut
// fra (fx, fy) skyggene tegnes
function glLights(tint, fx, fy, R) {
  const h = G.hour, sunK = smooth(5.5, 7, h) * (1 - smooth(19, 20.5, h)), moonK = h < 12 ? 1 - smooth(4.6, 5.5, h) : smooth(20.5, 21.5, h), night = GL.night = 1 - G.dayl;
  const amb = GL.amb, sun = GL.sun, c = tint ? glLightRgb(h) : [1, 1, 1];
  amb.color.setRGB(c[0], c[1], c[2]); amb.intensity = tint ? lerp(0.95, 0.62, sunK) : lerp(0.8, 0.62, sunK);
  // sola går fra øst om morgenen til vest om kvelden, og kaster skyggene mot oss midt på dagen
  let dx = -0.45, dy = 0.8, dz = -0.4;
  if (sunK > 0) {
    const t = clamp((h - 5.5) / 15, 0, 1), up = Math.sin(Math.PI * t), el = (8 + 47 * up) * Math.PI / 180;
    dx = Math.cos(Math.PI * t) * Math.cos(el); dy = Math.sin(el); dz = -Math.sin(Math.PI * t) * Math.cos(el);
    if (tint) sun.color.set('#ffa868').lerp(new THREE.Color('#fff0dc'), smooth(0.1, 0.6, up)); else sun.color.set('#ffffff');
    sun.intensity = 0.62 * sunK;
  } else { sun.color.set(tint ? '#8ea4e0' : '#ffffff'); sun.intensity = (tint ? 0.3 : 0.14) * moonK; }
  const l = hyp(dx, dy, dz), fh = heightAt(fx, fy), sc = sun.shadow.camera;
  sun.target.position.set(fx, fh, fy); sun.position.set(fx + dx / l * 2200, fh + dy / l * 2200, fy + dz / l * 2200);
  if (sc.right !== R) { sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.updateProjectionMatrix(); }
  // gatelyktene lyser alle sammen når det mørkner. De slås helt av om dagen og langt fra landsbyen, så de ikke koster noe der
  const lit = night > 0.05 && villDist(fx, fy) < 900;
  GL.lamps.forEach(([x, y, z, a], i) => { const p = GL.lampL[i]; p.visible = lit; if (lit) { p.position.set(x, heightAt(x, y) + z, y); p.intensity = a * 5 * night * (tint ? 1 : 1.6); } });
  // de nærmeste av de andre lysene: bål alltid, vinduer og vegglykter når det mørkner
  const src = [];
  for (const f of G.fires) src.push([f.x, f.y, 14, 0xff9440, (0.6 + 2.6 * night) * (0.85 + 0.15 * Math.sin(G.t * 11 + f.id * 50) + 0.08 * Math.sin(G.t * 23.7)), 210]);
  if (night > 0.05) {
    for (const rec of GL.recs.values()) for (const me of rec.houses) if (me.userData.glow) for (const [x, y, z, a] of me.userData.glow) src.push([x, y, z + 2, 0xffc060, a * 5 * night, 80]);
  }
  for (const s of src) s.d = hyp(s[0] - fx, s[1] - fy) - (s[3] === 0xff9440 ? 1e4 : 0);
  src.sort((p, q) => p.d - q.d);
  for (const s of src) if (s[3] === 0xff9440) s.d += 1e4;
  // bålet nærmest står først og kaster skygger; uten bål i nærheten står det første lyset ubrukt
  const fire = src.length && src[0][3] === 0xff9440 && src[0].d < 700;
  if (!fire) src.unshift(null);
  if (fire && tint && !(GL.frame & 1)) GL.pts[0].shadow.needsUpdate = true;
  for (let i = 0; i < GL_PTS; i++) {
    const p = GL.pts[i], s = src[i];
    if (!s || s.d > 900) { p.intensity = 0; continue; }
    p.position.set(s[0], heightAt(s[0], s[1]) + s[2], s[1]); p.color.setHex(s[3]); p.intensity = s[4] * (tint ? 1 : 1.6); p.distance = s[5];
  }
  for (const rec of GL.recs.values()) for (const me of rec.houses) if (me.material && me.material.emissiveMap) me.material.emissiveIntensity = tint ? night : night * 2.2;
}

// ---------- partikler og blod ----------
function glParts(aim, tint) {
  const g = GL.parts.geometry, pos = g.attributes.position.array, col = g.attributes.color.array, lum = tint ? lerp(0.35, 1, G.dayl) : 1;
  let n = 0;
  const put = (x, y, z, hex, a, k) => { if (n >= GL_PARTS) return; const c = glRgb(hex); pos[n * 3] = x; pos[n * 3 + 1] = z; pos[n * 3 + 2] = y; col[n * 4] = c[0] * k; col[n * 4 + 1] = c[1] * k; col[n * 4 + 2] = c[2] * k; col[n * 4 + 3] = a; n++; };
  for (const d of G.blood) put(d.x, d.y, heightAt(d.x, d.y) + 0.4, d.t < 30 ? '#9a2a22' : '#6a221c', clamp(1 - d.t / 240, 0.2, 1), lum);
  for (const p of G.parts) {
    if (aim && (p.fly || p.faint || p.mote || p.glow || p.leaf !== undefined)) continue;
    const l = clamp(p.life, 0, 1);
    if (p.fly) { if (GL.night > 0.05) put(p.x, p.y, heightAt(p.x, p.y) + p.z, '#f4ffb0', l * (0.5 + 0.5 * Math.sin(G.t * 5 + p.x)) * GL.night, 1); continue; }
    put(p.x, p.y, heightAt(p.x, p.y) + p.z, p.col, p.mote ? l * (0.3 + 0.25 * Math.sin(G.t * 3 + p.x)) : p.faint ? l * 0.28 : p.smoke ? l * 0.55 : 1, p.glow ? 1 : lum);
  }
  g.setDrawRange(0, n); g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
}

// ---------- kartet ----------
// Skjermpunktet for (wx, wy) i høyden hz (ellers på bakken), og punktet på bakken under et skjermpunkt
function toScreen(wx, wy, hz) {
  if (hz === undefined) hz = heightAt(wx, wy);
  const dx = wx - CAM.cx, dy = wy - CAM.cy;
  return [W / 2 + (dx * CAM.rx + dy * CAM.ry) * CAM.S, H / 2 - ((dx * CAM.fx + dy * CAM.fy) * GL_SIN + (hz - CAM.hc) * GL_COS) * CAM.S];
}
function toWorld(sx, sy) {
  const u = (sx - W / 2) / CAM.S, v = (sy - H / 2) / CAM.S;
  // punktet t piksler mot kameraet fra midten av bildet, på linja under skjermpunktet
  const at = t => [CAM.cx + CAM.rx * u - CAM.fx * t, CAM.cy + CAM.ry * u - CAM.fy * t];
  const f = t => { const p = at(t); return t * GL_SIN - (heightAt(p[0], p[1]) - CAM.hc) * GL_COS - v; };
  // strålen fra øyet treffer bakken første gang fra kamerasida; let innover fra et punkt som ligger foran alt terreng
  let t1 = (v + 300 * GL_COS) / GL_SIN;
  if (f(t1) <= 0) return at(t1);
  for (let i = 0; i < 160; i++) {
    let t0 = t1 - 6;
    if (f(t0) <= 0) { for (let k = 0; k < 7; k++) { const tm = (t0 + t1) / 2; if (f(tm) <= 0) t0 = tm; else t1 = tm; } return at((t0 + t1) / 2); }
    t1 = t0;
  }
  return at(t1);
}
// Skiltene på husene. På kartet vender de mot kameraet med én piksel i skiltet per piksel i bildet, lagt i hele piksler,
// så bokstavene står skarpt også når kameraet er i ro. De vises bare når huset ses forfra. I siktet henger de på veggen
function glSigns(map, gw, gh) {
  const k = 1 / CAM.z, fx = CAM.fx, fy = CAM.fy, rx = CAM.rx, ry = CAM.ry;
  for (const rec of GL.recs.values()) for (const me of rec.houses) {
    const s = me.userData.sign; if (!s) continue;
    const [x, h, y, nx, ny, hw] = s.userData.at;
    if (!map) { s.visible = true; s.scale.setScalar(1); s.rotation.set(0, Math.PI / 2 - Math.atan2(ny, nx), 0); s.position.set(x - ny * hw, h, y + nx * hw); continue; }
    if (!(s.visible = nx * fx + ny * fy < -0.6)) continue;
    // litt mot kameraet, så skiltet ikke skjærer inn i veggen bak
    const px = x - fx * GL_COS * 16 - rx * hw * k, ph = h + GL_SIN * 16, py = y - fy * GL_COS * 16 - ry * hw * k;
    const u = ((px - CAM.cx) * rx + (py - CAM.cy) * ry) * CAM.z + gw / 2, v = (((px - CAM.cx) * fx + (py - CAM.cy) * fy) * GL_SIN + (ph - CAM.hc) * GL_COS) * CAM.z + gh / 2;
    const du = (Math.round(u) - u) * k, dv = (Math.round(v) - v) * k;
    s.quaternion.copy(GL.camO.quaternion); s.scale.setScalar(k);
    s.position.set(px + rx * du + fx * GL_SIN * dv, ph + GL_COS * dv, py + ry * du + fy * GL_SIN * dv);
  }
}
// Tegner kartet: scenen sett skrått ovenfra mot CAM.yaw rundt (CAM.cx, CAM.cy), lagt inn i lerretet i hele piksler på ZM
function glMap(dt) {
  const r = GL.r, gw = Math.ceil(W / ZM), gh = Math.ceil(H / ZM), cam = GL.camO, S = CAM.S;
  if (GL.w !== gw || GL.h !== gh) { r.setSize(gw, gh, false); GL.w = gw; GL.h = gh; }
  const vw = gw * ZM / S, vh = gh * ZM / S, cx = CAM.cx, cy = CAM.cy, hc = CAM.hc, dep = vh / 2 / GL_SIN;
  // bitene vi ser: litt lenger mot kameraet, der høye trær og åser stikker opp i bildet
  const fx = CAM.fx, fy = CAM.fy, sd = vw / 2 + 60, fw = dep + 120, bk = dep + 260, ex = Math.abs(CAM.rx) * sd, ey = Math.abs(CAM.ry) * sd;
  const kx0 = Math.floor((cx - ex + Math.min(fx * fw, -fx * bk)) / CS), kx1 = Math.floor((cx + ex + Math.max(fx * fw, -fx * bk)) / CS), ky0 = Math.floor((cy - ey + Math.min(fy * fw, -fy * bk)) / CS), ky1 = Math.floor((cy + ey + Math.max(fy * fw, -fy * bk)) / CS);
  for (let ky = ky0; ky <= ky1; ky++) for (let kx = kx0; kx <= kx1; kx++) { const ch = getChunk(kx, ky); if (!ch.gpix) genGround(ch); }
  glWant(kx0, ky0, kx1, ky1, cx, cy, 99);
  glSync(dt, true, cx, cy, Math.max(vw / 2, dep) + 220, null);
  cam.left = -vw / 2; cam.right = vw / 2; cam.top = vh / 2; cam.bottom = -vh / 2; cam.updateProjectionMatrix();
  cam.position.set(cx - fx * GL_COS * 3000, hc + GL_SIN * 3000, cy - fy * GL_COS * 3000); cam.lookAt(cx, hc, cy); glSigns(true, gw, gh);
  GL.scene.fog.near = 1e5; GL.scene.fog.far = 1e6; GL.clip.constant = 1e9;
  GL.parts.material.size = 1.4; GL.parts.material.sizeAttenuation = false;
  r.setClearColor(0x121a16, 1); r.render(GL.scene, cam);
  m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.imageSmoothingEnabled = false;
  m.drawImage(GL.cv, 0, 0, gw, gh, Math.round((W - gw * ZM) / 2), Math.round((H - gh * ZM) / 2), gw * ZM, gh * ZM);
}

// ---------- siktet ----------
// Scenen sett fra (o.x, o.y) i høyden o.camZ mot o.yaw, med brennvidde o.f og bildets midtpunkt i (o.cx, o.hy), i et
// lerret på bw × bh. Samme projeksjon som world() i 09-aim3d.js regner treff og dybde etter. Gir lerretet
function glAim(o, bw, bh) {
  const r = GL.r, cam = GL.camP, n = 4, vx = Math.cos(o.yaw), vy = Math.sin(o.yaw);
  if (GL.w !== bw || GL.h !== bh) { r.setSize(bw, bh, false); GL.w = bw; GL.h = bh; }
  // bitene i synsfeltet, ut til synsranda
  const ex = (o.cx + 8) / o.f * o.far, xs = [o.x, o.x + vx * o.far - vy * ex, o.x + vx * o.far + vy * ex], ys = [o.y, o.y + vy * o.far + vx * ex, o.y + vy * o.far - vx * ex];
  glWant(Math.floor((Math.min(...xs) - 40) / CS), Math.floor((Math.min(...ys) - 40) / CS), Math.floor((Math.max(...xs) + 40) / CS), Math.floor((Math.max(...ys) + 40) / CS), o.x, o.y, 5);
  glSync(0, false, o.x + vx * 260, o.y + vy * 260, 520, o); glSigns(false);
  cam.position.set(o.x, o.camZ, o.y); cam.lookAt(o.x + vx, o.camZ, o.y + vy); cam.updateMatrixWorld();
  cam.projectionMatrix.makePerspective(-o.cx / o.f * n, (bw - o.cx) / o.f * n, o.hy / o.f * n, -(bh - o.hy) / o.f * n, n, o.far + 50);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  GL.scene.fog.near = o.fog0; GL.scene.fog.far = o.far; GL.clip.normal.set(vx, 0, vy); GL.clip.constant = -(vx * o.x + vy * o.y) - SOFT_NEAR;
  GL.parts.material.size = o.f / (bh / 2); GL.parts.material.sizeAttenuation = true;
  r.setClearColor(0x000000, 0); r.render(GL.scene, cam);
  return GL.cv;
}

// Én gang per bilde: lys, ting og figurer. view er siktet (o fra world()) eller null for kartet
function glSync(dt, map, fx, fy, R, view) {
  if (GL.instDirty && (GL.frame - GL.instT > 6 || map)) { glInstRebuild(); GL.instT = GL.frame; }
  GL.wind.uT.value = G.t; GL.wind.uW.value.set(G.wind.x, G.wind.y, G.wind.s); GL.wind.uA.value.set(AIR.gx, AIR.gy);
  glLights(map, fx, fy, R);
  figSync(GL.synced === GL.frame ? 0 : dt, map, view);
  if (GL.synced !== GL.frame) glParts(!map, map);
  GL.synced = GL.frame;
}
