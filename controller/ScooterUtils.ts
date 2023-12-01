import ScooterApi from "../model/ScooterApi"
import HardwareBridge from "../model/HardwareBridge"
import StatusMessage from "../model/types/statusMessage.ts";
import ScooterMessage from "../model/types/scooterMessage.ts";
import BatteryMessage from "../model/types/batteryMessage.ts";

let scooterId = HardwareBridge.readScooterId()

export default {

    // Krav 5. Kund ska kunna hyra cykel
    rentBike: async function (): Promise<ScooterMessage> {
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

    // Krav 6. Kund lämnar tillbaka cykel.
    returnScooter: async function (): Promise<ScooterMessage> {
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

    // Relaterat till krav 2, meddela position med jämna mellanrum
    updatePosition: async function (): Promise<boolean> {
        const scooter = await ScooterApi.read(scooterId)

        const position = HardwareBridge.checkPosition()
        scooter.position_x = position.position_x
        scooter.position_y = position.position_y

        let updatedScooter = scooter
        const statusMessage = await ScooterApi.update(updatedScooter)
        return statusMessage.success
    },

    // Krav 3, cykeln kan meddela om den kör (är tillgänglig) eller inte
    checkAvailable: async function (): Promise<boolean> {
        const scooter = await ScooterApi.read(scooterId)
        return scooter.available
    },

    // Krav 3, meddela aktuell hastighet
    checkSpeed: function (): number {
        const speed = HardwareBridge.checkSpeedometer()
        return speed
    },

    // Krav 4, kunna stänga av cykeln (eller starta).
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

    // krav 7, cykeln ska varna om den behöver laddas. vilket 'battery.needsCharging' kollar
    checkBattery: async function (): Promise<BatteryMessage> {
        const scooter = await ScooterApi.read(scooterId)
        const batteryLevel = HardwareBridge.checkBattery()

        let battery = {
            "batteryLevel": batteryLevel,
            "needsCharging": batteryLevel < 10 && !scooter.charging,
        }

        return battery
    },

    // krav 9, kunna ändra till/från underhållsläge. 
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

    // cykeln ska kunna laddas, och då inte gå att hyra tills den är klar
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
    },

    // cykeln ska spara en logg med resor
}