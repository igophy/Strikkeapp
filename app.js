// Inges strikkehjelp - app.js
const APP_VERSION = '0.8';

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
    return lagret ? JSON.parse(lagret) : { masker: 0, rader: 0 };
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
    const start = parseInt(document.getElementById('oykningStart').value);
    const mal = parseInt(document.getElementById('oykningMal').value);
    const resultat = document.getElementById('oykningResultat');

    if (!start || !mal) {
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
    const start = parseInt(document.getElementById('fellingStart').value);
    const mal = parseInt(document.getElementById('fellingMal').value);
    const resultat = document.getElementById('fellingResultat');

    if (!start || !mal) {
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
    const masker = parseFloat(document.getElementById('provMasker').value);
    const bredde = parseFloat(document.getElementById('provCm').value);
    const onsket = parseFloat(document.getElementById('onsketCm').value);
    const resultat = document.getElementById('fasthetResultat');

    if (!masker || !bredde || !onsket) {
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
    const meterPerNoste = parseInt(document.getElementById('garnLengde').value);
    const resultat = document.getElementById('garnResultat');

    if (!type) {
        visResultat(resultat, '<p class="error">Velg en prosjekttype.</p>');
        return;
    }
    if (!meterPerNoste) {
        visResultat(resultat, '<p class="error">Fyll inn meter per nøste.</p>');
        return;
    }

    const prosjekt = garnEstimat[type];
    const antallNoster = Math.ceil(prosjekt.meter / meterPerNoste);

    let html = `<h3>Resultat</h3>`;
    html += `<p class="instruction"><strong>${prosjekt.navn}</strong> trenger ca. <strong>${prosjekt.meter} meter</strong> garn.</p>`;
    html += `<p class="instruction">Med ${meterPerNoste} m/nøste trenger du: <strong>${antallNoster} nøster</strong></p>`;
    html += `<p class="detail">Tips: Kjøp gjerne 1 ekstra nøste for sikkerhets skyld. Estimatene er omtrentlige og varierer med garntykkelse og mønster.</p>`;

    visResultat(resultat, html);
});

// --- Strikkeekspert ---
const kunnskapsbase = [
    {
        nøkkelord: ['rett', 'rettmaske', 'rett maske', 'strikke rett'],
        svar: 'Rett maske (r) er grunnmasken i strikking. Stikk pinnen inn foran fra venstre, legg tråden rundt og trekk gjennom. Alle retter gir glattstrikk på rettsiden.'
    },
    {
        nøkkelord: ['vrang', 'vrangmaske', 'vrang maske', 'strikke vrang'],
        svar: 'Vrang maske (vr) er motsatt av rett. Tråden holdes foran arbeidet, stikk pinnen inn bakfra høyre til venstre, legg tråden rundt og trekk gjennom.'
    },
    {
        nøkkelord: ['legg opp', 'legge opp masker', 'opplegning', 'slå opp'],
        svar: 'Å legge opp masker er å lage den første raden. Vanligste metoder:<ul><li><strong>Tommelfinger-metoden</strong> &mdash; gir en elastisk kant</li><li><strong>Kabelopplegning</strong> &mdash; gir en fast, pen kant</li><li><strong>Løkkeopplegning</strong> &mdash; enklest, men kan bli løs</li></ul>'
    },
    {
        nøkkelord: ['felle', 'felling', 'minke', 'minske', 'fell sammen'],
        svar: 'Vanlige fellinger:<ul><li><strong>Fell 2 rett sammen (f2rs)</strong> &mdash; høyrehellende felling</li><li><strong>Surpassé (surp)</strong> &mdash; venstrehellende felling, løft 1 maske over</li><li><strong>Fell 3 sammen</strong> &mdash; dobbel felling for raskere minking</li></ul>'
    },
    {
        nøkkelord: ['øk', 'øke', 'økning', 'øke masker'],
        svar: 'Vanlige økninger:<ul><li><strong>Kast (k)</strong> &mdash; lager et hull, brukes i hullmønster</li><li><strong>Løft (løft)</strong> &mdash; usynlig økning fra tverrtråden</li><li><strong>Strikk i forkant og bakkant</strong> &mdash; enkel økning uten hull</li></ul>'
    },
    {
        nøkkelord: ['strikkefasthet', 'fasthet', 'prøvelapp', 'gauge'],
        svar: 'Strikkefasthet forteller hvor mange masker og rader du får per 10 cm. Strikk alltid en prøvelapp! Har du for mange masker, bruk tykkere pinner. For få masker, bruk tynnere pinner.'
    },
    {
        nøkkelord: ['flette', 'flettemønster', 'kabelstrikk', 'flettepinne'],
        svar: 'Flettemønster lages ved å bytte rekkefølge på masker med en flettepinne (hjelpepinne). Sett masker på flettepinnen, strikk neste masker, og strikk så maskene fra flettepinnen.'
    },
    {
        nøkkelord: ['rundstrikk', 'rundpinne', 'rundt', 'i rundgang'],
        svar: 'Rundstrikk gjøres med rundpinner eller strømpepinner. Fordelen er at du alltid ser rettsiden og slipper å strikke vrangrader. Pass på at arbeidet ikke vris når du slutter ringen!'
    },
    {
        nøkkelord: ['sokk', 'sokker', 'hæl', 'hælfelling'],
        svar: 'Sokker strikkes vanligvis ovenfra og ned med strømpepinner:<ul><li>Legg opp og strikk vrangbord</li><li>Strikk rett til hælen</li><li>Strikk hæl med forkortede rader</li><li>Ta opp masker langs hælklaffen</li><li>Mink til foten og fell av ved tåen</li></ul>'
    },
    {
        nøkkelord: ['fell av', 'felle av', 'avslutt', 'avfelling'],
        svar: 'For å felle av: Strikk 2 masker, løft den første over den andre. Strikk 1 ny, løft igjen. Gjenta til 1 maske gjenstår, klipp tråden og trekk gjennom.'
    },
    {
        nøkkelord: ['garn', 'garntykkelse', 'garnvalg', 'ull', 'bomull', 'akryl'],
        svar: 'Vanlige garntykkelser:<ul><li><strong>Tynt/fingering</strong> &mdash; sokker, sjal (pinne 2.5-3.5)</li><li><strong>Sport/DK</strong> &mdash; gensere, tilbehør (pinne 3.5-4.5)</li><li><strong>Aran/worsted</strong> &mdash; gensere, votter (pinne 4.5-5.5)</li><li><strong>Bulky/tykt</strong> &mdash; raskt prosjekt (pinne 6+)</li></ul>Ull er varmt og elastisk, bomull er kjølig og fast, akryl er billig og vaskbart.'
    },
    {
        nøkkelord: ['forkortelse', 'forkortelser', 'hva betyr'],
        svar: 'Vanlige forkortelser i strikkemønster:<ul><li><strong>r</strong> = rett</li><li><strong>vr</strong> = vrang</li><li><strong>k</strong> = kast (omslag)</li><li><strong>f2rs</strong> = fell 2 rett sammen</li><li><strong>surp</strong> = surpassé</li><li><strong>sm</strong> = slingre-/slyng-maske</li><li><strong>gl</strong> = glatt (rett på rett, vrang på vrang)</li></ul>'
    },
    {
        nøkkelord: ['votter', 'vott', 'tommel'],
        svar: 'Votter strikkes med strømpepinner. Legg opp masker, strikk vrangbord, deretter glattstrikk. Sett av masker for tommelen på en tråd. Strikk ferdig hånden, fell av på toppen, og strikk tommelen til slutt.'
    },
    {
        nøkkelord: ['lue', 'topplue', 'strikke lue'],
        svar: 'Enkel lue: Legg opp ca. 80-100 masker på rundpinne (avhengig av garntykkelse). Strikk vrangbord (2 rett, 2 vrang) i 5-7 cm, deretter glattstrikk til ønsket lengde. Fell jevnt til ca. 8 masker gjenstår, trekk tråden gjennom.'
    },
    {
        nøkkelord: ['mønster', 'diagram', 'lese mønster', 'oppskrift'],
        svar: 'I et strikkediagram leses rettrader fra høyre til venstre, og vrangrader fra venstre til høyre. Ved rundstrikk leses alle rader fra høyre til venstre. Hvert symbol representerer en maske eller teknikk.'
    },
    {
        nøkkelord: ['hei', 'hallo', 'heisann', 'hjelp'],
        svar: 'Hei! Jeg kan hjelpe deg med strikkespørsmål. Prøv å spørre om f.eks.:<ul><li>Rett og vrang masker</li><li>Økning og felling</li><li>Forkortelser i mønster</li><li>Sokker, votter eller lue</li><li>Garnvalg</li></ul>Eller skriv et emne, så søker jeg også på YouTube!'
    },
    {
        nøkkelord: ['lenker', 'sider', 'nettside', 'strikkesider', 'ressurser', 'inspirasjon'],
        svar: 'Her er nyttige strikkesider:<ul><li><a href="https://www.ravelry.com" target="_blank">Ravelry</a> &mdash; verdens største strikkefellesskap med tusenvis av gratis mønster</li><li><a href="https://www.sandnesgarn.no" target="_blank">Sandnes Garn</a> &mdash; norske oppskrifter og garn</li><li><a href="https://www.drops-design.com" target="_blank">DROPS Design</a> &mdash; gratis oppskrifter på norsk</li><li><a href="https://www.strikkeoppskrift.no" target="_blank">Strikkeoppskrift.no</a> &mdash; norske oppskrifter</li><li><a href="https://www.knittinghelp.com" target="_blank">KnittingHelp</a> &mdash; videoer og teknikker (engelsk)</li></ul>'
    }
];

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

function leggTilMelding(tekst, type) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-${type}`;
    bubble.innerHTML = tekst;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function finnSvar(spørsmål) {
    const ord = spørsmål.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const tema of kunnskapsbase) {
        for (const nøkkel of tema.nøkkelord) {
            if (ord.includes(nøkkel)) {
                const score = nøkkel.length;
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = tema;
                }
            }
        }
    }

    return bestMatch;
}

function lagYouTubeLenke(søk) {
    const query = encodeURIComponent('strikking ' + søk);
    return `<a class="youtube-link" href="https://www.youtube.com/results?search_query=${query}" target="_blank">Søk på YouTube</a>`;
}

function håndterSpørsmål() {
    const spørsmål = chatInput.value.trim();
    if (!spørsmål) return;

    leggTilMelding(spørsmål, 'user');
    chatInput.value = '';

    const match = finnSvar(spørsmål);

    if (match) {
        leggTilMelding(match.svar + '<br>' + lagYouTubeLenke(spørsmål), 'bot');
    } else {
        leggTilMelding(
            'Det har jeg ikke svar på ennå, men prøv å søke her:'
            + '<br>' + lagYouTubeLenke(spørsmål)
            + '<br><br>Prøv å spørre om: masker, felling, økning, garn, sokker, votter, lue, forkortelser, eller skriv <strong>lenker</strong> for nyttige strikkesider.',
            'bot'
        );
    }
}

chatSend.addEventListener('click', håndterSpørsmål);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') håndterSpørsmål();
});
