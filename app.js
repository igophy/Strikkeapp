// Inges strikkehjelp - app.js

// --- Tab-navigasjon ---
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
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
    const aktivTab = document.querySelector('.tab-content.active');
    if (aktivTab.id !== 'teller') return;

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
