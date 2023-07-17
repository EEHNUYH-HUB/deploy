const { Configuration, OpenAIApi } = require("azure-openai")
const dotenv = require("dotenv");
dotenv.config();



function messageCombiner(a, b) {
    return a.map((k, i) => ({ sender: k, text: b[i] }));
}

function createPrompt(system_message, messages) {
    let prompt = system_message;
    for (const message of messages) {
        prompt += `\n<|im_start|>${message.sender}\n${message.text}\n<|im_end|>`;
    }
    prompt += "\n<|im_start|>assistant\n";
    return prompt;
}

async function azureOpenAiChatGPT(conversation) {
    console.log("S")
    const messages = messageCombiner(conversation.past_user_inputs, conversation.generated_responses);
    const systemMessage = "<|im_start|>system\n I am assistant.\n<|im_end|>"
    messages.push({ sender: "user", text: conversation.text });

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        // add azure info into configuration
        azure: {
            apiKey: process.env.OPENAI_API_KEY,
            endpoint: process.env.OPENAI_ENDPOINT,
            // deploymentName is optional, if you donot set it, you need to set it in the request parameter
            deploymentName: process.env.OPENAI_DEPLOYMENT_NAME,
        }
    })


    const openai = new OpenAIApi(configuration);
    try {
        const completion = await openai.createCompletion({
            prompt: createPrompt(systemMessage, messages),
            max_tokens: 800,
            temperature: 0.7,
            frequency_penalty: 0,
            presence_penalty: 0,
            top_p: 0.95,
            stop: ["<|im_end|>"]
        }, {
            headers: {
                'api-key': process.env.OPENAI_API_KEY,
            },
            params: { "api-version": process.env.OPENAI_API_VERSION }
        });

        var r = completion.data.choices[0].text;
        console.log(r)
        return r;
    } catch (e) {
        console.error(e);
        return "";
    }
}


module.exports.azureOpenAiChatGPT = azureOpenAiChatGPT;
