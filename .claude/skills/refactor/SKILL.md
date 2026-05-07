---
name: refactor
description: Analyser et refactoriser du code pour améliorer la lisibilité, la performance et la maintenabilité
argument-hint: <fichier-ou-dossier> (obligatoire)
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Analyse et refactorise le code spécifié ($ARGUMENTS).

## Principes de refactoring

Applique ces principes par ordre de priorité :

1. **Lisibilité d'abord** : le code doit être compréhensible sans commentaire
2. **DRY** (Don't Repeat Yourself) : élimine la duplication
3. **Responsabilité unique** : chaque fonction fait UNE chose
4. **Nommage explicite** : les noms doivent dire ce que fait le code
5. **Gestion d'erreurs** : ne jamais ignorer silencieusement une erreur

## Processus

### 1. Analyse
- Lis le code et identifie les « code smells »
- Classe les problèmes par impact (critique, important, mineur)
- Vérifie qu'il y a des tests existants (pour ne rien casser)

### 2. Planification
- Propose un plan de refactoring avec les changements prévus
- Explique POURQUOI chaque changement est bénéfique
- Estime le risque de régression pour chaque changement

### 3. Exécution
- Applique les changements un par un
- Après chaque changement, lance les tests si disponibles
- Si un test casse, annule le changement et explique pourquoi

### 4. Vérification
- Lance la suite de tests complète
- Vérifie que le build passe
- Résume les changements effectués avec avant/après

## Important
- Ne change JAMAIS le comportement visible du code (sauf correction de bug évident)
- Privilégie les petits changements incrémentaux aux refactorings massifs
- Si le code n'a pas de tests, propose d'en ajouter AVANT de refactoriser