import unittest
from datetime import datetime, timezone
from scripts.update_analytics import counts, make_snapshot, report_request


def report(users=3, views=7, rows=True):
    result = {
        'metricHeaders': [{'name': 'totalUsers'}, {'name': 'screenPageViews'}],
        'metadata': {'timeZone': 'Asia/Dhaka'},
        'rowCount': 1 if rows else 0,
    }
    if rows:
        result['rows'] = [{'metricValues': [{'value': str(users)}, {'value': str(views)}]}]
    return result


class AnalyticsTest(unittest.TestCase):
    def test_day_follows_property_timezone_and_only_public_counts_are_exported(self):
        now = datetime(2026, 10, 2, 19, 0, tzinfo=timezone.utc)
        data = make_snapshot([report(15, 45), report(3, 7)], now)
        self.assertEqual(data['date'], '2026-10-03')
        self.assertEqual(data['todayVisitors'], 3)
        self.assertEqual(data['totalViews'], 45)
        self.assertEqual(set(data), {'status', 'updatedAt', 'timeZone', 'date', 'todayVisitors', 'todayViews', 'totalViews'})

    def test_successful_empty_report_is_zero(self):
        self.assertEqual(counts(report(rows=False)), [0, 0])

    def test_incomplete_or_invalid_report_fails_instead_of_becoming_zero(self):
        with self.assertRaises(KeyError):
            counts({})
        with self.assertRaises(ValueError):
            counts(report(1, -2))
        missing = report(rows=False)
        missing['rowCount'] = 1
        with self.assertRaises(ValueError):
            counts(missing)

    def test_inconsistent_totals_are_rejected(self):
        with self.assertRaises(ValueError):
            make_snapshot([report(1, 2), report(3, 7)], datetime.now(timezone.utc))

    def test_only_public_domain_is_counted(self):
        request = report_request('2026-10-03', '2026-10-03')
        self.assertEqual(request['dimensionFilter']['filter']['inListFilter']['values'], ['zobayer.org', 'www.zobayer.org'])
        self.assertEqual(request['dateRanges'][0]['startDate'], '2026-10-03')


if __name__ == '__main__':
    unittest.main()
