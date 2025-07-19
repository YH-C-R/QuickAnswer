function createRoom() {
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
}

function joinRoom() {
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
}

function createAttenderCard(name, role) {
  const card = document.createElement("div");
  card.className = "attender-card";

  if (role === "Host") {
    card.classList.add("host"); // This line is crucial!
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
}

function loadAttenders(room, host) {
  listenData_child(path(KEY_ROOM, room, KEY_PLAYER), (type, snapshot) => {
    const playerName = snapshot.key;
    if (type == EVENT_ADD) {
      if (Object.keys(playerCards).length === 0) {
        attendersList.textContent = "";

        const card = createAttenderCard(host, "Host");
        playerCards[host] = card;
        attendersList.appendChild(card);
      }
      if (!playerCards[playerName]) {
        const card = createAttenderCard(playerName, "Player");
        playerCards[playerName] = card;
        attendersList.appendChild(card);
      }
    } else if (EVENT_REMOVE) {
      const card = playerCards[playerName];
      attendersList.removeChild(playerCards[playerName]);
      delete playerCards[playerName];
    }
  });
}

function startGame() {
  remove(path(KEY_ROOM, room, KEY_RESULT));
  const startTimestamp = Date.now() + 3000; // 3 秒後 GO!
  getRef(path(KEY_ROOM, room, KEY_START))
    .set(startTimestamp)
    .catch((e) => alert("Set error: " + e));
  document.getElementById("start-button").style.display = "none";
}

function startCounting(startTime, endcallback) {
  document.getElementById("winner").style.display = "none";
  statusDiv.textContent = 3;
  statusDiv.style.display = "block";
  pressBtn.disabled = true;
  pressBtn.style.display = "block";
  setTimeout(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.ceil((startTime - now) / 1000);
      if (secondsLeft > 0) {
        statusDiv.textContent = secondsLeft;
        pressBtn.disabled = true; // 按鈕先保持 disable
      } else {
        clearInterval(interval);
        getRef(path(KEY_ROOM, room, KEY_START)).set(-1);
        endcallback();
      }
    }, 100);
  }, 100);
}

function recordPlayer(player) {
  getRef(path(KEY_ROOM, room, KEY_RESULT)).transaction((current) => {
    if (current === null) {
      return { name: player, time: Date.now() };
    }
    return; // If already set, do nothing
  });
}
