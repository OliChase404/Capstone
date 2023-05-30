from flask import Flask, request, jsonify, make_response, session
from collections import Counter
from random import choice as rc, sample as rs
from datetime import datetime, timedelta

from config import app, db, bcrypt

from models import *

@app.route('/check_session', methods=['GET'])
def check_session():
    if session.get('user_id'):
        user = User.query.filter(User.id == session['user_id']).first()

        if datetime.now() >= user.last_active + timedelta(minutes=10):
            user.last_active = datetime.now()
            db.session.commit()
            print('<---Updated last_active--->')
            if datetime.now() >= user.last_active + timedelta(hours=8):
                UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id, UserFilteredBook.user_skipped == True).delete()
                db.session.commit()
                print('<---User Skipped Reset--->')

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
def users_index():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])


@app.route('/users/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def users_show(id):
    user = User.query.get(id)
    if request.method == 'GET':
        return user.to_dict()
    elif request.method == 'PATCH':
        request_json = request.get_json()
        user.email = request_json.get('email', user.email)
        user.username = request_json.get('username', user.username)
        user.image = request_json.get('image', user.image)
        password = request_json.get('password')
        if password:
            user.password_hash = password
        db.session.commit()
        return user.to_dict()
    elif request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
        return {}, 204
    
@app.route('/books/<int:id>', methods=['GET'])
def books_show(id):
    if request.method == 'GET':
        book = Book.query.get(id)
        book_genres_link = BookGenre.query.filter(BookGenre.book_id == book.id).all()
        book_genres = [Genre.query.get(book_genre.genre_id) for book_genre in book_genres_link]
        return jsonify(book.to_dict())
    
@app.route('/recommend_books', methods=['GET'])
def recommend_book():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_filtered_books = UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id).all()
        new_books = Book.query.filter(Book.id.notin_([user_book.book_id for user_book in user_filtered_books])).all()

        ten_random_books = []
        while len(ten_random_books) < 10:
            random_book = rc(new_books)
            if random_book not in ten_random_books:
                ten_random_books.append(random_book)
        
        if len(user_filtered_books) == 0:
            print('<---user has no filtered books--->')
            return jsonify([book.to_dict() for book in ten_random_books])

        user_favorite_books = [user_book for user_book in user_filtered_books if user_book.user_favorite == True]
        user_liked_books = [user_book for user_book in user_filtered_books if user_book.user_vote == True]
        user_disliked_books = [user_book for user_book in user_filtered_books if user_book.user_vote == False and user_book.user_skipped == False]

        user_favourite_book_connections = [BookConnection.query.filter(BookConnection.book_id == user_book.id).all() for user_book in user_favorite_books]
        fav_book_connections_list = [book.connected_book_id for book_list in user_favourite_book_connections for book in book_list]

        user_liked_book_connections = [BookConnection.query.filter(BookConnection.book_id == user_book.id).all() for user_book in user_liked_books]
        liked_book_connections_list = [book.connected_book_id for book_list in user_liked_book_connections for book in book_list]

        user_disliked_book_connections = [BookConnection.query.filter(BookConnection.book_id == user_book.id).all() for user_book in user_disliked_books]
        disliked_book_connections_list = [book.connected_book_id for book_list in user_disliked_book_connections for book in book_list]

        likes_minus_dislikes = [book for book in liked_book_connections_list if book not in disliked_book_connections_list]

        positive_connections = [fav_book_connections_list + likes_minus_dislikes + liked_book_connections_list]
        positive_connections_flat = [book_id for book_list in positive_connections for book_id in book_list]
        count = Counter(tuple(positive_connections_flat))

        recommendations_list = [book for book in count.most_common()]
        user_filtered_book_ids = [user_book.book_id for user_book in user_filtered_books]

        new_books_only_recommendations_list = [book for book in recommendations_list if book[0] not in user_filtered_book_ids]
        print(len(new_books_only_recommendations_list))

        if len(new_books_only_recommendations_list) == 0:
            print('<---new_books_only_recommendations_list is empty--->')
            return jsonify([book.to_dict() for book in ten_random_books])
        
        recommendation_tuples = new_books_only_recommendations_list[:30]
        print(recommendation_tuples)

        recommendation_ids = [recommendation[0] for recommendation in recommendation_tuples]
        recommendation_ids = list(set(recommendation_ids))

        i = 0
        while (len(recommendation_ids) < 30) and (i < 100):
            random_new_book = rc(new_books)
            if random_new_book.id not in recommendation_ids:
                recommendation_ids.append(random_new_book.id)
            i += 1
        print(recommendation_ids)

        recommended_books = [book for book in new_books if book.id in recommendation_ids]

        return [book.to_dict() for book in recommended_books]
    
