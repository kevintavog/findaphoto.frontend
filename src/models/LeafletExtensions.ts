import L from 'leaflet'
import { geo, GeoPoint } from '@/models/Geo'


export class LeafletExtensions {
    public bearing(ll1: L.LatLng, ll2: L.LatLng) {
        const rad = Math.PI / 180
        const lat1 = ll1.lat * rad
        const lat2 = ll2.lat * rad
        const lon1 = ll1.lng * rad
        const lon2 = ll2.lng * rad
        const y = Math.sin(lon2 - lon1) * Math.cos(lat2)
        const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)

        const bearing = ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
        return bearing >= 180 ? bearing - 360 : bearing
    }

    public findNearest(pt: L.LatLng, points: L.LatLng[]): L.LatLng {
        if (points.length < 1) { return new L.LatLng(0, 0) }

        const geoPoint = this.toGeoPoint(pt)
        let nearest = points[0]
        let nearestDistance = geo.meters(geoPoint, this.toGeoPoint(points[0]))
        points.forEach( (ll, index) => {
            const distance = geo.meters(geoPoint, this.toGeoPoint(ll))
            if (distance < nearestDistance) {
                nearestDistance = distance
                nearest = ll
            }
        })
        return nearest
    }

    public findSegment(pt: L.LatLng, points: L.LatLng[]): [number, number] {
        if (points.length < 2) { return [-1, -1] }

        let bestIndex = -1
        let best = 99999
        for (let index = 1; index < points.length; ++index) {
            const a = points[index - 1]
            const b = points[index]
            const hypotenuse = a.distanceTo(b)
            const delta = a.distanceTo(pt) + pt.distanceTo(b) - hypotenuse
            const v = delta / hypotenuse
            if (v < best) {
                best = v
                bestIndex = index
            }
        }

        return [bestIndex - 1, bestIndex]
    }

    public toGeoPoint(ll: L.LatLng): GeoPoint {
        return { latitude: ll.lat, longitude: ll.lng }
    }
}

export const leafletExtensions = new LeafletExtensions()
