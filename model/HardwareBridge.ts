const fs = require('fs')
// Här kan vi fejka hur hårdvaran kommer agera
// gps-mappen bör vara en volym till docker-containern så att den kan uppdateras. läses som en text-fil

export default {
    // Funktion: Kolla om filen 'scooterId.txt' finns och innehåller ett id. Då finns cykeln.
    // Om inte:  Cykeln försöker göra en post och lägga till sig själv. Post behöver returnera scooterId. Skapa filen 'scooterId.txt' med id.

    saveScooterId: function(scooterId?: number): number {
        return -1
    },

    readScooterId: function(): number {
        const scooterId = fs.readFile("../scooterId.txt")
        return Number(scooterId)
    },

    createStartPositionX: function(): number {
        return -1
    },

    createStartPositionY: function(): number {
        return -1
    },

    updatePosition: function(): number {
        return -1
    }
}