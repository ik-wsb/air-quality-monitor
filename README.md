# Monitor jakości powietrza

## Opis projektu
Aplikacja pokazująca aktualny poziom zanieczyszczeń powietrza w wybranym mieście, integrująca się z darmowym API GIOŚ lub Open AQ. 

**Główne założenia:**
* Pobieranie danych z darmowego API.
* Archiwizowanie danych w bazie danych.
* Ograniczenie zapytań do zewnętrznego API: jeśli dane w bazie są młodsze niż X godzin, system nie wykonuje ponownego zapytania.
* Zastosowanie pamięci podręcznej (Cache) dla najczęściej wyszukiwanych miast.
* Wystawienie REST API pod adresem: `GET /air-quality/{city}`.
* Prezentacja wskaźników na frontendzie wraz z prostą klasyfikacją.

## Role w zespole
* **Kierownik projektu / Analityk:** Filip Wójcik
* **Programista frontend:** Filip Wójcik
* **Lider techniczny / DevOps / Backend:** Igor Kotlik

## Stos technologiczny
* **Backend:** Python + FastAPI (AWS)
* **Frontend:** React + TypeScript (AWS)
* **Baza / Cache:** PostgreSQL + Redis

## Przypadki użycia (Use Cases)
* **UC1 - Wyszukanie miasta (dane aktualne w bazie / cache):** System pobiera wynik ze swojej bazy lub pamięci podręcznej.
* **UC2 - Wyszukanie miasta (brak w DB / dane przeterminowane):** Backend odpytuje zewnętrzne API (GIOŚ) o najnowsze odczyty.
* **UC3 - Odpytanie przez REST API:** Integrator wysyła żądanie `GET /air-quality/{city}`.
* **UC4 - Błędne miasto / brak stacji:** Aplikacja webowa obsługuje błąd 404 i wyświetla komunikat.