const express = require('express');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/usage', authenticateToken, authorizeRoles('tech_secretary', 'faculty'), async (req, res) => {
  try {
    const { startDate, endDate, equipmentId } = req.query;
    
    let filter = { status: { $in: ['completed', 'in_use'] } };
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (equipmentId) {
      filter.equipment = equipmentId;
    }

    const usageData = await Reservation.find(filter)
      .populate('user', 'name department rollNumber')
      .populate('equipment', 'name category')
      .sort({ createdAt: -1 });

    const summary = await Reservation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$equipment',
          totalBookings: { $sum: 1 },
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: ['$actualEndTime', '$actualStartTime'] },
                1000 * 60 * 60
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: '_id',
          as: 'equipmentDetails'
        }
      }
    ]);

    res.json({
      usageData,
      summary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/equipment-status', authenticateToken, authorizeRoles('tech_secretary', 'faculty'), async (req, res) => {
  try {
    const equipmentStatus = await Equipment.aggregate([
      {
        $lookup: {
          from: 'reservations',
          localField: '_id',
          foreignField: 'equipment',
          as: 'reservations'
        }
      },
      {
        $addFields: {
          totalReservations: { $size: '$reservations' },
          activeReservations: {
            $size: {
              $filter: {
                input: '$reservations',
                as: 'reservation',
                cond: { $eq: ['$$reservation.status', 'in_use'] }
              }
            }
          },
          pendingReservations: {
            $size: {
              $filter: {
                input: '$reservations',
                as: 'reservation',
                cond: { $eq: ['$$reservation.status', 'pending'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          totalQuantity: 1,
          availableQuantity: 1,
          totalReservations: 1,
          activeReservations: 1,
          pendingReservations: 1,
          utilizationRate: {
            $multiply: [
              { $divide: [
                { $subtract: ['$totalQuantity', '$availableQuantity'] },
                '$totalQuantity'
              ]},
              100
            ]
          }
        }
      }
    ]);

    res.json(equipmentStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;