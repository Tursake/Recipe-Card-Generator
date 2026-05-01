const inputs = document.querySelectorAll("input, textarea, select");
const fileInput = document.getElementById("imageUpload");
const previewImage = document.getElementById("pImage");

inputs.forEach(i => i.addEventListener("input", update));

/* IMAGE UPLOAD */
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    previewImage.src = e.target.result;
    previewImage.style.display = "block";
  };
  reader.readAsDataURL(file);
});

/* PARSE SUB-HEADINGS */
function parseSections(text) {
  const lines = text.split("\n");
  let html = "";
  let listOpen = false;

  lines.forEach(line => {
    if (line.startsWith("## ")) {
      if (listOpen) { html += "</ul>"; listOpen=false; }
      html += `<h3>${line.replace("## ","")}</h3>`;
    } else if (line.trim() !== "") {
      if (!listOpen) { html += "<ul>"; listOpen=true; }
      html += `<li>${line}</li>`;
    }
  });

  if (listOpen) html += "</ul>";
  return html;
}

/* LIVE UPDATE */
function update() {
  pTitle.innerText = title.value;
  pMeta.innerText = `${servings.value} servings • ${time.value}`;

  pIngredients.innerHTML = parseSections(ingredients.value);
  pInstructions.innerHTML = parseSections(instructions.value);
  pNotes.innerText = notes.value;

  card.className = "card " + size.value;
}

/* CLEAR EVERYTHING */
function clearAll() {
  // clear text inputs
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");

  // clear file input properly
  fileInput.value = "";

  // remove preview image
  previewImage.src = "";
  previewImage.style.display = "none";

  update();
}

update();
