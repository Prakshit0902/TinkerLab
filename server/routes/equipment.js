const express = require('express');
const Equipment = require('../models/Equipment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();


// ... existing routes ...

router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid equipment ID format' });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... rest of the routes ...


router.get('/', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (available === 'true') {
      filter.availableQuantity = { $gt: 0 };
    }

    const equipment = await Equipment.find(filter).sort({ name: 1 });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRoles('tech_secretary', 'faculty'), async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    equipment.availableQuantity = equipment.totalQuantity;
    await equipment.save();
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('tech_secretary', 'faculty'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, authorizeRoles('tech_secretary', 'faculty'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;