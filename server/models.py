from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.hybrid import hybrid_property
from config import app, db, bcrypt

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String, nullable=False, unique=True)
    hashed_password = db.Column(db.String)
    image = db.Column(db.String, default='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ficon-library.com%2Fimages%2Fdefault-user-icon%2Fdefault-user-icon-23.jpg&f=1&nofb=1&ipt=c7c95636ecb8002fe9cb243375a3a0550aa5efe053343fdfa7162b22a08f553f&ipo=images')
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    last_login = db.Column(db.DateTime, default=db.func.now())
    
    user_owned_books = db.relationship('UserOwnedBook', back_populates='user')
    books = association_proxy('user_owned_books', 'book', creator=lambda b: UserOwnedBook(book=b))
    
    user_filtered_books = db.relationship('UserFilteredBook', back_populates='user')
    filtered_books = association_proxy('user_filtered_books', 'book', creator=lambda b: UserFilteredBook(book=b))
    
class Book(db.Model, SerializerMixin):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String)
    title = db.Column(db.String)
    narrator = db.Column(db.String)
    cover = db.Column(db.String)
    average_rating = db.Column(db.String)
    number_of_ratings = db.Column(db.String)
    summary = db.Column(db.String)
    sample = db.Column(db.String)
    series = db.Column(db.String)
    audible_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    
    book_genres = db.relationship('BookGenre', back_populates='book')
    genres = association_proxy('book_genres', 'genre', creator=lambda g: BookGenre(genre=g))
    
    user_owned_books = db.relationship('UserOwnedBook', back_populates='book')
    users = association_proxy('user_owned_books', 'user', creator=lambda u: UserOwnedBook(user=u))
    
    user_filtered_books = db.relationship('UserFilteredBook', back_populates='book')
    
class Genre(db.Model, SerializerMixin):
    __tablename__ = 'genres'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    
    book_genres = db.relationship('BookGenre', back_populates='genre')
    books = association_proxy('book_genres', 'book', creator=lambda b: BookGenre(book=b))
    
class BookGenre(db.Model, SerializerMixin):
    __tablename__ = 'book_genres'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    genre_id = db.Column(db.Integer, db.ForeignKey('genres.id'))
    
    book = db.relationship('Book', back_populates='book_genres')
    genre = db.relationship('Genre', back_populates='book_genres')
    
class UserOwnedBook(db.Model, SerializerMixin):
    __tablename__ = 'user_owned_books'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    
    user = db.relationship('User', back_populates='user_owned_books')
    book = db.relationship('Book', back_populates='user_owned_books')

class UserFilteredBook(db.Model, SerializerMixin):
    __tablename__ = 'user_filtered_books'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    user_vote = db.Column(db.Boolean)
    
    user = db.relationship('User', back_populates='user_filtered_books')
    book = db.relationship('Book', back_populates='user_filtered_books')
    
class BookConnection(db.Model, SerializerMixin):
    __tablename__ = 'book_connections'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    connected_book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    strength = db.Column(db.Integer)
    
    book = db.relationship('Book', back_populates='book_connections')
    connected_book = db.relationship('Book', back_populates='book_connections')