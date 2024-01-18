import ScooterUtils from "../controller/scooterUtils";
import FakeData from "./fakeData";

const fs = require('fs')
require('jest-fetch-mock').enableMocks();

const logPath = process.env.LOG_PATH
const hardwarePath = process.env.HARDWARE_PATH
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }

const originalLog = fs.readFileSync(logPath, readFileFlag)
const originalBattery = fs.readFileSync(hardwarePath + "battery", readFileFlag)
const originalGPS = fs.readFileSync(hardwarePath + "gps", readFileFlag)
const originalSpeed = fs.readFileSync(hardwarePath + "speedometer", readFileFlag)
const originalLamp = fs.readFileSync(hardwarePath + "redLight", readFileFlag)


beforeEach(() => {
    fetchMock.resetMocks()
    jest.resetModules()
    process.env.SCOOTER_ID = 1
})

afterEach(() => {
    fs.writeFileSync(logPath, originalLog, writeFileFlag)
    fs.writeFileSync(hardwarePath + "battery", originalBattery, writeFileFlag)
    fs.writeFileSync(hardwarePath + "gps", originalGPS, writeFileFlag)
    fs.writeFileSync(hardwarePath + "speedometer", originalSpeed, writeFileFlag)
    fs.writeFileSync(hardwarePath + "redLight", originalLamp, writeFileFlag)
})

test('Successfully rent a scooter', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 1
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterUtils.beginScooterRent(customerId)
    const expected = {
        "rentedScooterId": scooterId,
        "message": "Scooter " + scooterId + " successfully rented",
        "customerId": customerId
    }
    const log = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(Journey start: Customer 1 - 59.334591 18.063240 - )?/

    expect(result.rentedScooterId).toEqual(expected.rentedScooterId)
    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Fail to rent a scooter. Scooter is in service mode and not available.', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 2
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch.mockResponseOnce(JSON.stringify(
        {
            data: {
                id: 1,
                createdAt: "2023-12-04T10:11:12.000Z",
                updatedAt: "2023-12-05T10:11:12.000Z",
                positionX: 59.334591,
                positionY: 18.063240,
                battery: 0.51,
                maxSpeed: 20,
                charging: false,
                available: true,
                decomissioned: false,
                beingServiced: true,
                disabled: false,
                connected: false
            }
        }, 200
    ))

    const result = await ScooterUtils.beginScooterRent(customerId)
    const expected = {
        "message": "Could not rent scooter"
    }
    const log = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(ERROR: Customer 2 attempted to return scooter)?/

    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Fail to update database when renting a scooter.', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 2
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 404 })

    const result = await ScooterUtils.beginScooterRent(customerId)
    const expected = {
        "message": "Failed to update database"
    }
    const log = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(ERROR: Database update failed for scooter 8 at )?/

    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Successfully return a scooter', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 3
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.6,
                    maxSpeed: 20,
                    charging: false,
                    available: false,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterUtils.endScooterRent(customerId)
    const expected = {
        "message": "Scooter " + scooterId + " successfully returned",
        "needsCharging": false,
        "customerId": customerId
    }
    const log = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(Journey end: Customer 3 - 59.334591 18.063240 - )?/

    expect(result.message).toEqual(expected.message)
    expect(result.needsCharging).toEqual(expected.needsCharging)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Fail return a scooter. Already available', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 4
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch.mockResponseOnce(JSON.stringify(
        {
            data: {
                id: 1,
                createdAt: "2023-12-04T10:11:12.000Z",
                updatedAt: "2023-12-05T10:11:12.000Z",
                positionX: 59.334591,
                positionY: 18.063240,
                battery: 0.6,
                maxSpeed: 20,
                charging: false,
                available: true,
                decomissioned: false,
                beingServiced: false,
                disabled: false,
                connected: false
            }
        }, 200
    ))

    const result = await ScooterUtils.endScooterRent(customerId)
    const expected = {
        "message": "Could not return scooter",
    }
    const log = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(ERROR: Customer 4 attempted to rent\/return scooter)?/

    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Fail to update database when returning a scooter', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 2
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: false,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 404 })

    const result = await ScooterUtils.endScooterRent(customerId)
    const expected = {
        "message": "Failed to update database"
    }
    const log = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(ERROR: Database update failed for scooter 8 at )?/

    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Log the start of a journey', () => {
    const start = true
    const customerId = 5
    const position = {
        x: 59.334591,
        y: 18.063240
    }

    ScooterUtils.updateLog(start, customerId, position)
    const result = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(Journey start: Customer 5 - 59.334591 18.063240 - )?/

    expect(result).toMatch(regEx)
})

test('Log the end of a journey', () => {
    const start = false
    const customerId = 6
    const position = {
        x: 59.334591,
        y: 18.063240
    }

    ScooterUtils.updateLog(start, customerId, position)
    const result = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(Journey end: Customer 6 - 59.334591 18.063240 - )?/

    expect(result).toMatch(regEx)
})

test('Log a failed rent/return of scooter', () => {
    const customerId = 7
    ScooterUtils.updateLogRentFail(customerId)

    const result = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(ERROR: Customer 7 attempted to rent\/return scooter)?/

    expect(result).toMatch(regEx)
})

test('Log a database update fail', () => {
    const scooterId = 8
    ScooterUtils.updateLogDatabaseFail(scooterId)

    const result = fs.readFileSync(logPath, readFileFlag)
    const regEx = /^(ERROR: Database update failed for scooter 8 at )?/

    expect(result).toMatch(regEx)
})

