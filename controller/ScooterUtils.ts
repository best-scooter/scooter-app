import ScooterApi from "../model/ScooterApi"
import HardwareBridge from "../model/HardwareBridge"
import Scooter from "../model/types/scooter.ts";
import StatusMessage from "../model/types/statusMessage.ts";

let scooterId=HardwareBridge.readScooterId()

export default {

    // Krav 5. Kund ska kunna hyra cykel
    rentBike: async function(): Promise<Object> {
        let scooter= await ScooterApi.read(scooterId)
        let rentScooterMessage = {}
        if(
            scooter.on &&
            scooter.available &&
            scooter.battery > 20 &&
            !scooter.decomission &&
            !scooter.being_serviced
            ) {
                !scooter.available
                if (scooter.charging) {
                    !scooter.charging
                    // lägga till, startposition + starttid för resan? eller sköts det någon annanstans?
                }
            }

        const updatedScooter =  scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        if(statusMessage.status) {
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

    // Krav 6. Kunde lämnar tillbaka cykel.
    // Ska uppdateras: position, batteri (samt eventuell varning), available
    returnScooter: async function(): Promise<Object> {
        let scooter= await ScooterApi.read(scooterId)
        let rentScooter = {}

        scooter.available = true
        
        return -1
    },

    // Relaterat till krav 2, meddela position med jämna mellanrum
    // Jag har utgått ifrån att det skickas en request från websocket till scootern att jämföra tidigare position med aktuell position
    // Fråga att lösa: Hur ska vi simulera cyklarnas position?
    // FÖRSLAG: vi har tre startpositioner i varje stad vi finns i. När programmet startas randomiserad cyklarna till en stad och en startposition i staden.
    // När positionen ska uppdateras så uppdateras latitud och/eller longitid med en randomiserad siffra (float) mellan tex -10 till 10.
    updatePosition: async function () {
        const scooter= await ScooterApi.read(scooterId)
        const oldPositionX= scooter.position_x
        const oldPositionY = scooter.position_y

        const newPosition = HardwareBridge.updatePosition()

        let updatedScooter = scooter
        ScooterApi.update(updatedScooter)
        return -1 //currentPosition
    },

    // Krav 3, cykeln kan meddela om den kör (är tillgänglig) eller inte
    checkAvailable: async function (): Promise<boolean>{
        const scooter = await ScooterApi.read(scooterId)
        return scooter.available
    },

    // Krav 3, meddela aktuell hastighet
    // Tänker liknande upplägg som för updatePosition. En förfrågan skickas till cykeln att jämföra tidigare hastighet med aktuell hastighet.
    // Fråga att lösa: Hur ska vi simulera hastigheten?
    updateSpeed: function(oldSpeed: number) {
        return -1 // currentSpeed?
    },

    // Krav 4, kunna stänga av cykeln.
    // En update görs i databasen som ändrar att cykeln är avstängd
    turnOffOrOn: async function(off: boolean): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)

        if(off) {
            scooter.on == false
        } else if (!off) {
            scooter.on == true
        }

        const updatedScooter =  scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    },

    checkBattery: async function(): Promise<Object> {
        const scooter = await ScooterApi.read(scooterId)
        let battery = {
            "battery_level": scooter.battery,
            "needsCharging": scooter.battery < 10 && !scooter.charging,
        }

        return battery
    },

    // Ändra statusen.
    // Fixa så att den laddar 50% i timmen?
    charging: function() {
        return -1
    },

    // Uppdatera statusen services
    servicedOrNot: async function(serviced: boolean): Promise<StatusMessage> {
        const scooter = await ScooterApi.read(scooterId)

        if (serviced) {
            scooter.being_serviced = true
        } else if (!serviced) {
            scooter.being_serviced = false
        }

        const updatedScooter =  scooter
        const statusMessage = await ScooterApi.update(updatedScooter)

        return statusMessage
    },

    // Register a scooter object that reflects this scooter
    // Then save the returned ID to the file system (function 
    // should be in hardware_bridge)
    registerScooter: async function (): Promise<StatusMessage> {
        const position_x = HardwareBridge.createStartPositionX()
        const position_y = HardwareBridge.createStartPositionY()
        let statusMessage: StatusMessage = {}

        const newScooter = {
            "id": 0,
            "position_x": position_x,
            "position_y": position_y,
            "battery": 100.0,
            "max_speed": 20,
            "charging": false,
            "connected": false,
            "password": "",
            "available": true,
            "decomission": false,
            "being_serviced": false,
            "on": true,
        }

        const createdScooterId = await ScooterApi.create(newScooter)

        if (Number.isInteger(createdScooterId)) {
            HardwareBridge.saveScooterId(createdScooterId)
            statusMessage = {
                "status": true,
                "message": "Scooter successfully registered",
            }
        } else {
            statusMessage = {
                "status": false,
                "message": "Scooter was not registered"
            }
        }

        return statusMessage
    }
}