Installing graph-cli

`npm install -g @graphprotocol/graph-cli`

`graph auth --product hosted-service <Golfcraft access-token>`

Dashboard: https://thegraph.com/hosted-service/

Golfcraft (hosted service): https://thegraph.com/hosted-service/subgraph/golfcraft/golfcraft

Will stop working on Q1 2023, migration required: https://thegraph.com/blog/how-to-migrate-ethereum-subgraph

On `subgraph/golfcraft` folder

Codegen: `graph codegen`

Build: `graph build`

Deploy: `graph deploy --product hosted-service golfcraft/golfcraft`