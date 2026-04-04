// Inges strikkehjelp - app.js
const APP_VERSION = '1.0.1';

// --- Mørkmodus ---
const DARK_MODE_KEY = 'inges-strikkehjelp-darkmode';
const darkToggle = document.getElementById('darkModeToggle');

function settMorkModus(aktiv) {
    document.body.classList.toggle('dark', aktiv);
    localStorage.setItem(DARK_MODE_KEY, aktiv ? 'on' : 'off');
}

settMorkModus(localStorage.getItem(DARK_MODE_KEY) === 'on');

darkToggle.addEventListener('click', () => {
    settMorkModus(!document.body.classList.contains('dark'));
});

// --- Hva er nytt ---
const VERSION_KEY = 'inges-strikkehjelp-sett-versjon';
const whatsNew = document.getElementById('whatsNewOverlay');
const settVersjon = localStorage.getItem(VERSION_KEY);

if (settVersjon !== APP_VERSION) {
    whatsNew.classList.remove('hidden');
}

function lukkWhatsNew() {
    whatsNew.classList.add('hidden');
    localStorage.setItem(VERSION_KEY, APP_VERSION);
}

document.getElementById('closeWhatsNew').addEventListener('click', lukkWhatsNew);
whatsNew.addEventListener('click', (e) => {
    if (e.target === whatsNew) lukkWhatsNew();
});

// --- Side-navigasjon (fliser) ---
const allPages = document.querySelectorAll('.page');

function visSide(id) {
    allPages.forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}

document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => visSide(tile.dataset.page));
});

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => visSide(btn.dataset.page));
});

// --- Masketeller med localStorage ---
const STORAGE_KEY = 'inges-strikkehjelp-tellere';

function lagreTellere() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
}

function hentTellere() {
    const lagret = localStorage.getItem(STORAGE_KEY);
    if (!lagret) return { masker: 0, rader: 0 };

    try {
        const parsed = JSON.parse(lagret);
        const masker = Number.isInteger(parsed?.masker) && parsed.masker >= 0 ? parsed.masker : 0;
        const rader = Number.isInteger(parsed?.rader) && parsed.rader >= 0 ? parsed.rader : 0;
        return { masker, rader };
    } catch {
        return { masker: 0, rader: 0 };
    }
}

function hentPositivtTall(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    const value = Number.parseFloat(element.value);
    return Number.isFinite(value) && value > 0 ? value : null;
}

function hentPositivtHeltall(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    const raw = element.value.trim();
    if (!raw) return null;
    const value = Number(raw);
    return Number.isInteger(value) && value > 0 ? value : null;
}

const counters = hentTellere();
document.getElementById('masker').textContent = counters.masker;
document.getElementById('rader').textContent = counters.rader;

document.querySelectorAll('.btn-counter').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (btn.classList.contains('btn-plus')) {
            counters[target]++;
        } else {
            counters[target] = Math.max(0, counters[target] - 1);
        }
        document.getElementById(target).textContent = counters[target];
        lagreTellere();
    });
});

// --- Nullstilling med bekreftelse ---
document.getElementById('resetCounters').addEventListener('click', () => {
    if (counters.masker === 0 && counters.rader === 0) return;
    if (!confirm('Er du sikker på at du vil nullstille tellerne?')) return;

    counters.masker = 0;
    counters.rader = 0;
    document.getElementById('masker').textContent = '0';
    document.getElementById('rader').textContent = '0';
    lagreTellere();
});

// --- Tastaturstøtte for tellere ---
document.addEventListener('keydown', (e) => {
    const aktivSide = document.querySelector('.page.active');
    if (!aktivSide || aktivSide.id !== 'teller') return;
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        counters.masker++;
        document.getElementById('masker').textContent = counters.masker;
        lagreTellere();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        counters.masker = Math.max(0, counters.masker - 1);
        document.getElementById('masker').textContent = counters.masker;
        lagreTellere();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        counters.rader++;
        document.getElementById('rader').textContent = counters.rader;
        lagreTellere();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        counters.rader = Math.max(0, counters.rader - 1);
        document.getElementById('rader').textContent = counters.rader;
        lagreTellere();
    }
});

