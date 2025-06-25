from langchain_core.prompts import load_prompt
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI, AzureChatOpenAI, AzureOpenAIEmbeddings

from abc import ABC, abstractmethod
from operator import itemgetter
from langchain import hub
import os


class RetrievalChain(ABC):
    def __init__(self):
        self.source_uri = None
        self.k = 10

    @abstractmethod
    def load_documents(self, source_uris):
        """loader를 사용하여 문서를 로드합니다."""
        pass

    @abstractmethod
    def create_text_splitter(self):
        """text splitter를 생성합니다."""
        pass

    def split_documents(self, docs, text_splitter):
        """text splitter를 사용하여 문서를 분할합니다."""
        return text_splitter.split_documents(docs)

    def create_embedding(self):
        # return OpenAIEmbeddings(model="text-embedding-3-small")
        return AzureOpenAIEmbeddings(
            api_key=os.getenv("AZURE_OPENAI_API_KEY"), # Azure OpenAI API 키를 환경 변수에서 가져옵니다.
            azure_deployment=os.getenv('AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME'), # 사용할 Azure 배포 모델을 설정합니다.
            openai_api_version=os.getenv('AZURE_OPENAI_API_VERSION'), # OpenAI API 버전을 설정합니다.
            azure_endpoint =os.getenv('AZURE_OPENAI_ENDPOINT') # Azure OpenAI 엔드포인트를 환경 변수에서 가져옵니다.
        )

    def create_vectorstore(self, split_docs):
        return FAISS.from_documents(
            documents=split_docs, embedding=self.create_embedding()
        )

    def create_retriever(self, vectorstore):
        # MMR을 사용하여 검색을 수행하는 retriever를 생성합니다.
        dense_retriever = vectorstore.as_retriever(
            search_type="similarity", search_kwargs={"k": self.k}
        )
        return dense_retriever

    def create_model(self):
        # return ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
        return AzureChatOpenAI(
            api_key = os.getenv("AZURE_OPENAI_API_KEY"), # Azure OpenAI API 키를 환경 변수에서 가져옵니다.
            api_version = os.getenv("AZURE_OPENAI_API_VERSION"), # OpenAI API 버전을 설정합니다.
            azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT"), # Azure OpenAI 엔드포인트를 환경 변수에서 가져옵니다.
            model= os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME_GPT41_MINI"), # 사용할 모델을 설정합니다.
            # streaming=False, # 스트리밍
            temperature=0,
            # max_tokens=4096,
        )

    def create_prompt(self):
        return hub.pull("teddynote/rag-prompt-chat-history")

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
            {
                "question": itemgetter("question"),
                "context": itemgetter("context"),
                "chat_history": itemgetter("chat_history"),
            }
            | prompt
            | model
            | StrOutputParser()
        )
        return self
