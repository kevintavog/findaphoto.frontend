import { SearchItem } from '@/models/SearchResults'

interface DegreesMinutesSeconds {
    degrees: number
    minutes: number
    seconds: number
}

export class DataDisplayerProvider {
    public monthNames: string[] = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December']


    public keywordsString(item: SearchItem): string {
        if (!item.keywords) {
            return ''
        }
        return item.keywords.join(', ')
    }

    public parentFolder(item: SearchItem): string {
        const path = this.path(item)
        const last = path.lastIndexOf('/')
        if (last > 0) {
            return path.slice(0, last)
        }
        return path
    }

    public path(item: SearchItem): string {
        if (!item.path) {
            return ''
        }
        return item.path.slice(2).split('\\').join('/')
    }

    public tagsString(item: SearchItem): string {
        if (!item.tags) {
            return ''
        }
        return item.tags.sort().join(', ')
    }

    public itemYear(item: SearchItem) {
        const date = this.getItemDate(item)
        if (date != null) {
            return date.getFullYear()
        }
        return -1
    }

    public itemMonth(item: SearchItem) {
        const date = this.getItemDate(item)
        if (date != null) {
            return date.getMonth() + 1
        }
        return -1
    }

    public itemDay(item: SearchItem) {
        const date = this.getItemDate(item)
        if (date != null) {
            return date.getDate()
        }
        return -1
    }

    public getItemDate(item: SearchItem) {
        if (item.createdDate != null) {
            let date = item.createdDate
            if (typeof item.createdDate === 'string') {
                date = new Date(item.createdDate)
            }
            return date
        }
        return undefined
    }

    public getItemLocaleDate(item: SearchItem) {
        if (item.createdDate != null) {
            return new Date(item.createdDate).toLocaleDateString()
        }
        return undefined
    }

    public getItemLocaleDateAndTime(item: SearchItem) {
        if (item.createdDate != null) {
            const d = new Date(item.createdDate)
            return d.toLocaleDateString() + '  ' + d.toLocaleTimeString()
        }
        return undefined
    }

    public getItemDistanceString(item: SearchItem) {
        if (!item.distanceKm) {
            return ''
        }

        if (item.distanceKm === 0) {
            return 'Same location'
        } else if (item.distanceKm < 1.0) {
            return 'Distance: ' + (item.distanceKm * 1000).toFixed(0) + ' meters'
        } else {
            return 'Distance: ' + item.distanceKm.toFixed(2) + ' KM'
        }
    }

    public dateToLocaleDateAndTime(date: Date) {
        if (date != null) {
            const d = new Date(date)
            return d.toLocaleDateString() + '  ' + d.toLocaleTimeString()
        }
        return undefined
    }

    public lonDms(item: SearchItem) {
        return this.longitudeDms(item.longitude)
    }

    public longitudeDms(longitude: number) {
        return this.convertToDms(longitude, ['E', 'W'], false)
    }

    public latDms(item: SearchItem) {
        return this.latitudeDms(item.latitude)
    }

    public latitudeDms(latitude: number) {
        return this.convertToDms(latitude, ['N', 'S'], false)
    }


    public convertToDms(degrees: number, refValues: string[], includeDecimal: boolean): string {
        const dms = this.degreesToDms(degrees)
        let ref = refValues[0]
        if (dms.degrees < 0) {
            ref = refValues[1]
            dms.degrees *= -1
        }

        return dms.degrees + '° ' + dms.minutes + '\' ' + dms.seconds.toFixed(includeDecimal ? 2 : 0) + '\" ' + ref
    }

    public degreesToDms(degrees: number): DegreesMinutesSeconds {

        let d = degrees
        if (d < 0) {
            d = Math.ceil(d)
        } else {
            d = Math.floor(d)
        }

        const minutesSeconds = Math.abs(degrees - d) * 60.0
        const m = Math.floor(minutesSeconds)
        const s = (minutesSeconds - m) * 60.0

        return {
            degrees: d,
            minutes: m,
            seconds: s,
        }
    }
}

export const dataDisplayer = new DataDisplayerProvider()
