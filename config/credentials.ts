import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface TestCredentials {
  username: string;
  password: string;
  additionalData?: Record<string, any>;
}

export interface CredentialConfig {
  opco: string;
  environment: 'stage' | 'production';
  testCategory: string;
  testName?: string;
  credentials: TestCredentials;
}

export class CredentialManager {
  private static instance: CredentialManager;
  private credentials: CredentialConfig[] = [];
  private credentialsPath: string;

  private constructor() {
    this.credentialsPath = path.join(process.cwd(), 'config', 'credentials.yml');
    this.loadCredentials();
  }

  public static getInstance(): CredentialManager {
    if (!CredentialManager.instance) {
      CredentialManager.instance = new CredentialManager();
    }
    return CredentialManager.instance;
  }

  private loadCredentials(): void {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        const fileContent = fs.readFileSync(this.credentialsPath, 'utf8');
        const data = yaml.load(fileContent) as CredentialConfig[];
        this.credentials = data || [];
      } else {
        this.createDefaultCredentialsFile();
      }
    } catch (error) {
      console.warn('Could not load credentials file:', error);
      this.credentials = [];
    }
  }

  private createDefaultCredentialsFile(): void {
    const defaultCredentials: CredentialConfig[] = [
      {
        opco: 'bge',
        environment: 'stage',
        testCategory: 'login',
        credentials: {
          username: 'test_user_bge_stage',
          password: 'test_password_bge_stage'
        }
      },
      {
        opco: 'bge',
        environment: 'stage',
        testCategory: 'outages',
        credentials: {
          username: 'outage_user_bge_stage',
          password: 'outage_password_bge_stage'
        }
      },
      {
        opco: 'bge',
        environment: 'production',
        testCategory: 'login',
        credentials: {
          username: 'test_user_bge_prod',
          password: 'test_password_bge_prod'
        }
      }
    ];

    try {
      const yamlContent = yaml.dump(defaultCredentials, { indent: 2 });
      fs.writeFileSync(this.credentialsPath, yamlContent, 'utf8');
      this.credentials = defaultCredentials;
    } catch (error) {
      console.error('Could not create default credentials file:', error);
    }
  }

  public getCredentials(
    opco: string,
    environment: 'stage' | 'production',
    testCategory: string,
    testName?: string
  ): TestCredentials | null {
    const credential = this.credentials.find(cred => 
      cred.opco === opco &&
      cred.environment === environment &&
      cred.testCategory === testCategory &&
      (!testName || cred.testName === testName)
    );

    return credential?.credentials || null;
  }

  public addCredentials(config: CredentialConfig): void {
    // Remove existing credential for the same opco/environment/category/testName
    this.credentials = this.credentials.filter(cred => 
      !(cred.opco === config.opco &&
        cred.environment === config.environment &&
        cred.testCategory === config.testCategory &&
        cred.testName === config.testName)
    );

    this.credentials.push(config);
    this.saveCredentials();
  }

  private saveCredentials(): void {
    try {
      const yamlContent = yaml.dump(this.credentials, { indent: 2 });
      fs.writeFileSync(this.credentialsPath, yamlContent, 'utf8');
    } catch (error) {
      console.error('Could not save credentials:', error);
    }
  }

  public getAllCredentials(): CredentialConfig[] {
    return [...this.credentials];
  }
}

// Helper function to get credentials easily
export function getTestCredentials(
  opco: string,
  environment: 'stage' | 'production',
  testCategory: string,
  testName?: string
): TestCredentials {
  const credentialManager = CredentialManager.getInstance();
  const credentials = credentialManager.getCredentials(opco, environment, testCategory, testName);
  
  if (!credentials) {
    throw new Error(
      `No credentials found for opco: ${opco}, environment: ${environment}, category: ${testCategory}${testName ? `, test: ${testName}` : ''}`
    );
  }
  
  return credentials;
} 