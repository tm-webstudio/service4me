"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, MapPin, AlertCircle } from 'lucide-react'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Coordinates {
  latitude: number
  longitude: number
}

interface StylistLocationMapProps {
  postcode: string
  businessName: string
  className?: string
}

export function StylistLocationMap({ postcode, businessName, className = '' }: StylistLocationMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapKey, setMapKey] = useState(0)

  // Function to geocode postcode using postcodes.io API
  const geocodePostcode = async (postcodeToGeocode: string): Promise<Coordinates | null> => {
    try {
      const cleanPostcode = postcodeToGeocode.replace(/\s/g, '').toUpperCase()
      const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Postcode not found')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.status === 200 && data.result) {
        return {
          latitude: data.result.latitude,
          longitude: data.result.longitude
        }
      } else {
        throw new Error('Invalid postcode or no data found')
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      return null
    }
  }

  useEffect(() => {
    const loadMapData = async () => {
      if (!postcode || typeof postcode !== 'string') {
        setError('No postcode provided')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const coords = await geocodePostcode(postcode)
        if (coords) {
          setCoordinates(coords)
          // Force map to re-render with new coordinates
          setMapKey(prev => prev + 1)
        } else {
          setError('Unable to find location for this postcode')
        }
      } catch (err) {
        setError('Failed to load map location')
        console.error('Map loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMapData()
  }, [postcode])

  // Don't render anything if no postcode
  if (!postcode) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg h-64 flex items-center justify-center ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !coordinates) {
    return (
      <div className={`bg-gray-100 rounded-lg h-64 flex items-center justify-center ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error || 'Map unavailable'}</span>
        </div>
      </div>
    )
  }

  // Map display
  return (
    <div className={`h-64 rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <MapContainer
        key={mapKey}
        center={[coordinates.latitude, coordinates.longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[coordinates.latitude, coordinates.longitude]}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">{businessName}</div>
              <div className="text-sm text-gray-600">{postcode}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

// CSS Import component for leaflet styles
export function MapStylesImport() {
  useEffect(() => {
    // Import leaflet CSS
    import('leaflet/dist/leaflet.css' as any)
    
    // Fix for default markers in react-leaflet
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    })
  }, [])

  return null
}