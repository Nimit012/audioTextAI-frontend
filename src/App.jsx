import React, { useState, useEffect } from "react";
import "./App.css";

import { useSpeechRecognition } from "react-speech-kit";

const App = () => {
  const [functionCallResponse, setFunctionCallResponse] = useState(null);

  const [showLoader, setShowLoader] = useState(false);
  const [value, setValue] = useState("");
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [question, setQuestion] = useState("What is the Capital of India?");
  //   let question = "What is the Capital of India?";
  const questionArray = [
    "What is the Capital of India?",
    "Which continent is India located in?",
    "Which currency is used in India?",
    "What is the national bird of India?",
    "How many states does India have?",
    "How many union territories does India have?",
  ];
  //   const question = "who is the strongest avenger";
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setValue(result);
    },
  });

  function generateRandomNumber() {
    const randomDecimal = Math.random();
    const randomNumber = Math.floor(randomDecimal * 6);
    return randomNumber;
  }

  useEffect(() => {
    setQuestion(questionArray[generateRandomNumber()]);
  }, []);

  const resetAudio = () => {
    setShowLoader(false);
    stop();
    setValue("");
    setFunctionCallResponse(null);
    setShowCorrectAnswer(false);
  };

  const startRecording = () => {
    listen();
    setValue("");
  };

  const stopRecording = () => {
    stop();
  };

  const getData = async () => {
    let answer = value;
    setShowLoader(true);

    let inputData = {
      question: question,
      answer: answer,
    };

    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputData,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("backend response", data);
        setShowLoader(false);
        if (!data) {
          alert("API failed! Try again.");
        }

        let result = data.output;
        console.log("data.finish_reason", result.finish_reason);
        if (result.finish_reason === "stop") {
          console.log("response", result.message);
        } else if (result.finish_reason === "function_call") {
          const functionArgs = JSON.parse(
            result.message.function_call.arguments
          );
          let functionResponse = {
            name: result.message.function_call.name,
            isCorrect: functionArgs.correct,
            score: functionArgs.score,
            correctAnswer: functionArgs.correctAnswer,
          };
          setFunctionCallResponse(functionResponse);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="container">
      <h1>{question}</h1>

      <div className="speech-container">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="button-container">
          <button onClick={startRecording}>Start</button>
          <button onClick={stopRecording}>Stop</button>
          <button onClick={resetAudio}> Reset</button>
        </div>
        {listening && <div>Go ahead I'm listening</div>}
      </div>

      <button disabled={!value} className="submit" onClick={getData}>
        Submit
      </button>

      {showLoader && (
        <div class="page-loader">
          <div class="spinner"></div>
          <div class="txt">Loading...</div>
        </div>
      )}
      {functionCallResponse?.isCorrect && (
        <div className="footer">
          <h2>Your Answer is Correct</h2>
          <h3>Your Score : {functionCallResponse.score}</h3>
        </div>
      )}
      {functionCallResponse?.isCorrect === false && (
        <div className="footer">
          <h2>Your answer is Not Correct</h2>
          <h3>Your Score : {functionCallResponse.score}</h3>
          {!showCorrectAnswer && (
            <button
              onClick={() => {
                setShowCorrectAnswer(true);
              }}
            >
              Show correct Answer
            </button>
          )}
          {showCorrectAnswer && (
            <h2>Correct Answer is: {functionCallResponse.correctAnswer} </h2>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
