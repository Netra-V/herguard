# HerGod Emergency SOS Token Flow

## User flow

Landing/Login -> Create Account -> Registration -> SOS Token Setup -> Login

1. User registers with name, email, password and emergency contact.
2. Backend generates a unique 12-digit SOS token.
3. Only the SHA-256 hash is stored in MongoDB in `User.sosTokenHash`.
4. The raw token is returned once to the browser and stored as `hergod_sos_token`.
5. Registration does not automatically log the user in.
6. User reaches the SOS Token Setup page and then continues to normal Login.
7. After logout, the Login page can use the stored SOS token.
8. Login-page SOS calls `POST /api/sos/public-trigger` without JWT authentication.
9. Backend hashes the supplied token, identifies the user, finds the emergency contact and uses the browser coordinates to create the SOS.

## Important

The token is not a replacement for the normal JWT login. It is a dedicated bearer credential for the emergency SOS action.

Twilio still needs to accept the SMS request. A Twilio trial-account restriction can still prevent delivery even when the token flow is correct.

## Judge-friendly token display

After registration, the generated SOS token is shown on the SOS Token Setup page and again on the Sign In page. This makes the token-generation and token-based emergency concept easy to demonstrate to evaluators.

The token is still stored in the browser as `hergod_sos_token`, and only its SHA-256 hash is persisted in MongoDB.
