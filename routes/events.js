const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { eventType, month, year } = req.query;
    const query = { isPublic: true };
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(query)
      .populate('organizer', 'username fullName')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      isPublic: true,
      startDate: { $gte: new Date() }
    })
    .populate('organizer', 'username fullName')
    .sort({ startDate: 1 })
    .limit(10);

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'username fullName avatar')
      .populate('attendees.user', 'username fullName avatar');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, [
  body('title').notEmpty().trim(),
  body('description').notEmpty(),
  body('eventType').isIn(['festival', 'meetup', 'workshop', 'cultural', 'sports', 'movies', 'other']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('location.venue').notEmpty(),
  body('location.address').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.userId
    };

    const event = new Event(eventData);
    await event.save();
    await event.populate('organizer', 'username fullName');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/rsvp', authMiddleware, [
  body('status').isIn(['going', 'interested', 'not-going'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user.userId
    );

    if (attendeeIndex > -1) {
      event.attendees[attendeeIndex].status = req.body.status;
    } else {
      event.attendees.push({
        user: req.user.userId,
        status: req.body.status
      });
    }

    if (event.maxAttendees) {
      const goingCount = event.attendees.filter(a => a.status === 'going').length;
      if (goingCount > event.maxAttendees && req.body.status === 'going') {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    await event.save();
    res.json({ 
      message: 'RSVP updated successfully',
      attendees: event.attendees.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event (admin/moderator or organizer only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is admin/moderator or event organizer
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';
    const isOrganizer = event.organizer.toString() === req.user.userId;

    if (!isAdmin && !isModerator && !isOrganizer) {
      return res.status(403).json({ error: 'Not authorized to edit this event' });
    }

    const { title, description, eventType, startDate, endDate, location, maxAttendees } = req.body;
    
    if (title) event.title = title;
    if (description) event.description = description;
    if (eventType) event.eventType = eventType;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (location) event.location = location;
    if (maxAttendees !== undefined) event.maxAttendees = maxAttendees;

    await event.save();
    await event.populate('organizer', 'username fullName');

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event (admin/moderator only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is admin/moderator
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';

    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;