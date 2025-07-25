const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

setGlobalOptions({maxInstances: 10});

// Utility function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.onPlayerStatusChange = functions.database
    .ref("/rooms/{roomId}/players/{playerId}")
    .onUpdate(async (change, context) => {
      const before = change.before.val();
      const after = change.after.val();
      const {roomId, playerId} = context.params;
      const db = admin.database();

      if (before === true && after === false) {
        await delay(1500);
        const playerPath = `/rooms/${roomId}/players/${playerId}`;
        const snapshot = await db.ref(playerPath).once("value");

        if (snapshot.exists() && snapshot.val() === false) {
          await db.ref(playerPath).remove();
          console.log(`Player ${playerId} is removed.`);
        }

        // After removing player, check if players becomes empty
        const players = await db.ref(`/rooms/${roomId}/players`).once("value");

        if (!players.exists() || players.numChildren() === 0) {
        // Delete the entire room if no players left
          await db.ref(`/rooms/${roomId}`).remove();
          console.log(`Room ${roomId} is removed as no players remain.`);
        }
      }
      return null;
    });