// --- Beregn økning ---
document.getElementById('beregnOykning').addEventListener('click', () => {
    const start = hentPositivtHeltall('oykningStart');
    const mal = hentPositivtHeltall('oykningMal');
    const resultat = document.getElementById('oykningResultat');

    if (start === null || mal === null) {
        visResultat(resultat, '<p class="error">Vennligst fyll inn begge feltene.</p>');
        return;
    }

    if (mal <= start) {
        visResultat(resultat, '<p class="error">Ønsket antall må være større enn nåværende antall masker.</p>');
        return;
    }

    const okninger = mal - start;
    visResultat(resultat, beregnJevnFordeling(start, okninger, 'øke'));
});

// --- Beregn felling ---
document.getElementById('beregnFelling').addEventListener('click', () => {
    const start = hentPositivtHeltall('fellingStart');
    const mal = hentPositivtHeltall('fellingMal');
    const resultat = document.getElementById('fellingResultat');

    if (start === null || mal === null) {
        visResultat(resultat, '<p class="error">Vennligst fyll inn begge feltene.</p>');
        return;
    }

    if (mal >= start) {
        visResultat(resultat, '<p class="error">Ønsket antall må være mindre enn nåværende antall masker.</p>');
        return;
    }

    const fellinger = start - mal;
    visResultat(resultat, beregnJevnFordeling(start, fellinger, 'felle'));
});

// --- Beregningsfunksjon for jevn fordeling ---
function beregnJevnFordeling(totalMasker, endringer, type) {
    const interval = Math.floor(totalMasker / endringer);
    const rest = totalMasker % endringer;

    const typeNavn = type === 'øke' ? 'økninger' : 'fellinger';
    const handling = type === 'øke' ? 'øk 1 maske' : 'fell 2 sammen';
    const nyTotal = type === 'øke' ? totalMasker + endringer : totalMasker - endringer;

    let html = `<h3>Resultat</h3>`;
    html += `<p class="instruction">Du skal gjøre <strong>${endringer} ${typeNavn}</strong> jevnt fordelt over ${totalMasker} masker.</p>`;

    if (rest === 0) {
        html += `<p class="instruction">Strikk ${interval - 1} masker, ${handling}. Gjenta ${endringer} ganger.</p>`;
    } else {
        const langtIntervall = interval + 1;
        const antallLange = rest;
        const antallKorte = endringer - rest;

        html += `<p class="instruction">`;
        html += `Strikk ${langtIntervall - 1} masker, ${handling} &mdash; gjenta ${antallLange} ganger.<br>`;
        html += `Strikk ${interval - 1} masker, ${handling} &mdash; gjenta ${antallKorte} ganger.`;
        html += `</p>`;
        html += `<p class="detail">Tips: Fordel de lengre intervallene jevnt innimellom de kortere for finest resultat.</p>`;
    }

    html += `<p class="detail">Nytt maskeantall: <strong>${nyTotal}</strong></p>`;

    return html;
}

function visResultat(element, html) {
    element.innerHTML = html;
    element.classList.remove('hidden');
}

// --- Strikkefasthets-kalkulator ---
document.getElementById('beregnFasthet').addEventListener('click', () => {
    const masker = hentPositivtTall('provMasker');
    const bredde = hentPositivtTall('provCm');
    const onsket = hentPositivtTall('onsketCm');
    const resultat = document.getElementById('fasthetResultat');

    if (masker === null || bredde === null || onsket === null) {
        visResultat(resultat, '<p class="error">Vennligst fyll inn alle tre feltene.</p>');
        return;
    }

    const maskerPerCm = masker / bredde;
    const maskerPer10cm = maskerPerCm * 10;
    const totalMasker = Math.round(maskerPerCm * onsket);

    let html = `<h3>Resultat</h3>`;
    html += `<p class="instruction">Din strikkefasthet: <strong>${maskerPer10cm.toFixed(1)} masker per 10 cm</strong></p>`;
    html += `<p class="instruction">For ${onsket} cm bredde trenger du: <strong>${totalMasker} masker</strong></p>`;
    html += `<p class="detail">(${maskerPerCm.toFixed(2)} masker per cm)</p>`;

    visResultat(resultat, html);
});

// --- Garnforbruk-kalkulator ---
const garnEstimat = {
    skjerf:       { meter: 200,  navn: 'Skjerf' },
    lue:          { meter: 100,  navn: 'Lue' },
    votter:       { meter: 150,  navn: 'Votter (par)' },
    sokker:       { meter: 200,  navn: 'Sokker (par)' },
    genser_barn:  { meter: 500,  navn: 'Genser barn' },
    genser_dame:  { meter: 800,  navn: 'Genser dame' },
    genser_herre: { meter: 1000, navn: 'Genser herre' },
    sjal:         { meter: 400,  navn: 'Sjal' },
    teppe:        { meter: 600,  navn: 'Babyteppe' }
};

