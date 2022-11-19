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

const colorsByCueNumber = {
  0: { color: "pink", cueColor: "0xF870F8", trackColor: "0xFF007F" },
  1: { color: "red", cueColor: "0xF80000", trackColor: "0xFF0000" },
  2: { color: "orange", cueColor: "0xF8A030", trackColor: "0xFFA500" },
  3: { color: "yellow", cueColor: "0xC3AF01", trackColor: "0xFFFF00" },
  4: { color: "green", cueColor: "0x04DF03", trackColor: "0x00FF00" },
  5: { color: "teal", cueColor: "0x00C0F8", trackColor: "0x25FDE9" },
  6: { color: "blue", cueColor: "0x0050F8", trackColor: "0x0000FF" },
  7: { color: "purple", cueColor: "0x9808F8", trackColor: "0x660099" },
};

const shouldMapCuesToColor = true;
const shouldMapColorToCues = true;
const shouldRandomizeGenre = true;
const shouldFormatXML = false;

Object.entries(colorsByCueNumber).forEach(([cueNumber, colors]) => {
  const { color, cueColor, trackColor } = colors;
  console.log(`${cueNumber} ${color} ${cueColor} ${trackColor}`);
  mapCueToTrackColor(cueNumber, trackColor);
  mapTrackColorToCue(cueNumber, trackColor, cueColor);
});
randomizeGenres();

console.log(`- CUES TO COLOR: ${shouldMapCuesToColor}`);
console.log(`- COLOR TO CUES: ${shouldMapColorToCues}`);
console.log(`- RANDOMIZE GENRE: ${shouldRandomizeGenre}`);

const xmlString = xmlSerializer.serializeToString(doc);
if (shouldFormatXML) {
  console.log("- Formatting XML...");
  fs.writeFileSync("rekordbox-tagged.xml", formatXML(xmlString));
} else {
  fs.writeFileSync("rekordbox-tagged.xml", xmlString);
}

function mapCueToTrackColor(cueNumber, trackColor) {
  const cueXPath = `POSITION_MARK[@Num="${cueNumber}"]`;
  const tracksXPath = `/DJ_PLAYLISTS/COLLECTION/TRACK[${cueXPath}]`;
  const tracks = Array.from(xpath.select(tracksXPath, doc));

  tracks.forEach((trackWithCue) => {
    const cue = xpath.select(cueXPath, trackWithCue)[0];
    if (shouldMapCuesToColor) {
      trackWithCue.setAttribute("Colour", trackColor);
    }
    trackWithCue.removeChild(cue);
  });
}

function mapTrackColorToCue(cueNumber, trackColor, cueColor) {
  const tracksXPath = `/DJ_PLAYLISTS/COLLECTION/TRACK[@Colour="${trackColor}"]`;
  const tracks = Array.from(xpath.select(tracksXPath, doc));

  tracks.forEach((track) => {
    const cueTime = Number(track.getAttribute("TotalTime")) - 0.01;
    const oldCueXPath = `POSITION_MARK[starts-with(@Start, ${cueTime})]`;
    const oldCues = Array.from(xpath.select(oldCueXPath, track));
    oldCues.forEach((oldCue) => track.removeChild(oldCue));

    const [_match, red, green, blue] = cueColor.match(/0x(.{2})(.{2})(.{2})/);
    const newCue = doc.createElement("POSITION_MARK");
    newCue.setAttribute("Name", "Track Color");
    newCue.setAttribute("Start", String(cueTime));
    newCue.setAttribute("Type", "0");
    if (shouldMapColorToCues) {
      newCue.setAttribute("Num", String(cueNumber));
    } else {
      newCue.setAttribute("Num", "-2"); // deletes marker
    }
    newCue.setAttribute("Red", String(parseInt(red, 16)));
    newCue.setAttribute("Green", String(parseInt(green, 16)));
    newCue.setAttribute("Blue", String(parseInt(blue, 16)));

    track.appendChild(newCue);
  });
}

function randomizeGenres() {
  if (shouldRandomizeGenre) {
    const tracks = Array.from(
      xpath.select(`/DJ_PLAYLISTS/COLLECTION/TRACK`, doc)
    );
    tracks.forEach((track) => {
      track.setAttribute("Genre", String(Math.random()));
    });
  }
}
