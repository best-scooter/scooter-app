var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')

var myEnv = dotenv.config({ path: `./env/${process.env.NODE_ENV}.env` })
dotenvExpand.expand(myEnv)

import ScooterApi from "./model/scooterApi";
import FakeDataTest from "./fakeDataTest"
import HardwareBridge from './model/hardwareBridge';

// console.info(ScooterApi.getEnvVariable("HOSTNAME"))
// console.info(ScooterApi.getEnvVariable("SCOOTER_ID"))
// console.info(ScooterApi.getEnvVariable("BACKEND"))
// console.info(ScooterApi.getEnvVariable("VERSION"))
// console.info(ScooterApi.getEnvVariable("LOG_PATH"))
// console.info(ScooterApi.getEnvVariable("HARDWARE_PATH"))
// console.info(ScooterApi.getEnvVariable("WS_MOCK"))

const scooterId = ScooterApi.getEnvVariable("SCOOTER_ID")

const startBattery = FakeDataTest.fakeBattery(scooterId)


if (ScooterApi.getEnvVariable("WRITER")) {
    const updateInterval = setInterval(() => {
        const updatedBattery = FakeDataTest.fakeBattery(scooterId)
        console.log("Writing to file: \n" + updatedBattery)
    }, 5000)

    function clearInterval_update() {
        clearInterval(updateInterval)
    }
    setTimeout(clearInterval_update, 50000)
}

const readInterval = setInterval(() => {
    const readBattery = FakeDataTest.fakeReadBattery(scooterId)
    console.log("Read battery: \n" + readBattery)
}, 50)

function clearInterval_read() {
    clearInterval(readInterval)
}
setTimeout(clearInterval_read, 50000)

// services:
//   scooters:
//     image: linda-sunnergard/scooter-app:1.0
//     volumes:
//       - hardware:/model/hardware/
//     environment:
//       - NODE_ENV=simulation
//       - WRITER='false'
//     entrypoint: [ "node", "/scooter-app/dist/hardwareTest.js" ]
//     deploy:
//       mode: replicated
//       replicas: 50
      
//   scooter-writer:
//     image: linda-sunnergard/scooter-app:1.0
//     volumes:
//       - hardware:/model/hardware/
//     environment:
//       - NODE_ENV=simulation
//       - WRITER='true'
//     entrypoint: [ "node", "/scooter-app/dist/hardwareTest.js" ]
// volumes:
//   hardware:
  