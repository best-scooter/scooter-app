type WSMessage = {
    message: string,
    scooterId: number,
    positionX?: number,
    positionY?: number,
    battery?: number,
    charging?: boolean,
    available?: boolean,
    decomissioned?: boolean,
    beingServiced?: boolean,
    disabled?: boolean,
    currentSpeed?: number,
    customerId?: number,
    tripId?: number,
    timeStarted?: string,
    timeEnded?: string,
    distance?: number,
    route?: [number, number][]
}

export default WSMessage;