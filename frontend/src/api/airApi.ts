export const fetchAirQuality = async (city: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (city.toLowerCase() === "nibylandia") {
        reject(new Error("Nie znaleziono stacji pomiarowej dla tego miasta"));
      } else {
        resolve({
          city: city.charAt(0).toUpperCase() + city.slice(1),
          index: "GOOD",
          details: {
            pm10: 20,
            pm25: 12,
            no2: 10
          }
        });
      }
    }, 1500);
  });
};