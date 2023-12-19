import Position from "../model/types/position"
const basePath = process.env.HARDWARE_PATH
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }
const fs = require('fs')

export default {
    /**
     * Get a fake battery level. Writes it to the fake 'battery hardware'-file.
     * @returns {number} The fake battery level between 0-1 (exclusive), which represents battery level 0-100%
     */
    fakeBatteryLevel: function (): number {
        const batteryLevel = Math.random()
        const battery = {
            1: batteryLevel
        }

        const batteryString = JSON.stringify(battery)

        fs.writeFileSync(basePath + "battery", batteryString, writeFileFlag)

        return batteryLevel
    },

    /**
     * Get a fake low battery level. Writes it to the fake 'battery hardware'-file.
     * @returns {number} Return battery level 0.01
     */
    fakeLowBattery: function (): number {
        const batteryLevel = 0.01
        const battery = {
            1: batteryLevel
        }

        const batteryString = JSON.stringify(battery)

        fs.writeFileSync(basePath + "battery", batteryString, writeFileFlag)

        return batteryLevel
    },

    /**
     * Get a fake 50% battery level. Writes it to the fake 'battery hardware'-file.
     * @returns {number} Return battery level 0.51
     */
    fakeBatteryLevel51: function (): number {
        const batteryLevel = 0.51
        const battery = {
            1: batteryLevel
        }

        const batteryString = JSON.stringify(battery)

        fs.writeFileSync(basePath + "battery", batteryString, writeFileFlag)

        return batteryLevel
    },

    /**
     * Get a fake current speed. Writes it to the fake fake 'speedometet hardware'-file.
     * @returns {number} The fake speed between 0-20 km/h
     */
    fakeSpeed: function (): number {
        const max = 20
        const speedLevel = Math.floor(Math.random() * max)
        const speed = {
            1: speedLevel
        }

        const speedString = JSON.stringify(speed)

        fs.writeFileSync(basePath + "speedometer", speedString, writeFileFlag)

        return speedLevel
    },

    /**
     * Get a fake latitude and longitude for the startposition. Writes it to the fake 'gps hardware'-file in the format "latitude, longitude".
     * @returns {Object} Returns the fake startposition
     */
    createFakeStartPosition: function (): Position {
        const fakeStartPositions = {
            "Stockholm": { x: 59.334591, y: 18.063240 },
            "Göteborg": { x: 57.708870, y: 11.974560 },
            "Malmö": { x: 55.60587, y: 13.00073 },
        }

        const fakeStartPositionsValues = Object.values(fakeStartPositions)

        const randomElement = Math.floor(Math.random() * fakeStartPositionsValues.length)
        const randomPosition = fakeStartPositionsValues[randomElement]

        const fakeStart = {
            1: randomPosition
        }
        const fakeStartString = JSON.stringify(fakeStart)

        fs.writeFileSync(basePath + "gps", fakeStartString, writeFileFlag)

        return randomPosition
    },

    /**
     * Update a fake position. Writes it to the fake 'gps hardware'-file in the format "latitude, longitude".
     * @returns {Object} A poisition object with the latitude and longitude
     */
    updateFakePosition: function (scooterId: number): Position {
        const all_oldPositionsString = fs.readFileSync(basePath + "gps", readFileFlag)
        const all_oldPositions = JSON.parse(all_oldPositionsString)
        const oldPosition = all_oldPositions[scooterId]
        const oldLatitudeNumber = oldPosition.x
        const oldLongitudeNumber = oldPosition.y

        const max = 0.2
        const latitudeUpdate = Math.random() * max
        const longitudeUpdate = Math.random() * max

        const newLatitude = oldLatitudeNumber + latitudeUpdate
        const newLongitude = oldLongitudeNumber + longitudeUpdate

        const newFakePosition = {
            scooterId: [newLatitude.toFixed(6), newLongitude.toFixed(6)]
        }

        const newFakePositionString = JSON.stringify(newFakePosition)

        fs.writeFileSync(basePath + "gps", newFakePositionString, writeFileFlag)

        return newFakePosition[scooterId]
    },

    /**
     * Get a specifik fake poisition, which will be Stockholm. Writes it to the fake 'gps hardware'-file in the format "latitude, longitude".
     * @returns {Objet} Return a position object with latitude and longitude for Stockholm
     */
    fakeStockholmPosition: function (): Position {
        // const stockholm: Position = {
        //     "position_x": 59.334591,
        //     "position_y": 18.063240
        // }

        const stockholm = {
            1: { x: 59.334591, y: 18.063240 }
        }

        const stockholmString = JSON.stringify(stockholm)

        // const stockholmString = stockholm.position_x.toString() + ", " + stockholm.position_y.toString()
        fs.writeFileSync(basePath + "gps", stockholmString, writeFileFlag)

        return stockholm[1]
    },

    fakeLampOn: function (): string {
        const fakeLamp = {
            1: "on"
        }
        const fakeLampString = JSON.stringify(fakeLamp)
        fs.writeFileSync(basePath + "redLight", fakeLampString, writeFileFlag)

        return fakeLamp[1]
    },

    fakeLampOff: function (): string {
        const fakeLamp = {
            1: "off"
        }
        const fakeLampString = JSON.stringify(fakeLamp)
        fs.writeFileSync(basePath + "redLight", fakeLampString, writeFileFlag)

        return fakeLamp[1]
    },
}