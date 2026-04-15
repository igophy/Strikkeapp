// Inges strikkehjelp - app.js
const APP_VERSION = '1.8.1';

// --- Tema (lys / mørk / auto) ---
const THEME_MODE_KEY = 'inges-strikkehjelp-theme-mode';
const versionText = document.getElementById('versionText');
const whatsNewTitle = document.getElementById('whatsNewTitle');
const settingsVersionPill = document.getElementById('settingsVersionPill');
const openWhatsNewSettingsBtn = document.getElementById('openWhatsNewSettings');
const openInstallGuideBtn = document.getElementById('openInstallGuide');
const themeHelp = document.getElementById('themeModeHelp');
const themeButtons = document.querySelectorAll('.theme-option');
const systemDarkMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

if (versionText) versionText.textContent = `v${APP_VERSION}`;
if (whatsNewTitle) whatsNewTitle.textContent = `Nytt i v${APP_VERSION}`;
if (settingsVersionPill) settingsVersionPill.textContent = `v${APP_VERSION}`;

function hentLagretTema() {
    const lagret = localStorage.getItem(THEME_MODE_KEY);
    return ['light', 'dark', 'auto'].includes(lagret) ? lagret : 'auto';
}

function faktiskTema(modus) {
    if (modus === 'dark') return 'dark';
    if (modus === 'light') return 'light';
    return systemDarkMedia && systemDarkMedia.matches ? 'dark' : 'light';
}

function oppdaterThemeKnappStatus(modus) {
    themeButtons.forEach(btn => {
        const aktiv = btn.dataset.themeChoice === modus;
        btn.classList.toggle('active', aktiv);
        btn.setAttribute('aria-pressed', aktiv ? 'true' : 'false');
    });

    if (themeHelp) {
        themeHelp.textContent = modus === 'auto'
            ? 'Auto følger innstillingen på mobilen din.'
            : modus === 'dark'
                ? 'Mørk modus er låst på til du endrer det igjen.'
                : 'Lys modus er låst på til du endrer det igjen.';
    }
}

function anvendTema(modus, lagre = true) {
    const valgtModus = ['light', 'dark', 'auto'].includes(modus) ? modus : 'auto';
    const aktivtTema = faktiskTema(valgtModus);

    document.body.classList.toggle('dark', aktivtTema === 'dark');
    document.documentElement.setAttribute('data-theme-mode', valgtModus);

    const themeColor = aktivtTema === 'dark' ? '#120f0e' : '#6f4336';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);

    oppdaterThemeKnappStatus(valgtModus);
    if (lagre) localStorage.setItem(THEME_MODE_KEY, valgtModus);
}

const valgtTemaVedStart = hentLagretTema();
anvendTema(valgtTemaVedStart, false);

if (systemDarkMedia) {
    const handleSystemThemeChange = () => {
        if (hentLagretTema() === 'auto') anvendTema('auto', false);
    };
    if (typeof systemDarkMedia.addEventListener === 'function') {
        systemDarkMedia.addEventListener('change', handleSystemThemeChange);
    } else if (typeof systemDarkMedia.addListener === 'function') {
        systemDarkMedia.addListener(handleSystemThemeChange);
    }
}

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        vibrer(8);
        anvendTema(btn.dataset.themeChoice);
    });
});

function vibrer(ms = 10) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

// --- Hva er nytt ---
const VERSION_KEY = 'inges-strikkehjelp-sett-versjon';
const whatsNew = document.getElementById('whatsNewOverlay');
const settVersjon = localStorage.getItem(VERSION_KEY);

if (settVersjon !== APP_VERSION) {
    whatsNew.classList.remove('hidden');
}

function apneWhatsNew() {
    whatsNew.classList.remove('hidden');
}

function lukkWhatsNew() {
    whatsNew.classList.add('hidden');
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    window.setTimeout(visInstallGuideOmNodvendig, 250);
}

document.getElementById('closeWhatsNew').addEventListener('click', lukkWhatsNew);
if (openWhatsNewSettingsBtn) {
    openWhatsNewSettingsBtn.addEventListener('click', () => {
        vibrer(8);
        apneWhatsNew();
    });
}
whatsNew.addEventListener('click', (e) => {
    if (e.target === whatsNew) lukkWhatsNew();
});

// --- Førstegangs-guide for installasjon ---
const INSTALL_GUIDE_SEEN_KEY = 'inges-strikkehjelp-installguide-seen';
const installGuideOverlay = document.getElementById('installGuideOverlay');
const installGuideSteps = document.getElementById('installGuideSteps');
const installGuideTip = document.getElementById('installGuideTip');
const installGuideClose = document.getElementById('installGuideClose');
const installGuideNever = document.getElementById('installGuideNever');

function erStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function erIOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function byggInstallGuide() {
    if (!installGuideSteps || !installGuideTip) return;

    const steps = erIOS()
        ? [
            'Åpne appen i Safari.',
            'Trykk på Del-knappen nederst eller øverst i Safari.',
            'Velg «Legg til på Hjem-skjerm».',
            'Trykk «Legg til».'
        ]
        : [
            'Åpne menyen i nettleseren.',
            'Velg «Installer app» eller «Legg til på startsiden».',
            'Bekreft valget for å få appikon på mobilen.'
        ];

    installGuideSteps.innerHTML = steps
        .map((step, index) => `<div class="install-step"><span class="install-step-number">${index + 1}</span><p>${step}</p></div>`)
        .join('');

    installGuideTip.textContent = erIOS()
        ? 'Tips: Etter at appen er lagt til på Hjem-skjerm, åpnes den som en egen app uten nettleserfelt.'
        : 'Tips: Når appen er installert, får du eget ikon og raskere tilgang fra hjemskjermen.';
}

function visInstallGuideOmNodvendig() {
    if (!installGuideOverlay) return;
    if (erStandalone()) return;
    if (localStorage.getItem(INSTALL_GUIDE_SEEN_KEY) === 'dismissed') return;
    if (whatsNew && !whatsNew.classList.contains('hidden')) return;

    byggInstallGuide();
    installGuideOverlay.classList.remove('hidden');
    installGuideOverlay.setAttribute('aria-hidden', 'false');
    localStorage.setItem(INSTALL_GUIDE_SEEN_KEY, 'shown');
}

function lukkInstallGuide(permanent = false) {
    if (!installGuideOverlay) return;
    installGuideOverlay.classList.add('hidden');
    installGuideOverlay.setAttribute('aria-hidden', 'true');
    localStorage.setItem(INSTALL_GUIDE_SEEN_KEY, permanent ? 'dismissed' : 'seen');
}

if (installGuideClose) {
    installGuideClose.addEventListener('click', () => {
        vibrer(8);
        lukkInstallGuide(false);
    });
}

if (installGuideNever) {
    installGuideNever.addEventListener('click', () => {
        vibrer(8);
        lukkInstallGuide(true);
    });
}

if (openInstallGuideBtn) {
    openInstallGuideBtn.addEventListener('click', () => {
        vibrer(8);
        localStorage.removeItem(INSTALL_GUIDE_SEEN_KEY);
        byggInstallGuide();
        installGuideOverlay.classList.remove('hidden');
        installGuideOverlay.setAttribute('aria-hidden', 'false');
    });
}

if (installGuideOverlay) {
    installGuideOverlay.addEventListener('click', (e) => {
        if (e.target === installGuideOverlay) lukkInstallGuide(false);
    });

    window.addEventListener('load', () => {
        window.setTimeout(visInstallGuideOmNodvendig, 700);
    });
}



// --- Side-navigasjon (fliser) ---
const allPages = document.querySelectorAll('.page');
const RESETTABLE_PAGES = new Set(['oykning', 'felling', 'fasthet', 'garn', 'garnalternativ', 'ekspert']);
let aktivSide = document.querySelector('.page.active')?.id || 'hjem';

function resetStandardPage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    page.querySelectorAll('input').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = input.defaultChecked;
        } else {
            input.value = '';
        }
        delete input.dataset.selectedId;
    });

    page.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });

    page.querySelectorAll('.result').forEach(result => {
        result.classList.add('hidden');
        result.innerHTML = '';
    });
}

function resetGarnAlternativPage() {
    const resetButton = document.getElementById('nullstillGarnalt');
    if (resetButton) {
        resetButton.click();
        return;
    }
    resetStandardPage('garnalternativ');
}

function resetEkspertPage() {
    if (typeof nullstillChat === 'function') {
        nullstillChat();
    }
}

function resetPageState(pageId) {
    if (!RESETTABLE_PAGES.has(pageId)) return;
    if (pageId === 'garnalternativ') {
        resetGarnAlternativPage();
        return;
    }
    if (pageId === 'ekspert') {
        resetEkspertPage();
        return;
    }
    resetStandardPage(pageId);
}

function visSide(id) {
    const side = document.getElementById(id);
    if (!side) return;

    if (id === 'hjem' && aktivSide && aktivSide !== 'hjem') {
        resetPageState(aktivSide);
    }

    allPages.forEach(p => p.classList.remove('active'));
    side.classList.add('active');
    aktivSide = id;

    document.querySelectorAll('.tile').forEach(tile => {
        const aktiv = tile.dataset.page === id;
        tile.setAttribute('aria-current', aktiv ? 'page' : 'false');
    });

    window.scrollTo(0, 0);
}

document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
        vibrer(10);
        visSide(tile.dataset.page);
    });
});

document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        vibrer(8);
        visSide(btn.dataset.page);
    });
});

visSide('hjem');

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
    const value = Number.parseFloat(document.getElementById(id).value);
    return Number.isFinite(value) && value > 0 ? value : null;
}

const counters = hentTellere();
document.getElementById('masker').textContent = counters.masker;
document.getElementById('rader').textContent = counters.rader;

