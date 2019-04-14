
export interface GeoPoint {
    latitude: number
    longitude: number
}

export class Geo {
    private readonly earthRadiusMeters = 6372.8 * 1000

    public meters(pt1: GeoPoint, pt2: GeoPoint): number {
        const latDelta = this.toRad(pt2.latitude - pt1.latitude)
        const lonDelta = this.toRad(pt2.longitude - pt1.longitude)
        const lat1Rad = this.toRad(pt1.latitude)
        const lat2Rad = this.toRad(pt2.latitude)
        const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
          Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2) *
          Math.cos(lat1Rad) * Math.cos(lat2Rad)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return this.earthRadiusMeters * c
    }

    public toRad(degrees: number): number {
        return degrees * Math.PI / 180
    }
}

export const geo = new Geo()
