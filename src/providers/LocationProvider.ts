import axios from 'axios'

export enum FPLocationAccuracy {
    FromDevice = 1,
    FromIPAddress,
}

export interface FPLocation {
    accuracy: FPLocationAccuracy
    latitude: number
    longitude: number
}

export class LocationProvider {
    public currentLocation(callback: (location?: FPLocation, errorMessage?: string) => void) {
        if (window.navigator.geolocation) {
            window.navigator.geolocation.getCurrentPosition(
                (position: Position) => {
                    const location = {
                        accuracy: FPLocationAccuracy.FromDevice,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    } as FPLocation
                    callback(location, undefined)
                },
                (error: PositionError) => {
                    const originalError = error.message + ' (' + error.code + ')'
                    this.getIpAndlocation(originalError, callback)
                },
                { timeout: 5000 })
        } else {
            this.getIpAndlocation('', callback)
        }
    }

    // When we can't get a location from the browser, we fall back to getting the (much less accurate) location from
    // the external IP address. Better than nothing, I hope.
    private getIpAndlocation(originalError: string, callback: (location?: FPLocation, errorMessage?: string) => void) {
        axios.get('https://api.ipify.org?format=json')
        .then((response) => {
            const ip = response.data.ip
            this.locationFromIp(ip, originalError, callback)
        })
        .catch((error) => {
            let message = 'Failed getting IP: ' + error.message + ' (' + error.code + ')'
            if (originalError !== '') {
                message = originalError + '; and ' + message
            }
            callback(undefined, message)
        })
    }

    private locationFromIp(
        ip: string,
        originalError: string,
        callback: (location?: FPLocation, errorMessage?: string) => void) {
        axios.get('http://api.ipstack.com/' + ip + '?access_key=b3576b6dfc913fb3841351c40816084c&format=1&fields=main')
        .then((response) => {
          const results = response.data
          const location = {
              accuracy: FPLocationAccuracy.FromIPAddress,
              latitude: results.latitude,
              longitude: results.longitude,
          } as FPLocation
          callback(location, undefined)
        })
        .catch((error) => {
            let message = 'Failed getting location from IP: ' + error.message + ' (' + error.code + ')'
            if (originalError !== '') {
                message = originalError + '; and ' + message
            }
            callback(undefined, message)
        })
    }
}

export const locationProvider = new LocationProvider()
