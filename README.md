# Ad Fontes — PWA

Application web installable dédiée à la liturgie romaine traditionnelle et à la méditation thomiste.

## Fonctions

- Calendrier Vetus Ordo 1962 / rubriques de 1960.
- Fête ou saint du jour, rang et commémorations.
- Épître / lecture et Évangile du propre de la messe.
- Méditation quotidienne de *La Moelle de saint Thomas d'Aquin*, avec texte intégral vérifié, commentaire thomiste approfondi, références et résolution pratique.
- Navigation par date.
- Installation PWA sur Android/iPhone.
- Cache hors ligne de l'interface et des jours déjà consultés.

## Source liturgique

L'application appelle `https://categpt.chat/api/v1/feast?date=YYYY-MM-DD&locale=fr` et n'utilise que le bloc `vom` (Vetus Ordo). L'API crédite Divinum Officium.

## Publication

Adresse : `https://thomasjulien5-create.github.io/Ad-Fontes/`

Le dépôt contient un workflow GitHub Pages dans `.github/workflows/deploy.yml` afin de publier automatiquement l'application après chaque modification.

## La Moelle

Les méditations sont archivées par date dans `meditations/MM-DD.json`. Les entrées de certaines périodes suivent le cycle liturgique mobile : leur correspondance doit respecter les indications du P. Mézard et ne pas être traitée comme un simple tableau jour-mois.
