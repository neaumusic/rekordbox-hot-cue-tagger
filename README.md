Rekordbox Hot Cue Tagger
--

I wanted a way to tag my tracks without looking at rekordbox

I learned that hot cues can be set while playing a track, via MIDI

This repo converts hot cues to track colors via rekordbox.xml export/convert/import

This allows me to tag colors with my macbook's touchbar, without even looking at RB

Options (configure variables in index.js)
- Convert hot cues to track colors
- Convert track colors to colored waveform cues at TotalTime - 0.01
  - If disabled, TotalTime - 0.01 cues will be deleted
- Randomizes genre (sort by Genre for random track order)

Note: this removes typical hot cue functionality
- In my case I would rather make a DJ edit with Ableton Live
- I use memory cue *pairs* to mark the start of bad section and where it recovers or gets good again
- I use a single memory cue (not a pair) to mark 'the good part'
- Beat jumping (usually 8 beats) works great for skipping through bad sections

---

My specific taxonomy (as an example)
--

- HEAT - happy, high energy, heavy, ridiculous, light (tech house)
- BRIGHT - HAPPY, medium energy, ridiculous, light (tech house, disco, funk)
- CALM - happy, low energy (lofi, bright dub)
- SLOW - slightly jaded, low energy, mostly happy, easy to listen to (indie)
- DARK - slightly jaded, medium energy, mostly happy, high peaks (edm, pop)
- DEEP - SAD, low-medium energy, fear, desolate, tense (progressive, deep dub)
- TENSE - commanding, low-medium energy, heavy (techno)
- AGGRO - commanding, high energy, heavy (techno, bass house)

Most accurate when you're relaxed and calm / impervious to abrasive tracks

Sort rating 5 first and see how they fall before starting on rating 4

I use rating 3 for material that isn't playable standalone, rating 2 for archival, rating 1 for deletion

1. Protect happy colors, don't allow tracks that could be seen as depressing

2. Put sad, sadness inducing/assuming, fear or desolate tracks in DEEP

3. Put commanding tracks in TENSE or AGGRO/HEAT based on energy
- AGGRO if its fear-based and serious
- HEAT if it's ridiculous or less serious

4. Put *impure* happy tracks in DARK, this color makes me feel a lot better about excluding them from the pure happy ones

5. Put calm, chill tracks in CALM or SLOW depending on if they actually *make* you happy

---

Usage
--

1. Run `yarn` to install dependencies (install yarn if you don't have it)

2. (Optional) Modify index.js `shouldMapCuesToColor, shouldMapColorToCues, shouldRandomizeGenre, shouldFormatXML` as appropriate

3. Export `"rekordbox.xml"` into this directory and run `node index.js` or `node index.js && cp rekordbox-tagged.xml __SOME_LOCATION__`

4. Set rekordbox-tagged.xml in RB preferences -> advanced -> 'database location'

5. Refresh rekordbox.xml in sidebar

6. Sort rekordbox.xml All Tracks by Color (not Playlists or cues won't update)

7. Select tracks -> right click -> import to collection ("yes" if prompted)
