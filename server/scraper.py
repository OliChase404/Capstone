from config import db, app
from models import Book, Genre, Author, Narrator, BookGenre, BookConnection, UserFilteredBook, UserFavoriteGenre, UserFavoriteNarrator
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

def get_book_from_audible(url, recursive=False, parent_id=None):
    book = {}
    page = BeautifulSoup(requests.get(url).text, 'html.parser')
    all_books = Book.query.all()
    depth_reached = False
    if len(all_books) >= 5:
        depth_reached = True
        print('Specified recursive depth reached. \nExecution stopped')
        return
    
    book['audible_url'] = url

    page_tab_text = page.title.string.split(' by ')
    if len(page_tab_text) >= 1:    
        book['title'] = page_tab_text[0]
        book['author'] = page_tab_text[1].split(' - ')[0]
    else:
        book['title'] = 'Title not available'
        book['author'] = 'Author not available'

    for existing_book in all_books:
        if normalize(existing_book.title) == normalize(book['title']):
            print('Book already in database')
            
            if parent_id == existing_book.id:
                print('Circular path found. No connection created')
                return 
            all_book_connections = BookConnection.query.all()
            existing_connection = False
            for book_connection in all_book_connections:
                if (book_connection.book_id == parent_id and book_connection.connected_book_id == existing_book.id) or (book_connection.book_id == existing_book.id and book_connection.connected_book_id == parent_id):
                    book_connection.strength += 1
                    db.session.commit()
                    existing_connection = True
                    print('Book connection strength increased in recursive phase')
                if existing_connection == False:    
                    new_book_connection = BookConnection(
                        book_id=parent_id,
                        connected_book_id=existing_book.id,
                        strength=1
                    )
                    db.session.add(new_book_connection)
                    db.session.commit()
                    print('New book connection created in recursive phase')
            return
        

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
    if recursive == False:
        return

    reviews = page.find_all('div', class_='bc-row-responsive bc-spacing-top-s4 bc-spacing-s5')


    for review in reviews:
        if depth_reached:
            return
        review_rating = review.find('span', class_='bc-text bc-pub-offscreen').text.strip()[0]
        if int(review_rating) >= 4:
            reviewer_link = "https://www.audible.com" + review.find('a', href=lambda href: href and '/listener/' in href)["href"]
            reviewer_page = BeautifulSoup(requests.get(reviewer_link).text, 'html.parser')
            reviewer_books = reviewer_page.find_all('div', class_='bc-col-3')

            for reviewer_book in reviewer_books:
                if depth_reached:
                    return
                try:
                    reviewer_book_rating = reviewer_book.find('span', class_='bc-text bc-pub-offscreen').text.strip()[0]

                    if int(reviewer_book_rating) >= 4:
                        reviewer_book_link = "https://www.audible.com" + reviewer_book.find('a', href=lambda href: href and '/pd/' in href)["href"]
                        get_book_from_audible(reviewer_book_link, recursive=False, parent_id=new_book.id)
                        Related_Book = Book.query.filter_by(audible_url=reviewer_book_link).first()
                        all_book_connections = BookConnection.query.all()
                        
                        existing_connection = False

                        for book_connection in all_book_connections:
                            if (book_connection.book_id == new_book.id and book_connection.connected_book_id == Related_Book.id) or (book_connection.book_id == Related_Book.id and book_connection.connected_book_id == new_book.id):
                                book_connection.strength += 1
                                db.session.commit()
                                existing_connection = True
                                print('Book connection strength increased')
                        if existing_connection == False:    
                            new_book_connection = BookConnection(
                                book_id=new_book.id,
                                connected_book_id=Related_Book.id,
                                strength=1
                            )
                            db.session.add(new_book_connection)
                            db.session.commit()
                        print('Book connection added')  

                except: "Error: Fetching related books failed"
            
    return new_book
    # print(reviews[0])


