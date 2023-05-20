from flask import Flask, request, jsonify, make_response, session

from config import app, db

from models import *

@app.route('/check_session', methods=['GET'])
def check_session():
    if session.get('user_id'):
        user = User.query.filter(User.id == session['user_id']).first()
        return user.to_dict(), 200
    return {'error': '401 Unauthorized'}, 401

@app.route('/login', methods=['POST'])
def login():
    request_json = request.get_json()
    email = request_json.get('email')
    password = request_json.get('password')
    user = User.query.filter(User.email == email).first()
    if user:
        if user.authenticate(password):
            session['user_id'] = user.id
            return user.to_dict(), 200
    return {'error': '401 Unauthorized'}, 401

@app.route('/logout', methods=['DELETE'])
def logout():
    
    if session.get('user_id'):
        session['user_id'] = None
        return {}, 204
    return {'error': '401 Unauthorized'}, 401

@app.route('/signup', methods=['POST'])
def signup():
    request_json = request.get_json()
    new_user = User(
        email = request_json.get('email'),
        username = request_json.get('username'),
        )
    password = request_json.get('password')
    new_user.password_hash = password
    db.session.add(new_user)
    db.session.commit()
    session['user_id'] = new_user.id 
    return new_user.to_dict()

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@app.route('/users/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def get_user(id):
    user = User.query.get(id)
    if request.method == 'GET':
        return user.to_dict()
    elif request.method == 'PATCH':
        request_json = request.get_json()
        user.email = request_json.get('email', user.email)
        user.username = request_json.get('username', user.username)
        user.image = request_json.get('image', user.image)
        db.session.commit()
        return user.to_dict()
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return {}, 204
    
@app.route('/books/<int:id>', methods=['GET'])
def get_book(id):
    if request.method == 'GET':
        book = Book.query.get(id)
        return jsonify(book.to_dict())