document.getElementById('beregnGarn').addEventListener('click', () => {
    const type = document.getElementById('prosjektType').value;
    const meterPerNoste = hentPositivtTall('garnLengde');
    const pinne = parseFloat(document.getElementById('pinnestorrelse').value);
    const resultat = document.getElementById('garnResultat');

    if (!type) {
        visResultat(resultat, '<p class="error">Velg en prosjekttype.</p>');
        return;
    }
    if (meterPerNoste === null) {
        visResultat(resultat, '<p class="error">Fyll inn meter per nøste.</p>');
        return;
    }

    const prosjekt = garnEstimat[type];
    let justerMeter = prosjekt.meter;

    // Juster basert på pinnestørrelse (4mm er baseline)
    if (pinne) {
        if (pinne <= 3) {
            justerMeter = Math.round(prosjekt.meter * 1.25);
        } else if (pinne <= 3.5) {
            justerMeter = Math.round(prosjekt.meter * 1.15);
        } else if (pinne <= 4.5) {
            justerMeter = prosjekt.meter;
        } else if (pinne <= 5.5) {
            justerMeter = Math.round(prosjekt.meter * 0.9);
        } else if (pinne <= 7) {
            justerMeter = Math.round(prosjekt.meter * 0.8);
        } else {
            justerMeter = Math.round(prosjekt.meter * 0.7);
        }
    }

    const antallNoster = Math.ceil(justerMeter / meterPerNoste);

    let html = `<h3>Resultat</h3>`;
    html += `<p class="instruction"><strong>${prosjekt.navn}</strong> trenger ca. <strong>${justerMeter} meter</strong> garn.</p>`;
    if (pinne) {
        const faktor = justerMeter / prosjekt.meter;
        const prosent = Math.round((faktor - 1) * 100);
        if (prosent === 0) {
            html += `<p class="detail">Pinne ${pinne} mm er standard for denne typen &mdash; ingen justering.</p>`;
        } else {
            const retning = prosent > 0 ? 'mer' : 'mindre';
            html += `<p class="detail">Justert for pinne ${pinne} mm: ${Math.abs(prosent)}% ${retning} garn enn standard (${prosjekt.meter} m).</p>`;
        }
    }
    html += `<p class="instruction">Med ${meterPerNoste} m/nøste trenger du: <strong>${antallNoster} nøster</strong></p>`;
    html += `<p class="detail">Tips: Kjøp gjerne 1 ekstra nøste for sikkerhets skyld. Estimatene er omtrentlige og varierer med garntykkelse og mønster.</p>`;

    visResultat(resultat, html);
});

