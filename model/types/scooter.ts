type Scooter = {
    id: number;
    position_x: number;
    position_y: number;
    battery: number;
    max_speed: number;
    charging: boolean;
    connected: boolean;
    password?: string;
    available: boolean;
    decomission: boolean;
    being_serviced: boolean;
    on: boolean;
}

export default Scooter; 