
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const dotenv = require("dotenv");
dotenv.config();
const client = new OpenAIClient(
    process.env.OPENAI_ENDPOINT,
    new AzureKeyCredential(process.env.OPENAI_API_KEY)
);


const deploymentId = process.env.OPENAI_DEPLOYMENT_NAME;


async function Send(type, messages, messageHandler) {
    if (type == 4)
        await DefaultSend(messages, messageHandler);
    else if (type == 5) {
        await DevTeamAISend(messages, messageHandler);
    }
}


async function DefaultSend(messages, messageHandler) {
    const events = await client.listChatCompletions(deploymentId, messages,
        { maxTokens: 8000 });
    for await (const event of events) {
        for (const choice of event.choices) {
            const delta = choice.delta?.content;
            if (delta !== undefined) {
                if (messageHandler != null) {
                    messageHandler(delta);
                }

            }
        }
    }
}
async function DevTeamAISend(messages, messageHandler) {
    messageHandler("준비중 입니다.");
}

module.exports.Send = Send;