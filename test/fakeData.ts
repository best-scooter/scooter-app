import Position from "../model/types/position"
const fs = require('fs')

export default {
    /**
     * Get a fake battery level
     * @returns {number} The fake battery level between 0-100%
     */
    fakeBatteryLevel: function (): number {
        const max = 100
        const batteryLevel = Math.random() * max

        return batteryLevel
    },

    /**
     * Get a fake current speed
     * @returns {number} The fake speed between 0-20 km/h
     */
    fakeSpeed: function (): number {
        const max = 20
        const speed = Math.random() * max
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

        const values = Object.values(fakeStartPositions)

        const randomElement = Math.random() * values.length
        const ranomPosition = values[randomElement]

        const fakeStartPosition: Position = {
            "position_x": Number(ranomPosition[0]),
            "position_y": Number(ranomPosition[1])
        }

        fs.writeFile("../model/hardware/gps", fakeStartPosition.position_x + ", " + fakeStartPosition.position_y)

        return fakeStartPosition
    },

    /**
     * Update a fake position. Writes it to the fake 'gps hardware'-file in the format "latitude, longitude".
     * @returns {Object} A poisition object with the latitude and longitude
     */
    updateFakePosition: function (): Position {
        const oldPosition = fs.readFile("../model/hardware/gps")
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
        fs.writeFile("../model/hardware/gps", newPositionString)

        const newFakePosition: Position = {
            "position_x": newLatitudeNumber,
            "position_y": newLongitudeNumber
        }

        return newFakePosition
    },
}