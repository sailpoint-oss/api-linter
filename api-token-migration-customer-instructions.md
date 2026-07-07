### Customer-ready instructions: API Token Migration (NERM Connectors)

#### Subject
Action required: Update NERM connector authentication (API Token Migration)

#### Summary
If you have **NERM connectors** configured in Identity Security Cloud (ISC), you must update them to use **ISC OAuth (client credentials)**. This requires creating a new API token in **API Management**, updating each NERM connector configuration to use the new **Client ID** and **Client Secret**, and then testing the connection.

---

### Step 1 — Create an ISC API Token (Client Credentials)
1. Log in to ISC as an admin.
2. Go to **Admin → Security Settings → API Management**.
3. Create a new **API Token** with **Grant Type: Client Credentials**.
4. Ensure the token includes **at least** the scope: `nerm:general:manage`.
5. Create the token and **securely record the credentials**:
   - **Client ID**
   - **Client Secret**  
   Important: you will **not** be able to view the Client Secret again after closing the dialog.

---

### Step 2 — Update each NERM connector to use ISC OAuth Credentials
1. Go to **Admin → Sources**.
2. Open each **NERM connector** you have configured.
3. Click **Configuration**.
4. Remove/clear any existing values set under the **NERM API Token** fields.
5. Select the **ISC OAuth Credentials** option.
6. Enter the **Client ID** and **Client Secret** you generated in Step 1.
7. Save the configuration.

---

### Step 3 — Test the connection
After updating each connector, run **Test Connection** and confirm it succeeds.

---

### Additional steps (only if you have scripts/integrations using API tokens)

#### Step 3 — Exchange the PAT for an access token (OAuth Client Credentials)
Use the PAT’s Client ID/Secret to request a JWT access token from:

POST https://[tenant].api.identitynow.com/oauth/token

Example (form data):

```bash
curl --location 'https://[tenant].api.identitynow.com/oauth/token' \
  --form 'grant_type=client_credentials' \
  --form 'client_id=YOUR_CLIENT_ID' \
  --form 'client_secret=YOUR_CLIENT_SECRET'
```

You’ll receive an access_token.

#### Step 4 — Update your integration to use the access token
For each API request, set:

Authorization: Bearer <access_token>

Also ensure any required scopes are requested/assigned to the PAT (if your integration receives 403, it often indicates missing scope or an endpoint requiring user-context access).
