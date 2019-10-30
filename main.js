
//**********************************INITIALIZE************************************************
const app = {};

app.apiUrl = 'https://api.spotify.com/v1';

var access_token = "BQDvFMMEACxJu7RmGzvICehkTpf5GK3XqaGfD3Hjg9QWPBJBmBKFjskYg_dEZptvCCqhFMPOCzWSSSmB8ilyrrGcMwxWlkOT-fc3hEZloazM-GJ6ppDtcvRqnExQ3T5mADIx98n8pLrgKr2hevntPfjTpzttapVOoAJMouhomE6EmLLwwVa8WcEGiuGizKtIpag04JZ8mXYwQRTJbfGVriWfDvw694qLEXgULjZY82BukrXMQt0nI5_kjYvxLFbpq2clcqsgT0tR33lxBy9e";

SC.initialize({
  client_id : '72e56a72d70b611ec8bcab7b2faf1015'
});

var queue = [];


var youtubePlaying = false;

var player;

var tag = document.createElement('script');
tag.src = "//www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


//**********************************AJAX FUNCTIONS************************************************
app.getPlaylists = function(){
	// The XMLHttpRequest is simple this time:
    //console.log("clicked");
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", "getPlaylists.php", true);
	xmlHttp.addEventListener("load", app.getPlaylistsCallback, false);
	xmlHttp.send(null);
};
 
app.getPlaylistsCallback = function(event){
    console.log("callback");
    console.log(event.target.responseText);
    var jsonData = JSON.parse(event.target.responseText);
        
    console.log("json data: " +  jsonData);
    for(var e in jsonData){
        if(jsonData[e].success){
            var playlistId = jsonData[e].id;
            var playlistName= jsonData[e].name;
            
            var radioBtn = $(`<input type="radio" name="rbnNumber" value=${playlistId} />${playlistName}</br>`);
            radioBtn.appendTo('#myform');
            var playlistLI = $(`<li value = ${playlistId}> ${playlistName}</li>`);
            //playlistLI.appendTo('#playlistAppend');
            $("#playlistAppend").append($("<li></li>")).html("hello?");
        }
        else{
            console.log("failure");
        }
    }
	
};

//adds song from results to the selected playlist from the popup form
app.add = function(playlistId, trackId,trackName,trackType){
    console.log("Selected Radio Button Value is " + playlistId);
    
	// Make a URL-encoded string for passing POST data:
	var dataString = "trackId=" + encodeURIComponent(trackId) + "&trackName=" + encodeURIComponent(trackName) +"&trackType=" + encodeURIComponent(trackType) +"&playlistId=" + encodeURIComponent(playlistId);
 
	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "addToPlaylist.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){
        console.log(event.target.responseText);
		var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
		if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
			//alert("Added to Playlist! " + jsonData.message);
		}else{
			//alert("Could not add to playlist.  "+jsonData.message);
		}
	}, false); // Bind the callback to the load event
	xmlHttp.send(dataString); // Send the data
}



//**********************************SPOTIFY SEARCH FUNCTIONS************************************************




app.searchArtist = (artistName) => $.ajax({
    //url: '${app.apiUrl}/search',
    url: 'https://api.spotify.com/v1/search',
    headers: { 'Authorization': 'Bearer ' + access_token },
    method : 'GET',
    dataType: 'json',
    data: {
        q: artistName,
        type: 'artist'
    }
});


//with the ids we want to get the albums
app.getArtistAlbums = (artistId) => $.ajax({
    //url: '${app.apiUrl}/artists/${artistId}/albums',
    url: 'https://api.spotify.com/v1/artists/'+artistId+'/albums',
    headers: { 'Authorization': 'Bearer ' + access_token },
    method: 'GET',
    dataType: 'json',
    data: {
        album_type: 'album'
    }
});

//now we want to get the tracks
app.getArtistTracks = (id) => $.ajax({
    url:  'https://api.spotify.com/v1/albums/'+id+'/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    method: 'GET',
    dataType: 'json'
});


