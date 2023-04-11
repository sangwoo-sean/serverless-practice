const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ endpoint: "http://localhost:8000" });

const dynamo = DynamoDBDocumentClient.from(client);

const TableName = "Music";

module.exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = { "Content-Type": "application/json" };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        await dynamo.send(new DeleteCommand({ TableName, Key: { id: event.pathParameters.id } }));
        body = `Deleted item ${event.pathParameters.id}`;
        break;
      case "GET /items/{id}": {
        const { Artist, SongTitle } = event.pathParameters;
        const result = await dynamo.send(new GetCommand({ TableName, Key: { Artist, SongTitle } }));
        body = result.Item;
        break;
      }
      case "GET /items": {
        const result = await dynamo.send(new ScanCommand({ TableName }));
        body = result.Items;
        break;
      }
      case "PUT /items": {
        const now = Date.now().toString().substring(9, 13);
        let { Artist, AlbumTitle, Awards, SongTitle } = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName,
            Item: {
              Artist,
              AlbumTitle: AlbumTitle + now,
              Awards: Math.round(Math.random() * 10),
              SongTitle: SongTitle + now
            }
          })
        );
        body = `Put item ${SongTitle + now}`;
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