@app.route('/user_filtered_books', methods=['GET', 'POST'])
def user_filtered_books_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_books = UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id).all()
        return jsonify([user_book.to_dict() for user_book in user_books])
    elif request.method == 'POST':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        book = Book.query.get(request_json.get('book_id'))
        new_user_book = UserFilteredBook(
            user_id = user.id,
            book_id = book.id,
            user_vote = request_json.get('user_vote'),
            user_favorite = request_json.get('user_favorite'),
            user_skipped = request_json.get('user_skipped')
            )
        db.session.add(new_user_book)
        db.session.commit()
        return new_user_book.to_dict()

@app.route('/user_favorite_books', methods=['GET'])
def user_favorite_books_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_favorite_book_ref = UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id, UserFilteredBook.user_favorite == True).all()
        user_favorite_books = [Book.query.get(user_favorite_book.book_id) for user_favorite_book in user_favorite_book_ref]
        return jsonify([user_favorite_book.to_dict() for user_favorite_book in user_favorite_books])
 
@app.route('/user_liked_books', methods=['GET'])
def user_liked_books_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_liked_book_ref = UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id, UserFilteredBook.user_vote == True, UserFilteredBook.user_favorite == False).all()
        user_liked_books = [Book.query.get(user_liked_book.book_id) for user_liked_book in user_liked_book_ref]
        return jsonify([user_liked_book.to_dict() for user_liked_book in user_liked_books])
    
@app.route('/user_disliked_books', methods=['GET'])
def user_disliked_books_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_disliked_book_ref = UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id, UserFilteredBook.user_vote == False, UserFilteredBook.user_favorite == False).all()
        user_disliked_books = [Book.query.get(user_disliked_book.book_id) for user_disliked_book in user_disliked_book_ref]
        return jsonify([user_disliked_book.to_dict() for user_disliked_book in user_disliked_books])

@app.route('/user_book/<int:id>', methods=['PATCH'])
def user_book_show(id):
    if request.method == 'PATCH':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        user_book = UserFilteredBook.query.filter(UserFilteredBook.user_id == user.id, UserFilteredBook.book_id == id).first()
        for key, value in request_json.items():
            setattr(user_book, key, value)
        db.session.commit()
        return user_book.to_dict()







@app.route('/authors', methods=['GET'])
def authors_index():
    authors = Author.query.all()
    authors = sorted(authors, key=lambda author: author.name)
    return jsonify([author.to_dict() for author in authors])

@app.route('/unfiltered_authors', methods=['GET'])
def unfiltered_authors_index():
    user_filtered_authors = UserFilteredAuthor.query.all()
    authors = Author.query.filter(Author.id.notin_([user_filtered_author.author_id for user_filtered_author in user_filtered_authors])).all()
    authors = sorted(authors, key=lambda author: author.name)
    return jsonify([author.to_dict() for author in authors])

@app.route('/user_disliked_authors', methods=['GET'])
def user_disliked_authors_index():
        user = User.query.get(session['user_id'])
        user_disliked_author_ref = UserFilteredAuthor.query.filter(UserFilteredAuthor.user_id == user.id, UserFilteredAuthor.user_vote == False, UserFilteredAuthor.user_favorite == False).all()
        user_disliked_authors = [Author.query.get(user_disliked_author.author_id) for user_disliked_author in user_disliked_author_ref]
        return jsonify([user_disliked_author.to_dict() for user_disliked_author in user_disliked_authors])

@app.route('/user_liked_authors', methods=['GET'])
def user_liked_authors_index():
        user = User.query.get(session['user_id'])
        user_liked_author_ref = UserFilteredAuthor.query.filter(UserFilteredAuthor.user_id == user.id, UserFilteredAuthor.user_vote == True, UserFilteredAuthor.user_favorite == False).all()
        user_liked_authors = [Author.query.get(user_liked_author.author_id) for user_liked_author in user_liked_author_ref]
        return jsonify([user_liked_author.to_dict() for user_liked_author in user_liked_authors])

@app.route('/user_favorite_authors', methods=['GET'])
def user_favorite_authors_index():
        user = User.query.get(session['user_id'])
        user_favorite_author_ref = UserFilteredAuthor.query.filter(UserFilteredAuthor.user_id == user.id, UserFilteredAuthor.user_favorite == True).all()
        user_favorite_authors = [Author.query.get(user_favorite_author.author_id) for user_favorite_author in user_favorite_author_ref]
        return jsonify([user_favorite_author.to_dict() for user_favorite_author in user_favorite_authors])

