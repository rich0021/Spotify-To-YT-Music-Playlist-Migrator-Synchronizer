let GoogleAuth; // Google Auth object.

let gbuttonlog = document.getElementById("gbuttonlog");
let gbuttonmigrate = document.getElementById("gbuttonmigrate");

let sp_client_id = document.getElementById("spotify_client_id");
let sp_client_secret = document.getElementById("spotify_client_secret");

let yt_client_id = document.getElementById("yt_client_id");

function initClient() {
  return gapi.client
    .init({
      apiKey: "AIzaSyBd3dlsPdpEkU9kejCBxTWwvKcJY21Wlj0",
      clientId: yt_client_id.value,
      scope:
        "https://www.googleapis.com/auth/youtubepartner https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl",
      plugin_name: "streamy",
    })
    .then(function () {
      GoogleAuth = gapi.auth2.getAuthInstance();
      GoogleAuth.signIn();
    });
}

function insertPlaylist({ title, desc, status } = {}) {
  return gapi.client
    .request({
      path: "https://www.googleapis.com/youtube/v3/playlists?part=snippet%2Cstatus",
      method: "post",
      body: {
        snippet: {
          title: title,
          description: desc,
        },
        status: {
          privacyStatus: status,
        },
      },
    })
    .then((e) => {
      console.log(e);
    });
}

function sendAuthorizedApiRequest() {
  if (GoogleAuth.isSignedIn) {
    insertPlaylist({
      title: "test api",
      desc: "test api palylist",
      status: "private",
    });
  } else {
    GoogleAuth.signIn();
  }
}

gbuttonlog.addEventListener("click", function () {
  gapi.load("client:auth2", initClient);
});

gbuttonmigrate.addEventListener("click", function () {
  sendAuthorizedApiRequest();
});
