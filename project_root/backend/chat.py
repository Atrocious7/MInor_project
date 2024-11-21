# from flask import Flask, render_template, request, session, redirect, url_for, flash
# from flask_socketio import SocketIO

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'ba06396ec4cbf0c69569d0677a2001b4bd706333ad8b241b6c447e8f8c3b3b6d'
# socketio = SocketIO(app)

# # Simple user dictionary for demonstration purposes
# # users = {"test": "password"}

# # @app.route('/')
# # def home():
# #     return redirect(url_for('login_route'))

# # @app.route('/login', methods=['GET', 'POST'])
# # def login_route():
# #     if request.method == 'POST':
# #         username = request.form['username']
# #         password = request.form['password']
# #         if username in users and users[username] == password:
# #             session['username'] = username
# #             return redirect(url_for('chat'))
# #         else:
# #             flash('Invalid credentials, or register a account.', 'danger')
# #             return redirect(url_for('login_route'))
# #     return render_template('login.html')

# # @app.route('/register', methods=['POST'])
# # def register():
# #     username = request.form['username']
# #     password = request.form['password']
# #     if username in users:
# #         flash('Username already exists. Please choose another one.', 'danger')
# #     else:
# #         users[username] = password
# #         flash('Registration successful. Please log in.', 'success')
# #     return redirect(url_for('login_route'))

# @app.route('/chat')
# def chat():
#     if 'username' not in session:
#         return redirect(url_for('login_route'))
#     return render_template('chat.html')

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         return 'No file part', 400
#     file = request.files['file']
#     if file.filename == '':
#         return 'No selected file', 400
#     if file:
#         # Save the file and return success response
#         file.save(f"C:/Users/tarun/OneDrive/Documents/{file.filename}")
#         return 'File successfully uploaded', 200

# @app.route('/whiteboard')
# def whiteboard():
#     if 'username' not in session:
#         return redirect(url_for('login_route'))
#     return render_template('whiteboard.html')

# if __name__ == '__main__':
#     socketio.run(app, debug=True)
