import React, { useState, useEffect } from "react";
import axios from 'axios';
import hash from "./hash";
import styles from './styles/mainpage.module.css';

const CreatePlaylistPage = (token) => {

    const [spotifyInfo, setSpotifyInfo] = useState({

        user_name: "",
        user_id: "",
        new_playlist_id: "",
    
      });

    const [access, setAccess] = useState(false);

    useEffect(() => {

        console.log("use effect (set access)")
        if (token) {
          GetSpotifyUserInfo(token)
        }
    
      }, [token]);

      const GetSpotifyUserInfo = (token) => {

        axios
          ({
            url: 'https://api.spotify.com/v1/me/',
            method: 'GET',
            headers: {
              "Authorization": "Bearer " + token,
            }
          })
          .then((response) => {
    
            if (!response.data) {
              return;
            }
    
            var firstName = response.data.display_name.substring(0, response.data.display_name.indexOf(' ')).trim();
    
            setSpotifyInfo((prevState) => ({
              ...prevState,
              user_name: firstName,
              user_id: response.data.id,
            }));
    
            setAccess(true);
            console.log("GetSpotifyUserInfo access");
            //access = true;
    
          })
          .catch(function (error) {
            //access = false;
            setAccess(false);
            console.log("Error GetSpotifyUserInfo");
            console.log(error);
          });
      }

  const CreateBlankPlaylist = async (city) => {

    var playlist_name = "Record Shop - " + city;

    return new Promise(async function (resolve, reject) {
      axios
        ({
          url: 'https://api.spotify.com/v1/users/' + spotifyInfo.user_id + '/playlists',
          method: 'POST',
          headers: {
            "Authorization": "Bearer " + token,
            'Content-Type': 'application/json',
          },
          data: {
            "name": playlist_name,
            "description": "a mixtape of upcoming concerts --> created by recordshopp.netlify.app",
            "public": false
          }
        })
        .then((response) => {

          setSpotifyInfo((prevState) => ({
            ...prevState,
            new_playlist_id: response.data.id,
          }));

          resolve(response.data.id);

          console.log('Successfully created a playist: ' + playlist_name);

        })
        .catch(function (error) {
          console.log("Error: CreateBlankPlaylist");
          console.log(error);
        }); //end axios
    }); //end promise

  }

  const CreateNewPlaylist = async (city) => {

    var playlist_id = await CreateBlankPlaylist(city);

    axios
      .get(process.env.REACT_APP_SITE_URL_DB + city + "/")
      .then((response) => {
        var data = response.data
        var tracks = "";
        var numTopTracksToAdd = 1;

        for (const element of data) {

          try {

            for (let i = 0; i < numTopTracksToAdd; i++) {
              tracks += element.top_tracks[i].uri;
              tracks += ",";
            }

          }
          catch { }

        }

        tracks = tracks.substring(0, tracks.length - 1); // remove last comma

        AddTracksToPlaylist(playlist_id, tracks);

      })
      .catch(function (error) {
        console.log("Error CreateNewPlaylist")
        console.log(error);
      });
  }

  const AddTracksToPlaylist = (playlist_id, tracks) => {

    axios({
      url: "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks?uris=" + tracks,
      method: 'POST',
      headers: {
        "Authorization": "Bearer " + token,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {

        console.log("Successfully added tracks to playlist");
        window.alert("Successfully created a new playlist!");

      })
      .catch(function (error) {
        console.log("Error: unsuccessfully added tracks to playlist");
        console.log(error);
      });
  }


  const HandleClickVictoria = () => {

    if (window.confirm('Are you sure you want to create a new playlist on your account?')) {
      CreateNewPlaylist("victoria");
    }
  }

  const HandleClickVancouver = () => {

    if (window.confirm('Are you sure you want to create a new playlist on your account?')) {
      CreateNewPlaylist("vancouver");
    }
  }

  const HandleClickOttawa = () => {
    if (window.confirm('Are you sure you want to create a new playlist on your account?')) {
      CreateNewPlaylist("ottawa");
    }
  }

  const AccessDenied = () => (

    <div>
      <p>Whoops! Please send an email to devin.m.bushey@gmail.com to ask for access</p>
      <p>Please include your name and email associated with your spotify account</p>
    </div>
  );

  return (
    <div className="container-sm" style={{ marginBottom: 50 }}>

      {access && (

        <div className="container-sm">
        <h3>Hey {spotifyInfo.user_name}!</h3>
        <br />
        <div className={styles.heyContainer}>
          <p><span className={styles.color1}>Create a new playlist</span> from shows playing in: </p>
          <br />
          <button className={styles.cities} onClick={HandleClickVictoria}>
            Victoria
          </button>
          <button className={styles.cities} onClick={HandleClickVancouver}>
            Vancouver
          </button>
          <button className={styles.cities} onClick={HandleClickOttawa}>
            Ottawa
          </button>
          <br />
          <br />
          <p>This will create a new playlist right on your account!</p>
          <br />
          <p>Look for <span style={{ textDecorationLine: "underline" }}>Record Shop - city</span> on your Spotify.</p>
        </div>
      </div>

      )}
      {!access && (
        <AccessDenied />
      )}

    </div>
  );


}

export default CreatePlaylistPage;
