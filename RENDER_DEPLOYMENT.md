# Render deployment

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select this repository.
3. Render will read `render.yaml`, install `project_root/requirements.txt`, and start the Flask app.
4. Set the `EDUQUEST_DB_USER`, `EDUQUEST_DB_PASSWORD`, `EDUQUEST_DB_HOST`, and `EDUQUEST_DB_NAME` environment variables in Render.
5. Set `EDUQUEST_YOUTUBE_API_KEY` only if related-video search is re-enabled.

The MySQL server must be reachable from Render. A MySQL instance running on your local computer cannot be used by the deployed service. Use a hosted MySQL provider and import `project_root/backend/Project.session.sql` there before signing in.

Render supplies `PORT`; the application now binds to `0.0.0.0` and uses that value automatically.