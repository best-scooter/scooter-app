const fs = require('fs')

import ScooterApi from "../model/scooterApi"
import HardwareBridge from "../model/hardwareBridge"
import StatusMessage from "../model/types/statusMessage";
import ScooterMessage from "../model/types/scooterMessage";
import BatteryMessage from "../model/types/batteryMessage";
import Position from "../model/types/position";
import Scooter from "../model/types/scooter";
import hardwareBridge from "../model/hardwareBridge";

const logPath = ScooterApi.getEnvVariable("LOG_PATH")
const appendFileFlag = { encoding: "utf8", flag: "a+", mode: 0o666 }

export default {
    /**
     * Checks if a scooter can be rented by a customer. If so, the scooter is rented.
     * Related to requirement 5: A customer should be able to rent a scooter.
     * @async
     * @param {number} customerId Customer ID
     * @returns {Object} Information regarding if the scooter was successfully rented
     */
    beginScooterRent: async function (customerId: number): Promise<ScooterMessage> {
        const scooterId = HardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)
        const battery = HardwareBridge.checkBattery(scooterId)
        let rentScooterMessage: ScooterMessage = {}

        if (
            scooter.available &&
            battery > 0.3 &&
            !scooter.decomissioned &&
            !scooter.beingServiced &&
            !scooter.charging &&
            !scooter.disabled
        ) {
            scooter.available = false
            const position = HardwareBridge.checkPosition(scooterId)
            scooter.positionX = position.x
            scooter.positionY = position.y

            const updatedScooter = scooter
            const statusMessage = await ScooterApi.update(updatedScooter)

            if (statusMessage.success) {
                rentScooterMessage = {
                    "rentedScooterId": scooter.id,
                    "message": "Scooter " + scooter.id + " successfully rented",
                    "customerId": customerId
                }
                const start = true
                this.updateLog(start, customerId, position)
            } else if (statusMessage.success == false) {
                this.updateLogDatabaseFail(scooterId)
            }
        } else {
            rentScooterMessage = {
                "message": "Could not rent scooter"
            }
            this.updateLogFail(customerId)
        }

        return rentScooterMessage
    },

    /**
     * Customer returns a scooter
     * Related to requirement 6: Customer should be able to return a scooter.
     * @async
     * @param {number} customerId Customer ID
     * @returns {Object} Information regarding if the scooter was successfully returned
     */
    endScooterRent: async function (customerId: number): Promise<ScooterMessage> {
        const scooterId = HardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)
        let returnScooterMessage: ScooterMessage = {}

        if (!scooter.available) {
            const batteryStatus = this.checkBattery(scooter)
            const needsCharging = batteryStatus.needsCharging

            scooter.available = true
            scooter.battery = batteryStatus.batteryLevel
            const position = HardwareBridge.checkPosition(scooterId)
            scooter.positionX = position.x
            scooter.positionY = position.y

            const updatedScooter = scooter

            const statusMessage = await ScooterApi.update(updatedScooter)
            if (statusMessage.success) {
                returnScooterMessage = {
                    "message": "Scooter " + scooter.id + " successfully returned",
                    "needsCharging": needsCharging,
                    "customerId": customerId
                }
                const start = false
                this.updateLog(start, customerId, position)
            }
        } else {
            returnScooterMessage = {
                "message": "Could not return scooter"
            }
            this.updateLogFail(customerId)
        }

        return returnScooterMessage
    },

    /**
     * Update the log at the beginning and end of every trip made with the scooter
     * @param {boolean} start If it is the start or end of a trip
     * @param {number} customerId Customer ID
     * @param {Object} position The current position
     * @returns {boolean} Indicates if the log was successfully updated or not
     */
    updateLog: function (start: boolean, customerId: number, position: Position): void {
        const currentDate = HardwareBridge.getDate()
        const currentTime = HardwareBridge.getTime()

        const startString = "Journey start: Customer " + customerId + " - " + position.x + " " + position.y + " - " + currentDate + " - " + currentTime + "\n"
        const endString = "Journey end: Customer " + customerId + " - " + position.x + " " + position.y + " - " + currentDate + " - " + currentTime + "\n"

        if (start) {
            fs.appendFileSync(logPath, startString, appendFileFlag)
        } else if (!start) {
            fs.appendFileSync(logPath, endString, appendFileFlag)
        }
    },

    updateLogFail: function (customerId: number): void {
        const currentDate = HardwareBridge.getDate()
        const currentTime = HardwareBridge.getTime()

        const string = "ERROR: Customer " + customerId + " attempted to rent/return scooter at " + currentDate + " - " + currentTime + " but failed." + "\n"

        fs.appendFileSync(logPath, string, appendFileFlag)
    },

    updateLogDatabaseFail: function (scooterId: number): void {
        const currentDate = HardwareBridge.getDate()
        const currentTime = HardwareBridge.getTime()

        const string = "ERROR: Database update failed for scooter " + scooterId + " at " + currentDate + " - " + currentTime + "\n"

        fs.appendFileSync(logPath, string, appendFileFlag)
    },

    /**
     * Related to requirement 2: The bike should be able to update it's position (within regular intervals)
     * @async
     * @returns {boolean} If the update was successful or not
     */
    updatePosition: async function (): Promise<boolean> {
        const scooterId = HardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)

        const position = HardwareBridge.checkPosition(scooterId)
        scooter.positionX = position.x
        scooter.positionY = position.y

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)
        return statusMessage.success
    },

    /**
     * Related to requirement 3: The scooter should be able to tell if it's available
     * @async
     * @returns {boolean} If it is available or not
     */
    checkAvailable: async function (): Promise<boolean> {
        const scooterId = HardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)
        return scooter.available
    },

    /**
     * Related to requirement 3: The scooter should be able to tell it's current speed
     * @returns {number} Current speed
     */
    checkSpeed: function (): number {
        const scooterId = HardwareBridge.readScooterId()
        const speed = HardwareBridge.checkSpeedometer(scooterId)
        return speed
    },

    /**
     * Related to requirement 4: An administrator should be able to set the scooter in disabled mode (on/off)
     * @async
     * @param {boolean} off If it should be turned off or not
     * @returns {Object} Information if the update was successful or not
     */
    setDisabledOrNot: async function (off: boolean): Promise<StatusMessage> {
        const scooterId = hardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)

        if (off) {
            scooter.disabled = true
        } else if (!off) {
            scooter.disabled = false
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    },

    /**
     * Related to requirement 7: The scooter should be able to warn if it needs charging
     * @async
     * @returns {Object} Information about battery status
     */
    checkBattery: function (scooter: Scooter): BatteryMessage {
        const batteryLevel = HardwareBridge.checkBattery(scooter.id)

        const battery: BatteryMessage = {
            "batteryLevel": batteryLevel,
            "needsCharging": batteryLevel < 0.1 && !scooter.charging,
        }

        return battery
    },

    /**
     * Related to requirement 9: Should be able to change to/from service mode.
     * @async
     * @param {boolean} serviced 
     * @returns {Object} Information if the update was successful or not
     */
    servicedOrNot: async function (serviced: boolean): Promise<StatusMessage> {
        const scooterId = HardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)

        if (serviced) {
            scooter.beingServiced = true
            scooter.available = false
        } else if (!serviced) {
            scooter.beingServiced = false
            scooter.available = true
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)
        return statusMessage
    },

    /**
     * The scooter should be able to be charged. If it is being charged, it can not be rented until fully charged
     * Related to requirement 9: A scooter which is being charged (at a charging station) should not be able to be rented by a customer
     * @async
     * @param {boolean} shouldCharge If the scooter should be charged or not
     * @returns {Object} Information if the update was successful or not
     */
    changeCharging: async function (shouldCharge: boolean): Promise<StatusMessage> {
        const scooterId = HardwareBridge.readScooterId()
        const scooter = await ScooterApi.read(scooterId)

        if (shouldCharge) {
            scooter.charging = true
            scooter.available = false
            HardwareBridge.lampOff(scooterId)
        } else if (!shouldCharge) {
            scooter.charging = false
            scooter.available = true
            HardwareBridge.lampOn(scooterId)
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    }
}