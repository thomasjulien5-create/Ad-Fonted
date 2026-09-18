# Registre des droits et provenance — Ad Fontes

Dernière vérification : 18 septembre 2026.

> Ce registre documente les sources effectivement appelées ou reproduites par l’application. Il ne remplace pas un avis juridique professionnel.

| Ressource | Usage dans Ad Fontes | Statut / licence | Commercialisation | Attribution / précaution |
|---|---|---|---|---|
| Saint Thomas d’Aquin, textes originaux | Sources doctrinales, citations et références | Domaine public († 1274) | Oui | Toujours distinguer le texte original d’une traduction moderne |
| Bible Crampon, édition révisée 1923 | Texte français intégral des lectures de la messe | Domaine public ; Wikisource marque le fac-similé Public Domain Mark | Oui | Crédit : Augustin Crampon, édition révisée 1923 ; conserver le lien vers Wikisource |
| *La Moelle de saint Thomas d’Aquin*, éd. française 1930 | Méditation quotidienne reproduite intégralement | Traduction publiée anonymement (« par un religieux du même Ordre »), 1930. Sous la règle française générale des œuvres anonymes : 70 ans après publication, sous réserve d’identification ultérieure de l’auteur et des cas particuliers | Oui, **avec contrôle éditorial** | Contrôler individuellement les passages que l’édition signale comme empruntés à des traductions antérieures, notamment ceux de la *Revue des Jeunes* |
| Divinum Officium | Données Vetus Ordo et latin liturgique via CatéGPT | Dépôt code/données sous MIT ; le projet indique que ses textes liturgiques sont, à sa connaissance, du domaine public | Oui | Conserver le crédit Divinum Officium ; conserver la notice MIT si du code/données substantiels sont redistribués |
| CatéGPT API | API de calendrier et données VOM | API gratuite ; documentation demandant l’affichage du crédit de la source de chaque ordo | Oui selon documentation publique consultée | Ad Fontes doit afficher le crédit Divinum Officium près des données VOM |
| AELF / bloc Novus Ordo de CatéGPT | **Non utilisé par l’application** | Non audité pour reproduction commerciale ici | Ne pas intégrer sans audit/licence | Le code doit continuer à ne consommer que `data.vom` |
| Commentaires Ad Fontes | Commentaires, synthèses, résolutions créés pour l’application | Contenu éditorial propre | Oui | Ne pas présenter une synthèse comme une citation littérale d’un auteur |
| Liens vers Corpus Thomisticum, New Advent, CCEL, Isidore, Catena, Bossuet, etc. | Sources/références externes ; les pages ne sont pas copiées intégralement | Variable selon chaque site/édition | Lien : généralement oui ; reproduction : à vérifier au cas par cas | Ne pas aspirer/reproduire automatiquement leurs traductions modernes |
| Icône, CSS, JS et HTML propres au dépôt | Interface de l’application | Créations du projet, sauf dépendance externe explicitement signalée | Oui | Aucune police, image ou bibliothèque tierce embarquée détectée lors de l’audit du 18/09/2026 |

## Règles éditoriales obligatoires

1. Pour les lectures françaises, reproduire uniquement **Crampon 1923** après vérification sur le fac-similé/Wikisource.
2. L’API CatéGPT ne sert qu’à la structure et aux données **Vetus Ordo** ; ne jamais afficher comme texte biblique français le contenu AELF reçu dans `nom`.
3. Pour *La Moelle*, vérifier la page source avant archivage. Si la méditation est signalée comme utilisant une traduction tierce (notamment *Revue des Jeunes*), suspendre la reproduction intégrale tant que cette traduction n’a pas été identifiée et son statut vérifié.
4. Une traduction moderne de saint Thomas, d’un Père de l’Église ou de Bossuet n’est pas automatiquement libre simplement parce que l’auteur original est ancien. Privilégier le latin original, une édition ancienne clairement libre, ou la paraphrase sourcée.
5. Les liens externes servent de références : ne pas copier automatiquement le contenu éditorial des sites tiers.
6. Conserver dans chaque fichier de messe la provenance de Crampon et les sources du commentaire.

## Éléments techniques inspectés

Audit du dépôt `thomasjulien5-create/Ad-Fontes` : `app.js`, `index.html`, `service-worker.js`, `README.md`, `manifest.webmanifest`, `styles.css`, `icon.svg`, méditations et commentaires de messe actuellement archivés.

Dépendances distantes réellement appelées par l’interface : `categpt.chat` pour le calendrier/données VOM. Les autres domaines présents dans les JSON sont des liens documentaires cliquables. Les PDF Liberius de *La Moelle* sont liés, non embarqués dans le dépôt.

## Conclusion opérationnelle

L’architecture actuelle est compatible avec une stratégie « sources anciennes / domaine public » à condition de maintenir les garde-fous ci-dessus. Le principal point nécessitant un contrôle au fil de l’eau est *La Moelle* 1930 lorsque l’édition reprend explicitement une traduction tierce. Toute nouvelle source textuelle intégrale doit être ajoutée à ce registre avant déploiement.
