/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions, database } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

const admin = require("firebase-admin");
admin.initializeApp();

exports.onPlayerStatusChange = database
  .ref("/rooms/{roomId}/players/{playerId}")
  .onUpdate(async (change, context) => {
    const before = change.before.val();
    const after = change.after.val();

    if (before === true && after === false) {
      // delay 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // check player status
      const snapshot = await admin
        .database()
        .ref(`/rooms/${context.params.roomId}/players/${context.params.playerId}`)
        .once("value");

      if (snapshot.exists() && snapshot.val() === false) {
        // if still false, remove it
        await admin
          .database()
          .ref(`/rooms/${context.params.roomId}/players/${context.params.playerId}`)
          .remove();
        console.log(`Player ${context.params.playerId} is removed.`);
      }
    }
    return null;
  });
