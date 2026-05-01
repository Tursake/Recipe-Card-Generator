const inputs = document.querySelectorAll("input, textarea, select");

const fileInput = document.getElementById("imageUpload");
const previewImage = document.getElementById("pImage");
const placeholder = document.getElementById("imagePlaceholder");
const imageWrapper = document.querySelector(".imageWrapper");

const card = document.getElementById("card");
const size = document.getElementById("size");

const titleInput = document.getElementById("title");
const servingsInput = document.getElementById("servings");
const timeInput = document.getElementById("time");
const ingredientsInput = document.getElementById("ingredients");
const instructionsInput = document.getElementById("instructions");
const notesInput = document.getElementById("notes");

const servingsLabel = document.getElementById("servingsLabel");
const timeLabel = document.getElementById("timeLabel");
const ingredientsLabel = document.getElementById("ingredientsLabel");
const instructionsLabel = document.getElementById("instructionsLabel");
const notesLabel = document.getElementById("notesLabel");

const pTitle = document.getElementById("pTitle");
const pServingsLabel = document.getElementById("pServingsLabel");
const pTimeLabel = document.getElementById("pTimeLabel");
const pIngredientsLabel = document.getElementById("pIngredientsLabel");
const pInstructionsLabel = document.getElementById("pInstructionsLabel");
const pNotesLabel = document.getElementById("pNotesLabel");

const pServings = document.getElementById("pServings");
const pTime = document.getElementById("pTime");
const pIngredients = document.getElementById("pIngredients");
const pInstructions = document.getElementById("pInstructions");
const pNotes = document.getElementById("pNotes");

inputs.forEach(input => input.addEventListener("input", update));

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    previewImage.src = event.target.result;
    previewImage.style.display = "block";
    placeholder.style.display = "none";
    fitCardToPage();
  };

  reader.readAsDataURL(file);
});

function parseSections(text) {
  const lines = text.split("\n");
  let html = "";
  let listOpen = false;

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      if (listOpen) {
        html += "</ul>";
        listOpen = false;
      }

      html += `<h3>${trimmed.replace("## ","")}</h3>`;
    } else if (trimmed !== "") {
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }

      html += `<li>${trimmed}</li>`;
    }
  });

  if (listOpen) html += "</ul>";
  return html;
}

function update() {
  pTitle.innerText = titleInput.value;

  pServingsLabel.innerText = servingsLabel.innerText;
  pTimeLabel.innerText = timeLabel.innerText;
  pIngredientsLabel.innerText = ingredientsLabel.innerText;
  pInstructionsLabel.innerText = instructionsLabel.innerText;
  pNotesLabel.innerText = notesLabel.innerText;

  pServings.innerText = servingsInput.value;
  pTime.innerText = timeInput.value;

  pIngredients.innerHTML = parseSections(ingredientsInput.value);
  pInstructions.innerHTML = parseSections(instructionsInput.value);
  pNotes.innerText = notesInput.value;

  card.className = "card " + size.value;

  fitCardToPage();
}

function editLabel(id) {
  const label = document.getElementById(id);
  const newText = prompt("Edit label:", label.innerText);

  if (newText !== null && newText.trim() !== "") {
    label.innerText = newText.trim();
    update();
  }
}

function fitCardToPage() {
  const maxImageHeight = size.value === "a5" ? 220 : 300;
  const minImageHeight = 120;

  imageWrapper.style.height = maxImageHeight + "px";

  requestAnimationFrame(() => {
    let currentHeight = maxImageHeight;

    while (card.scrollHeight > card.clientHeight && currentHeight > minImageHeight) {
      currentHeight -= 10;
      imageWrapper.style.height = currentHeight + "px";
    }
  });
}

function clearAll() {
  titleInput.value = "";
  servingsInput.value = "";
  timeInput.value = "";
  ingredientsInput.value = "";
  instructionsInput.value = "";
  notesInput.value = "";

  servingsLabel.innerText = "Servings";
  timeLabel.innerText = "Time";
  ingredientsLabel.innerText = "Ingredients";
  instructionsLabel.innerText = "Instructions";
  notesLabel.innerText = "Notes";

  fileInput.value = "";
  previewImage.src = "";
  previewImage.style.display = "none";
  placeholder.style.display = "block";

  update();
}

update();
