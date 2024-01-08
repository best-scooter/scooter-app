const WebSocketClient = require('websocket').client;
import ScooterUtils from './controller/scooterUtils'
import HardwareBridge from './model/hardwareBridge';
import ScooterApi from './model/scooterApi';
import {connection, Message} from 'websocket'
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
const wsClient = new WebSocketClient()

wsClient.on('connectFailed', function(error: any) {
    console.error("WebSocket connect error:", error)
})

wsClient.on('connect', function (connection: connection) {
    console.log('Webscoket: Client Connected');
    const subscribeMsg = {
        message: "subscribe",
        subscriptions: "trip"
    }
    connection.send(subscribeMsg)

    connection.on('error', function () {
        console.log('Websocket: Connection Error');
    });

    connection.on('close', function () {
        console.log('Websocket: Client Closed');
    });
    
    connection.on('message', async function (message: Message) {
        if (message.type == "utf8") {
            const msg = JSON.parse(message.utf8Data)
        
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
        }
    });

    HardwareBridge.touchFiles()

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
        connection.send(JSON.stringify(hardwareMsg))
    }, updateTime)
    
});

wsClient.connect(wsUrl, undefined, undefined, {
    "sec-websocket-protocol": token
})