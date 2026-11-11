// ===== Spill: jeger, dyr, våpen, lokking og vær =====
const UPG = [
  { id: 'scope', cat: 'rifle', icon: 'scope', name: 'Sikte', lv: ['Åpne sikter', 'Kikkertsikte 3×', 'Kikkertsikte 6×', 'Variabelt 10× med avstandsmåler'], price: [0, 350, 1100, 2800],
    d: ['Kjerne og skjæring. Ingen forstørrelse å snakke om.', 'Rolig bilde og tydelig trådkors.', 'Ser dyrets bog på lang hold. Viser avstand.', 'Viser avstand, art og anslått vekt i siktet.'] },
  { id: 'barrel', cat: 'rifle', icon: 'barrel', name: 'Pipe', lv: ['Fabrikkpipe', 'Fritt flytende pipe', 'Match-pipe', 'Håndlappet match-pipe'], price: [0, 300, 900, 2400],
    d: ['Grei spredning på kort hold.', 'Strammere grupper og lengre rekkevidde.', 'Presis ut på langt hold.', 'Kula går dit du sikter.'] },
  { id: 'caliber', cat: 'rifle', icon: 'caliber', name: 'Kaliber', lv: ['.222 Remington', '6,5×55', '.308 Winchester', '9,3×62'], price: [0, 600, 1600, 3600],
    d: ['Nok til rev og rådyr.', 'Klassisk hjortekaliber.', 'Tar elg med godt treff.', 'Stopper bjørn og stor elg.'] },
  { id: 'stock', cat: 'rifle', icon: 'stock', name: 'Kolbe', lv: ['Bøkekolbe', 'Valnøtt med kinnstøtte', 'Justerbar kolbe', 'Laminert kolbe og skytestokk'], price: [0, 250, 800, 2000],
    d: ['Siktet vandrer med pusten.', 'Roligere anlegg.', 'Lite bevegelse i siktet.', 'Nesten helt stille i siktet.'] },
  { id: 'mag', cat: 'rifle', icon: 'mag', name: 'Magasin', lv: ['Enkeltskudd', '3 patroner', '4 patroner', '5 patroner'], price: [0, 200, 550, 1200],
    d: ['Ett skudd, så må du lade.', 'Rom for et oppfølgingsskudd.', 'Fire skudd før ny lading.', 'Fem skudd.'] },
  { id: 'bolt', cat: 'rifle', icon: 'bolt', name: 'Sluttstykke', lv: ['Stivt sluttstykke', 'Polert sluttstykke', 'Rett-trekk', 'Rett-trekk og lett avtrekk'], price: [0, 250, 700, 1800],
    d: ['Tregt å repetere.', 'Raskere mellom skuddene.', 'Rask repetering og lading.', 'Lynrask, og lett avtrekk gir mindre rykk.'] },
  { id: 'supp', cat: 'rifle', icon: 'supp', name: 'Lyddemper', lv: ['Ingen', 'Kort demper', 'Fullengde demper', 'Over-løps demper'], price: [0, 400, 1100, 2600],
    d: ['Smellet skremmer alt i vid omkrets.', 'Dyr lenger unna blir stående.', 'Skuddet høres som et dempet slag.', 'Nesten bare kulas smell.'] },
  { id: 'call', cat: 'lure', icon: 'call', name: 'Lokkefløyte', lv: ['Rådyrpipe', 'Hjortebrøler', 'Elgehorn', 'Mesterfløyte'], price: [0, 450, 1200, 2600],
    d: ['Lokker rådyr og rev.', 'Også hjort og rein svarer.', 'Når også elg og villsvin.', 'Selv bjørn, gaupe og ulv kommer for å se.'] },
  { id: 'scentLv', cat: 'lure', icon: 'scent', name: 'Luktstoff', lv: ['Brunstvæske', 'Sterk brunstvæske', 'Mesterblanding'], price: [0, 500, 1400],
    d: ['Trekker dyr innen kort avstand.', 'Når lenger og varer lenger.', 'Trekker dyr fra langt unna.'] },
  { id: 'deo', cat: 'gear', icon: 'deo', name: 'Luktfjerner', lv: ['Ingen', 'Luktfri såpe', 'Karbonspray'], price: [0, 250, 900],
    d: ['Vinden bærer lukten din langt.', 'Kortere luktspor i vinden.', 'Dyrene må nesten tråkke på deg.'] },
  { id: 'hagle', cat: 'hagle', icon: 'hagle', name: 'Hagle', lv: ['Ingen hagle', 'Enløps hagle', 'Dobbeltløps hagle', 'Halvautomatisk hagle'], price: [0, 500, 1400, 3000],
    d: ['', 'For fugl i flukt og småvilt på kort hold. Ett skudd.', 'To løp side om side: to skudd før du lader.', 'Tre skudd og rask lading.'] },
  { id: 'choke', cat: 'hagle', icon: 'choke', name: 'Choke', lv: ['Sylinder', 'Halvchoke', 'Helchoke'], price: [0, 350, 900],
    d: ['Vid sverm som sprer seg fort. Best på kort hold.', 'Samlet sverm ut på middels hold.', 'Tett sverm som når langt, men du må treffe godt.'] },
  { id: 'shell', cat: 'hagle', icon: 'shell', name: 'Patroner', lv: ['Hagl nr. 7', 'Hagl nr. 5', 'Hagl nr. 3'], price: [0, 300, 800],
    d: ['Små hagl. Nok til rype og hare på kort hold.', 'Kraftigere hagl for orrfugl og rev.', 'Grove hagl som tar tiuren på lengre hold.'] },
  { id: 'axe', cat: 'smith', icon: 'axe', name: 'Øks', lv: ['Ingen øks', 'Øks'], price: [0, 300],
    d: ['', 'Hogg ned trær til ved (F ved et tre), og bygg en gapahuk av seks ved fra hjulet (hold Q).'] },
  { id: 'pack', cat: 'gear', icon: 'pack', name: 'Ryggsekk', lv: ['Liten dagstursekk', 'Jaktsekk', 'Stor jaktsekk', 'Bæremeis'], price: [0, 400, 1200, 2800],
    d: ['Rommer 20 kg kjøtt og ved.', 'Rommer 35 kg. Nok til en hjort.', 'Rommer 60 kg.', 'Rommer 110 kg. Bærer en elg i én tur.'] },
  // kniven du skjærer ut kjøttet med: hvert trinn gir 10 % mer kjøtt av hvert dyr (se knifeK), og hver kniv har sitt ikon
  { id: 'knife', cat: 'smith', icon: 'knife0', icons: ['knife0', 'knife1', 'knife2', 'knife3', 'knife4', 'knife5'], name: 'Jaktkniv',
    lv: ['Enkel speiderkniv', 'Tollekniv', 'Jaktkniv med parerplate', 'Flåkniv', 'Samekniv', 'Damaskuskniv'], price: [0, 300, 700, 1300, 2200, 3500],
    d: ['Kort og butt. Mye kjøtt blir sittende igjen på dyret.', 'Skarpt karbonstål i bjørkeskaft. 10 % mer kjøtt av hvert dyr.', 'Kraftig blad med parerplate i messing. 20 % mer kjøtt av hvert dyr.',
      'Buet blad som skiller skinn og kjøtt rent. 30 % mer kjøtt av hvert dyr.', 'Langt blad og skaft av reinhorn. 40 % mer kjøtt av hvert dyr.', 'Damaskusstål som holder eggen hele dagen. 50 % mer kjøtt av hvert dyr.'] },
  // kløv på hunden: det den bærer, kommer i tillegg til ryggsekken din
  { id: 'dogpack', cat: 'gear', icon: 'dogpack', name: 'Hundesekk', lv: ['Ingen hundesekk', 'Hundekløv', 'Stor hundekløv'], price: [0, 500, 1300],
    d: ['Hunden bærer ingenting.', 'Hunden bærer 8 kg kjøtt og ved for deg.', 'Hunden bærer 15 kg for deg.'] },
  // pil og bue: modellen gir pilfarten, og dermed hvor mye pila faller på veien (se BST og arrowDrop)
  { id: 'bue', cat: 'bue', icon: 'bow', name: 'Bue', lv: ['Ingen bue', 'Langbue', 'Recurvebue', 'Compoundbue'], price: [0, 600, 1500, 3200],
    d: ['', 'Enkel langbue i ask. Pila faller mye, så sikt over dyret på lengre hold.', 'Raskere pil og flatere bane.', 'Trinser og kabler: rask pil, flat bane og rolig sikte.'] },
  // hesten og det den har på seg kjøpes i stallen (need: det du må ha først). Uten sal bærer den bare for deg der den står
  { id: 'horse', cat: 'stable', icon: 'horse', name: 'Hest', lv: ['Ingen hest', 'Fjordhest'], price: [0, 3000],
    d: ['', 'Står ved stallen når du har kjøpt den, og bærer 80 kg kjøtt og ved i kløvveskene. For å ri den trenger du sal.'] },
  { id: 'saddle', cat: 'stable', need: 'horse', icon: 'saddle', name: 'Sal', lv: ['Ingen sal', 'Sal med stigbøyler'], price: [0, 1200],
    d: ['', 'Med sal kan du ri hesten (F ved hesten).'] },
  { id: 'hbag', cat: 'stable', need: 'horse', icon: 'hbag', name: 'Ekstra ryggsekk', lv: ['Bare kløvveskene', 'Ekstra ryggsekk bak salen'], price: [0, 900],
    d: ['', 'Hesten bærer 150 kg i stedet for 80.'] },
];
const ST = {
  mag: [1.5, 1.9, 2.4, 3.0], fov: [40, 22, 15, 10], spread: [1.1, 0.75, 0.45, 0.25], range: [260, 340, 440, 560], dmg: [40, 70, 100, 145],
  sway: [2.4, 1.7, 1.1, 0.7], cap: [1, 3, 4, 5], cycle: [1.5, 1.05, 0.7, 0.45], reload: [2.4, 1.8, 1.3, 0.9], noise: [1500, 850, 450, 260],
  callR: [420, 520, 620, 720], scentR: [200, 300, 420], scentT: [90, 140, 200], deo: [1, 0.7, 0.45],
  pack: [20, 35, 60, 110], dogpack: [0, 8, 15], hbag: [80, 150],
};
// ---------- klær ----------
// Hatt, jakke, bukse, hansker og sko: ett plagg av hvert på kroppen (G.wear). Det du kjøper i bua, havner i utstyret
// (G.slots), og du tar det på i inventaret; det du hadde på deg, havner i utstyret. Egenskapene (det som mangler, er nøytralt):
//   warm   holder varmen: kulda tærer mindre på helsa, du blir sjeldnere forkjølet og tørker fortere
//   camo   hvor godt dyrene ser deg, der 1 er vanlig og lavere er bedre
//   noise  hvor langt skrittene høres (sko, og jakker som rasler)
//   run    hvor lenge du orker å springe, der 1 er fem sekunder
//   wet    hvor fort og hvor mye du blir våt når du vasser grunt, der 1 er gjennomvåt med en gang
//   life   skoene slites: sekunder med vanlig gange fra nye til utslitte. Springing sliter dobbelt og vann halvannen gang
//   steady hvor mye kulda får siktet til å skjelve, der 1 er bare hender
//   slow   lading og repetering tar så mange ganger lenger;  work  hogging og bygging tar så mange ganger lenger
//   dry    klærne tørker så mange ganger fortere
// Barbeint er du bråkete, orker lite, henter deg sakte inn og blir stadig våtere og kaldere av å gå
const CLO_SLOTS = [['hat', 'Hatt'], ['jacket', 'Jakke'], ['pants', 'Bukse'], ['gloves', 'Hansker'], ['shoes', 'Sko']];
const CLO = {
  nohat: { slot: 'hat', icon: 'hat', name: 'Ingen hatt', price: 0, warm: -0.15, d: 'Varmen slipper ut gjennom hodet.' },
  jakthatt: { slot: 'hat', icon: 'hat', name: 'Jakthatt', price: 150, d: 'Grønn hatt med oransje bånd, så andre jegere ser deg.' },
  ullue: { slot: 'hat', icon: 'beanie', name: 'Ullue', price: 200, warm: 0.2, d: 'Holder på varmen. Kulda biter mindre, og du tørker fortere.' },
  hodenett: { slot: 'hat', icon: 'headnet', name: 'Hodenett', price: 450, camo: 0.85, warm: -0.1, d: 'Kamuflasjenett over ansiktet. Dyrene ser deg dårligere, men det varmer ingenting.' },
  pelslue: { slot: 'hat', icon: 'furhat', name: 'Pelslue med klaffer', price: 700, warm: 0.4, camo: 1.1, d: 'Svært varm, men den store pelsen synes godt.' },
  nojacket: { slot: 'jacket', icon: 'jacket', name: 'Bare skjorta', price: 0, warm: -0.3, camo: 1.1, d: 'Du fryser fort, og den lyse skjorta synes.' },
  gronn: { slot: 'jacket', icon: 'jacket', name: 'Grønn jakke', price: 150, d: 'Dyrene ser deg på vanlig avstand.' },
  kamo: { slot: 'jacket', icon: 'camo', name: 'Kamuflasjedress', price: 300, camo: 0.75, d: 'Du glir inn i skogen.' },
  ull: { slot: 'jacket', icon: 'wool', name: 'Ullanorakk', price: 650, camo: 0.85, warm: 0.35, noise: 0.85, d: 'Varm og stille ull i dempede farger.' },
  skall: { slot: 'jacket', icon: 'shelljk', name: 'Vanntett skalljakke', price: 800, camo: 0.95, warm: 0.15, dry: 2.5, noise: 1.25, d: 'Klærne under holder seg tørre, så du tørker fort etter vassing. Men den rasler.' },
  lov: { slot: 'jacket', icon: 'leafy', name: '3D-løvdress', price: 1000, camo: 0.55, warm: -0.1, noise: 1.1, d: 'Du er en busk blant busker, men løvet rasler, og dressen er kald.' },
  nopants: { slot: 'pants', icon: 'pants', name: 'Bare longs', price: 0, warm: -0.15, d: 'Tynne longs holder ikke på varmen.' },
  jaktbukse: { slot: 'pants', icon: 'pants', name: 'Jaktbukse', price: 150, d: 'Slitesterk grønn bukse med store lommer på lårene.' },
  nogloves: { slot: 'gloves', icon: 'glove', name: 'Ingen hansker', price: 0, d: 'Kalde fingre får siktet til å skjelve når du fryser.' },
  skyte: { slot: 'gloves', icon: 'shootglove', name: 'Skytehansker', price: 200, steady: 0.5, d: 'Tynne hansker med godt grep. Kulda får siktet til å skjelve halvparten så mye.' },
  arbeid: { slot: 'gloves', icon: 'glove', name: 'Arbeidshansker i skinn', price: 250, steady: 0.8, work: 0.7, d: 'Du hogger og bygger fortere.' },
  votter: { slot: 'gloves', icon: 'mitten', name: 'Ullvotter', price: 350, steady: 0.25, warm: 0.15, slow: 1.4, d: 'Varme votter: siktet holder seg rolig i kulda, men lading og repetering går tregere.' },
  bare: { slot: 'shoes', icon: 'rubber', name: 'Barbeint', price: 0, noise: 1.6, run: 0.5, wet: 1, d: 'Bråkete steg. Du blir stadig våtere og kaldere, orker lite og henter deg sakte inn.' },
  gummi: { slot: 'shoes', icon: 'rubber', name: 'Gummistøvler', price: 150, run: 0.8, wet: 0.2, life: 2400, d: 'Tørre i grunt vann og holder lenge, men tunge å springe i.' },
  jogg: { slot: 'shoes', icon: 'sneaker', name: 'Joggesko', price: 300, noise: 0.85, run: 2, wet: 1, life: 800, d: 'Du orker å springe dobbelt så lenge, men de blir våte med en gang og slites fort.' },
  fjell: { slot: 'shoes', icon: 'boots', name: 'Lette fjellstøvler', price: 500, noise: 0.7, run: 1.3, wet: 0.5, life: 1600, d: 'Stillere steg, greie å springe i og tåler litt vann.' },
  skinn: { slot: 'shoes', icon: 'leather', name: 'Skinnstøvler med ullsokker', price: 1000, noise: 0.48, run: 0.7, wet: 0.15, life: 4000, d: 'Nesten lydløse og tørre, og de holder lengst. Tunge å springe i.' },
};
const CLO_NONE = { hat: 'nohat', jacket: 'nojacket', pants: 'nopants', gloves: 'nogloves', shoes: 'bare' };
const CLO_START = { hat: 'jakthatt', jacket: 'gronn', pants: 'jaktbukse', gloves: 'nogloves', shoes: 'gummi' };
const BARE_COLD = 0.4;
const worn = sl => CLO[G.wear[sl]] || CLO[CLO_NONE[sl]];
// summen eller produktet av en egenskap over alt du har på deg
const cloSum = k => CLO_SLOTS.reduce((s, [sl]) => s + (worn(sl)[k] || 0), 0);
const cloMul = k => CLO_SLOTS.reduce((s, [sl]) => s * (worn(sl)[k] ?? 1), 1);
// det bua gir for et plagg: halv pris, og for sko etter hvor mye som er igjen av dem (hp); cloTrade for det du har på deg
const cloKr = (c, hp) => c.price ? Math.max(1, Math.round(c.price * SELL_K * (c.slot === 'shoes' ? hp / 100 : 1))) : 0;
const cloTrade = sl => cloKr(worn(sl), G.shoeHp);
// Et plagg i inventaret er { clo, hp }, der hp bare gjelder sko. takeOff tar av plagget på plassen sl og gir det
// tilbake som et slikt (null hvis plassen var tom); putOn tar det på
function takeOff(sl) {
  const id = G.wear[sl]; if (id === CLO_NONE[sl]) return null;
  G.wear[sl] = CLO_NONE[sl]; return sl === 'shoes' ? { clo: id, hp: G.shoeHp } : { clo: id };
}
function putOn(o) { const sl = CLO[o.clo].slot; G.wear[sl] = o.clo; if (sl === 'shoes') G.shoeHp = o.hp ?? 100; }
// Hagla: modellen gir antall skudd og ladetid, choken svermens spredning (radianer) og patronene antall hagl,
// kraft per hagl og holdet (piksler) der haglene begynner å miste kraft. Vidt bilde og lite uro i siktet
const HST = { cap: [0, 1, 2, 3], reload: [0, 1.5, 1.8, 1.2], cycle: [0, 0.3, 0.22, 0.3], spread: [0.07, 0.05, 0.036], pellets: [26, 20, 14], pdmg: [1.5, 2.2, 3.2], prange: [90, 115, 145], fov: 66, sway: 0.5 };
// Buen: modellen gir pilfarten (m/s), skaden, spredningen (som rifla), uroen i siktet, tida det tar å legge en ny pil på
// strengen og holdet (piksler) der pila begynner å miste kraft. Én pil om gangen. Buen er nesten lydløs, så bare dyr innen
// noise piksler skvetter, og den er skutt inn på zero meter. Pila ødelegger lite kjøtt: dyr du feller med bue, gir
// BOW_MEAT ganger så mye kjøtt (og verdi), som veier opp for at det er vanskeligere å treffe
const BST = { spd: [0, 50, 60, 76], dmg: [0, 60, 80, 105], spread: [0, 0.9, 0.7, 0.45], sway: [0, 1.9, 1.5, 1.0], reload: [0, 1.6, 1.3, 1.0], range: [0, 100, 140, 180], fov: 50, noise: 90, zero: 20 };
const BOW_MEAT = 1.25;
// Hvor langt under siktelinja pila går på avstanden z (piksler), som vinkel (radianer): over litt nærmere enn zero meter,
// og stadig mer under jo lenger unna
const arrowDrop = (z, L = lv('bue')) => 0.5 * 9.81 * (z * M_PER_PX - BST.zero) / BST.spd[L] ** 2;
const CALLSP = [['radyr', 'rev'], ['radyr', 'rev', 'hjort', 'rein'], ['radyr', 'rev', 'hjort', 'rein', 'elg', 'villsvin'], ['radyr', 'rev', 'hjort', 'rein', 'elg', 'villsvin', 'bjorn', 'gaupe', 'ulv']];
const FLASK_PRICE = 120, M_PER_PX = 0.25;
// Patroner og piler kjøpes i esker og bunter i bua og ligger i sekken til du lader (R). Du starter med start riflepatroner
// (hagle.start får eldre lagringer med hagle), og i bua lades våpnene av seg selv fra det du har. Er du tom for
// riflepatroner og blakk når du kommer inn, gir bua deg AMMO_AID
const AMMO = { rifle: { n: 20, price: 300, start: 20 }, hagle: { n: 25, price: 150, start: 25 }, bue: { n: 12, price: 240, start: 0 } }, AMMO_AID = 5;
// Godbiter til hunden: én går med for hvert dyr hunden står for
const TREAT_PRICE = 150, TREAT_N = 5, TREAT_START = 3;
// Friluft: fyrstikker kjøpes i esker; hvert tre gir ved, et bål tar én kubbe og en gapahuk seks.
// Bålet brenner i FIRE_T sekunder (åtte timer i spillet). Segner du om, koster redningen RESCUE kr
const MATCH_PRICE = 40, MATCH_N = 10, HUT_WOOD = 6, FIRE_T = 240, RESCUE = 250;
const CHOP = { spruce: 2, pine: 2, birch: 2, rowan: 1, snag: 1 }, TREE_N = { spruce: 'grana', pine: 'furua', birch: 'bjørka', rowan: 'rogna', snag: 'tørrfuru' };
// Ryggsekken: kjøtt og ved har vekt, småting (fyrstikker, luktstoff, godbiter) bæres i lomma. Et dyr gir kjøtt etter
// vekta (fugl mer av seg enn pattedyr), og det som ikke får plass, blir liggende igjen til du kommer tilbake.
// Har hunden sekk, bærer den en del for deg, så plassen er ryggsekken og hundesekken til sammen.
// Penger får du først når du selger i bua: kjøttet til verdien dyret hadde, ved til fastpris og det du har kjøpt for halv pris
const WOOD_KG = 2, WOOD_PRICE = 15, MEAT_K = 0.25, MEAT_KB = 0.6, COOK_KG = 0.5, SELL_K = 0.5;
const kg1 = v => Math.round(v * 10) / 10;
const meatKg = () => kg1(G.meat.reduce((s, l) => s + l.kg, 0));
const meatKr = () => G.meat.reduce((s, l) => s + l.kr, 0);
const sackKg = () => kg1(meatKg() + G.wood * WOOD_KG);
const sackCap = () => ST.pack[lv('pack')] + ST.dogpack[lv('dogpack')];
const sackFree = () => Math.max(0, kg1(sackCap() - sackKg()));
// Hesten (kjøpt i stallen) bærer horseCap() kg: kjøtt (G.rack, partier som i sekken) og det du flytter over fra deg i inventaret
// (G.cargo: ved, patronene i sekken og forbruksvarene). Det blir liggende på hesten, og kan bare lastes og hentes når hesten
// står innen HORSE_REACH av deg eller du sitter på den. Det selges i bua når den står innen HORSE_SHOP av døra
const HORSE_REACH = 40, HORSE_SHOP = 100;
const horseCap = () => ST.hbag[lv('hbag')];
const CARGO = ['wood', 'rounds', 'shells', 'arrows', 'scents', 'treats', 'matches'];
const rackKg = () => kg1(G.rack.reduce((s, l) => s + l.kg, 0));
const rackKr = () => G.rack.reduce((s, l) => s + l.kr, 0);
const horseKg = () => kg1(rackKg() + G.cargo.wood * WOOD_KG);
const horseNear = (r = HORSE_REACH) => lv('horse') > 0 && (HORSE.on || hyp(HORSE.x - P.x, HORSE.y - P.y) < r);
// rådet når sekken er full og hesten ikke er her
const horseHint = () => lv('horse') ? `hent hesten: den bærer ${horseCap()} kg` : `kjøp en hest i stallen: den bærer ${ST.hbag[0]} kg`;
const rackFree = () => horseNear() ? Math.max(0, kg1(horseCap() - horseKg())) : 0;
// plass til kjøtt der du står: sekken, og hesten hvis den er like ved
const meatFree = () => kg1(sackFree() + rackFree());
const meatName = l => l.sp && SPEC[l.sp] ? 'Kjøtt av ' + SPEC[l.sp].name.toLowerCase() : 'Kjøtt';
// Bøter: vådeskudd er skudd som går av uten at du sikter, bom er siktede skudd som ikke treffer dyr
// Hagle er bare lov på småvilt og fugl; skyter du storvilt med den, blir det bot. Lar du felt vilt ligge og råtne,
// er boten verdien av kjøttet som råtner, og minst rot hvis du ikke har tatt vare på noe av dyret (se rotFine)
const FINE = { hip: 200, miss: 50, big: 300, rot: 500 };
const ZONES = { head: ['Hodeskudd', 2.2, 0.95], vital: ['Hjerte/lunge', 1.6, 1], body: ['Bogtreff', 1, 0.8], rear: ['Bakpart', 0.75, 0.7], leg: ['Beinskudd', 0.45, 0.6], torso: ['Kroppstreff', 1.4, 0.6], shot: ['Haglskudd', 1, 1] };
// Vekt med desimalkomma; små dyr og fugler veies på tidelen
const fmtKg = kg => String(kg).replace('.', ',') + ' kg';

