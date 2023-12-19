# Scooter-app

Program som är tänkt att att köras i varje simulerad cykel och styra/övervaka den.

## Scripts

### npm test

Kör alla enhetstester.

### npm run lint

Kör lintern.

## Index

Består av en websocket-klient för att ta emot meddelanden.

## Controller

### Cykelns funktioner

#### scooterUtils

Hanterar inkommande kommandon gällande exempelvis att hyra/lämna tillbaka cykeln, uppdatera cykelns log, skicka API request och så vidare. Beroende på vilka inkommande websocket-meddelanden som cykeln tar emot.

## Model

### Hardware

Hårdvaran så som cykelns batteri, gps, lampa och hastighetsmätare representeras av filer där alla cyklars värden kommer att finnas.
Filerna kommer ha följande struktur:

#### battery

```
{
    1: 0.5,
    2: 0.8,
    ...
}
```

Där varje key representeras av varje cykels individuella id-nummer. Batterinivån representeras av ett värde mellan 0-1 (motsvarar 0-100%).

#### gps

```
{
    1: { x: 59.334591, y: 18.063240 },
    2: { x: 57.708870, y: 11.974560 },
    ...
}
```

Positionen representeras av en array med följande format: [latitud, longitud]

#### redLight

```
{
    1: "off",
    2: "on",
    ...
}
```

Huruvida den röda lampan är på eller av representeras i string-format.

#### speedometer

```
{
    1: 10,
    2: 5,
    ...
}
```

Hastigheten representeras av ett värde mellan 0-20, då cyklarnas högsta tillåtna hastighet kommer vara 20 km/h.

#### Hårdvarudata

Cykelns program kommer endast att läsa av datan i filerna via hardwareBridge. Ett annat simuleringsprogram (mock-service) kommer att bestämma värdena och skriva till filerna. I simuleringen kommer hardware-mappen läsas in som en volym, för att möjliggöra att både cykelns program och simuleringsprogrammet kommer åt dem.

#### scooterAPI

Finns stöd för att göra GET request för en enskild cykel och PUT för en enskild cykel.
