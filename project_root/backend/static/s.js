// Initialize Socket.IO client
const socket = io();

socket.on('connect', function() {
    console.log('Socket.IO connected successfully');
});

const username = prompt("Enter your username:", "Guest");

// Function to simulate a user joining the chat
function joinChat(username) {
    const chatMessages = document.getElementById('chat-messages');
    const joinMessage = document.createElement('div');
    joinMessage.classList.add('chat-message', 'other');
    joinMessage.innerHTML = `<strong>${username}</strong> has joined the chat<small>${new Date().toLocaleTimeString()}</small>`;
    chatMessages.appendChild(joinMessage); // Append the join message
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom

    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = `${username} joined the chat`;
    document.body.appendChild(notification);
    notification.classList.add('fade-in'); // Fade-in effect
    setTimeout(() => { notification.classList.add('fade-out'); }, 3000); // Fade-out effect
    setTimeout(() => { notification.remove(); }, 4000); // Remove after fade-out
}
joinChat(username);

// Send message on button click or Enter key
document.getElementById('send-btn').onclick = function () {
    const messageInput = document.getElementById('message-input');
    sendMessage(messageInput.value.trim());
};

document.getElementById('message-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        sendMessage(event.target.value.trim());
    }
});

// Define a list of bad words for censorship
const badWords = ["bc", "mc","drugs","smoking"]; // Add your bad words here
let showVideos = true; // Default is to show videos; controlled by a toggle

let searchType = 'sentence'; // Default search type
// Update search type based on user selection
document.querySelectorAll('input[name="searchType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        searchType = e.target.value;
    });
});

// Function to censor bad words in a message
function censorBadWords(message) {
    const regex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi'); // Regex to match bad words
    return message.replace(regex, '***');
}

// Function to track keywords with censored message
// List of common stop words to ignore
const stopWords = new Set(["the", "and", "is", "in", "at", "to", "a", "for", "on", "it", "of", "with", "as", "by"]);
const recentKeywords = {}; // Stores keywords with their frequency
let currentTopic = ''; // The current trending topic

// Function to track keywords with enhanced filtering
function trackKeywords(message) {
    message = censorBadWords(message); // Censor bad words before processing
    const words = message.toLowerCase().split(/\s+/); // Split message into words

    words.forEach(word => {
        // Filter out stop words, censored words (***), and short words
        if (!stopWords.has(word) && word !== "***" && word.length >= 3) {
            if (recentKeywords[word]) {
                recentKeywords[word]++;
            } else {
                recentKeywords[word] = 1;
            }
        }
    });

    // Find the most repeated keyword
    const trending = Object.entries(recentKeywords).filter(([word, count]) => count >= 2);
    console.log('Current keyword frequencies:', recentKeywords); // Debugging statement to see keyword frequencies

    // If there are trending topics, find the one with the highest frequency
    if (trending.length) {
        const highestTrend = trending.reduce((prev, current) => (prev[1] > current[1]) ? prev : current); // Find topic with highest frequency
        const [topic, count] = highestTrend; // Get the topic and its count
        console.log('Detected trending topics:', trending); // Debugging statement to see detected trending topics

        // Update only if the topic has changed and is not "***"
        if (topic !== currentTopic && topic !== "***") {
            currentTopic = topic; // Update the current topic
            console.log(`Trending topic changed to: ${currentTopic}`); // Debugging statement

            // Fetch videos only if showVideos is enabled and topic is not "***"
            if (showVideos) {
                fetchRelatedVideos(currentTopic);
            }
        } else {
            console.log('No change in trending topic or censored topic detected.'); // Debugging statement for no change
        }
    } else {
        console.log('No trending topic detected.'); // Debugging statement
    }
}

// Toggle video display option
document.getElementById('video-toggle').addEventListener('change', (e) => {
    showVideos = e.target.checked; // Update showVideos based on toggle
    if (!showVideos) {
        displayVideos([]); // Clear videos if toggled off
    }
});

// Function to fetch related videos using YouTube API
async function fetchRelatedVideos(query) {
    if (!showVideos) return;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
    
    console.log(`Fetching videos for: ${query}`); // Debugging statement
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(`Fetched videos for: ${query}`, data.items); // Debugging statement
        if (data.items.length) {
            displayVideos(data.items); // Display fetched videos
        } else {
            console.log(`No videos found for: ${query}`); // Debugging statement
            displayVideos([]); // Ensure the display is cleared
        }
    } catch (error) {
        console.error("Failed to fetch videos:", error);
    }
}

// Function to display videos in the sidebar
function displayVideos(videos) {
    const videoSidebar = document.getElementById('video-sidebar');
    videoSidebar.innerHTML = ''; // Clear existing videos

    if (videos.length === 0) {
        videoSidebar.innerHTML = '<p>No videos available.</p>'; // Optional: inform user when no videos are found
        return;
    }

    videos.forEach(video => {
        const videoDiv = document.createElement('div');
        videoDiv.classList.add('video-item');
        videoDiv.innerHTML = `
            <a href="https://www.youtube.com/watch?v=${video.id.videoId}" target="_blank">
                <img src="${video.snippet.thumbnails.default.url}" alt="${video.snippet.title}">
                <p>${video.snippet.title}</p>
            </a>
        `;
        videoSidebar.appendChild(videoDiv);
    });
}