const G = {
  t: 0, hour: 6.6, day: 1, money: 0, scents: 2, treats: TREAT_START, wood: 0, matches: 0, rounds: AMMO.rifle.start, shells: 0, arrows: 0, meat: [], rack: [], fires: [], huts: [], falls: [], cut: new Set(), crackT: 0, journal: [], up: {}, started: false, paused: false, panel: null, gun: 'rifle', view3d: false,
  wind: { a: 0, s: 0.5, x: 1, y: 0 }, animals: [], scentObjs: [], blood: [], parts: [], msgs: [], spawnT: 0, quiet: [], dayl: 1, hunters: [], saveT: 15, pauseT: 0,
  wear: { ...CLO_START }, shoeHp: 100, cargo: {},
  // oppdraget du har tatt hos grunneieren (se QUEST), og hvilke av dagens tilbud som er brukt opp
  quest: null, qd: { day: 0, used: [] },
  // rutene i inventaret slik du har lagt dem: utstyr, kjøtt og hesten, med en nøkkel (wood, meat:elg …) eller et plagg i hver
  slots: { gear: [], meat: [], horse: [] },
  // de to våpenplassene i inventaret (se GUNS); G.gun er det av dem du har i hendene, null når begge er tomme
  arms: ['rifle', null],
};
for (const u of UPG) G.up[u.id] = 0;
for (const k of CARGO) G.cargo[k] = 0;
const P = { x: 0, y: 30, face: 'down', flip: false, walkT: 0, moving: false, sneak: false, aim: false, breath: 1, hold: false, mag: { rifle: 0, hagle: 0, bue: 0 }, cycle: 0, reload: 0, callCd: 0, stepT: 0, wet: false, deep: false, cold: 0, chill: false, sway: [0, 0], unrest: 0, winded: false, bph: 0, hp: 100, sick: false, risk: 0, warm: false, work: null, sneezeT: 20 };
const lv = id => G.up[id];
// Våpnene: rifla har du fra start, hagla og buen når du har kjøpt dem (trinn over 0). De to våpenplassene i inventaret
// (G.arms) er det du har med deg; de andre ligger i utstyret (eller på hesten) som { gun } til du drar dem opp.
// ammo er det våpenet skyter i sekken (G.rounds, G.shells eller G.arrows), og P.mag hvor mange som sitter i hvert
const GUNS = {
  rifle: { the: 'rifla', ico: 'rifle', ammo: 'rounds', own: () => true },
  hagle: { the: 'hagla', ico: 'hagle', ammo: 'shells', own: () => lv('hagle') > 0 },
  bue: { the: 'buen', ico: 'bow', ammo: 'arrows', own: () => lv('bue') > 0 },
};
const hagle = () => G.gun === 'hagle';
const bue = () => G.gun === 'bue';
const gunCap = (g = G.gun) => g === 'hagle' ? HST.cap[lv('hagle')] : g === 'bue' ? (lv('bue') ? 1 : 0) : g ? ST.cap[lv('mag')] : 0;
const ammoKey = (g = G.gun) => GUNS[g] ? GUNS[g].ammo : 'rounds';
const inGun = (g = G.gun) => P.mag[g] || 0;
// navnet på våpenet: modellen for hagla og buen
const gunLabel = g => g === 'rifle' ? 'Rifle' : UPG.find(u => u.id === g).lv[lv(g)];
const noGun = () => { sfx.deny(); msg('Du har ikke noe våpen i hendene. Dra et opp i en våpenplass i inventaret (E).', 'warn'); };
// Lader alle våpnene du eier fra sekken (ved start og i bua). Har et våpen fått mindre plass (solgt magasin, hagle
// eller bue), går det som ikke får plass, tilbake i sekken
function refill() {
  for (const g in GUNS) {
    const k = GUNS[g].ammo, cap = gunCap(g), n = P.mag[g] || 0;
    if (n > cap) { G[k] += n - cap; P.mag[g] = cap; } else { const t = Math.min(cap - n, G[k]); G[k] -= t; P.mag[g] = n + t; }
  }
  P.reload = 0;
}
// Hjulet: bytt til det andre våpenet i våpenplassene
function switchGun() {
  if (!G.started || G.paused) return;
  const g = G.arms.find(a => a && a !== G.gun);
  if (!g) { sfx.deny(); msg('Du har bare ett våpen i våpenplassene. Dra et til opp i inventaret (E).'); return; }
  G.gun = g; P.reload = 0; P.cycle = 0.4; if (g === 'bue') sfx.reload(); else sfx.bolt();
  msg((g === 'rifle' ? 'Rifla' : gunLabel(g)) + ' i hendene.');
}
// Holder våpnene på plass: hvert våpen du eier, ligger ett sted (en våpenplass, utstyret eller hesten), og det du har
// solgt, er borte. Et nytt våpen havner i første ledige rute i utstyret. Er våpenet i hendene ikke i en våpenplass
// lenger, tar du det første som er der
function armsFix() {
  const owns = g => GUNS[g] && GUNS[g].own(), isGun = o => o && typeof o === 'object' && o.gun;
  G.arms = [0, 1].map(i => owns(G.arms[i]) && G.arms.indexOf(G.arms[i]) === i ? G.arms[i] : null);
  for (const L of Object.values(G.slots)) for (let i = 0; i < L.length; i++) if (isGun(L[i]) && (!owns(L[i].gun) || G.arms.includes(L[i].gun))) L[i] = null;
  for (const g in GUNS) {
    if (!owns(g) || G.arms.includes(g) || Object.values(G.slots).some(L => L.some(o => isGun(o) && o.gun === g))) continue;
    const L = G.slots.gear; while (L.length < INV_N.gear) L.push(null);
    const i = L.indexOf(null); L[i < 0 ? L.length : i] = { gun: g };
  }
  if (!G.gun || !G.arms.includes(G.gun)) { G.gun = G.arms.find(a => a) || null; P.reload = 0; }
}

// ---------- oppdaget terreng ----------
// Oversiktskartet (M) viser bare det du har vært i nærheten av. Jaktfeltet er delt i FOG_N × FOG_N ruter, og rutene
// innen FOG_R ruter fra den jegeren står i, blir oppdaget (G.seen). Lagres som én bit per rute
const FOG_N = 120, FOG_S = 2 * WORLD / FOG_N, FOG_R = 2.6;
G.seen = new Uint8Array(FOG_N * FOG_N); G.seenAt = -1;
const fogCell = v => clamp(Math.floor((v + WORLD) / FOG_S), 0, FOG_N - 1);
const seenAt = (x, y) => G.seen[fogCell(y) * FOG_N + fogCell(x)];
function discover() {
  const ci = fogCell(P.x), cj = fogCell(P.y), n = Math.ceil(FOG_R);
  if (G.seenAt === cj * FOG_N + ci) return; G.seenAt = cj * FOG_N + ci;
  for (let j = Math.max(0, cj - n); j <= Math.min(FOG_N - 1, cj + n); j++) for (let i = Math.max(0, ci - n); i <= Math.min(FOG_N - 1, ci + n); i++) if (hyp(i - ci, j - cj) <= FOG_R) G.seen[j * FOG_N + i] = 1;
}
function seenPack() { const b = new Uint8Array(G.seen.length >> 3); G.seen.forEach((v, i) => { if (v) b[i >> 3] |= 1 << (i & 7); }); return btoa(String.fromCharCode(...b)); }
function seenUnpack(t) { const b = atob(t || ''); G.seen.forEach((v, i) => { G.seen[i] = b.charCodeAt(i >> 3) >> (i & 7) & 1; }); G.seenAt = -1; }

// ---------- lagring (localStorage i denne nettleseren) ----------
const SAVE_KEY = 'skogsro.v1';
function save() {
  try {
    // som gjest hos en annen vert er gapahukene og stubbene vertens, så da beholdes de du hadde lagret fra før
    const old = isAuth() ? null : JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {};
    localStorage.setItem(SAVE_KEY, JSON.stringify({ money: G.money, up: G.up, scents: G.scents, treats: G.treats, journal: G.journal, day: G.day, hour: G.hour,
      quest: G.quest, qd: G.qd, wood: G.wood, matches: G.matches, meat: G.meat, rack: G.rack, cargo: G.cargo, slots: G.slots, hp: Math.round(P.hp), sick: P.sick, wear: G.wear, shoeHp: Math.round(G.shoeHp * 10) / 10,
      // patronene lagres med dem som sitter i våpnene; de lades igjen når du starter
      rounds: G.rounds + inGun('rifle'), shells: G.shells + inGun('hagle'), arrows: G.arrows + inGun('bue'), arms: G.arms, gun: G.gun, seen: seenPack(),
      huts: old ? old.huts || [] : G.huts.map(h => [Math.round(h.x), Math.round(h.y)]), cut: old ? old.cut || [] : [...G.cut] }));
  } catch (e) { }
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (!s) return false;
    G.money = s.money | 0; Object.assign(G.up, s.up || {}); G.scents = s.scents ?? 2; G.treats = s.treats ?? TREAT_START; G.journal = s.journal || []; G.day = s.day || 1; if (typeof s.hour === 'number') G.hour = s.hour;
    // kjøttet ligger i sekken som ett parti per art: [{ sp, kg, kr }]. Eldre lagringer hadde bare et antall stykker
    G.wood = s.wood | 0; G.matches = s.matches | 0;
    // fra før patronene kostet penger: en eske riflepatroner, og en eske haglpatroner til den som har hagle
    G.rounds = s.rounds ?? AMMO.rifle.start; G.shells = s.shells ?? (lv('hagle') ? AMMO.hagle.start : 0); G.arrows = s.arrows | 0;
    const lots = L => L.filter(l => l && l.kg > 0).map(l => ({ sp: String(l.sp || ''), kg: kg1(+l.kg), kr: Math.round(+l.kr || 0) }));
    G.meat = Array.isArray(s.meat) ? lots(s.meat) : s.meat > 0 ? [{ sp: '', kg: s.meat | 0, kr: (s.meat | 0) * 40 }] : [];
    G.rack = Array.isArray(s.rack) ? lots(s.rack) : [];
    for (const k of CARGO) G.cargo[k] = Math.max(0, (s.cargo || {})[k] | 0);
    P.hp = clamp(s.hp ?? 100, 1, 100); P.sick = !!s.sick;
    // klærne; eldre lagringer hadde bare kamuflasje og støvler som trinn i utstyret
    const w = s.wear || {}, up = s.up || {};
    for (const [sl] of CLO_SLOTS) G.wear[sl] = CLO[w[sl]] && CLO[w[sl]].slot === sl ? w[sl] : CLO_START[sl];
    if (!s.wear) { G.wear.jacket = ['gronn', 'kamo', 'lov'][up.camo | 0] || 'gronn'; G.wear.shoes = ['gummi', 'fjell', 'skinn'][up.boots | 0] || 'gummi'; }
    G.shoeHp = clamp(s.shoeHp ?? 100, 0, 100);
    // rutene: nøkler beholdes (de som ikke finnes lenger, ryddes bort når inventaret vises), plagg bare hvis de finnes i bua
    const cell = e => typeof e === 'string' ? e : e && GUNS[e.gun] ? { gun: e.gun } : e && CLO[e.clo] && CLO[e.clo].price ? CLO[e.clo].slot === 'shoes' ? { clo: e.clo, hp: clamp(+e.hp || 0, 0, 100) } : { clo: e.clo } : null;
    for (const g in G.slots) { const A = (s.slots || {})[g === 'horse' && !(s.slots || {}).horse ? 'atv' : g]; G.slots[g] = (Array.isArray(A) ? A : []).map(cell).map((e, i, A) => typeof e === 'string' && A.indexOf(e) < i ? null : e); }
    G.huts = (s.huts || []).map(([x, y]) => ({ id: Math.random(), x, y })); G.cut = new Set(s.cut || []); seenUnpack(s.seen);
    // våpenplassene; fra før de fantes, hadde du rifla og hagla (hvis du hadde den) med deg
    G.arms = Array.isArray(s.arms) ? [0, 1].map(i => GUNS[s.arms[i]] ? s.arms[i] : null) : ['rifle', lv('hagle') ? 'hagle' : null];
    if (GUNS[s.gun]) G.gun = s.gun;
    G.quest = s.quest && SPEC[s.quest.sp] && (s.quest.kind === 'meat' || REGIONS[s.quest.area]) ? s.quest : null;
    G.qd = s.qd && Array.isArray(s.qd.used) ? s.qd : { day: 0, used: [] };
    // uten hest (lagringer fra før hesten måtte kjøpes): det som lå på lasteplanet, er hos deg igjen
    if (!lv('horse')) {
      for (const k of CARGO) { G[k] += G.cargo[k]; G.cargo[k] = 0; }
      for (const l of G.rack) { const t = G.meat.find(t => t.sp === l.sp); if (t) { t.kg = kg1(t.kg + l.kg); t.kr += l.kr; } else G.meat.push(l); }
      G.rack = []; for (const o of G.slots.horse) if (o && o.clo) { const L = G.slots.gear, i = L.indexOf(null); L[i < 0 ? L.length : i] = o; }
      G.slots.horse = [];
    }
    armsFix();
    return true;
  } catch (e) { return false; }
}

// ---------- meldinger ----------
function msg(text, kind) { G.msgs.push({ text, kind: kind || '', t: 0 }); if (G.msgs.length > 5) G.msgs.shift(); HUD.dirtyMsg = true; }

// ---------- jegere dyra kan merke (deg og de andre på nettet) ----------
function hunters() {
  const L = [];
  if (G.started && G.panel !== 'shop') L.push({ id: NET.id, x: P.x, y: P.y, moving: P.moving, sneak: P.sneak || P.aim, wet: P.wet, camo: cloMul('camo'), deo: lv('deo') });
  for (const r of NET.peers.values()) if (r.started && !r.in) L.push(r);
  return L;
}
// Steder dyr skal finnes rundt: deg og alle andre som er i skogen
function anchors() {
  const L = [P];
  for (const r of NET.peers.values()) if (r.started) L.push(r);
  return L;
}
// h.horse: jegeren rir (farta 0–1), og hovslagene høres lenger enn skritt. h.noise er hvor mye skoene og
// jakka bråker (1 er vanlig)
function stepNoise(h) {
  const nr = h.horse ? 110 + 170 * h.horse : (h.sneak ? 32 : h.run ? 170 : 95) * (h.noise ?? 1) * (h.wet ? 1.4 : 1);
  for (const a of G.animals) if (a.state !== 'dead' && a.state !== 'flee') { const d = hyp(a.x - h.x, a.y - h.y); if (d < nr) a.aware = Math.min(1.6, a.aware + 0.45 * (1 - d / nr) * SPEC[a.sp].hear); }
}
const canTake = (a, pid) => !a.by || a.by === pid || (a.by !== NET.id && !NET.peers.has(a.by));

