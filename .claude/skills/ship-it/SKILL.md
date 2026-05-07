---
name: ship-it
description: When everything is ready and you just need to ship the code, run the final tests, prepare a commit message and commit/push after human validation. Use when user says "ship it", "ready to merge", or "finalize the PR".
---

When everything is ready and you just need to ship the code, run the final tests, and prepare a commit message.

Use this skill when the user says "ship it", "ready to merge", or "finalize the PR". The focus here is on final validation and crafting a clear, concise commit message that summarizes the changes and their impact.

## Processus

1. **Validation finale** : Exécute les tests finaux (unitaires, e2e, lint) pour t'assurer que tout est en ordre. Si un test échoue, annule le processus de shipping et informe l'utilisateur du problème.

2. **Préparation du message de commit** : Rédige un message de commit clair et informatif qui résume les changements apportés, leur raison d'être, et leur impact potentiel. Utilise le format de commit conventionnel si applicable. Demande une validation avant de procéder au commit.

3. **Commit et push** : Une fois le message de commit validé, git add les fichiers modifiés et les nouveaux fichiers, effectue le commit et pousse les changements vers la branche distante. Informe l'utilisateur que le code a été expédié avec succès.
