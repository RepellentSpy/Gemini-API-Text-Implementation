import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';

let API_KEY = "AIzaSyCmqya3ONj7ujekdnxFfsx3Su3jlZZ8wcI"; // Generic testing API KEY
let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
  errorStyleRevert();
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Assemble the prompt
    let contents = [
      {
        role: 'user',
        parts: [
          { text: promptInput.value }
        ]
      }
    ];

    // Call the gemini-pro model, and get results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    generationError();
  }
};

// On error
function generationError() {
  console.error("!! Failed to generate")
  document.getElementById("input_box").style.borderColor = "red";
  document.getElementById("submit_button").style.backgroundColor = "#b11b1b";
  document.getElementById("submit_button").style.borderColor = "transparent";
  document.getElementById("submit_button").innerHTML = "Try Again";
  output.innerHTML += '<hr>' + "!! Failed to generate response";
}

function errorStyleRevert() {
  document.getElementById("input_box").style.borderColor = "black";
  document.getElementById("submit_button").style.backgroundColor = "black";
  document.getElementById("submit_button").style.borderColor = "black";
  document.getElementById("submit_button").innerHTML = "Send";
}