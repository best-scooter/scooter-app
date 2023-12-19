import ScooterUtils from "../controller/scooterUtils";
import fakeData from "./fakeData";
import FakeData from "./fakeData";
const fs = require('fs')
require('jest-fetch-mock').enableMocks();

const path = "scooter-trips.log"
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }
const originalLog = fs.readFileSync(path, readFileFlag)

beforeEach(() => {
    fetchMock.resetMocks()
    jest.resetModules()
    process.env.SCOOTER_ID = 1
})

afterEach(() => {
    fs.writeFileSync(path, originalLog, writeFileFlag)
})

test('Successfully rent a scooter', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 2
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                ]
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterUtils.beginScooterRent(customerId)
    const expected = {
        "rentedScooterId": scooterId,
        "message": "Scooter " + scooterId + " successfully rented",
        "customerId": customerId
    }
    const log = fs.readFileSync(path, readFileFlag)
    const regEx = /^(Journey start: 2 - 59.334591 18.063240 - )?/

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
            data: [
                {
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
            ]
        }, 200
    ))

    const result = await ScooterUtils.beginScooterRent(customerId)
    const expected = {
        "message": "Could not rent scooter"
    }
    const log = fs.readFileSync(path, readFileFlag)
    const regEx = /^(ERROR: Customer 2 attempted to return scooter)?/

    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Successfully return a scooter', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1
    const customerId = 2
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                ]
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterUtils.endScooterRent(customerId)
    const expected = {
        "message": "Scooter " + scooterId + " successfully returned",
        "needsCharging": false,
        "customerId": customerId
    }
    const log = fs.readFileSync(path, readFileFlag)
    const regEx = /^(Journey end: 2 - 59.334591 18.063240 - )?/

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
    const customerId = 2
    FakeData.fakeBatteryLevel51()
    FakeData.fakeStockholmPosition()

    fetch.mockResponseOnce(JSON.stringify(
        {
            data: [
                {
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
            ]
        }, 200
    ))

    const result = await ScooterUtils.endScooterRent(customerId)
    const expected = {
        "message": "Could not return scooter",
    }
    const log = fs.readFileSync(path, readFileFlag)
    const regEx = /^(ERROR: Customer 2 attempted to return scooter)?/

    expect(result.message).toEqual(expected.message)
    expect(log).toMatch(regEx)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Log the start of a journey', () => {
    const start = true
    const customerId = 1
    const position = {
        position_x: 59.334591,
        position_y: 18.063240
    }

    ScooterUtils.updateLog(start, customerId, position)
    const result = fs.readFileSync(path, readFileFlag)
    const regEx = /^(Journey start: 1 - 59.334591 18.063240 - )?/

    expect(result).toMatch(regEx)
})

test('Log the end of a journey', () => {
    const start = false
    const customerId = 1
    const position = {
        position_x: 59.334591,
        position_y: 18.063240
    }

    ScooterUtils.updateLog(start, customerId, position)
    const result = fs.readFileSync(path, readFileFlag)
    const regEx = /^(Journey end: 1 - 59.334591 18.063240 - )?/

    expect(result).toMatch(regEx)
})

test('Log a failed rent/return of scooter', () => {
    const customerId = 1
    ScooterUtils.updateLogFail(customerId)

    const result = fs.readFileSync(path, readFileFlag)
    const regEx = /^(ERROR: Customer 1 attempted to return scooter)?/

    expect(result).toMatch(regEx)
})

test('Update position', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                ]
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
            data: [
                {
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
            ]
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

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                ]
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const off = true
    const result = await ScooterUtils.setDisabledOrNot(off)
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

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                        disabled: true,
                        connected: false
                    }
                ]
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const off = false
    const result = await ScooterUtils.setDisabledOrNot(off)
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
        disabled: true,
        connected: false
    }


    const fakeBattery = FakeData.fakeBatteryLevel()
    const result = await ScooterUtils.checkBattery(scooter)

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
        disabled: true,
        connected: false
    }

    const fakeBattery = FakeData.fakeLowBattery()
    const result = await ScooterUtils.checkBattery(scooter)
    const needsChargingTrue = true

    expect(result.batteryLevel).toEqual(fakeBattery)
    expect(result.needsCharging).toEqual(needsChargingTrue)
})

test('Set scooter in service mode', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                        disabled: true,
                        connected: false
                    }
                ]
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const serviced = true
    const result = await ScooterUtils.servicedOrNot(serviced)
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

test('Change from service mode', async () => {
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooterId = 1

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                        disabled: true,
                        connected: false
                    }
                ]
            }, 200
        ))
        .mockResponseOnce(undefined, { status: 204 })

    const serviced = false
    const result = await ScooterUtils.servicedOrNot(serviced)
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
    fakeData.fakeLampOn()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                        disabled: true,
                        connected: false
                    }
                ]
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
    fakeData.fakeLampOff()

    fetch
        .mockResponseOnce(JSON.stringify(
            {
                data: [
                    {
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
                        beingServiced: true,
                        disabled: true,
                        connected: false
                    }
                ]
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