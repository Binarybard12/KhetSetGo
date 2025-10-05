import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';

// Add new color theme constants at the top
const THEME = {
  primary: {
    light: '#4ade80',
    DEFAULT: '#22c55e',
    dark: '#16a34a'
  },
  secondary: {
    light: '#93c5fd',
    DEFAULT: '#3b82f6',
    dark: '#2563eb'
  },
  background: {
    light: '#f0fdf4',
    DEFAULT: '#ecfdf5',
    dark: '#dcfce7'
  }
};

// Add page transition variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock API Configuration
const TWILIO_API_KEY = '';
const NASA_API_KEY = '';

// Village Database with real coordinates and conditions
const VILLAGE_DATABASE = {
  'Rampur': {
    village_name: 'Rampur',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    coordinates: { lat: 29.0588, lng: 77.7026 },
    soil_moisture: 28,
    ndvi: 0.52,
    rainfall_forecast: 3,
    soil_moisture_trend: [22, 25, 26, 28, 27, 28, 28],
    ndvi_trend: [0.42, 0.45, 0.48, 0.50, 0.51, 0.52, 0.52]
  },
  'Sultanpur': {
    village_name: 'Sultanpur',
    district: 'Sultanpur',
    state: 'Uttar Pradesh',
    coordinates: { lat: 26.2644, lng: 82.0738 },
    soil_moisture: 42,
    ndvi: 0.68,
    rainfall_forecast: 15,
    soil_moisture_trend: [38, 39, 40, 41, 42, 42, 42],
    ndvi_trend: [0.58, 0.60, 0.62, 0.64, 0.66, 0.67, 0.68]
  },
  'Kharagpur': {
    village_name: 'Kharagpur',
    district: 'Munger',
    state: 'Bihar',
    coordinates: { lat: 25.3764, lng: 86.4733 },
    soil_moisture: 35,
    ndvi: 0.58,
    rainfall_forecast: 8,
    soil_moisture_trend: [30, 32, 33, 34, 35, 35, 35],
    ndvi_trend: [0.50, 0.52, 0.54, 0.55, 0.56, 0.57, 0.58]
  },
  'Narsinghpur': {
    village_name: 'Narsinghpur',
    district: 'Narsinghpur',
    state: 'Madhya Pradesh',
    coordinates: { lat: 22.9476, lng: 79.1947 },
    soil_moisture: 25,
    ndvi: 0.45,
    rainfall_forecast: 2,
    soil_moisture_trend: [20, 22, 23, 24, 25, 24, 25],
    ndvi_trend: [0.38, 0.40, 0.42, 0.43, 0.44, 0.45, 0.45]
  },
  'Dharwad': {
    village_name: 'Dharwad',
    district: 'Dharwad',
    state: 'Karnataka',
    coordinates: { lat: 15.4589, lng: 75.0078 },
    soil_moisture: 38,
    ndvi: 0.62,
    rainfall_forecast: 12,
    soil_moisture_trend: [35, 36, 37, 37, 38, 38, 38],
    ndvi_trend: [0.55, 0.57, 0.58, 0.59, 0.60, 0.61, 0.62]
  },
  'Nagpur': {
    village_name: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    coordinates: { lat: 21.1458, lng: 79.0882 },
    soil_moisture: 32,
    ndvi: 0.58,
    rainfall_forecast: 6,
    soil_moisture_trend: [28, 29, 30, 31, 32, 31, 32],
    ndvi_trend: [0.52, 0.53, 0.54, 0.56, 0.57, 0.58, 0.58]
  }
};

