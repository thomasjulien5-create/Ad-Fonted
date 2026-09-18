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


## Droits et provenance des textes

- **Bible Crampon 1923** : texte reproduit depuis l’édition numérisée sur Wikisource, signalée comme domaine public. Augustin Crampon (1826–1894) est le traducteur crédité ; l’édition 1923 est une édition révisée.
- **La Moelle de saint Thomas d’Aquin (1930)** : compilation du P. Denys Mézard à partir de saint Thomas, dans une traduction française publiée anonymement (« par un religieux du même Ordre »). L’édition précise que certaines méditations empruntent des traductions de la *Revue des Jeunes* et les signale par un astérisque : ces passages doivent être contrôlés individuellement avant reproduction.
- **Vetus Ordo** : calendrier et latin liturgique servis par CatéGPT à partir de Divinum Officium. Divinum Officium publie code et données sous licence MIT et indique que les textes liturgiques sont, à sa connaissance, dans le domaine public.
- **Exclusion** : Ad Fontes n’emploie pas les textes bibliques modernes de l’AELF ni ceux de « La Bible en ses Traditions ».
- **Commentaires** : les commentaires, synthèses et résolutions rédigés pour Ad Fontes sont du contenu éditorial propre à l’application.

Pour une exploitation commerciale, conserver les attributions et les liens de provenance, et vérifier individuellement tout passage de *La Moelle* marqué d’un astérisque dans l’édition de 1930.
