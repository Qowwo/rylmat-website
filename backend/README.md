# Backend Rylmat

Prosty backend dla systemu logowania/rejestracji.

## Instalacja

```bash
cd backend
npm install
```

## Uruchomienie

```bash
npm start
```

Serwer uruchomi się na `http://localhost:3000`

## Endpointy

- `POST /api/register` - rejestracja użytkownika
  - Body: `{ "email": "user@example.com", "password": "haslo123" }`
- `POST /api/login` - logowanie
  - Body: `{ "email": "user@example.com", "password": "haslo123" }`
  - Zwraca: `{ "token": "jwt-token", "email": "user@example.com" }`

- `GET /api/verify` - weryfikacja tokenu
  - Header: `Authorization: Bearer <token>`

## Bezpieczeństwo

⚠️ **WAŻNE**: Zmień wartość `SECRET` w server.js przed wdrożeniem na produkcję!

```javascript
const SECRET = "losowy-długi-ciąg-znaków-2024";
```

## Baza danych

SQLite - plik `users.db` zostanie automatycznie utworzony w folderze backend.