// Mock Data Service - Simulates fetching data from NASA POWER, MODIS, SMAP
const fetchRecommendations = (locationData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let villageData;

      if (locationData.villageName && VILLAGE_DATABASE[locationData.villageName]) {
        villageData = VILLAGE_DATABASE[locationData.villageName];
      } else {
        villageData = {
          village_name: 'Custom Location',
          district: 'Unknown',
          state: 'India',
          coordinates: locationData.coordinates || { lat: 20.5937, lng: 78.9629 },
          soil_moisture: 30,
          ndvi: 0.55,
          rainfall_forecast: 5,
          soil_moisture_trend: [25, 27, 30, 32, 30, 28, 30],
          ndvi_trend: [0.4, 0.45, 0.5, 0.52, 0.55, 0.54, 0.55]
        };
      }

      const threshold_soil = 35;
      const rain_threshold = 10;

      let recommendation_type = 'Irrigation';
      let primary_advice_hindi = 'Sinchai abhi karo – 20mm paani apply karein';
      let reason_hindi = `Mitti ki nami (${villageData.soil_moisture}%) kam hai, aur agle 5 dinon mein baarish ki ummeed (${villageData.rainfall_forecast}mm) nahi hai.`;

      if (villageData.soil_moisture >= threshold_soil || villageData.rainfall_forecast >= rain_threshold) {
        recommendation_type = 'Crop';
        primary_advice_hindi = 'Fasal ki sthiti acchi hai – gehun ki buwai ke liye tayar';
        reason_hindi = `Mitti mein paryaapt nami (${villageData.soil_moisture}%) hai aur NDVI trend accha hai (${villageData.ndvi}).`;
      }

      const response = {
        farm_id: `FARM-${villageData.village_name.toUpperCase()}`,
        village_name: villageData.village_name,
        district: villageData.district,
        state: villageData.state,
        coordinates: villageData.coordinates,
        recommendation_type: recommendation_type,
        primary_advice_hindi: primary_advice_hindi,
        reason_hindi: reason_hindi,
        data_points: {
          current_soil_moisture: villageData.soil_moisture,
          current_ndvi: villageData.ndvi,
          rainfall_forecast_mm: villageData.rainfall_forecast,
          soil_moisture_trend_30_days: villageData.soil_moisture_trend,
          ndvi_trend_30_days: villageData.ndvi_trend
        }
      };

      resolve(response);
    }, 500);
  });
};

// SMS Service Configuration
const SMS_SERVICE_URL = 'http://localhost:3001/send-sms';
const FARMER_PHONE_NUMBER = '+91 8669490817';

