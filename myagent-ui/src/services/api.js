// All backend communication lives here.
// If the API URL changes, we change it in one place.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export const getTopics = (userId) =>
  api.get(`/topics/${userId}`);

export const createTopic = (userId, label, query) =>
  api.post('/topics', { user_id: userId, label, query });

export const deleteTopic = (topicId) =>
  api.delete(`/topics/${topicId}`);

export const runBriefing = (topicId) =>
  api.post('/briefings/run', { topic_id: topicId });

export const getBriefings = (topicId) =>
  api.get(`/briefings/${topicId}`);
