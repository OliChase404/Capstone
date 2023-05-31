# Capstone


DeepReads in an audiobook recommendation platform that learns a user's preferences and generates increasingly accurate 
recommendations as the user interacts with the platform.

The audiobook dataset has been obtained by targeted web-scraping of audible.com. 
It currently contains approximately 17500 audiobooks and will eventually contain audibles complete catalog.

The algorithm uses audible user reviews to draw connections between books, if an audible user has 
favorably reviewed to audiobooks, a connection in created between the two books.
These connections, along with data about the books concerned such as author, narrator and genre tags, are used to power 
the recommendation engine.

Pages:

Home---------------------------------------

The home page is the users main point of contact with the app.
This is where new recommendations are displayed and the user chooses where to dislike, skip, like or favorite each audiobook.
There is also a link the audiobooks page on audible.com.
Audiobooks are displayed one at a time.
If the user chooses like, dislike of favorite, the choice is saved and the book will be added to the appropriate list.
Once this decision has been made, the book will never be recommended again.

If the user chooses the "skip for now" option, the audiobook will be not be recommended again until the user has been inactive for 8 hours.

The audiobook card displayed for each recommendation includes:
-Title
-Author**
-Narrator**
-Summary
-Cover Image
-5 minute audio sample
-Genre tags**

**(Can be clicked to toggle between unsorted, disliked, liked and favorites lists)

------------------------------

My Profile---------------------------------

The My Profile page allows the user to change there profile picture by clicking the 
image in the center of the screen or by dragging in a file from their computer.

Drag and drop here is handled using react-dropzone.
Image storage is handled with the Cloudinary API.

Here the User can also edit there username, Email address and password.
They also have the option to delete their account.

----------------------------

My Data--------------------------------

This page provides an overview of the data generated so far.
This includes total sorted books, total likes, dislikes and favorites, as well as similar lists for authors narrators and genres.

--------------------------------

Favorites, Likes and Dislikes----------------------

These lists display the relevant audiobooks and give the users the option to move the book to each of the other lists.
There is also a link to each audiobooks page on audible.com.

---------------------------------------

Authors, Narrators and Genres---------------

These pages allow users search through all the items in the data base for the relevant category and sort those items into four lists,
Unfiltered, Disliked, Liked and Favorites.

Sorting is done by dragging and dropping items between the lists.
Drag and drop is handled here with react-beautiful-dnd.
