import Scooter from "./types/scooter"
import StatusMessage from "./types/statusMessage"

const backendServer = process.env.BACKEND // just nu enbart development

export default {
    /**
     * GET information about a single scooter
     * @async
     * @param {number} scooterId Scooter ID
     * @returns {Object} A scooter object
     */
    read: async function (scooterId: number): Promise<Scooter> {
        const scooter = fetch(backendServer + "/scooter/" + scooterId)
            .then((response) => response.json())
            .then((result) => {
                return result.data
            })
        return scooter
    },

    /**
     * PUT (update) information about a scooter
     * @async
     * @param {Object} updatedScooter The scooter object that should be updated
     * @returns {Object} Information about if the update was successful or not
     */
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