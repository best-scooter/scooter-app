import HardwareBridge from "../model/HardwareBridge";
import FakeData from "./fakeData";
const fs = require('fs')

const basePath = "model/hardware/"
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
    const result = HardwareBridge.checkPosition()

    expect(result).toEqual(fakeStartPosition)
})

test('Check that the current position updates', () => {
    const fakeStartPosition = FakeData.createFakeStartPosition()
    const resultStartPosition = HardwareBridge.checkPosition()

    const fakeUpdatedPosition = FakeData.updateFakePosition()
    const resultUpdatedPosition = HardwareBridge.checkPosition()

    expect(fakeStartPosition).toEqual(resultStartPosition)
    expect(fakeUpdatedPosition).toEqual(resultUpdatedPosition)
    expect(resultStartPosition).not.toEqual(resultUpdatedPosition)
})

test('Check battery level', () => {
    const fakeBatteryLevel = FakeData.fakeBatteryLevel()
    const resultBattery = HardwareBridge.checkBattery()

    expect(fakeBatteryLevel).toEqual(resultBattery)
})

test('Cheeck speed', () => {
    const fakeSpeed = FakeData.fakeSpeed()
    const resultSpeed = HardwareBridge.checkSpeedometer()

    expect(fakeSpeed).toEqual(resultSpeed)
})

test('Lamp on', () => {
    HardwareBridge.lampOn()
    const lamp = fs.readFileSync(basePath + "/redLight", readFileFlag)

    expect(lamp).toEqual("on")
})

test('Lamp off', () => {
    HardwareBridge.lampOff()
    const lamp = fs.readFileSync(basePath + "/redLight", readFileFlag)

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