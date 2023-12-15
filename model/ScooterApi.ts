import Scooter from "./types/scooter"
import StatusMessage from "./types/statusMessage"

export default {
    /**
     * GET information about a single scooter
     * @async
     * @param {number} scooterId Scooter ID
     * @returns {Object} A scooter object
     */
    read: async function (scooterId: number): Promise<Scooter> {
        const backendServer = this.getEnvVariable("BACKEND")
        const version = this.getEnvVariable("VERSION")
        const url = backendServer + version + "/scooter/" + scooterId;

        const scooter = fetch(url)
            .then((response) => {
                if (response.status == 200) {
                    return response.json()
                }
            })
            .then((result) => {
                if (result !== undefined) {
                    return result.data[0]
                }
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
        const backendServer = this.getEnvVariable("BACKEND")
        const version = this.getEnvVariable("VERSION")
        const scooterId = updatedScooter.id
        const url = backendServer + version + "/scooter/" + scooterId;
        let statusMessage: StatusMessage = {
            "success": false,
        }

        const response = await fetch(url, {
            body: JSON.stringify(updatedScooter),
            headers: {
                "content-type": "application/json"
            },
            method: "PUT"
        })
            .then((response) => {
                return response
            })

        if (response.status == 204) {
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
    },

    getEnvVariable: function (name: string): string {
        const variable = process.env[name]

        if (variable === undefined) {
            throw new Error("Missing " + name + " environment variable.")
        }
        return variable
    }
}