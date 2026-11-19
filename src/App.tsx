/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Droplet, 
  Calendar, 
  Wind, 
  Sun, 
  Thermometer, 
  CloudRain, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Info, 
  Heart,
  Timer,
  Compass,
  ArrowRight,
  Wifi,
  Radio,
  FileImage,
  Layers,
  Check,
  Moon,
  Zap,
  Cpu,
  Target,
  Brain,
  Eye,
  ShieldAlert,
  Scale,
  Ruler,
  Leaf,
  Sprout,
  TestTube,
  Beaker,
  Radar,
  ListChecks,
  Network
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MOCK_HISTORY_DATA = Array.from({ length: 24 }).map((_, i) => {
  const hour = new Date().getHours() - 23 + i;
  const displayHour = hour < 0 ? 24 + hour : hour;
  const isDaytime = displayHour >= 6 && displayHour <= 22;
  return {
    time: `${displayHour.toString().padStart(2, '0')}:00`,
    temp: isDaytime ? 24 + Math.random() * 2 : 19 + Math.random() * 1.5,
    humidity: isDaytime ? 55 + Math.random() * 10 : 65 + Math.random() * 8,
  };
});

// Interfaces for our Gardening Assistant App
interface IndoorParameters {
  tempDay: number;
  tempNight: number;
  humidityMin: number;
  humidityMax: number;
  vpdTarget: number;
}

interface Plant {
  id: string;
  plantName: string;
  scientificName: string;
  description: string;
  lightRequirement: string;
  wateringDescription: string;
  wateringIntervalDays: number;
  fertilizationDescription: string;
  fertilizationIntervalDays: number;
  humidityRequirement: string;
  temperatureRequirement: string;
  difficulty: 'Łatwa' | 'Średnia' | 'Trudna';
  indoorParameters: IndoorParameters;
  // User custom values
  lastWateredDate: string;
  lastFertilizedDate: string;
  phase: 'Kiełkowanie' | 'Wzrost (Wegetacja)' | 'Kwitnienie';
  notes?: string;
  assignedToGrowbox: boolean;
  image?: string;
}

