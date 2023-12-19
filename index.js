import Websocket from 'ws'
import ScooterUtils from './controller/ScooterUtils'

const url = "wss://localhost:3000" // temporarily for development reasons
const protocol = "scooter" // temporarily for development reasons
const wsServer = new Websocket(url, protocol)

wsServer.onopen = (event) => {
    alert("Connection established")
}

wsServer.onmessage = (event) => {
    const msg = JSON.parse(event.data)

    switch (msg.type) {
        case "beginRent":
            customerId = 0 // get from message
            ScooterUtils.beginScooterRent(customerId)
            break;
        case "endRent":
            customerId = 0 // get from message
            ScooterUtils.endScooterRent(customerId)
            // behöver skicka tillbaka varning om laddning?
            break;
        case "updatePosition":
            ScooterUtils.updatePosition()
            break;
        case "checkAvailable":
            available = ScooterUtils.checkAvailable()
            wsServer.send(available)
            break;
        case "checkSpeed":
            speed = ScooterUtils.checkSpeed()
            wsServer.send(speed)
            break;
        case "setDisabledOrNot":
            off = false // get from message
            ScooterUtils.setDisabledOrNot(off)
            break;
        case "checkBattery":
            scooter = 0 // get from message
            battery = ScooterUtils.checkBattery(scooter)
            wsServer.send(battery)
            break;
        case "servicedOrNot":
            serviced = false // get from message
            ScooterUtils.servicedOrNot(serviced)
            break;
        case "changeCharging":
            charge = false // get from message
            ScooterUtils.changeCharging(charge)
            break;
    }
}

wsServer.onclose = (event) => {
    if (event.wasClean) {
        alert(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        alert('Connection died');
    }
}

wsServer.onerror = (error) => {
    alert("error: " + error)
}