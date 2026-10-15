"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { CloudSun, Droplets, Wind, Loader2 } from "lucide-react";

export function WeatherWidget() {
  const { t, lang } = useLanguage();
  const [weather, setWeather] = useState<{ temp: number; humidity: number; windSpeed: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();
        
        if (data.main) {
          setWeather({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          });
        }
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };

    // Default coordinates (Tunis) in case geolocation is denied or unavailable
    const defaultLat = 36.8065;
    const defaultLon = 10.1815;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation access denied or failed. Using default location.", error);
          fetchWeather(defaultLat, defaultLon);
        },
        { timeout: 10000 } // Wait max 10 seconds before falling back
      );
    } else {
      fetchWeather(defaultLat, defaultLon);
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-2xl"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            {t("farmer_tools.weather")}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{t("farmer_tools.weather_desc")}</p>
        </div>
        
        <div className="text-3xl font-extrabold text-gray-900 flex items-center justify-center min-w-[60px]">
          {loading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : weather ? (
            <>
              {weather.temp}°<span className="text-xl text-gray-400">C</span>
            </>
          ) : (
            "--"
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase">{t("farmer_tools.humidity")}</p>
            <p className="font-bold text-gray-800 text-sm">
              {loading ? "--" : weather ? `${weather.humidity}%` : "--"}
            </p>
          </div>
        </div>
        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-teal-600 uppercase">{t("farmer_tools.wind")}</p>
            <p className="font-bold text-gray-800 text-sm">
              {loading ? "--" : weather ? `${weather.windSpeed} ${lang === "fr" ? "km/h" : "كم/س"}` : "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
