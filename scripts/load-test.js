import http from 'k6/http';
import { check, sleep, Trend } from 'k6';

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(50)<2000', 'p(90)<3000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const homeTrend = new Trend('home_page_duration');
const postTrend = new Trend('post_page_duration');

export default function () {
  const homeRes = http.get(`${BASE_URL}/`, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  homeTrend.add(homeRes.timings.duration);
  check(homeRes, {
    'home status is 200': (r) => r.status === 200,
    'home p50 < 2s': (r) => r.timings.duration < 2000,
  });

  const postRes = http.get(`${BASE_URL}/posts/optimizing-nextjs`, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  postTrend.add(postRes.timings.duration);
  check(postRes, {
    'post status is 200': (r) => r.status === 200,
    'post p50 < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
