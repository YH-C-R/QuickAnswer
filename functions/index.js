const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

setGlobalOptions({maxInstances: 10});

exports.onPlayerStatusChange = functions.database
    .ref("/rooms/{roomId}/players/{playerId}")
    .onUpdate(async (change, context) => {
      const before = change.before.val();
      const after = change.after.val();
      const roomId = context.params.roomId;
      const playerId = context.params.playerId;

      if (before === true && after === false) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const refpath = `/rooms/${roomId}/players/${playerId}`;
        const snapshot = await admin.database().ref(refpath).once("value");

        if (snapshot.exists() && snapshot.val() === false) {
          await admin.database().ref(refpath).remove();
          console.log(`Player ${playerId} is removed.`);
        }
      }
      return null;
    });
