// behöver fejk hastighet, position, batteri

export default {
    fakeBatteryLevel: function (): number {
        const max = 100
        const batteryLevel = Math.random() * max

        return batteryLevel
    },

    createStartPositionX: function (): number {
        return -1
    }, // test

    createStartPositionY: function (): number {
        return -1
    }, // test

    updatePosition: function (): number {
        return -1
    },
}