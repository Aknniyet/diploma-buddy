import {
  createBuddyRequest,
  findAvailableBuddies,
  findBuddyCapacity,
  findIncomingRequestsForBuddy,
  findMyMatches,
  findPendingRequestBetween,
  findRequestsCreatedByStudent,
  findStudentActiveMatch,
  findStudentForMatching,
  findStudentPendingRequest,
  findStudentRequestStatuses,
  respondToBuddyRequest,
} from '../repositories/buddyRepository.js';
import { formatBuddyCard } from '../services/matchingService.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { findUserProfileById } from '../repositories/userRepository.js';

export async function getAvailableBuddies(req, res) {
  try {
    if (req.user.role !== 'international') {
      return res.status(403).json({ message: 'Only international students can browse buddies.' });
    }

    const studentResult = await findStudentForMatching(req.user.id);
    const student = studentResult.rows[0];

    const studentActiveMatch = await findStudentActiveMatch(req.user.id);
    const activeMatchBuddyId = studentActiveMatch.rows[0]?.buddy_id || null;

    const requestStatuses = await findStudentRequestStatuses(req.user.id);
    const statusMap = new Map(requestStatuses.rows.map((item) => [item.buddy_id, item.status]));
    const pendingRequest = requestStatuses.rows.find((item) => item.status === 'pending');
    const pendingRequestBuddyId = pendingRequest?.buddy_id || null;

    const hasActiveMatch = Boolean(activeMatchBuddyId);
    const buddiesResult = await findAvailableBuddies(activeMatchBuddyId, hasActiveMatch);
    const buddyRows = hasActiveMatch
      ? buddiesResult.rows.filter((buddy) => buddy.id === activeMatchBuddyId)
      : buddiesResult.rows;

    const buddies = buddyRows
      .map((buddy) =>
        formatBuddyCard(
          student,
          buddy,
          statusMap,
          activeMatchBuddyId,
          hasActiveMatch,
          pendingRequestBuddyId
        )
      )
      .sort((a, b) => {
        if (a.status === 'matched') return -1;
        if (b.status === 'matched') return 1;
        if (a.status === 'pending') return -1;
        if (b.status === 'pending') return 1;
        return b.score - a.score || a.name.localeCompare(b.name);
      });

    return res.json(buddies);
  } catch (error) {
    console.error('Available buddies error:', error.message);
    return res.status(500).json({ message: 'Could not load buddies.' });
  }
}

export async function createRequest(req, res) {
  try {
    if (req.user.role !== 'international') {
      return res.status(403).json({ message: 'Only international students can create buddy requests.' });
    }

    const { buddyId, preferredLanguage, supportTopics, message } = req.body;

    if (!buddyId) {
      return res.status(400).json({ message: 'Buddy id is required.' });
    }

    const activeMatch = await findStudentActiveMatch(req.user.id);
    if (activeMatch.rows.length > 0) {
      return res.status(400).json({ message: 'You already have an active buddy.' });
    }

    const anyPendingRequest = await findStudentPendingRequest(req.user.id);
    if (anyPendingRequest.rows.length > 0) {
      return res.status(409).json({
        message: 'You already have a pending buddy request. Please wait for a response before choosing another buddy.',
      });
    }

    const buddyResult = await findBuddyCapacity(buddyId);
    if (buddyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Selected buddy is not available.' });
    }

    const activeStudentsCount = Number(buddyResult.rows[0].active_students_count || 0);
    const maxBuddies = Number(buddyResult.rows[0].max_buddies || 3);
    if (activeStudentsCount >= maxBuddies) {
      return res.status(400).json({ message: 'This buddy already has the maximum number of students.' });
    }

    const existingPending = await findPendingRequestBetween(req.user.id, buddyId);
    if (existingPending.rows.length > 0) {
      return res.status(409).json({ message: 'You already sent a request to this buddy.' });
    }

    const result = await createBuddyRequest(req.user.id, {
      buddyId,
      preferredLanguage,
      supportTopics,
      message,
    });

    const studentResult = await findUserProfileById(req.user.id);
    const studentName = studentResult.rows[0]?.full_name || 'A student';

    await createNotification({
      userId: buddyId,
      type: 'request_received',
      title: 'New buddy request',
      description: `${studentName} sent you a buddy request.`,
      referenceType: 'buddy_request',
      referenceId: result.rows[0].id,
    }).catch(() => null);

    return res.status(201).json({
      message: 'Your request has been sent. Please wait for the buddy response.',
      request: result.rows[0],
    });
  } catch (error) {
    console.error('Create buddy request error:', error.message);
    return res.status(500).json({ message: 'Could not create buddy request.' });
  }
}

