// ========== CONSTANTS ========== //
const KEY_ROOM = "rooms";
const KEY_PLAYER = "players";
const KEY_HOST = "host";
const KEY_START = "start";
const KEY_RESULT = "result";

const READ = 1;
const WRITE = 2;

const EVENT_ADD = "add";
const EVENT_REMOVE = "remove";
const EVENT_CHANGE = "change";

// ========== UTILITY FUNCTIONS ========== //

const listenList = [];

// set/update/remove data
function getRef(path) {
  return firebase.database().ref(path);
}

// get data info
function getData(path) {
  return getRef(path).once("value");
}

// listen data's child event
function listenData_child(path, callback) {
  const ref = getRef(path);
  ref.on("child_added", (snapshot) => {
    callback(EVENT_ADD, snapshot);
  });

  ref.on("child_removed", (snapshot) => {
    console.log("child_removed triggered:", snapshot.key, snapshot.val());
    callback(EVENT_REMOVE, snapshot);
  });
  listenList.push(ref);
}

// listen data's change
function listenData(path, callback) {
  const ref = getRef(path);
  ref.on("value", (snapshot) => {
    callback(snapshot);
  });
  listenList.push(ref);
}

function path(...pathParts) {
  return pathParts.join("/");
}

function remove(path) {
  getRef(path).remove();
}

function releaseListeners() {
  listenList.forEach((ref) => ref.off());
  listenList.length = 0; // clear list
}
