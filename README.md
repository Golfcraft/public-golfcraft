## Deploy

Test:

`npm run bundle` (not needed anymore)

`npm run build --production`

`dcl deploy --skip-build --target peer-testing.decentraland.org`

`https://decentraland.org/play/?CATALYST=peer-testing.decentraland.org&island=I330&position=47%2C-45&realm=testing`


Prod:

`npm run bundle` (not needed anymore)

`npm run build --production`

`dcl deploy --skip-build`

`https://decentraland.org/play/?position=47%2C-45`


Check consistency accross catalysts:

`npx @dcl/opscli pointer-consistency --pointer "47,-45"`

## Golfcraft contracts

- Golfclubs: 0xF044647aF5d795A9459B7Bc0bD47625D4764a222
- Materials: 0xb50E29A3ccF7c0AB133ea7de46B09D0D8fEAfdF0
- Parts: 0x4820e6424989c22ef7f41b67e7439ab9969fe948
- Doki Set: 0x1AeB7d9536193a3A25C74D462eC2Dc88da9E50DD
- OhMyDeluxe: 0x59D3A36754D961eCA320F1B7281fE9B046B2975F
- GolfLand: 0x0776CD532B1A2c899BE7323951aE4Ca1801edD94
- Egypt: 0x9b44629ad39B417801441040c586b3debdBD1D04
- SoapPunk: 0x85F15eC042d64F3219a058B73AC2E459CB37e393
- GolfHead: 0x26294E873F69a25D6ae2321E9042118ECa689112
- Beta: 0x5c014f91bf867c54ec335c18ba2e27066a83a0e6
- OhMyGolf: 0x909bebffc69bab12c2ce559b74e43b50cdcafd8c