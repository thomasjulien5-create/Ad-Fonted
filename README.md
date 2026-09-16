# Ad Fontes — PWA

Application web installable dédiée à la liturgie romaine traditionnelle.

## Fonctions

- Calendrier Vetus Ordo 1962 / rubriques de 1960.
- Fête ou saint du jour, rang et commémorations.
- Épître / lecture et Évangile du propre de la messe.
- Complies traditionnelles, avec affichage du latin quand fourni par la source.
- Méditation quotidienne de *La Moelle de saint Thomas d'Aquin* : structure prête ; la base complète doit encore être indexée avec prise en compte du cycle liturgique mobile.
- Navigation par date.
- Installation PWA sur Android/iPhone.
- Cache hors ligne de l'interface et des jours déjà consultés.

## Source liturgique

L'application appelle `https://categpt.chat/api/v1/feast?date=YYYY-MM-DD&locale=fr` et n'utilise que le bloc `vom` (Vetus Ordo). L'API crédite Divinum Officium.

## Publication

Le dépôt contient un workflow GitHub Pages dans `.github/workflows/deploy.yml` afin de publier automatiquement l'application après activation de GitHub Pages dans les réglages du dépôt.

## La Moelle

L'édition complète nécessitera l'indexation des deux tomes de 1930 de *La Moelle de saint Thomas d'Aquin*. Les entrées de certaines périodes suivent le cycle liturgique mobile : il faut donc une table de correspondance liturgique et non un simple tableau jour-mois.