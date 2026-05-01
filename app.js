const inputs = document.querySelectorAll("input, textarea, select");
inputs.forEach(i => i.addEventListener("input", update));

document.getElementById("imageUpload").onchange = e => {
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("pImage").src = reader.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

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

function update() {
  pTitle.innerText = title.value;
  pMeta.innerText = `${servings.value} servings • ${time.value}`;

  pIngredients.innerHTML = parseSections(ingredients.value);
  pInstructions.innerHTML = parseSections(instructions.value);
  pNotes.innerText = notes.value;

  card.className = "card " + size.value;
}

function clearAll() {
  document.querySelectorAll("input, textarea").forEach(i=>i.value="");
  document.getElementById("pImage").src="";
  update();
}

function loadExample() {
  title.value="Summer Salad";
  servings.value="2";
  time.value="15 min";
  ingredients.value="## Salad\nLettuce\nTomatoes\nCucumber\n\n## Dressing\nOlive oil\nLemon juice";
  instructions.value="Mix everything.\nServe cold.";
  notes.value="Best fresh!";
  update();
}

update();
