import os
from flask import Flask, request, send_from_directory, session, redirect, url_for, flash, render_template
from flask_socketio import SocketIO, emit, join_room
import mysql.connector


# This is the main file for the flask server. It sets up the app and routes
# for the different pages, and it also sets up the socketio connection
# for real-time communication between the client and server.

# These 3 lines of code are used to set up the Flask server and SocketIO
# connection. The SECRET_KEY is used to secure the session and cookies.
# The SocketIO object is used to create a real-time connection between the
# client and server.
app = Flask(__name__)
app.config['SECRET_KEY'] = 'ba06396ec4cbf0c69569d0677a2001b4bd706333ad8b241b6c447e8f8c3b3b6d'
socketio = SocketIO(app)

# MySQL Configuration
# This is a dictionary that stores the database configuration. It is
# used to create a new database connection in the get_db_connection
# function.
db_config = {
    'user': 'root',
    'password': 'Anshu@2024',
    'host': 'localhost',
    'database': 'Minor'
}
def get_db_connection():
    """Create a new database connection."""
    return mysql.connector.connect(**db_config)


@app.route('/')
def home():
    """Redirect to the login page."""
    return redirect(url_for('login_route'))

@app.route('/login', methods=['GET', 'POST'])
def login_route():
    """Handle login form submissions and redirect to the chat page.
    If the user is already logged in, redirect them to the chat page.
    If the user is not logged in, show the login form. If the form is
    submitted, check the credentials against the database. If they
    are valid, log the user in and redirect them to the chat page.
    If they are invalid, show an error message.
    """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Connect to MySQL and check credentials
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            session['username'] = username
            return redirect(url_for('chat'))
        else:
            flash('Invalid credentials, or register an account.', 'danger')
            return redirect(url_for('login_route'))
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    """Handle new user registration and redirect to the login page.
    
    If the username already exists, show an error message.
    If the username does not exist, add the new user to the database
    and show a success message.
    """
    username = request.form['username']
    password = request.form['password']
    
    # Check if the username already exists
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
    user = cursor.fetchone()
    
    if user:
        flash('Username already exists. Please choose another one.', 'danger')
    else:
        # Insert new user into the database
        cursor.execute('INSERT INTO users (username, password) VALUES (%s, %s)', (username, password))
        conn.commit()
        flash('Registration successful. Please log in.', 'success')
    
    cursor.close()
    conn.close()
    
    return redirect(url_for('login_route'))

@app.route('/chat')
def chat():
    
    # Handle chat page request.
    # If the user is not logged in, redirect them to the login page.
    # If the user is logged in, render the chat page template with the
    # username provided in the session.
    if 'username' not in session:
        return redirect(url_for('login_route'))
    return render_template('chat.html', username=session['username'])

@app.route('/upload', methods=['POST'])
def upload_file():
    
    # Handle file upload from the chat page.
    # If no file is selected, return a 400 error.
    # If a file is selected, save it to the uploads directory
    # and notify all connected clients about the new file upload.
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400

    if file:
        # Save the file to the uploads directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Notify all clients about the new file upload
        socketio.emit('fileUploaded', {
            'name': file.filename,
            'url': url_for('uploaded_file', filename=file.filename, _external=True)
        })

        return '', 200

# Directory where uploaded files will be saved
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Room management dictionary
rooms = {}  # A dictionary to store active rooms

@socketio.on('create_room')
def handle_create_room(room_code):
    
    # Handle 'create_room' event from the client.
    # When a user creates a new room, this function is called to
    # initialize the room and add the user to the room.
    rooms[room_code] = []  # Initialize the room
    join_room(room_code)
    print(f"Room {room_code} created.")
    # Notify all connected clients in the room that the room is created
    emit('receive_message', {'username': 'System', 'message': f"Room {room_code} created!"}, room=room_code)

@socketio.on('join_room')
def handle_join_room(data):
    
    # Handle 'join_room' event from the client.
    # When a user joins a room, this function is called to
    # add the user to the room and notify all connected clients
    # in the room that the user has joined.
    
    room_code = data['room']
    username = data['username']
    
    print(f"User {username} attempting to join room {room_code}")
    
    if room_code in rooms:
        join_room(room_code)
        rooms[room_code].append(username)
        print(f"{username} joined room {room_code}.")
        # Notify all connected clients in the room that the user has joined
        emit('receive_message', {'username': 'System', 'message': f"{username} has joined the room."}, room=room_code)
    else:
        # Notify the user that the room does not exist
        emit('receive_message', {'username': 'System', 'message': f"Room {room_code} does not exist."}, room=request.sid)

@socketio.on('send_message')
def handle_send_message(data):
    room_code = data['room']
    username = data['username']
    message = data['message']
    
    emit('receive_message', {'username': username, 'message': message}, room=room_code)

@socketio.on('deleteFile')
def handle_delete_file(file_name):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        emit('fileDeleted', file_name, broadcast=True)

