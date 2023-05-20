from config import db, app
from models import Book, Genre, Author, Narrator, BookGenre, BookConnection
from bs4 import BeautifulSoup
import requests

def normalize(title):
    title = title.replace(' ', '')
    title = title.replace(':', '')
    title = title.replace('?', '')
    title = title.replace('!', '')
    title = title.replace('\'', '')
    title = title.replace('\"', '')
    title = title.replace('(', '')
    title = title.replace(')', '')
    title = title.replace(',', '')
    title = title.replace('.', '')
    title = title.replace('-', '')
    title = title.replace('_', '')
    title = title.replace(';', '')
    title = title.replace('’', '')
    title = title.replace('‘', '')
    title = title.replace('“', '')
    title = title.replace('”', '')
    title = title.replace('…', '')
    title = title.lower()
    return title

def get_book_from_audible(url):
    book = {}
    page = BeautifulSoup(requests.get(url).text, 'html.parser')
    
    book['audible_url'] = url

    page_tab_text = page.title.string.split(' by ')
    if len(page_tab_text) >= 1:    
        book['title'] = page_tab_text[0]
        book['author'] = page_tab_text[1].split(' - ')[0]
    else:
        book['title'] = 'Title not available'
        book['author'] = 'Author not available'

    button = page.find('button', class_='bc-button-text')
    if button:
        data_mp3 = button.get('data-mp3')
        book['sample'] = data_mp3
    else:
        book['sample'] = 'Sample not available'
    
    image_element = page.find('img', class_='bc-pub-block bc-image-inset-border js-only-element')
    if image_element:
        image_src = image_element.get('src')
        book['cover'] = image_src
    else:
        book['cover'] = 'Cover image not available'
    
    narrator_element = page.find('li', class_='bc-list-item narratorLabel')
    if narrator_element:
        narrator_name = narrator_element.find('a', class_='bc-link').text.strip()
        book['narrator'] = narrator_name
    else:
        book['narrator'] = 'Narrator info not available'
    
    genre_elements = page.find_all('span', class_='bc-chip-text')
    if genre_elements:
        genre_tags = [genre.text.strip() for genre in genre_elements]
        book['genres'] = genre_tags
    else:
        book['genres'] = 'Genre info available'

    summary_element = page.find('div', class_='bc-container productPublisherSummary')
    if summary_element:
        p_tags = summary_element.find_all('p')
        summary_text = ' '.join([p.get_text(strip=True) for p in p_tags])
        book['summary'] = summary_text
    else: 
        book['summary'] = 'No summary available'
        
    div_element = page.find('div', class_='bc-review-stars')
    if div_element:
        rating_element = div_element.find_next_sibling('span', class_='bc-text')
        rating_element2 = rating_element.find_next_sibling('span', class_='bc-text')
        rating_text = rating_element2.get_text(strip=True)
        book['average_rating'] = rating_text
    else:
        book['average_rating'] = 'Rating not available'
        
    ratings_div = page.find('li', class_='ratingsLabel')
    if ratings_div:
        ratings_text = ratings_div.get_text(strip=True)
        ratings_number = ratings_text.split('(')[-1].split(' ')[0]
        book['number_of_ratings'] = ratings_number
    else:
        book['number_of_ratings'] = 'Number of ratings not available'
        

    series_div = page.find('div', class_='bc-container product-topic-tags')
    if series_div:
        try:
            series_name_and_book_number = series_div.find('li', class_='seriesLabel').text.strip().split(':')[1].strip()
            series_name = series_name_and_book_number.split(',')[0].strip()
            book['series_name'] = series_name
        except: 
            print('<--Error: series_name is not a string-->')
            book['series_name'] = 'Series name not available'
    else:
        book['series_name'] = 'Series name not available'
    



    all_books = Book.query.all()
    for existing_book in all_books:
        if normalize(existing_book.title) == normalize(book['title']):
            print('Book already in database')
            return
    new_book = Book(
        title=book['title'],
        author=book['author'],
        narrator=book['narrator'],
        sample=book['sample'],
        cover=book['cover'],
        summary=book['summary'],
        audible_url=book['audible_url'],
        average_rating=book['average_rating'],
        number_of_ratings=book['number_of_ratings'],
        series=book['series_name'],
    )
    
    all_genres = Genre.query.all()
    existing_genre_names = [normalize(genre.name) for genre in all_genres]
    for genre_tag in book['genres']:
        if normalize(genre_tag) in existing_genre_names:
            print('Genre already in database')
        else:
            new_genre = Genre(
                name=genre_tag
            )
            db.session.add(new_genre)

    all_narrators = Narrator.query.all()
    existing_narrator_names = [normalize(narrator.name) for narrator in all_narrators]
    if normalize(book['narrator']) in existing_narrator_names:
        print('Narrator already in database')
    else:
        new_narrator = Narrator(
            name=book['narrator']
        )
        db.session.add(new_narrator)

    all_authors = Author.query.all()
    existing_author_names = [normalize(author.name) for author in all_authors]
    if normalize(book['author']) in existing_author_names:
        print('Author already in database')
        # new_book.author_id = Author.query.filter_by(name=book['author']).first().id
    else:
        new_author = Author(
            name=book['author']
        )
        db.session.add(new_author)

    new_book.author_id = Author.query.filter_by(name=book['author']).first().id
    new_book.narrator_id = Narrator.query.filter_by(name=book['narrator']).first().id

    db.session.add(new_book)
    for genre_tag in book['genres']:
        new_book_genre = BookGenre(
            book_id=Book.query.filter_by(title=book['title']).first().id,
            genre_id=Genre.query.filter_by(name=genre_tag).first().id
        )
        db.session.add(new_book_genre)



    db.session.commit()
    print('Book added to database')


    
    
    
    # print(page)
