import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { UserData, Client, Booking, Campaign } from '@/types';

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE!;
const CLIENTS_TABLE = process.env.DYNAMODB_CLIENTS_TABLE!;
const BOOKINGS_TABLE = process.env.DYNAMODB_BOOKINGS_TABLE!;
const CAMPAIGNS_TABLE = process.env.DYNAMODB_CAMPAIGNS_TABLE!;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class DatabaseService {
  // --- User Management ---

  async getUserByEmail(email: string): Promise<UserData | null> {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { email },
    });
    const { Item } = await docClient.send(command);
    if (!Item) return null;
    // Return user data without the password for general use
    const { password, ...userData } = Item;
    return userData as UserData;
  }

  // NEW FUNCTION FOR AUTHENTICATION
  async getUserForAuth(email: string): Promise<{ id: string; email: string; name: string; password: string } | null> {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { email },
    });
    const { Item } = await docClient.send(command);
    return Item ? (Item as { id: string; email: string; name: string; password: string }) : null;
  }

  async createUser(userData: Omit<UserData, 'id'> & { password: string }): Promise<UserData> {
    const newUser = {
      id: uuidv4(),
      ...userData,
    };
    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: newUser,
    });
    await docClient.send(command);
    const { password, ...result } = newUser;
    return result;
  }

  // --- Client (Website) Management ---

  async getClientsByUserId(userId: string): Promise<Client[]> {
    const command = new QueryCommand({
      TableName: CLIENTS_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });
    const { Items } = await docClient.send(command);
    return (Items as Client[]) || [];
  }

  async createClient(clientData: { userId: string; name: string; domain: string }): Promise<Client> {
    const newClient: Client = {
      id: uuidv4(),
      trackingId: `trk_${uuidv4()}`,
      ...clientData,
    };
    const command = new PutCommand({
      TableName: CLIENTS_TABLE,
      Item: newClient,
    });
    await docClient.send(command);
    return newClient;
  }

  // --- Other methods would go here (for bookings, campaigns, etc.) ---
  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking> {
    const newBooking: Booking = {
      id: uuidv4(),
      ...bookingData,
    };
    const command = new PutCommand({
      TableName: BOOKINGS_TABLE,
      Item: newBooking,
    });
    await docClient.send(command);
    return newBooking;
  }

  async createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: uuidv4(),
      ...campaignData,
    };
    const command = new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: newCampaign,
    });
    await docClient.send(command);
    return newCampaign;
  }
}
