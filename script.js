// Get references to the HTML elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 🛑🛑 CRITICAL SECURITY WARNING 🛑🛑
// DO NOT DEPLOY THIS CODE TO A LIVE WEBSITE. API KEYS MUST BE HIDDEN 
// ON A BACKEND SERVER (PROXY). This direct method is for local, educational testing ONLY.
const GEMINI_API_KEY = "AIzaSyAe5icHs3UxJhReC8ao6lwamwAYDd-hrRc"; // 👈 REPLACE THIS WITH YOUR REAL GEMINI KEY
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MODEL_NAME = "gemini-2.5-flash"; 


// --- Core Function: Display a message in the chat box ---
function displayMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
    
    // Set the content (allows simple formatting like **bold**)
    messageDiv.innerHTML = message;
    
    chatBox.appendChild(messageDiv);
    
    // Scroll to the bottom to show the newest message
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageDiv; 
}
// --- AI Logic: Call the Gemini API (FINAL CORRECTED JSON STRUCTURE) ---
async function getGeminiResponse(prompt) {
    // 1. Define the system instruction content
    const systemInstructionContent = "You are a strict but helpful study mentor named 'Study Buddy'. Keep your answers concise, informative, and end with a challenging question for the student to ensure they understood the material. Respond to the user's prompt.";

    // 2. Create the FINAL CORRECT request body (payload) - FIXES THE 400 ERROR
    const requestBody = {
        // The 'contents' array now includes the system instruction and the user prompt
        contents: [
            // System instruction goes first, formatted as a message object
            { 
                role: "user", // NOTE: The system instruction is sent as a special 'user' message with the instruction content
                parts: [{ text: systemInstructionContent }] 
            },
            // The actual user prompt follows
            { 
                role: "user", 
                parts: [{ text: prompt }] 
            }
        ],
        
        // System instruction is REMOVED from the root level.

        // Generation settings (like temperature) go under 'generationConfig'
        generationConfig: {
            temperature: 0.7 
        }
    };

    // ... (The rest of the function remains the same) ...
    try {
        // 3. Use 'fetch' to send the POST request. Key is passed as a query parameter.
        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        // 4. Handle network and API errors
        if (!response.ok) {
            const errorData = await response.json(); 
            console.error("API Response Error:", errorData);
            throw new Error(`API call failed: ${response.status} - ${errorData.error.message}`);
        }

        // 5. Parse the JSON response
        const data = await response.json();
        
        // 6. Extract the generated text
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return botResponse || "Study Buddy received no text response. Try asking a different question.";

    } catch (error) {
        console.error("Fetch/Gemini API Error:", error);
        return "Sorry, Study Buddy is currently unavailable. Please check the browser console for specific errors!";
    }
}
// ... (The rest of script.js below this function remains the same) ...




    

// --- Main Logic: Handles the user sending a message ---
async function sendMessage() {
    const userText = userInput.value.trim();
    
    if (userText === '') {
        return; 
    }

    // 1. Display user message and clear input
    displayMessage(userText, true);
    userInput.value = '';
    
    // 2. Show a 'thinking' indicator
    const thinkingMessage = displayMessage("Study Buddy is thinking...", false);

    try {
        // 3. Get the real AI response using the Gemini function
        const botResponse = await getGeminiResponse(userText);
        
        // 4. Remove the 'thinking' message
        chatBox.removeChild(thinkingMessage);
        
        // 5. Display the final AI response
        displayMessage(botResponse, false);

    } catch (error) {
        // Ensure the thinking message is removed even if the API failed
        if (chatBox.contains(thinkingMessage)) {
             chatBox.removeChild(thinkingMessage);
        }
        displayMessage("An irrecoverable error occurred. Please check the browser console for details.", false);
    }
}


// --- Event Listeners: Tell the script WHEN to run sendMessage ---
// 1. When the Send button is clicked
sendBtn.addEventListener('click', sendMessage);

// 2. When the 'Enter' key is pressed in the input field
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});