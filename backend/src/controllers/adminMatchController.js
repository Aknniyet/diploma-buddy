import { calculateBuddyScore, formatBuddyCard } from "../services/matchingService.js";
import {
  adminApproveRequest,
  createManualMatch,
  createAdminMatchNote,
  ensureAdminNotesTable,
  getActiveMatchesForAdmin,
  getAdminNotesForMatch,
  getApprovedBuddiesForAdmin,
  getBuddyActiveMatchCount,
  getBuddyProfiles,
  getMatchHistoryForAdmin,
  getPendingRequestsForAdmin,
  getUnmatchedStudents,
  reassignMatch,
  updateMatchStatus,
} from "../repositories/adminMatchRepository.js";
import { updateBuddyStatus } from "../repositories/userRepository.js";
import { createNotification } from "../repositories/notificationRepository.js";

function ensureAdmin(req, res) {
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required." });
    return false;
  }

  return true;
}

function buildReasonList(student, buddy) {
  const reasons = [];
  const sharedLanguages = (student.languages || []).filter((language) =>
    (buddy.languages || []).includes(language)
  );
  const sharedHobbies = (student.hobbies || []).filter((hobby) =>
    (buddy.hobbies || []).includes(hobby)
  );

  if (student.study_program && buddy.study_program && student.study_program === buddy.study_program) {
    reasons.push("Same study program");
  }

  if (sharedLanguages.length > 0) {
    reasons.push(`Shared language: ${sharedLanguages.slice(0, 2).join(", ")}`);
  }

  if (sharedHobbies.length > 0) {
    reasons.push(`Shared interests: ${sharedHobbies.slice(0, 2).join(", ")}`);
  }

  if (
    student.gender_preference &&
    student.gender_preference !== "no_preference" &&
    buddy.gender &&
    student.gender_preference === buddy.gender
  ) {
    reasons.push("Matches gender preference");
  }

  return reasons;
}

export async function getAdminMatchesOverview(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const [, pendingResult, activeMatchesResult, studentsResult, buddiesResult, buddyProfilesResult, matchHistoryResult] =
      await Promise.all([
        ensureAdminNotesTable(),
        getPendingRequestsForAdmin(),
        getActiveMatchesForAdmin(),
        getUnmatchedStudents(),
        getApprovedBuddiesForAdmin(),
        getBuddyProfiles(),
        getMatchHistoryForAdmin(),
      ]);
    const approvedBuddies = buddiesResult.rows;
    const cancelledBuddyByStudent = new Map();

    matchHistoryResult.rows
      .filter((match) => match.status === "cancelled")
      .forEach((match) => {
        const previous = cancelledBuddyByStudent.get(match.student_id) || new Set();
        previous.add(match.buddy_id);
        cancelledBuddyByStudent.set(match.student_id, previous);
      });

    const pendingRequests = pendingResult.rows.map((item) => {
      const score = calculateBuddyScore(
        {
          study_program: item.student_program,
          languages: item.student_languages || [],
          hobbies: item.student_hobbies || [],
          gender_preference: item.gender_preference,
        },
        {
          study_program: item.buddy_program,
          languages: item.buddy_languages || [],
          hobbies: item.buddy_hobbies || [],
          gender: item.gender,
        }
      );

      return {
        id: item.id,
        studentId: item.student_id,
        studentName: item.student_name,
        buddyId: item.buddy_id,
        buddyName: item.buddy_name,
        score,
        status: item.status,
        buddyLoad: Number(item.active_students_count || 0),
        buddyMax: Number(item.max_buddies || 3),
        message: item.message || "No message provided.",
        createdAt: item.created_at,
      };
    });

    const suggestedMatches = studentsResult.rows
      .map((student) => {
        const cancelledBuddies = cancelledBuddyByStudent.get(student.id) || new Set();
        const ranked = approvedBuddies
          .filter((buddy) => !cancelledBuddies.has(buddy.id))
          .map((buddy) => formatBuddyCard(student, buddy, new Map(), null))
          .filter((buddy) => buddy.spotsAvailable > 0)
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

        const bestMatch = ranked[0];
        if (!bestMatch) return null;

        return {
          studentId: student.id,
          studentName: student.full_name,
          buddyId: bestMatch.id,
          buddyName: bestMatch.name,
          score: bestMatch.score,
          reasons: buildReasonList(student, {
            study_program: bestMatch.program,
            languages: bestMatch.languages ? bestMatch.languages.split(", ").filter(Boolean) : [],
            hobbies: bestMatch.interests || [],
            gender: null,
          }),
        };
      })
      .filter(Boolean);

    return res.json({
      pendingRequests,
      activeMatches: activeMatchesResult.rows,
      matchHistory: matchHistoryResult.rows,
      unmatchedStudents: studentsResult.rows.map((student) => ({
        id: student.id,
        name: student.full_name,
        country: student.home_country || "Not specified",
        city: student.city || "Not specified",
        program: student.study_program || "Not specified",
        languages: student.languages || [],
        interests: student.hobbies || [],
        status: student.match_status,
        registeredAt: student.created_at,
      })),
      suggestedMatches,
      buddyProfiles: buddyProfilesResult.rows,
      availableBuddies: approvedBuddies
        .map((item) => ({
          id: item.id,
          name: item.full_name,
          city: item.city || "Kazakhstan",
          program: item.study_program || "Not specified",
          languages: item.languages || [],
          interests: item.hobbies || [],
          activeStudents: Number(item.active_students_count || 0),
          maxBuddies: Number(item.max_buddies || 3),
          spotsAvailable: Math.max(0, Number(item.max_buddies || 3) - Number(item.active_students_count || 0)),
        }))
        .filter((buddy) => buddy.spotsAvailable > 0),
    });
  } catch (error) {
    console.error("Admin matches overview error:", error.message);
    return res.status(500).json({ message: "Could not load admin match data." });
  }
}