//get artist tracks from each of their albums
app.retrieveArtistTracks = function(artistAlbums) {
    //console.log(artistAlbums);
    $.when(...artistAlbums)
        .then((...albums) =>{
            albumIds = albums.map(getFirstElement)
                .map(res => res.items)
                //.reduce((prev,curr) => [...prev,...curr],[]) //we are searching for multiple artists so reduce 'flattens' the arrays into one array
                .reduce(flatten,[])
                .map(album => album.id)
                .map(ids => app.getArtistTracks(ids));
                
                //app.buildPlaylist(albumIds);
                console.log(albumIds);
                app.showTracks(albumIds);
                
            
        });
};




//adds the tracks to the results div in html
app.showTracks = function(tracks) {
    $.when(...tracks)
    .then((...tracksResults) =>{
        tracksResults = tracksResults.map(getFirstElement)
        .map(item => item.items)
        .reduce(flatten,[])
        .map(item => item.id);
        console.log("spotify track results: " + tracksResults);
        if(tracksResults.length<100){
            for (i = 0; i < tracksResults.length; i++) {
				var trackId = "spotify:track:" + tracksResults[i]; //this gives us the track uri 
                $("#spotify_results").append(`<li><div class = "spotify-embeds"><iframe class="embed-responsive-item" src="https://embed.spotify.com/?them=white&uri=spotify:track:${tracksResults[i]}" width="300" height="80" frameborder="0"></iframe></div></li>`);
                var addToPlaylistBtn = $(`<p class="addToPlaylist" value='${trackId}' name = '' title = 'spotify' >Add To Playlist</button>`);
				var addToQueueBtn = $(`<p class="addToQueue" value='${trackId}' name = '' title = 'spotify' >Add To Queue</button>`);
                $("#spotify_results").append(addToPlaylistBtn);
				$("#spotify_results").append(addToQueueBtn);
                $('#spotify_results').append(document.createElement("hr"));
                $('#spotify_results').append(document.createElement("br"));
            }
        }
		else{
			for (i = 0; i < 100; i++) {
				var trackId = "spotify:track:" + tracksResults[i]; //this gives us the track uri 
                $("#spotify_results").append(`<li><div class = "spotify-embeds"><iframe class="embed-responsive-item" src="https://embed.spotify.com/?them=white&uri=spotify:track:${tracksResults[i]}" width="300" height="80" frameborder="0"></iframe></div></li>`);
                var addToPlaylistBtn = $(`<p class="addToPlaylist" value='${trackId}' name = '' title = 'spotify' >Add To Playlist</button>`);
				var addToQueueBtn = $(`<p class="addToQueue" value='${trackId}' name = '' title = 'spotify' >Add To Queue</button>`);
                $("#spotify_results").append(addToPlaylistBtn);
				$("#spotify_results").append(addToQueueBtn);
                $('#spotify_results').append(document.createElement("hr"));
                $('#spotify_results').append(document.createElement("br"));
			}
        
		}
    });
    
   
};


const getFirstElement = (item) => item[0]; //we make this function because we retrieve the first element in the json data alot

const flatten = (prev,curr) => [...prev,...curr]; ////we make this function because we flatten the multiple arrays we get alot



app.retrieveArtistInfo = function(search) {
     $.when(...search)
            .then((...results) =>{
                //results = results.map(res => res[0].artists.items[0].id)
                //        .map(id => app.getArtistAlbums(id));
               results = results.map(getFirstElement)
                    .map(res => res.artists.items[0].id)
                    .map(id => app.getArtistAlbums(id));
               app.retrieveArtistTracks(results);
            });
};






/////////////////////////////////	!!!		PLAY FUNCTIONS		!!!!	/////////////////////////////////////////////

var is_playing = false,
    sound;
var oldSoundID = 0;

app.player = function(id,type){
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
            app.play(id,type);
        }
     
    }
    else {
      console.log("nothing was playing before this");
      oldSoundID = id;
      app.play(id,type);
    }
};

