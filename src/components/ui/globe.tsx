"use client"

import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState, useMemo } from "react"

import { cn } from "@/lib/utils"

// All possible marker locations
const ALL_LOCATIONS: { location: [number, number]; size: number }[] = [
  // North America
  { location: [40.7128, -74.006], size: 0.1 },    // New York
  { location: [34.0522, -118.2437], size: 0.08 }, // Los Angeles
  { location: [41.8781, -87.6298], size: 0.07 },  // Chicago
  { location: [43.6532, -79.3832], size: 0.08 },  // Toronto
  { location: [49.2827, -123.1207], size: 0.06 }, // Vancouver
  { location: [45.5017, -73.5673], size: 0.05 },  // Montreal
  { location: [37.7749, -122.4194], size: 0.07 }, // San Francisco
  { location: [33.749, -84.388], size: 0.05 },    // Atlanta
  { location: [29.7604, -95.3698], size: 0.06 },  // Houston
  { location: [19.4326, -99.1332], size: 0.08 },  // Mexico City
  
  // Europe
  { location: [51.5074, -0.1278], size: 0.1 },    // London
  { location: [48.8566, 2.3522], size: 0.08 },    // Paris
  { location: [52.52, 13.405], size: 0.08 },      // Berlin
  { location: [52.3676, 4.9041], size: 0.06 },    // Amsterdam
  { location: [41.3851, 2.1734], size: 0.07 },    // Barcelona
  { location: [55.7558, 37.6173], size: 0.07 },   // Moscow
  { location: [59.3293, 18.0686], size: 0.05 },   // Stockholm
  { location: [48.2082, 16.3738], size: 0.05 },   // Vienna
  { location: [50.0755, 14.4378], size: 0.04 },   // Prague
  { location: [45.4642, 9.19], size: 0.06 },      // Milan
  { location: [53.3498, -6.2603], size: 0.05 },   // Dublin
  
  // Asia
  { location: [19.076, 72.8777], size: 0.1 },     // Mumbai
  { location: [28.6139, 77.209], size: 0.09 },    // Delhi
  { location: [12.9716, 77.5946], size: 0.08 },   // Bangalore
  { location: [22.5726, 88.3639], size: 0.06 },   // Kolkata
  { location: [13.0827, 80.2707], size: 0.05 },   // Chennai
  { location: [35.6762, 139.6503], size: 0.09 },  // Tokyo
  { location: [34.6937, 135.5022], size: 0.06 },  // Osaka
  { location: [39.9042, 116.4074], size: 0.09 },  // Beijing
  { location: [31.2304, 121.4737], size: 0.08 },  // Shanghai
  { location: [22.3193, 114.1694], size: 0.07 },  // Hong Kong
  { location: [1.3521, 103.8198], size: 0.07 },   // Singapore
  { location: [37.5665, 126.978], size: 0.07 },   // Seoul
  { location: [25.2048, 55.2708], size: 0.06 },   // Dubai
  { location: [41.0082, 28.9784], size: 0.06 },   // Istanbul
  { location: [13.7563, 100.5018], size: 0.05 },  // Bangkok
  { location: [14.5995, 120.9842], size: 0.05 },  // Manila
  
  // Australia & Oceania
  { location: [-33.8688, 151.2093], size: 0.09 }, // Sydney
  { location: [-37.8136, 144.9631], size: 0.07 }, // Melbourne
  { location: [-27.4698, 153.0251], size: 0.05 }, // Brisbane
  { location: [-31.9505, 115.8605], size: 0.04 }, // Perth
  { location: [-36.8485, 174.7633], size: 0.05 }, // Auckland
  
  // South America
  { location: [-23.5505, -46.6333], size: 0.09 }, // São Paulo
  { location: [-22.9068, -43.1729], size: 0.07 }, // Rio de Janeiro
  { location: [-34.6037, -58.3816], size: 0.07 }, // Buenos Aires
  { location: [-33.4489, -70.6693], size: 0.05 }, // Santiago
  { location: [4.711, -74.0721], size: 0.05 },    // Bogotá
  { location: [-12.0464, -77.0428], size: 0.04 }, // Lima
  
  // Africa & Middle East
  { location: [30.0444, 31.2357], size: 0.07 },   // Cairo
  { location: [-33.9249, 18.4241], size: 0.06 },  // Cape Town
  { location: [-1.2921, 36.8219], size: 0.05 },   // Nairobi
  { location: [6.5244, 3.3792], size: 0.06 },     // Lagos
  { location: [32.0853, 34.7818], size: 0.05 },   // Tel Aviv
]

// Function to get random markers
function getRandomMarkers(count: number = 15) {
  const shuffled = [...ALL_LOCATIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(marker => ({
    ...marker,
    size: marker.size * (0.8 + Math.random() * 0.4) // Slight size variation
  }))
}

export function Globe({
  className,
  config,
}: {
  className?: string
  config?: Partial<COBEOptions>
}) {
  // Generate random markers on mount
  const markers = useMemo(() => getRandomMarkers(18), [])
  
  const GLOBE_CONFIG: COBEOptions = {
    width: 800,
    height: 800,
    onRender: () => {},
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [1, 1, 1],
    markerColor: [251 / 255, 100 / 255, 21 / 255],
    glowColor: [1, 1, 1],
    markers,
    ...config,
  }

  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...GLOBE_CONFIG,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"))
    return () => globe.destroy()
  }, [markers])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