if __name__ == '__main__':

    with app.app_context():
        Book.query.delete()
        Genre.query.delete()
        Narrator.query.delete()
        Author.query.delete()
        BookGenre.query.delete()
        UserFilteredBook.query.delete()
        BookConnection.query.delete()

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
        get_book_from_audible('https://www.audible.com/pd/Killing-Floor-Audiobook/B015RQON6I?source_code=BLGORWS0107160001', True)
        # get_book_from_audible('https://www.audible.com/pd/Children-of-Time-Audiobook/B071Y9TTHC?qid=1684174283&sr=1-1&ref=a_search_c3_lProduct_1_1&pf_rd_p=83218cca-c308-412f-bfcf-90198b687a2f&pf_rd_r=EZ7ZMB4DEQ83SHPKBPHV&pageLoadId=aEO8Bu7PgZIhxdGV&creativeId=0d6f6720-f41c-457e-a42b-8c8dceb62f2c')
        # get_book_from_audible('https://www.audible.com/pd/We-Are-Legion-We-Are-Bob-Audiobook/B01L082HJ2?plink=Nsjv4nvUpXgnJeyG&ref=a_pd_Childr_c5_adblp13npsbx_1_2&pf_rd_p=c09b9598-fc4b-4bcd-829c-1bd478ce94d5&pf_rd_r=P95TT2N3SFPB6WBHGMBX&pageLoadId=k4MLIoroMRuDxWUZ&creativeId=aa49be53-d2b6-462f-8696-8b1f281125e6')
        # get_book_from_audible('https://www.audible.com/pd/Hyperion-Audiobook/B002V5BLIW?plink=Nsjv4nvUpXgnJeyG&ref=a_pd_Childr_c5_adblp13npsbx_1_1&pf_rd_p=c09b9598-fc4b-4bcd-829c-1bd478ce94d5&pf_rd_r=P95TT2N3SFPB6WBHGMBX&pageLoadId=k4MLIoroMRuDxWUZ&creativeId=aa49be53-d2b6-462f-8696-8b1f281125e6')
        # get_book_from_audible('https://www.audible.com/pd/Drive-Audiobook/B09MZMT79T?plink=Nsjv4nvUpXgnJeyG&ref=a_pd_Childr_c5_adblp13npsbx_1_5&pf_rd_p=c09b9598-fc4b-4bcd-829c-1bd478ce94d5&pf_rd_r=P95TT2N3SFPB6WBHGMBX&pageLoadId=k4MLIoroMRuDxWUZ&creativeId=aa49be53-d2b6-462f-8696-8b1f281125e6')
        # get_book_from_audible('https://www.audible.com/pd/Harry-Potter-and-the-Sorcerers-Stone-Book-1-Audiobook/B017V4IM1G?plink=QwZmZuhxDel4FehX&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_1_3&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=QVQZAR64NPER0F0R5EDT&pageLoadId=n1XWPONxjklIWt2D&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        # get_book_from_audible('https://www.audible.com/pd/hop-thA-A-Audiobook/B08W8R55YQ?ref=a_listener__c3_listenProd_1_3&pf_rd_p=1659cc9b-c59a-44b6-81d1-7aeca54f1a09&pf_rd_r=GQKG2Q2ZSJ7JY16X2WQ0&pageLoadId=CxTHYVObJkC7Fdnq&creativeId=c313515c-e6b8-4852-99fb-78dc7f54098f')
        # get_book_from_audible('https://www.audible.com/pd/Mickey7-Audiobook/1250839610?qid=1684348282&sr=1-1&ref=a_search_c3_lProduct_1_1&pf_rd_p=83218cca-c308-412f-bfcf-90198b687a2f&pf_rd_r=9J7QST184RZXRTC9QT0G&pageLoadId=tA8i6aZd4QUDYNis&creativeId=0d6f6720-f41c-457e-a42b-8c8dceb62f2c')
        # get_book_from_audible('https://www.audible.com/pd/Sapiens-Audiobook/B0741G911Q?qid=1684351595&sr=1-1&ref=a_search_c3_lProduct_1_1&pf_rd_p=83218cca-c308-412f-bfcf-90198b687a2f&pf_rd_r=PYM3GS42N24F7KKPVPGB&pageLoadId=1iWnnYanvxDpwKIT&creativeId=0d6f6720-f41c-457e-a42b-8c8dceb62f2c')
        # get_book_from_audible('https://www.audible.com/pd/Greenlights-Audiobook/0593294181?plink=QefDhNThrq2gmYU5&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_2_2&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=9XKK3ESA2HE5R4Y6AY19&pageLoadId=4buqcsk7SM3qGzqm&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        # get_book_from_audible('https://www.audible.com/pd/Project-Hail-Mary-Audiobook/B08G9PRS1K?plink=wfdgM1FzeqcfeYVJ&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_4_4&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=S011YHSKTF04ZW5A8E2B&pageLoadId=i0zj0JkuHE2RX7Ba&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        # get_book_from_audible('https://www.audible.com/pd/The-Martian-Audiobook/B082BHJMFF?plink=qGllyOasbh6MjecN&ref=a_pd_Projec_c5_adblp13npsbx_1_2&pf_rd_p=5aa07719-8365-431d-b233-1e84fbc18121&pf_rd_r=5PM896J4W6QDX5KPJ88W&pageLoadId=2RfnWNR4peayMI3t&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Artemis-Audiobook/B072R1CY4P?plink=mzEP5A3VHtUaaZbJ&ref=a_pd_Projec_c5_adblp13npsbx_1_1&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=A6ZYK2XVKXSTNT704RDT&pageLoadId=FXgqAG1yLEZ5tuzQ&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/The-Egg-Audiobook/B00Q5NQ3DO?plink=WVUzXpZ2zisywNTt&ref=a_pd_Artemi_c5_adblp13npsbx_1_5&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=6ABDMFGCAMT1XE46D9J1&pageLoadId=gYSO5aEgKf44Xk2E&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Infinite-Audiobook/B076QGRFGD?plink=wh0Q1NwxCcHu4viK&ref=a_pd_The-Eg_c5_adblp13npsbx_1_5&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=K45X60464KCZX63AYT7C&pageLoadId=n5DGct5hWDTlFCOd&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/A-Gift-of-Time-Audiobook/B0777TY894?plink=KLQE9UC2favcDf9s&ref=a_pd_Infini_c5_adblp13npsbx_1_4&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=7GF1Y0GNM5CQW9E3H77G&pageLoadId=syesuPMJk9JM7UKe&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Paradox-Bound-Audiobook/B074WH171J?plink=Q6ByF3ASqqND2pw8&ref=a_pd_A-Gift_c5_adblp13npsbx_1_2&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=SFZBRX3VCE81B62ZG38S&pageLoadId=x5CIZZKZWrvJsp2V&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Quantum-Radio-Audiobook/B0BP9LV7QV?plink=oz9d4sbqljgHwpDE&ref=a_pd_Parado_c5_adblp13npsbx_1_3&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=X3AZYCT4GBVGBKPRST2T&pageLoadId=Je3rFrTlmiF4AGiV&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Extinction-Series-The-Complete-Collection-Audiobook/B07T3DC2DN?plink=CSHugKu7JL5obRtC&ref=a_pd_Quantu_c5_adblp13npsbx_1_4&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=R7RY57E841Z982N2X2GQ&pageLoadId=YcqzjnsJlHt45l57&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Atomic-Habits-Audiobook/1524779261?plink=JWykH2lS1FDvtPVV&ref=a_hp_c6_adblp13nmpxxp13n-mpl-dt-c_1_2&pf_rd_p=e9ba4ed8-dba9-45da-b2f0-14a0835a7932&pf_rd_r=6M8YTA780R6STGHBQE80&pageLoadId=6nAfa1UxywySdEHI&creativeId=b970b979-5e97-421c-90ca-71388752a4f9')
        # get_book_from_audible('https://www.audible.com/pd/12-Rules-for-Life-Audiobook/B0797YBP7N?plink=hYKo0UtVfWzrgztL&ref=a_pd_Atomic_c5_adblp13npsbx_1_4&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=NJ8M7GBE3Y4WYMVKX5XP&pageLoadId=AjC26szMM4LR6FFE&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/The-Silent-Corner-Audiobook/B06Y61BGPW?plink=CYDdoH811VGqpHQN&ref=a_hp_c8_adblp13nmpalp13n-pbs-dt-c_2_4&pf_rd_p=997eac75-c975-469e-8d08-d166d5bb8233&pf_rd_r=4RWHWW33TQ04H45PP04W&pageLoadId=cYcwimcpZJDxrvn6&creativeId=933fe865-0b4b-49bb-abf2-06c37d86cf26')
        # get_book_from_audible('https://www.audible.com/pd/The-Outsider-Audiobook/B07957SPGB?plink=0z1MK3pTJDSdQzcn&ref=a_pd_The-Si_c5_adblp13npsbx_1_5&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=TQYJCJEQA2V4GWPJJKEA&pageLoadId=YL4u3oYuJTK7hDJI&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Cat-Vivian-Audiobook/B0B831M28J?plink=rNuIe6ju30JjtZhX&ref=a_hp_c8_adblp13nmpalp13n-pbs-dt-c_3_3&pf_rd_p=997eac75-c975-469e-8d08-d166d5bb8233&pf_rd_r=YN2JSJAHX16KPS8R76MS&pageLoadId=jJLqIaj6Tzy7V41r&creativeId=933fe865-0b4b-49bb-abf2-06c37d86cf26')
        # get_book_from_audible('https://www.audible.com/pd/The-Terminal-List-Audiobook/B078SG5VPQ?plink=4zLmZ6qP2i8hppg5&ref=a_pd_Killin_c5_adblp13npsbx_1_1&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=HKRGNJ2M719VM369ADXS&pageLoadId=BXWt58XHikohMbOg&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Where-the-Crawdads-Sing-Audiobook/B07FSNSLZ1?plink=6l4pbUivIkWol3iR&ref=a_pd_The-Te_c5_adblp13npsbx_3_5&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=CAX5N7ABVYSAZPCNN0PR&pageLoadId=qspTKa2a4hzkyoeK&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/To-Kill-a-Mockingbird-Audiobook/B00K1HQVOQ?plink=NbDTHdkt9F30rZds&ref=a_pd_Where-_c5_adblp13npsbx_1_4&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=VDV90XQNWWGNKAAT2BV8&pageLoadId=bz7vnAZJtk4BzArd&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/The-Grapes-of-Wrath-Audiobook/B004VMD7BW?plink=gsR25xnfB0HydMQV&ref=a_pd_To-Kil_c5_adblp13npsbx_1_5&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=QF5SPKXGR90HVDWQA6HC&pageLoadId=DxCwUc12lxNdeXGX&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/The-Great-Gatsby-Audiobook/B00BWYDMK8?plink=BNtZRPjVKaDRDofh&ref=a_pd_The-Gr_c5_adblp13npsbx_1_6&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=37QKYJAVGMMJF97YJN6X&pageLoadId=G1iVqYwRCYBChv82&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Fahrenheit-451-Audiobook/B00M4PXF6K?plink=KIpihz8TbRkVDF4H&ref=a_pd_The-Gr_c5_adblp13npsbx_1_1&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=57DZREFDTR2GXVD9ZSDX&pageLoadId=yg3hXpW5HxOvdtyi&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Catch-22-Audiobook/B074TXRQDM?plink=t9t7zMdIl70cCcGa&ref=a_pd_Fahren_c5_adblp13npsbx_1_4&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=E3F9A070C93X2SFWNKY2&pageLoadId=Sa0aFPW82INM9LyA&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/For-Whom-the-Bell-Tolls-Audiobook/B002V1M6IA?plink=sBZvhFzWsxDnUrqR&ref=a_pd_Catch-_c5_adblp13npsbx_1_3&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=HKAM968NE1GVY9R3MMMB&pageLoadId=yh1JfXtnCrKJ4BfW&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Slaughterhouse-Five-Audiobook/B015ELUYL4?plink=sBZvhFzWsxDnUrqR&ref=a_pd_Catch-_c5_adblp13npsbx_1_1&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=HKAM968NE1GVY9R3MMMB&pageLoadId=yh1JfXtnCrKJ4BfW&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
        # get_book_from_audible('https://www.audible.com/pd/Lord-of-the-Flies-Audiobook/B002V8KNLK?plink=sBZvhFzWsxDnUrqR&ref=a_pd_Catch-_c5_adblp13npsbx_1_4&pf_rd_p=4c082384-61f5-4e24-ad12-0ecfce1ecd31&pf_rd_r=HKAM968NE1GVY9R3MMMB&pageLoadId=yh1JfXtnCrKJ4BfW&creativeId=4a11ed03-ceae-4b57-9974-9953fec40565')
 
