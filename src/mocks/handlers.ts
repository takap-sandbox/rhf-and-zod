import { http, HttpResponse, PathParams } from 'msw';

type ReqData = {
  name: string;
  age: number;
  nameCount: number;
};

let mockData = [
  {
    id: 1,
    name: 'test',
    age: 20,
    nameCount: 4,
  },
];

const allMockData = {
  list: mockData,
};

export const handlers = [
  http.get('/api/test', () => {
    return HttpResponse.json(allMockData);
  }),
  http.post<PathParams, ReqData, ReqData & { id: number }>('/api/test', async ({ request }) => {
    const newPost = await request.json();
    const newData = {
      id: mockData.length + 1,
      ...newPost,
    };
    mockData.push(newData);
    return HttpResponse.json(newData);
  }),
];
