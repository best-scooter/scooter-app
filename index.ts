const WebSocketClient = require('websocket').w3cwebsocket;
import ScooterUtils from './controller/scooterUtils'
import HardwareBridge from './model/hardwareBridge';
import ScooterApi from './model/scooterApi';
require("dotenv").config({ path: `./env/${process.env.NODE_ENV}.env` })

const scooterId = HardwareBridge.readScooterId()
const token = ScooterApi.token(scooterId)

// TODO: Ändra i simulation.env: LOG_PATH, HARDWARE_PATH, WS_MOCK
// TODO: fixa så att wsUrl och mockUrl är env variabler

/**
 * Main websocket client.
 */
const wsUrl = "wss://localhost:3000" // temporarily for development reasons TODO: beroende på miljö
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
            const customerId = msg.customerId

            const available = await ScooterUtils.checkAvailable()
            if (available) {
                ScooterUtils.beginScooterRent(customerId)
            } else if (msg.timeEnded !== undefined) {
                ScooterUtils.endScooterRent(customerId)
                // TODO: Eventuellt lägga till underlag för laddning ifall msg.parkedCharging implementeras
            }
            break;
        case "setDisabledOrNot":
            const disabled = false // get from message?
            ScooterUtils.setDisabledOrNot(disabled)
            break;
        case "servicedOrNot":
            const serviced = false // get from message?
            ScooterUtils.servicedOrNot(serviced)
            break;
        case "changeCharging":
            const charge = false // get from message?
            ScooterUtils.changeCharging(charge)
            break;
    }
};

/**
 * Mock-service client.
 */
const mockUrl = "wss://localhost:3000" // temporarily for development reasons TODO: beroende på miljö
const mockClient = new WebSocketClient(mockUrl, token)

mockClient.onerror = function () {
    console.log('Mock-service: Connection Error');
};

mockClient.onopen = function () {
    console.log('Mock-service: Client Connected');
};

mockClient.onclose = function () {
    console.log('Mock-service: Client Closed');
};

// Ha intervall-grejen i mock-servicen??? Eller i scooter-app?
mockClient.onmessage = function (event: string) {
    const msg = JSON.parse(event)

    switch (msg.message) {
        case "hardwareUpdate":
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
            wsClient.send(hardwareMsg)
    }
};

//mockService.on((message) => {
//    WriteBatteryFileFunction(message.batteryLevel);
//    WritePositionFile(message.position);
//})
