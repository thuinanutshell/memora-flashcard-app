# Memora - AI-powered Flashcard App
During this summer, I have to prepare for technical interviews. There are many new and old concepts that I have to learn. So I want a space to help me perform deliberate practice and record my thought processes along the way. Memora is a flashcard app that helps you create, organize, and analyze your study decks and cards as well as keep track of your progress.

# Key Features
1. CRUD operations for folders, study decks and flashcards
2. Analytics-related operations to compute aggregate metrics like average accuracy score or improvement over time
3. AI-supported card and insights generation.

# User Flow
1. The user accesses the web app and creates a new account if they are a new user or signs in if they are an existing user
2. After successful authentication, user is redirected to the dashboard page where all the folders are displayed
3. In the **Dashboard page**, user can do 3 things:
    - Create a new folder with name and detailed description
    - Choose a folder to learn and be directed to the folder page
    - Navigate to other sections, namely Analytics, Profile, or Review Cards to see all the cards that have not yet been fully reviewed
4. In the **Folder page**, user can create a new study deck with a subtopic.
5. In the **Study Deck page**, user can do 2 things:
    - Create a new flashcard manually with question, answer and resource
    - Generate AI flashcard by uploading a PDF or source of truth
6. For each **Card**, the user can choose to review the card by typing the answer and get the accuracy score
7. Inside the **Analytics page**, the user can see their study streak, the number of cards due in 1 day, 7 days or 21 days, and the accuracy trends by folder:
8. User can use AI to analyze the learning patterns and progress to suggest a better study plan or roadmap to enhance the knowledge for that topic.

![alt text](images/user_flow.png)
   
# Backend (Flask-Python)
## Database Design
![alt text](images/db_design.png)
## RESTful APIs
# Frontend (JavaScript-React)
https://www.figma.com/design/yTwM5Jfw4pBaNHggZQgIc6/Flashcards-Web-App?node-id=1-2&t=zc23a2Gq7XREdfmF-1

## Key Takeaways
- Standardizing the format and structure of the backend response (success, failure, duplicated, etc.) is tremendously helpful for integrating with the frontend, especially when rendering the data like lists. I encountered several bugs when fetching the data from the backend to the frontend because the structure of the response message is either nested or inconsistent.
## Next Steps
