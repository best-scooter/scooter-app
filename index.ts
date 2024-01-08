const WebSocketClient = require('websocket').w3cwebsocket;
import ScooterUtils from './controller/scooterUtils'
import HardwareBridge from './model/hardwareBridge';
import ScooterApi from './model/scooterApi';
require("dotenv").config({ path: `./env/${process.env.NODE_ENV}.env` })

const scooterId = HardwareBridge.readScooterId()
const token = ScooterApi.token(scooterId).then((value) => {
    process.env.TOKEN = value.toString()
})

const updateTime = Number(ScooterApi.getEnvVariable("HARDWARE_UPDATE"))

// TODO: Lägga till volymen i bash-scriptet: "docker run -d -e SCOOTERID=$counter -e PASSWORD=$counter --network=... --link=... --port=... -volume="hardware:/scooter-app/model/hardware/:ro" <image>"
// TODO: Tester får inte till token env???

/**
 * Websocket client.
 */
const wsUrl = ScooterApi.getEnvVariable("WS_URL")
const wsClient = new WebSocketClient(wsUrl, token)

wsClient.onerror = function () {
    console.log('Websocket: Connection Error');
};

wsClient.onopen = function () {
    console.log('Webscoket: Client Connected');
    const subscribeMsg = {
        message: "subscribe",
        subscriptions: "trip"
    }
    wsClient.send(subscribeMsg)
};

wsClient.onclose = function () {
    console.log('Websocket: Client Closed');
};

wsClient.onmessage = async function (event: string) {
    const msg = JSON.parse(event)

    switch (msg.message) {
        case "trip":
            if (msg.scooterId == scooterId) {
                const customerId = msg.customerId

                const available = await ScooterUtils.checkAvailable()
                if (msg.timeEnded !== undefined) {
                    await ScooterUtils.endScooterRent(customerId)
                } else if (available) {
                    await ScooterUtils.beginScooterRent(customerId)
                }
                break;
            }
    }
};

setInterval(() => {
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
    wsClient.send(JSON.stringify(hardwareMsg))
}, updateTime)