// Enhanced Notification Module with SMS Simulation
const handleNotification = async (type, message, farmData) => {
  if (type === 'SMS') {
    // Simulate SMS sending process
    const showSMSDialog = () => {
      const smsDetails = `
📱 SMS SIMULATION

Recipient: ${FARMER_PHONE_NUMBER}
Village: ${farmData?.village_name || 'Unknown'}
Message: ${message}
Timestamp: ${new Date().toLocaleString('en-IN')}
Message ID: SMS_${Date.now()}

Status: ✅ SENT SUCCESSFULLY

This is a demo simulation. In production, this would be sent via:
• Twilio SMS API
• WhatsApp Business API  
• Local SMS Gateway
• Government SMS Portal

The farmer would receive this message on their mobile device with farming advice in their local language.
      `;

      alert(smsDetails);
      
      // Log to console for development
      console.log('📱 SMS SIMULATION:', {
        recipient: FARMER_PHONE_NUMBER,
        message: message,
        village: farmData?.village_name,
        timestamp: new Date().toISOString(),
        messageId: `SMS_${Date.now()}`
      });
    };

    // Simulate network delay
    setTimeout(showSMSDialog, 500);

    // Optional: Try to connect to SMS service if available
    try {
      const response = await fetch(SMS_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: FARMER_PHONE_NUMBER,
          message: message,
          villageName: farmData?.village_name || 'Unknown'
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Real SMS service responded:', result);
      }
    } catch (error) {
      console.log('📱 Using SMS simulation (service not available)');
    }

  } else if (type === 'Voice') {
    console.log('Mock Voice Alert: Playing advice in local language.');
    alert('📢 Voice alert chalayi ja rahi hai! (Mock voice playing)');
  }
};

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Click Handler Component
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <p className="font-bold">Selected Location</p>
          <p className="text-sm">Lat: {position.lat.toFixed(4)}</p>
          <p className="text-sm">Lng: {position.lng.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

// Satellite Data Overlay Component
const SatelliteDataOverlay = ({ selectedLayer, farmData }) => {
  const map = useMap();
  
  useEffect(() => {
    // Create a circular overlay to simulate satellite data
    const radius = 2000; // 2km radius
    const center = [farmData.coordinates.lat, farmData.coordinates.lng];
    
    // Remove existing overlays
    map.eachLayer((layer) => {
      if (layer.options && layer.options.isDataOverlay) {
        map.removeLayer(layer);
      }
    });

    // Create colored circle based on selected layer
    let color, opacity;
    switch (selectedLayer) {
      case 'NDVI':
        color = farmData.data_points.current_ndvi > 0.6 ? '#22c55e' : 
                farmData.data_points.current_ndvi > 0.4 ? '#eab308' : '#ef4444';
        opacity = 0.4;
        break;
      case 'Soil Moisture':
        color = farmData.data_points.current_soil_moisture > 35 ? '#3b82f6' : 
                farmData.data_points.current_soil_moisture > 25 ? '#f59e0b' : '#ef4444';
        opacity = 0.5;
        break;
      case 'Rainfall':
        color = farmData.data_points.rainfall_forecast_mm > 10 ? '#0ea5e9' : 
                farmData.data_points.rainfall_forecast_mm > 5 ? '#06b6d4' : '#64748b';
        opacity = 0.3;
        break;
      default:
        color = '#6b7280';
        opacity = 0.2;
    }

    const circle = L.circle(center, {
      radius: radius,
      color: color,
      fillColor: color,
      fillOpacity: opacity,
      weight: 2,
      isDataOverlay: true
    }).addTo(map);

    // Add text label
    const label = L.marker(center, {
      icon: L.divIcon({
        html: `<div class="satellite-label">${selectedLayer}<br/>${getLayerValue(selectedLayer, farmData)}</div>`,
        className: 'satellite-label-container',
        iconSize: [80, 30]
      })
    }).addTo(map);

    return () => {
      map.removeLayer(circle);
      map.removeLayer(label);
    };
  }, [selectedLayer, farmData, map]);

  return null;
};

// Helper function to get layer value
const getLayerValue = (layer, data) => {
  switch (layer) {
    case 'NDVI':
      return data.data_points.current_ndvi;
    case 'Soil Moisture':
      return `${data.data_points.current_soil_moisture}%`;
    case 'Rainfall':
      return `${data.data_points.rainfall_forecast_mm}mm`;
    default:
      return '';
  }
};

// Layer Information Display Component
const LayerInfoDisplay = ({ selectedLayer, farmData }) => {
  const getLayerDescription = () => {
    switch (selectedLayer) {
      case 'NDVI':
        return {
          title: 'NDVI - Vegetation Health',
          description: 'Normalized Difference Vegetation Index',
          value: farmData.data_points.current_ndvi,
          unit: '',
          status: farmData.data_points.current_ndvi > 0.6 ? 'Healthy' : 
                  farmData.data_points.current_ndvi > 0.4 ? 'Moderate' : 'Poor',
          color: farmData.data_points.current_ndvi > 0.6 ? 'text-green-600' : 
                 farmData.data_points.current_ndvi > 0.4 ? 'text-yellow-600' : 'text-red-600'
        };
      case 'Soil Moisture':
        return {
          title: 'Soil Moisture Content',
          description: 'Current soil water content',
          value: farmData.data_points.current_soil_moisture,
          unit: '%',
          status: farmData.data_points.current_soil_moisture > 35 ? 'Optimal' : 
                  farmData.data_points.current_soil_moisture > 25 ? 'Low' : 'Critical',
          color: farmData.data_points.current_soil_moisture > 35 ? 'text-blue-600' : 
                 farmData.data_points.current_soil_moisture > 25 ? 'text-yellow-600' : 'text-red-600'
        };
      case 'Rainfall':
        return {
          title: 'Rainfall Forecast',
          description: 'Expected precipitation (5 days)',
          value: farmData.data_points.rainfall_forecast_mm,
          unit: 'mm',
          status: farmData.data_points.rainfall_forecast_mm > 10 ? 'High' : 
                  farmData.data_points.rainfall_forecast_mm > 5 ? 'Moderate' : 'Low',
          color: farmData.data_points.rainfall_forecast_mm > 10 ? 'text-blue-600' : 
                 farmData.data_points.rainfall_forecast_mm > 5 ? 'text-cyan-600' : 'text-gray-600'
        };
      default:
        return { title: '', description: '', value: '', unit: '', status: '', color: '' };
    }
  };

  const layerInfo = getLayerDescription();

  return (
    <div className="absolute top-4 left-4 bg-white bg-opacity-95 px-4 py-3 rounded-lg shadow-md z-[400] max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${layerInfo.color.replace('text-', 'bg-')}`}></div>
        <p className="text-sm font-semibold text-gray-700">Current Layer:</p>
      </div>
      <p className="text-xs font-bold text-gray-800 mb-1">{layerInfo.title}</p>
      <p className="text-xs text-gray-600 mb-2">{layerInfo.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-gray-800">
          {layerInfo.value}{layerInfo.unit}
        </span>
        <span className={`text-xs font-semibold ${layerInfo.color}`}>
          {layerInfo.status}
        </span>
      </div>
    </div>
  );
};

// Map Controls Component
const MapControls = ({ selectedLayer, setSelectedLayer }) => {
  return (
    <motion.div 
    initial={{ x: 100 }}
    animate={{ x: 0 }}
    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm"
  >
    <div className="absolute top-4 right-4 bg-white bg-opacity-95 px-3 py-2 rounded-lg shadow-md z-[400]">
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setSelectedLayer('NDVI')}
          className={`px-3 py-1 rounded text-xs font-semibold transition ${
            selectedLayer === 'NDVI'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          NDVI
        </button>
        <button
          onClick={() => setSelectedLayer('Soil Moisture')}
          className={`px-3 py-1 rounded text-xs font-semibold transition ${
            selectedLayer === 'Soil Moisture'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Soil Moisture
        </button>
        <button
          onClick={() => setSelectedLayer('Rainfall')}
          className={`px-3 py-1 rounded text-xs font-semibold transition ${
            selectedLayer === 'Rainfall'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rainfall
        </button>
      </div>
    </div>
    </motion.div>
  );
};

// Enhanced Soil Moisture Trend Chart Component
const SoilMoistureTrendChart = ({ data }) => {
  // Generate labels for the past 7 days
  
  const generateLabels = () => {
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    return labels;
  };


  const chartData = {
    labels: generateLabels(),
    datasets: [
      {
        label: 'Soil Moisture (%)',
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `Soil Moisture: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 50,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Calculate trend
  const trend = data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1) : 0;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6"
  >
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📊 Soil Moisture Trend
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500">vs last week</span>
        </div>
      </div>
      
      <div className="h-64 mb-4">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-600">{data[data.length - 1]}%</p>
          <p className="text-xs text-gray-600">Current</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">{Math.max(...data)}%</p>
          <p className="text-xs text-gray-600">Peak</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-orange-600">{Math.min(...data)}%</p>
          <p className="text-xs text-gray-600">Low</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Status:</span> {
            data[data.length - 1] < 25 ? '🔴 Critical - Irrigation needed' :
            data[data.length - 1] < 35 ? '🟡 Low - Monitor closely' :
            '🟢 Good - Optimal moisture level'
          }
        </p>
      </div>
    </div>
    </motion.div>
  );

  
};

// Enhanced NDVI Trend Chart Component
const NDVITrendChart = ({ data }) => {
  
  const generateLabels = () => {
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    return labels;
  };

  const chartData = {
    labels: generateLabels(),
    datasets: [
      {
        label: 'NDVI Index',
        data: data,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return `NDVI: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 1.0,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const trend = data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1) : 0;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend > 0 ? '↗️' : trend < 0 ? '↘️' : '→';

  return (
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6"
  >
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🌱 NDVI Trend
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(trend)}%
          </span>
          <span className="text-gray-500">vs last week</span>
        </div>
      </div>
      
      <div className="h-64 mb-4">
        <Line data={chartData} options={options} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">{data[data.length - 1]}</p>
          <p className="text-xs text-gray-600">Current</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-600">{Math.max(...data).toFixed(2)}</p>
          <p className="text-xs text-gray-600">Peak</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-yellow-600">{Math.min(...data).toFixed(2)}</p>
          <p className="text-xs text-gray-600">Low</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Health:</span> {
            data[data.length - 1] < 0.3 ? '🔴 Poor vegetation' :
            data[data.length - 1] < 0.5 ? '🟡 Moderate health' :
            data[data.length - 1] < 0.7 ? '🟢 Good health' :
            '🟢 Excellent vegetation'
          }
        </p>
      </div>
    </div>
    </motion.div>
  );
  
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'farm-selection', 'dashboard'
  const [farmData, setFarmData] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('NDVI');
  const [searchInput, setSearchInput] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (currentPage === 'dashboard' && !farmData) {
      loadFarmData({ villageName: selectedVillage, coordinates: mapPosition });
    }
  }, [currentPage]);

  const loadFarmData = async (locationData) => {
    const data = await fetchRecommendations(locationData);
    setFarmData(data);
  };

  const handleVillageSelect = (villageName) => {
    setSelectedVillage(villageName);
    setSearchInput(villageName);
    setShowSuggestions(false);
    const villageData = VILLAGE_DATABASE[villageName];
    if (villageData) {
      setMapPosition(villageData.coordinates);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const filteredVillages = Object.keys(VILLAGE_DATABASE).filter(village =>
    village.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleContinueToDashboard = () => {
    if (selectedVillage || mapPosition) {
      setCurrentPage('dashboard');
    } else {
      alert('कृपया पहले अपना गाँव चुनें या नक्शे पर पिन लगाएं!');
    }
  };

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  );

  // Router Logic
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="App"
    >
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'dashboard' && <DashboardPage />}
    </motion.div>
  );
}

export default App;