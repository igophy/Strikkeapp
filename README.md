# Strikkeapp
En app som hjelper med strikking

## GitHub-tilgang (enkelt forklart)

Hvis `git push` feiler med nettverksfeil i en container, betyr det ofte at miljøet ikke har tilgang til GitHub.  
Da er den enkleste løsningen:

1. **Kjør push fra din egen maskin** (der du er logget inn på GitHub).
2. Bruk **HTTPS + Personal Access Token (PAT)**.

### Steg for steg

```bash
git remote set-url origin https://github.com/igophy/Strikkeapp.git
git add .
git commit -m "Din melding"
git push -u origin work
```

Når Git ber om passord:
- Bruk GitHub-brukernavn som vanlig.
- Bruk **PAT-token** som passord (ikke GitHub-passord).

### Lag PAT-token
1. GitHub → **Settings**
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token**
4. Gi `repo`-tilgang
5. Kopier token og bruk det ved `git push`

Tips: Hvis du vil slippe token hver gang, installer **GitHub CLI** og kjør:

```bash
gh auth login
```

## Enda enklere i Visual Studio Code

Ja — for mange er dette enklere i **Visual Studio Code** enn i terminal.

### Hurtigste måte
1. Åpne prosjektet i VS Code.
2. Gå til **Source Control** (gren-ikonet i venstre meny).
3. Trykk **Publish to GitHub** eller **Push/Sync**.
4. Logg inn i GitHub når VS Code ber om det.
5. Godkjenn tilgang i nettleseren.

Da håndterer VS Code autentisering for deg, og du slipper ofte PAT manuelt.

### Hvis du fortsatt får feil
- Sjekk at du er på riktig branch (`work`).
- Sjekk at remote peker til riktig repo: `https://github.com/igophy/Strikkeapp.git`.
- Prøv push fra din egen maskin (ikke container), siden containeren kan være blokkert av proxy/nettverk.