@app.route('/whiteboard')
def whiteboard():
    return render_template('whiteboard.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

# Route for screen sharing page
# @app.route('/screenshare')
# def screenshare():
#     if 'username' not in session:
#         return redirect(url_for('login_route'))
#     return render_template('screenshare.html')

# @socketio.on('start_screen_share')
# def handle_screen_share(data):
#     room = data['room']
#     user = data['user']
    
#     # Join the room for screen sharing
#     join_room(room)
    
#     print(f"Screen sharing started by {user} in room {room}")
    
#     # Notify other users (except the sender) that screen sharing has started
#     emit('notify_screen_share', {'user': user, 'room': room}, room=room, include_self=False)

# @socketio.on('webrtc_offer')
# def handle_webrtc_offer(data):
#     room = data['room']
#     offer = data['offer']
    
#     # Send the offer to all clients in the room (except the sender)
#     emit('webrtc_offer', {'room': room, 'offer': offer}, room=room, include_self=False)

# @socketio.on('webrtc_answer')
# def handle_webrtc_answer(data):
#     room = data['room']
#     answer = data['answer']
    
#     # Send the answer back to the peer who initiated the offer
#     emit('webrtc_answer', {'room': room, 'answer': answer}, room=room)

# @socketio.on('webrtc_ice_candidate')
# def handle_webrtc_ice_candidate(data):
#     room = data['room']
#     candidate = data['candidate']
    
#     # Send ICE candidate to the peer
#     emit('webrtc_ice_candidate', {'room': room, 'candidate': candidate}, room=room)

@socketio.on('edit_message')
def handle_edit_message(data):
    room_code = data['room']
    message_id = data['message_id']
    new_message_content = data['new_message']
    
    # Broadcast the edited message to all clients in the room
    emit('message_edited', {
        'message_id': message_id,
        'new_message': new_message_content,
        'username': data['username']
    }, room=room_code, broadcast=True)  # Ensure broadcast=True is set

@socketio.on('delete_message')
def handle_delete_message(data):
    room_code = data['room']
    message_id = data['message_id']
    
    # Broadcast the deleted message to all clients in the room
    emit('message_deleted', {
        'message_id': message_id,
        'username': data['username']
    }, room=room_code, broadcast=True)  # Ensure broadcast=True is set

@app.route('/quizzes')
def quizzes():
    """Display all available quizzes."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # SQL query to get all quizzes
    cursor.execute('SELECT id, title, difficulty, num_questions FROM quizzes')
    quizzes = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    # Render the quizzes.html template with the quizzes data
    return render_template('quizzes.html', quizzes=quizzes)


@app.route('/quiz/<int:quiz_id>')
def take_quiz(quiz_id):
    """Display the quiz questions for a given quiz."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Get the quiz details
    cursor.execute('SELECT title FROM quizzes WHERE id = %s', (quiz_id,))
    quiz = cursor.fetchone()
    
    # Get the questions for this quiz
    cursor.execute('SELECT * FROM questions WHERE quiz_id = %s', (quiz_id,))
    questions = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    # Render the take_quiz.html template with the quiz and its questions
    return render_template('take_quiz.html', quiz=quiz, questions=questions, quiz_id=quiz_id)


@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    quiz_id = request.form['quiz_id']
    
    # Fetch correct answers from the database
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT id, correct_option FROM questions WHERE quiz_id = %s', (quiz_id,))
    correct_answers = cursor.fetchall()
    cursor.close()

    # Compare user's answers with the correct answers
    score = 0
    total_questions = len(correct_answers)

    for question in correct_answers:
        question_id = question['id']
        user_answer = request.form.get(f'answers[{question_id}]')  # Get user's answer for the question
        if user_answer == question['correct_option']:  # Compare with correct option
            score += 1

    percentage = (score / total_questions) * 100 if total_questions > 0 else 0

    # Render the results page
    return render_template('submit_quiz.html', score=score, total_questions=total_questions, percentage=percentage, quiz_id=quiz_id)


@app.route('/progress')
def view_progress():
    """Display the user's progress for all quizzes."""
    if 'username' not in session:
        return redirect(url_for('login_route'))

    username = session['username']

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get the user ID from the username
    cursor.execute('SELECT id FROM users WHERE username = %s', (username,))
    user = cursor.fetchone()
    user_id = user['id']

    # Fetch all quiz results for the logged-in user
    cursor.execute("""
        SELECT q.title, r.score
        FROM quiz_results r
        JOIN quizzes q ON r.quiz_id = q.id
        WHERE r.user_id = %s
    """, (user_id,))
    progress = cursor.fetchall()

    # Calculate average score
    if progress:
        total_score = sum([item['score'] for item in progress])
        average_score = total_score / len(progress)
    else:
        average_score = 0

    cursor.close()
    conn.close()

    # Render the progress page
    return render_template('progress.html', progress=progress, average_score=average_score)




if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0')