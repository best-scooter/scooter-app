require('jest-fetch-mock').enableMocks();
import ScooterApi from "../model/scooterApi";

beforeEach(() => {
    fetchMock.resetMocks()
    jest.resetModules()
})

test('Successfully GET information about a single scooter', async () => {
    const scooterId = 1
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION

    fetch.mockResponseOnce(JSON.stringify(
        {
            data: [
                {
                    id: 1,
                    createdAt: "2023-12-04T10:11:12.000Z",
                    updatedAt: "2023-12-05T10:11:12.000Z",
                    positionX: 59.334591,
                    positionY: 18.063240,
                    battery: 50,
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

    const result = await ScooterApi.read(scooterId)

    expect(result.id).toBe(1)
    expect(result.createdAt).toBe("2023-12-04T10:11:12.000Z")
    expect(result.updatedAt).toBe("2023-12-05T10:11:12.000Z")
    expect(result.positionX).toBe(59.334591)
    expect(result.positionY).toBe(18.063240)
    expect(result.battery).toBe(50)
    expect(result.maxSpeed).toBe(20)
    expect(result.charging).toBe(false)
    expect(result.available).toBe(true)
    expect(result.decomissioned).toBe(false)
    expect(result.beingServiced).toBe(false)
    expect(result.disabled).toBe(false)
    expect(result.connected).toBe(false)

    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)

})

test('Fail to GET information about a single scooter. Wrong identity.', async () => {
    const scooterId = 100000
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION

    fetch.mockResponseOnce(undefined, { status: 404 })

    const result = await ScooterApi.read(scooterId)

    expect(result).toBe(undefined)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)

})

test('Successfully PUT (update) information about a single scooter', async () => {
    const scooterId = 1
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooter = {
        id: 1,
        createdAt: "2023-12-04T10:11:12.000Z",
        updatedAt: "2023-12-05T10:11:12.000Z",
        positionX: 59.334591,
        positionY: 18.063240,
        battery: 50,
        maxSpeed: 20,
        charging: false,
        available: true,
        decomissioned: false,
        beingServiced: false,
        disabled: false,
        connected: false
    }

    fetch.mockResponseOnce(undefined, { status: 204 })

    const result = await ScooterApi.update(scooter)
    const expected = {
        "success": true,
        "message": "Successfully updated scooter information"
    }

    expect(result.success).toBe(expected.success)
    expect(result.message).toBe(expected.message)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Fail to PUT (update) information about a single scooter. Wrong identity.', async () => {
    const scooterId = 100000
    const backendServer = process.env.BACKEND
    const version = process.env.VERSION
    const scooter = {
        id: 100000,
        createdAt: "2023-12-04T10:11:12.000Z",
        updatedAt: "2023-12-05T10:11:12.000Z",
        positionX: 59.334591,
        positionY: 18.063240,
        battery: 50,
        maxSpeed: 20,
        charging: false,
        available: true,
        decomissioned: false,
        beingServiced: false,
        disabled: false,
        connected: false
    }

    fetch.mockResponseOnce(undefined, { status: 404 })

    const result = await ScooterApi.update(scooter)
    const expected = {
        "success": false,
        "message": "Failed to update scooter information"
    }

    expect(result.success).toBe(expected.success)
    expect(result.message).toBe(expected.message)
    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual(backendServer + version + "/scooter/" + scooterId)
})

test('Successfully get environment variable as string', () => {
    const backendServer = "BACKEND"

    const result = ScooterApi.getEnvVariable(backendServer)
    const expected = process.env.BACKEND

    expect(result).toEqual(expected)
})

test('Fail get environment variable as string', () => {
    const test = "TEST"

    function envError() {
        ScooterApi.getEnvVariable(test)
    }

    expect(envError).toThrow(new Error("Missing " + test + " environment variable."))
})
