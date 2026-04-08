import httpx
import asyncio
from typing import Optional, Dict, Any

GIOS_BASE_URL = "https://api.gios.gov.pl/pjp-api/v1/rest"

async def fetch_air_quality(city_name: str) -> Optional[Dict[str, Any]]:
    async with httpx.AsyncClient() as client:
        try:
            # Pobieramy wszystkie dostępne stacje pomiarowe z polskiego API GIOS
            stations_resp = await client.get(f"{GIOS_BASE_URL}/station/findAll?page=0&size=1000")
            if stations_resp.status_code != 200:
                return None
                
            # Szukamy tylko stacji, które znajdują się w podanym mieście
            stations = stations_resp.json().get("Lista stacji pomiarowych", [])
            city_stations = [s for s in stations if s.get("Nazwa miasta", "").lower() == city_name.lower()]
            
            if not city_stations:
                print(f"[DEBUG] Nie znaleziono żadnej stacji dla miasta: {city_name}")
                return None

            rzeczywista_nazwa_miasta = city_stations[0]["Nazwa miasta"]
            
            # Inicjalizujemy słownik do przechowywania wyników - zaczynamy bez wartości
            results = {
                "city": rzeczywista_nazwa_miasta,
                "overall_status": None,
                "pm10": None,
                "pm25": None,
                "no2": None,
                "o3": None,
                "so2": None,
                "co": None
            }
            
            # Mapujemy nazwy wskaźników z API na nasze właściwości
            code_map = {
                "PM10": "pm10", 
                "PM2.5": "pm25", 
                "NO2": "no2", 
                "O3": "o3",
                "SO2": "so2",
                "CO": "co"
            }

            print(f"[DEBUG] Znaleziono {len(city_stations)} stacji dla miasta {rzeczywista_nazwa_miasta}. Zbieram dane...")

            # Dla każdej stacji pobieramy dostępne pomiary
            for station in city_stations:
                station_id = station["Identyfikator stacji"]
                
                if not results["overall_status"]:
                    index_resp = await client.get(f"{GIOS_BASE_URL}/aqindex/getIndex/{station_id}")
                    if index_resp.status_code == 200:
                        status = index_resp.json().get("AqIndex", {}).get("Nazwa kategorii indeksu")
                        if status:
                            results["overall_status"] = status

                # Pobieramy listę czujników dostępnych na stacji
                sensors_resp = await client.get(f"{GIOS_BASE_URL}/station/sensors/{station_id}?page=0&size=50")
                if sensors_resp.status_code != 200:
                    continue
                    
                sensors_data = sensors_resp.json()
                # API zwraca dane w postaci słownika - wyciągamy listę z możliwych wartości
                sensors_list = next((v for v in sensors_data.values() if isinstance(v, list)), [])

                # Dla każdego czujnika sprawdzamy czy to jeden ze wskaźników, którymi się interesujemy
                for sensor in sensors_list:
                    sensor_code = sensor.get("Wskaźnik - kod")
                    sensor_id = sensor.get("Identyfikator stanowiska")
                    
                    if sensor_code in code_map and sensor_id:
                        key = code_map[sensor_code]
                        
                        # Pobieramy dane tylko jeśli jeszcze ich nie mamy (pierwsza znaleziona wartość)
                        if results[key] is None:
                            data_resp = await client.get(f"{GIOS_BASE_URL}/data/getData/{sensor_id}")
                            if data_resp.status_code == 200:
                                # Wyciągamy listę wartości pomiarów z odpowiedzi
                                values_list = next((v for v in data_resp.json().values() if isinstance(v, list)), [])
                                # Bierzemy najświeższą wartość (pierwszą, która nie jest None)
                                latest_value = next((item.get("Wartość") for item in values_list if item.get("Wartość") is not None), None)
                                
                                if latest_value is not None:
                                    results[key] = latest_value
                                    print(f" -> Pobrano {sensor_code}: {latest_value} ze stacji ID: {station['Identyfikator stacji']}")

            if not results["overall_status"]:
                results["overall_status"] = "Brak danych"

            return results

        except httpx.RequestError as e:
            print(f"[DEBUG] Wystąpił błąd sieciowy: {e}")
            return None