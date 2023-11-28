import { io } from 'socket.io-client'

// Varje scooter kommer vara en egen container. När programmet startas och cykelns container skapas (görs i HardwareBridge):
// Kolla om filen 'scooterId.txt' finns och innehåller ett id. Då finns cykeln.
// Om inte:  Cykeln försöker göra en post och lägga till sig själv. Post behöver returnera scooterId. Skapa filen 'scooterId.txt' med id.

// ----------------------------------------------------------------------------------------------------

// Backend URL should be set via environment variables
// You can have a default if you know where it will be hosted
// or that is localhost

// But if you set it as part of environment variables then you
// can set it via the dockerfile at a later date 

// (Docker can do magic networking stuff where a docker-compose will
// give the right ip)

// token ?

// socket ?
// Need to subscribe to the socket server
// Different flows that you'll probably need to handle:
// - Update Location
// - Enter maintanence mode
// - Unlock
// Open Questions:
// - Will the events have different types?
// - What data will the app recieve?
