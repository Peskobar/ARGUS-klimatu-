import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json({ limit: '15mb' }));

// Plant Recognition API Endpoint
app.post('/api/identify', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: 'Klucz GEMINI_API_KEY nie został skonfigurowany. Dodaj go w ustawieniach (Ustawienia > Sekrety).',
      });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Brak obrazu w żądaniu.' });
    }

    // Extract mime type and base64 encoded data
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = image.match(/data:([^;]+);/);
      if (match) {
        mimeType = match[1];
      }
      base64Data = parts[1];
    }

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const prompt = `Jesteś ekspertem ogrodnictwa indoor i outdoor. Zanalizuj to zdjęcie rośliny i zwróć szczegółowy raport w formacie JSON w języku polskim.
Opisz roślinę, zidentyfikuj jej gatunek (nazwę polską i naukową), podaj instrukcje pielęgnacji, częstotliwość podlewania w dniach, optymalny harmonogram nawożenia (interwał w dniach, zalecany typ nawozu), poziom trudności oraz parametry klimatyczne uprawy indoor w namiocie growbox (temperatura w dzień/noc, wilgotność, VPD).

Odpowiedź musi zawierać wyłącznie poprawny obiekt JSON pasujący do schematu TypeScript:
{
  "isPlant": boolean, // true jeśli na zdjęciu pomyślnie rozpoznano roślinę, false w przeciwnym razie
  "plantName": string, // Powszechna polska nazwa rośliny (np. Monstera dziurawa) lub puste jeśli isPlant jest false
  "scientificName": string, // Nazwa naukowa (np. Monstera deliciosa)
  "description": string, // Krótki profesjonalny opis cech i wymagań rośliny (np. 3-4 zdania po polsku)
  "lightRequirement": string, // Poziom światła (np. Jasne stanowisko o rozproszonym świetle)
  "wateringDescription": string, // Jak dokładnie podlewać (np. Podlewaj gdy gleba przeschnie na głębokości 3 cm)
  "wateringIntervalDays": number, // Sugerowany odstęp w dniach (liczba całkowita, np. 7 lub 10)
  "fertilizationDescription": string, // Szczegóły nawożenia (np. Zasilaj nawozem do roślin zielonych w okresie wegetacji)
  "fertilizationIntervalDays": number, // Sugerowany odstęp w dniach (np. 14 lub 21)
  "humidityRequirement": string, // Wymagana wilgotność (np. Umiarkowana, ok. 50-60%)
  "temperatureRequirement": string, // Tolerancja temp (np. 18-24°C)
  "difficulty": "Łatwa" | "Średnia" | "Trudna",
  "indoorParameters": {
    "tempDay": number, // rekomendowana temp w dzień (°C) (np. 24)
    "tempNight": number, // rekomendowana temp w nocy (°C) (np. 18)
    "humidityMin": number, // wilgotność min (%) (np. 50)
    "humidityMax": number, // wilgotność max (%) (np. 65)
    "vpdTarget": number // rekomendowany VPD w kPa (np. 0.95)
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        imagePart,
        { text: prompt },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textResponse = response.text ? response.text.trim() : '{}';
    const result = JSON.parse(textResponse);

    return res.json(result);
  } catch (error: any) {
    console.error('Błąd rozpoznawania rośliny:', error);
    return res.status(500).json({
      error: `Wystąpił błąd podczas analizowania zdjęcia przez sztuczną inteligencję: ${error.message || error}`,
    });
  }
});

// Setup dev server with Vite middleware or serve built resources in production
async function start() {
  if (process.env.NODE_ENV === 'production' || process.env.IS_PROD === 'true') {
    // Serve static frontend from dist/
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dynamic Vite Dev Server integration
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Growbox Server] Słucha na porcie ${PORT} (Vite mode: ${process.env.NODE_ENV !== 'production' ? 'Development' : 'Production'})`);
  });
}

start();
