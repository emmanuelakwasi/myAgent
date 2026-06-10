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

export const analyzeCompany = (companyName, userId, context = '') =>
  api.post('/intel/analyze', {
    company_name: companyName,
    user_id: userId,
    context
  }).then(r => r.data);

export const getHistory = (userId) =>
  api.get(`/intel/history/${userId}`).then(r => r.data);

export const getReport = (id) =>
  api.get(`/intel/report/${id}`).then(r => r.data);

export const compareCompanies = (companyA, companyB, userId) =>
  api.post('/intel/compare', {
    company_a: companyA,
    company_b: companyB,
    user_id: userId
  }).then(r => r.data);
