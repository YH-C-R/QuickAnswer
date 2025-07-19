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

// for set/update/remove
function getRef(path) {
  return firebase.database().ref(path);
}

// for data info
function getData(path) {
  return getRef(path).once("value");
}

// for data info
function listenData_child(path, callback) {
  const ref = getRef(path);
  ref.on("child_added", (snapshot) => {
    callback(EVENT_ADD, snapshot);
  });

  ref.on("child_removed", (snapshot) => {
    callback(EVENT_REMOVE, snapshot);
  });
}

// for data info
function listenData(path, callback) {
  const ref = getRef(path);
  ref.on("value", (snapshot) => {
    callback(snapshot);
  });
}

function path(...pathParts) {
  return pathParts.join("/");
}

function remove(path) {
  getRef(path).remove();
}
