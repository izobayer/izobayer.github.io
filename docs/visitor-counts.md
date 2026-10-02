# Website visitor counts

Property: **557076450**. The footer reads `data/site-stats.json` and appears only
when actual counts have been exported successfully. Missing access, API errors
and failed exports never produce fabricated zeroes or replace the previous data.

## Enable the connection

1. In a Google Cloud project, enable **Google Analytics Data API**:
   https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
2. Create a service account in **IAM & Admin → Service Accounts**. It needs no
   Google Cloud project role. Create and download a JSON key under **Keys**.
3. Copy the service account's email. In Google Analytics, select property
   **557076450**, then **Admin → Property access management → Add users**.
   Add that email with **Viewer** access.
4. In the GitHub repository, open **Settings → Secrets and variables → Actions**,
   choose **New repository secret**, name it `GA_SERVICE_ACCOUNT_JSON`, and paste
   the complete JSON key contents as its value. Do not commit the key to Git.
   Direct link: https://github.com/izobayer/izobayer.github.io/settings/secrets/actions
5. Under **Actions → Update website visitor counts**, select **Run workflow**.
   The workflow saves the counts and requests a Pages rebuild. Check its result.

Updates are scheduled hourly; GitHub may delay runs, and GA4 reports themselves
have processing delays. The footer shows when its data was last updated.
"Today" uses the Analytics property's timezone. Set the property timezone to
**Asia/Dhaka** if the daily reporting should follow Bangladesh time.
At a day change, old daily counts are replaced by a dash until a new export arrives.

Today's visitors means GA4 `totalUsers`, rather than verified individual people.
Page views use `screenPageViews`, filtered to `zobayer.org` and `www.zobayer.org`.
The total covers all available GA4 data (requested from 2015-08-14 onward), not
visits before tracking started. Only three aggregate counts, a reporting date,
a timezone and a timestamp are public; credentials remain in GitHub Secrets.

Existing Pages publishing from `main` is preserved. The workflow's token has
repository contents and Pages write permissions to save the JSON and request a
build explicitly after a bot commit. No additional GitHub token is needed.

Sources:
- https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart
- https://developers.google.com/analytics/devguides/reporting/data/v1/basics
- https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build
