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
  // User Management
  async getUserByEmail(email: string): Promise<UserData | null> {
    const { Item } = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { email } }));
    if (!Item) return null;
    const { passwordHash, ...userData } = Item;
    return userData as UserData;
  }
  async getUserForAuth(email: string) {
    const { Item } = await docClient.send(new GetCommand({ TableName: USERS_TABLE, Key: { email } }));
    return Item as { id: string; email: string; name: string; passwordHash: string } | null;
  }
  async createUser(userData: Omit<UserData, 'id'>): Promise<UserData> {
    const newUser = { id: uuidv4(), ...userData };
    await docClient.send(new PutCommand({ TableName: USERS_TABLE, Item: newUser }));
    const { passwordHash, ...result } = newUser;
    return result;
  }

  // Client (Website) Management
  async getClientsByUserId(userId: string): Promise<Client[]> {
    const { Items } = await docClient.send(new QueryCommand({ TableName: CLIENTS_TABLE, IndexName: 'userId-index', KeyConditionExpression: 'userId = :userId', ExpressionAttributeValues: { ':userId': userId } }));
    return (Items as Client[]) || [];
  }
  async getClientById(id: string): Promise<Client | null> {
    const { Item } = await docClient.send(new GetCommand({ TableName: CLIENTS_TABLE, Key: { id } }));
    return (Item as Client) || null;
  }
  async createClient(clientData: { userId: string; name: string; domain: string }): Promise<Client> {
    const newClient: Client = { id: uuidv4(), trackingId: `trk_${uuidv4()}`, ...clientData };
    await docClient.send(new PutCommand({ TableName: CLIENTS_TABLE, Item: newClient }));
    return newClient;
  }

  // Booking & Campaign Management
  async createAbandonedBooking(bookingData: any): Promise<any> {
    const newBooking = { id: uuidv4(), status: 'abandoned', ...bookingData, createdAt: new Date().toISOString() };
    await docClient.send(new PutCommand({ TableName: BOOKINGS_TABLE, Item: newBooking }));
    return newBooking;
  }
  async createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> {
    const newCampaign: Campaign = { id: uuidv4(), ...campaignData };
    await docClient.send(new PutCommand({ TableName: CAMPAIGNS_TABLE, Item: newCampaign }));
    return newCampaign;
  }
}
