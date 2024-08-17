import os
from flask import Flask, request, send_from_directory, session, redirect, url_for, flash, render_template
from flask_socketio import SocketIO, emit
import mysql.connector

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ba06396ec4cbf0c69569d0677a2001b4bd706333ad8b241b6c447e8f8c3b3b6d'
socketio = SocketIO(app)

# Directory where uploaded files will be saved
UPLOAD_FOLDER = os.path.join(app.root_path, 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# MySQL Configuration
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
    return redirect(url_for('login_route'))

@app.route('/login', methods=['GET', 'POST'])
def login_route():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        8
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
    if 'username' not in session:
        return redirect(url_for('login_route'))
    return render_template('chat.html', username=session['username'])

@app.route('/upload', methods=['POST'])
def upload_file():
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

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# SocketIO events
@socketio.on('join_room')
def handle_join_room(data):
    room = data['room']
    username = data['username']
    emit('receive_message', {'username': 'System', 'message': f"{username} has joined the chat!"}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    room = data['room']
    username = data['username']
    message = data['message']
    
    emit('receive_message', {'username': username, 'message': message}, room=room)

@socketio.on('deleteFile')
def handle_delete_file(file_name):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        emit('fileDeleted', file_name, broadcast=True)
        
@app.route('/whiteboard')
def whiteboard():
    return render_template('whiteboard.html')

# Add this to app.py
@app.route('/screenshare')
def screenshare():
    if 'username' not in session:
        return redirect(url_for('login_route'))
    return render_template('screenshare.html')

if __name__ == '__main__':
    socketio.run(app, debug=True)

