import Scooter from "./types/scooter"
import StatusMessage from "./types/statusMessage"

const backendServer = process.env.BACKEND // just nu enbart development

export default {
    // POST
    create: function (newScooter: Scooter): Promise<number> {
        const scooterDefaultId = 0
        const scooterId = fetch(backendServer + "/scooter/" + scooterDefaultId, {
            body: JSON.stringify(newScooter),
            headers: {
                "content-type": "application/json"
            },
            method: "PUT"
        })
            .then((response) => response.json())
            .then((result) => {
                return result.data.scooterId
            })

        return scooterId
    },

    // GET single
    read: async function (scooterId: number): Promise<Scooter> {
        const scooter = fetch(backendServer + "/scooter/" + scooterId)
            .then((response) => response.json())
            .then((result) => {
                return result.data
            })
        return scooter
    },

    // PUT
    update: async function (updatedScooter: Scooter): Promise<StatusMessage> {
        const scooterId = updatedScooter.id
        let statusMessage: StatusMessage = {
            "success": false,
        }
        const status = await fetch(backendServer + "/scooter/" + scooterId, {
            body: JSON.stringify(updatedScooter),
            headers: {
                "content-type": "application/json"
            },
            method: "PUT"
        })
            .then((response) => response.json())
            .then((result) => {
                return result.status
            })

        if (status == 204) {
            statusMessage = {
                "success": true,
                "message": "Successfully updated scooter information",
            }
        } else {
            statusMessage = {
                "success": false,
                "message": "Failed to update scooter information",
            }
        }

        return statusMessage
    }
}