import os
import sys

from langchain.utilities import GoogleSearchAPIWrapper
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chat_models import AzureChatOpenAI
from langchain.chains import RetrievalQA,RetrievalQAWithSourcesChain

AZURE_OPENAI_KEY = '1038ebbc516d4d38a620b71a2eb02e92'
AZURE_OPENAI_ENDPOINT = 'https://open-ai-rg-open-ai.openai.azure.com'
AZURE_OPENAI_API_VERSION = '2023-03-15-preview'
AZURE_OPENAI_TYPE ="Azure"

GOOGLE_API_KEY = "AIzaSyBVNNwp6NRuj31i0C3nVS7lO2KCaXJjvSE"
GOOGLE_CSE_ID = "722a941620ab7448e"

os.environ["OPENAI_API_TYPE"] =AZURE_OPENAI_TYPE
os.environ["OPENAI_API_KEY"] = AZURE_OPENAI_KEY
os.environ["OPENAI_API_BASE"] = AZURE_OPENAI_ENDPOINT
os.environ["OPENAI_API_VERSION"] = AZURE_OPENAI_API_VERSION

os.environ["GOOGLE_CSE_ID"] = GOOGLE_CSE_ID
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

def searchOpenAI(query,dbDir):

    
    embedding = OpenAIEmbeddings(model="text-embedding-ada-002",  chunk_size=1 )
    
    vectordb = Chroma( persist_directory=dbDir,  embedding_function=embedding)

    retriever = vectordb.as_retriever()
    
    #docs = retriever.get_relevant_documents(query)
    
    #print(docs)

    llm = AzureChatOpenAI(deployment_name='gpt-35-turbo',  max_tokens=500)

    qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type='stuff',retriever=retriever)
    llm_response = qa_chain(query)
    print(llm_response["result"])




    
query = ""
for v in range(1, len(sys.argv)):
    query = query +" "+sys.argv[v]

if(len(query) > 0):
    searchOpenAI(query,"googleSearchDB")
