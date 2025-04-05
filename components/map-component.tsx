"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void
  selectedLocation: { lat: number; lng: number; name: string } | null
  theme: string
}

const MapComponent = forwardRef<any, MapComponentProps>(({ onLocationSelect, selectedLocation, theme }, ref) => {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
  }))

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20, 0], 2)

      updateTileLayer(theme)

      // Add click event handler
      mapRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng

        // Reverse geocoding would normally go here (make it so its no longer coordinates as the name later)
        const locationName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`

        onLocationSelect(lat, lng, locationName)
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [onLocationSelect])

  useEffect(() => {
    if (mapRef.current) {
      updateTileLayer(theme)
    }
  }, [theme])

  useEffect(() => {
    if (mapRef.current && selectedLocation) {
      if (markerRef.current) {
        markerRef.current.remove()
      }

      // Create new marker
      markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(mapRef.current)
        .bindPopup(selectedLocation.name)
        .openPopup()
      mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], 10)
    }
  }, [selectedLocation])

  const updateTileLayer = (theme: string) => {
    if (!mapRef.current) return

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        layer.remove()
      }
    })

    if (theme === "dark") {
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(mapRef.current)
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)
    }
  }

  return <div id="map" className="w-full h-full" />
})

MapComponent.displayName = "MapComponent"

export default MapComponent