// ---------- dyr ----------
// Dyr finnes innen ANIMAL_R av en jeger; lenger unna blir de borte
const ANIMAL_R = 2200;
function pickSpecies(x, y) {
  const f = fields(x, y, cabinsNear(x, y)), F = f[0], Cn = f[1], night = 1 - G.dayl;
  // klimaet: fjellvilt i det kalde nord, hjortevilt og småvilt i det milde sørvest. K(kaldt, mildt) skalerer arten
  const kc = Math.max(0, f[6]), km = Math.max(0, -f[6]), K = (c, m) => (1 + c * kc) * (1 + m * km);
  const w = { radyr: 3 * K(-0.6, 0.6), rev: 1.5 * K(0, 1.5), hjort: (F > 0.4 && Cn < 0.65 ? 1.8 : 0.8) * K(-0.85, 2.5), rein: (F < 0.42 ? 1.6 : 0.15) * K(4, -0.9),
    villsvin: (Cn < 0.5 ? 1.3 : 0.4) * K(-0.9, 2), elg: 1 + (f[2] < 4 ? 1 : 0), bjorn: (Cn > 0.5 ? 0.35 : 0.12) * (1 + night) * K(4, -0.7),
    gaupe: (Cn > 0.45 ? 0.22 : 0.1) * K(1, 0), ulv: (F < 0.6 ? 0.16 : 0.06) * K(1.5, 0), hare: 1.6, grevling: (F > 0.3 ? 0.4 : 0.1) * (1 + night * 2) * K(-0.8, 1.5),
    storfugl: Cn > 0.5 && F > 0.4 ? 1.1 : 0.25, orrfugl: F < 0.55 ? 1.1 : 0.35, rype: (F < 0.42 ? 1.5 : 0.08) * K(2, -0.9) };
  // arten grunneieren vil ha felt, trekker til området oppdraget gjelder
  const q = G.quest; if (q && q.kind === 'cull' && !q.got && regionAt(x, y).idx === q.area) w[q.sp] = w[q.sp] * 3 + 2;
  let tot = 0; for (const k in w) tot += w[k];
  let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; }
  return 'radyr';
}
// Hvor langt dyra ser i forhold til SPEC.sight: på åpen mark og i tett skog
const SIGHT_OPEN = 2.6, SIGHT_WOOD = 0.85;
function spawnAnimal(sp, x, y, sex) {
  const A = SPEC[sp]; sex = sex || (Math.random() < 0.5 ? 'm' : 'f');
  const kr = A.kg[sex], k = lerp(kr[0], kr[1], Math.pow(Math.random(), 1.3)), kg = k < 10 ? Math.round(k * 10) / 10 : Math.round(k);
  const a = { sp, sex, x, y, z: 0, vx: 0, vy: 0, face: Math.random() < 0.5 ? 1 : -1, state: 'graze', t: rnd(2, 10), hp: A.hp * (sex === 'm' ? 1.1 : 1), aware: 0, kg, anim: Math.random() * 4, tx: x, ty: y, bleed: 0, bloodT: 0, waterT: 0, head: Math.random() * TAU, id: Math.random() };
  G.animals.push(a); return a;
}
function trySpawn(h) {
  const alive = G.animals.filter(a => a.state !== 'dead' && hyp(a.x - h.x, a.y - h.y) < ANIMAL_R).length;
  if (alive >= 14) return;
  // nye dyr kommer til ute i disen, lenger unna enn du ser dem tydelig i siktet
  const ang = Math.random() * TAU, dist = rnd(1300, 1900), x = h.x + Math.cos(ang) * dist, y = h.y + Math.sin(ang) * dist;
  // der det nylig er skutt, kommer det ikke nye dyr på en god stund
  if (!inWorld(x, y) || G.quiet.some(q => hyp(x - q.x, y - q.y) < q.r)) return;
  const f = fields(x, y, cabinsNear(x, y));
  if (f[2] < 2 || nearestCabin(x, y).d < 220 || inVill(x, y)) return;
  const sp = pickSpecies(x, y), g = SPEC[sp].grp, n = g[0] + ((Math.random() * (g[1] - g[0] + 1)) | 0);
  for (let i = 0; i < n; i++) { const a = spawnAnimal(sp, x + rnd(-30, 30), y + rnd(-20, 20)); a.grp = ang; }
}
function startFlee(a, fx, fy, dur) {
  if (a.state === 'dead') return;
  const bird = SPEC[a.sp].bird;
  a.state = 'flee'; a.t = bird ? rnd(3, 5) : dur || rnd(5, 9); a.fx = fx; a.fy = fy; if (bird) a.fz = rnd(16, 32);
  const d = hyp(a.x - fx, a.y - fy) || 1; a.head = Math.atan2((a.y - fy) / d, (a.x - fx) / d) + rnd(-0.4, 0.4);
  if (a.sp === 'rev' && Math.random() < 0.5) sfx.bark();
  for (const b of G.animals) if (b !== a && b.sp === a.sp && b.state !== 'dead' && b.state !== 'flee' && hyp(b.x - a.x, b.y - a.y) < 140) { b.state = 'flee'; b.t = a.t + rnd(-1, 1); b.fx = fx; b.fy = fy; b.head = a.head + rnd(-0.3, 0.3); b.aware = 1.2; if (bird) b.fz = rnd(16, 32); }
}
function wander(a) {
  const A = SPEC[a.sp], d = rnd(50, a.sp === 'rev' ? 260 : 180) * (A.bird ? 0.3 : 1), an = a.head + rnd(-1.4, 1.4);
  a.tx = a.x + Math.cos(an) * d; a.ty = a.y + Math.sin(an) * d * 0.8; a.state = 'walk'; a.head = an;
}
function killAnimal(a) {
  a.state = 'dead'; a.bleed = 0; a.deadT = 0;
  if (!(a.z > 0)) a.vx = a.vy = 0; // fugl skutt i lufta faller videre i farta
  tell(a.by, SPEC[a.sp].name + (a.sex === 'm' ? ' (' + SPEC[a.sp].sexn.m + ')' : ' (' + SPEC[a.sp].sexn.f + ')') + ' ligger. Gå bort og trykk F.', 'good', 'thud');
}
function animalUpdate(a, dt) {
  const A = SPEC[a.sp];
  if (a.state === 'dead') {
    const h0 = deadH(a); a.deadT += dt;
    const h = deadH(a), what = 'Dyret du felte (' + A.name.toLowerCase() + ')';
    if (h0 < ROT_H - 1 && h >= ROT_H - 1) tell(a.by, what + ' råtner om en time. Ta vare på det snart, ellers blir det bot.', 'warn');
    if (h0 < ROT_H && h >= ROT_H) fineTo(a.by, rotFine(a), what + ' har råtnet. Kjøttet kan ikke selges, og du får bot for å la vilt ligge.', true);
    if (a.z > 0) { const k = Math.exp(-dt * 1.5); a.vz = (a.vz || 0) + 100 * dt; a.z = Math.max(0, a.z - a.vz * dt); a.x += a.vx * dt; a.y += a.vy * dt; a.vx *= k; a.vy *= k; if (!a.z) a.vx = a.vy = 0; }
    return;
  }
  if (a.bleed > 0) {
    a.hp -= a.bleed * dt; a.bloodT -= dt;
    if (a.bloodT <= 0) { G.blood.push({ x: a.x + rnd(-2, 2), y: a.y + rnd(-1.5, 1.5), t: 0 }); if (G.blood.length > 500) G.blood.shift(); a.bloodT = a.state === 'flee' ? 0.22 : 1.1; }
    if (a.hp <= 0) { killAnimal(a); return; }
  }
  // i åpent lende ser dyra langt, i tett skog kort: det avgjøres av skogen der dyret og jegeren står (a.cov friskes
  // opp to ganger i sekundet, h.cov hvert bilde i update)
  if ((a.covT = (a.covT || 0) - dt) <= 0) { a.covT = 0.5; a.cov = fields(a.x, a.y, cabinsNear(a.x, a.y))[0]; }
  let gain = 0, th = P, nd = 1e9;
  for (const h of G.hunters) {
    const dx = h.x - a.x, dy = h.y - a.y, d = hyp(dx, dy);
    if (d < nd) { nd = d; th = h; }
    const vis = (h.moving ? (h.sneak ? 0.55 : 1) : 0.42) * (h.camo ?? 1) * lerp(0.5, 1, G.dayl) * (a.state === 'toScent' || a.nearScent ? 0.7 : 1);
    const sr = A.sight * vis * lerp(SIGHT_OPEN, SIGHT_WOOD, smooth(0.25, 0.6, (a.cov + (h.cov ?? 0.5)) / 2));
    if (d < sr) gain += ((1 - d / sr) * 2.3 + 0.12) * dt;
    if (d > 1) {
      const dot = (-dx * G.wind.x - dy * G.wind.y) / d, sm = A.smell * ST.deo[h.deo] * (0.55 + 0.6 * G.wind.s);
      if (dot > 0.82 && d < sm) { gain += (3 * (1 - d / sm) + 0.5) * dt; a.smelled = h; }
    }
  }
  const dx = th.x - a.x;
  a.aware = clamp(gain > 0 ? a.aware + gain : a.aware - 0.11 * dt, 0, 1.6);
  if (a.state !== 'flee' && a.aware >= 1) { startFlee(a, th.x, th.y); if (a.smelled) tell(a.smelled.id, SPEC[a.sp].name + ' fikk teven av deg i vinden.', 'warn'); a.smelled = null; }
  else if (a.aware > 0.35 && a.state !== 'flee' && a.state !== 'alert') { a.prev = a.state; a.state = 'alert'; a.t = rnd(2.5, 5); }
  // står hunden for dyret, blir det stående og se på hunden i stedet for å trekke videre; jegeren kan fortsatt skremme det
  if (a.bay > 0) { a.bay -= dt; if (a.state !== 'flee' && a.state !== 'alert') { a.state = 'stand'; a.t = 1; a.face = a.bayX > a.x ? 1 : -1; } }
  let spd = 0;
  switch (a.state) {
    case 'graze': case 'stand':
      a.t -= dt; if (a.t <= 0) { if (Math.random() < 0.55) wander(a); else { a.state = Math.random() < 0.7 ? 'graze' : 'stand'; a.t = rnd(4, 12); } }
      break;
    case 'walk': case 'approach': case 'toScent': {
      const ex = a.tx - a.x, ey = a.ty - a.y, ed = hyp(ex, ey);
      spd = A.walk * (a.state === 'approach' ? 1.7 : 1);
      if (ed < 4) {
        if (a.state === 'approach') { a.state = 'stand'; a.t = rnd(7, 13); a.face = dx > 0 ? 1 : -1; }
        else if (a.state === 'toScent') { a.state = 'graze'; a.t = rnd(12, 22); }
        else { a.state = Math.random() < 0.65 ? 'graze' : 'stand'; a.t = rnd(4, 12); }
        spd = 0;
      } else a.head = Math.atan2(ey, ex);
      break;
    }
    case 'alert':
      a.face = dx > 0 ? 1 : -1; a.t -= dt;
      if (a.t <= 0 && a.aware < 0.5) { a.state = a.prev === 'approach' || a.prev === 'toScent' ? a.prev : 'graze'; a.t = rnd(3, 8); }
      break;
    case 'flee':
      if (A.bird) {
        // fuglen letter, flyr unna og daler ned et stykke borte; er det vann under, flyr den videre
        a.t -= dt;
        a.z = a.t > 1.2 ? Math.min(a.fz || 24, a.z + dt * 36) : Math.max(0, a.z - dt * 16);
        spd = a.z > 0.5 ? A.fly * (a.bleed > 0 ? 0.75 : 1) : A.run;
        a.head += Math.sin(G.t * 1.7 + a.id * 9) * 0.3 * dt;
        if (a.t <= 0 && a.z <= 0) { if (isWater(a.x, a.y)) a.t = 1.6; else { a.aware = 0.5; a.prev = 'graze'; a.state = 'alert'; a.t = rnd(3, 6); } }
        break;
      }
      spd = A.run * (a.bleed > 0 ? 0.8 : 1) * (a.t < 1.2 ? 0.6 : 1);
      a.head += Math.sin(G.t * 2 + a.id * 9) * 0.6 * dt;
      a.t -= dt; if (a.t <= 0) { a.aware = 0.3; wander(a); }
      break;
  }
  if (spd > 0) {
    a.waterT -= dt;
    if (a.waterT <= 0 && !(a.z > 0)) {
      a.waterT = 0.3;
      const lx = a.x + Math.cos(a.head) * 16, ly = a.y + Math.sin(a.head) * 16;
      if (isWater(lx, ly) || !inWorld(lx, ly)) { a.head += (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random()); if (a.state === 'walk' || a.state === 'toScent' || a.state === 'approach') { a.state = 'stand'; a.t = rnd(1, 3); spd = 0; } }
    }
    // også dyra går tyngre i motbakke, men de er sprekere enn deg
    if (!(a.z > 0)) spd *= gradeK(gradeAt(a.x, a.y, Math.cos(a.head), Math.sin(a.head)) * 0.7);
    a.vx = Math.cos(a.head) * spd; a.vy = Math.sin(a.head) * spd * 0.8;
  } else { a.vx *= 0.8; a.vy *= 0.8; }
  const c = a.z > 2 ? { x: a.x + a.vx * dt, y: a.y + a.vy * dt } : collide(a.x + a.vx * dt, a.y + a.vy * dt, 2);
  a.x = clamp(c.x, -WORLD, WORLD); a.y = clamp(c.y, -WORLD, WORLD);
  if (Math.abs(a.vx) > 2) a.face = a.vx > 0 ? 1 : -1;
  a.anim += hyp(a.vx, a.vy) * dt * (a.state === 'flee' ? 0.085 : 0.14);
}
function animalSprite(a) {
  const o = ANI[a.sp][a.sex];
  switch (a.state) {
    case 'dead': return o.dead[0];
    case 'flee': return a.z > 0.5 && o.fly ? o.fly[a.t > 1.2 ? (a.anim | 0) & 3 : 1] : o.run[(a.anim | 0) & 3];
    case 'alert': return o.alert[0];
    case 'graze': return o.graze[((G.t * 0.7 + a.id * 5) | 0) & 1];
    case 'stand': return o.stand[0];
    default: return hyp(a.vx, a.vy) > 1 ? o.walk[(a.anim | 0) & 3] : o.stand[0];
  }
}
function hitTest(a, tx, ty) {
  const s = animalSprite(a), rx = Math.round(a.x), ry = Math.round(a.y - (a.z || 0));
  const lx = a.face > 0 ? Math.floor(tx - rx) + s.ax : s.ax - 1 - Math.floor(tx - rx), ly = Math.floor(ty - ry) + s.ay;
  return hitZone(a, s, lx, ly);
}
// Hvilken del av dyret pikselen (lx, ly) i spriten s er, eller null utenfor dyret
function hitZone(a, s, lx, ly) {
  if (!s.pix.get(lx, ly)) return null;
  const A = SPEC[a.sp], u = lx - s.ax, v = ly - s.ay;
  if (s.hc && hyp(u - s.hc.x, v - s.hc.y) < s.hc.r) return 'head';
  if (A.bird) return v > s.legY ? 'leg' : 'torso';
  const byl = a.state === 'dead' ? -A.Hh * 0.42 : -A.leg - A.Hh / 2 + (s.bob || 0);
  if (v > byl + A.Hh / 2 + 1) return 'leg';
  if (u > A.L / 2 - A.chestR * 2 && u < A.L / 2 && Math.abs(v - byl) < A.Hh * 0.38) return 'vital';
  if (u < -A.L / 4) return 'rear';
  return 'body';
}

