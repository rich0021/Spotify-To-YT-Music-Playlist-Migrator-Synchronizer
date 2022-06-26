let GoogleAuth; // Google Auth object.

let isAuthGoogle = false;
let isAuthSpotify = false;

let gbuttonlog = document.getElementById("gbuttonlog");
let spbuttonlog = document.getElementById("spbuttonlog");

let buttonmigrate = document.getElementById("gbuttonmigrate");

let playlist_name = document.getElementById("playlist_name");

let sp_client_id = document.getElementById("spotify_client_id");
let sp_client_secret = document.getElementById("spotify_client_secret");
let sp_access_token;

let google_oauth_client = document.getElementById("google_oauth_client");

let migrate_data = {
  spotifyMusicData: [],
  ytVideoId: [],
};
let sync_data = {};

let redirect_url = "http://localhost/spyt/";

async function migrate() {
  await sendAuthorizedApiRequest();
  await spotifyListPlaylist();
  await spotifyListPlaylistItems();

  /* await insertPlaylist({
    title: migrate_data.playlist_name,
    desc: migrate_data.playlist_desc,
    status: migrate_data.playlist_status,
  });

  migrate_data.spotifyMusicData.forEach((value) => {
    searchYoutube(`${value.name} ${value.artist}`)
      .then(function (e) {
        insertPlaylistItem(
          migrate_data.yt_playlist_id,
          e.result.items[0].id.videoId
        );
      })
      .catch((e) => console.log(e));
  }); */
}

function spotifyAuth() {
  if (sp_client_id.value.length > 0) {
    let url = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(
      sp_client_id.value
    )}&response_type=token&redirect_uri=${encodeURIComponent(
      redirect_url
    )}&scope=${encodeURIComponent(
      "playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private"
    )}`;
    window.popup = window.open(url, "Spotify Login", "width=800,height=600");
  } else {
    alert("Spotify Client ID Empty");
  }
}

function spotifySetToken(code) {
  sp_access_token = code;
  isAuthSpotify = true;
}

async function spotifyListPlaylist() {
  let response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${sp_access_token}`,
    },
  });

  let data = await response.json();

  data.items.forEach((value) => {
    if (value.name.toLowerCase() == playlist_name.value.toLowerCase()) {
      migrate_data.playlist_name = value.name;
      migrate_data.playlist_desc = value.description;
      migrate_data.playlist_status = value.collaborative ? "public" : "private";
      migrate_data.spotify_playlist_id = value.id;
    }
  });
}

async function spotifyListPlaylistItems() {
  let response = await fetch(
    `https://api.spotify.com/v1/playlists/${migrate_data.spotify_playlist_id}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${sp_access_token}`,
      },
    }
  );

  let data = await response.json();

  console.log(data);

  /* data.items.forEach((value) => {
    migrate_data.spotifyMusicData.push({
      name: value.track.name,
      artist: value.artist[0].name,
    });
  }); */
}

function initClient() {
  return gapi.client
    .init({
      clientId: google_oauth_client.value,
      scope:
        "https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl",
      plugin_name: "streamy",
    })
    .then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();
      GoogleAuth.signIn()
        .then(() => {
          isAuthGoogle = true;
          console.log(GoogleAuth);
        })
        .catch((e) => console.log(e));
    })
    .catch((e) => console.log(e));
}

function searchYoutube(q) {
  return gapi.client
    .request({
      path: `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${q}`,
    })
    .then((e) => {
      console.log(e.result);
      return e;
    })
    .catch(function (e) {
      console.log(e);
    });
}

/* 
  title : title of playlist (string)
  desc : description of playlist (string)
  status : visibility of playlist (public / private) (string)
*/
function insertPlaylist({ title, desc, status } = {}) {
  return gapi.client
    .request({
      path: "https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus",
      method: "post",
      body: {
        snippet: {
          title: title,
          description: desc,
          resourceId: {
            kind: "youtube#video",
          },
        },
        status: {
          privacyStatus: status,
        },
      },
    })
    .then((e) => {
      console.log(e.result);
      migrate_data.yt_playlist_id = e.result.id;
    })
    .catch(function (e) {
      console.log(e);
    });
}

function insertPlaylistItem(yt_playlist_id, yt_video_id) {
  return gapi.client
    .request({
      path: "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet",
      method: "post",
      body: {
        snippet: {
          playlistId: yt_playlist_id,
          resourceId: {
            kind: "youtube#video",
            videoId: yt_video_id,
          },
        },
      },
    })
    .then((e) => {
      console.log(e.result);
    })
    .catch(function (e) {
      console.log(e);
    });
}

function listPlaylist() {
  return gapi.client
    .request({
      path: "https://www.googleapis.com/youtube/v3/playlists?part=id%2Csnippet&mine=true",
    })
    .then((e) => {
      console.log(e.result.item);
    })
    .catch(function (e) {
      console.log(e);
    });
}

function sendAuthorizedApiRequest() {
  return new Promise((sucess, failed) => {
    if (isAuthGoogle && isAuthSpotify && playlist_name.value) {
      return sucess();
    } else {
      return failed();
    }
  });
}

function addOrUpdateClient() {
  if (
    !localStorage.getItem("google_oauth_client") ||
    !localStorage.getItem("spotify_client_id") ||
    !localStorage.getItem("spotify_client_secret")
  ) {
    localStorage.setItem("google_oauth_client", google_oauth_client.value);
    localStorage.setItem("spotify_client_id", sp_client_id.value);
    localStorage.setItem("spotify_client_secret", sp_client_secret.value);
  } else if (
    localStorage.getItem("google_oauth_client") != google_oauth_client.value ||
    localStorage.getItem("spotify_client_id") != sp_client_id.value ||
    localStorage.getItem("spotify_client_secret") != sp_client_secret.value
  ) {
    localStorage.setItem("google_oauth_client", google_oauth_client.value);
    localStorage.setItem("spotify_client_id", sp_client_id.value);
    localStorage.setItem("spotify_client_secret", sp_client_secret.value);
  }
}

function checksptoken() {
  console.log(sp_access_token);
}

window.onload = function () {
  let q = $(location).attr("hash");
  if (q) {
    let breakS = q.substr(1).split("&");
    let token = breakS[0].replace("access_token=", "");
    window.opener.spotifySetToken(token);
    window.close();
  }
  google_oauth_client.value = localStorage.getItem("google_oauth_client");
  sp_client_id.value = localStorage.getItem("spotify_client_id");
  sp_client_secret.value = localStorage.getItem("spotify_client_secret");
};

gbuttonlog.addEventListener("click", function () {
  if (google_oauth_client.value.length > 0) {
    addOrUpdateClient();
    gapi.load("client:auth2", initClient);
  } else {
    alert("The Youtube Client ID Is Empty");
  }
});

spbuttonlog.addEventListener("click", function () {
  addOrUpdateClient();
  spotifyAuth();
});

buttonmigrate.addEventListener("click", function () {
  migrate();
});
