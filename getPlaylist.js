const app = {};

var queue = [];
var youtubePlaying = false;

app.apiUrl = 'https://api.spotify.com/v1';
var access_token = 'BQDvFMMEACxJu7RmGzvICehkTpf5GK3XqaGfD3Hjg9QWPBJBmBKFjskYg_dEZptvCCqhFMPOCzWSSSmB8ilyrrGcMwxWlkOT-fc3hEZloazM-GJ6ppDtcvRqnExQ3T5mADIx98n8pLrgKr2hevntPfjTpzttapVOoAJMouhomE6EmLLwwVa8WcEGiuGizKtIpag04JZ8mXYwQRTJbfGVriWfDvw694qLEXgULjZY82BukrXMQt0nI5_kjYvxLFbpq2clcqsgT0tR33lxBy9e\n';

SC.initialize({
  client_id : '72e56a72d70b611ec8bcab7b2faf1015'
  //client_id : 'e965548fd23b4eecae47f8b44057c31e'
});

app.getPlaylistAjax = function(event){
	// The XMLHttpRequest is simple this time:
  console.log("clicked");
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", `getPlaylist.php`, true);
	xmlHttp.addEventListener("load", app.getPlaylistCallback, false);
	xmlHttp.send(null);
};
 
app.getPlaylistCallback = function(event){
    console.log("callback");
	var PlaylistDiv = document.getElementById("playlist"); // Get the HTML element into which we want to write the note
    if(PlaylistDiv.hasChildNodes()){ //clear the list if it exists so it doesnt get duplicated
        clear(PlaylistDiv);
    }
    
    console.log(event.target.responseText);
    var jsonData = JSON.parse(event.target.responseText);
    
	//var jsonData = event.target.responseText;
    
    console.log("json data: " +  jsonData);
    for(var e in jsonData){
        //var date = e["date"];
        //var name = e['name'];
        if(jsonData[e].success){
            var playlistID = jsonData[e].id;
            var trackId = jsonData[e].trackId;
            var trackTitle = jsonData[e].trackname;
            var trackType = jsonData[e].type;
            var artist = jsonData[e].artist;
            var trackLI = document.createElement("li");
            //trackLI.appendChild(document.createTextNode("playlist id: " + playlistID+ ".  trackId: " + trackId + ". trackTitle: " + trackTitle));
            trackLI.appendChild(document.createTextNode(trackTitle + " " + artist));
            PlaylistDiv.appendChild(trackLI);
            
            var span = document.createElement('span');
            span.innerHTML = `<button id=PlayPause${trackId} onclick="app.player(${trackId})"> play/pause </button>`;
            
            trackLI.append(span);
            queue.push([trackType,trackId]);
            
        }
        else{
            //alert("failure");
            console.log("failure");
        }
    }
	
};



var is_playing = false,
    sound;
var oldSoundID = 0;

app.player = function(id){
    if( sound ) {
        console.log("something was already playing");
        if (parseInt(oldSoundID) == parseInt(id)){
            console.log("same song");
            if(is_playing) {
                sound.pause();
                is_playing = false;
            }
            else {
                sound.play();
                is_playing = true;
              }
        }
        else{
            console.log("different song");
            oldSoundID = id;
            app.play(id);
        }
     
    }
    else {
      console.log("nothing was playing before this");
      oldSoundID = id;
      app.play(id);
    }
};

app.play = function(id){
  queue.unshift(id);
  app.playQueue();
  console.log("in play function. Id is: " +id);
  currentTrackPlaying = id;
};


app.playQueue = function(){
    if(queue.length>0){
        var songToPlay = queue.shift(); //removes the first element in the queue and returns it
        //queue.push(songToPlay);//add the song back to the end of the queue

        if(youtubePlaying){
            player.pauseVideo();
            youtubePlaying = false;
        }
        if(is_playing){
            sound.pause();
        }
        app.pauseTrackSpotify();
        //SOUNDCLOUD TRACK
        if(songToPlay[0] == "soundcloud"){
            console.log("soundcloudTrack");
            SC.stream(`/tracks/${songToPlay[1]}`).then(function(track){
                track.play();
                sound = track;
                is_playing = true;
                track.on('finish', function(){
                    console.log("The track finished");
                    app.playQueue();
                });
            });
        }
        //SPOTIFY TRACK
        else if (songToPlay[0] == "spotify"){
            console.log("spotifyTrack");
            app.playTrackSpotify(songToPlay[1]);
        }
        //YOUTUBE
        else if (songToPlay[0] == "youtube"){
            //youtubePlayer(songToPlay[1])
            console.log(songToPlay[1]);
            player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: songToPlay[1],
                events: {
                    'onReady': onPlayerReady
                }
            });
        }
    }
};


app.getTrackSpotify = () => $.ajax({
    url:  'https://api.spotify.com/v1/me/player',
    headers: { 'Authorization': 'Bearer ' + access_token },
    method: 'GET',
    dataType: 'json',
    success: function(result) {
        // handle result...
        console.log("success");
         console.log("progress: " + result.progress_ms);
         console.log("duration: " + result.item.duration_ms);
         var trackLength = Number(result.item.duration_ms);
         var trackprogress = Number(result.progress_ms);
         //var timeout = trackLength - trackprogress;
         var timeout = trackLength - 500;
         var trackprogress = Number(result.progress_ms);
         setTimeout(app.pauseTrackSpotify, timeout);
         setTimeout(app.playQueue, timeout);
        }
    }
);


app.playTrackSpotify = (uri) => $.ajax({
    url:  'https://api.spotify.com/v1/me/player/play?device_id=13fa07330f0e7bae4cac053afaf3da8abb855bee',
    headers: { 'Authorization': 'Bearer ' + access_token },
    method: 'PUT',
    dataType: 'json',
    data: JSON.stringify({
        "uris":[`${uri}`]
        //"uris":["spotify:track:3yKcDwrU6FnGQClU8RY19I"]
      }),
    success: function(result) {
      // handle result...
      console.log("success");
      console.log(result);
      app.getTrackSpotify();
    }
}
);

app.pauseTrackSpotify = () => $.ajax({
    url:  'https://api.spotify.com/v1/me/player/pause',
    headers: { 'Authorization': 'Bearer ' + access_token },
    method: 'PUT',
    dataType: 'json',
    success: function(result) {
      // handle result...
      console.log("success. paused");
      console.log(result);
    }
    
});

app.events = function() {
    //$("#playlistAppend").on("click", "li", function(){
    //    playlistId = $(this).attr("value");
    //    app.getPlaylistAjax(playlistId);
    //});
    $("#getPlaylist").click(app.getPlaylistAjax);
    $("#playPlaylist").click(app.playQueue);
    $("#next").on("click", app.playQueue);

    $("#playlist").on("click", "p.playPause", function(){
        console.log("playPause Clicked!!!!!");
        var trackId = $(this).attr('value');
        //var trackType = $(this).attr('title');
        //queue.push([trackType,trackId]);
        //app.player(trackId);
        if(is_playing){
            sound.pause();
        }
        else{
            sound.play();
        }
    });
    
};

app.init = function() {
    app.events();
};

$(app.init);