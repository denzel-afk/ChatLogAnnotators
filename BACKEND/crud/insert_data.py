import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# MongoDB connection details
COSMOSDB_CONNECTION_STRING = os.getenv("COSMOS_DB_URI")
DATABASE_NAME = "chatlog_db"
COLLECTION_NAME = "chatlog_collection"

def chunk_data(data, chunk_size):
    """Splits data into smaller chunks."""
    for i in range(0, len(data), chunk_size):
        yield data[i:i + chunk_size]

def insert_data():
    # Connect to CosmosDB
    client = MongoClient(COSMOSDB_CONNECTION_STRING)
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]

    # Load the chatlog JSON file
    with open('../DATA/chatlog.json', 'r') as file:
        chatlog_data = json.load(file)

    # Split the chatlog data into chunks
    chunk_size = 500 
    chatlog_chunks = chunk_data(chatlog_data['chatlog'], chunk_size)

    # Insert each chunk into the database, since the chatlog.json > 2 MB, so we need to divide into some chunks
    for i, chunk in enumerate(chatlog_chunks):
        for chat in chunk:
            messages = chat['messages']
            for message in messages:
                if 'token_cost' not in message or message['token_cost'] is None:
                    message['token_cost'] = {"cost": "0.0", "tokens": 0}

            # Prepare the document for insertion with each chunk and some initial values
            document = {
                "stime": chat.get('stime', {}),
                "messages": messages,
                "last_interact": chat.get('last_interact', {}),
                "llm_deployment_name": chat.get('llm_deployment_name', ''),
                "llm_model_name": chat.get('llm_model_name', ''),
                "vectorstore_index": chat.get('vectorstore_index', ''),
                "overall_cost": chat.get('overall_cost', {}),
                "person": chat.get('Person', '')
            }

            collection.insert_one(document)

        print(f"Inserted chunk {i+1}")

if __name__ == "__main__":
    insert_data()
