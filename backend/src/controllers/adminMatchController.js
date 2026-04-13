import { calculateBuddyScore, formatBuddyCard } from "../services/matchingService.js";
import {
  adminApproveRequest,
  createAdminMatchNote,
  ensureAdminNotesTable,
  getActiveMatchesForAdmin,
  getAdminNotesForMatch,
  getApprovedBuddiesForAdmin,
  getBuddyProfiles,
  getPendingRequestsForAdmin,
  getUnmatchedStudents,
  reassignMatch,
  updateMatchStatus,
} from "../repositories/adminMatchRepository.js";
import { updateBuddyStatus } from "../repositories/userRepository.js";

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

    const [, pendingResult, activeMatchesResult, studentsResult, buddiesResult, buddyProfilesResult] =
      await Promise.all([
        ensureAdminNotesTable(),
        getPendingRequestsForAdmin(),
        getActiveMatchesForAdmin(),
        getUnmatchedStudents(),
        getApprovedBuddiesForAdmin(),
        getBuddyProfiles(),
      ]);
    const approvedBuddies = buddiesResult.rows;

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
        message: item.message || "No message provided.",
        createdAt: item.created_at,
      };
    });

    const suggestedMatches = studentsResult.rows
      .map((student) => {
        const ranked = approvedBuddies
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
      suggestedMatches,
      buddyProfiles: buddyProfilesResult.rows,
      availableBuddies: approvedBuddies.map((item) => ({
        id: item.id,
        name: item.full_name,
        activeStudents: Number(item.active_students_count || 0),
        spotsAvailable: Math.max(0, 3 - Number(item.active_students_count || 0)),
      })),
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

    const { buddyStatus } = req.body;

    if (!["pending", "approved", "rejected", "not_applied"].includes(buddyStatus)) {
      return res.status(400).json({ message: "Invalid buddy status." });
    }

    const result = await updateBuddyStatus(req.params.buddyId, buddyStatus);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Buddy profile not found." });
    }

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

    const result = await updateMatchStatus(req.params.matchId, status);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Match not found." });
    }

    if (note?.trim()) {
      await createAdminMatchNote({
        matchId: Number(req.params.matchId),
        note: note.trim(),
        createdBy: req.user.id,
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Change match status error:", error.message);
    return res.status(500).json({ message: "Could not update match status." });
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

    return res.json(result);
  } catch (error) {
    if (error.message === "MATCH_NOT_FOUND") {
      return res.status(404).json({ message: "Match not found." });
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
