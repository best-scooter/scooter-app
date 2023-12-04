import Position from "./types/position"
const basePath = "model/hardware/"
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }
const fs = require('fs')

export default {
    /**
     * Get the scooter id from the fake hardware.
     * 
     * @returns {number} Scooter ID
     */
    readScooterId: function (): number {
        const scooterId = process.env.SCOOTER_ID
        return Number(scooterId)
    },

    /**
     * Get the scooters position from the fake hardware.
     * 
     * @returns {Object} The information about latitude (position_x) and longitude (position_y)
     */
    checkPosition: function (): Position {
        let position_x_y = fs.readFileSync(basePath + "gps", readFileFlag)
        let positionArray = position_x_y.split(", ")
        let position = {
            "position_x": Number(positionArray[0]),
            "position_y": Number(positionArray[1])
        }

        return position
    },

    /**
     * Get the battery level from the fake hardware.
     * 
     * @returns {number} Battery level
     */
    checkBattery: function (): number {
        const batteryLevel = fs.readFileSync(basePath + "battery", readFileFlag)
        return Number(batteryLevel)
    },

    /**
     * Get the speed from the fake hardware.
     * 
     * @returns {number} Current speed
     */
    checkSpeedometer: function (): number {
        const speed = fs.readFileSync(basePath + "speedometer", readFileFlag)
        return Number(speed)
    },

    /**
     * Change the fake lamp to on, if the scooter is being charged to show it is not available
     */
    lampOn: function (): void {
        fs.writeFileSync(basePath + "redLight", "on", writeFileFlag)
    },

    /**
     * Change the fake lamp to off, if the scooter is not being charged to show it is available
     */
    lampOff: function (): void {
        fs.writeFileSync(basePath + "redLight", "off", writeFileFlag)
    },

    /**
     * Get the current date.
     * 
     * @returns {string} Returns the current date in the format DD-MM-YYYY
     */
    getDate: function (): string {
        const currentDate = new Date()

        const currentDay = this.addZero(currentDate.getDate())
        const currentMonth = this.addZero(currentDate.getMonth() + 1)
        const currentYear = currentDate.getFullYear();

        const dateString = currentDay + "-" + currentMonth + "-" + currentYear;

        return dateString
    },

    /**
     * Get the current time.
     * 
     * @returns {string} Returns the current time in the format HH-MM-SS
     */
    getTime: function (): string {
        const currentDate = new Date()

        const hours = this.addZero(currentDate.getHours())
        const minutes = this.addZero(currentDate.getMinutes())
        const seconds = this.addZero(currentDate.getSeconds())

        const timeString = hours + ":" + minutes + ":" + seconds
        return timeString
    },

    /**
     * Adds a 0 if the day, month, hour, minute or second sent in is less than 10.
     * 
     * @param {number }dateOrTime The date or time to be checked.
     * @returns {string} Returns the date or time in the correct format.
     */
    addZero: function (dateOrTime: number): string {
        let dateOrTimeString = dateOrTime.toString()

        if (dateOrTime <= 9) {
            dateOrTimeString = "0" + dateOrTimeString
        }

        return dateOrTimeString
    }
}