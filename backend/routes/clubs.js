const express = require('express');
const router = express.Router();

// مسار مؤقت للأندية (سيتم تطويره لاحقاً)
router.get('/', async (req, res) => {
  res.json({
    message: 'مسار الأندية قيد التطوير',
    clubs: [
      { id: 1, name: 'نادي الهلال', type: 'football' },
      { id: 2, name: 'نادي النصر', type: 'football' },
      { id: 3, name: 'نادي الاتحاد', type: 'football' }
    ]
  });
});

module.exports = router;