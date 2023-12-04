import Position from "./types/position"

const fs = require('fs')

export default {
    /**
     * Get the scooter id from the fake hardware
     * @returns {number} Scooter ID
     */
    readScooterId: function (): number {
        const scooterId = process.env.SCOOTER_ID
        return Number(scooterId)
    },

    /**
     * Get the scooters position from the fake hardware
     * @returns {Object} The information about latitude (position_x) and longitude (position_y)
     */
    checkPosition: function (): Position {
        let position_x_y = fs.readFile("../hardware/gps")
        let positionArray = position_x_y.split(",") // eller ' ' eller \n
        let position = {
            "position_x": positionArray[0],
            "position_y": positionArray[1]
        }

        return position
    },

    /**
     * Get the battery level from the fake hardware
     * @returns {number} Battery level
     */
    checkBattery: function (): number {
        const batteryLevel = fs.readFile("../hardware/battery")
        return batteryLevel
    },

    /**
     * Get the speed from the fake hardware
     * @returns {number} Current speed
     */
    checkSpeedometer: function (): number {
        const speed = fs.readFile("../hardware/speedometer")
        return speed
    },

    /**
     * Change the fake lamp to on, if the scooter is being charged to show it is not available
     */
    lampOn: function (): void {
        fs.writeFile("../hardware/redLight", "on")
    },

    /**
     * Change the fake lamp to off, if the scooter is not being charged to show it is available
     */
    lampOff: function (): void {
        fs.writeFile("../hardware/redLight", "off")
    },

    /**
     * Get the current date
     * @returns {string} Returns the current date in the format DD-MM-YYYY
     */
    getDate: function (): string {
        const currentDate = new Date()
        const currentDayOfMonth = currentDate.getDate();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;

        return dateString
    },

    /**
     * Get the current time
     * @returns {string} Returns the current time in the format HH-MM-SS
     */
    getTime: function (): string {
        const currentDate = new Date()
        const hours = currentDate.getHours()
        const minutes = currentDate.getMinutes()
        const seconds = currentDate.getSeconds()

        const timeString = hours + ":" + minutes + ":" + seconds
        return timeString
    }
}