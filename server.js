const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const issues = [];

function makeId() {
  return `CF-2026-${String(133 + issues.length).padStart(5, '0')}`;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'CampusFix API' });
});

app.get('/api/issues', (req, res) => {
  res.json(issues);
});

app.get('/api/issues/:id', (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json(issue);
});

app.post('/api/analyze', (req, res) => {
  const { title, category, description } = req.body;
  const text = `${title || ''} ${description || ''}`.toLowerCase();

  let priority = 'MEDIUM';
  if (/fire|shock|sparking|electric|leak|security|danger|broken/.test(text)) priority = 'HIGH';

  const departments = {
    Electrical: 'Electrical Maintenance',
    Plumbing: 'Plumbing Maintenance',
    Furniture: 'Facilities',
    Internet: 'IT / Network',
    Cleanliness: 'Housekeeping',
    Laboratory: 'Laboratory Maintenance',
    Washroom: 'Housekeeping',
    Security: 'Security',
    Other: 'General Maintenance'
  };

  res.json({
    category: category || 'Other',
    problem: title || 'Campus issue',
    priority,
    department: departments[category] || 'General Maintenance',
    confidence: 96
  });
});

app.post('/api/issues', (req, res) => {
  const { title, category, location, description } = req.body;
  if (!title || !location) {
    return res.status(400).json({ error: 'Title and location are required' });
  }

  const issue = {
    id: makeId(),
    title,
    category: category || 'Other',
    location,
    description: description || '',
    priority: 'HIGH',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  issues.unshift(issue);
  res.status(201).json(issue);
});

app.listen(PORT, () => {
  console.log(`CampusFix backend running at http://localhost:${PORT}`);
});