export async function approveRequestByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const result = await adminApproveRequest({
      requestId: req.params.requestId,
      adminId: req.user.id,
    });

    return res.json(result);
  } catch (error) {
    if (error.message === "REQUEST_NOT_FOUND") {
      return res.status(404).json({ message: "Request not found." });
    }

    if (error.message === "REQUEST_ALREADY_PROCESSED") {
      return res.status(400).json({ message: "Request has already been processed." });
    }

    if (error.message === "BUDDY_LIMIT_REACHED") {
      return res.status(400).json({ message: "Selected buddy is already at full capacity." });
    }

    if (error.message === "STUDENT_ALREADY_MATCHED") {
      return res.status(400).json({ message: "Student already has an active buddy." });
    }

    console.error("Admin approve request error:", error.message);
    return res.status(500).json({ message: "Could not approve request." });
  }
}

export async function changeBuddyStatusByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { buddyStatus, reason } = req.body;

    if (!["pending", "approved", "rejected", "suspended", "not_applied"].includes(buddyStatus)) {
      return res.status(400).json({ message: "Invalid buddy status." });
    }

    if (["rejected", "suspended"].includes(buddyStatus) && !reason?.trim()) {
      return res.status(400).json({ message: "Reason is required." });
    }

    if (["rejected", "suspended"].includes(buddyStatus)) {
      const activeMatches = await getBuddyActiveMatchCount(req.params.buddyId);

      if (activeMatches.rows[0]?.count > 0) {
        return res.status(400).json({
          message: "This buddy still has active students. Reassign or close those matches before changing availability.",
        });
      }
    }

    const result = await updateBuddyStatus(req.params.buddyId, buddyStatus);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Buddy profile not found." });
    }

    await createNotification({
      userId: Number(req.params.buddyId),
      type: buddyStatus === "approved" ? "buddy_profile_approved" : "buddy_profile_rejected",
      title:
        buddyStatus === "approved"
          ? "Buddy profile approved"
          : buddyStatus === "suspended"
          ? "Buddy profile suspended"
          : "Buddy profile rejected",
      description:
        buddyStatus === "approved"
          ? "Your buddy profile was approved. Students can now send you buddy requests."
          : `Your buddy profile status was changed to ${buddyStatus}. Reason: ${reason.trim()}`,
      referenceType: "buddy_profile",
      referenceId: Number(req.params.buddyId),
    }).catch(() => null);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Change buddy status error:", error.message);
    return res.status(500).json({ message: "Could not update buddy status." });
  }
}

export async function changeMatchStatusByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { status, note } = req.body;

    if (!["completed", "cancelled", "active"].includes(status)) {
      return res.status(400).json({ message: "Invalid match status." });
    }

    if (["completed", "cancelled"].includes(status) && !note?.trim()) {
      return res.status(400).json({ message: "Admin note is required for completing or cancelling a match." });
    }

    const result = await updateMatchStatus(req.params.matchId, status);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Match not found." });
    }

    if (note?.trim()) {
      await createAdminMatchNote({
        matchId: Number(req.params.matchId),
        note: `${status.toUpperCase()}: ${note.trim()}`,
        createdBy: req.user.id,
      });
    }

    const match = result.rows[0];
    const notificationText =
      status === "completed"
        ? "Your buddy match was marked as completed by admin."
        : status === "cancelled"
        ? "Your buddy match was cancelled by admin. The student can request another buddy now."
        : "Your buddy match was reactivated by admin.";

    await Promise.all([
      createNotification({
        userId: match.international_student_id,
        type: `match_${status}`,
        title: status === "completed" ? "Match completed" : status === "cancelled" ? "Match cancelled" : "Match reactivated",
        description: notificationText,
        referenceType: "match",
        referenceId: match.id,
      }).catch(() => null),
      createNotification({
        userId: match.buddy_id,
        type: `match_${status}`,
        title: status === "completed" ? "Match completed" : status === "cancelled" ? "Match cancelled" : "Match reactivated",
        description: notificationText,
        referenceType: "match",
        referenceId: match.id,
      }).catch(() => null),
    ]);

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Change match status error:", error.message);
    return res.status(500).json({ message: "Could not update match status." });
  }
}

