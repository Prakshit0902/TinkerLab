const express = require('express');
const Reservation = require('../models/Reservation');
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendNotificationEmail } = require('../utils/emailService');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { equipmentId, projectDetails, requestedStartTime, requestedEndTime, quantity } = req.body;
    
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient equipment available' });
    }

    if (equipment.requiresTraining && !req.user.completedTraining.includes(equipmentId)) {
      return res.status(400).json({ error: 'Training required for this equipment' });
    }

    const reservation = new Reservation({
      user: req.user._id,
      equipment: equipmentId,
      projectDetails,
      requestedStartTime,
      requestedEndTime,
      quantity
    });

    await reservation.save();
    await reservation.populate(['user', 'equipment']);

    const authorizers = await User.find({
      role: { $in: ['tech_secretary', 'club_lead', 'faculty', 'phd_scholar'] }
    });

    for (const authorizer of authorizers) {
      await sendNotificationEmail({
        to: authorizer.email,
        subject: 'New Equipment Reservation Request',
        html: `
          <h2>New Reservation Request</h2>
          <p><strong>Student:</strong> ${req.user.name}</p>
          <p><strong>Equipment:</strong> ${equipment.name}</p>
          <p><strong>Project:</strong> ${projectDetails.title}</p>
          <p><strong>Duration:</strong> ${new Date(requestedStartTime).toLocaleString()} - ${new Date(requestedEndTime).toLocaleString()}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p>Please review and approve/reject this request.</p>
        `
      });
    }

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, userId } = req.query;
    let filter = {};

    if (req.user.role === 'student') {
      filter.user = req.user._id;
    } else if (userId) {
      filter.user = userId;
    }

    if (status) {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email department rollNumber')
      .populate('equipment', 'name category location')
      .sort({ createdAt: -1 });

    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending', authenticateToken, authorizeRoles('tech_secretary', 'club_lead', 'faculty', 'phd_scholar'), async (req, res) => {
  try {
    const pendingReservations = await Reservation.find({ status: 'pending' })
      .populate('user', 'name email department rollNumber')
      .populate('equipment', 'name category location')
      .sort({ createdAt: -1 });

    res.json(pendingReservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/approve', authenticateToken, authorizeRoles('tech_secretary', 'club_lead', 'faculty', 'phd_scholar'), async (req, res) => {
  try {
    const { approvalComments } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('equipment', 'name availableQuantity');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.equipment.availableQuantity < reservation.quantity) {
      return res.status(400).json({ error: 'Equipment no longer available' });
    }

    reservation.status = 'approved';
    reservation.approvedBy = req.user._id;
    reservation.approvalComments = approvalComments;
    
    await reservation.save();

    await Equipment.findByIdAndUpdate(
      reservation.equipment._id,
      { $inc: { availableQuantity: -reservation.quantity } }
    );

    await sendNotificationEmail({
      to: reservation.user.email,
      subject: 'Reservation Approved',
      html: `
        <h2>Reservation Approved</h2>
        <p>Your reservation for ${reservation.equipment.name} has been approved.</p>
        <p><strong>Comments:</strong> ${approvalComments || 'None'}</p>
        <p>Please collect the equipment at the scheduled time.</p>
      `
    });

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/reject', authenticateToken, authorizeRoles('tech_secretary', 'club_lead', 'faculty', 'phd_scholar'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('equipment', 'name');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = 'rejected';
    reservation.rejectionReason = rejectionReason;
    
    await reservation.save();

    await sendNotificationEmail({
      to: reservation.user.email,
      subject: 'Reservation Rejected',
      html: `
        <h2>Reservation Rejected</h2>
        <p>Your reservation for ${reservation.equipment.name} has been rejected.</p>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
        <p>Please contact the lab administrator for more information.</p>
      `
    });

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/checkout', authenticateToken, authorizeRoles('tech_secretary', 'club_lead', 'faculty', 'phd_scholar'), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = 'in_use';
    reservation.actualStartTime = new Date();
    reservation.checkedOutAt = new Date();
    
    await reservation.save();
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/checkin', authenticateToken, authorizeRoles('tech_secretary', 'club_lead', 'faculty', 'phd_scholar'), async (req, res) => {
  try {
    const { conditionAfterUse, usageNotes } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = 'completed';
    reservation.actualEndTime = new Date();
    reservation.checkedInAt = new Date();
    reservation.conditionAfterUse = conditionAfterUse;
    reservation.usageNotes = usageNotes;
    
    await reservation.save();

    await Equipment.findByIdAndUpdate(
      reservation.equipment,
      { $inc: { availableQuantity: reservation.quantity } }
    );

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;