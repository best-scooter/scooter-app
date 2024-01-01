const hardwarePath = process.env["HARDWARE_PATH"]
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }
const fs = require('fs')

export default {
    fakeBattery: function (scooterId: string): Object {
        try {
            const allBatteriesStart = fs.readFileSync(hardwarePath + "battery", readFileFlag)

            const allBatteries = JSON.parse(allBatteriesStart)

            if (Object.values(allBatteries).length > 0) {
                const newBatteryLevel = Math.random()
                allBatteries[scooterId] = newBatteryLevel
                const allBatteriesEnd = JSON.stringify(allBatteries)
                fs.writeFileSync(hardwarePath + "battery", allBatteriesEnd, writeFileFlag)
                return allBatteriesEnd
            } else {
                const batteryLevel = Math.random()
                const battery = {
                    [scooterId]: batteryLevel
                }

                const batteryString = JSON.stringify(battery)

                fs.writeFileSync(hardwarePath + "battery", batteryString, writeFileFlag)
                return batteryString
            }
        } catch (error) {
            console.error(error)
        }
    },

    fakeReadBattery: function (scooterId: string): number {
        try {
            const allBatteriesStart = fs.readFileSync(hardwarePath + "battery", readFileFlag)
            const allBatteries = JSON.parse(allBatteriesStart)
            const battery = allBatteries[scooterId]
            return battery
        } catch (error) {
            console.error(error)
        }

    }
}

// docker run -v scooter-app_hardware:/hardware/ -i fedora /bin/bash
