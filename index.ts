const WebSocketClient = require('websocket').client;
import { setInterval } from 'timers';
import ScooterUtils from './controller/scooterUtils'
import HardwareBridge from './model/hardwareBridge';
import ScooterApi from './model/scooterApi';
import WSMessage from './model/types/wsMessage';
import { connection, Message } from 'websocket'
require("dotenv").config({ path: `./env/${process.env.NODE_ENV}.env` })

const scooterId = HardwareBridge.readScooterId()
const updateTime = Number(ScooterApi.getEnvVariable("HARDWARE_UPDATE"))

/**
 * Websocket client.
 */
const wsUrl = ScooterApi.getEnvVariable("WS_URL")
const wsClient = new WebSocketClient()
let refreshInterval: NodeJS.Timeout
let lastPosition: [number, number] = [0, 0]

ScooterApi.token(scooterId).then((value) => {
    const token = value.toString()

    process.env.TOKEN = token
    wsClient.connect(wsUrl, undefined, undefined, {
        "sec-websocket-protocol": token
    })
})

wsClient.on('connectFailed', function (error: Error) {
    console.error("WebSocket connect error:", error)
})

wsClient.on('connect', function (connection: connection) {
    console.log('Webscoket: Client Connected');
    const subscribeMsg = {
        message: "subscribe",
        subscriptions: "trip, scooter"
    }
    connection.send(JSON.stringify(subscribeMsg))

    connection.on('error', function () {
        console.log('Websocket: Connection Error');
    });

    connection.on('close', function () {
        console.log('Websocket: Client Closed');
    });

    connection.on('message', async function (message: Message) {
        if (message.type == "utf8") {
            const msg: WSMessage = JSON.parse(message.utf8Data)

            if (msg.scooterId == scooterId) {
                switch (msg.message) {
                    case "trip": {
                        const customerId = msg.customerId

                        const available = await ScooterUtils.checkAvailable()
                        if (msg.timeEnded !== undefined) {
                            await ScooterUtils.endScooterRent(customerId)
                        } else if (available) {
                            await ScooterUtils.beginScooterRent(customerId)
                        }
                        break;
                    }

                    case "scooter": {
                        const statusMessage = await ScooterUtils.checkStatusChange(scooterId, msg)

                        if (statusMessage.success) {
                            const scooterMsg = {
                                message: "scooter",
                                scooterId: scooterId,
                                available: statusMessage.available
                            }
                            connection.send(JSON.stringify(scooterMsg))
                        }
                        break;
                    }
                }
            }
        }
    });

    HardwareBridge.touchFiles()

    refreshInterval = setInterval(() => {
        const battery = HardwareBridge.checkBattery(scooterId)
        const gps = HardwareBridge.checkPosition(scooterId)
        const latitude = gps.x
        const longitude = gps.y
        const speedometer = HardwareBridge.checkSpeedometer(scooterId)
        const hardwareMsg = {
            message: "scooter",
            scooterId: scooterId,
            positionX: latitude,
            positionY: longitude,
            battery: battery,
            currentSpeed: speedometer
        }

        if (JSON.stringify(lastPosition) != JSON.stringify([longitude, latitude])) {
            lastPosition = [longitude, latitude]
            connection.send(JSON.stringify(hardwareMsg))
        }
    }, updateTime)

});

process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    clearInterval(refreshInterval)
    process.exit(0);
});