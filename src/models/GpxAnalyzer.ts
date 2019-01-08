
export interface GpxAnalyzer {
    tracks: [GpxAnalyzerTrack]
}

export interface GpxAnalyzerTrack {
    minLat: number
    minLon: number
    maxLat: number
    maxLon: number
    runs: [GpxAnalyzerRun]
}

export interface GpxAnalyzerRun {
    style: string
    points: [GpxAnalyzerPoint]
}

export interface GpxAnalyzerPoint {
    gpx: GpxAnalyzerGpxPoint
}

export interface GpxAnalyzerGpxPoint {
    latitude: number
    longitude: number
    time: string
    elevation: number
    course: number
}
