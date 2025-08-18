# Gmail OAuth API Credential

A custom credential for Gmail OAuth that reads OAuth configuration from a filesystem file instead of requiring manual input of sensitive values. The config file path is set via environment variable for security.

## Setup

1. **Set Environment Variable:**
   The credential reads the config file path from the `GMAIL_OAUTH_CONFIG_PATH` environment variable.
   - Default: `/app/gmail-oauth-config.json`
   - Set in docker-compose.yml or your environment

2. **Create OAuth Configuration File:**
   Copy the example configuration:
   ```bash
   cp gmail-oauth-config.example.json gmail-oauth-config.json
   ```

2. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Create OAuth 2.0 credentials
   - Set the redirect URI to: `http://localhost:5678/rest/oauth2-credential/callback`

3. **Update Configuration File:**
   Edit `gmail-oauth-config.json` with your actual values:
   ```json
   {
     "clientId": "your-actual-client-id.apps.googleusercontent.com",
     "clientSecret": "your-actual-client-secret"
   }
   ```

4. **Create Credential in n8n:**
   - Go to n8n credentials page
   - Add new credential
   - Select "Gmail OAuth API (Custom)"
   - Complete the OAuth flow (no manual input required)

## Environment Variable Configuration

Set the `GMAIL_OAUTH_CONFIG_PATH` environment variable to specify the config file location:

```bash
# In docker-compose.yml
environment:
  - GMAIL_OAUTH_CONFIG_PATH=/app/gmail-oauth-config.json

# Or export in shell
export GMAIL_OAUTH_CONFIG_PATH=/path/to/your/gmail-oauth-config.json
```

## Configuration File Format

The JSON file must contain exactly these two properties:

```json
{
  "clientId": "string - Your Google OAuth client ID",
  "clientSecret": "string - Your Google OAuth client secret"
}
```

**Required Properties:**
- `clientId`: Your Google OAuth client ID (format: `xxx.apps.googleusercontent.com`)
- `clientSecret`: Your Google OAuth client secret (alphanumeric string)

**Example:**
```json
{
  "clientId": "123456789-abcdef.apps.googleusercontent.com",
  "clientSecret": "GOCSPX-abcdefghijklmnopqrstuvwxyz"
}
```

**Note:** The OAuth callback URL is automatically provided by n8n and doesn't need to be included in the config file.

## Security Benefits

- OAuth secrets are stored in a file system instead of being entered in the UI
- Config file path is controlled via environment variable for better security
- Secrets can be managed through environment variables or secret management systems
- Configuration can be version controlled (excluding the actual secret values)
- Easier to rotate secrets without updating n8n credentials
- No sensitive data visible in the n8n UI

## File Path Management

The credential uses the `GMAIL_OAUTH_CONFIG_PATH` environment variable to locate the config file:

**Default:** `/app/gmail-oauth-config.json`

**Common locations:**
- `/app/gmail-oauth-config.json` (default for Docker)
- `/etc/n8n/gmail-oauth.json` (system-wide config)
- `./config/gmail-oauth.json` (relative to working directory)
- `/var/secrets/gmail-oauth.json` (secrets directory)
