document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const required = [
    "imageUpload", "pImage", "imagePlaceholder", "card",
    "title", "servings", "time", "ingredients", "instructions", "notes",
    "servingsLabel", "timeLabel", "ingredientsLabel", "instructionsLabel", "notesLabel",
    "pTitle", "pServingsLabel", "pTimeLabel", "pIngredientsLabel", "pInstructionsLabel", "pNotesLabel",
    "pServings", "pTime", "pIngredients", "pInstructions", "pNotes"
  ];

  const missing = required.filter(id => !$(id));

  if (missing.length) {
    console.error("Missing HTML elements:", missing);
    alert("Missing HTML elements: " + missing.join(", "));
    return;
  }

  const fileInput = $("imageUpload");
  const previewImage = $("pImage");
  const placeholder = $("imagePlaceholder");
  const imageWrapper = document.querySelector(".imageWrapper");
  const card = $("card");

  const titleInput = $("title");
  const servingsInput = $("servings");
  const timeInput = $("time");
  const ingredientsInput = $("ingredients");
  const instructionsInput = $("instructions");
  const notesInput = $("notes");

  document.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", update);
  });

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

        html += `<h3>${escapeHtml(trimmed.replace("## ", ""))}</h3>`;
      } else if (trimmed !== "") {
        if (!listOpen) {
          html += "<ul>";
          listOpen = true;
        }

        html += `<li>${escapeHtml(trimmed)}</li>`;
      }
    });

    if (listOpen) html += "</ul>";
    return html;
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function update() {
    $("pTitle").innerText = titleInput.value;

    $("pServingsLabel").innerText = $("servingsLabel").innerText;
    $("pTimeLabel").innerText = $("timeLabel").innerText;
    $("pIngredientsLabel").innerText = $("ingredientsLabel").innerText;
    $("pInstructionsLabel").innerText = $("instructionsLabel").innerText;
    $("pNotesLabel").innerText = $("notesLabel").innerText;

    $("pServings").innerText = servingsInput.value;
    $("pTime").innerText = timeInput.value;

    $("pIngredients").innerHTML = parseSections(ingredientsInput.value);
    $("pInstructions").innerHTML = parseSections(instructionsInput.value);
    $("pNotes").innerText = notesInput.value;

    fitCardToPage();
  }

  window.editLabel = function (id) {
    const label = $(id);
    const newText = prompt("Edit label:", label.innerText);

    if (newText !== null && newText.trim() !== "") {
      label.innerText = newText.trim();
      update();
    }
  };

  function fitCardToPage() {
    const maxImageHeight = 300;
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

  window.clearAll = function () {
    titleInput.value = "";
    servingsInput.value = "";
    timeInput.value = "";
    ingredientsInput.value = "";
    instructionsInput.value = "";
    notesInput.value = "";

    $("servingsLabel").innerText = "Servings";
    $("timeLabel").innerText = "Time";
    $("ingredientsLabel").innerText = "Ingredients";
    $("instructionsLabel").innerText = "Instructions";
    $("notesLabel").innerText = "Notes";

    fileInput.value = "";
    previewImage.src = "";
    previewImage.style.display = "none";
    placeholder.style.display = "block";

    update();
  };

  window.mergePdfsTwoPerPage = async function () {
    const input = $("pdfFiles");
    const files = Array.from(input.files);

    if (!files.length) {
      alert("Please select at least one PDF file.");
      return;
    }

    if (!window.PDFLib) {
      alert("PDF library did not load.");
      return;
    }

    const { PDFDocument } = PDFLib;
    const outputPdf = await PDFDocument.create();

    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const slotWidth = pageWidth / 2;
    const slotHeight = pageHeight;

    const pagesToPlace = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const pageIndexes = sourcePdf.getPageIndices();
      const embeddedPages = await outputPdf.embedPdf(bytes, pageIndexes);
      pagesToPlace.push(...embeddedPages);
    }

    for (let i = 0; i < pagesToPlace.length; i += 2) {
      const page = outputPdf.addPage([pageWidth, pageHeight]);

      drawEmbeddedPage(page, pagesToPlace[i], 0, 0, slotWidth, slotHeight);

      if (pagesToPlace[i + 1]) {
        drawEmbeddedPage(page, pagesToPlace[i + 1], slotWidth, 0, slotWidth, slotHeight);
      }
    }

    const mergedBytes = await outputPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "recipes-two-per-a4.pdf";
    link.click();

    URL.revokeObjectURL(url);
  };

  function drawEmbeddedPage(page, embeddedPage, x, y, slotWidth, slotHeight) {
    const scale = Math.min(
      slotWidth / embeddedPage.width,
      slotHeight / embeddedPage.height
    );

    const width = embeddedPage.width * scale;
    const height = embeddedPage.height * scale;

    page.drawPage(embeddedPage, {
      x: x + (slotWidth - width) / 2,
      y: y + (slotHeight - height) / 2,
      width,
      height
    });
  }

  update();
});
