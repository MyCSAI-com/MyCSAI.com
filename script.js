// Selectors
const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");
const notificationBar = document.createElement("div");
notificationBar.className = "notification-bar";
document.body.appendChild(notificationBar);

// API Key (ensure to manage this securely in production)
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"; 
let isImageGenerating = false;

// Function to show notification
const showNotification = (message) => {
    notificationBar.textContent = message; // Set the message
    notificationBar.style.display = 'block'; // Show the notification bar
    notificationBar.style.backgroundColor = '#f8d7da'; // Light red background
    notificationBar.style.color = '#721c24'; // Dark red text
    notificationBar.style.padding = '10px';
    notificationBar.style.borderRadius = '5px';
    notificationBar.style.textAlign = 'center';
    notificationBar.style.margin = '20px auto';
    notificationBar.style.maxWidth = '800px';
    notificationBar.style.position = 'relative';
    notificationBar.style.animation = 'slideIn 0.5s forwards';
    
    setTimeout(() => {
        notificationBar.style.display = 'none'; // Hide after 5 seconds
    }, 5000);
};

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

    if (!response.ok) {
      showNotification("The server is currently busy due to high user activity. Please try again later. Thank you for your patience!"); // Show notification
      throw new Error("Server busy");
    }

    const { data } = await response.json(); 
    updateImageCard([...data]);
  } catch (error) {
    // Handling error already done in showNotification function
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

// CSS Animation for notification bar
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideIn {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
.notification-bar {
    display: none; /* Initially hidden */
}
`;
document.head.appendChild(style);