test('Update position', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    FakeData.createFakeStartPosition()

    const scooterId = 1
    const result = await ScooterUtils.updatePosition()
    const expected = true

    expect(result).toEqual(expected)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Check if available', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1

    fetch.mockResponseOnce(JSON.stringify(
        {
            data: {
                id: 1,
                createdAt: "2023-12-04T10:11:12.000Z",
                updatedAt: "2023-12-05T10:11:12.000Z",
                positionX: 59.334591,
                positionY: 18.063240,
                battery: 0.51,
                maxSpeed: 20,
                charging: false,
                available: true,
                decomissioned: false,
                beingServiced: false,
                disabled: false,
                connected: false
            }
        }, 200
    ))

    const result = await ScooterUtils.checkAvailable()
    const expected = true

    expect(result).toEqual(expected)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Check speed', () => {
    const fakeSpeed = FakeData.fakeSpeed()
    const result = ScooterUtils.checkSpeed()

    expect(fakeSpeed).toEqual(result)
})

test('Set scooter as disabled', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOff()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const disabled = true
    const result = await ScooterUtils.setDisabled(disabled, scooterId)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Set scooter as not disabled', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOn()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: false,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: true,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const disabled = false
    const result = await ScooterUtils.setDisabled(disabled, scooterId)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Check battery level', async () => {
    const scooter = {
        id: 1,
        createdAt: "2023-12-04T10:11:12.000Z",
        updatedAt: "2023-12-05T10:11:12.000Z",
        positionX: 59.334591,
        positionY: 18.063240,
        battery: 0.51,
        maxSpeed: 20,
        charging: false,
        available: true,
        decomissioned: false,
        beingServiced: false,
        disabled: false,
        connected: false
    }


    const fakeBattery = FakeData.fakeBatteryLevel()
    const result = await ScooterUtils.batteryWarning(scooter)

    expect(result.batteryLevel).toEqual(fakeBattery)
})

test('Check that scooter warns when battery is low', async () => {
    const scooter = {
        id: 1,
        createdAt: "2023-12-04T10:11:12.000Z",
        updatedAt: "2023-12-05T10:11:12.000Z",
        positionX: 59.334591,
        positionY: 18.063240,
        battery: 0.51,
        maxSpeed: 20,
        charging: false,
        available: true,
        decomissioned: false,
        beingServiced: false,
        disabled: false,
        connected: false
    }

    const fakeBattery = FakeData.fakeLowBattery()
    const result = await ScooterUtils.batteryWarning(scooter)
    const needsChargingTrue = true

    expect(result.batteryLevel).toEqual(fakeBattery)
    expect(result.needsCharging).toEqual(needsChargingTrue)
})

test('Set scooter in service mode', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOff()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const serviced = true
    const result = await ScooterUtils.setServiced(serviced, scooterId)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Set scooter not in service mode', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOn()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: false,
                    decomissioned: false,
                    beingServiced: true,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const serviced = false
    const result = await ScooterUtils.setServiced(serviced, scooterId)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Change to charging and not available', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOn()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const charge = true
    const result = await ScooterUtils.changeCharging(charge)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Change to not charging and available', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOff()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: true,
                    available: false,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const charge = false
    const result = await ScooterUtils.changeCharging(charge)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Set scooter as decomissoned', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOff()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const decomissioned = true
    const result = await ScooterUtils.setDecomissioned(decomissioned, scooterId)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Set scooter not in decomissioned mode', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    FakeData.fakeLampOn()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: false,
                    decomissioned: true,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const decomissioned = false
    const result = await ScooterUtils.setDecomissioned(decomissioned, scooterId)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information",
    }

    expect(result.success).toEqual(expected.success)
    expect(result.message).toEqual(expected.message)
    expect(fetch.mock.calls.length).toEqual(2)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
})

test('Check available changes to false if decomissioned changes to true', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1

    const partialWSMessage = {
        decomissioned: true
    }

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterUtils.checkStatusChange(scooterId, partialWSMessage)
    const expected = {
        success: true,
        "message": "Successfully updated scooter information",
        available: false
    }

    expect(result).toEqual(expected)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
    expect(fetch.mock.calls.length).toEqual(2)
})

test('Check available changes to true if beingServiced changes to false', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1

    const partialWSMessage = {
        beingServiced: false
    }

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: false,
                    available: false,
                    decomissioned: false,
                    beingServiced: true,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterUtils.checkStatusChange(scooterId, partialWSMessage)
    const expected = {
        success: true,
        "message": "Successfully updated scooter information",
        available: true
    }

    expect(result).toEqual(expected)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
    expect(fetch.mock.calls[1][1].method).toEqual("PUT")
    expect(fetch.mock.calls.length).toEqual(2)
})

test('Check that available does not change with wrong message', async () => {
    const scooterId = 1

    const partialWSMessage = {
        charging: true
    }

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 0.51,
                    maxSpeed: 20,
                    charging: true,
                    available: true,
                    decomissioned: false,
                    beingServiced: false,
                    disabled: false,
                    connected: false
                }
            }, 200
        ))

    const result = await ScooterUtils.checkStatusChange(scooterId, partialWSMessage)
    const expected = {
        success: false
    }

    expect(result).toEqual(expected)
})