// --- Garndatabase ---
const GARN_DATABASE = [
    // Sandnes Garn
    { id: 'sg-smart', navn: 'Smart', merke: 'Sandnes Garn', kategori: 'sport', fiber: ['ull'], meterPer50g: 100, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Superwash, maskinvaskbar' },
    { id: 'sg-peer-gynt', navn: 'Peer Gynt', merke: 'Sandnes Garn', kategori: 'sport', fiber: ['ull'], meterPer50g: 91, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Norsk ull, krymper i vask' },
    { id: 'sg-sisu', navn: 'Sisu', merke: 'Sandnes Garn', kategori: 'fingering', fiber: ['ull'], meterPer50g: 175, pinne: [2.5, 3.5], maskerPer10cm: 28, info: 'Sokkegarn, slitesterkt' },
    { id: 'sg-tynn-merinoull', navn: 'Tynn Merinoull', merke: 'Sandnes Garn', kategori: 'fingering', fiber: ['merinoull'], meterPer50g: 175, pinne: [2.5, 3], maskerPer10cm: 28, info: 'Mykt, superwash' },
    { id: 'sg-alpakka', navn: 'Alpakka', merke: 'Sandnes Garn', kategori: 'sport', fiber: ['alpakka'], meterPer50g: 110, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Ren alpakka, mykt' },
    { id: 'sg-babyull-lanett', navn: 'Babyull Lanett', merke: 'Sandnes Garn', kategori: 'fingering', fiber: ['merinoull'], meterPer50g: 175, pinne: [2.5, 3], maskerPer10cm: 27, info: 'Superwash, perfekt til barn' },
    { id: 'sg-double-sunday', navn: 'Double Sunday', merke: 'Sandnes Garn', kategori: 'sport', fiber: ['merinoull'], meterPer50g: 108, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Populært genser-garn' },
    { id: 'sg-tynn-silk-mohair', navn: 'Tynn Silk Mohair', merke: 'Sandnes Garn', kategori: 'fingering', fiber: ['mohair', 'silke'], meterPer50g: 212, pinne: [3, 4], maskerPer10cm: 25, info: 'Brukes ofte dobbelt eller med annet garn' },
    { id: 'sg-duo', navn: 'Duo', merke: 'Sandnes Garn', kategori: 'aran', fiber: ['ull', 'bomull'], meterPer50g: 65, pinne: [4.5, 5.5], maskerPer10cm: 18, info: 'Ull/bomull-blanding' },
    { id: 'sg-mandarin-petit', navn: 'Mandarin Petit', merke: 'Sandnes Garn', kategori: 'sport', fiber: ['bomull'], meterPer50g: 150, pinne: [3, 3.5], maskerPer10cm: 24, info: 'Ren bomull, sommergarn' },
    { id: 'sg-line', navn: 'Line', merke: 'Sandnes Garn', kategori: 'sport', fiber: ['bomull', 'lin'], meterPer50g: 100, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Bomull/lin, sommerplagg' },
    { id: 'sg-kos', navn: 'KOS', merke: 'Sandnes Garn', kategori: 'aran', fiber: ['alpakka', 'ull', 'mohair'], meterPer50g: 85, pinne: [4.5, 5.5], maskerPer10cm: 17, info: 'Luftig og varmt' },
    // DROPS
    { id: 'dr-karisma', navn: 'Karisma', merke: 'DROPS', kategori: 'sport', fiber: ['ull'], meterPer50g: 100, pinne: [4, 4.5], maskerPer10cm: 21, info: 'Superwash, mange farger' },
    { id: 'dr-merino-extra-fine', navn: 'Merino Extra Fine', merke: 'DROPS', kategori: 'sport', fiber: ['merinoull'], meterPer50g: 105, pinne: [3.5, 4], maskerPer10cm: 21, info: 'Superwash merino' },
    { id: 'dr-nepal', navn: 'Nepal', merke: 'DROPS', kategori: 'aran', fiber: ['ull'], meterPer50g: 75, pinne: [5, 5.5], maskerPer10cm: 17, info: 'Tykt, varmt, feltbart' },
    { id: 'dr-alpaca', navn: 'Alpaca', merke: 'DROPS', kategori: 'sport', fiber: ['alpakka'], meterPer50g: 167, pinne: [3.5, 4], maskerPer10cm: 23, info: 'Lett alpakka' },
    { id: 'dr-baby-merino', navn: 'Baby Merino', merke: 'DROPS', kategori: 'sport', fiber: ['merinoull'], meterPer50g: 175, pinne: [3, 3.5], maskerPer10cm: 24, info: 'Superwash, baby-mykt' },
    { id: 'dr-fabel', navn: 'Fabel', merke: 'DROPS', kategori: 'fingering', fiber: ['ull'], meterPer50g: 205, pinne: [2.5, 3], maskerPer10cm: 26, info: 'Sokkegarn, superwash' },
    { id: 'dr-air', navn: 'Air', merke: 'DROPS', kategori: 'bulky', fiber: ['alpakka', 'ull'], meterPer50g: 68, pinne: [6, 7], maskerPer10cm: 13, info: 'Lett og luftig, tykt garn' },
    { id: 'dr-andes', navn: 'Andes', merke: 'DROPS', kategori: 'bulky', fiber: ['ull', 'alpakka'], meterPer50g: 48, pinne: [6, 7], maskerPer10cm: 13, info: 'Veldig tykt og varmt' },
    { id: 'dr-cotton-merino', navn: 'Cotton Merino', merke: 'DROPS', kategori: 'sport', fiber: ['bomull', 'merinoull'], meterPer50g: 110, pinne: [3.5, 4], maskerPer10cm: 21, info: 'Bomull/merino-blanding' },
    { id: 'dr-muskat', navn: 'Muskat', merke: 'DROPS', kategori: 'sport', fiber: ['bomull'], meterPer50g: 100, pinne: [3.5, 4], maskerPer10cm: 20, info: 'Ren mercerisert bomull' },
    { id: 'dr-kid-silk', navn: 'Kid-Silk', merke: 'DROPS', kategori: 'fingering', fiber: ['mohair', 'silke'], meterPer50g: 200, pinne: [3, 4.5], maskerPer10cm: 24, info: 'Mohair/silke, luftig' },
    // Rauma
    { id: 'ra-finull', navn: 'Finull', merke: 'Rauma', kategori: 'fingering', fiber: ['ull'], meterPer50g: 175, pinne: [2.5, 3], maskerPer10cm: 27, info: 'Tradisjonell norsk ull' },
    { id: 'ra-strikkegarn', navn: 'Strikkegarn 3-tråds', merke: 'Rauma', kategori: 'sport', fiber: ['ull'], meterPer50g: 105, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Klassisk norsk strikkegarn' },
    { id: 'ra-vamsegarn', navn: 'Vamsegarn', merke: 'Rauma', kategori: 'aran', fiber: ['ull'], meterPer50g: 80, pinne: [4.5, 5], maskerPer10cm: 18, info: 'Tykt, for vamser og kofter' },
    { id: 'ra-plötulopi', navn: 'Plötulopi', merke: 'Rauma', kategori: 'bulky', fiber: ['ull'], meterPer50g: 100, pinne: [6, 8], maskerPer10cm: 12, info: 'Islandsk ull, strikkes dobbelt' },
    // Gjestal
    { id: 'gj-janus', navn: 'Janus', merke: 'Gjestal', kategori: 'sport', fiber: ['ull'], meterPer50g: 100, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Superwash, norsk ull' },
    { id: 'gj-vestlandsull', navn: 'Vestlandsull', merke: 'Gjestal', kategori: 'aran', fiber: ['ull'], meterPer50g: 75, pinne: [4.5, 5.5], maskerPer10cm: 17, info: 'Norsk ull, tradisjonell' },
    // Du Store Alpakka
    { id: 'dsa-sterk', navn: 'Sterk', merke: 'Du Store Alpakka', kategori: 'sport', fiber: ['merinoull', 'alpakka'], meterPer50g: 150, pinne: [3, 3.5], maskerPer10cm: 24, info: 'Merino/alpakka, superwash' },
    { id: 'dsa-dreamline', navn: 'Dreamline Sky', merke: 'Du Store Alpakka', kategori: 'sport', fiber: ['alpakka', 'merinoull', 'nylon'], meterPer50g: 112, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Myk alpakka-blanding' },
    // Hillesvåg
    { id: 'hv-tinde', navn: 'Tinde', merke: 'Hillesvåg', kategori: 'sport', fiber: ['ull'], meterPer50g: 100, pinne: [3.5, 4], maskerPer10cm: 22, info: 'Pelsull, norsk' },
    { id: 'hv-vilje', navn: 'Vilje', merke: 'Hillesvåg', kategori: 'fingering', fiber: ['ull'], meterPer50g: 175, pinne: [2.5, 3], maskerPer10cm: 27, info: 'Norsk pelsull, holdbart' },
    // Viking
    { id: 'vi-nordlys', navn: 'Nordlys', merke: 'Viking', kategori: 'fingering', fiber: ['ull'], meterPer50g: 210, pinne: [2.5, 3], maskerPer10cm: 28, info: 'Sokkegarn, selvmønstrende' },
    { id: 'vi-sportsragg', navn: 'Sportsragg', merke: 'Viking', kategori: 'fingering', fiber: ['ull', 'akryl'], meterPer50g: 175, pinne: [3, 3.5], maskerPer10cm: 26, info: 'Slitesterkt sokkegarn' },
    // Schachenmayr
    { id: 'sm-bravo', navn: 'Bravo', merke: 'Schachenmayr', kategori: 'sport', fiber: ['akryl'], meterPer50g: 133, pinne: [3, 4], maskerPer10cm: 22, info: 'Akryl, maskinvaskbar' },
    { id: 'sm-regia', navn: 'Regia 4-tråds', merke: 'Schachenmayr', kategori: 'fingering', fiber: ['ull', 'nylon'], meterPer50g: 210, pinne: [2.5, 3], maskerPer10cm: 30, info: 'Populært sokkegarn' },
    // Lana Grossa
    { id: 'lg-cool-wool', navn: 'Cool Wool', merke: 'Lana Grossa', kategori: 'sport', fiber: ['merinoull'], meterPer50g: 160, pinne: [3, 3.5], maskerPer10cm: 24, info: 'Superwash merino' },
    // Malabrigo
    { id: 'mb-rios', navn: 'Rios', merke: 'Malabrigo', kategori: 'aran', fiber: ['merinoull'], meterPer50g: 96, pinne: [4.5, 5], maskerPer10cm: 18, info: 'Superwash, håndfarget' },
    { id: 'mb-mechita', navn: 'Mechita', merke: 'Malabrigo', kategori: 'fingering', fiber: ['merinoull'], meterPer50g: 175, pinne: [2.5, 3.5], maskerPer10cm: 26, info: 'Superwash, singles' },
];

// --- Garnalternativ ---
function byggGarnVelger() {
    const select = document.getElementById('garnVelger');
    const merker = {};
    for (const g of GARN_DATABASE) {
        if (!merker[g.merke]) merker[g.merke] = [];
        merker[g.merke].push(g);
    }
    for (const merke of Object.keys(merker).sort()) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = merke;
        for (const g of merker[merke]) {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = `${g.navn} (${g.kategori}, ${g.meterPer50g} m/50g)`;
            optgroup.appendChild(opt);
        }
        select.appendChild(optgroup);
    }
}

function finnGarn(id) {
    return GARN_DATABASE.find(g => g.id === id);
}

function matchGarn(kilde) {
    const resultater = [];
    for (const g of GARN_DATABASE) {
        if (g.id === kilde.id) continue;
        if (g.kategori !== kilde.kategori) continue;

        let score = 0;

        // Meterdiff (maks 40 poeng)
        const meterDiff = Math.abs(g.meterPer50g - kilde.meterPer50g);
        score += Math.max(0, 40 - meterDiff * 0.8);

        // Fiberoverlapp (15 poeng per match)
        const felles = g.fiber.filter(f => kilde.fiber.includes(f));
        score += felles.length * 15;

        // Fasthetsdiff (maks 20 poeng)
        const fastDiff = Math.abs(g.maskerPer10cm - kilde.maskerPer10cm);
        score += Math.max(0, 20 - fastDiff * 5);

        // Pinnediff (maks 10 poeng)
        const pinneDiff = Math.abs(g.pinne[0] - kilde.pinne[0]);
        score += Math.max(0, 10 - pinneDiff * 4);

        if (score >= 20) {
            resultater.push({ garn: g, score });
        }
    }
    resultater.sort((a, b) => b.score - a.score);
    return resultater.slice(0, 8);
}

function matchGarnManuell(kategori, fiber, meterPer50g) {
    const kilde = { id: '', kategori, fiber: [fiber], meterPer50g, maskerPer10cm: 0, pinne: [0, 0] };

    // Estimer fasthet og pinne fra kategori
    if (kategori === 'fingering') { kilde.maskerPer10cm = 27; kilde.pinne = [2.5, 3.5]; }
    else if (kategori === 'sport') { kilde.maskerPer10cm = 22; kilde.pinne = [3.5, 4]; }
    else if (kategori === 'aran') { kilde.maskerPer10cm = 18; kilde.pinne = [4.5, 5.5]; }
    else if (kategori === 'bulky') { kilde.maskerPer10cm = 13; kilde.pinne = [6, 8]; }

    return matchGarn(kilde);
}

function matchKvalitet(score) {
    if (score >= 60) return { klasse: 'match-god', tekst: 'Godt alternativ' };
    if (score >= 40) return { klasse: 'match-ok', tekst: 'OK alternativ' };
    return { klasse: 'match-mulig', tekst: 'Mulig alternativ' };
}

function lagGarnKort(match, kildeGarn, antallNoster) {
    const g = match.garn;
    const kval = matchKvalitet(match.score);

    let html = `<div class="garn-kort ${kval.klasse}">`;
    html += `<div class="garn-kort-header">`;
    html += `<strong>${g.merke} ${g.navn}</strong>`;
    html += `<span class="match-badge">${kval.tekst}</span>`;
    html += `</div>`;
    html += `<div class="garn-kort-detaljer">`;
    html += `<span class="garn-egenskap">${g.meterPer50g} m/50g</span>`;
    html += `<span class="garn-egenskap">Pinne ${g.pinne[0]}–${g.pinne[1]}</span>`;
    html += `<span class="garn-egenskap">${g.fiber.join(', ')}</span>`;
    html += `<span class="garn-egenskap">${g.maskerPer10cm} m/10cm</span>`;
    html += `</div>`;

    // Tips
    const tips = [];
    if (kildeGarn && antallNoster && kildeGarn.meterPer50g !== g.meterPer50g) {
        const totalMeter = antallNoster * kildeGarn.meterPer50g;
        const nyeNoster = Math.ceil(totalMeter / g.meterPer50g);
        tips.push(`Du trenger ca. <strong>${nyeNoster} nøster</strong> (${totalMeter} m totalt)`);
    }
    if (kildeGarn) {
        const fastDiff = Math.abs(g.maskerPer10cm - kildeGarn.maskerPer10cm);
        if (fastDiff >= 2) tips.push('Strikk en prøvelapp! Fastheten kan avvike.');
        const harFellesFiber = g.fiber.some(f => kildeGarn.fiber.includes(f));
        if (!harFellesFiber) tips.push('Annen fibertype — kan gi annet utseende og følelse.');
    }
    if (g.info) tips.push(g.info);

    if (tips.length > 0) {
        html += `<div class="garn-kort-tips">`;
        for (const tip of tips) html += `<p>${tip}</p>`;
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

// Bygg dropdown ved oppstart
byggGarnVelger();

// Mode toggle
document.getElementById('garnaltModus').addEventListener('change', (e) => {
    const mode = e.target.value;
    document.getElementById('garnaltListe').classList.toggle('hidden', mode !== 'liste');
    document.getElementById('garnaltManuell').classList.toggle('hidden', mode !== 'manuell');
});

// Beregn-knapp
document.getElementById('beregnGarnalt').addEventListener('click', () => {
    const resultat = document.getElementById('garnaltResultat');
    const antallNoster = parseInt(document.getElementById('antallNoster').value) || 0;
    const erListeModus = document.getElementById('garnaltModus').value === 'liste';

    let treff = [];
    let kildeGarn = null;

    if (erListeModus) {
        const valgtId = document.getElementById('garnVelger').value;
        if (!valgtId) {
            visResultat(resultat, '<p class="error">Velg et garn fra listen.</p>');
            return;
        }
        kildeGarn = finnGarn(valgtId);
        treff = matchGarn(kildeGarn);
    } else {
        const kategori = document.getElementById('manuellKategori').value;
        const fiber = document.getElementById('manuellFiber').value;
        const meter = parseInt(document.getElementById('manuellMeter').value);

        if (!kategori) {
            visResultat(resultat, '<p class="error">Velg garntykkelse.</p>');
            return;
        }
        if (!fiber) {
            visResultat(resultat, '<p class="error">Velg fibertype.</p>');
            return;
        }
        if (!meter) {
            visResultat(resultat, '<p class="error">Fyll inn meter per 50g.</p>');
            return;
        }
        kildeGarn = { fiber: [fiber], meterPer50g: meter, maskerPer10cm: 0 };
        if (kategori === 'fingering') kildeGarn.maskerPer10cm = 27;
        else if (kategori === 'sport') kildeGarn.maskerPer10cm = 22;
        else if (kategori === 'aran') kildeGarn.maskerPer10cm = 18;
        else if (kategori === 'bulky') kildeGarn.maskerPer10cm = 13;
        treff = matchGarnManuell(kategori, fiber, meter);
    }

    if (treff.length === 0) {
        visResultat(resultat, '<h3>Ingen treff</h3><p>Fant ingen gode alternativer i databasen. Prøv å justere søket.</p>');
        return;
    }

    let html = `<h3>Fant ${treff.length} alternativ${treff.length > 1 ? 'er' : ''}</h3>`;
    for (const m of treff) {
        html += lagGarnKort(m, kildeGarn, antallNoster);
    }
    visResultat(resultat, html);
});

// --- Strikkeekspert ---
let kunnskapsbase = [];
fetch('./strikketips.json')
    .then(r => r.json())
    .then(data => {
        kunnskapsbase = data;
        visHurtigvalg(standardHurtigvalg);
    })
    .catch(() => {
        kunnskapsbase = [];
        visHurtigvalg(standardHurtigvalg);
        leggTilMelding('Kunne ikke laste strikketips akkurat nå. Prøv igjen senere.', 'bot');
    });

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatQuickReplies = document.getElementById('chatQuickReplies');

const standardHurtigvalg = [
    'Masker og teknikk', 'Prosjekter', 'Garnvalg',
    'Forkortelser', 'Lenker'
];

// Tilstandsmaskin for oppfølging
let samtaleTilstand = { ventePå: null, kildeId: null, valg: null };

// Levenshtein-avstand for fuzzy matching
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + cost
            );
        }
    }
    return d[m][n];
}

function leggTilMelding(tekst, type) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-${type}`;
    bubble.innerHTML = tekst;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function finnSvar(input) {
    const ord = input.toLowerCase().trim();
    if (!ord || kunnskapsbase.length === 0) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const tema of kunnskapsbase) {
        let score = 0;

        // 1. Regex-match
        if (tema.regex) {
            for (const mønster of tema.regex) {
                try {
                    const re = new RegExp(mønster, 'i');
                    if (re.test(ord)) score += 10;
                } catch (e) {}
            }
        }

        // 2. Eksakt nøkkelord-match
        for (const nøkkel of tema.nøkkelord) {
            if (ord.includes(nøkkel)) {
                score += nøkkel.length;
            }
        }

        // 3. Fuzzy matching (fallback)
        if (score === 0) {
            const inputOrd = ord.split(/\s+/);
            for (const iOrd of inputOrd) {
                if (iOrd.length < 4) continue;
                for (const nøkkel of tema.nøkkelord) {
                    const nøkkelOrd = nøkkel.split(/\s+/);
                    for (const nOrd of nøkkelOrd) {
                        if (nOrd.length < 4) continue;
                        const avstand = levenshtein(iOrd, nOrd);
                        const terskel = nOrd.length >= 7 ? 2 : 1;
                        if (avstand <= terskel && avstand > 0) {
                            score += 5;
                        }
                    }
                }
            }
        }

        if (score > bestScore && score >= 3) {
            bestScore = score;
            bestMatch = tema;
        }
    }

    return bestMatch;
}

function finnEmneMedId(id) {
    return kunnskapsbase.find(t => t.id === id) || null;
}

function lagYouTubeLenke(søk) {
    const query = encodeURIComponent('strikking ' + søk);
    return `<a class="youtube-link" href="https://www.youtube.com/results?search_query=${query}" target="_blank">Søk på YouTube</a>`;
}

function visHurtigvalg(valg) {
    chatQuickReplies.innerHTML = '';
    if (!valg || valg.length === 0) return;
    for (const v of valg) {
        const tekst = typeof v === 'string' ? v : v.tekst;
        const btn = document.createElement('button');
        btn.className = 'chat-quick-btn';
        btn.textContent = tekst;
        btn.addEventListener('click', () => {
            chatInput.value = tekst;
            håndterSpørsmål();
        });
        chatQuickReplies.appendChild(btn);
    }
}

function håndterSpørsmål() {
    const spørsmål = chatInput.value.trim();
    if (!spørsmål) return;

    leggTilMelding(spørsmål, 'user');
    chatInput.value = '';
    chatQuickReplies.innerHTML = '';

    // Sjekk tilstandsmaskin — venter vi på oppfølgingssvar?
    if (samtaleTilstand.ventePå && samtaleTilstand.valg) {
        const inputLower = spørsmål.toLowerCase();
        for (const v of samtaleTilstand.valg) {
            if (inputLower.includes(v.tekst.toLowerCase()) || levenshtein(inputLower, v.tekst.toLowerCase()) <= 2) {
                const mål = finnEmneMedId(v.målId);
                samtaleTilstand = { ventePå: null, kildeId: null, valg: null };
                if (mål) {
                    leggTilMelding(mål.svar + '<br>' + lagYouTubeLenke(v.tekst), 'bot');
                    if (mål.oppfølging) {
                        leggTilMelding(mål.oppfølging.spørsmål, 'bot');
                        samtaleTilstand = { ventePå: mål.id, kildeId: mål.id, valg: mål.oppfølging.valg };
                        visHurtigvalg(mål.oppfølging.valg);
                    } else {
                        visHurtigvalg(mål.hurtigvalg || standardHurtigvalg);
                    }
                    return;
                }
            }
        }
        // Ingen match på oppfølging — nullstill og søk normalt
        samtaleTilstand = { ventePå: null, kildeId: null, valg: null };
    }

    const match = finnSvar(spørsmål);

    if (match) {
        leggTilMelding(match.svar + '<br>' + lagYouTubeLenke(spørsmål), 'bot');

        if (match.oppfølging) {
            leggTilMelding(match.oppfølging.spørsmål, 'bot');
            samtaleTilstand = { ventePå: match.id, kildeId: match.id, valg: match.oppfølging.valg };
            visHurtigvalg(match.oppfølging.valg);
        } else {
            visHurtigvalg(match.hurtigvalg || standardHurtigvalg);
        }
    } else {
        leggTilMelding(
            'Det har jeg ikke svar på ennå, men prøv å søke her:'
            + '<br>' + lagYouTubeLenke(spørsmål)
            + '<br><br>Eller velg et emne nedenfor:',
            'bot'
        );
        visHurtigvalg(standardHurtigvalg);
    }
}

chatSend.addEventListener('click', håndterSpørsmål);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') håndterSpørsmål();
});