export async function createManualMatchByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { studentId, buddyId, note } = req.body;

    if (!studentId || !buddyId) {
      return res.status(400).json({ message: "Student and buddy are required." });
    }

    const result = await createManualMatch({
      studentId: Number(studentId),
      buddyId: Number(buddyId),
    });

    if (note?.trim()) {
      await createAdminMatchNote({
        matchId: result.id,
        note: `MANUAL MATCH: ${note.trim()}`,
        createdBy: req.user.id,
      });
    }

    await Promise.all([
      createNotification({
        userId: result.international_student_id,
        type: "match_created",
        title: "New buddy assigned",
        description: `Admin assigned ${result.buddy_name} as your buddy. You can now start messaging.`,
        referenceType: "match",
        referenceId: result.id,
      }).catch(() => null),
      createNotification({
        userId: result.buddy_id,
        type: "match_created",
        title: "New student assigned",
        description: `Admin assigned ${result.student_name} to you. You can now start messaging.`,
        referenceType: "match",
        referenceId: result.id,
      }).catch(() => null),
    ]);

    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "PAIR_NOT_FOUND") {
      return res.status(404).json({ message: "Student or buddy not found." });
    }

    if (error.message === "INVALID_STUDENT") {
      return res.status(400).json({ message: "Selected student is not an international student." });
    }

    if (error.message === "BUDDY_NOT_FOUND") {
      return res.status(404).json({ message: "Selected buddy is not approved." });
    }

    if (error.message === "BUDDY_LIMIT_REACHED") {
      return res.status(400).json({ message: "Selected buddy is already at full capacity." });
    }

    if (error.message === "STUDENT_ALREADY_MATCHED") {
      return res.status(400).json({ message: "Student already has an active buddy." });
    }

    console.error("Create manual match error:", error.message);
    return res.status(500).json({ message: "Could not create manual match." });
  }
}

export async function reassignMatchByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { newBuddyId, note } = req.body;

    if (!newBuddyId) {
      return res.status(400).json({ message: "New buddy is required." });
    }

    const result = await reassignMatch(req.params.matchId, newBuddyId);

    if (note?.trim()) {
      await createAdminMatchNote({
        matchId: Number(req.params.matchId),
        note: note.trim(),
        createdBy: req.user.id,
      });
    }

    await Promise.all([
      createNotification({
        userId: result.international_student_id,
        type: "match_reassigned",
        title: "Your buddy was updated",
        description: `Admin reassigned your buddy from ${result.old_buddy_name} to ${result.new_buddy_name}. You can now message your new buddy.`,
        referenceType: "match",
        referenceId: result.id,
      }).catch(() => null),
      createNotification({
        userId: result.old_buddy_id,
        type: "match_reassigned",
        title: "Buddy assignment changed",
        description: `${result.student_name} was reassigned to another buddy by admin.`,
        referenceType: "match",
        referenceId: result.id,
      }).catch(() => null),
      createNotification({
        userId: result.buddy_id,
        type: "match_reassigned",
        title: "New student assigned",
        description: `Admin assigned ${result.student_name} to you. You can now open Messages and start chatting.`,
        referenceType: "match",
        referenceId: result.id,
      }).catch(() => null),
    ]);

    return res.json(result);
  } catch (error) {
    if (error.message === "MATCH_NOT_FOUND") {
      return res.status(404).json({ message: "Match not found." });
    }

    if (error.message === "BUDDY_NOT_FOUND") {
      return res.status(404).json({ message: "New buddy was not found or is not approved." });
    }

    if (error.message === "SAME_BUDDY") {
      return res.status(400).json({ message: "This student is already assigned to selected buddy." });
    }

    if (error.message === "STUDENT_ALREADY_MATCHED") {
      return res.status(400).json({ message: "This student already has another active buddy." });
    }

    if (error.message === "BUDDY_LIMIT_REACHED") {
      return res.status(400).json({ message: "New buddy is already at full capacity." });
    }

    console.error("Reassign match error:", error.message);
    return res.status(500).json({ message: "Could not reassign match." });
  }
}

export async function addAdminMatchNote(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const { matchId, requestId, note } = req.body;

    if (!note?.trim()) {
      return res.status(400).json({ message: "Note text is required." });
    }

    const result = await createAdminMatchNote({
      matchId: matchId || null,
      requestId: requestId || null,
      note: note.trim(),
      createdBy: req.user.id,
    });

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create admin note error:", error.message);
    return res.status(500).json({ message: "Could not save note." });
  }
}

export async function getMatchNotesByAdmin(req, res) {
  try {
    if (!ensureAdmin(req, res)) return;

    const result = await getAdminNotesForMatch(req.params.matchId);
    return res.json(result.rows);
  } catch (error) {
    console.error("Get match notes error:", error.message);
    return res.status(500).json({ message: "Could not load notes." });
  }
}
