import ScooterApi from "../model/ScooterApi"
import HardwareBridge from "../model/HardwareBridge"
import StatusMessage from "../model/types/statusMessage.ts";
import ScooterMessage from "../model/types/scooterMessage.ts";
import BatteryMessage from "../model/types/batteryMessage.ts";

let scooterId = HardwareBridge.readScooterId()

export default {

    /**
     * Checks if a scooter can be rented by a customer. If so, the scooter is rented.
     * Related to requirement 5: A customer should be able to rent a scooter.
     * @async
     * @param {number} customerId Customer ID
     * @returns {Object} Information regarding if the scooter was successfully rented
     */
    beginTrip: async function (customerId: number): Promise<ScooterMessage> {
        let scooter = await ScooterApi.read(scooterId)
        const battery = HardwareBridge.checkBattery()
        let rentScooterMessage: ScooterMessage = {}

        if (
            scooter.available &&
            battery > 20 &&
            !scooter.decomission &&
            !scooter.being_serviced &&
            !scooter.charging // cykel som laddas på laddstation kan inte hyras (förrän den är fulladdad???)
        ) {
            scooter.available = false
            scooter.on = true
            const position = HardwareBridge.checkPosition()
            scooter.position_x = position.position_x
            scooter.position_y = position.position_y
        }

        const updatedScooter = scooter

        // Update the log with trip start, plats, tid, customerid

        const statusMessage = await ScooterApi.update(updatedScooter)
        // postar jag en ny resa? eller vem äger det? vem lägger till startposition, starttid?

        if (statusMessage.success) {
            rentScooterMessage = {
                rentedScooterId: scooter.id,
                "message": "Scooter " + scooter.id + " successfully rented",
            }
        } else {
            rentScooterMessage = {
                "message": "Could not rent scooter"
            }
        }
        return rentScooterMessage
    },

    // updateLog: fixa

    /**
     * Customer returns a scooter
     * Related to requirement 6: Customer shoudl be able to return a scooter.
     * @async
     * @param {number} customerId Customer ID
     * @returns {Object} Information regarding if the scooter was successfully returned
     */
    endTrip: async function (customerId: number): Promise<ScooterMessage> {
        let scooter = await ScooterApi.read(scooterId)
        let returnScooterMessage: ScooterMessage = {}
        const batteryStatus = this.checkBattery()
        const needsCharging = batteryStatus.needsCharging

        scooter.available = true
        scooter.on = false
        scooter.battery = batteryStatus.batteryLevel
        const position = HardwareBridge.checkPosition()
        scooter.position_x = position.position_x
        scooter.position_y = position.position_y

        const updatedScooter = scooter

        // Update the log with trip end, plats, tid, customerid

        const statusMessage = await ScooterApi.update(updatedScooter)


        if (statusMessage.success) {
            returnScooterMessage = {
                "message": "Scooter " + scooter.id + " successfully returned",
                "needsCharging": needsCharging
            }
        } else {
            returnScooterMessage = {
                "message": "Could not return scooter"
            }
        }

        return returnScooterMessage
    },

    /**
     * Related to requirement 2: The bike should be able to update it's position (within regular intervals)
     * @async
     * @returns {boolean} If the update was successful or not
     */
    updatePosition: async function (): Promise<boolean> {
        const scooter = await ScooterApi.read(scooterId)

        const position = HardwareBridge.checkPosition()
        scooter.position_x = position.position_x
        scooter.position_y = position.position_y

        let updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)
        return statusMessage.success
    },

    /**
     * Related to requirement 3: The scooter should be able to tell if it's available
     * @async
     * @returns {boolean} If it is available or not
     */
    checkAvailable: async function (): Promise<boolean> {
        const scooter = await ScooterApi.read(scooterId)
        return scooter.available
    },

    // Krav 3, meddela aktuell hastighet
    /**
     * Related to requirement 3: The scooter should be able to tell it's current speed
     * @returns {number} Current speed
     */
    checkSpeed: function (): number {
        const speed = HardwareBridge.checkSpeedometer()
        return speed
    },

    /**
     * Related to requirement 4: You should be able to turn off/on the scooter
     * @async
     * @param {boolean} off If it should be turned off or not
     * @returns {Object} Information if the update was successful or not
     */
    turnOffOrOn: async function (off: boolean): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)

        if (off) {
            scooter.on == false
        } else if (!off) {
            scooter.on == true
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
    checkBattery: async function (): Promise<BatteryMessage> {
        const scooter = await ScooterApi.read(scooterId)
        const batteryLevel = HardwareBridge.checkBattery()

        let battery = {
            "batteryLevel": batteryLevel,
            "needsCharging": batteryLevel < 10 && !scooter.charging,
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
        const scooter = await ScooterApi.read(scooterId)

        if (serviced) {
            scooter.being_serviced = true
        } else if (!serviced) {
            scooter.being_serviced = false
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
        const scooter = await ScooterApi.read(scooterId)

        if (shouldCharge) {
            scooter.charging = true
            scooter.available = false
        } else if (!shouldCharge) {
            scooter.charging = false
            scooter.available = true
        }

        const updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    }
}