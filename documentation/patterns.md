# Patterns

## Key bump — synchronisation entre composants siblings

Quand deux composants siblings doivent se synchroniser sans lever tout l'état, on passe un compteur `refreshKey` en prop au composant "récepteur" et on l'incrémente depuis le composant "émetteur" via un callback.

```tsx
// Parent
const [refreshKey, setRefreshKey] = useState(0)
<Emitter onDone={() => setRefreshKey((k) => k + 1)} />
<Receiver refreshKey={refreshKey} />

// Receiver
useEffect(() => {
  void fetchData()
}, [refreshKey])
```

Le `refreshKey` ne transporte aucune donnée — il déclenche juste un re-fetch immédiat. Le récepteur reste autonome pour tout le reste (polling, état interne, etc.).

**Exemple dans le code :** `UploadSection` → `ImportsSection` dans `frontend/src/pages/Admin.tsx`.