app.play = function(id,type){
  queue.unshift([type,id]);
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

function playVideo() {
    player.playVideo();
}
function onPlayerReady(event) {
    event.target.playVideo();
    youtubePlaying = true;
}


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


////////////////////////////////// YOUTUBE FUNCTIONS///////////////////////////////////////////

app.resetVideoHeight = function() {
    $(".video").css("height", $("#youtube_results").width() * 9/16);
};



/*function onYouTubePlayerAPIReady() {
    video0 = new YT.Player('video0');
}*/

app.iframe1play = function(){
    video0.playVideo();
};

//var tag = document.createElement('script');
//tag.src = "//www.youtube.com/player_api";
//var firstScriptTag = document.getElementsByTagName('script')[0];
//firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

/////////////////////////////////APP EVENTS////////////////////////////////////////////////////

app.events = function() {
    //$('#btnSearch').click(function(){
    var myPos = { my: "center top", at: "center top+50", of: window };
    $("#myform").dialog({
			autoOpen: false,
            position: myPos,
			show: {
				effect: "blind",
				duration: 1000,
			},
			hide: {
				effect: "explode",
				duration: 1000
			}
		});
		
		app.getPlaylists();
		
		$("#results").on("click", "p.addToPlaylist", function(){
			console.log("addToPlaylist Clicked!!");
			//$("#myform #valueFromMyButton").text($(this).val().trim());
			console.log("id: " + $(this).attr('value'));
			var trackId = $(this).attr('value');
			var trackTitle = $(this).attr('name');
			
			var trackType = $(this).attr('title');
			
			console.log("name: " + trackTitle);
			$("#myform #trackToAddTitle").text(trackTitle);
			$("#myform #valueFromMyButton").val(trackId);
			$("#myform #valueFromMyButton").attr('title',trackType);
			$("#myform").dialog("open");
			//$("#myform input[type=text]").val('');
			//$("#valueFromMyModal").val('');
			//$("#myform").show(500);
		});
		
		$("#btnOK").click(function() {
        
			//$("#valueFromMyModal").val($("#myform input[type=text]").val().trim());
			//var trackId = $("#myform #valueFromMyButton").val().trim();
			var trackId = $("#myform #valueFromMyButton").val();
			console.log("track id: " + trackId);
			
			var trackTitle = $("#myform #trackToAddTitle").text();
			
			var trackType = $("#myform #valueFromMyButton").attr('title');
			
			var playlistId = $('#myForm input[name=rbnNumber]:checked').val();
			
			
			//$('p').html('<br/>Selected Radio Button Value is : <b>' + playlistId + '</b>');
			app.add(playlistId,trackId,trackTitle,trackType);
			//$("#myform").hide(400);
			$("#myform").dialog('close');
		});
		
		$('#btnSearch').click(function() {
			console.log("clicked");
			$("#soundcloud_results").empty();
			let searchVal = $('#search').val();
			/////////////////SOUNDCLOUD////////////////////////////////
			SC.get('/tracks',{q:`${searchVal}`}).then(function(tracks){
				for (var i = 0; i < tracks.length; i++) {
					$('#soundcloud_results').append($('<li></li>').html(tracks[i].title));
					//var span2 = document.createElement('span');
					//span2.innerHTML = `<button class="addQueue"  id = addQueue${tracks[i].id} onclick="addQueue(${tracks[i].id})"> Add To Queue </button>`;
					//var span = document.createElement('span');
					//var trackTitle = tracks[i].title;
					//span.innerHTML = `<button id=PlayPause${tracks[i].id} onclick="player(${tracks[i].id})"> play/pause </button>`;
					//$('#results').append(span);
					//$('#results').append(span2);
					
					var addToPlaylistBtn = $(`<p class="addToPlaylist" value=${tracks[i].id} name = '${tracks[i].title}' title = 'soundcloud' >Add To Playlist</button>`);
					var addToQueueBtn = $(`<p class="addToQueue" value=${tracks[i].id} name = '${tracks[i].title}' title = 'soundcloud' >Add To Queue</button>`);
					var playPauseBtn = $(`<p class="playPause" value=${tracks[i].id} name = '${tracks[i].title}' title = 'soundcloud' >Play/Pause</button>`);
					//var $something= $('<input/>').attr({ type: 'button', name:'btn1', value:'am button'});
					$("#soundcloud_results").append(addToPlaylistBtn);
					$("#soundcloud_results").append(addToQueueBtn);
					$("#soundcloud_results").append(playPauseBtn);
					$('#soundcloud_results').append(document.createElement("hr"));
					$('#soundcloud_results').append(document.createElement("br"));
				
				}
			});
			
			
			
			///////////SPOTIFY//////////////////////////
			console.log("Spotify results now?");
			let artists = $('#search').val();
			artists = [artists,artists];
			let search = artists.map(artistName => app.searchArtist(artistName));
			 app.retrieveArtistInfo(search);
			 
			 
			 
			 /////////// YOUTUBE //////////////
			 // prepare the request
			var request = gapi.client.youtube.search.list({
				part: "snippet",
				type: "video",
				q: encodeURIComponent($("#search").val()).replace(/%20/g, "+"),
				maxResults: 10,
				order: "viewCount",
				publishedAfter: "2015-01-01T00:00:00Z" 
			});
			// execute the request
			request.execute(function(response) {
				var results = response.result;
				//$("#results").html(""); //CLEAR RESULTS
				$.each(results.items, function(index, item) {
				  $.get("tpl/item.html", function(data) {
					  var vidLink = '//www.youtube.com/embed/' + item.id.videoId + "?enableksapi=1";
					  var iframe = document.createElement('iframe');
					  iframe.width = "0";
					  iframe.height = "0";
					  iframe.frameBorder = "0";
					  iframe.setAttribute("src", vidLink);
					  iframe.id = "video0";
					  //iframe.id = "video" + item.id.videoId;
					  $("#youtube_results").append(iframe);
                      $("#youtube_results").append(document.createTextNode(item.snippet.title));
					  var addToPlaylistBtn = $(`<p class="addToPlaylist" value=${item.id.videoId} name = '${item.snippet.title}' title = 'youtube' >Add To Playlist</button>`);
					  var addToQueueBtn = $(`<p class="addToQueue" value=${item.id.videoId} name = '${item.snippet.title}' title = 'youtube' >Add To Queue</button>`);
					  var playPauseBtn = $(`<p class="playPause" value=${item.id.videoId} name = '${item.snippet.title}' title = 'youtube' >Play/Pause</button>`);
					  $("#youtube_results").append(addToPlaylistBtn);
					  $("#youtube_results").append(addToQueueBtn);
					  $("#youtube_results").append(playPauseBtn);
					  
					  //$("#results").append(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId + "?enablejsapi=1"}]));
					  //console.log(tplawesome(data, [{"title":item.snippet.title, "videoid":item.id.videoId}]));
				  });
				});
				app.resetVideoHeight();
			});
		});
		
		$(window).on("resize", app.resetVideoHeight);
		
		$("#results").on("click", "p.addToQueue", function(){
			console.log("addToQueue Clicked!!!!!");
			var trackId = $(this).attr('value');
			var trackType = $(this).attr('title');
			queue.push([trackType,trackId]);
			console.log(queue);
		});
		
		$("#youtube_results").on("click", "p.playPause", function(){
			console.log("playPause Clicked!!!!!");
			var trackId = $(this).attr('value');
			//var trackType = $(this).attr('title');
			//queue.push([trackType,trackId]);
			//app.player(trackId);
            if(youtubePlaying){
                player.pauseVideo();
                youtubePlaying = false;
            }
            else{
                player.playVideo();
                youtubePlaying = true;
            }
		});

    $("#soundcloud_results").on("click", "p.playPause", function(){
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

    $("#spotify_results").on("click", "p.playPause", function(){
        console.log("playPause Clicked!!!!!");
        var trackId = $(this).attr('value');
        //var trackType = $(this).attr('title');
        //queue.push([trackType,trackId]);
        //app.player(trackId);
        app.pauseTrackSpotify();
    });

        $("#next").on("click", app.playQueue);
		
		
		
		$("#playQueue").click(app.playQueue);
    
};

function loadPlayer(){
	gapi.client.setApiKey("AIzaSyBCH_ElIi7WiPGId6RU0U1PNNzFabhHS80");
    gapi.client.load("youtube", "v3", function() {
        // yt api is ready
    });
}

app.init = function() {
    app.events();
};

$(app.init);










//$('#playQueue').click(playQueue());



