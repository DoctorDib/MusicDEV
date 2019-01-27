# MusicDEV
Final Year Project - Music Recommendation System

## The purpose
I have create MusicDEV for the soul purpose of finding new ways to explore and discover new music. I myself have a terrible taste in music and sometime have a habbit of listening to the same music each day everyday when I program. Since I listen to music while I program, I do not really get the time to explore new music. 

## Required files
You are required to have a `secretKeys.json` within the 'helpers/' directory.
Contents of `secretkeys.json`:
 - Spotify Api:
   - Client ID
   - Client Secret
   - Spotify Callback
   - More information about the Spotify API can be found here: https://developer.spotify.com/documentation/web-api/
 - Push bullet API:
   - Api key
   - More information about the Pushbullet API can be found here: https://docs.pushbullet.com/

## Required services
Databases:
  - MongoDB - `Sudo apt-get install mongo`
  - Neo4J - Can be downloaded here: https://neo4j.com/download-center/#releases

## How to setup
  1. `npm install` - Installing the required packages from package.json
  2. `cd helpers/musicTool` - Directing to the setup tool.
  3. `node app.js learn initial` - Initialising, formatting and storing the master music data *Please see 'Required files' /data directory for the neccessary files*
  4. `node app.js cut [int max of 100]` - Creating your training and testing sample data, for the genre data classification.
  5. `node app.js train` - Classifying genres for the collected music data from *Step 3*.
  - 5.2 `node app.js sample` - After training the program, you can view the accuracy of the genre classication using your testing samples *Step 4*.
  6. `node app.js build` - Builds the collected music (with the new genre) to a graphical database Neo4j.
