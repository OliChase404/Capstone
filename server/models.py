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
    _password_hash = db.Column(db.String)
    image = db.Column(db.String, default='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ficon-library.com%2Fimages%2Fdefault-user-icon%2Fdefault-user-icon-23.jpg&f=1&nofb=1&ipt=c7c95636ecb8002fe9cb243375a3a0550aa5efe053343fdfa7162b22a08f553f&ipo=images')
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    last_login = db.Column(db.DateTime, default=db.func.now())
    
    user_filtered_books = db.relationship('UserFilteredBook', back_populates='user')
    filtered_books = association_proxy('user_filtered_books', 'book', creator=lambda b: UserFilteredBook(book=b))

    # user_favorite_genres = db.relationship('UserFavoriteGenre', back_populates='user')

    # user_favorite_narrators = db.relationship('UserFavoriteNarrator', back_populates='user')

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(
            password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))
    
class Book(db.Model, SerializerMixin):
    __tablename__ = 'books'
    serialize_rules = ('-user_filtered_books', '-book_genres')

    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('authors.id'))
    author = db.Column(db.String)
    title = db.Column(db.String)
    narrator_id = db.Column(db.Integer, db.ForeignKey('narrators.id'))
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
    processed = db.Column(db.Boolean, default=False)
    
    book_genres = db.relationship('BookGenre', back_populates='book')
    genres = association_proxy('book_genres', 'genre', creator=lambda g: BookGenre(genre=g))
    
    user_filtered_books = db.relationship('UserFilteredBook', back_populates='book')
    def to_dict(self):
        return {
            'id': self.id,
            'author_id': self.author_id,
            'author': self.author,
            'title': self.title,
            'narrator_id': self.narrator_id,
            'narrator': self.narrator,
            'cover': self.cover,
            'average_rating': self.average_rating,
            'number_of_ratings': self.number_of_ratings,
            'summary': self.summary,
            'sample': self.sample,
            'series': self.series,
            'audible_url': self.audible_url,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'processed': self.processed,
            'genres': [genre.to_dict() for genre in self.book_genres]
    }
    
class Genre(db.Model, SerializerMixin):
    __tablename__ = 'genres'
    serialize_rules = ('-book_genres', '-user_favorite_genres', "-books")
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    
    book_genres = db.relationship('BookGenre', back_populates='genre')
    books = association_proxy('book_genres', 'book', creator=lambda b: BookGenre(book=b))
    # user_favorite_genres = db.relationship('UserFavoriteGenre', back_populates='genre')

class Author(db.Model, SerializerMixin):
    __tablename__ = 'authors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

class Narrator(db.Model, SerializerMixin):
    __tablename__ = 'narrators'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    # user_favorite_narrators = db.relationship('UserFavoriteNarrator', back_populates='narrator')

# class UserFavoriteNarrator(db.Model, SerializerMixin):
#     __tablename__ = 'user_favorite_narrators'
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     narrator_id = db.Column(db.Integer, db.ForeignKey('narrators.id'))

#     user = db.relationship('User', back_populates='user_favorite_narrators')
#     narrator = db.relationship('Narrator', back_populates='user_favorite_narrators')

# class UserFavoriteGenre(db.Model, SerializerMixin):
#     __tablename__ = 'user_favorite_genres'
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     genre_id = db.Column(db.Integer, db.ForeignKey('genres.id'))

#     user = db.relationship('User', back_populates='user_favorite_genres')
#     genre = db.relationship('Genre', back_populates='user_favorite_genres')
    
class BookGenre(db.Model, SerializerMixin):
    __tablename__ = 'book_genres'
    serialize_rules = ('-book',)
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    genre_id = db.Column(db.Integer, db.ForeignKey('genres.id'))
    
    book = db.relationship('Book', back_populates='book_genres')
    genre = db.relationship('Genre', back_populates='book_genres')
    
class UserFilteredBook(db.Model, SerializerMixin):
    __tablename__ = 'user_filtered_books'
    serialize_rules = ('-user', '-book')
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    user_vote = db.Column(db.Boolean)
    user_favorite = db.Column(db.Boolean)
    
    user = db.relationship('User', back_populates='user_filtered_books')
    book = db.relationship('Book', back_populates='user_filtered_books')

class UserFilteredAuthor(db.Model, SerializerMixin):
    __tablename__ = 'user_filtered_authors'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    author_id = db.Column(db.Integer, db.ForeignKey('authors.id'))
    user_vote = db.Column(db.Boolean)
    user_favorite = db.Column(db.Boolean)

class UserFilteredNarrator(db.Model, SerializerMixin):
    __tablename__ = 'user_filtered_narrators'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    narrator_id = db.Column(db.Integer, db.ForeignKey('narrators.id'))
    user_vote = db.Column(db.Boolean)
    user_favorite = db.Column(db.Boolean)

class UserFilteredGenre(db.Model, SerializerMixin):
    __tablename__ = 'user_filtered_genres'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    genre_id = db.Column(db.Integer, db.ForeignKey('genres.id'))
    user_vote = db.Column(db.Boolean)
    user_favorite = db.Column(db.Boolean)
    
    
class BookConnection(db.Model, SerializerMixin):
    __tablename__ = 'book_connections'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    connected_book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    strength = db.Column(db.Integer)
    
