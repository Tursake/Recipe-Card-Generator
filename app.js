const inputs = document.querySelectorAll("input, textarea, select");
inputs.forEach(i => i.addEventListener("input", update));

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
      html += `<h3>${line.replace("## ", "")}</h3>`;
    } else if (line.trim() !== "") {
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }
      html += `<li>${line}</li>`;
    }
  });

  if (listOpen) html += "</ul>";
  return html;
}

function update() {
  document.getElementById("pTitle").innerText =
    document.getElementById("title").value;

  document.getElementById("pMeta").innerText =
    `${document.getElementById("servings").value} servings • ${document.getElementById("time").value}`;

  document.getElementById("pIngredients").innerHTML =
    parseSections(document.getElementById("ingredients").value);

  document.getElementById("pInstructions").innerHTML =
    parseSections(document.getElementById("instructions").value);

  const size = document.getElementById("size").value;
  document.getElementById("card").className = "card " + size;
}

update();
