# Shed
Shed (Shithead) is a card game that is played with a standard 52 card deck. The game is played with 3 or more players and the objective is to get rid of all your cards. The last player with cards in their hand is the loser.

# Rules
From a shuffled deck of cards, the dealer gives each player nine cards: three downcards in a row, three upcards on top of the downcards, and three hand cards.[1] The upcards can only be played once the hand cards have been exhausted, and the downcards can only be played once the upcards have been played

After the deal and before play begins, players may switch their hand cards with those face up on the table in order to produce a strong set of upcards (ideally high cards, 2s or 10s) for later in the game.

Eldest hand is the first player dealt a 3 as an upcard. If no player has 3 face up, then the first player to declare a 3 in hand starts. If no-one has a 3, then the game is started by the person dealt a 4, etc. Eldest leads off by playing a card or set of cards face up in the middle of the table to start a common wastepile. In turn and in clockwise order, players play a card or set that is equal to or higher in rank than the top card of the wastepile. If unable or unwilling to do so, they must pick up the wastepile and add it to their hand cards.[1][2]

Each player must have at least three cards in hand at all times; a player who has fewer than three after playing to the wastepile draws cards from the stock, if possible, to make the hand up to three again.
Special cards and quartets

Deuces (2s), tens and four-of-a-kind quartets have special roles:
- Deuces. A deuce may be played on any card and any card may follow a deuce.
- Tens. A ten may be played on any turn, regardless of the top card on the wastepile or even if there is no wastepile card. When a ten is played, the wastepile is removed from play and set aside for the remainder of the game. The same player then plays any card or set to begin a new wastepile.
- Quartets. A quartet is a set of four cards of equal rank e.g. 5♦ 5♣ 5♥ 5♠ or 8♥ 8♦ 8♠ 8♣. If a player is able to play a quartet, the wastepile is set aside as if a ten had been played.[3] In addition, the last player to complete a quartet on the top of the wastepile by playing its fourth card also removes the wastepile. Either way, the same player may then play another card or set.

A player who has no more cards in hand when the stock is empty must play from their upcards. If unable or unwilling to play an upcard, the player must pick up the wastepile. Once all of the upcards have been played, a player must then play downcards. These are played unseen one at a time and if the chosen card is lower than the previous card played, the wastepile must be picked up and, on subsequent turns, the player must play their hand cards before playing any more downcards.[a]

A player who has no cards left drops out. The last player left with cards is the loser and deals in the next game.
# Installation
(Once you have cloned the repository)

```bash
npm install
```
```bash
composer install
```
```bash
cp .env.example .env
```
```bash
php artisan migrate --seed
```
```bash
php artisan key:generate
```
```bash
composer run dev
```
