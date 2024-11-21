// Initialize Socket.IO client
const socket = io();

socket.on('connect', function() {
    console.log('Socket.IO connected successfully');
});
// Show notifications for file upload and deletion
function showNotification(message, type) {
    let notification;
    if (type === 'delete') {
        notification = document.getElementById('notification-for_delete');
    } else {
        notification = document.getElementById('notification-for_upload');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification-for_upload';
            document.body.appendChild(notification);
        }
    }
    notification.textContent = message;
    notification.style.opacity = '1';
    setTimeout(() => { notification.style.opacity = '0'; }, 3000);
}

// Handle file uploads
document.getElementById('upload-form').addEventListener('submit', e => {
    e.preventDefault(); // Prevent default form submission
    const file = document.getElementById('file-input').files[0]; // Get the selected file
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                console.log('File uploaded successfully');
                showNotification(`${file.name} uploaded successfully!`, 'success');
            } else {
                console.error('Failed to upload file');
                showNotification('Failed to upload file. Please try again.', 'upload');
            }
        });
    } else {
        const notification = showNotification('Please select a file to upload.', 'error');

    }
});

// Listen for file upload events from the server
socket.on('fileUploaded', data => {
    const fileItem = document.createElement('li');
    fileItem.classList.add('file-item');
    fileItem.innerHTML = `
        <input type="checkbox" class="file-checkbox">
        <a href="${data.url}" target="_blank">${data.name}</a>
    `;
    document.getElementById('file-list-ul').appendChild(fileItem); // Add the file to the list
});

// Delete selected files
document.getElementById('delete-selected-btn').onclick = function () {
    const checkboxes = document.querySelectorAll('.file-checkbox');
    let notification = document.getElementById('notification-for_delete');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification-for_delete';
        document.body.appendChild(notification);
    }
    if (document.getElementById('file-list-ul').children.length === 0) {
        notification.textContent = "List is empty.";
        notification.style.backgroundColor = 'red';
        notification.style.opacity = '1';
        setTimeout(() => { notification.style.opacity = '0'; }, 3000);
        return;
    }
    let anyChecked = false;
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            anyChecked = true;
            checkbox.closest('li').remove(); // Remove the selected file
        }
    });
    notification.textContent = anyChecked ? "Selected files deleted successfully." : "No files selected for deletion.";
    notification.style.backgroundColor = anyChecked ? "#2ecc71" : "#df362a";
    notification.style.opacity = '1';
    setTimeout(() => { notification.style.opacity = '0'; }, 3000);
};

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

// Open the whiteboard in a new window
document.getElementById('open-whiteboard-btn').onclick = function () {
    const whiteboardWindow = window.open('/whiteboard', '_blank');
    whiteboardWindow.focus();
};


// document.getElementById("go-to-quiz-btn").addEventListener("click", function() {
//     window.location.href = "{{ url_for('quizzes') }}"; // Redirect to the quiz page
// });

// Open the screen share in a new window
document.getElementById('open-screenshare-btn').onclick = function () {
    const screenshareWindow = window.open('/screenshare', '_blank');
    screenshareWindow.focus();
};

let roomCode = ''; // Global variable to store the room code

// Function to generate a unique room code
function generateRoomCode() {
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random code
    document.getElementById('generated-code').style.color = 'white';
    document.getElementById('generated-code').textContent = `Room Code: ${roomCode}`;
    socket.emit('create_room', roomCode); // Emit the room code to the server
}

// Join a chat room with the entered code
document.getElementById('join-room-btn').onclick = function () {
    roomCode = document.getElementById('join-room-code').value.trim();
    if (roomCode) {
        console.log(`Attempting to join room: ${roomCode}`);
        socket.emit('join_room', { room: roomCode, username: username }); // Emit join request to the server
        document.getElementById('generated-code').style.color = 'white';
        document.getElementById('generated-code').textContent = `Joining room: ${roomCode}`;
    } else {
        alert('Please enter a valid room code.');
    }
};

