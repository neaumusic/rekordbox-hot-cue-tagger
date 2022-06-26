import fs from "fs";
import moment from "moment";
import { DOMParser, XMLSerializer } from "xmldom";
import formatXML from "xml-formatter";
import xpath from "xpath";

fs.rmSync("rekordbox-tagged.xml", { force: true });
fs.copyFileSync("rekordbox.xml", "rekordbox-tagged.xml");

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

const rbtxml = fs.readFileSync("./rekordbox-tagged.xml", "utf8");
const doc = domParser.parseFromString(rbtxml);

const trackColors = {
  dontChange: null,
  remove: "",
  magenta: "0xFF007F",
  red: "0xFF0000",
  orange: "0xFFA500",
  yellow: "0xFFFF00",
  green: "0x00FF00",
  teal: "0x25FDE9",
  blue: "0x0000FF",
  purple: "0x660099",
};
const trackColorsByCueNumber = {
  0: trackColors.dontChange, // memory cue
  1: trackColors.magenta,
  2: trackColors.red,
  3: trackColors.orange,
  4: trackColors.yellow,
  5: trackColors.green,
  6: trackColors.teal,
  7: trackColors.blue,
  8: trackColors.purple,
};
const cueColorByCueNumber = {
  0: null, // memory cue
  1: "0xF870F8", // pink
  2: "0xF80000", // red
  3: "0xF8A030", // orange
  4: "0xC3AF01", // yellow
  5: "0x04DF03", // green
  6: "0x00C0F8", // teal
  7: "0x0050F8", // blue
  8: "0x9808F8", // purple
};

const shouldMapCuesToColor = true;
const shouldMapColorToCues = true;
const shouldRandomizeGenre = true;
const shouldFormatXML = false;

Object.entries(trackColorsByCueNumber).forEach(([cueNumber, trackColor]) => {
  // set track color and remove hot cue
  const cuesXPath = `POSITION_MARK[@Num="${cueNumber - 1}"]`;
  const tracksWithCuesXPath = `/DJ_PLAYLISTS/COLLECTION/TRACK[${cuesXPath}]`;
  const tracksWithCues = Array.from(xpath.select(tracksWithCuesXPath, doc));
  if (trackColor !== trackColors.dontChange) {
    tracksWithCues.forEach((trackToModify) => {
      const trackArtist = trackToModify.getAttribute("Artist");
      const trackName = trackToModify.getAttribute("Name");
      console.log(`Cue To Color: ${trackArtist} - ${trackName}`);

      if (shouldMapCuesToColor) {
        if (trackColor === trackColors.remove) {
          trackToModify.removeAttribute("Colour");
          console.log(`- Track Color: removed`);
        } else {
          trackToModify.setAttribute("Colour", trackColor);
          console.log(`- Track Color: set ${trackColor}`);
        }
      }

      const cueMarkerNode = xpath.select(cuesXPath, trackToModify)[0];
      trackToModify.removeChild(cueMarkerNode);
      console.log(`- Cue Marker: removed ${cueMarkerNode}`);

      console.log("");
    });
  }

  // set or remove colored hot cues on all colored tracks
  const tracksWithColorXPath = `/DJ_PLAYLISTS/COLLECTION/TRACK[@Colour="${trackColor}"]`;
  const tracksWithColor = Array.from(xpath.select(tracksWithColorXPath, doc));
  const cueColor = cueColorByCueNumber[cueNumber];
  if (typeof cueColor !== "undefined") {
    tracksWithColor.forEach((trackWithColor) => {
      const trackArtist = trackWithColor.getAttribute("Artist");
      const trackName = trackWithColor.getAttribute("Name");
      console.log(`Color To Cue: ${trackArtist} - ${trackName}`);

      const cueTime = Number(trackWithColor.getAttribute("TotalTime")) - 0.01;
      const oldCues = Array.from(
        xpath.select(
          `POSITION_MARK[starts-with(@Start, ${cueTime})]`,
          trackWithColor
        )
      );
      oldCues.forEach((oldCue) => {
        trackWithColor.removeChild(oldCue);
      });

      const [_match, red, green, blue] = cueColor.match(/0x(.{2})(.{2})(.{2})/);
      const newCue = doc.createElement("POSITION_MARK");
      newCue.setAttribute("Name", "Track Color");
      newCue.setAttribute("Start", String(cueTime));
      newCue.setAttribute("Type", "0");
      if (shouldMapColorToCues) {
        newCue.setAttribute("Num", String(cueNumber - 1));
      } else {
        newCue.setAttribute("Num", "-2");
      }
      newCue.setAttribute("Red", String(parseInt(red, 16)));
      newCue.setAttribute("Green", String(parseInt(green, 16)));
      newCue.setAttribute("Blue", String(parseInt(blue, 16)));

      trackWithColor.appendChild(newCue);
    });
  }
});

if (shouldRandomizeGenre) {
  const tracks = Array.from(
    xpath.select(`/DJ_PLAYLISTS/COLLECTION/TRACK`, doc)
  );
  tracks.forEach((track) => {
    track.setAttribute("Genre", String(Math.random()));
  });
}

console.log(`-----------------------------------------------`);
console.log(`       CUES TO COLOR: ${shouldMapCuesToColor}`);
console.log(`       COLOR TO CUES: ${shouldMapColorToCues}`);
console.log(`       RANDOMIZE GENRE: ${shouldRandomizeGenre}`);
console.log(`-----------------------------------------------\n`);

const xmlString = xmlSerializer.serializeToString(doc);
if (shouldFormatXML) {
  console.log("Formatting XML...");
  fs.writeFileSync("rekordbox-tagged.xml", formatXML(xmlString));
} else {
  fs.writeFileSync("rekordbox-tagged.xml", xmlString);
}
