import { Configuration, OpenAIApi } from "azure-openai";


this.openAiApi = new OpenAIApi(
    new Configuration({
        apiKey: this.apiKey,
        // add azure info into configuration
        azure: {
            apiKey: process.env.OPENAI_API_KEY,
            endpoint: process.env.OPENAI_API_KEY,
            // deploymentName is optional, if you donot set it, you need to set it in the request parameter
            deploymentName: 'gpt-35-turbo',
        }
    }),
);