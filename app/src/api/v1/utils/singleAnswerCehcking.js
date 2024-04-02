module.exports = ({ answer, answerProvided }) => {
  const updatedAnswer = {
    ...answer._doc,
    correctAnswer: answer.answer,
    answerProvided,
    match: false,
    question: answer.title,
  };
  const answerEquality =
    JSON.stringify(updatedAnswer.correctAnswer) ===
    JSON.stringify(updatedAnswer.answerProvided);

  if (answerEquality) {
    updatedAnswer.match = true;
  }

  return updatedAnswer;
};
