const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "lambda-test";

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// "body": "{\"price\": 1000,\"name\": \"note\"}"

module.exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = { "Content-Type": "application/json" };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        await dynamo.send(new DeleteCommand({ TableName: tableName, Key: { id: event.pathParameters.id } }));
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}": {
        const result = await dynamo.send(new GetCommand({ TableName: tableName, Key: { id: event.pathParameters.id } }));
        body = result.Item;
        break;
      }
      case "GET /items": {
        const result = await dynamo.send(new ScanCommand({ TableName: tableName }));
        body = result.Items;
        break;
      }
      case "PUT /items": {
        let { price, name } = JSON.parse(event.body);
        const id = uuidv4();
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id,
              price,
              name
            }
          })
        );
        body = `Put item ${id}`;
        break;
      }
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    console.error(err);
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
