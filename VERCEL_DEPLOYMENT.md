# Vercel deployment

1. Push this repository to GitHub.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the repository root as the project root. Vercel will detect `vercel.json` and install `requirements.txt`.
4. Add these environment variables in Vercel:
   - `EDUQUEST_SECRET_KEY`
   - `EDUQUEST_DB_USER`
   - `EDUQUEST_DB_PASSWORD`
   - `EDUQUEST_DB_HOST`
   - `EDUQUEST_DB_NAME`
   - `EDUQUEST_YOUTUBE_API_KEY` only if related videos are re-enabled.
5. Use a hosted MySQL database and import `project_root/backend/Project.session.sql` before signing in.

Vercel supports the Flask HTTP routes through `api/index.py`. Vercel serverless functions do not provide persistent WebSocket connections, so Socket.IO realtime chat, room events, screen-share signaling, and other realtime features require a separate realtime host such as Render, Railway, Fly.io, or a managed websocket service.
