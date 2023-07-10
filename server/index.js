import { Configuration, OpenAIApi } from "openai";





const configuration = new Configuration({
    apiKey: "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",
  });
  const openai = new OpenAIApi(configuration);



  


  // const generateTextFromAudio = async (stream) => {
  //   const model = "whisper-1"
  //   // const audioFile = fs.createReadStream("../public/answer.m4a");
  //   const response = await openai.createTranscription(stream, model);
  //   const responseMessage = response.data.text;
  //   console.log("text extracted from Audio: ", responseMessage);

  //   return responseMessage;
  // }

  export const runConversation = async (answer) => {

    let messages = [
      { role: "system", content: "act as a tutor" },
      { role: "user", content: "Question 1: what is the sum of 2 and 5" },
    ]
    // let extractedText = await generateTextFromAudio(stream);
    messages.push({ role: "user", content: `Answer ${answer}` });
    console.log("messages", messages)
    let response = generateResult(messages);

    return response;

  }


  const generateResult = async (messages) => {

    let functions = [{
      "name": "checkAnswers",
      "description": "checks if answer is corrent or not, and provides correct answer",
      "parameters": {
        "type": "object",
        "properties": {
          "correct": {
            "type": "boolean",
            "description": "if answer is correct then true else false",
          },
          "wrong": {
            "type": "boolean",
            "description": "if answer is correct then false else true",
          },
          "correctAnswer": {
            "type": "string",
            "description": "correct answer to the question",
          },
        },
        "required": ["correct", "wrong", "correctAnswer"],
      },
    }]


    let secondResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: messages,
      functions: functions,
      function_call: 'auto',
    }
    )

    console.log("generated result: ", secondResponse.data.choices[0]);
    return secondResponse.data.choices[0];
  }