export async function getMyRequests(req, res) {
  try {
    const result = await findRequestsCreatedByStudent(req.user.id);
    return res.json(result.rows);
  } catch (error) {
    console.error('My buddy requests error:', error.message);
    return res.status(500).json({ message: 'Could not load your requests.' });
  }
}

export async function getIncomingRequests(req, res) {
  try {
    if (req.user.role !== 'local') {
      return res.status(403).json({ message: 'Only buddies can view incoming requests.' });
    }

    const result = await findIncomingRequestsForBuddy(req.user.id);
    const formatted = result.rows.map((item) => ({
      id: item.id,
      name: item.full_name,
      country: item.home_country || 'Not specified',
      program: item.study_program || 'Not specified',
      interests: item.hobbies || [],
      message: item.message || 'No message provided.',
      date: new Date(item.created_at).toLocaleDateString(),
      avatar:
        item.profile_photo_url ||
        'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      status: item.status,
    }));

    return res.json({
      pending: formatted.filter((item) => item.status === 'pending'),
      past: formatted.filter((item) => item.status !== 'pending'),
    });
  } catch (error) {
    console.error('Incoming buddy requests error:', error.message);
    return res.status(500).json({ message: 'Could not load buddy requests.' });
  }
}

export async function respondToRequest(req, res) {
  try {
    if (req.user.role !== 'local') {
      return res.status(403).json({ message: 'Only buddies can respond to requests.' });
    }

    const { requestId } = req.params;
    const { action } = req.body;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'Action must be accept or decline.' });
    }

    const result = await respondToBuddyRequest({
      requestId,
      buddyId: req.user.id,
      action,
    });

    const buddyResult = await findUserProfileById(req.user.id);
    const buddyName = buddyResult.rows[0]?.full_name || 'Your buddy';

    if (result.studentId) {
      await createNotification({
        userId: result.studentId,
        type: action === 'accept' ? 'request_accepted' : 'request_declined',
        title: action === 'accept' ? 'Buddy request accepted' : 'Buddy request declined',
        description:
          action === 'accept'
            ? `${buddyName} accepted your buddy request.`
            : `${buddyName} declined your buddy request.`,
        referenceType: 'buddy_request',
        referenceId: Number(requestId),
      }).catch(() => null);
    }

    return res.json(result);
  } catch (error) {
    if (error.message === 'REQUEST_NOT_FOUND') {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (error.message === 'REQUEST_ALREADY_PROCESSED') {
      return res.status(400).json({ message: 'This request has already been processed.' });
    }

    if (error.message === 'BUDDY_LIMIT_REACHED') {
      return res.status(400).json({ message: 'You already have 3 active students.' });
    }

    if (error.message === 'STUDENT_ALREADY_MATCHED') {
      return res.status(400).json({ message: 'This student already has an active buddy.' });
    }

    console.error('Respond to request error:', error.message);
    return res.status(500).json({ message: 'Could not process the request.' });
  }
}

export async function getMyMatches(req, res) {
  try {
    const result = await findMyMatches(req.user.id, req.user.role);

    if (req.user.role === 'international') {
      return res.json(result.rows[0] || null);
    }

    return res.json(result.rows);
  } catch (error) {
    console.error('Get matches error:', error.message);
    return res.status(500).json({ message: 'Could not load matches.' });
  }
}
