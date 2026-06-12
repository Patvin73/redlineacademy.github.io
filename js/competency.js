/* ================================================================
   REDLINE ACADEMY - competency.js
   Shared competency-based assessment rules for LMS dashboards/tests.
   ================================================================ */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.RedlineCompetency = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const SATISFACTORY = "SATISFACTORY";
  const NOT_YET_SATISFACTORY = "NOT_YET_SATISFACTORY";
  const COMPETENT = "COMPETENT";
  const NOT_YET_COMPETENT = "NOT_YET_COMPETENT";
  const QUIZ_MIN_SCORE = 80;

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function isValidEnrollment(enrollment) {
    const status = normalizeText(enrollment?.status || enrollment);
    return ["active", "completed", "paid", "enrolled", "valid"].includes(status);
  }

  function isPositive(value) {
    if (value === false) return false;
    const status = normalizeText(value);
    return !["false", "failed", "fail", "not_passed", "not passed", "no"].includes(status);
  }

  function normalizeAssessmentStatus(value) {
    const status = normalizeText(value);
    if (["satisfactory", "satisfied", "sat", "pass", "passed", "graded_pass", "competent"].includes(status)) {
      return SATISFACTORY;
    }
    if (["not_yet_satisfactory", "not yet satisfactory", "nys", "fail", "failed", "resubmit_required", "not_yet_competent"].includes(status)) {
      return NOT_YET_SATISFACTORY;
    }
    return null;
  }

  function getComponentType(component) {
    const type = normalizeText(component?.type || component?.componentType || component?.assignment_type);
    if (type.includes("quiz")) return "quiz";
    if (type.includes("practical") || type.includes("evidence") || type.includes("rubric") || type.includes("checklist")) {
      return "practical";
    }
    return "assignment";
  }

  function assessComponent(component) {
    const title = component?.title || component?.name || "Assessment component";
    const required = component?.is_required !== false && component?.required !== false;
    const type = getComponentType(component);
    const status = normalizeAssessmentStatus(component?.assessment_status || component?.status);
    const score = toNumber(component?.score ?? component?.grade);
    const passMark = Math.max(toNumber(component?.pass_mark ?? component?.passMark) || 70, type === "quiz" ? QUIZ_MIN_SCORE : 0);
    const submitted = Boolean(component?.submitted || component?.submitted_at || component?.submittedAt || status || score !== null);
    const criteria = Array.isArray(component?.mandatoryCriteria)
      ? component.mandatoryCriteria
      : Array.isArray(component?.criteria)
      ? component.criteria.filter((item) => item?.is_required !== false && item?.mandatory !== false)
      : [];
    const criticalSafetyPassed = isPositive(component?.criticalSafetyPassed ?? component?.critical_safety_passed ?? true);
    const reasons = [];

    if (!required) {
      return { ...component, title, required, type, status: SATISFACTORY, isSatisfactory: true, reasons };
    }

    if (!submitted) {
      reasons.push(`${title}: assessment is missing or pending review.`);
    }
    if (!criticalSafetyPassed) {
      reasons.push(`${title}: critical safety item has not been passed.`);
    }
    if (type === "quiz") {
      if (score === null) {
        reasons.push(`${title}: quiz score is missing.`);
      } else if (score < passMark) {
        reasons.push(`${title}: quiz score must be at least ${passMark}/100.`);
      }
    } else if (criteria.length > 0) {
      const failedCriteria = criteria.filter((item) =>
        normalizeAssessmentStatus(item?.status || item?.assessment_status) !== SATISFACTORY
      );
      if (failedCriteria.length > 0) {
        reasons.push(`${title}: mandatory practical criteria are not yet satisfactory.`);
      }
    } else if (status === NOT_YET_SATISFACTORY) {
      reasons.push(`${title}: marked Not Yet Satisfactory.`);
    } else if (status !== SATISFACTORY) {
      if (score !== null && score < passMark) {
        reasons.push(`${title}: assessment score is below ${passMark}/100.`);
      } else if (score === null || !submitted) {
        reasons.push(`${title}: trainer approval is still required.`);
      }
    }

    const isSatisfactory = reasons.length === 0 && (
      status === SATISFACTORY ||
      (type === "quiz" && score !== null && score >= passMark) ||
      (type !== "quiz" && submitted && (score === null || score >= passMark))
    );

    return {
      ...component,
      title,
      required,
      type,
      score,
      passMark,
      status: isSatisfactory ? SATISFACTORY : NOT_YET_SATISFACTORY,
      isSatisfactory,
      reasons
    };
  }

  function componentFromAssignment(assignment, submission) {
    const status = normalizeText(submission?.status);
    return assessComponent({
      id: assignment?.id,
      title: assignment?.title || "Assignment",
      type: assignment?.type || "assignment",
      is_required: assignment?.is_required,
      status: submission?.assessment_status || (status === "graded" ? null : status),
      submitted: Boolean(submission?.id || submission?.submitted_at),
      submitted_at: submission?.submitted_at,
      score: submission?.grade,
      pass_mark: assignment?.pass_mark,
      critical_safety_passed: submission?.critical_safety_passed ?? assignment?.critical_safety_passed
    });
  }

  function calculateCompetencyResult(input = {}) {
    const requiredComponents = (input.requiredComponents || [])
      .map(assessComponent)
      .filter((component) => component.required);
    const totalRequiredCount = requiredComponents.length;
    const completedRequiredCount = requiredComponents.filter((component) => component.isSatisfactory).length;
    const validEnrollment = input.enrollment ? isValidEnrollment(input.enrollment) : input.enrollmentValid !== false;
    const unsatisfactoryReasons = [];

    if (!validEnrollment) {
      unsatisfactoryReasons.push("Enrollment is not active or valid.");
    }
    if (totalRequiredCount === 0) {
      unsatisfactoryReasons.push("No required assessment components are available.");
    }
    requiredComponents.forEach((component) => {
      if (!component.isSatisfactory) unsatisfactoryReasons.push(...component.reasons);
    });

    const isCompetent = validEnrollment && totalRequiredCount > 0 && completedRequiredCount === totalRequiredCount;
    return {
      finalStatus: isCompetent ? COMPETENT : NOT_YET_COMPETENT,
      displayLabel: isCompetent ? "Competent (C)" : "Not Yet Competent (NYC)",
      isCompetent,
      completedRequiredCount,
      totalRequiredCount,
      unsatisfactoryReasons,
      canRequestReassessment: !isCompetent && unsatisfactoryReasons.length > 0,
      components: requiredComponents
    };
  }

  return {
    SATISFACTORY,
    NOT_YET_SATISFACTORY,
    COMPETENT,
    NOT_YET_COMPETENT,
    QUIZ_MIN_SCORE,
    assessComponent,
    componentFromAssignment,
    calculateCompetencyResult,
    normalizeAssessmentStatus
  };
});
