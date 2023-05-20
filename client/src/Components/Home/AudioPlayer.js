import React from "react";

const AudioPlayer = ({ src }) => {
  return (
    <audio controls src={src} type="audio/mpeg">
      <a href={src}>Download audio</a>
      Your browser does not support the audio element.
    </audio>
  );
};

export default AudioPlayer;
