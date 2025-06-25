from langchain import hub
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_upstage import UpstageEmbeddings
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings

from langchain_core.output_parsers import StrOutputParser
from abc import ABC, abstractmethod
from operator import itemgetter
import os

from langchain.text_splitter import RecursiveCharacterTextSplitter


class RetrievalChain(ABC):
    def __init__(self):
        self.source_uri = None
        self.k = 5

    @abstractmethod
    def load_documents(self, source_uris):
        """loader를 사용하여 문서를 로드합니다."""
        pass

    @abstractmethod
    def create_text_splitter(self):
        """text splitter를 생성합니다."""
        # pass
        return RecursiveCharacterTextSplitter(
        # Set a really small chunk size, just to show.
        chunk_size=400,
        chunk_overlap=100,
        length_function=len,
        )

    def split_documents(self, docs, text_splitter):
        """text splitter를 사용하여 문서를 분할합니다."""
        return text_splitter.split_documents(docs)

    # def create_embedding(self):
    #     return UpstageEmbeddings(model="solar-embedding-1-large")

    def create_embedding(self):
        os.environ["AZURE_OPENAI_API_KEY"] = '6515701982584d9b9c03317591233c46'
        os.environ["AZURE_OPENAI_ENDPOINT"] = 'https://aoai-spon-estus1.openai.azure.com/'
        return AzureOpenAIEmbeddings(
                azure_deployment='txt-embed-3-larg-estus1',
                openai_api_version='2024-02-01',
            )

    def create_vectorstore(self, split_docs):
        return FAISS.from_documents(
            documents=split_docs, embedding=self.create_embedding()
        )

    def create_retriever(self, vectorstore):
        # MMR을 사용하여 검색을 수행하는 retriever를 생성합니다.
        dense_retriever = vectorstore.as_retriever(
            search_type="mmr", search_kwargs={"k": self.k}
        )
        return dense_retriever

    def create_model(self):
        os.environ["AZURE_OPENAI_API_KEY"] = '352a6bee97b5451ab5866993a7ef4ce4'
        os.environ["AZURE_OPENAI_ENDPOINT"] = 'https://aoai-spn-krc.openai.azure.com/'
        return AzureChatOpenAI(  
            api_version = '2024-02-01',
            azure_deployment = 'gpt-4o-kr-spn',
            temperature = 0.0
            )

    def create_prompt(self):
        return hub.pull("teddynote/rag-korean-with-source")

    @staticmethod
    def format_docs(docs):
        return "\n".join(docs)

    def create_chain(self):
        docs = self.load_documents(self.source_uri)
        text_splitter = self.create_text_splitter()
        split_docs = self.split_documents(docs, text_splitter)
        self.vectorstore = self.create_vectorstore(split_docs)
        self.retriever = self.create_retriever(self.vectorstore)
        model = self.create_model()
        prompt = self.create_prompt()
        self.chain = (
            {"question": itemgetter("question"), "context": itemgetter("context")}
            | prompt
            | model
            | StrOutputParser()
        )
        return self