import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, // Added QueryCommand
  UpdateCommand 
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Define types for our data
interface UserData {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

interface WebsiteData {
  id: string;
  userId: string;
  name: string;
  domain: string;
  trackingId: string;
  createdAt: string;
}

// --- NEW: Define a type for Campaign data ---
interface CampaignData {
    id: string;
    userId: string;
    subject: string;
    body: string;
    delayMinutes: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


export class Database {
  private docClient: DynamoDBDocumentClient;
  private usersTable = 'booking-recovery-users';
  private websitesTable = 'booking-recovery-clients';
  private campaignsTable = 'booking-recovery-campaigns'; // The table we created earlier

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  // --- User Methods ---
  async createUser(userData: Omit<UserData, 'id'>): Promise<UserData> {
    const id = uuidv4();
    const user = { id, ...userData };
    const command = new PutCommand({
      TableName: this.usersTable,
      Item: user,
    });
    await this.docClient.send(command);
    return user;
  }

  async getUserByEmail(email: string): Promise<UserData | undefined> {
    const command = new QueryCommand({
      TableName: this.usersTable,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email },
    });
    const result = await this.docClient.send(command);
    return result.Items?.[0] as UserData | undefined;
  }

  // --- Website Methods ---
  async createWebsite(websiteData: Omit<WebsiteData, 'id' | 'trackingId' | 'createdAt'>): Promise<WebsiteData> {
    const id = uuidv4();
    const trackingId = `track_${Date.now()}_${uuidv4().substring(0, 12)}`;
    const createdAt = new Date().toISOString();
    const website = { id, trackingId, createdAt, ...websiteData };
    
    const command = new PutCommand({
      TableName: this.websitesTable,
      Item: website,
    });
    await this.docClient.send(command);
    return website;
  }

  async getWebsitesByUserId(userId: string): Promise<WebsiteData[]> {
    const command = new QueryCommand({
      TableName: this.websitesTable,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    });
    const result = await this.docClient.send(command);
    return (result.Items || []) as WebsiteData[];
  }

  // --- NEW: Campaign Methods ---
  async getCampaignByUserId(userId: string): Promise<CampaignData | undefined> {
    const command = new QueryCommand({
        TableName: this.campaignsTable,
        IndexName: 'UserIdIndex', // We will need to add this index to the table
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        Limit: 1, // A user only has one campaign in this design
    });
    const result = await this.docClient.send(command);
    return result.Items?.[0] as CampaignData | undefined;
  }

  async createOrUpdateCampaign(campaignData: Omit<CampaignData, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampaignData> {
    // First, check if a campaign already exists for this user
    const existingCampaign = await this.getCampaignByUserId(campaignData.userId);

    if (existingCampaign) {
      // Update existing campaign
      const command = new UpdateCommand({
        TableName: this.campaignsTable,
        Key: { id: existingCampaign.id },
        UpdateExpression: 'set subject = :s, body = :b, delayMinutes = :d, isActive = :a, updatedAt = :u',
        ExpressionAttributeValues: {
          ':s': campaignData.subject,
          ':b': campaignData.body,
          ':d': campaignData.delayMinutes,
          ':a': campaignData.isActive,
          ':u': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      });
      const result = await this.docClient.send(command);
      return result.Attributes as CampaignData;
    } else {
      // Create new campaign
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      const newCampaign = {
        id,
        ...campaignData,
        createdAt,
        updatedAt: createdAt,
      };
      const command = new PutCommand({
        TableName: this.campaignsTable,
        Item: newCampaign,
      });
      await this.docClient.send(command);
      return newCampaign;
    }
  }
}
