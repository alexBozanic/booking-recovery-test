import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  ScanCommand,
  UpdateCommand,
  DeleteCommand 
} from "@aws-sdk/lib-dynamodb";
import { 
  CreateTableCommand, 
  DescribeTableCommand, 
  ResourceNotFoundException 
} from "@aws-sdk/client-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  } : undefined,
});

export const db = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || "booking-recovery-users",
  CLIENTS: process.env.DYNAMODB_CLIENTS_TABLE || "booking-recovery-clients",
  BOOKINGS: process.env.DYNAMODB_BOOKINGS_TABLE || "booking-recovery-bookings",
  CAMPAIGNS: process.env.DYNAMODB_CAMPAIGNS_TABLE || "booking-recovery-campaigns",
};

// Database service functions
export class DatabaseService {
  // User operations
  static async createUser(userData: any) {
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: userData
    });
    return await db.send(command);
  }

  static async getUserById(userId: string) {
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id: userId }
    });
    const result = await db.send(command);
    return result.Item;
  }

  static async getUserByEmail(email: string) {
    const command = new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    });
    const result = await db.send(command);
    return result.Items?.[0];
  }

  // Client operations
  static async createClient(clientData: any) {
    const command = new PutCommand({
      TableName: TABLES.CLIENTS,
      Item: clientData
    });
    return await db.send(command);
  }

  static async getClientsByUserId(userId: string) {
    const command = new QueryCommand({
      TableName: TABLES.CLIENTS,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    });
    const result = await db.send(command);
    return result.Items || [];
  }

  static async getClientByTrackingId(trackingId: string) {
    const command = new QueryCommand({
      TableName: TABLES.CLIENTS,
      IndexName: "TrackingIdIndex",
      KeyConditionExpression: "trackingId = :trackingId",
      ExpressionAttributeValues: {
        ":trackingId": trackingId
      }
    });
    const result = await db.send(command);
    return result.Items?.[0];
  }

  // Booking operations
  static async createBooking(bookingData: any) {
    const command = new PutCommand({
      TableName: TABLES.BOOKINGS,
      Item: bookingData
    });
    return await db.send(command);
  }

  static async getBookingsByTrackingId(trackingId: string, limit = 50) {
    const command = new QueryCommand({
      TableName: TABLES.BOOKINGS,
      IndexName: "TrackingIdIndex",
      KeyConditionExpression: "trackingId = :trackingId",
      ExpressionAttributeValues: {
        ":trackingId": trackingId
      },
      ScanIndexForward: false,
      Limit: limit
    });
    const result = await db.send(command);
    return result.Items || [];
  }

  static async updateBookingStatus(bookingId: string, status: string) {
    const command = new UpdateCommand({
      TableName: TABLES.BOOKINGS,
      Key: { id: bookingId },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString()
      }
    });
    return await db.send(command);
  }

  // Analytics operations
  static async getBookingStats(trackingId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const command = new QueryCommand({
      TableName: TABLES.BOOKINGS,
      IndexName: "TrackingIdIndex",
      KeyConditionExpression: "trackingId = :trackingId AND createdAt >= :startDate",
      ExpressionAttributeValues: {
        ":trackingId": trackingId,
        ":startDate": startDate.toISOString()
      }
    });
    
    const result = await db.send(command);
    const bookings = result.Items || [];
    
    const stats = {
      total: bookings.length,
      abandoned: bookings.filter(b => b.status === 'abandoned').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      recovered: bookings.filter(b => b.status === 'recovered').length
    };
    
    stats.recoveryRate = stats.abandoned > 0 ? 
      ((stats.recovered / stats.abandoned) * 100).toFixed(1) : '0.0';
    
    return stats;
  }
}
