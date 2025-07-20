window.Room = {
  create: function () {
    console.log("createRoom!!");
    const hostName = document.getElementById("hoster-name").value.trim();
    if (!hostName) {
      alert("Please enter a host name!");
      return;
    }

    const room_key = Math.random().toString(36).substring(2, 6).toUpperCase();
    getRef(path(KEY_ROOM, room_key))
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

const RoomPage = {
  statusDiv: document.getElementById("game-status"),
  playerBtn: document.getElementById("player-action-btn"),
  winnerBox: document.getElementById("winner"),
  winnerName: document.getElementById("winner-name"),
  resultSpinner: document.getElementById("spinner"),
  startButton: document.getElementById("start-button"),
  attenders: document.getElementById("attenders-list"),

  init: function (room, host, isHost) {
    this.loadAttenders(room, host);
    if (isHost) {
      UI.show(this.startButton);
    }
  },

  createAttenderCard: function (name, role) {
    const card = document.createElement("div");
    card.className = "attender-card";

    if (role === "Host") {
      card.classList.add("host");
    }

    const nameDiv = document.createElement("div");
    nameDiv.className = "attender-name";
    nameDiv.textContent = name;

    const badgeDiv = document.createElement("div");
    badgeDiv.className = "attender-badge";
    badgeDiv.textContent = role;

    card.appendChild(nameDiv);
    card.appendChild(badgeDiv);

    return card;
  },

  loadAttenders: function (room, host) {
    const playerCards = {}; // key: player, value: card element
    const attenderUI = this.attenders;
    attenderUI.textContent = "loading...";

    listenData_child(path(KEY_ROOM, room, KEY_PLAYER), (type, snapshot) => {
      const playerName = snapshot.key;
      if (type == EVENT_ADD) {
        if (Object.keys(playerCards).length === 0) {
          attenderUI.textContent = "";

          const card = this.createAttenderCard(host, "Host");
          playerCards[host] = card;
          attenderUI.appendChild(card);
        }
        if (!playerCards[playerName]) {
          const card = this.createAttenderCard(playerName, "Player");
          playerCards[playerName] = card;
          attenderUI.appendChild(card);
        }
      } else if (EVENT_REMOVE) {
        const card = playerCards[playerName];
        attenderUI.removeChild(playerCards[playerName]);
        delete playerCards[playerName];
      }
    });
  },

  startGame: function () {
    remove(path(KEY_ROOM, room, KEY_RESULT));
    const startTimestamp = Date.now() + 3000;
    getRef(path(KEY_ROOM, room, KEY_START))
      .set(startTimestamp)
      .catch((e) => alert("Set error: " + e));
    UI.hide(this.startButton);
  },

  startCounting: function (startTime) {
    UI.hide(this.winnerBox);

    this.statusDiv.textContent = 3;
    UI.show(this.statusDiv);

    this.playerBtn.disabled = true;
    UI.show(this.playerBtn);

    setTimeout(() => {
      const interval = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.ceil((startTime - now) / 1000);
        if (secondsLeft > 0) {
          this.statusDiv.textContent = secondsLeft;
        } else {
          clearInterval(interval);
          getRef(path(KEY_ROOM, room, KEY_START)).set(-1);
          this.statusDiv.textContent = "GO!";
          this.playerBtn.disabled = false;
        }
      }, 100);
    }, 100); /* ... */
  },

  savePlayerTime: function (player) {
    getRef(path(KEY_ROOM, room, KEY_RESULT)).transaction((current) => {
      if (current === null) {
        return { name: player, time: Date.now() };
      }
      return; // If already set, do nothing
    });
  },

  waitResult: function () {
    UI.show(this.resultSpinner);
    UI.hide(this.statusDiv);
    UI.hide(this.playerBtn);

    // Keep spinner for 3 seconds, then show winner/result
    setTimeout(() => {
      RoomPage.showWinner(room, isHost);
    }, 1000);
  },

  showWinner: function (room, isHost) {
    getData(path(KEY_ROOM, room, KEY_RESULT)).then((snapshot) => {
      const winner = snapshot.val().name;
      UI.hide(this.resultSpinner);
      this.winnerName.textContent = snapshot.val().name;
      UI.show(this.winnerBox);
      if (isHost) {
        UI.show(this.startButton);
      }
    });
  },
};

const UI = {
  show: function (item) {
    item.style.display = "block";
  },

  hide: function (item) {
    item.style.display = "none";
  },
};