// Function to send a message and track keywords
function sendMessage(message) {
    if (message.trim() !== '') {
        const censoredMessage = censorBadWords(message);
        trackKeywords(censoredMessage);

        const chatMessages = document.getElementById('chat-messages');
        const messageId = `msg-${Date.now()}`;
        
        if (chatMessages) {
            const newMessage = document.createElement('div');
            newMessage.classList.add('chat-message', 'user');
            newMessage.id = messageId;
            newMessage.innerHTML = `
                <strong>${username}</strong>: ${censoredMessage}
                <small class="float-end">${new Date().toLocaleTimeString()}</small>
                <button class="edit-btn btn btn-sm btn-outline-secondary ms-2">Edit</button>
                <button class="delete-btn btn btn-sm btn-outline-danger ms-2">Delete</button>
            `;
            chatMessages.appendChild(newMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
            socket.emit('send_message', { room: roomCode, message: censoredMessage, username: username, message_id: messageId });
            document.getElementById('message-input').value = ''; // Clear input field

            addMessageEventListeners();

            // Fetch related videos based on search type
            const query = (searchType === 'sentence') ? censoredMessage : extractKeywords(censoredMessage);
            if (showVideos) {
                fetchRelatedVideos(query);
            }
        }
    }
}

// Helper function to extract keywords from a sentence
function extractKeywords(sentence) {
    const words = sentence.split(/\s+/);
    // Filter out common words; customize this list as needed
    const commonWords = new Set(["the", "is", "at", "which", "on", "and", "a", "an", "of", "for", "to", "in"]);
    const keywords = words.filter(word => !commonWords.has(word.toLowerCase()));
    return keywords.join(" "); // Join keywords for search query
}

function addMessageEventListeners() {
    // Edit button functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const messageElement = event.target.closest('.chat-message');
            if (messageElement) {
                const messageText = messageElement.innerHTML.split('<small')[0].split(': ')[1].trim();
                const newText = prompt('Edit your message:', messageText);
                if (newText !== null) {
                    messageElement.innerHTML = `<strong>${username}</strong>: ${newText}
                        <small class="float-end">${new Date().toLocaleTimeString()}</small>
                        <span class="badge bg-warning ms-2">Edited</span>
                        <button class="edit-btn btn btn-sm btn-outline-secondary ms-2">Edit</button>
                        <button class="delete-btn btn btn-sm btn-outline-danger ms-2">Delete</button>`;
                    socket.emit('edit_message', {
                        room: roomCode,
                        message_id: messageElement.id,
                        new_message: newText
                    });
                    addMessageEventListeners();
                }
            }
        });
    });

    // Delete button functionality
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const messageElement = event.target.closest('.chat-message');
            if (messageElement) {
                if (confirm('Are you sure you want to delete this message?')) {
                    socket.emit('delete_message', {
                        room: roomCode,
                        message_id: messageElement.id
                    });
                    messageElement.classList.add('deleted');
                    messageElement.innerHTML = `<em>${username} deleted a message.</em>`;
                }
            }
        });
    });
}

// Call this function initially to add listeners to existing buttons
addMessageEventListeners();

socket.on('message_edited', function(data) {
    const messageElement = document.getElementById(data.message_id);
    if (messageElement) {
        messageElement.innerHTML = `<strong>${data.username}</strong>: ${data.new_message}
            <small class="float-end">${new Date().toLocaleTimeString()}</small>
            <span class="badge bg-warning ms-2">Edited</span>
            <button class="edit-btn btn btn-sm btn-outline-secondary ms-2">Edit</button>
            <button class="delete-btn btn btn-sm btn-outline-danger ms-2">Delete</button>`;
        addMessageEventListeners();  // Re-add event listeners to new buttons
    }
});

socket.on('message_deleted', function(data) {
    const messageElement = document.getElementById(data.message_id);
    if (messageElement) {
        messageElement.innerHTML = `<em>${data.username} deleted a message.</em>`;
        messageElement.classList.add('deleted');
    }
});

// Handle incoming messages
socket.on('receive_message', function(data) {
    console.log('Received message:', data); // Debugging line to check for duplicates
    const chatMessages = document.getElementById('chat-messages');

    // Check if the message already exists in the chat
    const existingMessages = Array.from(chatMessages.children);
    if (!existingMessages.some(msg => msg.textContent.includes(data.message))) {
        const newMessage = document.createElement('div');
        newMessage.classList.add('chat-message', 'other');
        newMessage.innerHTML = `<strong>${data.username}</strong>: ${data.message}<small class="float-end">${new Date().toLocaleTimeString()}</small>`;
        chatMessages.appendChild(newMessage); // Append the received message
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom

        // Save the new message to localStorage
        // saveMessagesToLocalStorage();
    }
});

function clearChatMessages() {
    const chatMessages = document.getElementById('chat-messages');
    const messages = chatMessages.children; // Get all message elements

    // Iterate through messages and remove only those that are not 'joined the chat' messages
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (!message.innerText.includes('has joined the chat')) {
            chatMessages.removeChild(message);
        }
    }
}