document.querySelectorAll('.btn-counter').forEach(btn => {
    btn.addEventListener('click', () => {
        vibrer(8);
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
    vibrer(12);
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
    vibrer(10);
    const start = hentPositivtTall('oykningStart');
    const mal = hentPositivtTall('oykningMal');
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
    vibrer(10);
    const start = hentPositivtTall('fellingStart');
    const mal = hentPositivtTall('fellingMal');
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
    vibrer(10);
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
    vibrer(10);
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

// --- Garndatabase v2 ---
const GARN_DATABASE = Array.isArray(window.YARN_DATABASE) ? window.YARN_DATABASE : [];

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9æøå\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function getFiberKeys(yarn) {
    return Object.keys(yarn.fibers || {});
}

function fiberLabel(fiber) {
    const labels = {
        wool: 'ull',
        merino: 'merino',
        alpaca: 'alpakka',
        mohair: 'mohair',
        silk: 'silke',
        cotton: 'bomull',
        linen: 'lin',
        viscose: 'viskose',
        bamboo: 'bambus',
        polyamide: 'polyamid',
        nylon: 'nylon',
        acrylic: 'akryl',
        polyester: 'polyester'
    };
    return labels[fiber] || fiber;
}

function prettifyBestFor(tag) {
    const labels = {
        sweaters: 'gensere',
        cardigans: 'jakker',
        kids: 'barn',
        baby: 'baby',
        socks: 'sokker',
        colorwork: 'fargestrikk',
        texture: 'strukturstrikk',
        tops: 'topper',
        summer: 'sommerplagg',
        cozy: 'varme plagg',
        lightweight: 'lette plagg',
        everyday: 'hverdagsplagg',
        traditional: 'tradisjonelle plagg',
        outerwear: 'ytterplagg',
        home: 'interiør',
        shawls: 'sjal',
        heldTogether: 'følgetråd'
    };
    return labels[tag] || tag;
}

function needleText(yarn) {
    if (!yarn.needle || yarn.needle.length < 2) return '–';
    return yarn.needle[0] === yarn.needle[1] ? `${yarn.needle[0]} mm` : `${yarn.needle[0]}–${yarn.needle[1]} mm`;
}

function buildSearchIndex(yarn) {
    return slugify([
        yarn.name,
        yarn.brand,
        ...(yarn.aliases || []),
        ...getFiberKeys(yarn).map(fiberLabel)
    ].join(' '));
}

function tokenizeQuery(query) {
    return slugify(query).split(' ').filter(Boolean);
}

function prettyStructureLabel(structure) {
    const labels = {
        plied: 'flertrådet',
        blown: 'blown yarn',
        brushed: 'børstet',
        single: 'entrådet',
        chainette: 'chainette'
    };
    return labels[structure] || structure;
}

const FILTER_IDS = [
    'filterOnlyNorway',
    'filterNaturalOnly',
    'filterAvoidMohair',
    'filterAvoidAlpaca',
    'filterSuperwash',
    'filterLessFluffy',
    'filterSofter',
    'filterSummer',
    'filterBaby',
    'filterSameExpression'
];

function getSelectedFilters() {
    return {
        onlyNorway: document.getElementById('filterOnlyNorway').checked,
        naturalOnly: document.getElementById('filterNaturalOnly').checked,
        avoidMohair: document.getElementById('filterAvoidMohair').checked,
        avoidAlpaca: document.getElementById('filterAvoidAlpaca').checked,
        superwash: document.getElementById('filterSuperwash').checked,
        lessFluffy: document.getElementById('filterLessFluffy').checked,
        softer: document.getElementById('filterSofter').checked,
        summer: document.getElementById('filterSummer').checked,
        baby: document.getElementById('filterBaby').checked,
        sameExpression: document.getElementById('filterSameExpression').checked,
    };
}

function isNaturalFiber(fiber) {
    return ['wool', 'merino', 'alpaca', 'mohair', 'silk', 'cotton', 'linen', 'viscose', 'bamboo'].includes(fiber);
}

function passesHardFilters(yarn, filters) {
    const fibers = getFiberKeys(yarn);
    if (filters.onlyNorway && yarn.availableInNorway === false) return false;
    if (filters.naturalOnly && fibers.some(f => !isNaturalFiber(f))) return false;
    if (filters.avoidMohair && fibers.includes('mohair')) return false;
    if (filters.avoidAlpaca && fibers.includes('alpaca')) return false;
    if (filters.superwash && !yarn.superwash) return false;
    if (filters.summer && !yarn.bestFor?.includes('summer') && yarn.warmth > 2) return false;
    if (filters.baby && !yarn.bestFor?.includes('baby') && yarn.softness < 4) return false;
    return true;
}

function metricScore(diff, maxDiff, weight) {
    const ratio = Math.min(diff / maxDiff, 1);
    return Math.max(0, weight * (1 - ratio));
}

function categoryDistance(a, b) {
    const order = ['lace', 'fingering', 'sport', 'dk', 'aran', 'bulky', 'super_bulky'];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 || bi === -1) return 1;
    return Math.abs(ai - bi);
}


function fiberSimilarity(a, b) {
    const aKeys = getFiberKeys(a);
    const bKeys = getFiberKeys(b);
    if (!aKeys.length || !bKeys.length) return 0;
    let overlap = 0;
    for (const key of aKeys) {
        if (bKeys.includes(key)) overlap += Math.min(a.fibers[key] || 0, b.fibers[key] || 0);
    }
    return Math.min(overlap / 100, 1);
}

function fiberFamily(key) {
    if (['wool', 'merino', 'alpaca', 'mohair', 'silk'].includes(key)) return 'animal';
    if (['cotton', 'linen', 'viscose', 'bamboo'].includes(key)) return 'plant';
    return 'synthetic';
}

function fiberFamilySimilarity(a, b) {
    const aFamilies = new Set(getFiberKeys(a).map(fiberFamily));
    const bFamilies = new Set(getFiberKeys(b).map(fiberFamily));
    if (!aFamilies.size || !bFamilies.size) return 0;
    let overlap = 0;
    for (const family of aFamilies) if (bFamilies.has(family)) overlap += 1;
    return overlap / Math.max(aFamilies.size, bFamilies.size);
}

function metersPer100g(yarn) {
    if (!yarn?.metersPerSkein || !yarn?.gramsPerSkein) return 0;
    return (yarn.metersPerSkein / yarn.gramsPerSkein) * 100;
}

function practicalUseSimilarity(a, b) {
    const aa = new Set(a.bestFor || []);
    const bb = new Set(b.bestFor || []);
    if (!aa.size || !bb.size) return 0;
    let overlap = 0;
    for (const val of aa) if (bb.has(val)) overlap += 1;
    return overlap / Math.max(aa.size, bb.size);
}

function expressionSimilarity(a, b) {
    let score = 0;
    if (a.structure === b.structure) score += 0.4;
    else if (a.texture === b.texture) score += 0.2;
    const haloDiff = Math.abs((a.halo || 0) - (b.halo || 0));
    score += Math.max(0, 0.3 - haloDiff * 0.08);
    const firmnessDiff = Math.abs((a.firmness || 0) - (b.firmness || 0));
    score += Math.max(0, 0.15 - firmnessDiff * 0.04);
    const drapeDiff = Math.abs((a.drape || 0) - (b.drape || 0));
    score += Math.max(0, 0.15 - drapeDiff * 0.04);
    return Math.max(0, Math.min(score, 1));
}

function strengthTags(source, candidate, scoreParts) {
    const tags = [];
    if (scoreParts.gauge >= 20) tags.push('Nær strikkefasthet');
    if (scoreParts.meter >= 16) tags.push('Lignende løpelengde');
    if (scoreParts.fiber >= 10 || scoreParts.family >= 4) tags.push('Lignende fiber');
    if (scoreParts.expression >= 9) tags.push('Liknende uttrykk');
    if (scoreParts.use >= 7) tags.push('Passer samme type plagg');
    if (!tags.length) tags.push('Praktisk mulig alternativ');
    return tags.slice(0, 3);
}


function buildWarnings(source, candidate) {
    const warnings = [];
    if (Math.abs(candidate.halo - source.halo) >= 2) {
        if (candidate.halo > source.halo) warnings.push('Mer fluffy enn originalen — uttrykket blir mykere og mindre definert.');
        else warnings.push('Mindre fluffy enn originalen — plagget kan få et fastere uttrykk.');
    }
    if (Math.abs(candidate.drape - source.drape) >= 2) warnings.push('Har et annet fall enn originalen.');
    if (Math.abs(candidate.elasticity - source.elasticity) >= 2) warnings.push('Har en annen elastisitet og kan oppføre seg ulikt i bruk.');
    if (candidate.structure !== source.structure) warnings.push(`Annen konstruksjon (${prettyStructureLabel(candidate.structure)}) enn originalen.`);
    if (candidate.superwash !== source.superwash) warnings.push(source.superwash ? 'Dette er ikke superwash, så det krever litt annen behandling.' : 'Dette er superwash og vil kunne oppføre seg litt annerledes enn ubehandlet ull.');
    const sourceFibers = getFiberKeys(source);
    const candidateFibers = getFiberKeys(candidate);
    if (!candidateFibers.some(f => sourceFibers.includes(f))) warnings.push('Helt annen fibertype enn originalen.');
    return warnings.slice(0, 3);
}

function explainMatch(source, candidate, warnings, scoreParts) {
    const lines = [];
    const gaugeDiff = Math.abs((candidate.gauge || 0) - (source.gauge || 0));
    const meter100Diff = Math.abs(metersPer100g(candidate) - metersPer100g(source));
    if (gaugeDiff <= 1) lines.push('Ligger svært nær originalen i praktisk strikkefasthet.');
    else if (gaugeDiff <= 2) lines.push('Ganske nær strikkefasthet, men prøvelapp anbefales.');
    if (meter100Diff <= 20) lines.push('Har lignende løpelengde i forhold til vekten, så garnforbruket blir ofte mer forutsigbart.');
    if (scoreParts.expression >= 9) lines.push('Gir et uttrykk som ligger tett på originalen i ferdig plagg.');
    else if (candidate.structure === source.structure) lines.push('Har lignende oppbygging og oppfører seg ofte ganske likt i plagget.');
    else lines.push(`Har ${prettyStructureLabel(candidate.structure)} konstruksjon, så uttrykket blir litt annerledes.`);
    if (scoreParts.fiber >= 10) lines.push('Deler mye av samme fiberprofil.');
    else if (scoreParts.family >= 4) lines.push('Ligger i samme fiberfamilie og kan fungere fint praktisk.');
    if (practicalUseSimilarity(source, candidate) >= 0.4) lines.push(`Passer godt til ${prettifyBestFor((candidate.bestFor || [])[0] || 'plagg')}.`);
    if (!lines.length) lines.push('Kan fungere, men skiller seg mer fra originalen enn toppresultatene.');
    if (warnings.length) lines.push('Prøvelapp anbefales før du starter.');
    return lines.slice(0, 4);
}

function calculateYarnNeed(source, candidate, originalSkeins) {
    if (!originalSkeins || !source?.metersPerSkein || !candidate?.metersPerSkein) return null;
    const totalMeters = originalSkeins * source.metersPerSkein;
    const rawSkeins = totalMeters / candidate.metersPerSkein;
    const risk = Math.abs(candidate.halo - source.halo) >= 2 || candidate.structure !== source.structure;
    return {
        totalMeters,
        skeins: Math.ceil(rawSkeins),
        recommendedSkeins: Math.ceil(rawSkeins + (risk ? 0.75 : 0.25)),
        approx: risk
    };
}

function gradeMatch(score) {
    if (score >= 85) return { label: 'Svært godt alternativ', className: 'match-god' };
    if (score >= 70) return { label: 'Godt alternativ', className: 'match-god' };
    if (score >= 55) return { label: 'Brukbart med justering', className: 'match-ok' };
    return { label: 'Mer usikkert valg', className: 'match-mulig' };
}

function scoreCandidate(source, candidate, filters) {
    const scoreParts = {
        gauge: metricScore(Math.abs((candidate.gauge || 0) - (source.gauge || 0)), 6, 25),
        meter: metricScore(Math.abs(metersPer100g(candidate) - metersPer100g(source)), Math.max(metersPer100g(source) * 0.45, 30), 20),
        structure: candidate.structure === source.structure ? 10 : candidate.texture === source.texture ? 6 : 2,
        expression: 10 * expressionSimilarity(source, candidate),
        fiber: 12 * fiberSimilarity(source, candidate),
        family: 5 * fiberFamilySimilarity(source, candidate),
        use: 8 * practicalUseSimilarity(source, candidate),
        halo: metricScore(Math.abs(candidate.halo - source.halo), 5, 4),
        behavior: metricScore((
            Math.abs(candidate.elasticity - source.elasticity) +
            Math.abs(candidate.drape - source.drape) +
            Math.abs(candidate.firmness - source.firmness) +
            Math.abs(candidate.warmth - source.warmth)
        ) / 4, 5, 4),
        needle: metricScore(Math.abs((candidate.needle || [0])[0] - (source.needle || [0])[0]), 3, 2)
    };

    let score = Object.values(scoreParts).reduce((sum, val) => sum + val, 0);
    const dist = categoryDistance(source.weight, candidate.weight);
    if (dist > 1) score -= 14;
    if (dist === 1) score -= 5;
    if (filters.lessFluffy && candidate.halo > source.halo) score -= 8;
    if (filters.softer && candidate.softness >= source.softness) score += 4;
    if (filters.summer && candidate.bestFor?.includes('summer')) score += 4;
    if (filters.baby && candidate.bestFor?.includes('baby')) score += 4;
    if (filters.sameExpression) {
        if (expressionSimilarity(source, candidate) < 0.55) score -= 14;
        else score += 5;
    }
    if (source.superwash !== candidate.superwash) score -= 3;

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, scoreParts };
}

function renderSelectedYarn(yarn) {
    const card = document.getElementById('selectedYarnCard');
    if (!yarn) {
        card.classList.add('hidden');
        card.innerHTML = '';
        return;
    }
    const fibers = getFiberKeys(yarn).map(key => `${fiberLabel(key)} ${yarn.fibers[key]}%`).join(', ');
    const usage = (yarn.bestFor || []).slice(0, 3).map(prettifyBestFor).join(', ');
    card.innerHTML = `
        <div class="selected-yarn-header">
            <div>
                <strong>${yarn.brand} ${yarn.name}</strong>
                <p>${fibers}</p>
            </div>
            <span class="match-badge neutral">${(yarn.weight || '').toUpperCase()}</span>
        </div>
        <div class="garn-kort-detaljer">
            <span class="garn-egenskap">${yarn.metersPerSkein} m / ${yarn.gramsPerSkein} g</span>
            <span class="garn-egenskap">Strikkefasthet ${yarn.gauge} m/10 cm</span>
            <span class="garn-egenskap">Pinne ${needleText(yarn)}</span>
            <span class="garn-egenskap">Best til ${usage || 'mange plagg'}</span>
        </div>
        <p class="selected-yarn-note">${(yarn.notes || [''])[0]}</p>
    `;
    card.classList.remove('hidden');
}

function searchYarns(query) {
    const q = slugify(query);
    const tokens = tokenizeQuery(query);
    if (!q) return [];
    return GARN_DATABASE
        .map(yarn => {
            const haystack = buildSearchIndex(yarn);
            const brandName = slugify(`${yarn.brand} ${yarn.name}`);
            let score = 0;
            if (brandName === q) score += 300;
            if (slugify(yarn.name) === q) score += 220;
            if (haystack.startsWith(q)) score += 150;
            if (brandName.startsWith(q)) score += 120;
            if (haystack.includes(q)) score += 50;
            for (const token of tokens) {
                if (brandName.includes(token)) score += 18;
                if (haystack.includes(token)) score += 10;
            }
            for (const alias of (yarn.aliases || [])) {
                const aliasNorm = slugify(alias);
                if (aliasNorm === q) score += 160;
                if (aliasNorm.startsWith(q)) score += 80;
                if (aliasNorm.includes(q)) score += 20;
            }
            if (slugify(yarn.brand).includes(q)) score += 15;
            if (slugify(yarn.name).includes(q)) score += 30;
            return { yarn, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.yarn.brand.localeCompare(b.yarn.brand) || a.yarn.name.localeCompare(b.yarn.name))
        .slice(0, 10)
        .map(item => item.yarn);
}

function renderSearchResults(results) {
    const box = document.getElementById('garnSearchResults');
    if (!results.length) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
    }
    box.innerHTML = results.map(yarn => `
        <button type="button" class="garn-search-item" data-yarn-id="${yarn.id}">
            <div>
                <strong>${yarn.brand} ${yarn.name}</strong>
                <span>${yarn.metersPerSkein} m / ${yarn.gramsPerSkein} g · ${fiberLabel(getFiberKeys(yarn)[0] || '')}</span>
            </div>
            <span class="garn-search-meta">${(yarn.weight || '').toUpperCase()}</span>
        </button>
    `).join('');
    box.classList.remove('hidden');
}

function getSelectedYarn() {
    const selectedId = document.getElementById('garnSearch').dataset.selectedId;
    return GARN_DATABASE.find(y => y.id === selectedId) || null;
}

function saveGarnAltState() {
    const selected = getSelectedYarn();
    const state = {
        selectedId: selected?.id || '',
        skeins: document.getElementById('antallNoster').value || '',
        filters: getSelectedFilters()
    };
    localStorage.setItem('garnalternativ-state', JSON.stringify(state));
}

function restoreGarnAltState() {
    try {
        const raw = localStorage.getItem('garnalternativ-state');
        if (!raw) return;
        const state = JSON.parse(raw);
        if (state.selectedId) {
            const yarn = GARN_DATABASE.find(y => y.id === state.selectedId);
            if (yarn) {
                const input = document.getElementById('garnSearch');
                input.value = `${yarn.brand} ${yarn.name}`;
                input.dataset.selectedId = yarn.id;
                renderSelectedYarn(yarn);
            }
        }
        if (state.skeins) document.getElementById('antallNoster').value = state.skeins;
        if (state.filters) {
            document.getElementById('filterOnlyNorway').checked = !!state.filters.onlyNorway;
            document.getElementById('filterNaturalOnly').checked = !!state.filters.naturalOnly;
            document.getElementById('filterAvoidMohair').checked = !!state.filters.avoidMohair;
            document.getElementById('filterAvoidAlpaca').checked = !!state.filters.avoidAlpaca;
            document.getElementById('filterSuperwash').checked = !!state.filters.superwash;
            document.getElementById('filterLessFluffy').checked = !!state.filters.lessFluffy;
            document.getElementById('filterSofter').checked = !!state.filters.softer;
            document.getElementById('filterSummer').checked = !!state.filters.summer;
            document.getElementById('filterBaby').checked = !!state.filters.baby;
            document.getElementById('filterSameExpression').checked = !!state.filters.sameExpression;
        }
    } catch (_) {}
}

function buildResultCard(candidate, source, filters, originalSkeins) {
    const { score, scoreParts } = scoreCandidate(source, candidate, filters);
    const grade = gradeMatch(score);
    const warnings = buildWarnings(source, candidate);
    const explanations = explainMatch(source, candidate, warnings, scoreParts);
    const strengths = strengthTags(source, candidate, scoreParts);
    const calculation = calculateYarnNeed(source, candidate, originalSkeins);
    const fibers = getFiberKeys(candidate).map(key => fiberLabel(key)).join(', ');
    return `
        <article class="garn-kort ${grade.className}">
            <div class="garn-kort-header">
                <div>
                    <strong>${candidate.brand} ${candidate.name}</strong>
                    <p class="small-muted">${candidate.metersPerSkein} m / ${candidate.gramsPerSkein} g · ${fibers}</p>
                </div>
                <span class="match-badge">${grade.label}</span>
            </div>

            <div class="garn-kort-detaljer">
                <span class="garn-egenskap">${candidate.weight.toUpperCase()}</span>
                <span class="garn-egenskap">Pinne ${needleText(candidate)}</span>
                <span class="garn-egenskap">${candidate.gauge} m/10 cm</span>
                <span class="garn-egenskap">${candidate.structure}</span>
            </div>

            <div class="strength-badges">${strengths.map(tag => `<span class="strength-chip">${tag}</span>`).join('')}</div>

            <div class="garn-kort-tips">
                ${explanations.map(line => `<p>${line}</p>`).join('')}
            </div>

            ${calculation ? `
                <div class="garn-estimate-box">
                    <strong>Beregning</strong>
                    <p>Oppskriften bruker ca. <strong>${calculation.totalMeters} meter</strong>.</p>
                    <p>Du trenger omtrent <strong>${calculation.skeins} nøster</strong> av dette garnet.</p>
                    <p>Trygg anbefaling: <strong>${calculation.recommendedSkeins} nøster</strong>${calculation.approx ? ' fordi dette garnet oppfører seg litt annerledes.' : '.'}</p>
                </div>
            ` : ''}

            ${warnings.length ? `
                <div class="warning-box">
                    ${warnings.map(w => `<p>⚠️ ${w}</p>`).join('')}
                </div>
            ` : ''}

            <p class="small-muted">${(candidate.notes || []).slice(0, 2).join(' ')}</p>
        </article>
    `;
}

function findAlternatives(source, filters) {
    return GARN_DATABASE
        .filter(candidate => candidate.id !== source.id)
        .filter(candidate => passesHardFilters(candidate, filters))
        .map(candidate => ({ candidate, ...scoreCandidate(source, candidate, filters) }))
        .filter(item => item.score >= 45)
        .sort((a, b) => b.score - a.score || a.candidate.brand.localeCompare(b.candidate.brand))
        .slice(0, 10);
}

function renderGarnAltSummary(source, alternatives, filters) {
    const summary = document.getElementById('garnaltSummary');
    if (!summary) return;
    const activeFilters = [
        filters.naturalOnly && 'naturfiber',
        filters.avoidMohair && 'uten mohair',
        filters.avoidAlpaca && 'uten alpakka',
        filters.superwash && 'superwash',
        filters.lessFluffy && 'mindre fluffy',
        filters.softer && 'mykere',
        filters.summer && 'sommerplagg',
        filters.baby && 'babyvennlig',
        filters.sameExpression && 'samme uttrykk'
    ].filter(Boolean);

    summary.innerHTML = `
        <div class="garnalt-summary-card">
            <strong>${source.brand} ${source.name}</strong>
            <p>Fant <strong>${alternatives.length}</strong> relevante alternativer${activeFilters.length ? ` med filter: ${activeFilters.join(', ')}` : ''}.</p>
            <p class="small-muted">Databasen inneholder nå <strong>${GARN_DATABASE.length}</strong> garn. Resultatene er rangert etter praktisk likhet, uttrykk og fiberprofil.</p>
        </div>
    `;
    summary.classList.remove('hidden');
}

function renderGarnAltResults(source, alternatives, filters, originalSkeins) {
    const result = document.getElementById('garnaltResultat');
    if (!alternatives.length) {
        document.getElementById('garnaltSummary')?.classList.add('hidden');
        visResultat(result, '<h3>Ingen gode treff</h3><p>Prøv å fjerne noen filtre, slå av «Samme uttrykk», eller velg et originalgarn med flere lignende alternativer i basen.</p>');
        return;
    }
    renderGarnAltSummary(source, alternatives, filters);
    const html = `
        <div class="result-header">
            <h3>Beste praktiske alternativer til ${source.brand} ${source.name}</h3>
            <p class="small-muted">Sortert etter hvor godt garnet fungerer i praksis, ikke bare teknisk likhet.</p>
        </div>
        ${alternatives.map(item => buildResultCard(item.candidate, source, filters, originalSkeins)).join('')}
    `;
    visResultat(result, html);
}

function setupGarnAlternativ() {
    const searchInput = document.getElementById('garnSearch');
    const searchResults = document.getElementById('garnSearchResults');
    const quickSearchButtons = document.querySelectorAll('.quick-search-chip');
    const toggleAdvanced = document.getElementById('toggleAdvancedFilters');
    const advancedFilters = document.getElementById('advancedFilters');
    const findButton = document.getElementById('beregnGarnalt');
    const resetButton = document.getElementById('nullstillGarnalt');

    searchInput.addEventListener('input', () => {
        searchInput.dataset.selectedId = '';
        renderSelectedYarn(null);
        document.getElementById('garnaltSummary').classList.add('hidden');
        document.getElementById('garnaltResultat').classList.add('hidden');
        renderSearchResults(searchYarns(searchInput.value));
    });

    searchInput.addEventListener('focus', () => {
        renderSearchResults(searchYarns(searchInput.value));
    });

    quickSearchButtons.forEach(button => {
        button.addEventListener('click', () => {
            searchInput.value = button.dataset.query || '';
            renderSearchResults(searchYarns(searchInput.value));
            searchInput.focus();
        });
    });

    searchResults.addEventListener('click', (e) => {
        const button = e.target.closest('[data-yarn-id]');
        if (!button) return;
        const yarn = GARN_DATABASE.find(item => item.id === button.dataset.yarnId);
        if (!yarn) return;
        searchInput.value = `${yarn.brand} ${yarn.name}`;
        searchInput.dataset.selectedId = yarn.id;
        renderSelectedYarn(yarn);
        renderSearchResults([]);
        saveGarnAltState();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#garnSearch') && !e.target.closest('#garnSearchResults')) {
            renderSearchResults([]);
        }
    });

    toggleAdvanced.addEventListener('click', () => {
        advancedFilters.classList.toggle('hidden');
        toggleAdvanced.textContent = advancedFilters.classList.contains('hidden') ? 'Vis flere valg' : 'Skjul flere valg';
    });

    findButton.addEventListener('click', () => {
        vibrer(10);
        const source = getSelectedYarn();
        if (!source) {
            visResultat(document.getElementById('garnaltResultat'), '<p class="error">Velg et originalgarn først.</p>');
            return;
        }
        const originalSkeins = parseInt(document.getElementById('antallNoster').value, 10) || 0;
        const filters = getSelectedFilters();
        const alternatives = findAlternatives(source, filters);
        renderGarnAltResults(source, alternatives, filters, originalSkeins);
        saveGarnAltState();
    });

    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.dataset.selectedId = '';
        document.getElementById('antallNoster').value = '';
        document.getElementById('garnaltResultat').classList.add('hidden');
        document.getElementById('garnaltResultat').innerHTML = '';
        document.getElementById('garnaltSummary').classList.add('hidden');
        document.getElementById('garnaltSummary').innerHTML = '';
        renderSelectedYarn(null);
        renderSearchResults([]);
        document.getElementById('filterOnlyNorway').checked = true;
        FILTER_IDS.slice(1).forEach(id => { document.getElementById(id).checked = false; });
        localStorage.removeItem('garnalternativ-state');
        saveGarnAltState();
    });

    [...document.querySelectorAll('#garnalternativ input')].forEach(el => {
        el.addEventListener('change', saveGarnAltState);
    });

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const source = getSelectedYarn();
                if (source) {
                    document.getElementById('beregnGarnalt').click();
                    return;
                }
                const firstHit = searchYarns(searchInput.value)[0];
                if (firstHit) {
                    searchInput.value = `${firstHit.brand} ${firstHit.name}`;
                    searchInput.dataset.selectedId = firstHit.id;
                    renderSelectedYarn(firstHit);
                    renderSearchResults([]);
                }
            }
        });
    }

    restoreGarnAltState();
}

