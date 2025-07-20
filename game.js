window.Room = {
  create: async function () {
    console.log("createRoom!!");
    const hostName = document.getElementById("hoster-name").value.trim();
    if (!hostName) {
      alert("Please enter a host name!");
      return;
    }

    // create unique room key
    let room_path = "";
    let snapshot, room_key;
    for (let tryTimes = 0; tryTimes < 10; tryTimes++) {
      room_key = Math.random().toString(36).substring(2, 6).toUpperCase();
      snapshot = await getData(path(KEY_ROOM, room_key));
      if (!snapshot.exists()) {
        room_path = path(KEY_ROOM, room_key);
        break;
      }
    }

    if (room_path === "") {
      alert("Fail to generate room key");
      return;
    }

    getRef(room_path)
      .set({
        host: hostName,
        createdAt: Date.now(),
        start: false,
      })
      .then(() => {
        console.log("Room created successfully");
        getRef(path(KEY_ROOM, room_key, KEY_PLAYER, hostName)).set(true);
        setTimeout(() => {
          window.location.href = `room.html?room=${room_key}&host=${hostName}&player=${hostName}`;
        }, 300);
      })
      .catch((error) => {
        alert("Fail to create room! " + error);
      });
  },

  join: function () {
    const room_key = document.getElementById("join-room").value.toUpperCase();
    const name = document.getElementById("player-name").value;
    if (!room_key || !name) return alert("Enter both room code and name");

    getData(path(KEY_ROOM, room_key, KEY_PLAYER, name)).then((snapshot) => {
      if (snapshot.exists()) {
        alert("That name is already taken in this room!");
        // Just return, DO NOT proceed
        return;
      }
      getData(path(KEY_ROOM, room_key, KEY_HOST))
        .then((snapshot) => {
          if (!snapshot.exists()) {
            alert("Room does not exist!");
            return;
          }

          const hostName = snapshot.val();
          getRef(path(KEY_ROOM, room_key, KEY_PLAYER, name)).set(true);
          setTimeout(() => {
            window.location.href = `room.html?room=${room_key}&host=${hostName}&player=${name}`;
          }, 300);
        })
        .catch((error) => {
          alert("cannot access host room. error:" + error);
        });
    });
  },
};

const Game = {
  start: function (room) {
    remove(path(KEY_ROOM, room, KEY_RESULT));
    const startTimestamp = Date.now() + 3000;
    getRef(path(KEY_ROOM, room, KEY_START))
      .set(startTimestamp)
      .catch((e) => alert("Set error: " + e));
  },

  savePlayerTime: function (player) {
    getRef(path(KEY_ROOM, room, KEY_RESULT)).transaction((current) => {
      if (current === null) {
        return { name: player, time: Date.now() };
      }
      return; // If already set, do nothing
    });
  },
};
