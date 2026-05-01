document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const required = [
    "imageUpload", "imageWrapper", "imagePlaceholder", "card",
    "title", "servings", "time", "ingredients", "instructions", "notes",
    "servingsLabel", "timeLabel", "ingredientsLabel", "instructionsLabel", "notesLabel",
    "pTitle", "pServingsLabel", "pTimeLabel", "pIngredientsLabel", "pInstructionsLabel", "pNotesLabel",
    "pServings", "pTime", "pIngredients", "pInstructions", "pNotes",
    "pdfFiles"
  ];

  const missing = required.filter(id => !$(id));

  if (missing.length) {
    console.error("Missing HTML elements:", missing);
    alert("Missing HTML elements: " + missing.join(", "));
    return;
  }

  const fileInput = $("imageUpload");
  const imageWrapper = $("imageWrapper");
  const placeholder = $("imagePlaceholder");
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
      imageWrapper.style.backgroundImage = `url("${event.target.result}")`;
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
    imageWrapper.style.backgroundImage = "";
    placeholder.style.display = "block";

    update();
  };

  window.downloadPDF = async function () {
    if (!window.html2canvas || !window.jspdf) {
      alert("PDF export libraries did not load. Check your internet connection.");
      return;
    }

    const { jsPDF } = window.jspdf;

    const originalBoxShadow = card.style.boxShadow;
    card.style.boxShadow = "none";

    await document.fonts.ready;
    fitCardToPage();

    await new Promise(resolve => requestAnimationFrame(resolve));

    const canvas = await html2canvas(card, {
      scale: 2,
      width: card.offsetWidth,
      height: card.offsetHeight,
      backgroundColor: "#ffffff",
      useCORS: true
    });

    card.style.boxShadow = originalBoxShadow;

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true
    });

    pdf.addImage(imgData, "PNG", 0, 0, 595.28, 841.89);
    pdf.save("recipe-card.pdf");
  };

  window.mergePdfsTwoPerPage = async function () {
    const input = $("pdfFiles");
    const files = Array.from(input.files);

    if (!files.length) {
      alert("Please select at least one PDF file.");
      return;
    }

    if (!window.PDFLib) {
      alert("PDF library did not load. Check your internet connection or host pdf-lib locally.");
      return;
    }

    const { PDFDocument } = PDFLib;
    const outputPdf = await PDFDocument.create();

    const a4LandscapeWidth = 841.89;
    const a4LandscapeHeight = 595.28;
    const slotWidth = a4LandscapeWidth / 2;
    const slotHeight = a4LandscapeHeight;

    const pagesToPlace = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const pageIndexes = sourcePdf.getPageIndices();
      const embeddedPages = await outputPdf.embedPdf(bytes, pageIndexes);
      pagesToPlace.push(...embeddedPages);
    }

    for (let i = 0; i < pagesToPlace.length; i += 2) {
      const page = outputPdf.addPage([a4LandscapeWidth, a4LandscapeHeight]);

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
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  function drawEmbeddedPage(page, embeddedPage, x, y, slotWidth, slotHeight) {
    const scale = Math.min(
      slotWidth / embeddedPage.width,
      slotHeight / embeddedPage.height
    );

    const width = embeddedPage.width * scale;
    const height = embeddedPage.height * scale;

    const offsetX = x + (slotWidth - width) / 2;
    const offsetY = y + (slotHeight - height) / 2;

    page.drawPage(embeddedPage, {
      x: offsetX,
      y: offsetY,
      width,
      height
    });
  }

  update();
});
