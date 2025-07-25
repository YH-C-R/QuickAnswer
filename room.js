ROLE_HOST = "host";
ROLE_PLAYER = "player";

const RoomPage = {
  room: null, // 新增
  host: null,
  player: null,
  statusDiv: document.getElementById("game-status"),
  playerBtn: document.getElementById("player-action-btn"),
  winnerBox: document.getElementById("winner"),
  winnerName: document.getElementById("winner-name"),
  resultSpinner: document.getElementById("spinner"),
  startButton: document.getElementById("start-button"),
  attenders: document.getElementById("attenders-list"),

  init: function (room, host, player) {
    this.room = room;
    this.host = host;
    this.player = player;
    this.loadAttenders(room, host);
    if (host === player) {
      UI.show(this.startButton);
    }

    listenData(path(KEY_ROOM, room, KEY_START), (snapshot) => {
      if (!snapshot.val()) {
        console.log("not really start");
        return;
      }
      const startAt = snapshot.val();
      if (startAt > 0) {
        this.startCounting(startAt);
      }
    });
  },

  createAttenderCard: function (name, role) {
    const card = document.createElement("div");
    card.className = "attender-card";

    if (role === ROLE_HOST) {
      card.classList.add(ROLE_HOST);
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

    const card = this.createAttenderCard(host, ROLE_HOST);
    playerCards[host] = card;
    attenderUI.appendChild(card);

    listenData_child(path(KEY_ROOM, room, KEY_PLAYER), (type, snapshot) => {
      if (!snapshot.exists()) {
        console.log("fail to get player");
        return;
      }
      const playerName = snapshot.key;
      if (type == EVENT_ADD) {
        if (!playerCards[playerName]) {
          const card = this.createAttenderCard(playerName, ROLE_PLAYER);
          playerCards[playerName] = card;
          attenderUI.appendChild(card);
        }
      } else if (type == EVENT_REMOVE) {
        if (playerName === this.host) {
          this.close();
        } else {
          const card = playerCards[playerName];
          attenderUI.removeChild(playerCards[playerName]);
          delete playerCards[playerName];
        }
      }
    });
  },

  playerMonitor: function () {
    const player_ref = getRef(path(KEY_ROOM, this.room, KEY_PLAYER, this.player));
    player_ref.set(true);
    player_ref.onDisconnect().set(false);
  },

  startGame: function () {
    Game.start(this.room);
    UI.hide(this.startButton);
  },

  startCounting: function (startTime) {
    UI.hide(this.winnerBox);

    const statusUI = this.statusDiv;
    UI.setText(statusUI, 3);
    UI.show(statusUI);

    const playerPressBtn = this.playerBtn;
    UI.disable(playerPressBtn);
    UI.show(playerPressBtn);

    setTimeout(() => {
      const interval = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.ceil((startTime - now) / 1000);
        if (secondsLeft > 0) {
          UI.setText(statusUI, secondsLeft);
        } else {
          clearInterval(interval);
          getRef(path(KEY_ROOM, room, KEY_START)).set(-1);
          UI.setText(statusUI, "GO!");
          UI.enable(playerPressBtn);
        }
      }, 100);
    }, 100); /* ... */
  },

  waitResult: function () {
    UI.show(this.resultSpinner);
    UI.hide(this.statusDiv);
    UI.hide(this.playerBtn);

    // Keep spinner for 1 seconds, then show winner/result
    setTimeout(() => {
      RoomPage.showWinner(this.room).then(() => {
        if (this.player === this.host) {
          UI.show(this.startButton);
        }
      });
    }, 1000);
  },

  showWinner: function (room) {
    return getData(path(KEY_ROOM, room, KEY_RESULT)).then((snapshot) => {
      if (!snapshot.val()) {
        console.log("fail to get result");
        return;
      }
      const winner = snapshot.val().name;
      UI.hide(this.resultSpinner);
      UI.setText(this.winnerName, winner);
      UI.show(this.winnerBox);
    });
  },

  close: function () {
    releaseListeners();
    setTimeout(() => {
      alert("Room is closed!");
      window.location.href = `index.html`;
    }, 1000);
  },
};
