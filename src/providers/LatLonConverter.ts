
export interface LatLon {
    latitude: number,
    longitude: number
}


export class LatLonConverter {
    /**
     * Parse a string as a latitude, longitude.
     * The string may be in DMS format: '51°28′20" N 40°12'17" W'
     * The string may be decimal: 51.55611111111111,-40.28972222222222
     * @returns undefined or LatLon
     */
    public parse(data: string): LatLon | undefined {
        // Is it DMS?
        const dmsArray = data.split(' ').filter( (s) => s.trim().length > 0)
        if ((dmsArray.length % 2) === 0) {
            const half = dmsArray.length / 2
            const lat = this.parseSingle(dmsArray.slice(0, half).join(''))
            const lon = this.parseSingle(dmsArray.slice(half).join(''))
            if (lat && lon) {
                return { latitude: lat, longitude: lon }
            }
        }

        // Is it decimal?
        const decimalArray = data.split(',')
        if (decimalArray.length === 2) {
            const lat = this.parseSingle(decimalArray[0])
            const lon = this.parseSingle(decimalArray[1])
            if (lat && lon) {
                return { latitude: lat, longitude: lon }
            }
        }

        return undefined
    }

    private parseSingle(data: string): number | undefined {
        const dms = String(data).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/)
            .filter( (s) => s.trim().length > 0)

        let degrees = 0.0
        switch (dms.length) {
            case 3:
                degrees = +dms[0] / 1 + +dms[1] / 60 + +dms[2] / 3600
                break
            case 2:
                degrees = +dms[0] / 1 + +dms[1] / 60
                break
            case 1:
                degrees = +dms[0]
                break
            case 0:
                return undefined
        }

        if (/^-|[WS]$/i.test(data.trim())) {
            degrees = -degrees
        }
        return degrees
    }
}

export const latLonConverter = new LatLonConverter()
