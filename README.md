# Memory Game JS

It is an online memory game with three difficulty levels: easy, medium and hard. The game includes a ranking scheme with the top 20 players on each level, where players can enter their names into the ranking at the end of the game.

The ranking is calculated based on the time, the amount of times the cards are flipped, and a bonus card that if found, adds 3 points to the player's final score.

The game also includes a cheat, where if the player correctly enters a Harry Potter spell, the cards are revealed, making the game much easier.

![Screenshot from 2023-01-15 23-15-46](https://user-images.githubusercontent.com/12699849/212585326-9a1e3749-af17-4734-83f7-51c07e7f79d5.png)

## How to run locally in development mode?

1. Fork the project
2. Create an account on Firebase if you don't have one already
3. Add an anonymous authentication provider in Firebase Authentication
4. Add the following rules in Firebase Realtime Database

```
{
  "rules": {
    "$uid": {
      ".indexOn": "score",
        "$uid": {
          ".indexOn": "score"
        }
    },
    ".read": "auth != null",
    ".write": "auth != null",
  }
}
```

5. Copy the environment variables that Firebase offers in WEB mode
6. Create a file `local.env` in the root of the forked repository
7. Add the environment variables below in `local.env`

```
REACT_APP_FIREBASE_API_KEY=YOUR_KEY_HERE
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_KEY_HERE
REACT_APP_FIREBASE_PROJECT_ID=YOUR_KEY_HERE
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_KEY_HERE
REACT_APP_FIREBASE_MESSAGIN_SENDER_ID=YOUR_KEY_HERE
REACT_APP_FIREBASE_APP_ID=YOUR_KEY_HERE
REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_KEY_HERE
REACT_APP_CARD_PATH_SECRET_KEY=YOUR_SECRET_PATH_KEY // any message here
```

8. Run `yarn` to install the packages
9. Run `yarn start` to start the server locally