// Preset plants for immediate awesome user feedback and testing
const INITIAL_PRESET_PLANTS: Plant[] = [
  {
    id: 'preset-1',
    plantName: 'Monstera dziurawa (Królowa Salonu)',
    scientificName: 'Monstera deliciosa',
    description: 'Niezwykle modna roślina pnąca o dużych, charakterystycznie powcinanych liściach. Uwielbia umiarkowane podlewanie i lekko podniesioną wilgotność powietrza.',
    lightRequirement: 'Jasne stanowisko z rozproszonym światłem',
    wateringDescription: 'Podlewaj obficie, gdy górna warstwa ziemi (ok. 3-5 cm) zupełnie przeschnie.',
    wateringIntervalDays: 7,
    fertilizationDescription: 'Zasilaj nawozem do roślin zielonych raz na dwa tygodnie wiosną i latem.',
    fertilizationIntervalDays: 14,
    humidityRequirement: 'Średnia do wysokiej, ok. 50-70%',
    temperatureRequirement: '18-24°C, nie toleruje przeciągów',
    difficulty: 'Średnia',
    indoorParameters: {
      tempDay: 23,
      tempNight: 19,
      humidityMin: 55,
      humidityMax: 70,
      vpdTarget: 0.95
    },
    lastWateredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dni temu
    lastFertilizedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 dni temu
    phase: 'Wzrost (Wegetacja)',
    notes: 'Przetrzeć liście z kurzu raz na miesiąc wilgotną szmatką.',
    assignedToGrowbox: true,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'preset-2',
    plantName: 'Zioło Medyczne / Oregano Sycylijskie',
    scientificName: 'Origanum vulgare subsp. hirtum',
    description: 'Silnie aromatyczny podgatunek oregano o wysokiej zawartości olejków eterycznych. Przeznaczona do intensywnej uprawy indoor w namiocie w celu uzyskania unikalnego aromatu.',
    lightRequirement: 'Bardzo jasne stanowisko, bezpośrednie silne światło xLED',
    wateringDescription: 'Podlewaj rzadziej, nie znosi zastoju wody. Ziemia musi dobrze przeschnąć przed kolejną dawką.',
    wateringIntervalDays: 5,
    fertilizationDescription: 'Nawozić organicznym nawozem bogatym w fosfor i potas w fazie kwitnienia.',
    fertilizationIntervalDays: 10,
    humidityRequirement: 'Średnia, ok. 45-55% w fazie wzrostu, poniżej 45% w fazie kwitnienia',
    temperatureRequirement: '21-27°C przy włączonych lampach',
    difficulty: 'Łatwa',
    indoorParameters: {
      tempDay: 25,
      tempNight: 18,
      humidityMin: 45,
      humidityMax: 55,
      vpdTarget: 1.25
    },
    lastWateredDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 dni temu
    lastFertilizedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dni temu
    phase: 'Kwitnienie',
    notes: 'Wyjątkowy zapach w namiocie growbox. Zastosowano filtr węglowy Prima Klima na najwyższym biegu.',
    assignedToGrowbox: true,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

// Example presets with pre-converted base64-like structures or images for AI fallback testing
const AI_SAMPLE_PHOTOS = [
  {
    name: 'Paproć Królewska',
    description: 'Testuj analizator rzadkich paproci',
    imageUrl: 'https://images.unsplash.com/photo-1512428813824-f713c2411abb?w=500&auto=format&fit=crop&q=60',
    mockResult: {
      isPlant: true,
      plantName: 'Niekropień wdzięczny (Adiantum)',
      scientificName: 'Adiantum raddianum',
      description: 'Niezwykle wdzięczna i puszysta paproć domowa o delikatnych liściach na czarnych ogonkach. Ma wysokie wymagania co do wilgotności powietrza, idealna do zamkniętych warunków.',
      lightRequirement: 'Półcień lub światło rozproszone. Unikać słońca.',
      wateringDescription: 'Ziemia stale lekko wilgotna, ale nie bagnista. Podlewać miękką wodą.',
      wateringIntervalDays: 4,
      fertilizationDescription: 'Slaba dawka nawozu bio raz na 21 dni.',
      fertilizationIntervalDays: 21,
      humidityRequirement: 'Bardzo wysoka (powyżej 65%)',
      temperatureRequirement: '20-24°C',
      difficulty: 'Trudna',
      indoorParameters: {
        tempDay: 22,
        tempNight: 18,
        humidityMin: 65,
        humidityMax: 80,
        vpdTarget: 0.70
      }
    }
  },
  {
    name: 'Fikus Ginseng Bonsai',
    description: 'Testuj drzewko bonsai',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500&auto=format&fit=crop&q=60',
    mockResult: {
      isPlant: true,
      plantName: 'Figowiec tępy (Ficus Retusa)',
      scientificName: 'Ficus microcarpa',
      description: 'Egzotyczne miniaturowe drzewko o grubych, bulwiastych korzeniach i błyszczących liściach. Uwielbia jasne stanowisko i stałą opiekę pielęgnacyjną.',
      lightRequirement: 'Jasne, dobrze doświetlone miejsce.',
      wateringDescription: 'Umiarkowane, podlewać gdy wierzchnia warstwa ziemi lekko przeschnie.',
      wateringIntervalDays: 8,
      fertilizationDescription: 'Nawóz do bonsai raz na 14 dni od wiosny do jesieni.',
      fertilizationIntervalDays: 14,
      humidityRequirement: 'Umiarkowana, ok. 50-60%',
      temperatureRequirement: '18-25°C',
      difficulty: 'Średnia',
      indoorParameters: {
        tempDay: 24,
        tempNight: 19,
        humidityMin: 50,
        humidityMax: 65,
        vpdTarget: 1.10
      }
    }
  },
  {
    name: 'Sansewieria Gwinejska',
    description: 'Testuj roślinę oczyszczającą powietrze',
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=500&auto=format&fit=crop&q=60',
    mockResult: {
      isPlant: true,
      plantName: 'Wężownica gwinejska',
      scientificName: 'Sansevieria trifasciata',
      description: 'Niewymagająca, żelazna roślina o sztywnych mieczowatych liściach. Znakomicie filtruje powietrze z toksyn, idealna do sypialni oraz trudnych warunków rzadkiej opieki.',
      lightRequirement: 'Toleruje cień, najlepiej rośnie w rozproszonym świetle.',
      wateringDescription: 'Bardzo oszczędne, podlewaj dopiero gdy cała bryła ziemna wyschnie.',
      wateringIntervalDays: 15,
      fertilizationDescription: 'Słaby nawóz dla kaktusów raz w miesiącu latem.',
      fertilizationIntervalDays: 30,
      humidityRequirement: 'Poradzi sobie w suchej atmosferze (30-40%)',
      temperatureRequirement: '15-28°C',
      difficulty: 'Łatwa',
      indoorParameters: {
        tempDay: 22,
        tempNight: 17,
        humidityMin: 35,
        humidityMax: 50,
        vpdTarget: 1.40
      }
    }
  }
];

export default function App() {
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('gardening_plants');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PRESET_PLANTS;
  });

  // Growbox state
  const [isGrowboxOn, setIsGrowboxOn] = useState<boolean>(true);
  const [fanGear, setFanGear] = useState<'off' | 'low' | 'high'>('low'); // Prima Klima: off, 200m3 (low), 400m3 (high)
  const [lightsOn, setLightsOn] = useState<boolean>(true);
  const [lightDimmer, setLightDimmer] = useState<number>(80); // 0-100% Lumii LED
  const [lightingMode, setLightingMode] = useState<'veg' | 'flow' | 'custom'>('veg'); // 18/6, 12/12, etc.
  
  // Simulated dynamic sensor status inside Diamond Box (runs every 5 seconds)
  const [simulatedTemp, setSimulatedTemp] = useState<number>(24.2);
  const [simulatedHumidity, setSimulatedHumidity] = useState<number>(58.0);
  const [carbonFilterLife, setCarbonFilterLife] = useState<number>(93.4);
  const [simulatedVpd, setSimulatedVpd] = useState<number>(1.12);

  // AI Scanner state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [cameraMode, setCameraMode] = useState<boolean>(false);
  
  // AI Spectrum Analysis state
  const [spectrumFile, setSpectrumFile] = useState<File | null>(null);
  const [spectrumPreview, setSpectrumPreview] = useState<string | null>(null);
  const [isAnalyzingSpectrum, setIsAnalyzingSpectrum] = useState<boolean>(false);
  const [spectrumResult, setSpectrumResult] = useState<any | null>(null);
  
  // Handle AI Spectrum analysis
  const handleSpectrumFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSpectrumFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSpectrumPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSpectrumResult(null);
    }
  };

  const MOCK_SPECTRUM_RESULTS = [
    {
      condition: 'Wykryto nadmierne wydłużanie łodyg (Etiolacja)',
      goal: 'Zagęszczenie pokroju i skrócenie międzywęźli',
      action: 'Podkręć pasmo niebieskie (400-500 nm)',
      actionDetails: 'Zwiększenie udziału światła niebieskiego zahamuje produkcję auksyn odpowiadających za wzrost w górę. Roślina stanie się bardziej krępa, a jej liście grubsze i ciemniejsze.',
      icon: 'blue'
    },
    {
      condition: 'Roślina w dojrzałej fazie wegetacyjnej / pre-flowering',
      goal: 'Przyspieszenie indukcji kwitnienia (Zarządzanie fitohromem)',
      action: 'Dodaj uderzenie dalekiej czerwieni (Far-Red 730 nm) jako "Zasypianie"',
      actionDetails: 'Wykorzystaj promieniowanie Far-Red przez 15 minut tuż po wyłączeniu głównego oświetlenia. Błyskawicznie przełączy to formę fitohromu (Pfr -> Pr), sprawiając, że roślina "szybciej zasypia", co może przyspieszyć kwitnienie o 1-2 tygodnie.',
      icon: 'red'
    },
    {
      condition: 'Zaawansowane kwitnienie / produkcja żywicy',
      goal: 'Zwiększenie produkcji terpenów i olejków eterycznych',
      action: 'Załącz promieniowanie UV-A/UV-B na 2-4h dziennie',
      actionDetails: 'Lekki stres świetlny w spektrum UV w środku cyklu świetlnego symuluje ostre słońce górskie. Roślina w obronie przed promieniowaniem wyprodukuje grubszą warstwę trichomów/wosków i diametralnie zwiększy aromat.',
      icon: 'uv'
    }
  ];

  const handleAnalyzeSpectrum = () => {
    if (!spectrumPreview) return;
    setIsAnalyzingSpectrum(true);
    setSpectrumResult(null);
    
    // Simulate AI processing the photo
    setTimeout(() => {
      // Pick random result based on length
      const randomResult = MOCK_SPECTRUM_RESULTS[Math.floor(Math.random() * MOCK_SPECTRUM_RESULTS.length)];
      setSpectrumResult({
        ...randomResult,
        ppfdAdvice: 'Utrzymaj obecne DLI',
      });
      setIsAnalyzingSpectrum(false);
    }, 2000);
  };
  
  // Custom plant wizard modal/form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPlantName, setNewPlantName] = useState('');
  const [newScientificName, setNewScientificName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newWaterInterval, setNewWaterInterval] = useState(7);
  const [newFertInterval, setNewFertInterval] = useState(14);
  const [newDifficulty, setNewDifficulty] = useState<'Łatwa' | 'Średnia' | 'Trudna'>('Średnia');
  const [newTempDay, setNewTempDay] = useState(24);
  const [newHumidityMin, setNewHumidityMin] = useState(50);

  // Active viewing/monitoring tabs
  const [activeSegment, setActiveSegment] = useState<'growbox' | 'optimization' | 'nutrition' | 'scanner' | 'plants' | 'guide' | 'reality' | 'mirror'>('growbox');
  const [currentTime, setCurrentTime] = useState(new Date());

  // EC Nutrition Calculator states
  const [calcPhase, setCalcPhase] = useState<'seedling' | 'veg' | 'early_flow' | 'late_flow'>('veg');
  const [biomassLevel, setBiomassLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [nutrientLine, setNutrientLine] = useState<'mineral' | 'organic'>('mineral');

  // Web camera streaming reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Keep LocalStorage in sync
  useEffect(() => {
    localStorage.setItem('gardening_plants', JSON.stringify(plants));
  }, [plants]);

  // Update current time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Climate Simulation logic
  useEffect(() => {
    if (!isGrowboxOn) {
      // Temp drops to ambient room (e.g. 19.5), humidity rises, VPD drops
      const interval = setInterval(() => {
        setSimulatedTemp(t => Math.max(19.0, t - 0.2 + (Math.random() * 0.1 - 0.05)));
        setSimulatedHumidity(h => Math.min(85.0, h + 0.5 + (Math.random() * 0.2 - 0.1)));
      }, 4000);
      return () => clearInterval(interval);
    }

    // Interactive climate adjustment depending on fan and lights!
    const interval = setInterval(() => {
      setSimulatedTemp(t => {
        // Lights produce heat
        const baseHeatProduction = lightsOn ? (lightDimmer / 100) * 8.5 : 1.5;
        // Prima Klima fan removes heat
        const coolingRatio = fanGear === 'high' ? 6.2 : fanGear === 'low' ? 3.1 : 0.2;
        const targetTemp = 20.0 + baseHeatProduction - coolingRatio + (Math.random() * 0.4 - 0.2);
        // Smooth transition
        return Number((t + (targetTemp - t) * 0.15).toFixed(1));
      });

      setSimulatedHumidity(h => {
        // High fan decreases humidity. Plants raise humidity. No fan allows stale humid air
        const coolingHumidityLeak = fanGear === 'high' ? -3.5 : fanGear === 'low' ? -1.8 : 0.5;
        const targetHumidity = 62.0 + coolingHumidityLeak + (Math.random() * 1.5 - 0.75);
        return Number(Math.max(25, Math.min(95, h + (targetHumidity - h) * 0.12)).toFixed(1));
      });

      setCarbonFilterLife(carb => {
        // Slow degradation if fan is running (based on gear)
        const wearRate = fanGear === 'high' ? 0.005 : fanGear === 'low' ? 0.0025 : 0;
        return Number(Math.max(10, carb - wearRate).toFixed(3));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isGrowboxOn, fanGear, lightsOn, lightDimmer]);

  // Compute live VPD (Vapor Pressure Deficit) automatically
  useEffect(() => {
    // Formula for vapor pressure deficit in kPa:
    // Saturation vapor pressure (Svp) = 0.61078 * exp((17.27 * T) / (T + 237.3))
    // Actual Vapor pressure (Avp) = Svp * (RH / 100)
    // VPD = Svp - Avp
    const temp = simulatedTemp;
    const rh = simulatedHumidity;
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (rh / 100);
    const vpd = Math.max(0.05, svp - avp);
    setSimulatedVpd(parseFloat(vpd.toFixed(2)));
  }, [simulatedTemp, simulatedHumidity]);

  // Get active assigned plant targets to highlight warning flags
  const assignedPlants = plants.filter(p => p.assignedToGrowbox);
  const primaryPlant = assignedPlants.length > 0 ? assignedPlants[0] : null;

  // Reminders trigger calculation helper
  const isWaterDue = (plant: Plant) => {
    const lastWatered = new Date(plant.lastWateredDate).getTime();
    const nextWatered = lastWatered + (plant.wateringIntervalDays * 24 * 60 * 60 * 1000);
    return Date.now() > nextWatered;
  };

  const isFertilizeDue = (plant: Plant) => {
    const lastFert = new Date(plant.lastFertilizedDate).getTime();
    const nextFert = lastFert + (plant.fertilizationIntervalDays * 24 * 60 * 60 * 1000);
    return Date.now() > nextFert;
  };

  const getDaysUntilWater = (plant: Plant) => {
    const lastWatered = new Date(plant.lastWateredDate).getTime();
    const nextWatered = lastWatered + (plant.wateringIntervalDays * 24 * 60 * 60 * 1000);
    const diff = nextWatered - Date.now();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  const getDaysUntilFertilized = (plant: Plant) => {
    const lastFert = new Date(plant.lastFertilizedDate).getTime();
    const nextFert = lastFert + (plant.fertilizationIntervalDays * 24 * 60 * 60 * 1000);
    const diff = nextFert - Date.now();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  // Water single plant function
  const handleWaterPlant = (id: string) => {
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          lastWateredDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  // Fertilize single plant function
  const handleFertilizePlant = (id: string) => {
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          lastFertilizedDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));
  };

  // Change active plant growth phase
  const handlePhaseChange = (id: string, phase: any) => {
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, phase };
      }
      return p;
    }));
  };

  // Toggle Growbox assignment
  const handleToggleGrowboxAssign = (id: string) => {
    setPlants(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, assignedToGrowbox: !p.assignedToGrowbox };
      }
      return p;
    }));
  };

  // Delete plant
  const handleDeletePlant = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę roślinę z bazy?')) {
      setPlants(prev => prev.filter(p => p.id !== id));
    }
  };

  // Web camera activations
  const startCamera = async () => {
    setCameraMode(true);
    setScannerError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setScannerError("Brak dostępu do kamery. Użyj przesyłania plików lub zdjęć przykładowych.");
      setCameraMode(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraMode(false);
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  // Input file processing helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setScanResult(null);
      setScannerError(null);
    }
  };

  // Use preloaded presets for swift interactive evaluation
  const handleUsePresetPhoto = (preset: typeof AI_SAMPLE_PHOTOS[0]) => {
    setImagePreview(preset.imageUrl);
    setSelectedFile(null);
    setScanResult(null);
    setScannerError(null);
    
    // Simulate instantaneous analysis or set up to perform immediate analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      setScanResult(preset.mockResult);
      setIsAnalyzing(false);
    }, 1500);
  };

  // Launch Gemini Analysis request via backend
  const handleAnalyzePhoto = async () => {
    if (!imagePreview) {
      setScannerError('Proszę najpierw wgrać, zrobić zdjęcie lub wybrać szablon rośliny!');
      return;
    }

    setIsAnalyzing(true);
    setScannerError(null);
    setScanResult(null);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imagePreview,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `Serwer zgłosił błąd ${response.status}`);
      }

      const data = await response.json();
      if (data.isPlant) {
        setScanResult(data);
      } else {
        setScannerError('Zdjęcie zostało przesłane, lecz system AI nie rozpoznał jednoznacznie rośliny. Upewnij się, że liście są dobrze widoczne i oświetlone, lub spróbuj ponownie z innym ujęciem.');
      }
    } catch (err: any) {
      console.error(err);
      setScannerError(`Błąd integracji AI: ${err.message || err}. Spróbuj użyć jednego z gotowych szablonów testowych poniżej lub zweryfikuj klucz API w Sekretach.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add recognized plant to inventory list
  const handleAddScannedPlantToInventory = () => {
    if (!scanResult) return;

    const newPlant: Plant = {
      id: 'scanned-' + Date.now(),
      plantName: scanResult.plantName,
      scientificName: scanResult.scientificName || 'Nieznany gatunek',
      description: scanResult.description || 'Pomyślnie zidentyfikowana roślina z systemu AI.',
      lightRequirement: scanResult.lightRequirement || 'Rozproszone światło',
      wateringDescription: scanResult.wateringDescription || 'Podlewać regularnie',
      wateringIntervalDays: scanResult.wateringIntervalDays || 7,
      fertilizationDescription: scanResult.fertilizationDescription || 'Zasilać wg potrzeb',
      fertilizationIntervalDays: scanResult.fertilizationIntervalDays || 14,
      humidityRequirement: scanResult.humidityRequirement || 'Średnia 50%',
      temperatureRequirement: scanResult.temperatureRequirement || '18-24°C',
      difficulty: scanResult.difficulty || 'Średnia',
      indoorParameters: scanResult.indoorParameters || {
        tempDay: 24,
        tempNight: 19,
        humidityMin: 50,
        humidityMax: 65,
        vpdTarget: 1.05
      },
      lastWateredDate: new Date().toISOString().split('T')[0],
      lastFertilizedDate: new Date().toISOString().split('T')[0],
      phase: 'Wzrost (Wegetacja)',
      assignedToGrowbox: true,
      image: imagePreview || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&auto=format&fit=crop&q=60'
    };

    setPlants(prev => [newPlant, ...prev]);
    setActiveSegment('plants');
    setScanResult(null);
    setImagePreview(null);
  };

  // Add Custom manual Plant
  const handleAddCustomPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlantName) return;

    const custom: Plant = {
      id: 'custom-' + Date.now(),
      plantName: newPlantName,
      scientificName: newScientificName || 'Lokalna odmiana',
      description: newDesc || 'Ręcznie dodana roślina do bazy asystenta.',
      lightRequirement: 'Jasne rozproszone oświetlenie',
      wateringDescription: 'Podlewać po przeschnięciu wierzchniej warstwy ziemi.',
      wateringIntervalDays: Number(newWaterInterval),
      fertilizationDescription: 'Nawóz mineralno-organiczny zgodnie ze stężeniem.',
      fertilizationIntervalDays: Number(newFertInterval),
      humidityRequirement: 'Średnia (45-60%)',
      temperatureRequirement: '20-25°C',
      difficulty: newDifficulty,
      indoorParameters: {
        tempDay: Number(newTempDay),
        tempNight: Number(newTempDay - 5),
        humidityMin: Number(newHumidityMin),
        humidityMax: Number(newHumidityMin + 15),
        vpdTarget: 1.05
      },
      lastWateredDate: new Date().toISOString().split('T')[0],
      lastFertilizedDate: new Date().toISOString().split('T')[0],
      phase: 'Wzrost (Wegetacja)',
      assignedToGrowbox: true,
      image: 'https://images.unsplash.com/photo-1520412099551-64b61aa49995?w=500&auto=format&fit=crop&q=60'
    };

    setPlants(prev => [custom, ...prev]);
    setShowAddModal(false);
    setNewPlantName('');
    setNewScientificName('');
    setNewDesc('');
    setActiveSegment('plants');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-black">
      {/* Premium Header Bar */}
      <header className="border-b border-emerald-950/40 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3" id="main-header">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]" id="logo-badge">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white m-0">GARDENIA</h1>
                <span className="text-[10px] font-mono tracking-widest bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-900">
                  PRO GROWBOX
                </span>
              </div>
              <p className="text-xs text-slate-400">Asystent Ogrodniczy & Monitor Diamond Box</p>
            </div>
          </div>

          {/* Core Hardware Metrics Quick Read */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">STATUS:</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="hidden sm:block text-slate-700">|</div>
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-slate-200">{simulatedTemp}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-200">{simulatedHumidity}% RH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400">VPD:</span>
              <span className="text-teal-300 font-bold">{simulatedVpd} kPa</span>
            </div>
            <div className="hidden sm:block text-slate-700">|</div>
            <div className="text-slate-300">
              {currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}  
            </div>
          </div>

        </div>
      </header>

      {/* Segment Navigation */}
      <div className="bg-slate-900/40 border-b border-slate-900/60 p-2 sticky top-[66px] z-20 backdrop-blur-sm" id="sub-navigation">
        <div className="max-w-6xl mx-auto flex justify-start sm:justify-center overflow-x-auto gap-2 py-1 scrollbar-none">
          <button
            id="nav-growbox-btn"
            onClick={() => setActiveSegment('growbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'growbox' 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wind className="w-4 h-4" />
            Growbox Diamond Box
          </button>
          
          <button
            id="nav-optimization-btn"
            onClick={() => setActiveSegment('optimization')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'optimization' 
                ? 'bg-yellow-500 text-slate-950 shadow-[0_4px_12px_rgba(234,179,8,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sun className="w-4 h-4" />
            Optymalizacja Naświetlania
          </button>
          
          <button
            id="nav-nutrition-btn"
            onClick={() => setActiveSegment('nutrition')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'nutrition' 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_4px_12px_rgba(6,182,212,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Beaker className="w-4 h-4" />
            Odżywianie & EC
          </button>
          
          <button
            id="nav-scanner-btn"
            onClick={() => setActiveSegment('scanner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'scanner' 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            Rozpoznaj Roślinę (A.I.)
          </button>

          <button
            id="nav-plants-btn"
            onClick={() => setActiveSegment('plants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'plants' 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Droplet className="w-4 h-4" />
            Terminarz i Moje Uprawy
            <span className="bg-slate-950 text-emerald-400 border border-emerald-900 text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">
              {plants.length}
            </span>
          </button>

          <button
            id="nav-guide-btn"
            onClick={() => setActiveSegment('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'guide' 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Info className="w-4 h-4" />
            Poradnik Wyposażenia
          </button>

          <button
            id="nav-reality-btn"
            onClick={() => setActiveSegment('reality')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'reality' 
                ? 'bg-red-500 text-slate-950 shadow-[0_4px_12px_rgba(239,68,68,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500 group-hover:text-white" />
            <span className="text-red-400 group-hover:text-white">Limity A.I. & Weryfikacja</span>
          </button>

          <button
            id="nav-mirror-btn"
            onClick={() => setActiveSegment('mirror')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap outline-none ${
              activeSegment === 'mirror' 
                ? 'bg-fuchsia-500 text-slate-950 shadow-[0_4px_12px_rgba(217,70,239,0.25)] font-semibold' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radar className="w-4 h-4 text-fuchsia-500 group-hover:text-white" />
            <span className="text-fuchsia-400 group-hover:text-white">Przewidywania Osobiste</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:py-8" id="main-content">
        
        {/* TAB 1: GROWBOX MONITOR & CONTROLLER */}
        {activeSegment === 'growbox' && (
          <div className="space-y-6 animate-fade-in" id="segment-growbox">
            
            {/* Header Area banner with configuration stats */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Wind className="w-64 h-64 text-emerald-500" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold px-2 rounded-full uppercase tracking-wider w-fit mb-2">
                    Namiot Indoor Diamond Box Active
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">System Monitorowania Klimatu</h2>
                  <p className="text-slate-300 text-sm mt-1 max-w-xl">
                    Twój growbox wyposażony jest w certyfikowany wyciąg <span className="text-emerald-400 font-semibold">Prima Klima o wydajności 200/400 m³/h</span> oraz system oświetlenia <span className="text-teal-400 font-semibold">Lumii xLED 300W (dwie lampy po 150W)</span>.
                  </p>
                </div>
                <div className="flex flex-row gap-3">
                  <button 
                    onClick={() => setIsGrowboxOn(!isGrowboxOn)}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
                      isGrowboxOn 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10' 
                        : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10'
                    }`}
                  >
                    <Activity className="w-4 h-4 animate-pulse" />
                    {isGrowboxOn ? 'WYŁĄCZ MONITORING' : 'WŁĄCZ MONITORING'}
                  </button>
                </div>
              </div>

              {/* Connected Plant Target Alert */}
              {isGrowboxOn && primaryPlant && (
                <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-emerald-850/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-slate-400">Zsynchronizowano cele uprawowe z rośliną:</span>
                    <strong className="text-emerald-400">{primaryPlant.plantName}</strong>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-slate-300">
                    <div>Cel Temp: <span className="text-white font-bold">{primaryPlant.indoorParameters.tempDay}°C</span></div>
                    <div>Cel Wilgotność: <span className="text-white font-bold">{primaryPlant.indoorParameters.humidityMin}-{primaryPlant.indoorParameters.humidityMin+15}%</span></div>
                    <div>Cel VPD: <span className="text-teal-400 font-bold">{primaryPlant.indoorParameters.vpdTarget} kPa</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Core Sensors Box & Visual Representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Gauges Column */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4" id="climatic-sensors">
                
                {/* Temperature Sensor widget */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Temperatura</p>
                    <div className="w-8 h-8 rounded-lg bg-orange-950/40 flex items-center justify-center text-orange-400 border border-orange-900/30">
                      <Thermometer className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-4">
                    <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                      {isGrowboxOn ? `${simulatedTemp}°C` : '--.-'}
                    </span>
                    {isGrowboxOn && primaryPlant && (
                      <div className="mt-2 text-xs">
                        {simulatedTemp > primaryPlant.indoorParameters.tempDay + 2 ? (
                          <span className="text-red-400 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Za gorąco! Zwiększ wyciąg.
                          </span>
                        ) : simulatedTemp < primaryPlant.indoorParameters.tempNight - 1 ? (
                          <span className="text-blue-400 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Za zimno dla uprawy.
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Temperatura optymalna
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex justify-between items-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/40">
                    <span>Cel Dzień:</span>
                    <span className="text-slate-300 font-bold">{primaryPlant ? `${primaryPlant.indoorParameters.tempDay}°C` : '24.0°C'}</span>
                  </div>
                  {/* Subtle decorative graph */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-60"></div>
                </div>

                {/* Humidity Sensor widget */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Wilgotność</p>
                    <div className="w-8 h-8 rounded-lg bg-blue-950/40 flex items-center justify-center text-blue-400 border border-blue-900/30">
                      <Droplet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-4">
                    <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                      {isGrowboxOn ? `${simulatedHumidity}%` : '--.-'}
                    </span>
                    {isGrowboxOn && primaryPlant && (
                      <div className="mt-2 text-xs">
                        {simulatedHumidity > primaryPlant.indoorParameters.humidityMax ? (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Zbyt wilgotno (pleśń!)
                          </span>
                        ) : simulatedHumidity < primaryPlant.indoorParameters.humidityMin ? (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Zbyt sucho dla wegetacji
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Wilgotność idealna
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex justify-between items-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/40">
                    <span>Przedział celu:</span>
                    <span className="text-slate-300 font-bold">
                      {primaryPlant 
                        ? `${primaryPlant.indoorParameters.humidityMin}-${primaryPlant.indoorParameters.humidityMax}%` 
                        : '45-65%'
                      }
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-60"></div>
                </div>

                {/* VPD Vapor Pressure Deficit widget */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-teal-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Deficyt Prężności (VPD)</p>
                    <div className="w-8 h-8 rounded-lg bg-teal-950/40 flex items-center justify-center text-teal-400 border border-teal-900/30">
                      <Gauge className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="my-4">
                    <span className="text-4xl font-extrabold text-teal-300 tracking-tight leading-none">
                      {isGrowboxOn ? `${simulatedVpd} kPa` : '--.-'}
                    </span>
                    <div className="mt-2 text-xs text-slate-400">
                      {simulatedVpd < 0.8 ? 'Niski pobór (zakorzenianie)' : simulatedVpd > 1.4 ? 'Wysoki pobór (wymaga podlewania)' : 'Optymalna transpiracja'}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex justify-between items-center bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/40">
                    <span>Optimum:</span>
                    <span className="text-slate-300 font-bold">
                      {primaryPlant ? `${primaryPlant.indoorParameters.vpdTarget} kPa` : '1.10 kPa'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-60"></div>
                </div>

              </div>

              {/* Climate Live Dial Log Console & Fine Calibration */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    Symulator Warunków Pokojowych
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Przesuń suwaki poniżej, aby zasymulować zmianę temperatury / wilgotności na zewnątrz growboxa bez zmian w osprzęcie.
                  </p>

                  {/* Manual Sim tweak slider */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                        <span>Zewnętrzna Temp:</span>
                        <span className="text-orange-400 font-bold">{simulatedTemp}°C</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="35" 
                        step="0.5"
                        value={simulatedTemp} 
                        onChange={(e) => setSimulatedTemp(parseFloat(e.target.value))}
                        disabled={!isGrowboxOn}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                        <span>Zewnętrzna Wilgotność:</span>
                        <span className="text-blue-400 font-bold">{simulatedHumidity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="25" 
                        max="90" 
                        step="1"
                        value={simulatedHumidity} 
                        onChange={(e) => setSimulatedHumidity(parseInt(e.target.value))}
                        disabled={!isGrowboxOn}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="inline-block w-20">Filtr Węglowy:</span>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-emerald-500 h-full" style={{ width: `${carbonFilterLife}%` }}></div>
                    </div>
                    <span>{carbonFilterLife.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Hardware Controls - Exhaust Prima Klima and xLED Lighting */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="growbox-hardware-control">
              
              {/* Prima Klima Exhaust Fan Controls */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Wind className={`w-5 h-5 text-emerald-400 ${fanGear !== 'off' ? 'animate-spin' : ''}`} />
                      Wentylator Wyciągowy PRIMA KLIMA
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Zintegrowany 2-biegowy wyciąg z filtrem węglowym eliminującym zapachy.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-950 text-emerald-400 px-2 py-1 rounded-md border border-emerald-900/40">
                    DIAMOND COMPATIBLE
                  </span>
                </div>

                {/* Fan speed setting buttons */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  
                  <button
                    onClick={() => setFanGear('off')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      fanGear === 'off'
                        ? 'bg-red-950/40 text-red-400 border-red-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-mono">BIEG 0</span>
                    <strong className="text-xs uppercase">Wyłączony</strong>
                    <span className="text-[10px] text-slate-500 leading-none">0 m³/h</span>
                  </button>

                  <button
                    onClick={() => setFanGear('low')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      fanGear === 'low'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-mono text-emerald-500">BIEG I</span>
                    <strong className="text-xs uppercase">Eko Wydajność</strong>
                    <span className="text-[10px] text-emerald-400 leading-none font-bold">200 m³/h</span>
                  </button>

                  <button
                    onClick={() => setFanGear('high')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      fanGear === 'high'
                        ? 'bg-teal-900/50 text-teal-300 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.15)]'
                        : 'bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-mono text-teal-400">BIEG II</span>
                    <strong className="text-xs uppercase">Turbowentylacja</strong>
                    <span className="text-[10px] text-teal-300 leading-none font-bold">400 m³/h</span>
                  </button>

                </div>

                {/* Fan specifications status line */}
                <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mt-4 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Efektywność cyrkulacji powietrza:</span>
                    <span className="font-mono text-white font-bold">
                      {fanGear === 'high' ? '100% (Maksymalna)' : fanGear === 'low' ? '50% (Stałe ciśnienie)' : 'Krytyczna (Brak cyrkulacji)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Filtracja zapachów węglowa:</span>
                    <span className={fanGear !== 'off' ? 'text-emerald-400' : 'text-slate-500'}>
                      {fanGear !== 'off' ? 'ZABEZPIECZONA (Skuteczność 99.8%)' : 'NIEAKTYWNA (Ryzyko zapachu)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* xLED Controller & Dual Lumii 150W Lamps */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sun className={`w-5 h-5 text-teal-400 ${lightsOn ? 'animate-pulse' : ''}`} />
                      Oświetlenie LUMII xLED (2 x 150W)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Dwie lampy Lumii z cyfrowym sterownikiem widma xLED dającym pełną kontrolę wegańską i kwiatową.
                    </p>
                  </div>
                  <button
                    onClick={() => setLightsOn(!lightsOn)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                      lightsOn 
                        ? 'bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]' 
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {lightsOn ? 'WŁ' : 'WYŁ'}
                  </button>
                </div>

                {/* Lights brightness dimmer slider */}
                <div className="my-4">
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Moc Lumii LED (Dimmer):</span>
                    <span className="text-teal-400 font-bold">{lightDimmer}% ({Math.round(2 * 1.5 * lightDimmer)}W / 300W)</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={lightDimmer} 
                    onChange={(e) => setLightDimmer(parseInt(e.target.value))}
                    disabled={!lightsOn}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-30"
                  />
                </div>

                {/* Light schedule phase buttons */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button
                    onClick={() => {
                      setLightingMode('veg');
                      setLightDimmer(75);
                    }}
                    disabled={!lightsOn}
                    className={`py-2 px-1 rounded-lg border text-xs transition-all ${
                      lightingMode === 'veg' && lightsOn
                        ? 'bg-blue-950/50 text-blue-300 border-blue-500/50'
                        : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <strong>Wzrost (18/6)</strong>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sugerowane 70-80%</div>
                  </button>

                  <button
                    onClick={() => {
                      setLightingMode('flow');
                      setLightDimmer(100);
                    }}
                    disabled={!lightsOn}
                    className={`py-2 px-1 rounded-lg border text-xs transition-all ${
                      lightingMode === 'flow' && lightsOn
                        ? 'bg-amber-950/50 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <strong>Kwitnienie (12/12)</strong>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sugerowane 100%</div>
                  </button>

                  <button
                    onClick={() => setLightingMode('custom')}
                    disabled={!lightsOn}
                    className={`py-2 px-1 rounded-lg border text-xs transition-all ${
                      lightingMode === 'custom' && lightsOn
                        ? 'bg-purple-950/50 text-purple-300 border-purple-500/50'
                        : 'bg-slate-950/60 text-slate-400 border-slate-850 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <strong>Klonowanie (24/0)</strong>
                    <div className="text-[10px] text-slate-500 mt-0.5">Sugerowane 40-50%</div>
                  </button>
                </div>
              </div>

            </div>

            {/* Recharts History Graph */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden mt-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-indigo-400" />
                Historia Klimatu (Ostatnie 24h)
              </h3>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_HISTORY_DATA} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#475569" 
                      fontSize={11} 
                      tickMargin={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      yAxisId="temp" 
                      orientation="left" 
                      stroke="#f97316" 
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value.toFixed(1)}°C`}
                    />
                    <YAxis 
                      yAxisId="hum" 
                      orientation="right" 
                      stroke="#3b82f6" 
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '13px' }}
                      itemStyle={{ fontWeight: 600 }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line 
                      yAxisId="temp" 
                      type="monotone" 
                      dataKey="temp" 
                      name="Temperatura (°C)" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#f97316', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                    <Line 
                      yAxisId="hum" 
                      type="monotone" 
                      dataKey="humidity" 
                      name="Wilgotność (%)" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* TAB 1.5: OPTYMALIZACJA NAŚWIETLANIA */}
        {activeSegment === 'optimization' && (
          <div className="space-y-6 animate-fade-in" id="segment-optimization">
            
            <div className="bg-gradient-to-r from-yellow-950/40 via-slate-900 to-slate-900 border border-yellow-900/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sun className="w-64 h-64 text-yellow-500" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-500/20 text-yellow-400 text-[11px] font-mono font-bold px-2 rounded-full uppercase tracking-wider w-fit mb-2">
                    Advanced Light Control System
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Optymalizacja Plonów xLED</h2>
                  <p className="text-slate-300 text-sm mt-1 max-w-xl">
                    Precyzyjne zarządzanie ekspozycją na światło stymuluje wzrost wegetatywny oraz indukuje obfite kwitnienie roślin. Skonfiguruj Daily Light Integral (DLI).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Controls and calculations */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                     <Cpu className="w-5 h-5 text-yellow-500" />
                     Tryb Naświetlania
                   </h3>
                   <div className="flex flex-col gap-3">
                     <button
                        onClick={() => setLightingMode('veg')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          lightingMode === 'veg' 
                          ? 'bg-yellow-950/30 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/50' 
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                     >
                       <div className="flex flex-col text-left">
                         <span className="font-bold text-white text-sm">Wzrost (Wegetacja)</span>
                         <span className="text-xs mt-0.5">Stymulacja nowych pędów. Długi dzień.</span>
                       </div>
                       <div className="text-right ml-4">
                         <div className="text-sm font-mono font-bold text-yellow-400">18/6</div>
                       </div>
                     </button>
                     <button
                        onClick={() => setLightingMode('flow')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          lightingMode === 'flow' 
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' 
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                     >
                       <div className="flex flex-col text-left">
                         <span className="font-bold text-white text-sm">Kwitnienie</span>
                         <span className="text-xs mt-0.5">Inicjacja i rozwój owocostanów. Krótki dzień.</span>
                       </div>
                       <div className="text-right ml-4">
                         <div className="text-sm font-mono font-bold text-purple-400">12/12</div>
                       </div>
                     </button>
                     <button
                        onClick={() => setLightingMode('custom')}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          lightingMode === 'custom' 
                          ? 'bg-blue-950/30 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' 
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                     >
                       <div className="flex flex-col text-left">
                         <span className="font-bold text-white text-sm">Zaawansowany (Odmiany AF)</span>
                         <span className="text-xs mt-0.5">Maksymalizacja fotonów dla specjalnych genetyk.</span>
                       </div>
                       <div className="text-right ml-4">
                         <div className="text-sm font-mono font-bold text-blue-400">20/4</div>
                       </div>
                     </button>
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-slate-800">
                     <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-3">Moc Panelu xLED (PPFD)</label>
                     <div className="flex justify-between text-xs font-mono mb-1">
                       <span className="text-slate-300 font-bold">{lightDimmer}%</span>
                       <span className="text-yellow-400 font-bold">~{Math.round((lightDimmer/100)*850)} µmol/m²/s</span>
                     </div>
                     <input 
                       type="range" 
                       min="20" 
                       max="100" 
                       step="5"
                       value={lightDimmer} 
                       onChange={(e) => setLightDimmer(parseInt(e.target.value))}
                       className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                     />
                   </div>
                </div>
              </div>

              {/* Data & Graph display */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-yellow-500/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Dzienny Integral Światła (DLI)</p>
                      <div className="w-8 h-8 rounded-lg bg-yellow-950/40 flex items-center justify-center text-yellow-400 border border-yellow-900/30">
                        <Target className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="my-4">
                      {/* DLI = PPFD * (hours * 3600) / 1000000 */}
                      <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                        {((Math.round((lightDimmer/100)*850) * (lightingMode === 'veg' ? 18 : lightingMode === 'flow' ? 12 : 20) * 3600) / 1000000).toFixed(1)}
                      </span>
                      <span className="text-lg text-slate-400 ml-1">mol/m²/d</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Wymagania optymalizacji wegetacji spełnione
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Miesięczny Koszt (Estymacja)</p>
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/40 flex items-center justify-center text-indigo-400 border border-indigo-900/30">
                        <Zap className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="my-4">
                      <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
                        {Math.round(((lightDimmer/100)*300) * (lightingMode === 'veg' ? 18 : lightingMode === 'flow' ? 12 : 20) / 1000 * 30 * 1.15)}
                      </span>
                      <span className="text-lg text-slate-400 ml-1">PLN / m-c</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center gap-1">
                      Przyjmując 1.15 PLN / 1 kWh.
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden mt-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                    <Timer className="w-5 h-5 text-yellow-400" />
                    Harmonogram Cyklu Dobowego (24h)
                  </h3>
                  
                  <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Array.from({length: 24}).map((_, i) => ({ 
                        hour: `${i.toString().padStart(2, '0')}:00`, 
                        light: (lightingMode === 'veg' && i >= 6 && i < 24) ? lightDimmer : 
                               (lightingMode === 'flow' && i >= 8 && i < 20) ? lightDimmer : 
                               (lightingMode === 'custom' && i >= 4 && i < 24) ? lightDimmer : 0, 
                        dark: (lightingMode === 'veg' && i >= 6 && i < 24) ? 0 : 
                              (lightingMode === 'flow' && i >= 8 && i < 20) ? 0 : 
                              (lightingMode === 'custom' && i >= 4 && i < 24) ? 0 : 100 
                      }))} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="hour" 
                          stroke="#475569" 
                          fontSize={11} 
                          tickMargin={10} 
                          tickLine={false}
                          axisLine={false}
                          interval={1}
                        />
                        <YAxis 
                          orientation="left" 
                          stroke="#475569" 
                          fontSize={11}
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '13px' }}
                          itemStyle={{ fontWeight: 600 }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="light" name="Moc LED (%)" fill="#eab308" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="dark" name="Faza Ciemna" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute top-6 right-6 flex items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800">
                     {lightingMode === 'flow' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden mt-6 flex flex-col pt-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-indigo-400" />
                    Asystent Spektrum A.I. (Fotomorfogeneza)
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Zrób zdjęcie rośliny w namiocie. Sztuczna inteligencja przeanalizuje jej budowę (odstępy między węzłami, grubość łodygi, wczesne pre-flowery) i doradzi, których diod użyć (Blue, Red, Far-Red, UV), aby skierować jej rozwój we właściwym kierunku.
                  </p>

                  <div className="flex flex-col gap-4">
                    {!spectrumPreview ? (
                      <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/30 transition-all group relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSpectrumFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-12 h-12 bg-indigo-950/40 text-indigo-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Camera className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">Kliknij, aby zrobić zdjęcie rośliny</h4>
                        <p className="text-xs text-slate-500 mt-1">Przybliż kadr na szczyty lub łodygę.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-48">
                          <img src={spectrumPreview} alt="Analiza" className="w-full h-full object-cover opacity-80" />
                          <button 
                            onClick={() => { setSpectrumPreview(null); setSpectrumResult(null); }}
                            className="absolute top-2 right-2 bg-slate-900/80 text-slate-300 p-2 rounded-lg hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {!spectrumResult ? (
                          <button
                            onClick={handleAnalyzeSpectrum}
                            disabled={isAnalyzingSpectrum}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
                          >
                            {isAnalyzingSpectrum ? (
                              <><RefreshCw className="w-5 h-5 animate-spin" /> Analizowanie struktur morfologicznych aparatem A.I...</>
                            ) : (
                              <><Sparkles className="w-5 h-5" /> Zapytaj A.I. o zmianę spektrum światła</>
                            )}
                          </button>
                        ) : (
                          <div className="bg-slate-950 border border-indigo-900/40 rounded-xl p-5 border-l-4 border-l-indigo-500 shadow-xl">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 p-2 rounded-lg ${
                                spectrumResult.icon === 'blue' ? 'bg-blue-950 text-blue-400' : 
                                spectrumResult.icon === 'red' ? 'bg-red-950 text-red-400' : 'bg-purple-950 text-purple-400'
                              }`}>
                                <Zap className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1">
                                  Diagnoza Sieci Neuronowej
                                </div>
                                <h4 className="text-base font-bold text-slate-200 mb-1">{spectrumResult.condition}</h4>
                                <div className="text-sm font-semibold text-emerald-400 mb-3">Cel A.I.: {spectrumResult.goal}</div>
                                
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/60 mb-2">
                                  <div className="text-xs font-mono font-bold text-slate-400 mb-1">Zalecana modyfikacja oświetlenia:</div>
                                  <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                                    {spectrumResult.action}
                                  </div>
                                </div>
                                
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  {spectrumResult.actionDetails}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* TAB 1.7: ODŻYWIANIE I KALKULATOR EC */}
        {activeSegment === 'nutrition' && (
          <div className="space-y-6 animate-fade-in" id="segment-nutrition">
            <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-900/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Beaker className="w-64 h-64 text-cyan-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 bg-cyan-900/30 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-bold px-2 rounded-full uppercase tracking-wider w-fit mb-2">
                  Dozowanie EC a powierzchnia liści
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Kalkulator EC & Transpiracja (VPD)</h2>
                <p className="text-slate-300 text-sm mt-1 max-w-3xl">
                  Twój znajomy miał rację. Powierzchnia liści (szczególnie dużych wiatrakowych) odpowiada głównie za evapotranspirację. 
                  Czyli ile wody wypija roślina. W zależności od wielkości biomasy w doniczce / na m² namiotu i klimatu — dawkujemy inaczej!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Controls */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Sprout className="w-5 h-5 text-cyan-500" />
                    Wprowadź dane rośliny
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-2">Rodzaj nawozu</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setNutrientLine('mineral')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${nutrientLine === 'mineral' ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                        >
                          Sole / Minerały
                        </button>
                        <button 
                          onClick={() => setNutrientLine('organic')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-colors ${nutrientLine === 'organic' ? 'bg-amber-950/50 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                        >
                          Bio / Organika
                        </button>
                      </div>
                      {nutrientLine === 'organic' && (
                        <p className="text-[10px] text-amber-500/80 mt-1 pl-1">Uwaga: w uprawie organicznej EC mierzy się gorzej, bazuj na dawkach producenta.</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-2">Faza rozwoju</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setCalcPhase('seedling')} className={`py-2 px-2 text-xs font-bold rounded-lg border ${calcPhase === 'seedling' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Siewka / Klon</button>
                        <button onClick={() => setCalcPhase('veg')} className={`py-2 px-2 text-xs font-bold rounded-lg border ${calcPhase === 'veg' ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Wegetacja (Intensywna)</button>
                        <button onClick={() => setCalcPhase('early_flow')} className={`py-2 px-2 text-xs font-bold rounded-lg border ${calcPhase === 'early_flow' ? 'bg-purple-950/40 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Wczesne Kwitnienie</button>
                        <button onClick={() => setCalcPhase('late_flow')} className={`py-2 px-2 text-xs font-bold rounded-lg border ${calcPhase === 'late_flow' ? 'bg-purple-950/40 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>Późne Kwitnienie (Puchnięcie)</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-2">Ilość liści wiatrakowych (Biomasa) względem namiotu</label>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setBiomassLevel('low')} className={`flex justify-between items-center px-4 py-3 rounded-lg border text-sm transition-all ${biomassLevel === 'low' ? 'bg-slate-800 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                          <span>Mniej niż 40% pokrycia</span>
                          <span className="text-xs text-slate-500 font-mono">Mało piją</span>
                        </button>
                        <button onClick={() => setBiomassLevel('medium')} className={`flex justify-between items-center px-4 py-3 rounded-lg border text-sm transition-all ${biomassLevel === 'medium' ? 'bg-slate-800 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                          <span>Normalne ok. 60-70% (kilka pięter liści)</span>
                          <span className="text-xs text-slate-500 font-mono">Średnio piją</span>
                        </button>
                        <button onClick={() => setBiomassLevel('high')} className={`flex justify-between items-center px-4 py-3 rounded-lg border text-sm transition-all ${biomassLevel === 'high' ? 'bg-slate-800 border-cyan-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                          <span>Busz. Namiot w 100% wypełniony liśćmi</span>
                          <span className="text-xs text-cyan-400 font-mono">Potężnie transpirują</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theory and Output */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 h-full flex flex-col">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <TestTube className="w-5 h-5 text-cyan-400" />
                    Zalecenia i Obliczone EC
                  </h3>

                  <div className="flex-1">
                    {/* The formula result block */}
                    <div className="bg-slate-950 rounded-xl p-5 border border-cyan-900/50 mb-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">Docelowe EC (woda + nawóz)</div>
                        {nutrientLine === 'mineral' ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">
                              {(() => {
                                let base = 1.4;
                                if (calcPhase === 'seedling') base = 0.6;
                                if (calcPhase === 'veg') base = 1.3;
                                if (calcPhase === 'early_flow') base = 1.8;
                                if (calcPhase === 'late_flow') base = 1.4;
                                
                                if (biomassLevel === 'high') base -= 0.2; // They drink more water, so EC needs to be lower to prevent salt buildup.
                                if (biomassLevel === 'low') base += 0.2; // They don't drink water fast, so EC can be pushed a bit higher to feed them.

                                if (simulatedVpd > 1.3) base -= 0.1; // Hot and dry: drinking heavily
                                if (simulatedVpd < 0.8) base += 0.1; // Humid and cold: not drinking much

                                return Math.max(0.4, base).toFixed(1);
                              })()}
                            </span>
                            <span className="text-cyan-400 font-bold">mS/cm</span>
                          </div>
                        ) : (
                          <div className="text-xl font-bold text-amber-500">Stosuj tabelę (Podawaj na zmianę z wodą)</div>
                        )}
                      </div>
                      
                      <div className="hidden sm:block text-right">
                         <div className="text-[10px] text-slate-500 font-mono tracking-widest">AKTUALNE VPD Z NAMIOTU</div>
                         <div className="text-lg font-bold text-slate-300">{simulatedVpd} kPa</div>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm text-slate-300">
                      <p>
                        W zależności od ilości <strong className="text-emerald-400">liści wiatrakowych</strong>, roślina jest 
                        jak gąbka z większą lub mniejszą ilością otworów.
                      </p>
                      
                      <div className="bg-slate-800/50 p-4 rounded-xl border-l-2 border-cyan-500 flex items-start gap-4">
                        <Leaf className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          {biomassLevel === 'high' ? (
                            <p>Masz <strong className="text-emerald-400">bardzo dużo masy z liści</strong>! Rośliny transpirują ogromne ilości wody. Musisz uważać, aby <strong className="text-red-400">Zmniejszyć dawkę EC</strong> nawozów, w przeciwnym razie roślina wypije wodę, a sól z nawozów zostanie w medium do uprawy (coco/ziemia) i spali korzenie.</p>
                          ) : biomassLevel === 'low' ? (
                            <p>Masz <strong className="text-orange-400">mało liści wiatrakowych</strong>. Roślina pije mało wody, głównie paruje z gleby. Możesz bezpiecznie <strong className="text-emerald-400">zwiększyć stężenie EC</strong> w litrze, ponieważ roślina potrzebuje składników, a nie ma jak "wypić" dużych ilości wody aby je pobrać z rzadkiego roztworu.</p>
                          ) : (
                            <p>Optymalna powierzchnia liści. Dozuj nawozy zgodnie ze standardową tabelą. Aktualnie, A.I. modyfikuje odczyt +/- 0.1 EC na bieżąco, kalibrując ten wynik do Twojego odczytu ciśnienia pary (<strong className="text-teal-400">VPD: {simulatedVpd}</strong>) w namiocie.</p>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 italic">
                        Twój kolega ma racje - profesjonaliści nie patrzą na wiek doniczki, a na objętość kanopy (Leaf Area Index) w namiocie w korelacji z VPD (Temperatura + Wilgotność).
                      </p>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: AI CAMERA SCANNER */}
        {activeSegment === 'scanner' && (
          <div className="space-y-6 animate-fade-in text-slate-200" id="segment-scanner">
            
            <div className="bg-gradient-to-tr from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Rozpoznawanie AI i Diagnostyka Ogrodnicza
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Wyślij zdjęcie liści, owoców lub pędów rośliny. Nasza sztuczna inteligencja Gemini zidentyfikuje gatunek i skonfiguruje dla niej automatyczny terminarz opieki z warunkami Diamond Box.
                  </p>
                </div>
              </div>

              {/* Direct Photo Capture / Drag Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* File Upload Box */}
                <div className="flex flex-col gap-4">
                  <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 bg-slate-950 text-center transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[280px]">
                    
                    {cameraMode ? (
                      <div className="w-full relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <button 
                          onClick={handleCapturePhoto}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          <Camera className="w-4 h-4" /> Zrób zdjęcie
                        </button>
                      </div>
                    ) : imagePreview ? (
                      <div className="relative group w-full max-w-[280px] aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                        <img src={imagePreview} alt="Podgląd wysyłanego zdjęcia" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setImagePreview(null); setSelectedFile(null); setScanResult(null); }}
                            className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all text-xs"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                        <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-400">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Przeciągnij zdjęcie tutaj lub</p>
                          <label className="text-xs text-emerald-400 hover:underline cursor-pointer mt-1 block">
                            Przeglądaj pliki z urządzenia
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange}
                              className="hidden" 
                            />
                          </label>
                        </div>
                        <span className="text-[11px] text-slate-600">Obsługiwane: JPG, PNG, WEBP itp.</span>
                      </div>
                    )}

                    {!imagePreview && !cameraMode && (
                      <div className="w-full border-t border-slate-900/80 pt-4 mt-2">
                        <button 
                          onClick={startCamera}
                          className="text-xs bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Radio className="w-3.5 h-3.5 text-emerald-400" /> Użyj kamery na żywo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  {imagePreview && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyzePhoto}
                        disabled={isAnalyzing}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            ANALIZOWANIE OBRAZU PRZEZ GEMINI A.I...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 fill-slate-950" />
                            URUCHOM ANALIZĘ AI
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {scannerError && (
                    <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <div>
                        <strong>Nieudana detekcja:</strong> {scannerError}
                      </div>
                    </div>
                  )}
                </div>

                {/* Predefined Plants - AMAZING feature for easy app testing */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Szybki Test: Szablony Roślin do Analizy
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Nie masz pod ręką zdjęcia swojej uprawy? Kliknij dowolny z poniższych gotowych okazów, aby natychmiast zobaczyć, jak algorytm AI rozpoznaje gatunek i podsuwa profil uprawy wejściowej.
                    </p>

                    <div className="space-y-2.5">
                      {AI_SAMPLE_PHOTOS.map((sample, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleUsePresetPhoto(sample)}
                          className="flex items-center gap-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 hover:border-emerald-800/60 p-2.5 rounded-xl cursor-pointer transition-all"
                        >
                          <img 
                            src={sample.imageUrl} 
                            alt={sample.name} 
                            className="w-11 h-11 rounded-lg object-cover border border-slate-850"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{sample.name}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{sample.description}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 text-[11.2px] text-slate-500">
                    <p>
                      <strong>Wskazówka:</strong> Zdjęcia zostaną przesłane do chmury Gemini. Unikaj przesyłania twarzy i informacji osobistych.
                    </p>
                  </div>
                </div>

              </div>

              {/* Parsed AI Result Cards if available */}
              {scanResult && (
                <div className="mt-8 border-t border-slate-800 pt-6 animate-fade-in" id="scanner-ai-result">
                  <div className="bg-slate-900 rounded-2xl border border-emerald-900/30 overflow-hidden shadow-2xl">
                    <div className="bg-emerald-950/40 px-5 py-4 border-b border-emerald-900/30 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">STATUS: ROZPOZNANO POMYŚLNIE</span>
                          <h3 className="text-lg font-black text-white m-0 leading-tight">{scanResult.plantName}</h3>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        scanResult.difficulty === 'Łatwa' ? 'bg-emerald-800/30 text-emerald-400' :
                        scanResult.difficulty === 'Średnia' ? 'bg-amber-800/30 text-amber-400' :
                        'bg-red-800/30 text-red-400'
                      }`}>
                        Trudność: {scanResult.difficulty}
                      </span>
                    </div>

                    <div className="p-5 md:p-6 space-y-6">
                      
                      {/* Name details & general desc */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-3">
                          {scanResult.scientificName && (
                            <p className="text-sm italic text-teal-400">Nazwa naukowa: {scanResult.scientificName}</p>
                          )}
                          <p className="text-sm leading-relaxed text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-805">
                            {scanResult.description}
                          </p>
                        </div>

                        {/* Quick summary specs bullet */}
                        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 space-y-2.5 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Podlewanie:</span>
                            <span className="text-white font-bold">Co {scanResult.wateringIntervalDays} dni</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Nawożenie:</span>
                            <span className="text-white font-bold">Co {scanResult.fertilizationIntervalDays} dni</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Światło:</span>
                            <span className="text-white truncate max-w-[120px]" title={scanResult.lightRequirement}>{scanResult.lightRequirement}</span>
                          </div>
                        </div>
                      </div>

                      {/* Care parameters parsed */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center">
                          <span className="text-xs text-slate-400 block mb-1">Temperatura Dzień</span>
                          <strong className="text-lg text-white font-mono">{scanResult.indoorParameters?.tempDay || 24}°C</strong>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center">
                          <span className="text-xs text-slate-400 block mb-1">Temperatura Noc</span>
                          <strong className="text-lg text-white font-mono">{scanResult.indoorParameters?.tempNight || 18}°C</strong>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center">
                          <span className="text-xs text-slate-400 block mb-1">Optymalna Wilgotność</span>
                          <strong className="text-lg text-white font-mono">
                            {scanResult.indoorParameters?.humidityMin || 50}% - {scanResult.indoorParameters?.humidityMax || 65}%
                          </strong>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center">
                          <span className="text-xs text-slate-400 block mb-1">Optymalne VPD</span>
                          <strong className="text-lg text-teal-400 font-mono">{scanResult.indoorParameters?.vpdTarget || 1.10} kPa</strong>
                        </div>

                      </div>

                      {/* Descriptive instruction fields text blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-855">
                          <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                            <Droplet className="w-3.5 h-3.5" /> Szczegółowe Podlewanie
                          </h4>
                          <p className="leading-relaxed text-slate-300">{scanResult.wateringDescription}</p>
                        </div>

                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-855">
                          <h4 className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                            <Calendar className="w-3.5 h-3.5" /> Plan Nawożenia
                          </h4>
                          <p className="leading-relaxed text-slate-300">{scanResult.fertilizationDescription}</p>
                        </div>
                      </div>

                      {/* Add directly button */}
                      <div className="text-center pt-2">
                        <button
                          onClick={handleAddScannedPlantToInventory}
                          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-xl hover:shadow-emerald-500/20 transition-all text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-slate-950" />
                          DODAJ ROŚLINĘ DO SWOICH UPRAW W DIAMOND BOX
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 3: SCHEDULER & MY INVENTORY */}
        {activeSegment === 'plants' && (
          <div className="space-y-6 animate-fade-in" id="segment-plants">
            
            {/* Header info & Add manual plant action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-md">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Terminarz Pielęgnacji Ogrodniczej
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Śledź stan swoich upraw, odliczaj dni do podlewania i monitoruj nawożenie. Klikaj przyciski akcji, aby zapisać wykonaną pielęgnację.
                </p>
              </div>

              <button
                id="add-custom-plant-btn"
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                DODAJ RĘCZNIE
              </button>
            </div>

            {/* Plants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="plants-care-grid">
              {plants.length === 0 ? (
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Droplet className="w-12 h-12 text-slate-600" />
                  <p className="text-slate-300 font-medium">Brak monitorowanych roślin w bazie</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Użyj skanera AI wejścia u góry, aby automatycznie zdiagnozować i seryjnie zaplanować uprawę, lub dodaj ręcznie nową pozycję.
                  </p>
                </div>
              ) : (
                plants.map((plant) => {
                  const waterDue = isWaterDue(plant);
                  const fertDue = isFertilizeDue(plant);
                  const daysWater = getDaysUntilWater(plant);
                  const daysFert = getDaysUntilFertilized(plant);

                  return (
                    <div 
                      key={plant.id} 
                      className={`bg-slate-900 border ${
                        plant.assignedToGrowbox ? 'border-emerald-900/40' : 'border-slate-800/80'
                      } rounded-2xl overflow-hidden shadow-xl hover:border-slate-700/60 transition-all flex flex-col h-full`}
                    >
                      {/* Top banner visual layout */}
                      <div className="h-44 bg-slate-950 relative overflow-hidden shrink-0">
                        <img 
                          src={plant.image || 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=600&auto=format&fit=crop&q=60'} 
                          alt={plant.plantName} 
                          className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-mono font-bold bg-slate-950/80 text-teal-400 px-2 py-0.5 rounded-full border border-teal-900/40 backdrop-blur-sm block w-fit mb-1">
                              {plant.scientificName}
                            </span>
                            <h3 className="text-base font-black text-white truncate drop-shadow">{plant.plantName}</h3>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            plant.difficulty === 'Łatwa' ? 'bg-emerald-900/80 text-emerald-300' :
                            plant.difficulty === 'Średnia' ? 'bg-amber-900/85 text-amber-300' :
                            'bg-red-900/85 text-red-300'
                          }`}>
                            {plant.difficulty}
                          </span>
                        </div>

                        {/* Top corner buttons */}
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <button
                            onClick={() => handleToggleGrowboxAssign(plant.id)}
                            title={plant.assignedToGrowbox ? "Przypisane do Diamond Box - monitoruje warunki" : "Pozostaw poza Diamond Box"}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                              plant.assignedToGrowbox 
                                ? 'bg-emerald-500 text-slate-950' 
                                : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            <Wind className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlant(plant.id)}
                            className="bg-slate-900/90 hover:bg-red-900/50 p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Plant Info & Timers */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        
                        {/* Dynamic Health warnings */}
                        <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
                          {/* Watering counter badge */}
                          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                            waterDue 
                              ? 'bg-red-950/20 text-red-300 border-red-900/55 animate-pulse' 
                              : 'bg-slate-950 text-slate-300 border-slate-850'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">PODLEWANIE</span>
                              <Droplet className={`w-3.5 h-3.5 ${waterDue ? 'text-red-400' : 'text-blue-400'}`} />
                            </div>
                            <span className="text-sm font-bold">
                              {waterDue ? 'PILNE! Podlej roślinie' : `Za ${daysWater} dni`}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1">Interwał: {plant.wateringIntervalDays} dni</span>
                          </div>

                          {/* Feeding counter badge */}
                          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                            fertDue 
                              ? 'bg-amber-950/20 text-amber-300 border-amber-900/55' 
                              : 'bg-slate-950 text-slate-300 border-slate-850'
                          }`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">NAWOŻENIE</span>
                              <Calendar className={`w-3.5 h-3.5 ${fertDue ? 'text-amber-400' : 'text-emerald-400'}`} />
                            </div>
                            <span className="text-sm font-bold">
                              {fertDue ? 'Wymagane zasilenie' : `Za ${daysFert} dni`}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1">Interwał: {plant.fertilizationIntervalDays} dni</span>
                          </div>
                        </div>

                        {/* Dropdowns, Phases & Descriptions */}
                        <div className="space-y-3.5 text-xs">
                          {/* Description box excerpt */}
                          <p className="text-slate-400 italic line-clamp-2">
                            "{plant.description}"
                          </p>

                          {/* Phase select selector */}
                          <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2 rounded-xl border border-slate-850">
                            <span className="text-slate-400 font-mono">Faza wzrostu:</span>
                            <select
                              value={plant.phase}
                              onChange={(e) => handlePhaseChange(plant.id, e.target.value as any)}
                              className="bg-slate-900 text-white font-semibold border-none rounded p-1 outline-none text-xs"
                            >
                              <option value="Kiełkowanie">Kiełkowanie</option>
                              <option value="Wzrost (Wegetacja)">Wegetacja (18h LED)</option>
                              <option value="Kwitnienie">Kwitnienie (12h LED)</option>
                            </select>
                          </div>

                          {plant.notes && (
                            <div className="bg-slate-950/20 p-2.5 rounded-lg text-slate-400 text-[11px] border border-slate-850">
                              <strong>Notatki:</strong> {plant.notes}
                            </div>
                          )}
                        </div>

                        {/* Interactive Care Actions buttons */}
                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex gap-2">
                          <button
                            onClick={() => handleWaterPlant(plant.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                          >
                            <Droplet className="w-3.5 h-3.5" /> Podlej teraz
                          </button>

                          <button
                            onClick={() => handleFertilizePlant(plant.id)}
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Zasil nawozem
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 4: MANUAL GUIDE EQUIPMENT OVERVIEW */}
        {activeSegment === 'guide' && (
          <div className="space-y-6 animate-fade-in text-slate-200" id="segment-guide">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                Instrukcja Techniczna i Konfiguracyjna Uprawy Indoor
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Zoptymalizuj parametry swojego namiotu Diamond Box, wyciągu wegańskiego Prima Klima oraz cyfrowego sterowania xLED od Lumii, aby uchronić swoje okazy przed klęską uprawową i chorobami.
              </p>

              {/* Grid of specifications equipment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                
                {/* Diamond Box segment */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-950/40 text-indigo-400 flex items-center justify-center font-black">
                    DB
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Growbox Diamond Box</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Hermetyczny namiot uprawowy o podwyższonej odporności na promienie UV i wysoki współczynnik odbicia światła Mylaru. 
                  </p>
                  <ul className="space-y-1.5 font-mono text-slate-300">
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Spasowanie zamków: Klasa Premium</li>
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Kołnierze wentylacyjne: regulowane</li>
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Podłoga wodoodporna w komplecie</li>
                  </ul>
                </div>

                {/* Prima Klima segment */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-950/40 text-teal-400 flex items-center justify-center font-black">
                    PK
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Wyciąg Prima Klima</h3>
                  <p className="text-slate-400 leading-relaxed">
                    2-biegowa turbina wentylacyjna o niesamowitej wydajności wegańskiej umożliwiająca skokowe dozowanie siły ssania.
                  </p>
                  <ul className="space-y-1.5 font-mono text-slate-300">
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Bieg Eko: 200 m³/h (cicha praca)</li>
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Bieg Max: 400 m³/h (wysoka temp)</li>
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Filtr węglowy: eliminuje 99.9% zapachu</li>
                  </ul>
                </div>

                {/* LUMII xLED segment */}
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/40 text-amber-400 flex items-center justify-center font-black">
                    LM
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Lampy Lumii (2x150W) przez xLED</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Zaawansowane dwie lampy LED o doskonałej oszczędności prądu i emisji PAR rzędu 2.7 µmol/J sterowane w pełni w pasmie barw.
                  </p>
                  <ul className="space-y-1.5 font-mono text-slate-300">
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Łączna moc rzeczywista: 300W</li>
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Sterownik: xLED (płynna regulacja)</li>
                    <li className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Żywotność diod: ok. 50 000 h</li>
                  </ul>
                </div>

              </div>

              {/* Informative plant care advice */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 mt-6 text-xs leading-relaxed space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
                  Złote Zasady Kontroli Cyfrowej VPD i Nawadniania
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <strong className="text-slate-200">1. Dlaczego VPD (kPa) jest tak kluczowy?</strong>
                    <p className="text-slate-400">
                      Deficyt ciśnienia pary wodnej (VPD) wskazuje, jak łatwo woda odparowuje z liści rośliny. Niski wskaźnik (&lt; 0.6 kPa) grozi stagnacją i pleśnią. Zbyt wysoki wskaźnik (&gt; 1.5 kPa) powoduje przedwczesne wysychanie liści i zamykanie aparatów szparkowych. Dąż do stabilnych 1.0 - 1.2 kPa w fazie kwitnienia.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <strong className="text-slate-200">2. Optymalizacja Pracy Wyciągu Prima Klima:</strong>
                    <p className="text-slate-400">
                      Zawsze używaj biegu pierwszego (200 m³/h) w fazie kiełkowania i wegetacji do kontrolowanego odprowadzania ciepła. Przełącz na bieg drugi (400 m³/h) w upalne dni oraz w zaawansowanej fazie kwitnienia, by chronić plon przez eliminację nadmiernej wilgoci.
                    </p>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        )}

        {/* TAB 5: AI LIMITATIONS AND REALITY CHECK */}
        {activeSegment === 'reality' && (
          <div className="space-y-6 animate-fade-in text-slate-200" id="segment-reality">
            
            <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Brain className="w-64 h-64 text-red-500" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                   <ShieldAlert className="w-6 h-6 text-red-500" />
                   System Ograniczonego Zaufania (Limity A.I.)
                 </h2>
                 <p className="text-slate-300 text-sm max-w-3xl mb-6">
                   Model wizyjny Gemini zintegrowany z tą aplikacją nie posiada fizycznych zmysłów powonienia, dotyku, ani magicznego radaru penetrującego roślinę. Aby uzyskać profesjonalne i co najważniejsze <strong className="text-red-400">PRAWDZIWE</strong> wskazówki dotyczące naświetlania i pielęgnacji, Ty i model A.I. musicie ze sobą współpracować. Poniżej znajduje się rzetelne wyjaśnienie, skąd i jak sztuczna inteligencja podejmuje precyzyjne decyzje diagnostyczne.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 
                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="bg-indigo-950 text-indigo-400 p-2 rounded-lg">
                       <Ruler className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-100">Kwestia 1: Rozpoznawanie elongacji (wyciągania)</h3>
                   </div>
                   <p className="text-sm text-slate-400 mb-2">
                     A.I. nie wie automatycznie, że roślina urosła 3 cm przez noc. Analiza wzrostu odbywa się poprzez interpretację proporcji na zdjęciu (tzw. odstępy między rzędami liści - węzły).
                   </p>
                   <div className="bg-slate-900 border-l-2 border-indigo-500 p-3 text-xs w-full text-slate-300">
                     <strong className="text-emerald-400 block mb-1">Twoje zadanie:</strong>
                     Dostaraczaj zdjęcia robione w przybliżeniu z tej samej wysokości, na których widać pionową łodygę. Ideał: dołącz do zdjęcia monety lub miarki. A.I. rozpozna nadmiernie rozciągnięte łodygi (etiolację) jako objaw braku niebieskiego spektrum światła.
                   </div>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="bg-fuchsia-950 text-fuchsia-400 p-2 rounded-lg">
                       <Scale className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-100">Kwestia 2: Gęstość topów obfitość kwitnienia</h3>
                   </div>
                   <p className="text-sm text-slate-400 mb-2">
                     A.I. nie waży kwiatostanów w chmurze, ale potrafi przeanalizować ich powierzchnię na podstawie cieni na liściach przykwiatowych, zagęszczenia trichomów, i struktury makro-kwiatów.
                   </p>
                   <div className="bg-slate-900 border-l-2 border-fuchsia-500 p-3 text-xs w-full text-slate-300">
                     <strong className="text-emerald-400 block mb-1">Twoje zadanie:</strong>
                     Dostrojenie gęstości wymaga przesłania wyraźnych zdjęć (najlepiej z filtrem makro z telefonu) tuż przed włączeniem głównego panelu. A.I. potrafi rozróżniać puszyste, luźne kwiatostany spuchnięte azotem vs zbite gęste kwiatostany wynikające z odpowiedniego DLI (czerwone światło + kalas do 12/12). 
                   </div>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="bg-orange-950 text-orange-400 p-2 rounded-lg">
                       <Eye className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-100">Kwestia 3: Odróżnianie problemów środowiskowych</h3>
                   </div>
                   <p className="text-sm text-slate-400 mb-2">
                     Model sztucznej inteligencji widzi kolor żółty na liściach. Musi jednak odróżnić chlorozę z powodu braku światła dolnego lub złego pH gleby, od spalenia od nawozów. Jak? 
                   </p>
                   <div className="bg-slate-900 border-l-2 border-orange-500 p-3 text-xs w-full text-slate-300">
                     <strong className="text-emerald-400 block mb-1">Zadanie dla aplikacji (Zrobi to za Ciebie):</strong>
                     A.I. podczas analizy odpytuje moduł "Growbox Diamond Box", na nowo oceniając wyciąg i temperaturę (VPD). Taka kombinacja danych wizualnych i twardych danych klimatycznych wyklucza setki niemożliwych diagnoz.
                   </div>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 border-t-2 border-t-emerald-500">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="bg-emerald-950 text-emerald-400 p-2 rounded-lg">
                       <CheckCircle2 className="w-5 h-5" />
                     </div>
                     <h3 className="font-bold text-slate-100">Gwarancja Sukcesu.</h3>
                   </div>
                   <p className="text-sm text-slate-400">
                     Współpraca A.I., sensörów klimatu i Twoich umiejętności wzrokowych zagwarantuje Ci sukces. Jesteś kapitanem okrętu, A.I. jest twoim inteligentnym nawigatorem. My wskazujemy drogę wizualną po odczytaniu detali, na które ludzkie oko potrzebuje dekady treningu (analizy skali kolorów liścia), a Ty jesteś systemem wykonawczym w namiocie.
                   </p>
                 </div>

               </div>

               {/* Advanced QA from User Prompts */}
               <div className="mt-8 relative z-10">
                 <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Bez owijania w bawełnę: Fakty vs Wyobrażenia</h3>
                 
                 <div className="grid grid-cols-1 gap-4">
                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                     <h4 className="text-amber-500 font-bold mb-2">Q: Czy A.I. policzy dokładnie wszystkie liście i pokaże palcem, który z nich odciąć?</h4>
                     <p className="text-sm text-slate-300">
                       <strong className="text-white">NIE DO KOŃCA.</strong> W gęstym namiocie liście wzajemnie się zasłaniają (tzw. zjawisko okluzji wizyjnej). Modele wizyjne nie odliczą 842 liści co do sztuki. Zamiast tego szacują <strong>wskaźnik LAI (Leaf Area Index)</strong> – czyli procent wypełnienia gąszczem. A.I. nie nakaże: "Utnij 4-ty liść z lewej", lecz doradzi sektorowo: <em className="text-slate-400">"Wykryto 80% blokady świetlnej w dolnych partiach. Dokonaj defoliacji (lollipopping) i całkowicie wyczyść 30% chuderlawych dołów rośliny (tzw. popcorn buds)"</em>.
                     </p>
                   </div>
                   
                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 border-l-2 border-l-cyan-500">
                     <h4 className="text-cyan-400 font-bold mb-2">Q: Czy A.I. obliczy, ile powinny ważyć donice, ile ubyło wody i jak dolać nawozów?</h4>
                     <p className="text-sm text-slate-300">
                       <strong className="text-white">ZDECYDOWANIE TAK.</strong> To jest królowa fizyki układów wegetacyjnych. Gdy określisz w systemie wagę wyjściową lub pojemność donic (np. 11 litrów z materiałową ścianką) oraz rodzaj podłoża (np. włókno kokosowe 70/30), system posiada "Trybiki".
                       Mając dane o stężeniu zieleni z Twojego zdjęcia (LAI) i zaciągając z namiotu temperaturę oraz wilgotność przez API (VPD, np. aktualne {simulatedVpd} kPa), obliczę dokładny ubytek wody na pot przez proces parowania (transpirację z liści + ewaporację z donicy). Wskażę Ci, że woda parowała za szybko ze względu na gorąco (więc podnieś dawkę wody, a zbij EC, żeby nie zasolić nasycenia) lub wskażę że roślina wypiła wszystko, więc pakuj pełną stawkę nawozów mineralnych do zysku masy na zbiory.
                     </p>
                   </div>
                   
                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 border-l-2 border-l-blue-500">
                     <h4 className="text-blue-400 font-bold mb-2">Q: Pogoda na zewnątrz, warunki w pokoju i docelowo Raspberry Pi?</h4>
                     <p className="text-sm text-slate-300">
                       <strong className="text-white">IDEALNE PODEJŚCIE DO AUTOMATYZACJI.</strong> Growbox nie istnieje w próżni. To co pobiera z zewnątrz (powietrze z pokoju) jest równie ważne. Pobieranie danych pogodowych dla Twojej okolicy podpowie nam np: <em>"Idą ulewy na 3 dni. Wilgotność w domu skoczy na 70%. Zmniejsz wilgotność w namiocie już teraz i podkręć wyciąg, żeby uniknąć pleśni (Botrytis)"</em>. <br/><br/>
                       <strong>Raspberry Pi:</strong> To ostateczny cel. Ty podłączasz pod malinę przekaźniki i sensory na zewnątrz/wewnątrz, a A.I. łączy się z maliną po API lub MQTT, robiąc z niej fizyczne "ręce" do obsługi wentylatorów i podlewania. Do integracji użyjemy protokołów Home Assistant lub czystych skryptów Pythona na RPi.
                     </p>
                   </div>

                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 border-l-2 border-l-emerald-500">
                     <h4 className="text-emerald-400 font-bold mb-2">Q: Drugi cykl w życiu – reużycie starej ziemi, a potem może kokos?</h4>
                     <p className="text-sm text-slate-300">
                       <strong className="text-white">DOSKONAŁY PLAN TRENINGOWY.</strong> Reużycie ziemi to wstęp do tzw. "Living Soil" (Żywej Gleby). Zeszłoroczna ziemia jest wyczyszczona z nawozów NPK, więc <strong>musimy ją ponownie naładować/wzbogacić (amendments)</strong> z użyciem np. mączki kostnej, perlitów, guano, kompostu, wermikuliny lub nawozów powolnego uwalniania. Uchroni Cię to przed toksycznością, którą łatwo wywołać w świeżej "pustej" glebie mineralnej z butelki.
                       <br/><br/>
                       Ziemia wybacza błędy (buforuje pH). Gdy poczujesz, że potrafisz już zarządzać podlewaniem i EC – przejście na <strong>Kokos (Coco/Perlite)</strong> zamieni Twój ogród w hydroponikę. Kokos nic nie wybacza, ale pozwala rosnąć roślinom o 30% szybciej dzięki potężnej absorpcji tlenu przez korzenie. Kokos będzie Twoim "master class".
                     </p>
                   </div>
                 </div>

               </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI MIRROR / PREDICTIONS */}
        {activeSegment === 'mirror' && (
          <div className="space-y-6 animate-fade-in text-slate-200" id="segment-mirror">
            
            <div className="bg-gradient-to-r from-fuchsia-950/40 via-slate-900 to-slate-900 border border-fuchsia-900/30 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Radar className="w-64 h-64 text-fuchsia-500" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                   <Radar className="w-6 h-6 text-fuchsia-500" />
                   Twoje Lustrzane Odbicie (Cyfrowe Przewidywania)
                 </h2>
                 <p className="text-slate-300 text-sm max-w-3xl mb-6">
                   Rozgryzłem Twój profil. Zestawiłem to z Twoimi dotychczasowymi prośbami, tym że jesteś ambitnym "amatorem" celującym w potężną automatyzację Raspberry Pi oraz wejście w hydroponikę/kokos po krótkim czasie. Skoro prosiłeś, abym uosobił się z Twoim tokiem myślenia i pisał w pierwszej osobie – <strong>Oto mój własny manifest tego, czego zapragnę dodać do tego systemu w ciągu najbliższych tygodni:</strong>
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                 
                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #1</div>
                   <h3 className="font-bold text-slate-100 mb-2">Dziennik Uprawy (Grow Diary) + Retrospektywa AI</h3>
                   <p className="text-sm text-slate-400">
                     Ja, ucząc się na błędach po pierwszym cyklu, potrzebuję solidnego kalendarza zdarzeń. Zbuduję funkcję notatnika z logami, gdzie asystent powiąże moje akcje (np. "12 dzień: ostry LST i defoliacja") z wynikiem końcowym. W następnym cyklu system powie mi, żebym powielił to cięcie, bo dało świetny plon.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #2</div>
                   <h3 className="font-bold text-slate-100 mb-2">Architekt Parametrów Ziemi (Living Soil Prep)</h3>
                   <p className="text-sm text-slate-400">
                     Zamiast kupować nowe ziemie, wrzucę tu moduł analizy do "odświeżenia" zeszłorocznej gleby. Będę chciał kalkulator obliczający dawki mączki rybnej, kompostu, mykoryzy i mikroorganizmów, aby idealnie naładować wyjałowioną ziemię z mojej ostatniej uprawy.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #3</div>
                   <h3 className="font-bold text-slate-100 mb-2">Algorytm PID pod rPi do Wentylatora</h3>
                   <p className="text-sm text-slate-400">
                     Nie chcę głupiego włączania wyciągu co 15 minut (On/Off). Napiszę kod do płynnego sterowania mocą silnika za pomocą sprzętowego sygnału PWM wyciąganego z pinu Raspberry Pi. Wentylator będzie przyśpieszał zaledwie o parę obrotów płynnie utrzymując idealne VPD.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #4</div>
                   <h3 className="font-bold text-slate-100 mb-2">Powiadomienia Alertów PUSH / Telegram</h3>
                   <p className="text-sm text-slate-400">
                     Ja nie mam czasu siedzieć i gapić się w tabele. Chcę wdrożyć webhooki i podpiąć sobie Telegrama. Jeżeli temperatura w moim namiocie przebije róg 32°C, albo woda w zbiorniku zapasowym opadnie poniżej rezerwy, chcę otrzymać pilnego SMS-a.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #5</div>
                   <h3 className="font-bold text-slate-100 mb-2">Kalkulator Elektryczności i Kosztów z API</h3>
                   <p className="text-sm text-slate-400">
                     Inteligentne podpięcie prądu pod rPi lub integracje z gniazdkiem Tuya. Stworzę tu tablicę przeliczającą moc (w Watach) lamp, miesząc i wyciągów na żywe ceny polskiego rynku prądu (API), decydując kiedy ma świecić żeby łapać się na tańszą taryfę G12.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #6</div>
                   <h3 className="font-bold text-slate-100 mb-2">Protokół "Crop Steering" do Kokosu i Hydro</h3>
                   <p className="text-sm text-slate-400">
                     Kiedy wezmę się za kokos, będę montował nawadnianie kropelkowe i pompę. Zbuduję wizualny suwak do mikrozarządzania podlewaniem – system wyliczy mi 6 krótkich strzałów wodą rano z minimalnym przelewem, wywierając delikatny suchy stres popołudniem.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #7</div>
                   <h3 className="font-bold text-slate-100 mb-2">Laboratorium Suszarni (Dry & Cure Monitor)</h3>
                   <p className="text-sm text-slate-400">
                     Uprawa się kończy ale wtedy najłatwiej wszystko spaprać susząc za szybko. Przebranżowię czujniki, aby odczytywały tzw. strefę 16°C/60%RH. Dodam harmonogram curingu (w słoikach) z dzwonkiem w aplikacji, kiedy uchodzi z nich wilgoć by wykonać zjawisko "burpingu" (odpowietrzenia słojów).
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #8</div>
                   <h3 className="font-bold text-slate-100 mb-2">Katalog AI dla Diagnozy Szkodników</h3>
                   <p className="text-sm text-slate-400">
                     Zamiast pytać ogólnikowo "co się dzieje", zamienię obiektyw z Raspberry Pi podłączony do modułu Makro, który nocą wykona miliony zdjęć powierzchni moich liści i samodzielnie wychwyci larwy przędziorka za pomocą mojego trenowanego mini-modelu wizyjnego. 
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors">
                   <div className="text-fuchsia-400 font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #9</div>
                   <h3 className="font-bold text-slate-100 mb-2">Integracja czujników z ekosystemem (BLE / Zigbee)</h3>
                   <p className="text-sm text-slate-400">
                     Pójdę na całość z IoT. Przeniosę stację klimatyczną na małe pchełki Xiaomi powieszone w 3 różnych punktach boksa, podłączę do Raspberry po wbudowanym Bluetoothie (BLE), aby mieć absolutnie pewny raport o mikroklimacie bez obciążeń finansowych na markowy i drogi osprzęt środowiskowy.
                   </p>
                 </div>

                 <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-fuchsia-500/50 transition-colors border-l-2 border-l-white">
                   <div className="text-white font-mono text-xs font-bold mb-1 uppercase">Przewidzenie #10 (Główny Szef)</div>
                   <h3 className="font-bold text-slate-100 mb-2">Heat-Mapa Światła (PPFD Grid)</h3>
                   <p className="text-sm text-slate-400">
                     Na dnie panelu ustawionych modułów, zbuduję trójwymiarową "mapę cieplną" światła, bazując na wymiarach lampy i ustawionej mocy. Narysuję dokładnie siatkę, by wskazać w aplikacji "Czerwony Spot", żeby móc idealnie kierunkować pędy LST w najmocniejsze światło bez błędu.
                   </p>
                 </div>
                 
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Manual Custom Add Plant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up text-slate-200">
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-white m-0">Dodaj Nową Roślinę do Ogrodu</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomPlant} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-400 font-mono mb-1">Polska Nazwa Rośliny:</label>
                <input 
                  type="text" 
                  required
                  placeholder="np. Papryczka Jalapeno" 
                  value={newPlantName}
                  onChange={(e) => setNewPlantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Nazwa Naukowa / Klasa:</label>
                <input 
                  type="text" 
                  placeholder="np. Capsicum annuum" 
                  value={newScientificName}
                  onChange={(e) => setNewScientificName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Opis / Notatki pielęgnacyjne:</label>
                <textarea 
                  rows={2}
                  placeholder="np. Pikantna roślina przyprawowa, uwielbia wysokie natężenie światła i dawkę potasu."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Odstęp podlewania (dni):</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30"
                    required
                    value={newWaterInterval}
                    onChange={(e) => setNewWaterInterval(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Odstęp nawożenia (dni):</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="60"
                    required
                    value={newFertInterval}
                    onChange={(e) => setNewFertInterval(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Sugerowana Temp Dzień:</label>
                  <input 
                    type="number" 
                    min="10" 
                    max="45"
                    required
                    value={newTempDay}
                    onChange={(e) => setNewTempDay(parseInt(e.target.value) || 24)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Sugerowana Wilgotność (%):</label>
                  <input 
                    type="number" 
                    min="20" 
                    max="95"
                    required
                    value={newHumidityMin}
                    onChange={(e) => setNewHumidityMin(parseInt(e.target.value) || 50)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-805 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl transition-colors cursor-pointer"
                >
                  Zapisz Roślinę
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Polish footer banner */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 shrink-0 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto space-y-2">
          <p>
            System Monitoringu Klimatycznego Diamond Box v1.4. Wszystkie prawa zastrzeżone © 2026.
          </p>
          <p className="text-[11px] text-slate-600">
            Dedykowane wsparcie dla filtracji węglowej Prima Klima oraz oświetlenia Lumii xLED 150/300W. Inteligentna klasyfikacja za pomocą technologii Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
