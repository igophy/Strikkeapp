// Inges strikkehjelp - app.js v1.1
const APP_VERSION = '1.1';

// ==================== PROSJEKTER ====================
let prosjekter = [];
let aktivtProsjektId = null;

const PROSJEKT_KEY = 'inges-strikkehjelp-prosjekter';

function hentProsjekter() {
    const lagret = localStorage.getItem(PROSJEKT_KEY);
    prosjekter = lagret ? JSON.parse(lagret) : [];
}

function lagreProsjekter() {
    localStorage.setItem(PROSJEKT_KEY, JSON.stringify(prosjekter));
}

function visProsjektListe() {
    const container = document.getElementById('prosjektListe');
    container.innerHTML = '';

    if (prosjekter.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#8a7565; padding:2rem;">Du har ingen prosjekter ennå.<br>Trykk på "+ Nytt prosjekt"</p>';
        return;
    }

    prosjekter.forEach(p => {
        const div = document.createElement('div');
        div.className = `prosjekt-kort ${p.status}`;
        div.innerHTML = `
            <h3>${p.navn}</h3>
            <p><strong>Type:</strong> ${p.type} • <strong>Status:</strong> ${p.status}</p>
            ${p.lengde ? `<p><strong>Lengde:</strong> ${p.lengde} cm</p>` : ''}
            ${p.masker || p.rader ? `<p><strong>Fremdrift:</strong> ${p.masker || 0} masker, ${p.rader || 0} rader</p>` : ''}
        `;
        div.addEventListener('click', () => visProsjektDetalj(p.id));
        container.appendChild(div);
    });
}

function visProsjektDetalj(id) {
    const p = prosjekter.find(pr => pr.id === id);
    if (!p) return;

    aktivtProsjektId = id;
    visSide('prosjektDetalj');

    document.getElementById('prosjektTittel').textContent = p.navn;
    document.getElementById('prosjektNavn').value = p.navn;
    document.getElementById('prosjektType').value = p.type || 'genser';
    document.getElementById('prosjektStatus').value = p.status || 'påbegynt';
    document.getElementById('prosjektLengde').value = p.lengde || '';
    document.getElementById('prosjektNotater').value = p.notater || '';
}

function nyttProsjekt() {
    const nytt = {
        id: 'proj_' + Date.now(),
        navn: 'Nytt prosjekt ' + new Date().toLocaleDateString('no-NO'),
        type: 'genser',
        status: 'påbegynt',
        masker: 0,
        rader: 0,
        lengde: null,
        notater: '',
        opprettet: new Date().toISOString()
    };
    prosjekter.unshift(nytt);
    lagreProsjekter();
    visProsjektListe();
    visProsjektDetalj(nytt.id);
}

// ==================== TELLER MED PROSJEKT ====================
const counters = { masker: 0, rader: 0 };

function oppdaterTellerVisning() {
    document.getElementById('masker').textContent = counters.masker;
    document.getElementById('rader').textContent = counters.rader;
    
    const navnEl = document.getElementById('aktivProsjektNavn');
    if (aktivtProsjektId) {
        const p = prosjekter.find(pr => pr.id === aktivtProsjektId);
        navnEl.textContent = p ? `Prosjekt: ${p.navn}` : 'Ingen prosjekt valgt';
    } else {
        navnEl.textContent = 'Ingen prosjekt valgt';
    }
}

function synkroniserTellerTilProsjekt() {
    if (!aktivtProsjektId) return;
    const p = prosjekter.find(pr => pr.id === aktivtProsjektId);
    if (p) {
        p.masker = counters.masker;
        p.rader = counters.rader;
        lagreProsjekter();
    }
}

// ==================== INIT & EVENT LISTENERS ====================
function init() {
    hentProsjekter();
    
    // Dark mode (uendret)
    // ... (behold din eksisterende dark mode kode)

    // Side navigasjon
    document.querySelectorAll('.tile, .btn-back').forEach(el => {
        el.addEventListener('click', () => {
            const page = el.dataset.page;
            if (page) visSide(page);
        });
    });

    // Nytt prosjekt
    document.getElementById('nyProsjektBtn').addEventListener('click', nyttProsjekt);

    // Lagre prosjekt
    document.getElementById('lagreProsjektBtn').addEventListener('click', () => {
        if (!aktivtProsjektId) return;
        const p = prosjekter.find(pr => pr.id === aktivtProsjektId);
        if (!p) return;

        p.navn = document.getElementById('prosjektNavn').value.trim() || p.navn;
        p.type = document.getElementById('prosjektType').value;
        p.status = document.getElementById('prosjektStatus').value;
        p.lengde = parseFloat(document.getElementById('prosjektLengde').value) || null;
        p.notater = document.getElementById('prosjektNotater').value.trim();

        lagreProsjekter();
        visProsjektListe();
        alert('Prosjekt lagret!');
        visSide('prosjekter');
    });

    // Slett prosjekt
    document.getElementById('slettProsjektBtn').addEventListener('click', () => {
        if (!aktivtProsjektId || !confirm('Slette dette prosjektet permanent?')) return;
        prosjekter = prosjekter.filter(p => p.id !== aktivtProsjektId);
        lagreProsjekter();
        aktivtProsjektId = null;
        visProsjektListe();
        visSide('prosjekter');
    });

    // TELLER
    document.querySelectorAll('.btn-counter').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (btn.classList.contains('btn-plus')) counters[target]++;
            else counters[target] = Math.max(0, counters[target] - 1);

            oppdaterTellerVisning();
            synkroniserTellerTilProsjekt();
        });
    });

    document.getElementById('resetCounters').addEventListener('click', () => {
        if (confirm('Nullstille tellere?')) {
            counters.masker = 0;
            counters.rader = 0;
            oppdaterTellerVisning();
            synkroniserTellerTilProsjekt();
        }
    });

    // Initial visning
    visProsjektListe();
    oppdaterTellerVisning();

    // Last inn gamle tellere hvis ingen prosjekt er aktivt
    // ... (kan utvides senere)
}

window.onload = init;
