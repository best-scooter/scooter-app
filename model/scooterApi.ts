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
        const token = this.getEnvVariable("TOKEN")
        const url = backendServer + version + "/scooter/" + scooterId;

        const scooter = fetch(url, {
            headers: {
                "content-type": "application/json",
                "X-Access-Token": token
            },
            method: "GET"
        })
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
        const token = this.getEnvVariable("TOKEN")
        const url = backendServer + version + "/scooter/" + scooterId;
        let statusMessage: StatusMessage = {
            "success": false,
        }

        const response = await fetch(url, {
            body: JSON.stringify(updatedScooter),
            headers: {
                "content-type": "application/json",
                "X-Access-Token": token
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

    /**
     * POST in order to get a scooter token.
     * @param {number} scooterId 
     * @returns {string} A token
     */
    token: async function (scooterId: number): Promise<String> {
        const backendServer = this.getEnvVariable("BACKEND")
        const version = this.getEnvVariable("VERSION")
        const url = backendServer + version + "/scooter/" + "token";
        const tokenBody = {
            scooterId: scooterId,
            password: scooterId
        }

        const token = await fetch(url, {
            body: JSON.stringify(tokenBody),
            headers: {
                "content-type": "application/json"
            },
            method: "POST"
        })
            .then((response) => {
                if (response.status == 201) {
                    return response.json()
                }
            })
            .then((result) => {
                if (result !== undefined) {
                    return result.data.token
                }
            })
        return token
    },

    getEnvVariable: function (name: string): string {
        const variable = process.env[name]

        if (variable === undefined) {
            throw new Error("Missing " + name + " environment variable.")
        }
        return variable
    }
}