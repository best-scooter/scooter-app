import HardwareBridge from "../model/hardwareBridge";
import fakeData from "./fakeData";
import FakeData from "./fakeData";
const fs = require('fs')

const basePath = process.env.HARDWARE_PATH
const readFileFlag = { encoding: 'utf8', flag: 'r' }
const writeFileFlag = { encoding: "utf8", flag: "w", mode: 0o666 }

const originalScooterId = process.env.SCOOTER_ID
const originalBattery = fs.readFileSync(basePath + "battery", readFileFlag)
const originalGPS = fs.readFileSync(basePath + "gps", readFileFlag)
const originalSpeed = fs.readFileSync(basePath + "speedometer", readFileFlag)
const originalLamp = fs.readFileSync(basePath + "redLight", readFileFlag)

beforeEach(() => {
    jest.resetModules()
})

afterEach(() => {
    process.env.SCOOTER_ID = originalScooterId
    fs.writeFileSync(basePath + "battery", originalBattery, writeFileFlag)
    fs.writeFileSync(basePath + "gps", originalGPS, writeFileFlag)
    fs.writeFileSync(basePath + "speedometer", originalSpeed, writeFileFlag)
    fs.writeFileSync(basePath + "redLight", originalLamp, writeFileFlag)
})

test('Read Scooter ID', () => {
    process.env.SCOOTER_ID = 10
    const result = HardwareBridge.readScooterId()

    expect(result).toEqual(10)
})

test('Check a startposition', () => {
    const fakeStartPosition = FakeData.createFakeStartPosition()
    const scooterId = 1
    const result = HardwareBridge.checkPosition(scooterId)

    expect(result).toEqual(fakeStartPosition)
})

test('Check that the current position updates', () => {
    const fakeStartPosition = FakeData.createFakeStartPosition()
    const scooterId = 1
    const resultStartPosition = HardwareBridge.checkPosition(scooterId)

    const fakeUpdatedPosition = FakeData.updateFakePosition(scooterId)
    const resultUpdatedPosition = HardwareBridge.checkPosition(scooterId)

    expect(resultStartPosition).toEqual(fakeStartPosition)
    expect(resultUpdatedPosition).toEqual(fakeUpdatedPosition)
    expect(resultStartPosition).not.toEqual(resultUpdatedPosition)
})

test('Check battery level', () => {
    const fakeBatteryLevel = FakeData.fakeBatteryLevel()
    const scooterId = 1
    const resultBattery = HardwareBridge.checkBattery(scooterId)

    expect(resultBattery).toEqual(fakeBatteryLevel)
})

test('Cheeck speed', () => {
    const fakeSpeed = FakeData.fakeSpeed()
    const scooterId = 1
    const resultSpeed = HardwareBridge.checkSpeedometer(scooterId)

    expect(fakeSpeed).toEqual(resultSpeed)
})

test('Lamp on', () => {
    fakeData.fakeLampOff()
    const scooterId = 1
    HardwareBridge.lampOn(scooterId)

    const allLampsString = fs.readFileSync(basePath + "/redLight", readFileFlag)
    const allLamps = JSON.parse(allLampsString)
    const lamp = allLamps[scooterId]

    expect(lamp).toEqual("on")
})

test('Lamp off', () => {
    fakeData.fakeLampOn()
    const scooterId = 1
    HardwareBridge.lampOff(scooterId)

    const allLampsString = fs.readFileSync(basePath + "/redLight", readFileFlag)
    const allLamps = JSON.parse(allLampsString)
    const lamp = allLamps[scooterId]

    expect(lamp).toEqual("off")
})

test('Get date', () => {
    const resultDate = HardwareBridge.getDate()
    const regEx = /[0-9]{2}[-][0-9]{2}[-][0-9]{4}/

    expect(resultDate).toMatch(regEx)
})

test('Get time', () => {
    const resultTime = HardwareBridge.getTime()
    const regEx = /[0-9]{2}[:][0-9]{2}[:][0-9]{2}/

    expect(resultTime).toMatch(regEx)
})

test('Add a zero to number less than 10', () => {
    const number = 9
    const expected = "09"
    const result = HardwareBridge.addZero(number)

    expect(result).toEqual(expected)
})

test('Do not add a zero to number greater or equal to  10', () => {
    const numberEqual = 10
    const numberGreater = 11

    const expectedEqual = "10"
    const expectedGreater = "11"

    const resultEqual = HardwareBridge.addZero(numberEqual)
    const resultGreater = HardwareBridge.addZero(numberGreater)

    expect(resultEqual).toEqual(expectedEqual)
    expect(resultGreater).toEqual(expectedGreater)
})