# API & Hook Patterns

## Data Fetching & Mutation
All data operations should be performed through custom hooks to keep components clean.

### Pattern Example: `useModule`
```typescript
export function useModule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const notification = useNotification();

  const fetchData = async () => {
    // API logic
  };

  const createItem = async (payload) => {
    // POST logic
  };

  return { data, loading, fetchData, createItem };
}
```

## Notification System
Inject the `useNotification` context to provide high-fidelity feedback for all asynchronous operations.
- `notification.success(message)`
- `notification.error(message)`
- `notification.confirm({ title, message, onConfirm })`

## Bulk Operations
Standardized CSV import pattern is used across Regions, Chapters, Students, and Collections. Use the provided CSV templates found in each module's bulk modal.

## Role-Based Access Control
Ensure all API endpoints and UI actions verify the `session.user.role`.
- `NATIONAL_ADMIN`: Network-wide controls.
- `REGIONAL_ADMIN`: Regional controls.
- `LOCAL_ADMIN`: Chapter-level controls.