//Video
// Constants and Variables
const recentKeywords = {}; // Stores keywords with their frequency
let currentTopic = ''; // The current trending topic
const API_KEY = ''; // Replace with your YouTube API key

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


// Generate a random room ID for video calls
function generateRoomId() {
    return Math.random().toString(36).substring(2, 10);
}

// Host a video call
document.getElementById('host-call-btn').addEventListener('click', function() {
    const roomId = generateRoomId();
    const videoCallUrl = `https://meet.jit.si/${roomId}`;
    window.open(videoCallUrl, '_blank', 'width=800,height=600'); // Open video call in a new window
    alert(`Share this Room ID with participants to join: ${roomId}`);
});

// Join a video call
document.getElementById('join-call-btn').addEventListener('click', function() {
    const roomId = prompt("Enter the Room ID to join the video call:");
    if (roomId) {
        const videoCallUrl = `https://meet.jit.si/${roomId}`;
        window.open(videoCallUrl, '_blank', 'width=800,height=600'); // Open video call in a new window
    }
});


// Take a screenshot of the chat
document.getElementById('screenshot-btn').onclick = function () {
    html2canvas(document.getElementById('chat-messages')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'chat-screenshot.png';
        link.href = canvas.toDataURL(); // Create a downloadable link for the screenshot
        link.click();
    }).catch(error => {
        console.error('Screenshot failed:', error);
    });
};

// Backup chat history
document.getElementById('chat-back-btn')?.addEventListener('click', function () {
    const date = new Date();
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();
    const timestamp = `${day}-${month}-${year}`;
    const chatMessages = document.getElementById('chat-messages')?.innerHTML;
    if (chatMessages) {
        const chatMessagesWithoutEditButtons = chatMessages.replace(/<button.*?<\/button>/gs, '');
        const blob = new Blob([`<h2>Chat Backup - ${timestamp}</h2>\n${chatMessagesWithoutEditButtons}`], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `chat_backup_${timestamp.replace(/ /g, '_')}.html`;
        link.click();
    }
});

// Screen sharing
document.addEventListener("DOMContentLoaded", function () {
    const screenShareBtn = document.getElementById("open-screenshare-btn");
    const joinScreenShareBtn = document.getElementById("join-screenshare-btn");
    const videoElement = document.getElementById("screenshare-video");
    const socket = io.connect(window.location.href);
    let currentRoom = null;
    let localStream = null;
    let peerConnection = null;

    // STUN servers configuration
    const iceServers = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

    // Function to start screen sharing (Laptop A)
    async function startScreenSharing() {
        try {
            localStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const user = prompt("Enter your name");
            const room = Math.random().toString(36).substring(2, 15);
            socket.emit('start_screen_share', { user, room });
            videoElement.srcObject = localStream;
            initWebRTC(room);
            currentRoom = room;
        } catch (err) {
            console.error("Error starting screen sharing:", err);
        }
    }

    // Initialize WebRTC connection
    function initWebRTC(room) {
        peerConnection = new RTCPeerConnection(iceServers);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('webrtc_ice_candidate', { room, candidate: event.candidate });
            }
        };

        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                socket.emit('webrtc_offer', { room, offer: peerConnection.localDescription });
            });
    }

    // Handle 'notify_screen_share' event when another user starts screen sharing
    socket.on('notify_screen_share', function (data) {
        currentRoom = data.room;
        console.log(`${data.user} started screen sharing in room: ${data.room}`);
    });

    // Join an existing screen share (Laptop B)
    joinScreenShareBtn.addEventListener("click", function () {
        if (currentRoom) {
            socket.emit('join_screen_share', { user: prompt("Enter your name"), room: currentRoom });
        } else {
            console.error("No active screen share to join.");
        }
    });

    // Handle incoming WebRTC offer (Laptop B)
    socket.on('webrtc_offer', function (data) {
        peerConnection = new RTCPeerConnection(iceServers);
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('webrtc_ice_candidate', { room: data.room, candidate: event.candidate });
            }
        };

        peerConnection.ontrack = event => {
            videoElement.srcObject = event.streams[0];
        };

        peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
            .then(() => peerConnection.createAnswer())
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
                socket.emit('webrtc_answer', { room: data.room, answer: peerConnection.localDescription });
            });
    });

    // Handle incoming WebRTC answer (Laptop A)
    socket.on('webrtc_answer', function (data) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    // Handle ICE candidate
    socket.on('webrtc_ice_candidate', function (data) {
        const candidate = new RTCIceCandidate(data.candidate);
        peerConnection.addIceCandidate(candidate).catch(err => {
            console.error("Error adding received ICE candidate:", err);
        });
    });

    // Start screen sharing (Laptop A)
    screenShareBtn.addEventListener("click", startScreenSharing);
});

