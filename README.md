# Rylmat — statyczna strona

Pliki w folderze „Rylmat” na Twoim pulpicie (`c:\Users\kolin\Desktop\Nowy folder\Rylmat`). Strona działa bez logowania i bez bazy, w czystym HTML/CSS/JS, z językami PL/EN/DE, dropdownem kategorii, FAQ, regulaminem, cookies oraz banerem cookie.

## Jak otworzyć
- Najprościej: kliknij dwukrotnie `index.html` (przeglądarka). Przy pracy z językami i fetch może być wygodniej uruchomić prosty serwer:
  - PowerShell: `python -m http.server 8080` (jeśli masz Pythona)
  - Albo `npx serve .` / `npx http-server .` w tym folderze
- Wejdź na `http://localhost:8080`.

## Struktura
- `index.html` — strona główna
- `help.html`, `info.html`, `terms.html`, `cookies.html` — podstrony
- `categories/` — landingi kategorii
- `css/style.css` — styl
- `js/app.js` — nawigacja, i18n, FAQ, baner cookies
- `i18n/*.json` — tłumaczenia
- `assets/logo.png` — wstaw tu swoje logo (plik nie jest dodany)

## Uwagi
- Ścieżki ustawione względnie, żeby działało z dysku i przez prosty serwer.
- Teksty regulaminu/cookies są skrótem — uzupełnij treścią prawną.
- Zmień e-mail/telefon w plikach `i18n/*.json` jeśli potrzeba.

## Następne kroki
- Podmień `assets/logo.png` prawdziwym logo.
- (Opcjonalnie) dodać formularz kontaktowy (front-only) lub przejść do etapu logowanie/rejestracja.
