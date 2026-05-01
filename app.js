const inputs = document.querySelectorAll("input, textarea, select");
const fileInput = document.getElementById("imageUpload");
const previewImage = document.getElementById("pImage");
const placeholder = document.getElementById("imagePlaceholder");
const imageWrapper = document.querySelector(".imageWrapper");

inputs.forEach(i => i.addEventListener("input", update));

fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    previewImage.src = e.target.result;
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
    if (line.startsWith("## ")) {
      if (listOpen) {
        html += "</ul>";
        listOpen = false;
      }
      html += `<h3>${line.replace("## ","")}</h3>`;
    } else if (line.trim() !== "") {
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }
      html += `<li>${line}</li>`;
    }
  });

  if (listOpen) html += "</ul";
  return html;
}

function update() {
  pTitle.innerText = title.value;

  servingsLabel.innerText = servingsLabelInput.value || "Servings";
  timeLabel.innerText = timeLabelInput.value || "Time";
  ingredientsLabel.innerText = ingredientsLabelInput.value || "Ingredients";
  instructionsLabel.innerText = instructionsLabelInput.value || "Instructions";
  notesLabel.innerText = notesLabelInput.value || "Notes";

  pServings.innerText = servings.value;
  pTime.innerText = time.value;

  pIngredients.innerHTML = parseSections(ingredients.value);
  pInstructions.innerHTML = parseSections(instructions.value);
  pNotes.innerText = notes.value;

  card.className = "card " + size.value;

  fitCardToPage();
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
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");

  servingsLabelInput.value = "Servings";
  timeLabelInput.value = "Time";
  ingredientsLabelInput.value = "Ingredients";
  instructionsLabelInput.value = "Instructions";
  notesLabelInput.value = "Notes";

  fileInput.value = "";
  previewImage.src = "";
  previewImage.style.display = "none";
  placeholder.style.display = "block";

  update();
}

update();
