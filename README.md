# Scooter-app

Program som är tänkt att att köras i varje simulerad cykel och styra/övervaka den. Detta repo är en del av av ett större system och ingår i organisationen best-scooter: https://github.com/best-scooter
Programmet kan köras individuellt med scriptet 'npm run dev', men inte mycket kommer hända då scooter-app förlitar sig på flera av de andra delsystemen i best-scooter.
För att köra scooter-app så som det är tänk i simulering behövs även database-server, api-server, ws-server, mock-service och docker som också ingår i best-scooter. Varje cykel kan då köras som en individuell container i ett större system.

## Scripts

### npm test

Kör alla enhetstester med code coverage.

### npm run build

Kompilerar Typescript-filer till JavaScript-filer.

### npm run clean

Rensar bort de kompilerade JavaScript-filerna.

### npm run lint

Kör lintern.

### npm run dev

Kör applikationen i development mode.

### npm run docker:build

Kör först scriptet "npm run build" och bygger sedan docker-imagen.

### npm run docker:push

Pushar imagen som en publik image på dockerhub

### npm run docker:build:acr

Kör först scriptet "npm run build" och bygger sedan ACR docker-imagen.

### npm run docker:push:acr

Pushar imagen till ACR

## Filstruktur

## Index

Består av en websocket-klienter för att ta emot och skicka meddelanden med websocket-servern.

## Controller

### Cykelns funktioner

#### scooterUtils

Hanterar inkommande kommandon gällande exempelvis att hyra/lämna tillbaka cykeln, uppdatera cykelns log, skicka API request och så vidare.

## Model

### Hardware

Hårdvaran så som cykelns batteri, gps, lampa och hastighetsmätare representeras av filer där alla cyklars värden kommer att finnas. Varje key representeras av varje cykels individuella id-nummer.
Filerna kommer ha följande struktur:

#### battery

```
{
    1: 0.52,
    2: 0.87,
    ...
}
```

Batterinivån representeras av ett värde mellan 0-1 (motsvarar 0-100%).

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

Finns stöd för att göra GET request för en enskild cykel och PUT för en enskild cykel. Finns även stöd för POST för att få en cykel-token som används vid databas-uppdateringar och för att ansluta till websocket-servern.
