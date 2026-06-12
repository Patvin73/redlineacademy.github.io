const {
  SATISFACTORY,
  NOT_YET_SATISFACTORY,
  COMPETENT,
  NOT_YET_COMPETENT,
  assessComponent,
  calculateCompetencyResult
} = require("../js/competency");

function resultFor(components, enrollment = { status: "active" }) {
  return calculateCompetencyResult({
    enrollment,
    requiredComponents: components
  });
}

describe("LMS competency assessment rules", () => {
  test("quiz score 95 but practical evidence Not Yet Satisfactory remains NYC", () => {
    const result = resultFor([
      { title: "Knowledge Quiz", type: "quiz", submitted: true, score: 95 },
      { title: "Practical Evidence", type: "practical", submitted: true, status: NOT_YET_SATISFACTORY }
    ]);

    expect(result.finalStatus).toBe(NOT_YET_COMPETENT);
    expect(result.isCompetent).toBe(false);
    expect(result.completedRequiredCount).toBe(1);
    expect(result.unsatisfactoryReasons.join(" ")).toMatch(/Practical Evidence/i);
  });

  test("quiz score 78 with satisfactory practical evidence remains NYC", () => {
    const result = resultFor([
      { title: "Knowledge Quiz", type: "quiz", submitted: true, score: 78 },
      { title: "Practical Evidence", type: "practical", submitted: true, status: SATISFACTORY }
    ]);

    expect(result.finalStatus).toBe(NOT_YET_COMPETENT);
    expect(result.unsatisfactoryReasons.join(" ")).toMatch(/at least 80\/100/i);
  });

  test("quiz score 88 with satisfactory practical evidence and critical safety passed is C", () => {
    const result = resultFor([
      { title: "Knowledge Quiz", type: "quiz", submitted: true, score: 88, criticalSafetyPassed: true },
      { title: "Practical Evidence", type: "practical", submitted: true, status: SATISFACTORY }
    ]);

    expect(result.finalStatus).toBe(COMPETENT);
    expect(result.displayLabel).toBe("Competent (C)");
  });

  test("quiz score 100 with a failed critical safety item remains NYC", () => {
    const result = resultFor([
      { title: "Knowledge Quiz", type: "quiz", submitted: true, score: 100, criticalSafetyPassed: false },
      { title: "Practical Evidence", type: "practical", submitted: true, status: SATISFACTORY }
    ]);

    expect(result.finalStatus).toBe(NOT_YET_COMPETENT);
    expect(result.unsatisfactoryReasons.join(" ")).toMatch(/critical safety/i);
  });

  test("all required components satisfactory is C", () => {
    const result = resultFor([
      { title: "Knowledge Quiz", type: "quiz", submitted: true, score: 84 },
      { title: "Task Evidence", type: "assignment", submitted: true, status: SATISFACTORY }
    ]);

    expect(result.finalStatus).toBe(COMPETENT);
    expect(result.completedRequiredCount).toBe(2);
    expect(result.totalRequiredCount).toBe(2);
  });

  test("one required assignment missing or pending remains NYC", () => {
    const result = resultFor([
      { title: "Knowledge Quiz", type: "quiz", submitted: true, score: 90 },
      { title: "Task Evidence", type: "assignment", submitted: false, status: "submitted" }
    ]);

    expect(result.finalStatus).toBe(NOT_YET_COMPETENT);
    expect(result.unsatisfactoryReasons.join(" ")).toMatch(/Task Evidence/i);
  });

  test("100 percent course progress does not imply competency or certificate eligibility", () => {
    const result = calculateCompetencyResult({
      enrollment: { status: "active", completion_percent: 100 },
      requiredComponents: [
        { title: "Final Practical Review", type: "assignment", submitted: true, status: "submitted" }
      ]
    });

    expect(result.finalStatus).toBe(NOT_YET_COMPETENT);
    expect(result.isCompetent).toBe(false);
    expect(result.canRequestReassessment).toBe(true);
  });

  test("component assessment normalizes satisfactory and not yet satisfactory", () => {
    expect(assessComponent({ title: "Task", type: "assignment", submitted: true, status: "satisfactory" }).status)
      .toBe(SATISFACTORY);
    expect(assessComponent({ title: "Task", type: "assignment", submitted: true, status: "resubmit_required" }).status)
      .toBe(NOT_YET_SATISFACTORY);
  });
});
