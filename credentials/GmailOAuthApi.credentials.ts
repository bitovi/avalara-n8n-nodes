import {
	ICredentialType,
	INodeProperties,
	NodeOperationError,
	ICredentialDataDecryptedObject,
	IHttpRequestHelper,
	IDataObject,
} from 'n8n-workflow';
import { readFileSync, existsSync } from 'fs';

export class GmailOAuthApi implements ICredentialType {
	name = 'gmailOAuthApi';
	displayName = 'Gmail OAuth API (Custom)';
	documentationUrl = 'https://developers.google.com/gmail/api/auth/web-server';
	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Config File Path',
			name: 'configFilePath',
			type: 'hidden',
			default: '',
		},
		// Override inherited OAuth2 fields to hide them
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'OAuth Redirect URL',
			name: 'callbackUrl',
			type: 'hidden',
			default: '',
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
		// Get config file path from environment variable
		const configFilePath = process.env.GMAIL_OAUTH_CONFIG_PATH || '/app/gmail-oauth-config.json';
		
		if (!configFilePath) {
			throw new NodeOperationError(
				null as any,
				'Config file path is required. Set GMAIL_OAUTH_CONFIG_PATH environment variable.',
			);
		}

		if (!existsSync(configFilePath)) {
			throw new NodeOperationError(
				null as any,
				`Config file not found at path: ${configFilePath}`,
			);
		}

		try {
			const configContent = readFileSync(configFilePath, 'utf8');
			const config = JSON.parse(configContent);

			if (!config.clientId || !config.clientSecret) {
				throw new NodeOperationError(
					null as any,
					'Config file must contain clientId and clientSecret properties',
				);
			}

			// Inject the values from the file into the credential
			return {
				...credentials,
				clientId: config.clientId,
				clientSecret: config.clientSecret,
			};
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new NodeOperationError(
					null as any,
					`Invalid JSON in config file: ${configFilePath}`,
				);
			}
			throw new NodeOperationError(
				null as any,
				`Error reading config file: ${error.message}`,
			);
		}
	}
}