// ---------- jeger-handlinger ----------
// Uro i siktet fra pusten; i tillegg gir store sving med børsa kraftige rykk, og kulde store, ujevne sveip.
// Holder du pusten, roer rykkene seg fortere, men kulda blir værende
function aimSway() {
  const hg = hagle(), s = hg ? HST.sway : bue() ? BST.sway[lv('bue')] : ST.sway[lv('stock')], t = G.t, n = (u, row) => (vnoise(t * u, row, 71) - 0.5) * 2;
  const c = P.cold * (5 + 1.2 * s) * (hg ? 0.6 : 1), m = P.unrest * (7 + 2.5 * s) * (hg ? 0.3 : 1);
  return [P.sway[0] + (n(0.8, 0) + n(1.9, 4) * 0.35) * c + (n(3.1, 16) + n(7.3, 20) * 0.5) * m,
    P.sway[1] + (n(0.8, 8) + n(1.9, 12) * 0.35) * c * 0.8 + (n(3.1, 24) + n(7.3, 28) * 0.5) * m * 0.8];
}
function muzzle(x, y, ang) {
  for (let i = 0; i < 6; i++) G.parts.push({ x: x + Math.cos(ang) * 10, y: y + 0.5, z: 9, vx: Math.cos(ang) * rnd(10, 40) + rnd(-8, 8), vy: Math.sin(ang) * rnd(10, 40), vz: rnd(-4, 8), life: rnd(0.05, 0.14), col: i < 2 ? '#fff6c8' : '#ffb84a' });
  for (let i = 0; i < 5; i++) G.parts.push({ x: x + Math.cos(ang) * 10, y: y + 0.5, z: 9, vx: Math.cos(ang) * rnd(4, 12), vy: Math.sin(ang) * rnd(4, 12), vz: rnd(2, 6), life: rnd(0.6, 1.4), col: '#c8c8bc', smoke: 1 });
}
function shoot() {
  if (!G.started || G.paused || onHorse()) return;
  if (!G.gun) return noGun();
  if (P.reload > 0 || P.cycle > 0) return;
  const g = G.gun, hg = g === 'hagle', bw = g === 'bue';
  if (P.mag[g] <= 0) { sfx.deny(); msg(!G[ammoKey()] ? ammoOut() : hg ? 'Hagla er tom. Trykk R for å lade.' : bw ? 'Ingen pil på strengen. Trykk R for å legge på en.' : 'Magasinet er tomt. Trykk R for å lade.'); return; }
  P.mag[g]--; P.cycle = (hg ? HST.cycle[lv('hagle')] : bw ? 0.3 : ST.cycle[lv('bolt')]) * cloMul('slow');
  const supp = hg || bw ? 0 : lv('supp');
  if (bw) sfx.bow(); else { sfx.shot(supp); if (!hg) setTimeout(() => { if (P.mag.rifle > 0) sfx.bolt(); }, 380); }
  // i siktet (3D) går skuddet etter trådkorset/perla/siktepinnen, ellers fra hofta mot musepekeren på kartet
  const r = P.aim ? (hg ? aimShotgun() : bw ? aimArrow() : aimShot()) : hipShot(hg);
  if (!bw) muzzle(P.x, P.y, r.ang);
  let hits = r.hits;
  if (!hg) {
    // kula og pila mister kraft forbi holdet sitt
    const rng_ = bw ? BST.range[lv('bue')] : ST.range[lv('barrel')], cal = bw ? BST.dmg[lv('bue')] : ST.dmg[lv('caliber')];
    hits = r.a ? [{ a: r.a, zone: r.zone, d: r.d, hx: r.hx, hy: r.hy, cal, dmg: cal * ZONES[r.zone][1] * clamp(1 - (r.d - rng_) / rng_, bw ? 0.25 : 0.35, 1) }] : [];
  }
  const sh = { x: P.x, y: P.y, ang: r.ang, supp, bow: bw ? 1 : 0, hits: hits.map(h => ({ id: h.a.id, zone: h.zone, dmg: h.dmg, d: h.d, cal: h.cal })) };
  if (hits.length) { Object.assign(sh, { hx: hits[0].hx, hy: hits[0].hy, bl: [hits[0].a.x, hits[0].a.y] }); for (const h of hits) G.blood.push({ x: h.a.x, y: h.a.y, t: 0 }); }
  netSend({ t: 'shot', ...sh });
  if (isAuth()) applyShot(sh, NET.id);
  if (!P.aim) fine(FINE.hip, 'Vådeskudd – du skjøt uten å sikte.');
  else if (hg && hits.some(h => !SPEC[h.a.sp].small)) fine(FINE.big, 'Hagle er ikke lov på storvilt.');
  else if (!hits.length) { if (hg) msg('Bom.', 'warn'); else if (bw) msg('Bom. Pila er borte i skogen.', 'warn'); else fine(FINE.miss, 'Bom.'); }
}
// Skade fra ett hagl: full kraft ut til patronens hold, så avtar den til null på dobbelt hold
function pelletDmg(d) { const r = HST.prange[lv('shell')]; return HST.pdmg[lv('shell')] * clamp(2 - d / r, 0, 1); }
// Samler haglene som traff hvert dyr til ett treff med summert skade
function pelletHit(by, a, d, hx, hy) {
  let e = by.get(a); if (!e) by.set(a, e = { a, zone: 'shot', dmg: 0, d, hx, hy });
  e.dmg += pelletDmg(d);
}
// Trekker boten fra kassa, men aldri under null
function fine(kr, text) {
  const k = Math.min(kr, G.money); G.money -= k;
  msg(text + (k ? ' −' + k + ' kr' : ''), 'warn'); save();
  return k;
}
// Vilt som har råtnet, kommer også opp som en beskjed du må lukke, med boten (k kr) og regelen
function rotNotice(text, k) {
  notice('Viltet har råtnet', text + (k ? ' Boten er ' + fmtKr(k) + '.' : ''), `Et felt dyr holder seg ${ROT_H} timer i spillet (${ROT_H / 2} minutter). Ta vare på det med F. En hest fra stallen bærer det sekken ikke rommer.`);
}
function hipShot(hg) {
  let tx = MOUSE.wx, ty = MOUSE.wy;
  const d = hyp(tx - P.x, ty - (P.y - 8));
  if (hg) {
    // haglsverm fra hofta: hvert hagl testes for seg, trestammer stopper dem
    const sd = HST.spread[lv('choke')] * d, by = new Map(), list = G.animals.filter(a => a.state !== 'dead').sort((a, b) => b.y - a.y);
    for (let i = 0; i < HST.pellets[lv('shell')]; i++) {
      const x = tx + gauss() * sd, y = ty + gauss() * sd * 0.8;
      if (trunkBlock(P.x, P.y, x, y)) continue;
      const a = list.find(a => hitTest(a, x, y));
      if (a) pelletHit(by, a, hyp(a.x - P.x, a.y - P.y), x, y);
      else if (i < 8) G.parts.push({ x, y, z: 0, vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(4, 12), life: rnd(0.2, 0.5), col: isWater(x, y) ? '#a4ccc6' : '#8a7a5c', grav: 1 });
    }
    return { ang: Math.atan2(ty - P.y + 8, tx - P.x), hits: [...by.values()].filter(e => e.dmg > 0) };
  }
  const sd = (bue() ? BST.spread[lv('bue')] * 1.5 : ST.spread[lv('barrel')]) * d / 100 * 4;
  tx += gauss() * sd; ty += gauss() * sd * 0.8;
  const r = { ang: Math.atan2(ty - P.y + 8, tx - P.x), a: null, zone: null, block: null, d, hx: tx, hy: ty };
  const tr = trunkBlock(P.x, P.y, tx, ty);
  if (tr) {
    r.block = tr.k;
    for (let i = 0; i < 6; i++) G.parts.push({ x: tr.x + rnd(-1, 1), y: tr.y + 0.5, z: rnd(6, 14), vx: rnd(-20, 20), vy: rnd(-6, 6), vz: rnd(5, 20), life: rnd(0.3, 0.7), col: '#c8a474', grav: 1 });
    msg((bue() ? 'Pila' : 'Kula') + ' traff en trestamme.', 'warn');
    return r;
  }
  const list = G.animals.filter(a => a.state !== 'dead').sort((a, b) => b.y - a.y);
  for (const a of list) { const z = hitTest(a, tx, ty); if (z) { r.a = a; r.zone = z; break; } }
  if (r.a) for (let i = 0; i < 4; i++) G.parts.push({ x: tx, y: ty + 2, z: 0, vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(4, 10), life: rnd(0.2, 0.4), col: '#a8302a', grav: 1 });
  else for (let i = 0; i < 5; i++) G.parts.push({ x: tx, y: ty, z: 0, vx: rnd(-14, 14), vy: rnd(-4, 4), vz: rnd(8, 22), life: rnd(0.3, 0.6), col: isWater(tx, ty) ? '#a4ccc6' : '#8a7a5c', grav: 1 });
  return r;
}
// Verten avgjør hva skuddet gjør med dyra, uansett hvem som skjøt. Et haglskudd kan treffe flere dyr
function applyShot(sh, pid) {
  const hits = [];
  for (const h of Array.isArray(sh.hits) ? sh.hits : []) {
    const a = ZONES[h.zone] ? G.animals.find(a => a.id === h.id && a.state !== 'dead') : null;
    if (a && !hits.some(x => x[0] === a)) hits.push([a, h]);
  }
  // smellet bærer langt: nær skuddet flykter alt, lenger ut blir dyra urolige og flykter sjeldnere jo lenger unna de står.
  // Bare nærområdet holdes tomt for nye dyr etterpå, så skudd fra en annen jeger ikke tømmer skogen rundt deg
  const R = sh.bow ? BST.noise : ST.noise[clamp(sh.supp | 0, 0, 3)];
  for (const a of G.animals) {
    if (a.state === 'dead' || hits.some(x => x[0] === a)) continue;
    const k = hyp(a.x - sh.x, a.y - sh.y) / R;
    if (k >= 1) continue;
    if (k < 0.35 || Math.random() < ((1 - k) / 0.65) ** 2) { a.aware = 1.5; startFlee(a, sh.x, sh.y); }
    else a.aware = Math.max(a.aware, 0.6);
  }
  G.quiet.push({ x: sh.x, y: sh.y, r: R * 0.5, t: 90 });
  for (const [a, h] of hits) hitAnimal(a, h, sh, pid);
}
function hitAnimal(hitA, h, sh, pid) {
  const A = SPEC[hitA.sp], zone = h.zone, Z = ZONES[zone], dmg = +h.dmg || 0;
  hitA.hp -= dmg; hitA.lastZone = zone; hitA.shotDist = +h.d || 0; hitA.by = pid; hitA.bow = !!sh.bow;
  if (hitA.hp <= 0) {
    if (zone === 'vital' && !A.bird && Math.random() < 0.6) { const run = rnd(1.6, 3); hitA.hp = 1; hitA.bleed = 1 / run; startFlee(hitA, sh.x, sh.y, run + 1); tell(pid, Z[0] + '. Dyret tar et dødsløp. Følg blodsporet.', 'good'); }
    else killAnimal(hitA);
  } else {
    hitA.bleed = dmg * (zone === 'vital' ? 0.3 : zone === 'body' ? 0.08 : zone === 'shot' || zone === 'torso' ? 0.12 : 0.05);
    hitA.aware = 1.5; startFlee(hitA, sh.x, sh.y, rnd(7, 11));
    tell(pid, Z[0] + ' – ' + A.name.toLowerCase() + ' er skadet og ' + (A.bird ? 'flyr' : 'flykter') + '. Følg blodsporet.' + (h.cal && h.cal < A.hp * 0.7 ? ' Kaliberet er lite for denne arten.' : ''), 'warn');
  }
}
// R lader så mange patroner fra sekken som får plass; er sekken tom, må du kjøpe flere i bua
const ammoOut = () => 'Tom for ' + { rounds: 'riflepatroner', shells: 'haglpatroner', arrows: 'piler' }[ammoKey()] + '. Kjøp flere i landsbyen.';
function startReload() {
  if (!G.gun) return noGun();
  if (P.reload > 0 || inGun() >= gunCap()) return;
  if (!G[ammoKey()]) { sfx.deny(); msg(ammoOut(), 'warn'); return; }
  P.reload = (hagle() ? HST.reload[lv('hagle')] : bue() ? BST.reload[lv('bue')] : ST.reload[lv('bolt')]) * cloMul('slow'); sfx.reload();
}
function doCall() {
  if (!G.started || P.callCd > 0) return;
  const L = lv('call'); sfx.call(L); P.callCd = 9;
  const c = { x: P.x, y: P.y, L };
  netSend({ t: 'call', ...c });
  if (isAuth()) applyCall(c, NET.id);
}
function applyCall(c, pid) {
  const L = clamp(c.L | 0, 0, 3), R = ST.callR[L], spp = CALLSP[L]; let n = 0;
  for (const a of G.animals) {
    if (a.state === 'dead' || a.state === 'flee' || a.aware > 0.6 || !spp.includes(a.sp)) continue;
    const d = hyp(a.x - c.x, a.y - c.y); if (d > R || Math.random() > 0.8) continue;
    const stop = rnd(80, 140), ux = (a.x - c.x) / d, uy = (a.y - c.y) / d;
    a.state = 'approach'; a.tx = c.x + ux * stop + rnd(-25, 25); a.ty = c.y + uy * stop + rnd(-20, 20); n++;
  }
  if (n) tell(pid, n === 1 ? 'Noe svarer i det fjerne. Hold deg i ro.' : n + ' dyr har hørt deg. Hold deg i ro.', 'good', 'answer');
  else tell(pid, 'Lyden bærer gjennom skogen. Ingen svarer ennå.');
}
function placeScent() {
  if (!G.started) return;
  if (G.scents <= 0) { sfx.deny(); msg('Tom for luktstoff. Kjøp mer i landsbyen.'); return; }
  G.scents--; sfx.scent();
  const L = lv('scentLv'), s = { x: P.x + 4, y: P.y + 2, r: ST.scentR[L], dur: ST.scentT[L] };
  if (isAuth()) addScent(s); else netSend({ t: 'scent', to: NET.host, ...s });
  msg('Luktstoffet er satt ut. Vinden tar det med seg.');
  save();
}
function addScent(s) { G.scentObjs.push({ id: Math.random(), x: +s.x, y: +s.y, r: +s.r, t: +s.dur, pt: 0 }); }
function nearestDead() {
  let best = null, bd = 24;
  for (const a of G.animals) if (a.state === 'dead' && canTake(a, NET.id)) { const d = hyp(a.x - P.x, a.y - P.y); if (d < bd) { bd = d; best = a; } }
  return best;
}
// Et felt dyr holder seg ROT_H timer (30 s per time, deadT teller sekunder) før det råtner. Da kan kjøttet verken tas
// vare på eller selges, og etter ROT_GONE timer til er dyret borte. Den som skjøt, får beskjed en time før og når det skjer
const ROT_H = 8, ROT_GONE = 4;
const deadH = a => (a.deadT || 0) / 30;
const rotten = a => a.state === 'dead' && deadH(a) >= ROT_H;
// boten for et dyr som råtner: det kjøttet som ligger igjen, var verdt, og minst FINE.rot hvis ingenting er tatt vare på
function rotFine(a) {
  const left = a.left ?? carcassKg(a), kr = Math.round(carcassKr(a) * left / carcassKg(a) / 5) * 5;
  return Math.max(a.left === undefined ? FINE.rot : 0, kr);
}
// Kjøttet et dyr gir, og hva alt sammen er verdt i bua: art, vekt, hvor det er truffet og kjønn
const carcassKg = a => Math.max(0.1, kg1(a.kg * (SPEC[a.sp].bird ? MEAT_KB : MEAT_K) * (a.bow ? BOW_MEAT : 1)));
// Kniven: hvert trinn over speiderkniven gir 10 % mer kjøtt (og verdi) av det du skjærer ut. Dyret har like mye kjøtt for
// alle (carcassKg); det er jegeren som skjærer, som får mer ut av det med en bedre kniv
const knifeK = () => 1 + 0.1 * lv('knife');
function carcassKr(a) {
  const A = SPEC[a.sp], Z = ZONES[a.lastZone || 'body'], mean = (A.kg[a.sex][0] + A.kg[a.sex][1]) / 2;
  return Math.round(A.value * (a.kg / mean) * Z[2] * (a.sex === 'm' ? 1.25 : 1) * (a.bow ? BOW_MEAT : 1) / 5) * 5;
}
// Verten skjærer ut så mye kjøtt som får plass (cap kg). Resten (a.left) blir liggende på dyret til noen kommer tilbake
function cutMeat(a, cap) {
  if (rotten(a)) return { take: 0, first: false };
  const left = a.left ?? carcassKg(a), take = kg1(Math.min(left, Math.floor(cap * 10 + 1e-6) / 10)), first = a.left === undefined;
  if (take <= 0) return { take: 0, first: false };
  a.left = kg1(left - take);
  if (a.left <= 0 && G.animals.includes(a)) G.animals.splice(G.animals.indexOf(a), 1);
  return { take, first };
}
function collect(a) {
  if (rotten(a)) return;
  // kniven gir mer kjøtt av det du tar av dyret, så du tar så mye at det du får, akkurat får plass
  const free = meatFree() / knifeK();
  if (isAuth()) { const r = cutMeat(a, free); credit(a, r.take, r.first); return; }
  // som gjest avgjør verten; her forsvinner dyret straks hvis alt får plass. Et nytt F venter til svaret er kommet
  if (G.t < (P.collectT || 0)) return;
  P.collectT = G.t + 1.5; netSend({ t: 'collect', to: NET.host, id: a.id, cap: free });
  const left = a.left ?? carcassKg(a);
  if (free >= left) G.animals.splice(G.animals.indexOf(a), 1); else a.left = kg1(left - free);
}
// Kjøttet legges på hesten hvis den står like ved, og resten i sekken, ett parti per art med verdien det har i bua.
// Jaktboka får dyret første gang du skjærer av det. cut er det du tar av dyret, og kniven din gjør det til mer kjøtt
function credit(a, cut, first) {
  if (!(cut > 0)) return;
  const A = SPEC[a.sp], K = knifeK(), all = Math.round(carcassKr(a) * K), kg = kg1(cut * K), kr = Math.round(all * cut / carcassKg(a));
  const onHorse = kg1(Math.min(kg, rackFree())), inSack = kg1(kg - onHorse), horseKr = Math.round(kr * onHorse / kg);
  const add = (L, k, v) => { if (!(k > 0)) return; const l = L.find(l => l.sp === a.sp); if (l) { l.kg = kg1(l.kg + k); l.kr += v; } else L.push({ sp: a.sp, kg: k, kr: v }); };
  add(G.rack, onHorse, horseKr); add(G.meat, inSack, kr - horseKr);
  if (first) questKill(a);
  if (first) G.journal.unshift({ sp: a.sp, sex: a.sex, kg: a.kg, m: Math.round((a.shotDist || 0) * M_PER_PX), zone: a.lastZone || 'body', kr: all, day: G.day, h: G.hour });
  const where = onHorse > 0 ? inSack > 0 ? 'på hesten og i sekken' : 'på hesten' : 'i sekken';
  sfx.kneel(); msg((first ? A.name + ', ' + A.sexn[a.sex] + ', ' + fmtKg(a.kg) + ' · ' : '') + fmtKg(kg) + ' kjøtt ' + where + ', verdt ' + fmtKr(kr) + ' i landsbyen', 'good');
  if (a.left > 0) msg((horseNear() ? 'Sekken og hesten er fulle. ' : 'Sekken er full. ') + fmtKg(kg1(a.left * K)) + ' kjøtt ligger igjen på dyret. ' + (horseNear() ? 'Selg i landsbyen og kom tilbake.' : `Selg i landsbyen, eller ${horseHint()}.`), 'warn');
  save();
}
const sackFull = () => { sfx.deny(); msg('Sekken er full (' + fmtKg(sackKg()) + '). Selg kjøtt og ved i landsbyen, eller kjøp en større sekk.', 'warn'); };
const meatFull = () => { sfx.deny(); msg(horseNear() ? 'Sekken og hesten er fulle. Selg kjøttet i landsbyen.' : `Sekken er full. Selg i landsbyen, eller ${horseHint()}.`, 'warn'); };
// Flytter en stabel (et kjøttparti 'meat:art' eller en av CARGO) fra deg til hesten eller tilbake, så mye som får plass.
// Patronene som sitter i våpnene, blir der. Gir tomt svar når noe ble flyttet, ellers hvorfor ikke
function moveCargo(k, toHorse) {
  if (!horseNear()) return 'Hesten er for langt unna.';
  const room = toHorse ? Math.max(0, kg1(horseCap() - horseKg())) : sackFree(), full = toHorse ? 'Hesten er full.' : 'Sekken er full.';
  if (k.startsWith('meat:')) {
    const sp = k.slice(5), [from, to] = toHorse ? [G.meat, G.rack] : [G.rack, G.meat], l = from.find(l => l.sp === sp);
    if (!l) return 'Ingenting å flytte.';
    const kg = kg1(Math.min(l.kg, room)); if (kg <= 0) return full;
    const kr = kg >= l.kg ? l.kr : Math.round(l.kr * kg / l.kg), t = to.find(t => t.sp === sp);
    l.kg = kg1(l.kg - kg); l.kr -= kr; if (l.kg <= 0) from.splice(from.indexOf(l), 1);
    if (t) { t.kg = kg1(t.kg + kg); t.kr += kr; } else to.push({ sp, kg, kr });
  } else {
    const [from, to] = toHorse ? [G, G.cargo] : [G.cargo, G];
    if (!(from[k] > 0)) return k === 'rounds' || k === 'shells' ? 'Patronene i våpenet blir der.' : 'Ingenting å flytte.';
    const n = k === 'wood' ? Math.min(from[k], Math.floor(room / WOOD_KG + 1e-6)) : from[k];
    if (n <= 0) return full;
    from[k] -= n; to[k] += n;
  }
  save(); return '';
}
// Hva F gjør der du står: [tekst til hjelpelinja, handling]
function action() {
  if (HORSE.on) return ['Gå av hesten', horseDismount];
  const a = nearestDead();
  if (a) {
    const A = SPEC[a.sp], rest = ROT_H - deadH(a);
    // råttent kjøtt kan ikke tas vare på; de siste tre timene står det hvor lenge det holder seg
    if (rest <= 0) return [A.name + ' · har råtnet, kjøttet kan ikke selges', () => { sfx.deny(); msg('Dyret har ligget for lenge og har råtnet. Kjøttet kan ikke selges.', 'warn'); }];
    if (meatFree() / knifeK() < 0.1) return [horseNear() ? 'Sekken og hesten er fulle · selg i landsbyen' : 'Sekken er full · selg i landsbyen', meatFull];
    return [(a.left === undefined ? 'Ta vare på ' + A.name.toLowerCase() + ' (' + A.sexn[a.sex] + ')' : 'Skjær ut mer kjøtt (' + A.name.toLowerCase() + ', ' + fmtKg(kg1(a.left * knifeK())) + ' igjen)')
      + (rest <= 3 ? rest < 1 ? ' · råtner snart' : ' · råtner om ' + Math.ceil(rest) + ' t' : '') + (rackFree() > 0 ? ' · lastes på hesten' : ''), () => collect(a)];
  }
  const c = cabinsNear(P.x, P.y).find(c => hyp(P.x - c.door[0], P.y - c.door[1]) < 18);
  if (c) return [doorText(c), () => openShop(c)];
  if (lv('horse') && hyp(HORSE.x - P.x, HORSE.y - P.y) < 18) return lv('saddle') ? ['Ri hesten', horseMount] : ['Hesten mangler sal', () => { sfx.deny(); msg('Du trenger sal for å ri. Stallen i landsbyen selger en. Hesten bærer likevel for deg her (E).'); }];
  // i åpningen av gapahuken sover du; ellers ved bålet steker du
  const h = nearHut(P.x, P.y, 18);
  if (h) return nearFire(h.x, h.y, 60) ? ['Sov i gapahuken', sleepHut] : ['Tenn bål foran gapahuken for å sove her', () => msg('Du trenger et bål foran gapahuken for å holde varmen i natt. Tenn et fra hjulet (hold Q).')];
  if (G.meat.length && P.hp < 99.5 && nearFire(P.x, P.y, 30)) return ['Stek kjøtt over bålet og spis', cook];
  const t = lv('axe') && nearTree(); if (t) return ['Hogg ned ' + TREE_N[t.k], () => chop(t)];
  return null;
}
function interact() {
  if (!G.started || G.paused || P.work) return;
  const ac = action(); if (ac) ac[1]();
}