@app.route('/user_filtered_authors', methods=['GET', 'POST', 'DELETE'])
def user_filtered_authors_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_authors = UserFilteredAuthor.query.filter(UserFilteredAuthor.user_id == user.id).all()
        return jsonify([user_author.to_dict() for user_author in user_authors])
    
    elif request.method == 'POST':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        author = Author.query.get(request_json.get('author_id'))
        existing_user_author = UserFilteredAuthor.query.filter(UserFilteredAuthor.user_id == user.id, UserFilteredAuthor.author_id == author.id).first()
        if existing_user_author:
            for key, value in request_json.items():
                setattr(existing_user_author, key, value)
            db.session.commit()
            return existing_user_author.to_dict()
        else:
            new_user_author = UserFilteredAuthor(
                user_id = user.id,
                author_id = author.id,
                user_vote = request_json.get('user_vote'),
                user_favorite = request_json.get('user_favorite')
                )
            db.session.add(new_user_author)
            db.session.commit()
        return new_user_author.to_dict()
    
    elif request.method == 'DELETE':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        author_id = request_json.get('author_id')
        user_author = UserFilteredAuthor.query.filter(UserFilteredAuthor.user_id == user.id, UserFilteredAuthor.author_id == author_id).first()
        db.session.delete(user_author)
        db.session.commit()
        return user_author.to_dict()





@app.route('/genres', methods=['GET'])
def genres_index():
    genres = Genre.query.all()
    genres = sorted(genres, key=lambda genre: genre.name)
    return jsonify([genre.to_dict() for genre in genres])

@app.route('/unfiltered_genres', methods=['GET'])
def unfiltered_genres_index():
    user_filtered_genres = UserFilteredGenre.query.all()
    genres = Genre.query.filter(Genre.id.notin_([user_filtered_genre.genre_id for user_filtered_genre in user_filtered_genres])).all()
    genres = sorted(genres, key=lambda genre: genre.name)
    return jsonify([genre.to_dict() for genre in genres])

@app.route('/user_disliked_genres', methods=['GET'])
def user_disliked_genres_index():
        user = User.query.get(session['user_id'])
        user_disliked_genre_ref = UserFilteredGenre.query.filter(UserFilteredGenre.user_id == user.id, UserFilteredGenre.user_vote == False, UserFilteredGenre.user_favorite == False).all()
        user_disliked_genres = [Genre.query.get(user_disliked_genre.genre_id) for user_disliked_genre in user_disliked_genre_ref]
        return jsonify([user_disliked_genre.to_dict() for user_disliked_genre in user_disliked_genres])

@app.route('/user_liked_genres', methods=['GET'])
def user_liked_genres_index():
        user = User.query.get(session['user_id'])
        user_liked_genre_ref = UserFilteredGenre.query.filter(UserFilteredGenre.user_id == user.id, UserFilteredGenre.user_vote == True, UserFilteredGenre.user_favorite == False).all()
        user_liked_genres = [Genre.query.get(user_liked_genre.genre_id) for user_liked_genre in user_liked_genre_ref]
        return jsonify([user_liked_genre.to_dict() for user_liked_genre in user_liked_genres])

@app.route('/user_favorite_genres', methods=['GET'])
def user_favorite_genres_index():
        user = User.query.get(session['user_id'])
        user_favorite_genre_ref = UserFilteredGenre.query.filter(UserFilteredGenre.user_id == user.id, UserFilteredGenre.user_favorite == True).all()
        user_favorite_genres = [Genre.query.get(user_favorite_genre.genre_id) for user_favorite_genre in user_favorite_genre_ref]
        return jsonify([user_favorite_genre.to_dict() for user_favorite_genre in user_favorite_genres])

@app.route('/user_filtered_genres', methods=['GET', 'POST', 'DELETE'])
def user_filtered_genres_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_filtered_genres = UserFilteredGenre.query.filter(UserFilteredGenre.user_id == user.id).all()
        return jsonify([user_genre.to_dict() for user_genre in user_filtered_genres])
    
    elif request.method == 'POST':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        genre = Genre.query.get(request_json.get('genre_id'))
        existing_user_genre = UserFilteredGenre.query.filter(UserFilteredGenre.user_id == user.id, UserFilteredGenre.genre_id == genre.id).first()
        if existing_user_genre:
            for key, value in request_json.items():
                setattr(existing_user_genre, key, value)
            db.session.commit()
            return existing_user_genre.to_dict()
        else:
            new_user_genre = UserFilteredGenre(
                user_id = user.id,
                genre_id = genre.id,
                user_vote = request_json.get('user_vote'),
                user_favorite = request_json.get('user_favorite')
                )
            db.session.add(new_user_genre)
            db.session.commit()
        return new_user_genre.to_dict()
    
    elif request.method == 'DELETE':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        genre_id = request_json.get('genre_id')
        user_genre = UserFilteredGenre.query.filter(UserFilteredGenre.user_id == user.id, UserFilteredGenre.genre_id == genre_id).first()
        db.session.delete(user_genre)
        db.session.commit()
        return user_genre.to_dict()
    




