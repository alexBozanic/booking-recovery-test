import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

// Define a basic type for user data, can be expanded later
interface UserData {
  id: string;
  email: string;
  name: string;
  password?: string; // Password should be handled carefully
  [key: string]: any; // Allow other properties
}

// Define a type for client data
interface ClientData {
  id: string;
  userId: string;
  [key: string]: any; // Allow other properties
}

// Define a type for booking data
interface BookingData {
  id: string;
  trackingId: string;
  [key: string]: any; // Allow other properties
}


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
  static async createUser(userData: UserData) {
    const command = new PutCommand({
      TableName: TABLES.USERS,
      Item: userData
    });
    return await db.send(command);
  }

  static async getUserById(userId: string): Promise<UserData | undefined> {
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id: userId }
    });
    const result = await db.send(command);
    return result.Item as UserData | undefined;
  }

  static async getUserByEmail(email: string): Promise<UserData | undefined> {
    const command = new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email
      }
    });
    const result = await db.send(command);
    return result.Items?.[0] as UserData | undefined;
  }

  // Client operations
  static async createClient(clientData: ClientData) {
    const command = new PutCommand({
      TableName: TABLES.CLIENTS,
      Item: clientData
    });
    return await db.send(command);
  }

  static async getClientsByUserId(userId: string): Promise<ClientData[]> {
    const command = new QueryCommand({
      TableName: TABLES.CLIENTS,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    });
    const result = await db.send(command);
    return (result.Items as ClientData[]) || [];
  }

  static async getClientByTrackingId(trackingId: string): Promise<ClientData | undefined> {
    const command = new QueryCommand({
      TableName: TABLES.CLIENTS,
      IndexName: "TrackingIdIndex",
      KeyConditionExpression: "trackingId = :trackingId",
      ExpressionAttributeValues: {
        ":trackingId": trackingId
      }
    });
    const result = await db.send(command);
    return result.Items?.[0] as ClientData | undefined;
  }

  // Booking operations
  static async createBooking(bookingData: BookingData) {
    const command = new PutCommand({
      TableName: TABLES.BOOKINGS,
      Item: bookingData
    });
    return await db.send(command);
  }

  static async getBookingsByTrackingId(trackingId: string, limit = 50): Promise<BookingData[]> {
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
    return (result.Items as BookingData[]) || [];
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
    const bookings = (result.Items as BookingData[]) || [];
    
    const stats: {
        total: number;
        abandoned: number;
        completed: number;
        recovered: number;
        recoveryRate?: string;
    } = {
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
