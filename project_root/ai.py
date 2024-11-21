from dotenv import load_dotenv
import streamlit as st
import os
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure the generative AI model
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    st.error("API key not found. Please set GOOGLE_API_KEY in your .env file.")
    st.stop()

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-pro")
chat = model.start_chat(history=[])

def get_gemini_response(question):
    """Send the question to the model and include the entire conversation history."""
    try:
        # Send the message to the model, the model will handle the history automatically
        response = chat.send_message(question, stream=True)
        return response
    except Exception as e:
        st.error(f"Error: {e}")
        return None

# Streamlit app configuration
st.set_page_config(page_title="Chat with AI", page_icon=":robot_face:", layout="centered")

# Add custom styling
st.markdown("""
    <style>
        .header {
            text-align: center;
            font-size: 2rem;
            color: #333;
            margin-top: 50px;
        }
        .chat-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .chat-bubble-user {
            background-color: #007980;
            padding: 12px;
            border-radius: 15px;
            margin-bottom: 10px;
            max-width: 80%;
            word-wrap: break-word;
        }
        .chat-bubble-bot {
            background-color: #8a464c;
            padding: 12px;
            border-radius: 15px;
            margin-bottom: 10px;
            max-width: 80%;
            word-wrap: break-word;
        }
        .clear-button {
            margin-top: 20px;
            text-align: center;
            background-color: #f1f1f1;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
        }
        .clear-button:hover {
            background-color: #f8f8f8;
        }
        .stButton>button {
            width: 100%;
        }
    </style>
""", unsafe_allow_html=True)

# App header
st.markdown('<div class="header">🤖 Chat with AI</div>', unsafe_allow_html=True)

# Initialize chat history in session state
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Sidebar: Clear History Button
with st.sidebar:
    st.title("App Info")
    st.write("""
    This app lets you interact with a generative AI model (Gemini Pro). 
    Type a question, and the AI will generate a response.
    """)
    if st.button("Clear History"):
        st.session_state.chat_history = []

# Chat input form with Submit button
with st.form(key="chat_form", clear_on_submit=True):
    input_text = st.text_area("Ask the AI:", key="input", placeholder="Type your message here...", height=100)
    submit = st.form_submit_button("Send")

def detect_language(input_text):
    """Detect the language based on keywords in the input text."""
    if "def" in input_text or "import" in input_text or "lambda" in input_text:
        return "python"  # Python-specific keywords
    elif "function" in input_text or "const" in input_text or "let" in input_text:
        return "javascript"  # JavaScript-specific keywords
    elif "class" in input_text or "interface" in input_text or "public" in input_text:
        return "java"  # Java-specific keywords
    elif "<html>" in input_text or "<body>" in input_text or "div" in input_text:
        return "html"  # HTML-specific tags
    elif "SELECT" in input_text or "FROM" in input_text or "WHERE" in input_text:
        return "sql"  # SQL-specific keywords
    else:
        return "plaintext"  # Default to plaintext if no code-like keywords are found

if submit and input_text:
    with st.spinner("Generating response..."):
        # Get the response from the Gemini model
        response = get_gemini_response(input_text)
    
    if response:
        # Append the user's message to the history
        st.session_state.chat_history.append(("You", input_text))
        
        # Collect all response chunks into a single text block
        response_text = "".join([chunk.text for chunk in response])

        # Detect the language based on the input
        detected_language = detect_language(input_text)

        # Display the response based on detected language
        st.subheader("Response was:")
        if detected_language == "plaintext":
            st.write(response_text)
        else:
            st.code(response_text, language=detected_language)  # Use the detected language for highlighting
        
        # Append the bot's response to the history
        st.session_state.chat_history.append(("Bot", response_text))

# Display chat history in bubbles
st.subheader("Chat History")
for role, text in st.session_state['chat_history']:
    if role == "You":
        st.markdown(f'<div class="chat-bubble-user">{text}</div>', unsafe_allow_html=True)
    else:
        st.markdown(f'<div class="chat-bubble-bot">{text}</div>', unsafe_allow_html=True)

# Footer
st.markdown("<div style='text-align: center; margin-top: 30px; color: gray;'>Powered by Gemini Pro | Streamlit Tarun Mishra</div>", unsafe_allow_html=True)
