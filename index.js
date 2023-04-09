module.exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Go Serverless v3.0! Your function executed successfully! : ${process.env.FOO}`,
        input: event,
        context
      },
      null,
      2
    )
  };
};
