import React from "react";

// Function to read text aloud using Google Web Speech API (SpeechSynthesis)
export const readAloud = (text: string) => {
  const speech = new SpeechSynthesisUtterance(text); // Create a new speech utterance
  speech.lang = "en-US"; // Set the language to English (US)

  // Optionally set the pitch and rate
  speech.pitch = 1; // Default pitch
  speech.rate = 1; // Default speaking rate

  // Speak the text aloud
  window.speechSynthesis.speak(speech);
};
