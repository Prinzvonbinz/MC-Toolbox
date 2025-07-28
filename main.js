// Module Navigation
const navButtons = document.querySelectorAll("nav .nav-btn");
const modules = document.querySelectorAll("main .module");
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.module;
    modules.forEach(m => {
      m.classList.toggle("active", m.id === target);
    });
  });
});

// === 6. News & Updates Feed ===
// Wir verwenden eine Beispiel-RSS-Feed-Quelle als JSON via https://api.rss2json.com/v1/api.json?rss_url=<RSS_URL>
// Da wegen CORS direktes RSS schwierig ist, wir verwenden Minecraft.net News Feed über einen Proxy
const newsListEl = document.getElementById("news-list");

async function loadNews() {
  newsListEl.innerHTML = "Lade News...";
  try {
    // Beispiel Feed (Minecraft.net News)
    const rssUrl = "https://www.minecraft.net/de-de/feed";
    // Wir nutzen einen freien RSS2JSON-Proxy, der Cross-Origin erlaubt
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (!data.items) throw new Error("Keine News gefunden");
    newsListEl.innerHTML = "";
    data.items.slice(0, 10).forEach(item => {
      const div = document.createElement("div");
      div.className = "news-item";
      div.innerHTML = `
        <h3><a href="${item.link}" target="_blank" rel="noopener">${item.title}</a></h3>
        <p>${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ""}</p>
        <p>${item.description.replace(/<[^>]*>?/gm, "").substring(0, 150)}...</p>
      `;
      newsListEl.appendChild(div);
    });
  } catch (e) {
    newsListEl.innerHTML = "Fehler beim Laden der News.";
    console.error(e);
  }
}

loadNews();

// === 8. Soundboard ===
const sounds = [
  { name: "Zombieschrei", file: "sounds/zombie_hurt.ogg" },
  { name: "Schritte", file: "sounds/player_step.ogg" },
  { name: "Katzenschnurren", file: "sounds/cat_purr.ogg" },
  { name: "Kuh", file: "sounds/cow.ogg" },
  { name: "Blöcke platzieren", file: "sounds/place_block.ogg" },
  { name: "Explosion", file: "sounds/explosion.ogg" },
];

const soundboardEl = document.getElementById("soundboard-buttons");
sounds.forEach(sound => {
  const btn = document.createElement("button");
  btn.className = "sound-btn";
  btn.textContent = sound.name;
  btn.addEventListener("click", () => {
    const audio = new Audio(sound.file);
    audio.play();
  });
  soundboardEl.appendChild(btn);
});

// === 9. Bauplan-Organizer ===
const bauplanForm = document.getElementById("bauplan-form");
const planTitleInput = document.getElementById("plan-title");
const planContentInput = document.getElementById("plan-content");
const planListEl = document.getElementById("plan-list");

let bauplaene = JSON.parse(localStorage.getItem("bauplaene") || "[]");

function renderBauplaene() {
  planListEl.innerHTML = "";
  bauplaene.forEach((plan, idx) => {
    const li = document.createElement("li");
    li.textContent = plan.title;
    li.title = plan.content;
    li.addEventListener("click", () => {
      alert(`Bauplan: ${plan.title}\n\n${plan.content}`);
    });
    // Löschen-Button
    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.className = "plan-delete";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Bauplan "${plan.title}" löschen?`)) {
        bauplaene.splice(idx, 1);
        localStorage.setItem("bauplaene", JSON.stringify(bauplaene));
        renderBauplaene();
      }
    });
    li.appendChild(delBtn);
    planListEl.appendChild(li);
  });
}

bauplanForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = planTitleInput.value.trim();
  const content = planContentInput.value.trim();
  if (!title || !content) {
    alert("Bitte Titel und Inhalt eingeben!");
    return;
  }
  bauplaene.push({ title, content });
  localStorage.setItem("bauplaene", JSON.stringify(bauplaene));
  planTitleInput.value = "";
  planContentInput.value = "";
  renderBauplaene();
});

renderBauplaene();

// === 10. Multiplayer Server-Finder ===
const serverListEl = document.getElementById("server-list");
const serverSearchInput = document.getElementById("server-search");

// Beispiel-Datenbank
const servers = [
  {
    name: "Mineplex",
    ip: "us.mineplex.com",
    type: "Minigames",
    players: "1000+",
  },
  {
    name: "Hypixel",
    ip: "mc.hypixel.net",
    type: "Minigames/Survival",
    players: "50000+",
  },
  {
    name: "CubeCraft",
    ip: "play.cubecraft.net",
    type: "Minigames",
    players: "10000+",
  },
  {
    name: "TheArchon",
    ip: "pvp.thearchon.net",
    type: "PvP",
    players: "2000+",
  },
  {
    name: "Wynncraft",
    ip: "play.wynncraft.com",
    type: "MMORPG",
    players: "5000+",
  },
];

function renderServers(filter = "") {
  const search = filter.toLowerCase();
  serverListEl.innerHTML = "";
  const filtered = servers.filter(
    (s) =>
      s.name.toLowerCase().includes(search) ||
      s.ip.toLowerCase().includes(search) ||
      s.type.toLowerCase().includes(search)
  );
  if (filtered.length === 0) {
    serverListEl.innerHTML = "<li>Keine Server gefunden.</li>";
    return;
  }
  filtered.forEach((server) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="server-name">${server.name}</div>
      <div class="server-ip">IP: <a href="minecraft://${server.ip}" target="_blank">${server.ip}</a></div>
      <div class="server-type">Typ: ${server.type} | Spieler: ${server.players}</div>
    `;
    serverListEl.appendChild(li);
  });
}

serverSearchInput.addEventListener("input", () => {
  renderServers(serverSearchInput.value);
});

renderServers();