setupGarnAlternativ();


// --- Tastaturstøtte for kalkulatorer ---
[
    ['oykningStart', 'beregnOykning'],
    ['oykningMal', 'beregnOykning'],
    ['fellingStart', 'beregnFelling'],
    ['fellingMal', 'beregnFelling'],
    ['provMasker', 'beregnFasthet'],
    ['provCm', 'beregnFasthet'],
    ['onsketCm', 'beregnFasthet'],
    ['garnLengde', 'beregnGarn'],
    ['manuellMeter', 'beregnGarnalt'],
    ['antallNoster', 'beregnGarnalt']
].forEach(([inputId, buttonId]) => {
    const felt = document.getElementById(inputId);
    const knapp = document.getElementById(buttonId);
    if (felt && knapp) {
        felt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') knapp.click();
        });
    }
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
        leggTilMelding('System', 'Kunne ikke laste strikketips akkurat nå. Prøv igjen senere.');
    });

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatQuickReplies = document.getElementById('chatQuickReplies');
const chatReset = document.getElementById('chatReset');

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

function normaliser(tekst) {
    return tekst.toLowerCase().trim();
}

function finnSvar(input) {
    const ord = normaliser(input);
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
        const inputLower = normaliser(spørsmål);
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

function nullstillChat() {
    chatMessages.innerHTML = '<div class="chat-bubble chat-bot">Hei! Jeg er strikkeeksperten. Spør meg om teknikker, masker, forkortelser eller tips!</div>';
    chatInput.value = '';
    samtaleTilstand = { ventePå: null, kildeId: null, valg: null };
    visHurtigvalg(standardHurtigvalg);
}

chatSend.addEventListener('click', () => {
    vibrer(8);
    håndterSpørsmål();
});

if (chatReset) {
    chatReset.addEventListener('click', () => {
        vibrer(12);
        nullstillChat();
    });
}

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') håndterSpørsmål();
});