// ---------- oppdrag fra grunneieren ----------
// Tre nye tilbud hver dag (de samme for alle den dagen), og ett oppdrag om gangen. 'meat': lever kg kilo kjøtt av arten
// til garden, betalt QUEST_K ganger det viltmottaket gir. 'cull': fell ett dyr av arten i et navngitt område (area er
// plassen i REGIONS) og ta vare på det; kjøttet beholder du, og premien henter du på garden
const QUEST_K = 1.6, QUEST_MEAT = ['radyr', 'hjort', 'elg', 'rein', 'villsvin', 'hare', 'storfugl', 'orrfugl', 'rype'], QUEST_CULL = ['rev', 'grevling', 'villsvin', 'ulv', 'bjorn', 'gaupe'];
function questOffers() {
  const r = rng(SEED + G.day * 7919), L = [];
  for (let i = 0; i < 3; i++) {
    if (i < 2) {
      const sp = QUEST_MEAT[(r() * QUEST_MEAT.length) | 0], A = SPEC[sp], mean = (A.kg.m[0] + A.kg.m[1] + A.kg.f[0] + A.kg.f[1]) / 4, one = mean * (A.bird ? MEAT_KB : MEAT_K);
      const kg = Math.max(1, Math.round(one * lerp(0.6, 1.3, r()) * (A.small ? 3 : 1)));
      L.push({ kind: 'meat', sp, kg, kr: Math.round(A.value / one * kg * QUEST_K / 10) * 10 });
    } else {
      // et område et godt stykke fra landsbyen, og en art som finnes i det klimaet
      const R = REGIONS.filter(g => g.mk && hyp(g.x, g.y) < 7500), g = R[(r() * R.length) | 0]; if (!g) continue;
      const cold = climate(g.x, g.y) > 0.3;
      const S = QUEST_CULL.filter(s => !cold || s !== 'villsvin' && s !== 'grevling'), sp = S[(r() * S.length) | 0];
      L.push({ kind: 'cull', sp, area: g.idx, got: 0, kr: Math.round((SPEC[sp].value * 1.2 + hyp(g.x, g.y) * 0.08) / 10) * 10 });
    }
  }
  return L;
}
const questArea = q => REGIONS[q.area];
function questText(q) {
  const n = SPEC[q.sp].name.toLowerCase();
  return q.kind === 'meat' ? `Lever ${fmtKg(q.kg)} kjøtt av ${n} på garden.` : `Fell en ${n} ${questArea(q).at} og ta vare på den. Du beholder kjøttet.`;
}
// kjøttet av arten du har med deg: i sekken, og på hesten når den står like ved
const questLots = q => [...G.meat, ...(horseNear(HORSE_SHOP) ? G.rack : [])].filter(l => l.sp === q.sp);
const questReady = q => !!q && (q.kind === 'cull' ? q.got > 0 : kg1(questLots(q).reduce((s, l) => s + l.kg, 0)) >= q.kg);
// Et dyr du har tatt vare på, teller hvis det er arten oppdraget gjelder og det ligger i området
function questKill(a) {
  const q = G.quest; if (!q || q.kind !== 'cull' || q.got || a.sp !== q.sp || (regionAt(a.x, a.y) || {}).idx !== q.area) return;
  q.got = 1; msg('Oppdraget er utført. Hent premien hos grunneieren i landsbyen.', 'good');
}
// Leverer oppdraget: kjøttet tas fra sekken først, så fra hesten, og premien kommer i kassa
function questDeliver() {
  const q = G.quest; if (!questReady(q)) return;
  if (q.kind === 'meat') {
    let need = q.kg;
    for (const L of [G.meat, G.rack]) for (const l of L.filter(l => l.sp === q.sp)) {
      const t = Math.min(l.kg, need); if (t <= 0 || L === G.rack && !horseNear(HORSE_SHOP)) continue;
      l.kr -= Math.round(l.kr * t / l.kg); l.kg = kg1(l.kg - t); need = kg1(need - t);
      if (l.kg <= 0) L.splice(L.indexOf(l), 1);
    }
  }
  G.money += q.kr; G.quest = null; sfx.coin(); msg('Grunneieren takker for hjelpa. +' + fmtKr(q.kr), 'good'); save();
}
// Hva som står ved døra til hvert slags hus
function doorText(c) {
  const q = G.quest;
  switch (c.kind) {
    case 'gun': return 'Gå inn til børsemakeren';
    case 'smith': return 'Gå inn i smia';
    case 'stable': return 'Gå inn i stallen';
    case 'pub': return 'Gå inn på puben';
    case 'game': return G.meat.length ? 'Lever kjøttet på viltmottaket' : 'Gå inn på viltmottaket';
    case 'farm': return questReady(q) ? 'Lever oppdraget til grunneieren' : q ? 'Snakk med grunneieren' : 'Spør grunneieren om oppdrag';
    case 'post': return 'Gå inn i ' + c.name;
    case 'koie': return 'Gå inn i koia';
  }
  return 'Gå inn i bua';
}

// ---------- jakthunden ----------
// Hunden går ved foten. Sendt ut (fra hjulet) søker den opp nærmeste dyr og står for det: dyret blir stående, og hunden
// gjør los til du kommer. Hver gang den står for et dyr, går det med en godbit; finner den ingenting, beholder du den.
const DOG_R = 1000, DOG_ST = ['heel', 'search', 'mark', 'back'], DOG_SIDE = 13;
const D = { x: 0, y: 0, st: 'heel', face: 1, hd: 0, anim: 0, spd: 0, a: null, tx: 0, ty: 0, t: 0, ph: 0, barkT: 0, waterT: 0, wet: false, netT: 0,
  path: null, plan: null, wi: 0, planT: 0, pst: '', reach: false, swim: false, blk: false, stuck: 0, skip: [], pa: null };
const dogOk = a => !!a && a.state !== 'dead' && a.state !== 'flee' && !(a.z > 0) && G.animals.includes(a);
function dogFind(x, y, r) {
  let best = null, bd = r;
  for (const a of G.animals) if (dogOk(a) && !D.skip.includes(a)) { const d = hyp(a.x - x, a.y - y); if (d < bd) { bd = d; best = a; } }
  return best;
}
function dogReset() { Object.assign(D, { x: P.x - 14, y: P.y + 4, st: 'heel', a: null, spd: 0 }); }
function holdAnimal(a, x) { a.bay = 1.2; a.bayX = x; }
function sendDog() {
  if (!G.started || G.paused) return;
  // er hunden ute, kaller H den inn; den sendes ikke ut igjen før den er tilbake ved foten
  if (D.st !== 'heel') { sfx.whistle(); msg(D.st === 'back' ? 'Hunden er på vei inn.' : 'Du kaller inn hunden.'); D.st = 'back'; D.a = null; return; }
  if (G.treats <= 0) { sfx.deny(); msg('Tom for godbiter. Kjøp flere i landsbyen.'); return; }
  // finnes det ikke dyr innen rekkevidde, slår hunden ut mot pekeren og ser etter dyr der
  const an = Math.atan2(MOUSE.wy - P.y, MOUSE.wx - P.x);
  D.skip = []; D.st = 'search'; D.a = dogFind(P.x, P.y, DOG_R); D.t = 25; D.tx = P.x + Math.cos(an) * 360; D.ty = P.y + Math.sin(an) * 300;
  sfx.whistle(); msg('Hunden går ut og søker.');
}
function dogBack(text) { D.st = 'back'; D.a = null; if (text) msg(text, 'warn'); }
// Ute på søk og på vei inn går hunden aldri uti vannet: den finner vei rundt, og over elver bare på bruene.
// Veien søkes (A*) i et rutenett der hver rute er vann (0), land (1) eller brua som ligger over den.
const DG = 12, _dw = new Map(), dkey = (i, j) => (i + 2048) * 4096 + j + 2048;
function dogCell(i, j) {
  const k = dkey(i, j); let v = _dw.get(k);
  if (v !== undefined) return v;
  const x = (i + 0.5) * DG, y = (j + 0.5) * DG, cabs = cabinsNear(x, y), w = (dx, dy) => fields(x + dx, y + dy, cabs)[2];
  const w0 = inWorld(x, y) ? w(0, 0) : 0, R = BR_MAX + 16, c = q => Math.floor(q / CS);
  v = 0;
  // langt fra vann er det verken bru eller bredd å se etter, og bruer ligger bare der en sti går
  if (w0 >= 9) v = 1;
  else {
    if (Math.abs(trailN(x, y)) < 0.14) for (let b = c(y - R); b <= c(y + R) && !v; b++) for (let a = c(x - R); a <= c(x + R) && !v; a++) v = inBridge(bridgesOf(a, b), x, y, 6) || 0;
    if (!v) v = w0 >= 3 || (w0 >= 1 && w(-4, -4) >= 1 && w(4, -4) >= 1 && w(-4, 4) >= 1 && w(4, 4) >= 1) ? 1 : 0;
  }
  _dw.set(k, v); return v;
}
// Hvor langt bortover brua ruta ligger. Av og på brua går den bare ved endene: mellom ei brurute (bi, bj) ved en ende
// og ei landrute (li, lj) som ligger på den samme sida av elva som enden
const dogS = (br, i, j) => clamp(((i + 0.5) * DG - br.x) * br.tx + ((j + 0.5) * DG - br.y) * br.ty, br.a, br.b);
const dogOn = (br, bi, bj, li, lj) => {
  const s = dogS(br, bi, bj), sl = ((li + 0.5) * DG - br.x) * br.tx + ((lj + 0.5) * DG - br.y) * br.ty;
  return s - br.a < br.b - s ? s - br.a < 14 && sl < br.a + 8 : br.b - s < 14 && sl > br.b - 8;
};
// Landsbyen med palisaden går hunden aldri inn i på søk, og på vei inn bare når du selv står der inne: den går rundt.
// Står den alt innenfor (sendt ut derfra), får den gå ut
const dogVill = (x, y) => x > VBB[0] - 12 && x < VBB[2] + 12 && y > VBB[1] - 12 && y < VBB[3] + 12 && villDist(x, y) < 12;
const dogShut = () => D.st === 'search' || !dogVill(P.x, P.y);
// Land hele veien i rett linje, uten å gå inn i landsbyen?
function dogDry(x0, y0, x1, y1) {
  const n = Math.ceil(hyp(x1 - x0, y1 - y0) / 6), shut = dogShut();
  let v = shut && dogVill(x0, y0);
  for (let i = 1; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
    if (dogCell(Math.floor(x / DG), Math.floor(y / DG)) !== 1) return false;
    if (shut) { const w = dogVill(x, y); if (w && !v) return false; v = w; }
  }
  return true;
}
// Søker vei fra (x0, y0) mot (x1, y1). Søket går over flere bilder: funksjonen som kommer tilbake, kjører det noen
// millisekunder videre og gir veipunktene [x, y, på bru] når det er ferdig. Når den ikke fram, ender veien så nær målet som
// den kommer tørrskodd, og D.reach er usann. På bruer følger punktene midten av dekket.
function dogPlan(x0, y0, x1, y1) {
  const gi = Math.floor(x1 / DG), gj = Math.floor(y1 / DG), I = [], J = [], Gc = [], F = [], Pa = [], done = [], idx = new Map(), heap = [];
  const h = (i, j) => { const a = Math.abs(i - gi), b = Math.abs(j - gj); return a + b - 0.586 * Math.min(a, b); };
  const push = n => {
    let c = heap.push(n) - 1;
    while (c > 0) { const p = (c - 1) >> 1; if (F[heap[p]] <= F[n]) break; heap[c] = heap[p]; c = p; }
    heap[c] = n;
  };
  const pop = () => {
    const top = heap[0], n = heap.pop(), len = heap.length;
    if (len) {
      let c = 0;
      for (;;) { let k = 2 * c + 1; if (k >= len) break; if (k + 1 < len && F[heap[k + 1]] < F[heap[k]]) k++; if (F[heap[k]] >= F[n]) break; heap[c] = heap[k]; c = k; }
      heap[c] = n;
    }
    return top;
  };
  const add = (i, j, g, p) => {
    const k = dkey(i, j); let n = idx.get(k);
    if (n === undefined) { n = I.length; idx.set(k, n); I.push(i); J.push(j); Gc.push(Infinity); Pa.push(-1); F.push(0); }
    if (g < Gc[n]) { Gc[n] = g; Pa[n] = p; F[n] = g + h(i, j); push(n); }
    return n;
  };
  // står den i ei brurute uten å stå på selve brua (på bredden ved siden av), regnes ruta som land: da må den inn
  // på brua fra enden, den også
  const si = Math.floor(x0 / DG), sj = Math.floor(y0 / DG), sc = dogCell(si, sj), sv = sc && sc !== 1 && inBridge([sc], x0, y0, 0) ? sc : 1;
  const shut = dogShut(), vill = (i, j) => dogVill((i + 0.5) * DG, (j + 0.5) * DG);
  let best = add(si, sj, 0, -1), bh = Infinity, it = 0;
  return ms => {
    for (const t0 = performance.now(); heap.length && it < 8000;) {
      if (!(it & 7) && performance.now() - t0 > ms) return null;
      const n = pop(); if (done[n]) continue;
      done[n] = 1; it++;
      const hn = h(I[n], J[n]); if (hn < bh) { bh = hn; best = n; }
      if (!hn) break;
      const out = shut && !vill(I[n], J[n]);
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue;
        const i = I[n] + di, j = J[n] + dj;
        const v = dogCell(i, j), u = n ? dogCell(I[n], J[n]) : sv;
        if (!v || (out && vill(i, j)) || (di && dj && (!dogCell(i, J[n]) || !dogCell(I[n], j)))) continue;
        if (v !== u && ((v !== 1 && u !== 1) || (v !== 1 ? !dogOn(v, i, j, I[n], J[n]) : !dogOn(u, I[n], J[n], i, j)))) continue;
        add(i, j, Gc[n] + (di && dj ? 1.414 : 1), n);
      }
    }
    D.reach = !bh;
    const seq = []; for (let n = best; n >= 0; n = Pa[n]) seq.push(n);
    seq.reverse();
    const pts = [], end = (br, s) => { const e = s - br.a < br.b - s ? br.a : br.b; return [br.x + br.tx * e, br.y + br.ty * e, 1]; };
    let pb = null, ps = 0;
    seq.forEach((n, q) => {
      const v = dogCell(I[n], J[n]), x = (I[n] + 0.5) * DG, y = (J[n] + 0.5) * DG;
      const br = v && v !== 1 && (q || sv === v) ? v : null, s = br ? dogS(br, I[n], J[n]) : 0;
      if (q) {
        if (pb && pb !== br) pts.push(end(pb, ps));
        if (br && br !== pb) pts.push(end(br, s));
        pts.push(br ? [br.x + br.tx * s, br.y + br.ty * s, 1] : [x, y, 0]);
      }
      pb = br; ps = s;
    });
    return pts;
  };
}
// Punktet hunden skal gå mot nå for å komme til (tx, ty), eller null når den ikke kommer nærmere uten å bli våt
function dogRoute(tx, ty, dt) {
  // står den alt uti, eller har den stått fast ei stund på vei inn, svømmer den
  D.swim = D.st === 'back' && D.stuck > 1.5;
  if (D.swim) return [tx, ty];
  if (isWater(D.x, D.y)) { D.path = D.plan = null; D.swim = true; return [tx, ty]; }
  D.planT -= dt;
  if (!D.plan && (!D.path || D.planT <= 0 || D.pst !== D.st)) {
    D.pst = D.st;
    // rett fram når det er land hele veien; ble den nettopp stoppet av vann, leter den opp en vei i stedet
    if (!D.blk && dogDry(D.x, D.y, tx, ty)) { D.path = []; D.reach = true; D.planT = 0.5; D.wi = -1; } else D.plan = dogPlan(D.x, D.y, tx, ty);
    D.blk = false;
  }
  if (D.plan) { const r = D.plan(4); if (r) { D.plan = null; D.path = r; D.planT = 0.5; D.wi = -1; } }
  const p = D.path;
  if (!p) return null;
  // framme ved et punkt sikter den mot det fjerneste den ser tørt fram til; punktene på bruer hopper den aldri over
  if (D.wi < 0 || (D.wi < p.length && hyp(p[D.wi][0] - D.x, p[D.wi][1] - D.y) < 5)) {
    let k = D.wi + 1;
    while (k + 1 < p.length && k < D.wi + 9 && !p[k][2] && dogDry(D.x, D.y, p[k + 1][0], p[k + 1][1])) k++;
    D.wi = k;
  }
  if (D.wi < p.length) return p[D.wi];
  if (D.reach) return [tx, ty];
  // finnes det ingen tørr vei inn til deg, svømmer den det siste stykket
  if (D.st === 'back') { D.swim = true; return [tx, ty]; }
  return null;
}
function dogUpdate(dt) {
  if (!G.started) return;
  D.t -= dt; D.ph += dt * 2.6;
  const dp = hyp(P.x - D.x, P.y - D.y);
  let tx = P.x, ty = P.y, spd = 110;
  if (D.st === 'heel') {
    // følger etter et par steg unna; har du flyttet deg langt (til en annen jeger), er den straks hos deg igjen
    if (dp > 600) { dogReset(); return; }
    if (G.view3d || HORSE.on) {
      // i 3D går den ved venstre side av deg, der kameraet bak høyre skulder ser den, og holder følge; små
      // rykk når du snur deg, venter den ut. Rir du, springer den ved venstre side av den
      const a = HORSE.on ? HORSE.h : AIM.yaw, o = HORSE.on ? 20 : DOG_SIDE, b = HORSE.on ? 6 : 0, mx = HORSE.on ? 190 : 110;
      tx = P.x + Math.sin(a) * o - Math.cos(a) * b; ty = P.y - Math.cos(a) * o - Math.sin(a) * b;
      const eh = hyp(tx - D.x, ty - D.y);
      spd = eh > 3 || D.spd > 3 ? (eh > 60 ? mx : clamp(eh * 8, 0, mx)) : 0;
    } else spd = dp > 60 ? 105 : clamp((dp - 14) * 3, 0, 80);
  } else if (D.st === 'search') {
    if (!dogOk(D.a)) { if (D.a) { D.tx = D.a.x; D.ty = D.a.y; } D.a = dogFind(D.x, D.y, 400); }
    // nytt mål, ny vei
    if (D.a !== D.pa) { D.pa = D.a; D.path = D.plan = null; }
    if (D.a) {
      tx = D.a.x; ty = D.a.y;
      // søketida er til for leting: er den på vei mot et dyr, går klokka bare på kvart fart
      if (D.spd > 3) D.t += dt * 0.75;
      if (hyp(tx - D.x, ty - D.y) < 64) {
        D.st = 'mark'; D.barkT = 0; G.treats--; save();
        msg('Hunden står for vilt ' + Math.round(dp * M_PER_PX) + ' m unna. Følg losen.', 'good');
      }
    } else { tx = D.tx; ty = D.ty; if (hyp(tx - D.x, ty - D.y) < 12) D.t = 0; }
    if (D.st === 'search' && D.t <= 0) dogBack('Hunden fant ingenting og kommer tilbake.');
  } else if (D.st === 'mark') {
    if (!dogOk(D.a)) dogBack(D.a && D.a.state === 'flee' ? 'Dyret brøt ut. Hunden kommer tilbake.' : '');
    else {
      spd = 0; D.face = D.a.x > D.x ? 1 : -1; D.hd = Math.atan2(D.a.y - D.y, D.a.x - D.x);
      if (isAuth()) holdAnimal(D.a, D.x);
      else if ((D.netT -= dt) <= 0) { D.netT = 0.4; netSend({ t: 'bay', to: NET.host, id: D.a.id, x: D.x }); }
      if ((D.barkT -= dt) <= 0) { D.barkT = rnd(0.9, 1.6); sfx.woof(clamp(1 - dp / 1400, 0.08, 1), clamp((D.x - P.x) / 500, -0.9, 0.9)); }
    }
  } else if (dp < 24) D.st = 'heel';
  if (D.st === 'heel' || D.st === 'mark') { D.stuck = 0; D.path = D.plan = null; }
  // står den fast på søk, gir den opp og kommer inn
  if (D.st === 'search' && D.stuck > 1.5) { D.stuck = 0; dogBack('Hunden kommer ikke fram og kommer tilbake.'); }
  // ute på søk og på vei inn holder den seg på land og bruer
  const dry = (D.st === 'search' || D.st === 'back') && spd > 0;
  if (dry) { const w = dogRoute(tx, ty, dt); if (w) { tx = w[0]; ty = w[1]; } else spd = 0; }
  // når den ikke tørrskodd nær nok til å stå for dyret, lar den det være og tar nærmeste den kommer til
  if (dry && D.st === 'search' && D.a && D.path && !D.plan && !D.reach) {
    const e = D.path.length ? D.path[D.path.length - 1] : [D.x, D.y];
    if (hyp(e[0] - D.a.x, e[1] - D.a.y) > 56) {
      D.skip.push(D.a); D.a = dogFind(D.x, D.y, DOG_R); spd = 0;
      if (!D.a) dogBack('Hunden kommer ikke fram til viltet og kommer tilbake.');
    }
  }
  // litt slingrende når den søker, sakte i vann; stammer og stein dytter den rundt
  const ex = tx - D.x, ey = ty - D.y, ed = hyp(ex, ey);
  if (spd > 0 && ed > 1) {
    const h0 = Math.atan2(ey, ex);
    let h = h0 + (D.st === 'search' ? Math.sin(D.ph) * 0.6 * smooth(40, 160, ed) : 0);
    D.waterT -= dt; if (D.waterT <= 0) { D.waterT = 0.25; D.wet = isWater(D.x, D.y); }
    const s = Math.min(spd * (D.wet ? 0.45 : 1), ed / Math.max(dt, 1e-3));
    const go = a => collide(D.x + Math.cos(a) * s * dt, D.y + Math.sin(a) * s * dt, 2);
    let c = go(h);
    // fører steget uti, går den rett mot punktet i stedet; er det også vått, står den og finner ny vei
    if (dry && !D.swim && isWater(c.x, c.y)) {
      h = h0; c = go(h);
      if (isWater(c.x, c.y)) { c = { x: D.x, y: D.y }; D.planT = Math.min(D.planT, 0.15); D.blk = true; D.stuck += dt; }
    }
    if (c.x !== D.x || c.y !== D.y) D.stuck = D.swim ? D.stuck : 0;
    const vx = Math.cos(h) * s;
    D.spd = hyp(c.x - D.x, c.y - D.y) / Math.max(dt, 1e-3);
    if (D.spd > 3) D.hd = Math.atan2(c.y - D.y, c.x - D.x);
    D.x = c.x; D.y = c.y;
    if (Math.abs(vx) > 2) D.face = vx > 0 ? 1 : -1;
  } else D.spd = 0;
  // står den ved foten i 3D, ser den samme vei som du
  if (D.st === 'heel' && G.view3d && D.spd <= 3) D.hd = AIM.yaw;
  D.anim += D.spd * dt * (D.spd > 60 ? 0.085 : 0.14);
}
function dogSprite(d) {
  if (d.st === 'mark') return DOGSPR.mark[0];
  return d.spd > 60 ? DOGSPR.run[(d.anim | 0) & 3] : d.spd > 3 ? DOGSPR.walk[(d.anim | 0) & 3] : DOGSPR.stand[0];
}
// Hunden i en av åtte retninger: fw og sd er hvor mye den går bort fra deg og mot høyre. Bakfra, skrått fra, profil,
// skrått mot eller forfra, i åttendeler; den bytter først litt forbi grensa, så den ikke blinker mellom to. Gir [sprite, speilvendt]
function dogDir(d, fw, sd) {
  const k = Math.abs(Math.atan2(sd, fw)) / (Math.PI / 4), n = d.dk != null && Math.abs(k - d.dk) < 0.62 ? d.dk : Math.round(k);
  d.dk = n;
  if (n === 2) return [dogSprite(d), sd < 0];
  const V = DOGSPR[['up', 'ur', , 'dr', 'down'][n]];
  return [d.st === 'mark' ? V.mark : d.spd > 60 ? V.run[(d.anim | 0) & 3] : d.spd > 3 ? V.walk[(d.anim | 0) & 3] : V.stand, sd < 0 && n !== 0 && n !== 4];
}