@app.route('/narrators', methods=['GET'])
def narrators_index():
    narrators = Narrator.query.all()
    narrators = sorted(narrators, key=lambda narrator: narrator.name)
    return jsonify([narrator.to_dict() for narrator in narrators])

@app.route('/unfiltered_narrators', methods=['GET'])
def unfiltered_narrators_index():
    user_filtered_narrators = UserFilteredNarrator.query.all()
    narrators = Narrator.query.filter(Narrator.id.notin_([user_filtered_narrator.narrator_id for user_filtered_narrator in user_filtered_narrators])).all()
    narrators = sorted(narrators, key=lambda narrator: narrator.name)
    return jsonify([narrator.to_dict() for narrator in narrators])

@app.route('/user_disliked_narrators', methods=['GET'])
def user_disliked_narrators_index():
        user = User.query.get(session['user_id'])
        user_disliked_narrator_ref = UserFilteredNarrator.query.filter(UserFilteredNarrator.user_id == user.id, UserFilteredNarrator.user_vote == False, UserFilteredNarrator.user_favorite == False).all()
        user_disliked_narrators = [Narrator.query.get(user_disliked_narrator.narrator_id) for user_disliked_narrator in user_disliked_narrator_ref]
        return jsonify([user_disliked_narrator.to_dict() for user_disliked_narrator in user_disliked_narrators])

@app.route('/user_liked_narrators', methods=['GET'])
def user_liked_narrators_index():
        user = User.query.get(session['user_id'])
        user_liked_narrator_ref = UserFilteredNarrator.query.filter(UserFilteredNarrator.user_id == user.id, UserFilteredNarrator.user_vote == True, UserFilteredNarrator.user_favorite == False).all()
        user_liked_narrators = [Narrator.query.get(user_liked_narrator.narrator_id) for user_liked_narrator in user_liked_narrator_ref]
        return jsonify([user_liked_narrator.to_dict() for user_liked_narrator in user_liked_narrators])

@app.route('/user_favorite_narrators', methods=['GET'])
def user_favorite_narrators_index():
        user = User.query.get(session['user_id'])
        user_favorite_narrator_ref = UserFilteredNarrator.query.filter(UserFilteredNarrator.user_id == user.id, UserFilteredNarrator.user_favorite == True).all()
        user_favorite_narrators = [Narrator.query.get(user_favorite_narrator.narrator_id) for user_favorite_narrator in user_favorite_narrator_ref]
        return jsonify([user_favorite_narrator.to_dict() for user_favorite_narrator in user_favorite_narrators])

@app.route('/user_filtered_narrators', methods=['GET', 'POST', 'DELETE'])
def user_filtered_narrators_index():
    if request.method == 'GET':
        user = User.query.get(session['user_id'])
        user_narrators = UserFilteredNarrator.query.filter(UserFilteredNarrator.user_id == user.id).all()
        return jsonify([user_narrator.to_dict() for user_narrator in user_narrators])
    
    elif request.method == 'POST':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        narrator = Narrator.query.get(request_json.get('narrator_id'))
        existing_user_narrator = UserFilteredNarrator.query.filter(UserFilteredNarrator.user_id == user.id, UserFilteredNarrator.narrator_id == narrator.id).first()
        if existing_user_narrator:
            for key, value in request_json.items():
                setattr(existing_user_narrator, key, value)
            db.session.commit()
            return existing_user_narrator.to_dict()
        else:
            new_user_narrator = UserFilteredNarrator(
                user_id = user.id,
                narrator_id = narrator.id,
                user_vote = request_json.get('user_vote'),
                user_favorite = request_json.get('user_favorite')
                )
            db.session.add(new_user_narrator)
            db.session.commit()
        return new_user_narrator.to_dict()
    
    elif request.method == 'DELETE':
        request_json = request.get_json()
        user = User.query.get(session['user_id'])
        narrator_id = request_json.get('narrator_id')
        user_narrator = UserFilteredNarrator.query.filter(UserFilteredNarrator.user_id == user.id, UserFilteredNarrator.narrator_id == narrator_id).first()
        db.session.delete(user_narrator)
        db.session.commit()
        return user_narrator.to_dict()