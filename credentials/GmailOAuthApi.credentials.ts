import {
	ICredentialType,
	INodeProperties,
	NodeOperationError,
	ICredentialDataDecryptedObject,
	IHttpRequestHelper,
	IDataObject,
} from 'n8n-workflow';
import { readFileSync, existsSync } from 'fs';

// Load config at module level to make values available for default properties
function loadGmailConfig() {
	const configFilePath = process.env.GMAIL_OAUTH_CONFIG_PATH || '/app/gmail-oauth-config.json';
	
	if (!existsSync(configFilePath)) {
		console.warn(`Gmail OAuth config file not found at ${configFilePath}`);
		return { clientId: '', clientSecret: '' };
	}

	try {
		const configContent = readFileSync(configFilePath, 'utf8');
		const config = JSON.parse(configContent);
		
		return {
			clientId: config.clientId || '',
			clientSecret: config.clientSecret || '',
		};
	} catch (error) {
		console.warn(`Error loading Gmail OAuth config: ${error.message}`);
		return { clientId: '', clientSecret: '' };
	}
}

const gmailConfig = loadGmailConfig();

export class GmailOAuthApi implements ICredentialType {
	name = 'gmailOAuth2';
	displayName = 'Gmail OAuth2 API';
	documentationUrl = 'https://developers.google.com/gmail/api/auth/web-server';
	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Configuration Info',
			name: 'notice',
			type: 'notice',
			default: '',
			description: `OAuth credentials are automatically loaded from config file: ${process.env.GMAIL_OAUTH_CONFIG_PATH || '/app/gmail-oauth-config.json'}`,
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'hidden',
			default: gmailConfig.clientId,
			required: true,
			description: 'Your Google OAuth Client ID (auto-populated from config file)',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			typeOptions: {
				password: true,
			},
			default: gmailConfig.clientSecret,
			required: true,
			description: 'Your Google OAuth Client Secret (auto-populated from config file)',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://accounts.google.com/o/oauth2/v2/auth',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://www.googleapis.com/oauth2/v4/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'access_type=offline&prompt=consent',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject): Promise<IDataObject> {
		// Values are already populated from config file via default properties
		// Just ensure they're present for OAuth flow
		if (!credentials.clientId || !credentials.clientSecret) {
			throw new NodeOperationError(
				null as any,
				'Client ID and Client Secret are required. Please check your config file or manually enter the values.',
			);
		}

		return credentials;
	}
}
