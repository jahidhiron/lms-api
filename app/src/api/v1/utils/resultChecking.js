module.exports = (answer) => {
  let totalScore = 0;
  let totalAcquireScore = 0;

  for (let i = 0; i < answer.length; i++) {
    const score = parseInt(answer[i].score);
    const answerEquality =
      JSON.stringify(answer[i].correctAnswer) ===
      JSON.stringify(answer[i].answerProvided);

    answer[i].acquireScore = 0;
    if (answerEquality) {
      totalAcquireScore += score;
      answer[i].acquireScore = score;
    }

    totalScore += score;
  }

  return { totalScore, totalAcquireScore, checkedAnswer: answer };
};
