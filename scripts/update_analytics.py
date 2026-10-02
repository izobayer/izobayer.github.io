"""Export only public aggregate counts from GA4; credentials never leave the job."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

PROPERTY_ID = '557076450'
START_DATE = '2015-08-14'
OUTPUT = Path(__file__).resolve().parents[1] / 'data' / 'site-stats.json'


def report_request(start, end):
    return {
        'dateRanges': [{'startDate': start, 'endDate': end}],
        'metrics': [{'name': 'totalUsers'}, {'name': 'screenPageViews'}],
        'dimensionFilter': {'filter': {
            'fieldName': 'hostName',
            'inListFilter': {'values': ['zobayer.org', 'www.zobayer.org'], 'caseSensitive': False},
        }},
        'keepEmptyRows': True,
    }


def counts(report):
    expected = ['totalUsers', 'screenPageViews']
    if [h['name'] for h in report['metricHeaders']] != expected:
        raise ValueError('Unexpected Analytics metrics')
    rows = report.get('rows', [])
    if not rows:
        if report.get('rowCount', 0) != 0:
            raise ValueError('Missing Analytics rows')
        return [0, 0]
    if len(rows) != 1:
        raise ValueError('Expected one aggregate row')
    values = [int(v['value']) for v in rows[0]['metricValues']]
    if len(values) != 2 or any(value < 0 for value in values):
        raise ValueError('Invalid Analytics counts')
    return values


def make_snapshot(reports, now):
    total, daily = reports
    total_users, total_views = counts(total)
    today_users, today_views = counts(daily)
    time_zone = daily['metadata']['timeZone']
    if total['metadata']['timeZone'] != time_zone:
        raise ValueError('Inconsistent Analytics time zones')
    if today_views > total_views or today_users > total_users:
        raise ValueError('Inconsistent Analytics totals; retry later')
    return {
        'status': 'ready',
        'updatedAt': now.isoformat().replace('+00:00', 'Z'),
        'timeZone': time_zone,
        'date': now.astimezone(ZoneInfo(time_zone)).date().isoformat(),
        'todayVisitors': today_users,
        'todayViews': today_views,
        'totalViews': total_views,
    }


def main():
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession

    credentials = service_account.Credentials.from_service_account_info(
        json.loads(os.environ['GA_SERVICE_ACCOUNT_JSON']),
        scopes=['https://www.googleapis.com/auth/analytics.readonly'],
    )
    session = AuthorizedSession(credentials)
    # Get the property's timezone before choosing the day, avoiding midnight races.
    url = f'https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:runReport'
    metadata_response = session.post(url, json=report_request('yesterday', 'yesterday'), timeout=60)
    metadata_response.raise_for_status()
    time_zone = metadata_response.json()['metadata']['timeZone']
    now = datetime.now(timezone.utc)
    day = now.astimezone(ZoneInfo(time_zone)).date().isoformat()
    response = session.post(
        f'https://analyticsdata.googleapis.com/v1beta/properties/{PROPERTY_ID}:batchRunReports',
        json={'requests': [report_request(START_DATE, day), report_request(day, day)]},
        timeout=60,
    )
    response.raise_for_status()
    snapshot = make_snapshot(response.json()['reports'], now)
    OUTPUT.parent.mkdir(exist_ok=True)
    temporary = OUTPUT.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, indent=2) + '\n')
    temporary.replace(OUTPUT)
    print('Updated public Analytics counts.')


if __name__ == '__main__':
    main()
