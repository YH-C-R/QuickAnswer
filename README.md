# QuickAnswer

## Overview
QuickAnswer is a real-time multiplayer reaction game using Firebase Realtime Database and Cloud Functions to manage rooms and player states automatically. 
It is designed for synchronous online competitions and quick group challenges.

## How to Play
1. Go to: https://quickanswer-48ac4.web.app/
2. Enter a room code and your player name (or join an assigned room).
3. The host creates a room. Other players join using the same room code.
4. Once the game starts, everyone waits for the "Press" button to be enabled.
5. The first player to press the button wins the round. The winner’s name will be displayed on all players’ screens.
6. If a player disconnects or leaves, the system automatically removes them from the room and updates the interface in real time.

## Tech Features
* Real-time room and player list synchronization using Firebase Realtime Database.
* Cloud Functions backend automatically manages player join/leave and winner logic.
* Instant client UI updates when a player wins a round or the room status changes.
