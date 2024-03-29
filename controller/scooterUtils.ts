const fs = require('fs')

import ScooterApi from "../model/scooterApi"
import HardwareBridge from "../model/hardwareBridge"
import StatusMessage from "../model/types/statusMessage";
import ScooterMessage from "../model/types/scooterMessage";
import BatteryMessage from "../model/types/batteryMessage";
import Position from "../model/types/position";
import Scooter from "../model/types/scooter";
import WSMessage from "../model/types/wsMessage";

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
                rentScooterMessage = {
                    "message": "Failed to update database"
                }
            }
        } else {
            rentScooterMessage = {
                "message": "Could not rent scooter"
            }
            this.updateLogRentFail(customerId)
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
            const batteryStatus = this.batteryWarning(scooter)
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
            } else if (statusMessage.success == false) {
                this.updateLogDatabaseFail(scooterId)
                returnScooterMessage = {
                    "message": "Failed to update database"
                }
            }
        } else {
            returnScooterMessage = {
                "message": "Could not return scooter"
            }
            this.updateLogRentFail(customerId)
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

    /**
     * Updates the log in case PUT request for the scooter fails.
     * @param {number} scooterId 
     */
    updateLogDatabaseFail: function (scooterId: number): void {
        const currentDate = HardwareBridge.getDate()
        const currentTime = HardwareBridge.getTime()

        const string = "ERROR: Database update failed for scooter " + scooterId + " at " + currentDate + " - " + currentTime + "\n"

        fs.appendFileSync(logPath, string, appendFileFlag)
    },

    /**
     * Updates the log in case a customer fails to rent or return a scooter
     * @param {number} customerId 
     */
    updateLogRentFail: function (customerId: number): void {
        const currentDate = HardwareBridge.getDate()
        const currentTime = HardwareBridge.getTime()

        const string = "ERROR: Customer " + customerId + " attempted to rent/return scooter at " + currentDate + " - " + currentTime + " but failed." + "\n"

        fs.appendFileSync(logPath, string, appendFileFlag)
    },

    /**
     * Currently not in use
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
     * Currently not in use
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
     * Currently not in use
     * Related to requirement 3: The scooter should be able to tell it's current speed
     * @returns {number} Current speed
     */
    checkSpeed: function (): number {
        const scooterId = HardwareBridge.readScooterId()
        const speed = HardwareBridge.checkSpeedometer(scooterId)
        return speed
    },

    /**
     * Related to requirement 7: The scooter should be able to warn if it needs charging
     * @async
     * @returns {Object} Information about battery status
     */
    batteryWarning: function (scooter: Scooter): BatteryMessage {
        const batteryLevel = HardwareBridge.checkBattery(scooter.id)

        const battery: BatteryMessage = {
            "batteryLevel": batteryLevel,
            "needsCharging": batteryLevel < 0.1 && !scooter.charging
        }

        return battery
    },

    /**
     * Currently not in use
     * Related to requirement 4: An administrator should be able to set the scooter in disabled mode (on/off)
     * @async
     * @param {boolean} off If it should be turned off or not
     * @returns {Object} Information if the update was successful or not
     */
    setDisabled: async function (disabled: boolean, scooterId: number): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)

        if (disabled == true) {
            scooter.disabled = disabled
            scooter.available = false
            HardwareBridge.lampOn(scooterId)
        } else if (disabled == false) {
            scooter.disabled = disabled
            scooter.available = true
            HardwareBridge.lampOff(scooterId)
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    },

    /**
     * Currently not in use
     * Related to requirement 9: Should be able to change to/from service mode.
     * @async
     * @param {boolean} serviced 
     * @returns {Object} Information if the update was successful or not
     */
    setServiced: async function (serviced: boolean, scooterId: number): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)

        if (serviced == true) {
            scooter.beingServiced = serviced
            scooter.available = false
            HardwareBridge.lampOn(scooterId)
        } else if (serviced == false) {
            scooter.beingServiced = serviced
            scooter.available = true
            HardwareBridge.lampOff(scooterId)
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)
        return statusMessage
    },

    /**
     * Currently not in use
     * Change the decomissioned status
     * @async
     * @param {boolean} decomissioned 
     * @param {number} scooterId 
     * @returns {Object} Information if the update was successful or not
     */
    setDecomissioned: async function (decomissioned: boolean, scooterId: number): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)

        if (decomissioned == true) {
            scooter.decomissioned = decomissioned
            scooter.available = false
            HardwareBridge.lampOn(scooterId)
        } else if (decomissioned == false) {
            scooter.decomissioned = decomissioned
            scooter.available = true
            HardwareBridge.lampOff(scooterId)
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)
        return statusMessage
    },

    /**
     * Currently no in use
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
            HardwareBridge.lampOn(scooterId)
        } else if (shouldCharge == false) {
            scooter.charging = false
            scooter.available = true
            HardwareBridge.lampOff(scooterId)
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    },

    /**
     * Change available to true/false
     * @param {number} scooterId 
     * @param {boolean} available 
     * @returns {Object} A statusmessage if the update was successful or not
     */
    setAvailable: async function (scooterId: number, available: boolean): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)
        scooter.available = available

        const statusMessage = await ScooterApi.update(scooter)
        statusMessage.available = available
        return statusMessage
    },

    /**
     * Checks if the incoming websocket-message has changed the scooters status regarding
     * decomissioned, service mode and disable mode. If so, the scooter changes it's
     * available status accordingly.
     * @param {number} scooterId 
     * @param {Object} message A websocket message
     * @returns {Object} A status message whether the available status was updated or not
     */
    checkStatusChange: async function (scooterId: number, message: WSMessage): Promise<StatusMessage> {
        let statusMessage: StatusMessage = {
            "success": false,
        }

        if (Object.prototype.hasOwnProperty.call(message, "decomissioned") && message.decomissioned ||
            Object.prototype.hasOwnProperty.call(message, "beingServiced") && message.beingServiced ||
            Object.prototype.hasOwnProperty.call(message, "disabled") && message.disabled) {
            const available = false
            statusMessage = await this.setAvailable(scooterId, available)
        } else if (Object.prototype.hasOwnProperty.call(message, "decomissioned") && !message.decomissioned ||
            Object.prototype.hasOwnProperty.call(message, "beingServiced") && !message.beingServiced ||
            Object.prototype.hasOwnProperty.call(message, "disabled") && !message.disabled) {
            const available = true
            statusMessage = await this.setAvailable(scooterId, available)
        }

        return statusMessage
    },
}