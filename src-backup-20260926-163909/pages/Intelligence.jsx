import React from "react";

import {
  Button,
  Card,
  Eyebrow,
  Icon,
  RiskBadge
} from "../components/common/UI";

import {
  extractAdvisoryText
} from "../utils/crai";


export default function Intelligence({
  result,
  onObserve,
  playAdvisory,
  stopAdvisory,
  advisoryPlaying,
  advisoryError,
  language,
  onLanguageChange,
  regenerateAdvisory
}) {

  /*
   * ============================================================
   * NO RESULT
   * ============================================================
   */

  if (!result) {

    return (
      <main className="content">

        <div className="page-head">

          <div>

            <Eyebrow>
              FIELD INTELLIGENCE
            </Eyebrow>

            <h1>
              Decision intelligence
            </h1>

            <p>
              The deterministic CRAI result and its evidence
              chain live here.
            </p>

          </div>

        </div>


        <Card className="empty-state">

          <div className="empty-icon">
            <Icon name="shield" />
          </div>

          <h2>
            No completed assessment yet
          </h2>

          <p>
            No completed CRAI assessment is available for the
            selected field. Start a new observation to begin
            the CRAI evidence pipeline.
          </p>

          <Button onClick={onObserve}>
            <Icon name="camera" />
            Start observation
          </Button>

        </Card>

      </main>
    );
  }


  /*
   * ============================================================
   * NORMALIZE RESPONSE
   * ============================================================
   */

  const r =
    result.risk &&
    typeof result.risk === "object"
      ? result.risk
      : null;


  const d =
    result.decision &&
    typeof result.decision === "object"
      ? result.decision
      : {};


  const v =
    result.visual &&
    typeof result.visual === "object"
      ? result.visual
      : {};


  const j =
    result.judge_intelligence &&
    typeof result.judge_intelligence === "object"
      ? result.judge_intelligence
      : {};


  const breakdown =
    r?.breakdown &&
    typeof r.breakdown === "object"
      ? r.breakdown
      : {};


  const contributions =
    r?.contributions &&
    typeof r.contributions === "object"
      ? r.contributions
      : {};


  const adv =
    result.advisory &&
    typeof result.advisory === "object"
      ? result.advisory
      : {};


  const advisoryText =
    extractAdvisoryText(adv);


  /*
   * ============================================================
   * AUTHORITATIVE DECISION STATE
   *
   * IMPORTANT:
   *
   * A risk/fusion object may exist before the deterministic
   * field decision is ready.
   *
   * Therefore:
   *
   * risk score alone != completed assessment
   *
   * The UI only treats the assessment as complete when:
   *
   *     decision.ready === true
   *
   * AND:
   *
   *     a valid deterministic risk score exists
   * ============================================================
   */

  const hasRiskScore =
    typeof r?.score === "number" &&
    Number.isFinite(r.score);


  const riskScore =
    hasRiskScore
      ? r.score
      : null;


  const decisionReady =
    d.ready === true &&
    hasRiskScore;


  const isWaiting =
    !decisionReady;


  /*
   * ============================================================
   * DECISION / ADAPTIVE ACTION
   * ============================================================
   */

  const decisionAction =
    String(
      d?.action ||
      result?.decision?.action ||
      ""
    ).toUpperCase();


  const adaptiveAction =
    String(
      result?.adaptive_evidence?.action ||
      result?.adaptive?.action ||
      j?.adaptive_evidence?.action ||
      ""
    ).toUpperCase();


  /*
   * ============================================================
   * CONFIDENCE
   * ============================================================
   */

  const confidence =
    typeof r?.assessment_confidence === "number"
      ? r.assessment_confidence
      : (
          typeof r?.assessment_confidence === "string" &&
          /^\d+(\.\d+)?$/.test(
            r.assessment_confidence
          )
            ? Number(
                r.assessment_confidence
              )
            : null
        );


  /*
   * ============================================================
   * EVIDENCE CONTRIBUTIONS
   * ============================================================
   */

  const entries = [

    [
      "Visual evidence",
      breakdown.visual,
      contributions.visual
    ],

    [
      "Environmental evidence",
      breakdown.environmental,
      contributions.environmental
    ],

    [
      "Spatial evidence",
      breakdown.spatial,
      contributions.spatial
    ],

    [
      "Temporal evidence",
      breakdown.temporal,
      contributions.temporal
    ]

  ];


  /*
   * ============================================================
   * PROVENANCE
   * ============================================================
   */

  const provenance =
    Array.isArray(
      j.evidence_provenance
    )
      ? j.evidence_provenance
      : Object.entries(
          j.evidence_provenance || {}
        ).map(
          ([type, p]) => ({
            type,

            ...(p &&
            typeof p === "object"
              ? p
              : {
                  value: p
                })
          })
        );


  /*
   * ============================================================
   * DECISION TRACE
   * ============================================================
   */

  const trace =
    Array.isArray(
      j.decision_trace
    )
      ? j.decision_trace
      : (
          Array.isArray(
            j.decision_trace?.stages
          )
            ? j.decision_trace.stages
            : []
        );


  /*
   * ============================================================
   * ADAPTIVE EVIDENCE
   * ============================================================
   */

  const adaptive =
    result.adaptive_evidence ||
    result.adaptive ||
    j.adaptive_evidence ||
    {};


  /*
   * ============================================================
   * REQUIRED EVIDENCE
   *
   * Decision requested evidence is authoritative.
   * ============================================================
   */

  const rawRequiredEvidence =
    d?.requested_evidence ||
    result?.decision?.requested_evidence ||
    adaptive?.requested_evidence ||
    j?.why_sensor?.required_evidence ||
    adaptive?.required_evidence ||
    "—";


  /*
   * Backend may return:
   *
   * ["SECOND_IMAGE"]
   *
   * or:
   *
   * "SECOND_IMAGE"
   *
   * Normalize it for the UI.
   */

  const requiredEvidence =
    Array.isArray(
      rawRequiredEvidence
    )
      ? (
          rawRequiredEvidence.length > 0
            ? rawRequiredEvidence[0]
            : "—"
        )
      : rawRequiredEvidence;


  const requiredEvidenceText =
    String(
      requiredEvidence || "—"
    );


  const requiredEvidenceUpper =
    requiredEvidenceText.toUpperCase();


  /*
   * ============================================================
   * REQUESTED SOURCE
   * ============================================================
   */

  const requestedSource =
    j?.why_sensor?.requested_source ||
    adaptive?.requested_source ||
    "—";


  /*
   * ============================================================
   * POLICY
   * ============================================================
   */

  const policyMinutes =
    j?.why_sensor?.policy_minutes ||
    adaptive?.policy_minutes ||
    15;


  /*
   * ============================================================
   * REQUIRED EVIDENCE TYPE
   *
   * This becomes the strongest UI signal.
   *
   * SECOND_IMAGE must never be described as a sensor request.
   * ============================================================
   */

  const isSecondImageRequired =
    requiredEvidenceUpper === "SECOND_IMAGE" ||
    requiredEvidenceUpper.includes(
      "SECOND_IMAGE"
    );


  const isSensorEvidenceRequired =
    requiredEvidenceUpper.includes(
      "SENSOR"
    ) ||
    requiredEvidenceUpper.includes(
      "ENVIRONMENT"
    );


  /*
   * ============================================================
   * HUMAN-READABLE ADAPTIVE ACTION
   * ============================================================
   */

  const adaptiveDisplayAction =
    isSecondImageRequired
      ? "REQUEST_IMAGE"
      : (
          adaptiveAction ||
          decisionAction ||
          "COLLECT_ADDITIONAL_EVIDENCE"
        );


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <main className="content">


      {/* ========================================================
          HEADER
          ======================================================== */}

      <div className="page-head">

        <div>

          <Eyebrow>
            FIELD INTELLIGENCE ·{" "}
            {result.context?.zone_id || "A1"}
          </Eyebrow>

          <h1>
            Decision intelligence
          </h1>

          <p>
            One evidence-backed assessment,
            with a transparent trace from
            observation to action.
          </p>

        </div>


        <div className="page-actions">

          <Button
            variant="secondary"
            onClick={onObserve}
          >
            <Icon name="camera" />
            New observation
          </Button>

        </div>

      </div>


      {/* ========================================================
          MAIN RISK AREA
          ======================================================== */}

      <div className="intel-hero">


        {/* ======================================================
            RISK CARD
            ====================================================== */}

        <Card
          className={
            `risk-hero ${
              isWaiting
                ? "waiting"
                : String(
                    r?.level ||
                    "UNKNOWN"
                  ).toLowerCase()
            }`
          }
        >

          <Eyebrow>
            FUSED FIELD RISK
          </Eyebrow>


          <div className="risk-hero-main">

            <div>

              {decisionReady ? (

                <RiskBadge
                  level={
                    r.level
                  }
                />

              ) : (

                <div className="state-pill attention">
                  WAITING FOR EVIDENCE
                </div>

              )}


              <strong>

                {decisionReady &&
                hasRiskScore
                  ? Number(
                      riskScore
                    ).toFixed(1)
                  : "—"}

              </strong>

              <span>
                / 100
              </span>

            </div>


            <div className="confidence-ring">

              <span>
                Assessment
              </span>

              <b>

                {confidence != null
                  ? `${confidence.toFixed(0)}%`
                  : "—"}

              </b>

            </div>

          </div>


          <h2>

            {decisionReady

              ? (
                  d.action ||
                  "DETERMINISTIC DECISION"
                )

              : (
                  adaptiveDisplayAction
                )}

          </h2>


          <p>

            {decisionReady

              ? (
                  d.rationale ||
                  "Deterministic CRAI decision from fused evidence."
                )

              : isSecondImageRequired

                ? (
                    "Visual evidence is insufficient for a reliable field assessment. CRAI is requesting another image before finalizing risk."
                  )

                : (
                    adaptive?.reason ||
                    j?.why_sensor?.reason ||
                    "CRAI is waiting for the evidence required to finalize the field assessment."
                  )}

          </p>


          {/* ====================================================
              WAITING EXPLANATION
              ==================================================== */}

          {isWaiting && (

            <div
              className="error-banner"
              style={{
                marginTop: 16
              }}
            >

              <b>
                CRAI evidence gate
              </b>

              <span>
                The risk score is intentionally not calculated
                until the required evidence is available.
                Missing evidence is not treated as zero.
              </span>

            </div>

          )}

        </Card>


        {/* ======================================================
            VISUAL SIGNAL
            ====================================================== */}

        <Card className="disease-card">

          <Eyebrow>
            VISUAL SIGNAL
          </Eyebrow>


          <div className="disease-name">

            <Icon name="leaf" />

            <div>

              <small>
                Detected condition
              </small>

              <h2>
                {v.disease || "Unknown"}
              </h2>

            </div>

          </div>


          <div className="confidence-bar">

            <span
              style={{
                width:
                  `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        v.confidence || 0
                      )
                    )
                  )}%`
              }}
            />

          </div>


          <div className="disease-foot">

            <b>
              {Number(
                v.confidence || 0
              ).toFixed(1)}%
            </b>

            <span>
              model confidence
            </span>

          </div>


          <div className="context-tags">

            <span>
              Zone{" "}
              {result.context?.zone_id || "A1"}
            </span>

            <span>
              {result.context?.crop || "Tomato"}
            </span>

            <span>
              {
                result.context?.growth_stage ||
                "Vegetative"
              }
            </span>

          </div>

        </Card>

      </div>


      {/* ========================================================
          EVIDENCE + ADAPTIVE EVIDENCE
          ======================================================== */}

      <div className="intel-grid">


        {/* ======================================================
            WHY THIS RISK
            ====================================================== */}

        <Card>

          <div className="card-title-row">

            <div>

              <Eyebrow>
                WHY THIS RISK?
              </Eyebrow>

              <h2>
                Evidence contribution
              </h2>

            </div>

            <span className="version-pill">
              35 · 25 · 25 · 15
            </span>

          </div>


          <div className="contribution-list">

            {entries.map(
              ([label, score, points]) => (

                <div
                  className="contribution"
                  key={label}
                >

                  <div className="contribution-top">

                    <span>
                      {label}
                    </span>

                    <b>

                      {score == null

                        ? "Not available"

                        : Number(
                            score
                          ).toFixed(1)}

                    </b>

                  </div>


                  <div className="contribution-bar">

                    <i
                      style={{
                        width:
                          score == null
                            ? "0%"
                            : `${Math.min(
                                100,
                                Number(score)
                              )}%`
                      }}
                    />

                  </div>


                  <small>

                    {!decisionReady

                      ? "Intermediate signal — not part of the final field decision"

                      : points == null

                        ? "Not used in this decision"

                        : `Weighted contribution +${Number(
                            points
                          ).toFixed(1)} points`}

                  </small>

                </div>

              )
            )}

          </div>

        </Card>


        {/* ======================================================
            ADAPTIVE EVIDENCE
            ====================================================== */}

        <Card>

          <div className="card-title-row">

            <div>

              <Eyebrow>

                {isSecondImageRequired
                  ? "WHY ANOTHER IMAGE?"
                  : "WHY THIS SENSOR?"}

              </Eyebrow>

              <h2>
                Adaptive evidence
              </h2>

            </div>


            <span
              className={
                `state-pill ${
                  isWaiting
                    ? "attention"
                    : "good"
                }`
              }
            >

              {isWaiting
                ? "REQUESTED"
                : "NOT REQUIRED"}

            </span>

          </div>


          <div className="judge-copy">

            <p>

              {isSecondImageRequired

                ? (
                    "Visual evidence is insufficient for a reliable field assessment. CRAI is requesting another image before finalizing risk."
                  )

                : isWaiting

                  ? (
                      j?.why_sensor?.reason ||
                      adaptive?.reason ||
                      "CRAI requires additional evidence before finalizing the field assessment."
                    )

                  : (
                      j?.why_sensor?.reason ||
                      adaptive?.reason ||
                      "The current evidence set is sufficient for the decision path."
                    )}

            </p>


            <div className="mini-grid">


              <div>

                <small>
                  Required evidence
                </small>

                <b>
                  {requiredEvidenceText}
                </b>

              </div>


              <div>

                <small>
                  Source
                </small>

                <b>
                  {isSecondImageRequired
                    ? "SMARTPHONE"
                    : requestedSource}
                </b>

              </div>


              <div>

                <small>
                  Policy
                </small>

                <b>
                  {policyMinutes} min
                </b>

              </div>


              <div>

                <small>
                  Decision ready
                </small>

                <b>
                  {decisionReady
                    ? "YES"
                    : "NO"}
                </b>

              </div>


            </div>

          </div>

        </Card>

      </div>


      {/* ========================================================
          EVIDENCE PROVENANCE
          ======================================================== */}

      <Card>

        <div className="card-title-row">

          <div>

            <Eyebrow>
              EVIDENCE PROVENANCE
            </Eyebrow>

            <h2>
              Where every signal came from
            </h2>

          </div>

          <span className="version-pill">
            EXPLAINABLE
          </span>

        </div>


        <div className="provenance-table">

          <div className="prov-row prov-head">

            <span>
              Evidence
            </span>

            <span>
              Source
            </span>

            <span>
              Freshness
            </span>

            <span>
              Status
            </span>

          </div>


          {provenance.map(
            (p, i) => (

              <div
                className="prov-row"
                key={
                  `${p?.type || "evidence"}-${i}`
                }
              >

                <span>

                  <b>
                    {String(
                      p?.type ||
                      "evidence"
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </b>

                  <small>

                    {p?.value != null

                      ? typeof p.value === "object"

                        ? JSON.stringify(
                            p.value
                          )

                        : String(
                            p.value
                          )

                      : p?.values

                        ? JSON.stringify(
                            p.values
                          )

                        : "—"}

                  </small>

                </span>


                <span>
                  {p?.source || "—"}
                </span>


                <span>
                  {p?.freshness || "—"}
                </span>


                <span>

                  <span
                    className={
                      `table-status ${
                        !decisionReady ||
                        p?.used_in_decision === false ||
                        p?.used === false
                          ? "muted"
                          : "good"
                      }`
                    }
                  >

                    {!decisionReady

                      ? "Pending final"

                      : p?.used_in_decision === false ||
                        p?.used === false

                        ? "Not used"

                        : "Used"}

                  </span>

                </span>

              </div>

            )
          )}

        </div>

      </Card>


      {/* ========================================================
          DECISION TRACE + ADVISORY
          ======================================================== */}

      <div className="intel-grid">


        {/* ======================================================
            DECISION TRACE
            ====================================================== */}

        <Card>

          <div className="card-title-row">

            <div>

              <Eyebrow>
                DECISION TRACE
              </Eyebrow>

              <h2>
                Deterministic execution path
              </h2>

            </div>

            <span className="version-pill">
              NO LLM RISK
            </span>

          </div>


          <div className="trace">

            {trace.length > 0

              ? trace.map(
                  (t, i) => {

                    const stage =
                      String(
                        typeof t === "string"
                          ? t
                          : (
                              t?.stage ||
                              t?.name ||
                              "Decision stage"
                            )
                      );


                    const stageUpper =
                      stage.toUpperCase();


                    /*
                     * IMPORTANT:
                     *
                     * Backend may currently report:
                     *
                     * ADAPTIVE_EVIDENCE_GATE
                     * DECISION_READY
                     *
                     * while the deterministic decision
                     * itself is NOT_READY.
                     *
                     * The UI must not display this
                     * contradictory state.
                     */

                    const isAdaptiveTraceStage =
                      stageUpper.includes(
                        "ADAPTIVE"
                      );


                    const displayStatus =
                      !decisionReady &&
                      isAdaptiveTraceStage

                        ? "WAITING_FOR_REQUIRED_EVIDENCE"

                        : (
                            typeof t === "object"
                              ? (
                                  t?.status ||
                                  t?.detail ||
                                  "Completed"
                                )
                              : "Completed"
                          );


                    return (

                      <div
                        className="trace-row"
                        key={i}
                      >

                        <b>
                          {String(
                            i + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </b>


                        <span>
                          {stage}
                        </span>


                        <small>
                          {displayStatus}
                        </small>

                      </div>

                    );

                  }
                )

              : (

                <div className="trace-row">

                  <b>
                    01
                  </b>

                  <span>
                    Evidence evaluation
                  </span>

                  <small>
                    {decisionReady
                      ? "COMPLETE"
                      : "WAITING_FOR_REQUIRED_EVIDENCE"}
                  </small>

                </div>

              )}

          </div>

        </Card>


        {/* ======================================================
            LOCAL ADVISORY
            ====================================================== */}

        <Card className="advisory-card">

          <div className="card-title-row">

            <div>

              <Eyebrow>
                LOCAL ADVISORY
              </Eyebrow>

              <h2>
                Operator guidance
              </h2>

            </div>

            <span className="state-pill good">
              EXPLANATION ONLY
            </span>

          </div>


          <p className="advisory-text">

            {decisionReady

              ? (
                  advisoryText ||
                  "Advisory is not available yet."
                )

              : (
                  "Advisory will be generated only after the deterministic CRAI assessment is complete."
                )}

          </p>


          <div className="advisory-meta">

            <span>
              {String(
                adv?.provider ||
                "OLLAMA"
              )}
            </span>

            <span>
              {String(
                adv?.model ||
                "qwen3:1.7b"
              )}
            </span>

            <span>
              {adv?.fallback
                ? "FALLBACK"
                : "LOCAL OUTPUT"}
            </span>

          </div>


          <div className="advisory-actions">

            <label className="field advisory-language">

              <span>
                Language
              </span>

              <select
                value={
                  language ||
                  "English"
                }
                onChange={
                  e =>
                    onLanguageChange?.(
                      e.target.value
                    )
                }
              >

                <option>
                  English
                </option>

                <option>
                  Tamil
                </option>

                <option>
                  Hindi
                </option>

              </select>

            </label>


            <Button
              variant="secondary"
              disabled={
                !decisionReady ||
                !advisoryText ||
                advisoryPlaying
              }
              onClick={
                regenerateAdvisory
              }
            >
              Regenerate advisory
            </Button>


            {advisoryPlaying

              ? (

                <Button
                  variant="secondary"
                  onClick={
                    stopAdvisory
                  }
                >
                  Stop audio
                </Button>

              )

              : (

                <Button
                  variant="secondary"
                  disabled={
                    !decisionReady ||
                    !advisoryText
                  }
                  onClick={
                    () =>
                      playAdvisory(
                        advisoryText,
                        language
                      )
                  }
                >

                  <Icon name="leaf" />

                  Play advisory

                </Button>

              )}

          </div>


          {advisoryError && (

            <div className="error-banner">

              <b>
                Advisory
              </b>

              <span>
                {advisoryError}
              </span>

            </div>

          )}


          <small>
            Qwen/Ollama explains the deterministic
            CRAI evidence only. It never calculates
            or overwrites risk.
          </small>

        </Card>

      </div>

    </main>
  );
}