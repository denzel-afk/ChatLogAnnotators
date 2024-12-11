# ChatLogAnnotators

ChatLogAnnotators is a web application that allows users to upload a chatlog.json file and annotate it manually or via auto-generated annotations powered by a GPT model. It uses MongoDB as the NoSQL database, Django for the backend, and React (Next.js) for the frontend.

## Prerequisites
To develop or run this project on your local machine, ensure you have the following software installed:

1. Docker Desktop (Install Docker)
2. Git (Install Git)
3. Node.js and npm (Install Node.js)

## Running the Project

### Backend (Django)

To run the backend using Docker, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/ChatLogAnnotators.git
   cd ChatLogAnnotators

2. Navigate to the backend directory:
    ```sh
    cd backend
    ```

3. Build and run teh Docker containers:
    ```sh
    docker-compose up --build
    ```

### Frontend (Next.js)

To run the frontend, follow these steps:
1. Ensure Node.js and npm are installed on your machine. You can download and install them by searching Node.js in your browser

2. Navigate to the frontend directory:
    ```sh
    cd frontend
    ```

3. Install the dependencies:
    ```
    npm install
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

This will start the frontend development server on `http://localhost:3000`.

