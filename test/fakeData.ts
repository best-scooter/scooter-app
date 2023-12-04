import Position from "../model/types/position"
const basePath = "model/hardware/"
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }
const fs = require('fs')

export default {
    /**
     * Get a fake battery level. Writes it to the fake 'battery hardware'-file.
     * @returns {number} The fake battery level between 0-100%
     */
    fakeBatteryLevel: function (): number {
        const max = 100
        const batteryLevel = Math.floor(Math.random() * max)

        fs.writeFileSync(basePath + "battery", batteryLevel.toString(), writeFileFlag)

        return batteryLevel
    },

    /**
     * Get a fake current speed. Writes it to the fake fake 'speedometet hardware'-file.
     * @returns {number} The fake speed between 0-20 km/h
     */
    fakeSpeed: function (): number {
        const max = 20
        const speed = Math.floor(Math.random() * max)

        fs.writeFileSync(basePath + "speedometer", speed.toString(), writeFileFlag)
        return speed
    },

    /**
     * Get a fake latitude and longitude for the startposition. Writes it to the fake 'gps hardware'-file in the format "latitude, longitude".
     * @returns {Object} Returns the fake startposition
     */
    createFakeStartPosition: function (): Position {
        const fakeStartPositions = {
            "Stockholm": "59.334591, 18.063240",
            "Göteborg": "57.708870, 11.974560",
            "Malmö": "55.60587, 13.00073",
        }

        const fakeStartPositionsValues = Object.values(fakeStartPositions)

        const randomElement = Math.floor(Math.random() * fakeStartPositionsValues.length)
        const randomPosition = fakeStartPositionsValues[randomElement].split(", ")

        const fakeStartPosition: Position = {
            "position_x": Number(randomPosition[0]),
            "position_y": Number(randomPosition[1])
        }

        const fakeStartPositionString = fakeStartPosition.position_x.toString() + ", " + fakeStartPosition.position_y.toString()
        fs.writeFileSync(basePath + "gps", fakeStartPositionString, writeFileFlag)

        return fakeStartPosition
    },

    /**
     * Update a fake position. Writes it to the fake 'gps hardware'-file in the format "latitude, longitude".
     * @returns {Object} A poisition object with the latitude and longitude
     */
    updateFakePosition: function (): Position {
        const oldPosition = fs.readFileSync(basePath + "gps", readFileFlag)
        const oldPositionXY = oldPosition.split(", ")
        const oldLatitudeNumber = Number(oldPositionXY[0])
        const oldLongitudeNumber = Number(oldPositionXY[1])

        const max = 0.2
        const latitudeUpdate = Math.random() * max
        const longitudeUpdate = Math.random() * max

        const newLatitudeNumber = oldLatitudeNumber + latitudeUpdate
        const newLatitudeString = newLatitudeNumber.toString()

        const newLongitudeNumber = oldLongitudeNumber + longitudeUpdate
        const newLongitudeString = newLongitudeNumber.toString()

        const newPositionString = newLatitudeString + ", " + newLongitudeString
        fs.writeFileSync(basePath + "gps", newPositionString, writeFileFlag)

        const newFakePosition: Position = {
            "position_x": newLatitudeNumber,
            "position_y": newLongitudeNumber
        }

        return newFakePosition
    },
}