//AI BOT

function openAIChat() {
    const streamlitAppUrl = "http://localhost:8501";
    window.open(streamlitAppUrl, "_blank");
}



document.addEventListener('DOMContentLoaded', function () {
    const tour = new Shepherd.Tour({
        defaults: {
            classes: 'shepherd-theme-arrows',
            scrollTo: true
        }
    });

    
    //Welcome message
    tour.addStep({
        id: 'welcome',
        text: 'Welcome to the Chat Room! Let me show you around.',
        attachTo: {
            element: '.welcome-title',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Skip',
                action: tour.complete
            },
            {
                text: 'Next',
                action: tour.next
            }
        ]
    });

    //Generate Room Code
    tour.addStep({
        id: 'generate-code',
        text: 'You can generate a room code here.',
        attachTo: {
            element: '#generate-code-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Join a Room
    tour.addStep({
        id: 'join-room',
        text: 'Enter a room code here to join a chat room.',
        attachTo: {
            element: '#join-room-code',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Chat Messages
    tour.addStep({
        id: 'chat-messages',
        text: 'This is where the chat messages will appear.',
        attachTo: {
            element: '#chat-messages',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Chat Input
    tour.addStep({
        id: 'message-input',
        text: 'Type your message here.',
        attachTo: {
            element: '#message-input',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Send Button
    tour.addStep({
        id: 'send-button',
        text: 'Click this button to send your message.',
        attachTo: {
            element: '#send-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Video Call Buttons
    tour.addStep({
        id: 'videocall-buttons',
        text: 'Here are the options to host a video call.',
        attachTo: {
            element: '#host-call-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });
    tour.addStep({
        id: 'videocall-buttons',
        text: 'Here are the options to join a video call.',
        attachTo: {
            element: '#join-call-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Screenshot Button
    tour.addStep({
        id: 'screenshot-btn',
        text: 'Click this button to take a screenshot of the chat.',
        attachTo: {
            element: '#screenshot-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    // Whiteboard Button
    tour.addStep({
        id: 'whiteboard-btn',
        text: 'Click this button to open a whiteboard session.',
        attachTo: {
            element: '#open-whiteboard-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Screen Share Buttons
    tour.addStep({
        id: 'screenshare-btn',
        text: 'Click these buttons to start a screen sharing session.',
        attachTo: {
            element: '#open-screenshare-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    tour.addStep({
        id: 'screenshare-btn',
        text: 'Click these buttons to join a screen sharing session.',
        attachTo: {
            element: '#join-screenshare-btn',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //File Upload Section
    tour.addStep({
        id: 'file-section',
        text: 'You can upload and manage your files here.',
        attachTo: {
            element: '.file-section',
            on: 'top'
        },
        buttons: [
            {
                text: 'Next',
                action: tour.next
            },
            {
                text: 'Skip',
                action: tour.complete
            }
        ]
    });

    //Backup Chat Button
    tour.addStep({
        id: 'backup-btn',
        text: 'Click this button to backup your chat history.',
        attachTo: {
            element: '#backup-btn.mt-3',
            on: 'top'
        },
        buttons: [
            {
                text: 'Done',
                action: tour.complete
            }
        ]
    });


        // Start the tourstart-tour-btn
        document.getElementById('start-tour-btn').addEventListener('click', function() {
            tour.start();
        });
        
                tour.start();
            });