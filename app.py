from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/call')
def call():
    return render_template('call.html')

# WebSocket events
@socketio.on('offer')
def handle_offer(data):
    emit('offer', data, broadcast=True)

@socketio.on('answer')
def handle_answer(data):
    emit('answer', data, broadcast=True)

@socketio.on('ice-candidate')
def handle_ice_candidate(data):
    emit('ice-candidate', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
