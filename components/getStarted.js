
document.addEventListener("DOMContentLoaded", () => {
    const typingForm = document.querySelector(".typing-form");
    const chatList = document.querySelector(".chat-list");
    const toggleThemeButton = document.querySelector("#toggle-theme-button");
    const deletechatbutton = document.querySelector("#delete-chat-button");


    if (!typingForm) {
        console.error("Element with class 'typing-form' not found.");
        return;
    }

    let userMessage = null;
    //API configuration
    const API_KEY = `AIzaSyAK3fw8IpBkmmKTIqYAA7EvPrUUXFeyWk8`;
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    const loadLocalStorageData = () => {
        const savedChats = localStorage.getItem("savedChats");
        const isLightMode = (localStorage.getItem("themeColor") === "light_mode");
      //apply stored theme color
        document.body.classList.toggle("light_mode", isLightMode);
        toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

        chatList.innerHTML = savedChats || "";
        document.body.classList.toggle("hide-header",savedChats);
    }

 loadLocalStorageData();

    const createMessageElement = (content, ...classes) => {
         const div = document.createElement ("div");
         div.classList.add("message", ...classes);
         div.innerHTML = content;
         return div;
    }
    const showTypingEffect = (text, textElement) => {
        const words = text.split(' ');
           let currentWordIndex = 0;
        const typingInterval = setInterval(() => {
          textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];

          // all words are displayed
          if(currentWordIndex === words.length) {
            clearInterval(typingInterval);
            localStorage.setItem("savedChats", chatList.innerHTML);
          }
        },
         75);
    }   

    const generateAPIResponse = async (incomingMessageDiv) => { 
        const textElement = incomingMessageDiv.querySelector(".text"); // text element


        try {
                   const response = await fetch(API_URL,{
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts:[{ text:userMessage }]
                        }]
                    })
                   });
                   const data = await response.json();
                   //api response
                   const apiResponse = data?.candidates[0].content.parts[0].text;
                   showTypingEffect(apiResponse,textElement);
                   
                  
        }catch(error) {
            console.log(error);
        } finally {
            incomingMessageDiv.classList.remove("loading");
        }

    }

    // show animation whilewaiting for the api
    const showLoadingAnimation = () => {
        const html = `<div class="message-content">
               <img src="./images2/img0.png" alt="etsbot image" class="Avatar">
               <p class="text">  </p>
               <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
               </div>
            </div>
            <span onclick = "copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

     const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
     chatList.appendChild(incomingMessageDiv);

     generateAPIResponse(incomingMessageDiv);
    }
    //copy message
    const copyMessage = (copyIcon) => {
        const messageText = copyIcon.parentElement.querySelector(".text");

        naviagtor.clipboard.writeText(messageText);
        copyIcon.innerText = "done"; // show tick button
        setTimeout(() => copyIcon.innerText = "content_copy", 1000);//revert icon

    }
     //handle sending outgoing chat message
    const handleOutgoingChat = () => {
        userMessage = typingForm.querySelector(".typing-input").value.trim();
        if (!userMessage) return; // exit if no message

       const html = `<div class="message-content">
            <img src="./images2/img3.webp" alt="User image" class="Avatar">
            <p class="text"></p>
         </div>`;

         const outgoingMessageDiv = createMessageElement(html, "outgoing");
         outgoingMessageDiv.querySelector(".text").innerText = userMessage;
         chatList.appendChild(outgoingMessageDiv);

         typingForm.reset(); // clear input
         document.body.classList.add("hide-header"); //hide the header
         setTimeout(showLoadingAnimation, 500); // loading animation after a delay
    }

    toggleThemeButton.addEventListener("click", () => {
      const isLightMode = document.body.classList.toggle("light_mode");
      localStorage.setItem("themecolor",isLightMode ? "light_mode" : "dark_mode");
      toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    });

    deletechatbutton.addEventListener("click",() => {
        if (confirm("Are you sure you want to delete all message?")) {
            localStorage.removeItem("savedChats");
            loadLocalStorageData();
        }
    });
    

    // Prevent default form submission and handle outgoing chat
    typingForm.addEventListener("submit", (e) => {
        e.preventDefault();

        handleOutgoingChat();
    });
});
