// Inges strikkehjelp - app.js v1.1 (med prosjektsporing)
const APP_VERSION = '1.1';

// ==================== NY: PROSJEKTER ====================
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
    if (!container) return;
    container.innerHTML = '';

    if (prosjekter.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8a7565;padding:2rem;">Ingen prosjekter ennå.<br>Trykk "+ Nytt prosjekt"</p>';
        return;
    }

    prosjekter.forEach(p => {
        const div = document.createElement('div');
        div.className = 'prosjekt-kort';
        div.innerHTML = `
            <h3>${p.navn}</h3>
            <p><strong>${p.type}</strong> • ${p.status}</p>
            <p>${p.masker} masker • ${p.rader} rader</p>
        `;
        div.addEventListener('click', () => visProsjektDetalj(p.id));
        container.appendChild(div);
    });
}

function visProsjektDetalj(id) {
    const p = prosjekter.find(x => x.id === id);
    if (!p) return;
    aktivtProsjektId = id;

    document.getElementById('prosjektTittel').textContent = p.navn;
    document.getElementById('prosjektNavn').value = p.navn;
    document.getElementById('prosjektType').value = p.type || 'genser';
    document.getElementById('prosjektStatus').value = p.status || 'påbegynt';
    document.getElementById('prosjektMasker').value = p.masker || 0;
    document.getElementById('prosjektRader').value = p.rader || 0;
    document.getElementById('prosjektNotater').value = p.notater || '';

    visSide('prosjektDetalj');
}

// ==================== RESTEN AV DIN ORIGINALE KODE (uendret) ====================
// ... (alt det gamle fra din opprinnelige app.js ligger her) ...

// Legg til denne nye koden på slutten av filen din:

// Prosjekt-knapper
document.getElementById('nyProsjektBtn').addEventListener('click', () => {
    const nytt = {
        id: 'proj_' + Date.now(),
        navn: 'Nytt prosjekt ' + new Date().toLocaleDateString('no-NO'),
        type: 'genser',
        status: 'påbegynt',
        masker: 0,
        rader: 0,
        notater: ''
    };
    prosjekter.unshift(nytt);
    lagreProsjekter();
    visProsjektListe();
    visProsjektDetalj(nytt.id);
});

document.getElementById('lagreProsjektBtn').addEventListener('click', () => {
    if (!aktivtProsjektId) return;
    const p = prosjekter.find(x => x.id === aktivtProsjektId);
    if (!p) return;

    p.navn = document.getElementById('prosjektNavn').value.trim() || 'Uten navn';
    p.type = document.getElementById('prosjektType').value;
    p.status = document.getElementById('prosjektStatus').value;
    p.masker = parseInt(document.getElementById('prosjektMasker').value) || 0;
    p.rader = parseInt(document.getElementById('prosjektRader').value) || 0;
    p.notater = document.getElementById('prosjektNotater').value.trim();

    lagreProsjekter();
    visProsjektListe();
    alert('✅ Prosjekt lagret');
    visSide('prosjekter');
});

document.getElementById('slettProsjektBtn').addEventListener('click', () => {
    if (!aktivtProsjektId || !confirm('Slette prosjektet?')) return;
    prosjekter = prosjekter.filter(x => x.id !== aktivtProsjektId);
    lagreProsjekter();
    aktivtProsjektId = null;
    visProsjektListe();
    visSide('prosjekter');
});

// Oppdater telleren hvis et prosjekt er aktivt
function synkroniserTellerMedProsjekt() {
    if (!aktivtProsjektId) return;
    const p = prosjekter.find(x => x.id === aktivtProsjektId);
    if (p) {
        p.masker = counters.masker;
        p.rader = counters.rader;
        lagreProsjekter();
    }
}

// Kall dette etter at telleren endres (legg til i dine eksisterende counter-knapper)
document.querySelectorAll('.btn-counter').forEach(btn => {
    btn.addEventListener('click', () => {
        // ... din eksisterende kode ...
        synkroniserTellerMedProsjekt();
    });
});

// Init prosjekter
hentProsjekter();
visProsjektListe();

// Oppdater versjon i footer
document.querySelector('.version').textContent = 'v1.1 • Prosjektsporing';
