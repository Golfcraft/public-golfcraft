export default {
    "LobbyWelcome": {
        "PlayOnce": true,
        "AutoPlay": true,
        "Dialogue": [{"Text": "Welcome to Golfcraft!"}]
    },
    "LobbyFirstCoin": {
        "PlayOnce": true,
        "AutoPlay": true,

        "IfValueHigher": {"GoldCoins": 0},

        "Dialogue": [{"Text": "You have received a coin! That's a great start!"}]
    },
    "Lobby20Coins": {
        "PlayOnce": true,
        "AutoPlay": true,
        "Priority": true,
        "SuperPriority": true,

        "IfValueHigher": {"GoldCoins": 20},
        "RequiredTextLines": ["LobbyFirstCoin"],
        "RequiredTextLinesThisRun": [],
        "RequiredFalseTextLines": [],
        "RequiredAnyEncountersThisRun": [],

        "Dialogue": [{"Text": "Looks like you have enough coins to play competition on the 1rst floor!"}]
    }
}