if __name__ == '__main__':

    with app.app_context():
        Book.query.delete()
        Genre.query.delete()
        Narrator.query.delete()
        Author.query.delete()
        BookGenre.query.delete()

        new_author = Author(
        name="Adrian Tchaikovsky"
        )
        db.session.add(new_author)

        new_narrator = Narrator(
            name="Mel Hudson"
        )
        db.session.add(new_narrator)

        new_genre = Genre(
            name="Science Fiction"
        )
        db.session.add(new_genre)

        db.session.commit()
        get_book_from_audible('https://www.audible.com/pd/Children-of-Time-Audiobook/B071Y9TTHC?qid=1684174283&sr=1-1&ref=a_search_c3_lProduct_1_1&pf_rd_p=83218cca-c308-412f-bfcf-90198b687a2f&pf_rd_r=EZ7ZMB4DEQ83SHPKBPHV&pageLoadId=aEO8Bu7PgZIhxdGV&creativeId=0d6f6720-f41c-457e-a42b-8c8dceb62f2c')
        get_book_from_audible('https://www.audible.com/pd/We-Are-Legion-We-Are-Bob-Audiobook/B01L082HJ2?plink=Nsjv4nvUpXgnJeyG&ref=a_pd_Childr_c5_adblp13npsbx_1_2&pf_rd_p=c09b9598-fc4b-4bcd-829c-1bd478ce94d5&pf_rd_r=P95TT2N3SFPB6WBHGMBX&pageLoadId=k4MLIoroMRuDxWUZ&creativeId=aa49be53-d2b6-462f-8696-8b1f281125e6')
        get_book_from_audible('https://www.audible.com/pd/Hyperion-Audiobook/B002V5BLIW?plink=Nsjv4nvUpXgnJeyG&ref=a_pd_Childr_c5_adblp13npsbx_1_1&pf_rd_p=c09b9598-fc4b-4bcd-829c-1bd478ce94d5&pf_rd_r=P95TT2N3SFPB6WBHGMBX&pageLoadId=k4MLIoroMRuDxWUZ&creativeId=aa49be53-d2b6-462f-8696-8b1f281125e6')
        get_book_from_audible('https://www.audible.com/pd/Drive-Audiobook/B09MZMT79T?plink=Nsjv4nvUpXgnJeyG&ref=a_pd_Childr_c5_adblp13npsbx_1_5&pf_rd_p=c09b9598-fc4b-4bcd-829c-1bd478ce94d5&pf_rd_r=P95TT2N3SFPB6WBHGMBX&pageLoadId=k4MLIoroMRuDxWUZ&creativeId=aa49be53-d2b6-462f-8696-8b1f281125e6')
        get_book_from_audible('https://www.audible.com/pd/Harry-Potter-and-the-Sorcerers-Stone-Book-1-Audiobook/B017V4IM1G?plink=QwZmZuhxDel4FehX&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_1_3&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=QVQZAR64NPER0F0R5EDT&pageLoadId=n1XWPONxjklIWt2D&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        get_book_from_audible('https://www.audible.com/pd/hop-thA-A-Audiobook/B08W8R55YQ?ref=a_listener__c3_listenProd_1_3&pf_rd_p=1659cc9b-c59a-44b6-81d1-7aeca54f1a09&pf_rd_r=GQKG2Q2ZSJ7JY16X2WQ0&pageLoadId=CxTHYVObJkC7Fdnq&creativeId=c313515c-e6b8-4852-99fb-78dc7f54098f')
        get_book_from_audible('https://www.audible.com/pd/Mickey7-Audiobook/1250839610?qid=1684348282&sr=1-1&ref=a_search_c3_lProduct_1_1&pf_rd_p=83218cca-c308-412f-bfcf-90198b687a2f&pf_rd_r=9J7QST184RZXRTC9QT0G&pageLoadId=tA8i6aZd4QUDYNis&creativeId=0d6f6720-f41c-457e-a42b-8c8dceb62f2c')
        get_book_from_audible('https://www.audible.com/pd/Sapiens-Audiobook/B0741G911Q?qid=1684351595&sr=1-1&ref=a_search_c3_lProduct_1_1&pf_rd_p=83218cca-c308-412f-bfcf-90198b687a2f&pf_rd_r=PYM3GS42N24F7KKPVPGB&pageLoadId=1iWnnYanvxDpwKIT&creativeId=0d6f6720-f41c-457e-a42b-8c8dceb62f2c')
        get_book_from_audible('https://www.audible.com/pd/Greenlights-Audiobook/0593294181?plink=QefDhNThrq2gmYU5&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_2_2&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=9XKK3ESA2HE5R4Y6AY19&pageLoadId=4buqcsk7SM3qGzqm&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        get_book_from_audible('https://www.audible.com/pd/Project-Hail-Mary-Audiobook/B08G9PRS1K?plink=wfdgM1FzeqcfeYVJ&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_4_4&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=S011YHSKTF04ZW5A8E2B&pageLoadId=i0zj0JkuHE2RX7Ba&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        get_book_from_audible('https://www.audible.com/pd/The-Martian-Audiobook/B082BHJMFF?plink=qGllyOasbh6MjecN&ref=a_pd_Projec_c5_adblp13npsbx_1_2&pf_rd_p=5aa07719-8365-431d-b233-1e84fbc18121&pf_rd_r=5PM896J4W6QDX5KPJ88W&pageLoadId=2RfnWNR4peayMI3t&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
