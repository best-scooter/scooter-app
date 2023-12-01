import Position from "./types/position"

const fs = require('fs')

export default {
    readScooterId: function (): number {
        const scooterId = process.env.SCOOTER_ID
        return Number(scooterId)
    },

    checkPosition: function (): Position {
        let position_x_y = fs.readFile("../hardware/gps")
        let positionArray = position_x_y.split(",") // eller ' ' eller \n
        let position = {
            "position_x": positionArray[0],
            "position_y": positionArray[1]
        }

        return position
    },

    checkBattery: function (): number {
        const batteryLevel = fs.readFile("../hardware/battery")
        return batteryLevel
    },

    checkSpeedometer: function (): number {
        const speed = fs.readFile("../hardware/speedometer")
        return speed
    },

    lampOn: function (): void {
        fs.writeFile("../hardware/redLight", "on")
    },

    lampOff: function (): void {
        fs.writeFile("../hardware/redLight", "off")
    }
}