import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { UserData, ClientData, BookingData, CampaignData } from '../types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = 'booking-recovery-users';
const CLIENTS_TABLE = 'booking-recovery-clients';
const BOOKINGS_TABLE = 'booking-recovery-bookings';
const CAMPAIGNS_TABLE = 'booking-recovery-campaigns';

export class DatabaseService {
  async createUser(userData: Omit<UserData, 'id'>): Promise<UserData> {
    const userId = uuidv4();
    const newUser: UserData = { id: userId, ...userData };
    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: newUser,
    });
    await docClient.send(command);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    const command = new QueryCommand({
      TableName: USERS_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
    });
    const result = await docClient.send(command);
    return (result.Items?.[0] as UserData) || null; // CORRECTED LINE
  }

  async createClient(clientData: Omit<ClientData, 'id' | 'trackingId'>): Promise<ClientData> {
    const clientId = uuidv4();
    const trackingId = `track_${uuidv4().replace(/-/g, '')}`;
    const newClient: ClientData = { 
      id: clientId, 
      trackingId, 
      ...clientData 
    };
    const command = new PutCommand({
      TableName: CLIENTS_TABLE,
      Item: newClient,
    });
    await docClient.send(command);
    return newClient;
  }

  async getClientsByUserId(userId: string): Promise<ClientData[]> {
    const command = new QueryCommand({
      TableName: CLIENTS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    });
    const result = await docClient.send(command);
    return (result.Items as ClientData[]) || [];
  }

  async getClientById(trackingId: string): Promise<ClientData | null> {
    const command = new QueryCommand({
        TableName: CLIENTS_TABLE,
        IndexName: 'TrackingIdIndex',
        KeyConditionExpression: 'trackingId = :trackingId',
        ExpressionAttributeValues: { ':trackingId': trackingId },
    });
    const result = await docClient.send(command);
    return (result.Items?.[0] as ClientData) || null; // CORRECTED LINE
  }

  async createAbandonedBooking(bookingData: Omit<BookingData, 'id'>): Promise<BookingData> {
    const bookingId = uuidv4();
    const newBooking: BookingData = { id: bookingId, ...bookingData };
    const command = new PutCommand({
      TableName: BOOKINGS_TABLE,
      Item: newBooking,
    });
    await docClient.send(command);
    return newBooking;
  }

  async getCampaignByUserId(userId: string): Promise<CampaignData | null> {
    const command = new QueryCommand({
      TableName: CAMPAIGNS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    });
    const result = await docClient.send(command);
    return (result.Items?.[0] as CampaignData) || null; // CORRECTED LINE
  }

  async createOrUpdateCampaign(campaignData: Omit<CampaignData, 'id'> & { id?: string }): Promise<CampaignData> {
    const existing = await this.getCampaignByUserId(campaignData.userId);
    const campaignId = existing ? existing.id : uuidv4();
    const newCampaign: CampaignData = { 
      id: campaignId, 
      ...campaignData 
    };
    const command = new PutCommand({
      TableName: CAMPAIGNS_TABLE,
      Item: newCampaign,
    });
    await docClient.send(command);
    return newCampaign;
  }
}