// ---------- hesten ----------
// Kjøpes i stallen i landsbyen (lv('horse')) og står ved stallen når du kommer til skogen; ellers blir den stående der
// du går av den. Med sal (lv('saddle')) setter F deg på og tar deg av. W driver den fram, S holder igjen og rygger, A og D
// styrer (bare når den går). Stiene går fortest, terrenget og vann sakker den ned, men den går gjennom elver og vann.
// Hovslagene høres lenger enn skritt, så viltet blir urolig før du er der
const HORSE = { x: 0, y: 0, h: Math.PI, v: 0, on: false, odo: 0, splashT: 0, noiseT: 0, warnT: 0, tip: false };
const HORSE_MAX = 150, HORSE_REV = 25, HORSE_ACC = 75, HORSE_BRAKE = 170, HORSE_TURN = 2.3, HORSE_STRIDE = 9;
// det hesten har på seg og hvem som sitter på (se horseSpr), og steget i gangen: 0 står, 1 og 2 går
const horseKit = on => (on ? 1 : 0) | (lv('saddle') ? 2 : 0) | (lv('hbag') ? 4 : 0);
const horseStep = () => (HORSE.on || HORSE.come) && Math.abs(HORSE.v) > 8 ? 1 + ((HORSE.odo / HORSE_STRIDE) | 0) % 2 : 0;
const angD = (a, b) => ((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI;
// Ved veggen til høyre for stalldøra
function horsePark() { const c = VB.stable; Object.assign(HORSE, { x: c.door[0] + Math.cos(c.rot) * 30 + c.out[0] * 8, y: c.door[1] + Math.sin(c.rot) * 30 + c.out[1] * 8, h: c.rot + Math.PI, v: 0, on: false, come: false }); }
// Mens du rir, går det ikke an å sikte, skyte eller slå leir
function onHorse() { if (!HORSE.on) return false; sfx.deny(); msg('Gå av hesten først (F).'); return true; }
function horseMount() {
  if (P.aim || AIM.want) return;
  HORSE.on = true; HORSE.come = false; HORSE.v = 0; P.x = HORSE.x; P.y = HORSE.y; P.work = null; faceTo(HORSE.h); sfx.neigh();
  if (G.view3d) { AIM.yaw = HORSE.h; AIM.pitch = 0; }
  if (!HORSE.tip) { HORSE.tip = true; msg('W driver hesten fram, S holder igjen og rygger, A og D styrer. Hovslagene høres lenger enn skritt, så sett den fra deg et stykke fra der du skal jakte.'); }
}
// Ut av salen uten å flytte jegeren (båret til bua)
function horseLeave() { HORSE.on = false; HORSE.v = 0; }
// Du går av på venstre side, ellers på høyre, bak eller foran; helst på tørt land
function horseDismount() {
  const c = Math.cos(HORSE.h), s = Math.sin(HORSE.h);
  let pick = null;
  for (const [f, r, d] of [[0, -1, 12], [0, 1, 12], [-1, 0, 17], [1, 0, 17]]) {
    const q = collide(HORSE.x + (f * c - r * s) * d, HORSE.y + (f * s + r * c) * d, 3), pt = [q.x, q.y];
    if (!pick) pick = pt;
    if (!isWater(pt[0], pt[1]) && inWorld(pt[0], pt[1])) { pick = pt; break; }
  }
  horseLeave(); P.x = pick[0]; P.y = pick[1]; sfx.snort();
}
// Kaller du på den (hjulet), kommer den til deg når den står innen HORSE_CALL, også gjennom vann. Den finner vei rundt
// hus, gjerder og trær (horsePath) og legger ny vei når du flytter deg eller den blir stående mot noe. Finnes det ingen
// vei fram, gir den opp
const HORSE_CALL = 100 / M_PER_PX;
function horseCall() {
  if (!G.started || G.paused || !lv('horse') || HORSE.on) return;
  if (hyp(HORSE.x - P.x, HORSE.y - P.y) > HORSE_CALL) { sfx.deny(); msg('Hesten er for langt unna til å høre deg.'); return; }
  HORSE.come = true; HORSE.stuckT = 0; HORSE.comeT = 0; HORSE.path = null; sfx.whistle(); msg('Du kaller på hesten.');
}
// Står hesten fritt i (x, y)?
const horseFree = (x, y) => { const q = collide(x, y, 5); return hyp(q.x - x, q.y - y) < 0.5; };
// Fritt i rett linje mellom to punkter?
function horseLine(a, b) {
  const d = hyp(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / 5);
  for (let k = 1; k < n; k++) if (!horseFree(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)) return false;
  return true;
}
// Korteste vei fra hesten til deg i et rutenett med HP_C piksler mellom punktene (A*), rettet ut til så få knekkpunkter
// som mulig: [[x, y], …] fram til like ved deg, eller null når det ikke finnes noen vei
const HP_C = 8;
function horsePath() {
  const C = HP_C, sx = Math.round(HORSE.x / C), sy = Math.round(HORSE.y / C), gx = P.x / C, gy = P.y / C, m = 30;
  const x0 = Math.min(sx, Math.round(gx)) - m, y0 = Math.min(sy, Math.round(gy)) - m, W = Math.abs(sx - Math.round(gx)) + 2 * m + 1, H = Math.abs(sy - Math.round(gy)) + 2 * m + 1;
  const blk = new Uint8Array(W * H), done = new Uint8Array(W * H), from = new Int32Array(W * H).fill(-1), g = new Float32Array(W * H).fill(1e9), f = new Float32Array(W * H);
  const free = i => { if (!blk[i]) blk[i] = horseFree((x0 + i % W) * C, (y0 + (i / W | 0)) * C) ? 1 : 2; return blk[i] === 1; };
  const s = (sy - y0) * W + sx - x0, open = [s];
  blk[s] = 1; g[s] = 0;
  while (open.length) {
    let b = 0; for (let k = 1; k < open.length; k++) if (f[open[k]] < f[open[b]]) b = k;
    const i = open[b]; open[b] = open[open.length - 1]; open.pop();
    if (done[i]) continue; done[i] = 1;
    const ix = i % W, iy = i / W | 0;
    if (hyp(ix + x0 - gx, iy + y0 - gy) * C < 12) {
      const pts = []; for (let k = i; k !== s; k = from[k]) pts.push([(x0 + k % W) * C, (y0 + (k / W | 0)) * C]);
      pts.push([HORSE.x, HORSE.y]); pts.reverse();
      const out = [];
      for (let a = 0; a < pts.length - 1;) { let j = Math.min(pts.length - 1, a + 12); while (j > a + 1 && !horseLine(pts[a], pts[j])) j--; out.push(pts[j]); a = j; }
      return out;
    }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = ix + dx, ny = iy + dy, j = ny * W + nx;
      if (!dx && !dy || nx < 0 || ny < 0 || nx >= W || ny >= H || done[j] || !free(j)) continue;
      // ikke på skrå forbi et hjørne
      if (dx && dy && !(free(i + dx) && free(i + dy * W))) continue;
      const ng = g[i] + (dx && dy ? Math.SQRT2 : 1);
      if (ng < g[j]) { g[j] = ng; from[j] = i; f[j] = ng + hyp(nx + x0 - gx, ny + y0 - gy); open.push(j); }
    }
  }
  return null;
}
function horseCome(dt) {
  const dx = P.x - HORSE.x, dy = P.y - HORSE.y;
  if (hyp(dx, dy) < 16) { HORSE.come = false; HORSE.v = 0; sfx.snort(); return; }
  HORSE.planT = (HORSE.planT || 0) - dt;
  if (!HORSE.path || hyp(P.x - HORSE.gx, P.y - HORSE.gy) > 16 || HORSE.stuckT > 0.5 && HORSE.planT <= 0) {
    HORSE.path = horsePath(); HORSE.gx = P.x; HORSE.gy = P.y; HORSE.planT = 1;
    if (!HORSE.path) { HORSE.come = false; HORSE.v = 0; msg('Hesten kommer ikke fram til deg.'); return; }
  }
  const L = HORSE.path;
  while (L.length && hyp(L[0][0] - HORSE.x, L[0][1] - HORSE.y) < 6) L.shift();
  const a = L.length ? Math.atan2(L[0][1] - HORSE.y, L[0][0] - HORSE.x) : Math.atan2(dy, dx);
  // i svingene sakker den farten, så den ikke går i bue forbi knekkpunktene
  const da = angD(a, HORSE.h);
  HORSE.h += da * Math.min(1, dt * 10);
  const wet = isWater(HORSE.x, HORSE.y), sp = (wet ? 45 : 90) * Math.max(0.15, Math.cos(da));
  const q = collide(HORSE.x + Math.cos(HORSE.h) * sp * dt, HORSE.y + Math.sin(HORSE.h) * sp * dt, 5), moved = hyp(q.x - HORSE.x, q.y - HORSE.y);
  if (((HORSE.odo + moved) / HORSE_STRIDE | 0) !== (HORSE.odo / HORSE_STRIDE | 0)) sfx.hoof(wet);
  HORSE.x = q.x; HORSE.y = q.y; HORSE.v = sp; HORSE.odo += moved;
  HORSE.stuckT = moved < sp * dt * 0.3 ? HORSE.stuckT + dt : 0;
  if (HORSE.stuckT > 2.5 || (HORSE.comeT += dt) > 30) { HORSE.come = false; HORSE.v = 0; msg('Hesten kommer ikke fram til deg.'); }
}
// Den gynger i takt med gangen (1 piksel opp annethvert steg)
const horseBob = () => horseStep() === 2 ? 1 : 0;
// steer: −1 venstre (A), 1 høyre (D); gas: 1 fram (W), −1 hold igjen og rygg (S). wv og tr er vann og sti der den står,
// br brua den står på
function horseDrive(dt, steer, gas, wv, tr, br) {
  let v = HORSE.v;
  // hesten går også tyngre i motbakke
  const dir = v < 0 ? -1 : 1, top = HORSE_MAX * (wv < 1 ? 0.3 : tr < 1.2 ? 1 : 0.7) * (br ? 1 : gradeK(gradeAt(HORSE.x, HORSE.y, Math.cos(HORSE.h) * dir, Math.sin(HORSE.h) * dir)));
  if (gas > 0) v = v < 0 ? Math.min(0, v + HORSE_BRAKE * dt) : v < top ? Math.min(top, v + HORSE_ACC * dt) : v;
  else if (gas < 0) v = v > 0 ? Math.max(0, v - HORSE_BRAKE * dt) : Math.max(-HORSE_REV, v - HORSE_ACC * 0.6 * dt);
  else v -= Math.sign(v) * Math.min(Math.abs(v), 40 * dt);
  if (Math.abs(v) > top) v -= Math.sign(v) * Math.min(Math.abs(v) - top, 120 * dt);
  // den svinger bare når den går, og rygger du, svinger den andre veien
  const dh = steer * HORSE_TURN * clamp(v / 35, -1, 1) * (1 - 0.3 * Math.abs(v) / HORSE_MAX) * dt;
  HORSE.h += dh;
  const c = Math.cos(HORSE.h), s = Math.sin(HORSE.h), d = v * dt;
  let nx = HORSE.x + c * d, ny = HORSE.y + s * d;
  // rekkverket holder den på brua
  if (br) {
    const dx = nx - br.x, dy = ny - br.y, u = dx * br.tx + dy * br.ty;
    if (u > br.a && u < br.b) { const q = clamp(dy * br.tx - dx * br.ty, 1.5 - br.hw, br.hw - 1.5); nx = br.x + br.tx * u - br.ty * q; ny = br.y + br.ty * u + br.tx * q; }
  }
  // tre sirkler langs den, foran, bak og midt på, holdes unna stammer, stein, bua og gapahuker
  for (const o of [6, -6, 0]) { const px = nx + c * o, py = ny + s * o, q = collide(px, py, 5); nx += q.x - px; ny += q.y - py; }
  // grensa for jaktfeltet stopper den; elver og vann går den gjennom
  if (d && !inWorld(nx, ny)) {
    nx = HORSE.x; ny = HORSE.y; v = 0;
    if (G.t > HORSE.warnT) { HORSE.warnT = G.t + 4; msg('Her går grensa for jaktfeltet. Snu og ri tilbake.', 'warn'); }
  }
  // rir du rett inn i noe i fart, smeller det og den rygger litt unna; sakte står den bare mot det
  const moved = hyp(nx - HORSE.x, ny - HORSE.y);
  if (moved < Math.abs(d) * 0.4) { if (Math.abs(v) > 45) { sfx.thud(); v *= -0.2; } else v = Math.sign(v) * moved / dt; }
  // ett hovslag per steg
  if (((HORSE.odo + moved) / HORSE_STRIDE | 0) !== (HORSE.odo / HORSE_STRIDE | 0)) sfx.hoof(wv < 1);
  HORSE.x = nx; HORSE.y = ny; HORSE.v = v; HORSE.odo += moved;
  P.x = nx; P.y = ny; faceTo(HORSE.h);
  // i 3D følger kameraet med i svingene, og når den går, finner det tilbake bak hesten
  if (G.view3d) { AIM.yaw += dh; if (Math.abs(v) > 20) AIM.yaw += angD(HORSE.h, AIM.yaw) * Math.min(1, dt * 1.5); }
  // vannsprut i vann
  if ((HORSE.splashT -= dt) <= 0) {
    HORSE.splashT = 0.2;
    if (wv < 1 && Math.abs(v) > 10) for (let i = 0; i < 3; i++) G.parts.push({ x: nx + rnd(-6, 6), y: ny + rnd(-3, 3), z: 1, vx: rnd(-14, 14), vy: rnd(-6, 6), vz: rnd(10, 22), life: rnd(0.3, 0.6), col: '#a4ccc6', grav: 1 });
  }
  if (isAuth() && (HORSE.noiseT -= dt) <= 0) { HORSE.noiseT = 0.3; stepNoise({ x: nx, y: ny, horse: Math.max(0.05, Math.abs(v) / HORSE_MAX) }); }
}

// ---------- friluft: øks, ved, bål, gapahuk og helse ----------
// Arbeid (hogge, bygge, steke) tar litt tid og avbrytes hvis du går eller sikter
// hansker kan gjøre hogging og bygging raskere
function startWork(kind, dur, done, o) { if (!P.work) P.work = Object.assign({ kind, t: 0, dur: dur * (kind === 'cook' ? 1 : cloMul('work')), done, beat: 0 }, o); }
function workUpdate(dt) {
  const w = P.work; if (!w) return;
  if (P.moving || P.aim || G.panel || w.tree && !CHOP[w.tree.k]) { P.work = null; return; }
  w.t += dt; w.beat -= dt;
  if (w.tree) chopStep(w, dt);
  else if (w.beat <= 0) {
    w.beat = w.kind === 'cook' ? 1.1 : 0.55;
    if (w.kind === 'cook') sfx.sizzle();
    else { sfx.chop(); for (let i = 0; i < 3; i++) G.parts.push({ x: P.x + (P.flip ? -6 : 6), y: P.y - 1, z: rnd(4, 9), vx: rnd(-18, 18), vy: rnd(-5, 5), vz: rnd(6, 16), life: rnd(0.3, 0.6), col: '#d8c090', grav: 1 }); }
  }
  if (w.t >= w.dur) { P.work = null; w.done(); }
}
function nearTree() {
  let best = null, bd = 16;
  for (let cy = Math.floor((P.y - 16) / CS); cy <= Math.floor((P.y + 16) / CS); cy++) for (let cx = Math.floor((P.x - 16) / CS); cx <= Math.floor((P.x + 16) / CS); cx++)
    for (const o of getChunk(cx, cy).objs) if (CHOP[o.k]) { const d = hyp(o.x - P.x, o.y - P.y); if (d < bd) { bd = d; best = o; } }
  return best;
}
// Fallet bråker: vilt i nærheten flykter, og lenger unna blir de urolige
function scare(x, y, r) {
  for (const a of G.animals) {
    if (a.state === 'dead' || a.state === 'flee') continue;
    const d = hyp(a.x - x, a.y - y);
    if (d < r * 0.5) { a.aware = 1.5; startFlee(a, x, y); } else if (d < r) a.aware = Math.max(a.aware, 0.6);
  }
}
// Jegeren stiller seg et skaftlengde fra stammen (side: hvilken side av stammen hakket er på) og hogger.
// Det siste hogget kommer idet arbeidet er ferdig, og treet velter vekk fra jegeren
function chop(o) {
  if (sackFree() < WOOD_KG) { sackFull(); return; }
  P.face = 'side'; P.flip = o.x < P.x;
  const side = P.flip ? 1 : -1, gx = o.x + side * 10, gy = o.y + 2;
  startWork('chop', 3.2, () => {
    const n = CHOP[o.k]; if (!n) return; // en annen rakk å felle det
    fellTree(o.x, o.y, -side); netSend({ t: 'cut', x: o.x, y: o.y, d: -side }); if (isAuth()) scare(o.x, o.y, 420);
    // bare det som får plass i sekken, blir med
    const k = Math.min(n, Math.floor(sackFree() / WOOD_KG + 1e-6));
    G.wood += k; msg('Treet faller! +' + k + ' ved (' + G.wood + ' i alt).' + (k < n ? ' Sekken er full, så resten ble liggende.' : ''), 'good'); save();
  }, Object.assign({ tree: o, side, hits: 0, beat: 0.4 }, isWater(gx, gy) ? {} : { gx, gy }));
}
// Hoggebildet ut fra tida til neste hogg: øksa sitter i stammen, dras løs, svinges opp bak hodet og kommer ned
const chopFrame = w => w.beat > 0.43 ? 2 : w.beat > 0.36 ? 3 : w.beat > 0.08 ? 0 : 1;
const LEAF_C = { spruce: '#39704e', pine: '#558847', birch: '#e2b03a', rowan: '#cc7a38' };
// Hvert hogg sprøyter flis ut av hakket, rister kronen så nåler og blader drysser ned, og gjør hakket dypere
function chopStep(w, dt) {
  const o = w.tree;
  if (w.gx !== undefined) { const k = Math.min(1, dt * 12), c = collide(lerp(P.x, w.gx, k), lerp(P.y, w.gy, k), 3); P.x = c.x; P.y = c.y; }
  if (w.beat > 0) return;
  w.beat = 0.55; w.hits++; o.hit = G.t; o.hitD = -w.side; sfx.chop();
  for (let i = 0; i < 6; i++) G.parts.push({ x: o.x + w.side * 2, y: o.y + 0.5, z: rnd(5, 7), vx: w.side * rnd(10, 36), vy: rnd(-6, 6), vz: rnd(8, 24), life: rnd(0.6, 1.2), col: ['#f0dcac', '#d8c090', '#c8a474', '#5a4030'][i & 3], grav: 1 });
  const s = SPR[o.k][o.v], lc = LEAF_C[o.k];
  if (lc) for (let i = 0; i < 3; i++) G.parts.push({ x: o.x + rnd(-10, 10), y: o.y + rnd(0, 2), z: s.ay * rnd(0.5, 0.85), vx: 0, vy: 0, vz: -rnd(14, 24), life: rnd(3, 4.5), col: lc, leaf: Math.random() * TAU, grav: 0 });
}
// Treet velter (dir: 1 mot høyre, -1 mot venstre): sakte først mens det knaker, så fortere og fortere,
// et brak når det slår i bakken og en liten sprett før det blir liggende. Det fjernes først når det er utenfor skjermen
const FALL_T = 1.6;
const nearK = (x, y) => clamp(1 - hyp(x - P.x, y - P.y) / 700, 0, 1);
function fellTree(x, y, dir) {
  const ch = chunks.get(Math.floor(x / CS) + ',' + Math.floor(y / CS)), o = ch && ch.objs.find(o => o.x === x && o.y === y && CHOP[o.k]);
  if (o) { G.falls.push({ x, y, s: SPR[o.k][o.v], k: o.k, v: o.v, lc: LEAF_C[o.k], dir: dir < 0 ? -1 : 1, t: 0 }); const k = nearK(x, y); if (k > 0) sfx.creak(k); }
  cutTree(x, y);
}
function fallAng(f) {
  if (f.t < FALL_T) return Math.PI / 2 * Math.pow(f.t / FALL_T, 2.6);
  const v = f.t - FALL_T; return Math.PI / 2 - 0.1 * Math.abs(Math.sin(v * 12)) * Math.exp(-v * 5);
}
function fallUpdate(dt) {
  for (const f of G.falls) {
    f.t += dt;
    if (f.t < FALL_T || f.hit) continue;
    // nedslaget: jord og støv langs stammen, og nåler eller blader som spruter fra kronen
    f.hit = 1; const k = nearK(f.x, f.y); if (k > 0) sfx.crash(k);
    const L = f.s.ay - 6;
    for (let i = 0; i < 30; i++) {
      const a = rnd(0.15, 1) * L, crown = a > L * 0.55;
      G.parts.push({ x: f.x + f.dir * a, y: f.y + rnd(-3, 3), z: rnd(0, 3), vx: rnd(-14, 14), vy: rnd(-5, 5), vz: rnd(8, crown ? 30 : 18), life: rnd(0.5, 1.2), col: crown && f.lc && i & 1 ? f.lc : ['#8a7a5c', '#6a5a44', '#c8a474'][i % 3], grav: 1 });
    }
    for (let i = 0; i < 10; i++) G.parts.push({ x: f.x + f.dir * rnd(0.3, 1) * L, y: f.y + rnd(-2, 2), z: rnd(1, 5), vx: rnd(-8, 8), vy: rnd(-3, 3), vz: rnd(2, 6), life: rnd(1, 2), col: '#b8ae96', smoke: 1 });
  }
  G.falls = G.falls.filter(f => f.t < FALL_T + 1 || Math.abs(f.x - CAM.x) < CAM.w / 2 + 120 && Math.abs(f.y - CAM.y) < CAM.h / 2 + 40);
}
const fireSpr = f => FX.fire[((G.t * 8 + f.id * 7) | 0) % 3];
const nearFire = (x, y, r) => G.fires.find(f => f.t > 0 && hyp(f.x - x, f.y - y) < r);
const nearHut = (x, y, r) => G.huts.find(h => hyp(h.x - x, h.y - y) < r);
function addFire(f) { G.fires.push({ id: Math.random(), x: +f.x, y: +f.y, t: FIRE_T, pt: 0 }); }
function addHut(h) { G.huts.push({ id: Math.random(), x: +h.x, y: +h.y }); }
// B: bålet tennes foran deg (ved en gapahuk: foran åpningen) og tar én ved og én fyrstikk
function lightFire() {
  if (!G.started || G.paused || P.aim || P.work || onHorse()) return;
  if (G.wood < 1) { sfx.deny(); msg(lv('axe') ? 'Du har ingen ved. Hogg et tre (F).' : 'Du har ingen ved. Kjøp en øks hos smeden i landsbyen og hogg et tre.'); return; }
  if (G.matches < 1) { sfx.deny(); msg('Du har ingen fyrstikker. Kjøp en eske i landsbyen.'); return; }
  const h = nearHut(P.x, P.y, 30);
  const x = h ? h.x : Math.round(P.x + (P.face === 'side' ? (P.flip ? -12 : 12) : 0)), y = h ? h.y + 16 : Math.round(P.y + (P.face === 'down' ? 12 : P.face === 'up' ? -10 : 2));
  if (isWater(x, y)) { sfx.deny(); msg('Du kan ikke tenne bål i vannet.'); return; }
  if (nearFire(x, y, 24)) { sfx.deny(); msg('Det brenner allerede et bål her.'); return; }
  G.wood--; G.matches--; sfx.strike(); save();
  if (isAuth()) addFire({ x, y }); else netSend({ t: 'fire', to: NET.host, x, y });
  msg('Bålet brenner. Det tørker og varmer, og du kan steke kjøtt over det (F).', 'good');
}
// G: gapahuken bygges like bak deg, så du står foran åpningen
function buildHut() {
  if (!G.started || G.paused || P.aim || P.work || onHorse()) return;
  if (!lv('axe')) { sfx.deny(); msg('Du trenger en øks for å bygge gapahuk. Kjøp en hos smeden i landsbyen.'); return; }
  if (G.wood < HUT_WOOD) { sfx.deny(); msg('En gapahuk trenger ' + HUT_WOOD + ' ved. Du har ' + G.wood + '.'); return; }
  const x = Math.round(P.x), y = Math.round(P.y - 6), c = collide(x, y - 8, 14);
  if (hyp(c.x - x, c.y - (y - 8)) > 0.5 || isWater(x, y) || isWater(x, y - 12) || nearestCabin(x, y).d < 90) { sfx.deny(); msg('Finn en tørr og åpen plass til gapahuken.'); return; }
  P.face = 'up';
  startWork('build', 6, () => {
    if (G.wood < HUT_WOOD) return;
    G.wood -= HUT_WOOD; if (isAuth()) addHut({ x, y }); else netSend({ t: 'hut', to: NET.host, x, y });
    sfx.fall(); msg('Gapahuken står ferdig. Tenn et bål foran den fra hjulet, så kan du sove her (F).', 'good'); save();
  });
}
function cook() {
  startWork('cook', 4, () => {
    // du steker av det kjøttet som er minst verdt per kilo; en hel porsjon gir +25 helse
    const l = G.meat.slice().sort((a, b) => a.kr / a.kg - b.kr / b.kg)[0]; if (!l) return;
    const kg = Math.min(COOK_KG, l.kg), hp = Math.round(25 * kg / COOK_KG);
    l.kr -= Math.round(l.kr * kg / l.kg); l.kg = kg1(l.kg - kg); if (l.kg <= 0) G.meat.splice(G.meat.indexOf(l), 1);
    P.hp = Math.min(100, P.hp + hp); msg('Du stekte ' + fmtKg(kg) + ' ' + meatName(l).toLowerCase() + ' over bålet og spiste det. +' + hp + ' helse.', 'good'); save();
  });
}
// Skoene slites mens du går: springing dobbelt så fort, i vann halvannen gang. Er de utslitt, går du barbeint
function shoeWear(dt) {
  const c = worn('shoes'); if (!c.life) return;
  const h0 = G.shoeHp; G.shoeHp = Math.max(0, h0 - dt * 100 / c.life * (P.run ? 2 : P.sneak ? 0.6 : 1) * (P.wet ? 1.5 : 1));
  if (h0 > 25 && G.shoeHp <= 25) msg('Skoene er nesten utslitt (' + c.name.toLowerCase() + '). Kjøp nye i landsbyen før de ryker.', 'warn');
  if (!G.shoeHp) { G.wear.shoes = 'bare'; msg('Skoene er utslitt, og du går barbeint. Det bråker, du blir våt og kald og orker lite. Kjøp nye sko i landsbyen.', 'warn'); save(); }
}
function healFull() { P.hp = 100; P.sick = false; P.risk = 0; P.cold = 0; P.chill = false; }
// Søvn til morgengry (alene): natta går, dyr og bål er borte, og du våkner uthvilt
function sleepToDawn(text) {
  // dyr du har felt og latt ligge, råtner mens du sover hvis natta er lengre enn det de holder seg
  const skip = (5.5 - G.hour + 24) % 24;
  let kr = 0; for (const a of G.animals) if (a.state === 'dead' && (a.by == null || a.by === NET.id) && !rotten(a) && deadH(a) + skip >= ROT_H) kr += rotFine(a);
  if (G.hour > 5.5) G.day++;
  G.hour = 5.5; G.animals = []; G.scentObjs = []; G.fires = []; dogReset(); healFull(); msg(text, 'good');
  if (kr) { const t = 'Viltet du lot ligge, råtnet mens du sov. Kjøttet kan ikke selges, og du får bot for å la vilt ligge.'; rotNotice(t, fine(kr, t)); } else save();
}
function sleepHut() {
  if (mp()) { healFull(); msg('Du hvilte i gapahuken ved bålet. Du er varm og frisk igjen.', 'good'); save(); return; }
  sleepToDawn('Du sov godt i gapahuken ved bålet. Det lysner over skogen, og du er frisk igjen.');
}
// Helse: våt og kald tærer på kroppen, og er du kald lenge nok, blir du forkjølet. Forkjølelsen trekker
// helsa jevnt ned til du kommer deg i hus eller sover i en gapahuk ved bål. Ved bålet tørker du fort
function healthUpdate(dt) {
  if (!G.started || G.panel === 'shop') return;
  P.warm = !P.wet && !!nearFire(P.x, P.y, 44);
  if (P.warm) P.cold = Math.max(0, P.cold - dt / 8);
  // varme klær gjør at kulda tærer mindre, tynne at den tærer mer
  const ck = clamp(1 - cloSum('warm'), 0.4, 1.6);
  if (P.cold > 0.05) { P.hp -= dt * P.cold * (P.wet ? 1.2 : 0.5) * ck; P.risk += dt * P.cold * 0.04 * ck; }
  else P.risk = Math.max(0, P.risk - dt * (P.warm ? 0.05 : 0.01));
  if (!P.sick && P.risk >= 1) { P.sick = true; P.risk = 0; P.sneezeT = rnd(3, 6); msg('Du har blitt forkjølet. Helsa synker til du kommer deg i hus eller sover i en gapahuk ved bål.', 'warn'); }
  if (P.sick) { P.hp -= dt * 0.2; if ((P.sneezeT -= dt) <= 0) { P.sneezeT = rnd(18, 40); sfx.sneeze(); } }
  if (P.hp <= 0) collapse();
}
// Helsa er brukt opp: du blir båret til nærmeste hus og må betale for redningen
function collapse() {
  const c = nearestCabin(P.x, P.y);
  horseLeave(); P.x = c.c.door[0] + c.c.out[0] * 8; P.y = c.c.door[1] + c.c.out[1] * 8; CAM.x = P.x; CAM.y = P.y - 10; P.aim = false; P.work = null;
  healFull(); P.hp = 40; dogReset();
  fine(RESCUE, 'Du segnet om av kulde og sykdom og ble båret til ' + (c.c.kind === 'koie' ? 'nærmeste koie' : inVillage(c.c) ? 'landsbyen' : c.c.name) + '.');
}
// Bålet: røyk og gnister, knitring når du er i nærheten, og det brenner ned etter en stund
function fireUpdate(dt) {
  for (const f of G.fires) {
    f.t -= dt; f.pt -= dt;
    if (f.pt <= 0) {
      f.pt = 0.12;
      G.parts.push({ x: f.x + rnd(-2, 2), y: f.y, z: 12, vx: G.wind.x * 6 * G.wind.s + rnd(-2, 2), vy: G.wind.y * 4 * G.wind.s, vz: rnd(6, 10), life: rnd(1.5, 3), col: '#b8b4a8', smoke: 1 });
      if (Math.random() < 0.4) G.parts.push({ x: f.x + rnd(-3, 3), y: f.y, z: 8, vx: rnd(-6, 6), vy: rnd(-2, 2), vz: rnd(12, 24), life: rnd(0.4, 0.9), col: '#ffd060', glow: 1 });
    }
  }
  if (isAuth()) G.fires = G.fires.filter(f => f.t > 0);
  if ((G.crackT -= dt) <= 0) { G.crackT = rnd(0.3, 0.9); const f = G.started && nearFire(P.x, P.y, 300); if (f) sfx.crackle(1 - hyp(f.x - P.x, f.y - P.y) / 300); }
}

// ---------- oppdatering ----------
const KEYS = {}, MOUSE = { x: 0, y: 0, wx: 0, wy: 0, locked: false };
function playerUpdate(dt) {
  P.cycle = Math.max(0, P.cycle - dt); P.callCd = Math.max(0, P.callCd - dt);
  if (P.reload > 0) { P.reload -= dt; if (P.reload <= 0) { const k = ammoKey(), n = Math.min(gunCap() - inGun(), G[k]); P.reload = 0; if (G.gun) { P.mag[G.gun] += n; G[k] -= n; } } }
  aimUpdate(dt);
  // du står i ro mens du tar børsa opp; i siktet kan du flytte deg rolig til sidene med A/D, men ikke ute på djupt vann
  let mx = 0, my = 0;
  if (G.started && !G.paused && !P.aim && !AIM.want) {
    if (KEYS.KeyA || KEYS.ArrowLeft) mx -= 1; if (KEYS.KeyD || KEYS.ArrowRight) mx += 1;
    if (KEYS.KeyW || KEYS.ArrowUp) my -= 1; if (KEYS.KeyS || KEYS.ArrowDown) my += 1;
  } else if (G.started && !G.paused && P.aim && AIM.want && !P.deep) {
    if (KEYS.KeyA || KEYS.ArrowLeft) mx -= 1; if (KEYS.KeyD || KEYS.ArrowRight) mx += 1;
  }
  // på hesten driver W den fram, S holder igjen og A/D styrer, både på kartet og i 3D
  const ride = HORSE.on, fl = fields(P.x, P.y, cabinsNear(P.x, P.y)), br = bridgeAt(P.x, P.y), wv = br ? 9 : fl[2];
  if (ride) horseDrive(dt, mx, -my, wv, fl[3], br);
  else if (HORSE.come && G.started && !G.paused) horseCome(dt);
  // i 3D og i siktet går W/S fram og tilbake dit du ser, og A/D til sidene
  if (!ride && (G.view3d || P.aim) && (mx || my)) { const c = Math.cos(AIM.yaw), s = Math.sin(AIM.yaw), f = -my, r = mx; mx = c * f - s * r; my = s * f + c * r; }
  P.sneak = !ride && !!(KEYS.ShiftLeft || KEYS.ShiftRight);
  // på hesten holder du deg tørr
  P.wet = !ride && wv < 1.1; P.deep = !ride && wv < 0.55;
  // vassing gjør deg våt og kald, svømming enda mer; på land tørker klærne sakte. Gode støvler holder deg tørr i grunt
  // vann, varme og vanntette klær tørker fortere, og barbeint blir du stadig våtere og kaldere av å gå
  const wk = P.deep ? 1 : cloMul('wet'), bare = G.wear.shoes === 'bare';
  if (P.wet) P.cold = Math.max(P.cold, Math.min(P.deep ? 1 : 0.6 * wk, P.cold + dt * 0.6 * wk));
  else if (bare && G.started && !ride && (mx || my)) P.cold = Math.max(P.cold, Math.min(BARE_COLD, P.cold + dt * 0.006));
  else P.cold = Math.max(0, P.cold - dt / 80 * Math.max(0.3, (1 + cloSum('warm')) * cloMul('dry')));
  if (G.started && !P.chill && P.cold >= 0.3) { P.chill = true; msg('Du er våt og kald. Helsa synker og siktet skjelver til klærne har tørket. Et bål tørker deg fort.', 'warn'); }
  else if (P.chill && P.cold === 0) { P.chill = false; msg('Klærne har tørket. Du er varm igjen.', 'good'); }
  P.moving = ride ? Math.abs(HORSE.v) > 2 : mx !== 0 || my !== 0;
  // Space mens du går: spring. Det går fort, men bråker og tar pusten, og er lufta tom, må du hente deg inn
  P.run = !ride && P.moving && !P.aim && !P.sneak && !P.winded && !!KEYS.Space;
  // på kne i siktet flytter du deg sakte og stille, som når du sniker
  const low = P.sneak || P.aim;
  if (P.moving) {
    if (!ride) {
      // motbakker er tunge og de bratteste skrentene må du klyve sakte opp; slakt nedover går det litt lettere
      const l = hyp(mx, my), sp = (P.aim ? 9 : P.sneak ? 16 : P.run ? 72 : 40) * (P.deep ? 0.35 : P.wet ? 0.55 : 1) * (br ? 1 : gradeK(gradeAt(P.x, P.y, mx / l, my / l)));
      let nx = P.x + mx / l * sp * dt, ny = P.y + my / l * sp * dt;
      // rekkverket holder deg på brua til du går av i en av endene
      if (br) {
        const dx = nx - br.x, dy = ny - br.y, s = dx * br.tx + dy * br.ty;
        if (s > br.a && s < br.b) { const q = clamp(dy * br.tx - dx * br.ty, 1.5 - br.hw, br.hw - 1.5); nx = br.x + br.tx * s - br.ty * q; ny = br.y + br.ty * s + br.tx * q; }
      }
      // på kne i siktet stopper du ved djupt vann; stammer, stein og vegger stopper deg som ellers
      if (P.aim && waterAt(nx, ny) < 0.55) { nx = P.x; ny = P.y; }
      const c = collide(nx, ny, 3); P.x = c.x; P.y = c.y;
      if (!inWorld(P.x, P.y)) {
        P.x = clamp(P.x, -WORLD, WORLD); P.y = clamp(P.y, -WORLD, WORLD);
        if (G.t > (P.edgeT || 0)) { P.edgeT = G.t + 8; msg('Her går grensa for jaktfeltet. Snu og gå tilbake.', 'warn'); }
      }
    }
    // si fra når du kommer inn i fjellet i nord eller det milde lavlandet i sørvest (med slingringsmonn, så det ikke maser i grensa)
    const kl = climate(P.x, P.y), z0 = P.zone || 0, zone = kl > 0.55 ? 1 : kl < -0.55 ? -1 : Math.abs(kl) < 0.3 ? 0 : z0;
    if (zone !== z0) {
      P.zone = zone;
      if (zone === 1) msg('Du er kommet opp mot fjellet. Her er det kaldt, og rein, rype og bjørn trekker hit.');
      else if (zone === -1) msg('Det er mildere her i sørvest. Hjort, rådyr, rev og villsvin trives her.');
    }
    // navnet på området står på skjermen når du går inn i det; grensa må være et stykke bak deg, så det ikke blinker
    if ((P.regT = (P.regT || 0) - dt) <= 0) {
      P.regT = 0.5; const rg = regionAt(P.x, P.y);
      if (rg !== P.reg && [[60, 0], [-60, 0], [0, 60], [0, -60]].every(([ox, oy]) => regionAt(P.x + ox, P.y + oy) === rg)) { if (P.reg) P.regAt = G.t; P.reg = rg; }
    }
    if (!ride) {
      P.walkT += dt * (low ? 0.55 : P.run ? 1.7 : 1);
      shoeWear(dt);
      if (!G.view3d) { if (Math.abs(mx) >= Math.abs(my)) { P.face = 'side'; P.flip = mx < 0; } else P.face = my > 0 ? 'down' : 'up'; }
      P.stepT -= dt;
      if (P.stepT <= 0) {
        P.stepT = P.aim ? 0.8 : P.sneak ? 0.55 : P.run ? 0.2 : 0.32; sfx.step(low, P.wet);
        // snøen spruter rundt støvlene i fjellet, og det støver når du springer på bar mark
        const sn = climate(P.x, P.y) > 0.45;
        if (!P.wet && !P.aim && (sn || P.run)) for (let i = 0; i < 2; i++) G.parts.push({ x: P.x + rnd(-2, 2), y: P.y + rnd(-1, 1), z: 0, vx: -Math.sign(mx) * rnd(4, 14) + rnd(-5, 5), vy: -Math.sign(my) * rnd(3, 10), vz: rnd(5, 12), life: rnd(0.25, 0.45), col: sn ? '#eef2f4' : '#8a7a5c', grav: 1 });
        if (isAuth()) stepNoise({ x: P.x, y: P.y, sneak: low, run: P.run, wet: P.wet, noise: cloMul('noise') });
      }
    }
  }
  // i 3D snur jegeren seg dit du ser (på kartet og for de andre jegerne); på hesten dit den går
  if (G.view3d && !P.work && !ride) faceTo(AIM.yaw);
  // står hunden for vilt, snur jegeren seg mot dyret mens han står i ro
  else if (D.st === 'mark' && D.a && !P.moving && !P.work && !ride && !P.aim && !AIM.want && !AIM.raise && hyp(D.a.x - P.x, D.a.y - P.y) > 12) faceTo(Math.atan2(D.a.y - P.y, D.a.x - P.x));
  // sikte: pust og ro. Små justeringer går greit, men svinger du børsa langt (f.eks. fra ett dyr til et annet),
  // kommer den i uro som tar rundt et sekund å roe seg. Holder du pusten (Space), står siktet stille, og bare i
  // noen få sekunder; går lufta tom, hiver du etter pusten, og du kan ikke holde den igjen før du har hentet deg inn
  const swayA = (hagle() ? HST.sway : bue() ? BST.sway[lv('bue')] : ST.sway[lv('stock')]) * (P.sneak ? 0.85 : 1) * (1 + 1.2 * P.cold * cloMul('steady'));
  if (P.winded && P.breath >= 0.8) P.winded = false;
  P.hold = P.aim && !P.winded && !!KEYS.Space;
  // hvileretningen følger siktet etter; hvor langt siktet er fra den, sier hvor stort svinget er (radianer)
  const ra = 1 - Math.exp(-dt / 0.6);
  AIM.ry += (AIM.yaw - AIM.ry) * ra; AIM.rp += (AIM.pitch - AIM.rp) * ra;
  // flytter du deg i siktet, vugger børsa litt, og den trenger et øyeblikk på å roe seg når du stopper
  const sw = hyp(AIM.yaw - AIM.ry, AIM.pitch - AIM.rp), swing = !P.aim ? 0 : Math.max(P.moving ? 0.3 : 0, hagle() ? smooth(0.5, 1.2, sw) : smooth(0.05, 0.2, sw));
  P.unrest = swing > P.unrest ? lerp(P.unrest, swing, Math.min(1, dt * 8)) : Math.max(swing, P.unrest - dt * (P.hold ? 2 : 0.9));
  if (P.aim) {
    if (P.hold && P.breath > 0) { P.breath = Math.max(0, P.breath - dt / 3); if (!P.breath) P.winded = true; }
    else P.breath = Math.min(1, P.breath + dt / 3);
    P.bph += dt * (P.winded ? 2.4 : 1);
    const k = P.winded ? 3.2 : P.hold ? 0 : P.breath < 0.25 ? 1.8 : 1, t = P.bph;
    const tgx = (Math.sin(t * 1.1) * 0.7 + Math.sin(t * 2.3 + 1) * 0.3) * swayA * k, tgy = (Math.sin(t * 1.7 + 2) * 0.6 + Math.sin(t * 0.8) * 0.4) * swayA * 0.8 * k;
    P.sway[0] = lerp(P.sway[0], tgx, Math.min(1, dt * 6)); P.sway[1] = lerp(P.sway[1], tgy, Math.min(1, dt * 6));
    faceTo(AIM.yaw);
  } else if (P.run) { P.breath = Math.max(0, P.breath - dt / (5 * cloMul('run'))); if (!P.breath) P.winded = true; }
  // barbeint henter du deg inn halvparten så fort
  else P.breath = Math.min(1, P.breath + dt / 2 * (G.wear.shoes === 'bare' ? 0.5 : 1));
}
// ---------- folk i landsbyen ----------
// Hver har en rute fra døra si (huset fra VB): [x, y, ventetid, gjøremål]. De går ruta fram og tilbake og stopper der det
// står en ventetid: 'chop' hogger eller hakker, 'smith' hamrer på ambolten så gnistene spruter, 'L', 'R' og 'U' står
// vendt mot venstre, høyre eller fra deg. Hjemme går de inn (in), og om natta blir de inne til morgenen.
// [farger (VIL_PAL), fart, hus, ventetid hjemme, rute]
const VILL = [
  [0, 17, 'bakery', 7, [[-135, -136], [-80, -138], [-40, -136], [-28, -122, 14]]],                               // bakeren, til brødboden
  [1, 16, 'smith', 5, [[-106, -44], [-94, -41, 16, 'smith']]],                                                   // smedgutten ved ambolten
  [2, 15, 'farm', 6, [[-190, -240], [-150, -224], [-144, -262], [-144, -285, 9, 'chop'], [-100, -300, 9, 'chop']]], // bonden på åkeren
  [3, 16, 'h4', 6, [[40, 26], [4, 22], [-10, -30], [-4, -95], [0, -134, 7, 'U']]],                               // henter vann i brønnen
  [4, 12, 'church', 8, [[30, -205], [-14, -196, 6], [28, -198, 6]]],                                             // presten foran kirka
  [5, 17, 'h1', 5, [[226, -195], [234, -160], [180, -140], [110, -150], [60, -156], [-20, -172, 30, 'L']]],      // to som møtes ved benken på torget
  [6, 17, 'h0', 5, [[-182, -78], [-172, -126], [-110, -135], [-60, -150], [-34, -172, 30, 'R']]],
  [7, 16, 'h3', 5, [[-124, 16], [-124, 10, 16, 'chop']]],                                                        // vedhoggeren
  [8, 18, 'h2', 6, [[195, -68], [145, -52], [110, -45], [50, -55], [-2, -40], [-12, -30], [-95, -28], [-150, -30], [-180, -80], [-172, -126], [-230, -146], [-280, -150, 5, 'L']]], // rusler gjennom landsbyen
  [9, 16, 'gun', 6, [[108, -232], [121, -300], [120, -330, 8, 'U']]],                                            // ser til nordgrinda
].map(([pal, sp, home, w, rt], i) => { const d = VB[home].door, route = [[d[0], d[1], w], ...rt]; return { pal, sp, route, i: 0, dir: 1, x: d[0], y: d[1], wait: 1 + i * 2.5, act: null, in: true, face: 'down', flip: false, moving: false, walkT: 0, fr: 0 }; });
// pipene på bakeriet og smia: [x, y, høyde]
const VILL_SMOKE = [VB.bakery, VB.smith].map(c => { const cu = (HOUSE_STYLE[CABIN_V[c.kind]].L || 48) * 0.225; return [c.x + Math.cos(c.rot) * cu, c.y + Math.sin(c.rot) * cu, HOUSE_HW + HOUSE_HR + 5]; });
// Bildet i hoggingen: øksa opp, ned, i, og løs igjen
const villChop = v => { const u = (G.t + v.pal * 0.37) % 1.2; return u < 0.45 ? 0 : u < 0.55 ? 1 : u < 0.85 ? 2 : 3; };
// d er retningen han ses fra i 3D (ellers den han vender på kartet)
const villSpr = (v, d) => v.act === 'chop' || v.act === 'smith' ? VSPR[v.pal].chop[villChop(v)] : VSPR[v.pal][d || v.face][v.moving ? 1 + ((v.walkT * 7.5) | 0) % 4 : 0];
function villUpdate(dt) {
  if (hyp(P.x, P.y + 150) > 800) return;
  const night = G.hour > 21.5 || G.hour < 5.5;
  for (const v of VILL) {
    v.moving = false;
    if (v.wait > 0) {
      if (v.in && night) continue;
      if (v.act === 'smith') { const k = villChop(v); if (k === 2 && v.fr !== 2) burst(v.x + 11, v.y + 1, 9, '#ffc850', 4, 14); v.fr = k; }
      if ((v.wait -= dt) <= 0) { v.in = false; v.act = null; }
      continue;
    }
    const n = v.i + v.dir, t = v.route[n], dx = t[0] - v.x, dy = t[1] - v.y, d = hyp(dx, dy), st = v.sp * dt;
    // står du i veien, venter de til du har gått forbi
    if (hyp(P.x - v.x, P.y - v.y) < 10 && (P.x - v.x) * dx + (P.y - v.y) * dy > 0) continue;
    if (d > st) {
      v.x += dx / d * st; v.y += dy / d * st; v.moving = true; v.walkT += dt;
      if (Math.abs(dx) > Math.abs(dy)) { v.face = 'side'; v.flip = dx < 0; } else v.face = dy < 0 ? 'up' : 'down';
      continue;
    }
    v.x = t[0]; v.y = t[1]; v.i = n; v.wait = t[2] || 0; v.act = t[3] || null;
    if (n === 0 || n === v.route.length - 1) v.dir = -v.dir;
    if (n === 0) v.in = true;
    if (v.wait) { const a = v.act; v.face = a === 'U' ? 'up' : a ? 'side' : 'down'; v.flip = a === 'L'; }
  }
  // røyk fra pipene
  if ((VILL.smokeT = (VILL.smokeT || 0) - dt) <= 0) {
    VILL.smokeT = 0.35;
    for (const [x, y, z] of VILL_SMOKE) G.parts.push({ x: x + rnd(-2, 2), y, z, vx: G.wind.x * 6 * G.wind.s + rnd(-2, 2), vy: G.wind.y * 4 * G.wind.s, vz: rnd(6, 10), life: rnd(1.5, 3), col: '#b8b4a8', smoke: 1 });
  }
}

function update(dt) {
  G.t += dt;
  // alene fryser verden mens bua eller jaktboka er åpen; med andre på nettet går tida videre
  const frozen = G.paused && !mp();
  if (!frozen) {
    G.hour += dt / 30;
    if (G.hour >= 24) { G.hour -= 24; G.day++; }
  }
  if (G.started) { G.saveT -= dt; if (G.saveT <= 0) { G.saveT = 15; save(); } }
  const h = G.hour; G.dayl = clamp(Math.min(smooth(4.8, 7.5, h), 1 - smooth(18.5, 21.2, h)), 0, 1);
  const wa = vnoise(G.t / 45, 3.3, 99) * TAU * 1.6 + 0.6, ws = clamp(0.15 + 0.85 * vnoise(G.t / 20, 7.7, 98), 0, 1);
  G.wind.a = wa; G.wind.s = ws; G.wind.x = Math.cos(wa); G.wind.y = Math.sin(wa);
  if (frozen) return;
  if (G.started) discover();
  G.hunters = hunters();
  for (const h of G.hunters) h.cov = fields(h.x, h.y, cabinsNear(h.x, h.y))[0];
  playerUpdate(dt);
  workUpdate(dt);
  fallUpdate(dt);
  healthUpdate(dt);
  dogUpdate(dt);
  villUpdate(dt);
  netUpdate(dt);
  if (isAuth()) {
    for (const a of G.animals.slice()) animalUpdate(a, dt);
    const anc = anchors();
    G.quiet = G.quiet.filter(q => (q.t -= dt) > 0);
    G.spawnT -= dt; if (G.spawnT <= 0) { G.spawnT = 2.5 / anc.length; trySpawn(anc[(Math.random() * anc.length) | 0]); }
    // felte dyr blir liggende til de har råtnet bort, hvor langt unna du enn går (så du rekker å hente hesten)
    G.animals = G.animals.filter(a => a.state === 'dead' ? deadH(a) < ROT_H + ROT_GONE : anc.some(h => hyp(a.x - h.x, a.y - h.y) < ANIMAL_R));
  } else for (const a of G.animals) mirrorAnimal(a, dt);
  // vingesus når fugl letter i nærheten (én gang per flokk og bilde)
  let flushed = false;
  for (const a of G.animals) {
    const fl = a.state === 'flee' && !!SPEC[a.sp].bird;
    if (fl && !a._fl && !flushed && G.started) { const k = 1 - hyp(a.x - P.x, a.y - P.y) / 500; if (k > 0) { sfx.flush(k); flushed = true; } }
    a._fl = fl;
  }
  // luktstoff
  for (const s of G.scentObjs) {
    s.t -= dt; s.pt -= dt;
    if (s.pt <= 0) { s.pt = 0.35; G.parts.push({ x: s.x, y: s.y, z: 5, vx: G.wind.x * 8 * G.wind.s + rnd(-2, 2), vy: G.wind.y * 6 * G.wind.s, vz: rnd(1, 3), life: rnd(2, 4), col: '#e8dc84', smoke: 1, glow: 1 }); }
    if (isAuth() && ((G.t * 2) | 0) !== (((G.t - dt) * 2) | 0)) for (const a of G.animals) {
      if (a.state === 'dead' || a.state === 'flee' || a.state === 'approach' || a.state === 'toScent' || a.state === 'alert') continue;
      const d = hyp(a.x - s.x, a.y - s.y); a.nearScent = d < 40;
      if (d < s.r && d > 30 && Math.random() < 0.3) { a.state = 'toScent'; a.tx = s.x + rnd(-24, 24); a.ty = s.y + rnd(-14, 14); }
    }
  }
  G.scentObjs = G.scentObjs.filter(s => s.t > 0);
  fireUpdate(dt);
  for (const b of G.blood) b.t += dt;
  G.blood = G.blood.filter(b => b.t < 240);
  // jegerens lukt, synlig som svake fnugg i vinden
  if (G.started && Math.random() < dt * 4 * ST.deo[lv('deo')]) G.parts.push({ x: P.x + rnd(-3, 3), y: P.y, z: rnd(6, 14), vx: G.wind.x * (10 + 22 * G.wind.s), vy: G.wind.y * (8 + 18 * G.wind.s), vz: rnd(-0.5, 0.5), life: rnd(1.5, 3), col: '#dfe6dc', smoke: 1, faint: 1 });
  // frostrøyk fra jegeren og hunden i fjellet og i den kalde lufta om natta og morgenen; oftere når han er andpusten
  if (G.started && G.panel !== 'shop' && (G.dayl < 0.6 || climate(P.x, P.y) > 0.3)) {
    const puff = (x, y, z, dx, dy) => { for (let i = 0; i < 3; i++) G.parts.push({ x: x + dx * 3, y: y + dy * 2, z: z + rnd(-0.5, 0.5), vx: dx * rnd(3, 7) + G.wind.x * 4 * G.wind.s, vy: dy * rnd(2, 5) + G.wind.y * 3 * G.wind.s, vz: rnd(1, 4), life: rnd(0.5, 0.9), col: '#eef2f4', smoke: 1 }); };
    if (!P.aim && (P.puffT = (P.puffT || 0) - dt) <= 0) { P.puffT = P.winded ? 0.5 : P.run ? 0.8 : 2.6; puff(P.x, P.y, (P.deep ? 9 : 14) + (HORSE.on ? 10 : 0), P.face === 'side' ? (P.flip ? -1 : 1) : 0, P.face === 'side' ? 0 : P.face === 'up' ? -1 : 1); }
    if ((D.puffT = (D.puffT || 0) - dt) <= 0) { D.puffT = D.spd > 3 ? 0.7 : 1.6; puff(D.x, D.y, 6, Math.cos(D.hd), Math.sin(D.hd)); }
  }
  // fnugg og småfluer som lyser opp i sola om dagen (ikke i snøværet i fjellet)
  if (G.dayl > 0.5 && Math.random() < dt * 5 && climate(CAM.x, CAM.y) <= 0.45) G.parts.push({ x: CAM.x + rnd(-CAM.w / 2, CAM.w / 2), y: CAM.y + rnd(-CAM.h / 2, CAM.h / 2), z: rnd(4, 30), vx: G.wind.x * (3 + 8 * G.wind.s) + rnd(-2, 2), vy: G.wind.y * (2 + 6 * G.wind.s) + rnd(-1, 1), vz: rnd(-1, 1.5), life: rnd(3, 6), col: '#fff6d0', mote: 1 });
  // blader og ildfluer; i fjellet i nord snør det i stedet
  if (Math.random() < dt * 2.2) { const sn = climate(CAM.x, CAM.y) > 0.45; G.parts.push({ x: CAM.x + rnd(-CAM.w / 2, CAM.w / 2), y: CAM.y + rnd(-CAM.h / 2, CAM.h / 2), z: rnd(40, 80), vx: G.wind.x * 8, vy: 0, vz: -rnd(5, 9) * (sn ? 0.5 : 1), life: 12, col: sn ? '#eef2f4' : ['#e6bd52', '#cf9a34', '#c2682a', '#f3d262'][(Math.random() * 4) | 0], leaf: Math.random() * TAU, grav: 0 }); }
  if (G.dayl < 0.4 && Math.random() < dt * 3) G.parts.push({ x: CAM.x + rnd(-CAM.w / 2, CAM.w / 2), y: CAM.y + rnd(-CAM.h / 2, CAM.h / 2), z: rnd(3, 16), vx: rnd(-3, 3), vy: rnd(-2, 2), vz: rnd(-1, 1), life: rnd(3, 6), col: '#e8f08a', fly: 1 });
  for (const p of G.parts) {
    p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.grav) { p.vz -= 60 * dt; if (p.z < 0) { p.z = 0; p.vx *= 0.5; p.vy *= 0.5; p.vz = 0; } }
    if (p.leaf !== undefined) { p.leaf += dt * 2; p.x += Math.sin(p.leaf) * 6 * dt; if (p.z <= 0) { p.z = 0; p.vz = 0; p.vx = 0; p.life = Math.min(p.life, 3); } }
    if (p.smoke) { p.vx *= 0.98; p.vy *= 0.98; }
    if (p.fly) { p.vx += rnd(-6, 6) * dt; p.vy += rnd(-6, 6) * dt; }
  }
  G.parts = G.parts.filter(p => p.life > 0);
  if (G.parts.length > 600) G.parts.splice(0, G.parts.length - 600);
  for (const m of G.msgs) m.t += dt;
  if (G.msgs.length && G.msgs[0].t > 7) { G.msgs.shift(); HUD.dirtyMsg = true; }
  if (AU.ctx) auAmbient(dt, G.dayl, G.wind.s);
}
