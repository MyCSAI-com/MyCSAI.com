// Selectors
const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

// API Key (ensure to manage this securely in production)
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; 
let isImageGenerating = false;

// Function to update the image cards with generated images
const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;
    
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `image-${new Date().getTime()}.jpg`);
    };
  });
};

// Function to generate AI images
const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

    if (!response.ok) throw new Error("The server is currently busy due to high user activity. Please try again later. Thank you for your patience!");

    const { data } = await response.json(); 
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

// Handle image generation on form submission
const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  const userPrompt = e.target[0].value; // Get the user input from the form
  const userImgQuantity = parseInt(e.target[1].value); // Parse quantity to integer
  
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  // Create loading image cards while generating images
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
    `<div class="img-card loading">
      <img src="images/loader.svg" alt="AI generated image">
      <a class="download-btn" href="#">
        <img src="images/download.svg" alt="download icon">
      </a>
    </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup; // Insert loading cards
  generateAiImages(userPrompt, userImgQuantity); // Generate images
};

// Add event listener to the form
generateForm.addEventListener("submit", handleImageGeneration);

