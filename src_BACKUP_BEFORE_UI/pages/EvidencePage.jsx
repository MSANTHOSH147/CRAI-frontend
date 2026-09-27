import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  FileCheck2,
  Printer,
  RefreshCw,
  Fingerprint,
  Eye,
  Thermometer,
  Activity,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { useParams } from "react-router-dom";

const API =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


function firstObject(...values) {
  for (const value of values) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      return value;
    }
  }

  return {};
}


export default function EvidencePage() {

  const { id } = useParams();

  const [data, setData] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  async function load() {

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        `${API}/api/events/${encodeURIComponent(id)}/evidence`
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.detail ||
          `Evidence request failed (${response.status})`
        );
      }

      setData(json);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to load evidence package."
      );

    } finally {

      setLoading(false);

    }
  }


  async function verify() {

    try {

      const response = await fetch(
        `${API}/api/evidence/verify?event_id=${encodeURIComponent(id)}`,
        {
          method: "POST"
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.detail ||
          "Integrity verification failed."
        );
      }

      setVerification(json);

    } catch (err) {

      setVerification({
        valid: false,
        reason: err?.message
      });

    }
  }


  useEffect(() => {

    if (id) {
      load();
    }

  }, [id]);


  if (loading) {

    return (
      <div className="page">
        <div className="evidence-package-loading">
          <RefreshCw
            size={22}
            className="spin"
          />
          Loading CRAI evidence package...
        </div>
      </div>
    );

  }


  if (error) {

    return (
      <div className="page">

        <div className="evidence-package-error">

          <AlertTriangle size={22} />

          <div>

            <h2>
              Evidence package unavailable
            </h2>

            <p>
              {error}
            </p>

            <button
              className="soft-button"
              onClick={load}
            >
              Retry
            </button>

          </div>

        </div>

      </div>
    );

  }


  /*
   * IMPORTANT:
   *
   * Backend response:
   *
   * {
   *   package: {
   *     record: {
   *       risk_score,
   *       risk_level,
   *       status,
   *       during_state,
   *       sensor_references,
   *       image_references
   *     }
   *   }
   * }
   *
   * The old UI treated package itself as the event.
   * That is why it displayed UNKNOWN.
   */

  const packageData =
    data?.package ||
    {};

  const record =
    packageData?.record ||
    data?.event ||
    data?.record ||
    {};

  const during =
    record?.during_state ||
    {};

  const before =
    record?.before_state ||
    {};

  const after =
    record?.after_state ||
    {};

  const event = {
    ...record,

    /*
     * Prefer record values, then package-level values.
     */
    event_id:
      record?.event_id ||
      packageData?.event_id ||
      data?.event_id ||
      id,

    crop:
      record?.crop ||
      data?.crop ||
      "Tomato",

    zone_id:
      record?.zone_id ||
      data?.zone_id ||
      "A1",

    status:
      record?.status ||
      data?.status ||
      "UNKNOWN",

    risk_score:
      record?.risk_score ??
      during?.risk_score ??
      data?.risk_score ??
      null,

    risk_level:
      record?.risk_level ||
      during?.risk_level ||
      data?.risk_level ||
      "UNKNOWN",

    decision:
      record?.decision ||
      during?.decision ||
      data?.decision ||
      null,

    action:
      record?.action ||
      during?.action ||
      data?.action ||
      null,

    evidence_sources:
      record?.evidence_sources ||
      data?.evidence_sources ||
      packageData?.evidence_sources ||
      [],

    sensor_references:
      record?.sensor_references ||
      data?.sensor_references ||
      [],

    image_references:
      record?.image_references ||
      data?.image_references ||
      [],

    temporal_context:
      record?.temporal_context ||
      data?.temporal_context ||
      {},

    spatial_context:
      record?.spatial_context ||
      data?.spatial_context ||
      {},

    integrity_hash:
      data?.integrity_hash ||
      packageData?.integrity_hash ||
      record?.integrity_hash ||
      "-"
  };


  /*
   * Browser-local image reference created by FieldAssessment.
   *
   * This is explicitly labelled local evidence.
   */
  let localImage = null;

  try {

    const stored =
      sessionStorage.getItem(
        `crai:image:${event.event_id}`
      );

    if (stored) {
      localImage = JSON.parse(stored);
    }

  } catch {
    localImage = null;
  }


  const images = event.image_references || [];
  const sensors = event.sensor_references || [];
  const sources = event.evidence_sources || [];


  const lifecycle = [
    ["BEFORE", before],
    ["DURING", during],
    ["RECOVERY", record?.recovery_state],
    ["AFTER", after],
    [
      "RESOLVED",
      event.status === "RESOLVED"
        ? { status: "RESOLVED" }
        : null
    ]
  ];


  return (
    <div className="page evidence-page">

      <div className="evidence-package-header">

        <div>

          <div className="eyebrow">
            TRACEABLE FARM RECORD
          </div>

          <h1>
            CRAI Evidence Package
          </h1>

          <p>
            Structured evidence associated with
            this CRAI field event.
          </p>

        </div>


        <div className="evidence-package-actions">

          <button
            className="soft-button"
            onClick={verify}
          >
            <FileCheck2 size={16} />
            Verify Integrity
          </button>

          <button
            className="soft-button"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print / Save
          </button>

        </div>

      </div>


      {/* ======================================================
          IDENTITY
      ======================================================= */}

      <div className="evidence-identity-grid">

        <div>
          <span>EVENT ID</span>
          <b>{event.event_id}</b>
        </div>

        <div>
          <span>CROP</span>
          <b>{event.crop}</b>
        </div>

        <div>
          <span>ZONE</span>
          <b>{event.zone_id}</b>
        </div>

        <div>
          <span>STATUS</span>
          <b>{event.status}</b>
        </div>

        <div>
          <span>RISK</span>
          <b>
            {event.risk_score !== null
              ? `${Number(event.risk_score).toFixed(2)} / 100`
              : "—"}
          </b>
        </div>

        <div>
          <span>RISK LEVEL</span>
          <b>{event.risk_level}</b>
        </div>

      </div>


      {/* ======================================================
          DECISION
      ======================================================= */}

      <section className="evidence-package-card evidence-decision-card">

        <div className="eyebrow">
          AUTHORITATIVE DECISION
        </div>

        <h2>
          <ShieldCheck size={19} />
          {event.risk_level} ·{" "}
          {event.risk_score !== null
            ? Number(event.risk_score).toFixed(2)
            : "—"}
          /100
        </h2>

        <div className="result-facts">

          <div>
            <span>Action</span>
            <strong>
              {event.decision?.action ||
                event.action ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Priority</span>
            <strong>
              {event.decision?.priority ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Decision ready</span>
            <strong>
              {event.decision?.ready === true
                ? "YES"
                : "—"}
            </strong>
          </div>

          <div>
            <span>Evidence sources</span>
            <strong>
              {sources.length}
            </strong>
          </div>

        </div>

        {event.decision?.message && (
          <p className="evidence-decision-message">
            {event.decision.message}
          </p>
        )}

      </section>


      {/* ======================================================
          VISUAL
      ======================================================= */}

      <div className="evidence-package-grid">

        <section className="evidence-package-card">

          <div className="eyebrow">
            VISUAL EVIDENCE
          </div>

          <h2>
            <Eye size={19} />
            Crop observations
          </h2>


          {localImage?.preview && (
            <div className="evidence-local-image">

              <img
                src={localImage.preview}
                alt="Farmer uploaded crop evidence"
              />

              <div>
                <strong>
                  {localImage.filename}
                </strong>

                <span>
                  Local browser evidence ·{" "}
                  {localImage.capturedAt}
                </span>
              </div>

            </div>
          )}


          {images.length > 0 ? (

            <div className="evidence-list">

              {images.map((item, index) => (

                <div key={index}>

                  <b>
                    {item?.reference ||
                      item?.id ||
                      item?.filename ||
                      `Image ${index + 1}`}
                  </b>

                  <span>
                    {item?.timestamp ||
                      item?.phase ||
                      "Recorded"}
                  </span>

                </div>

              ))}

            </div>

          ) : !localImage ? (

            <p className="muted">
              No backend image reference is stored
              for this event.
            </p>

          ) : (

            <p className="muted">
              Image used for this assessment is
              retained as a local browser evidence
              reference. Backend image storage is not
              claimed.
            </p>

          )}

        </section>


        {/* ====================================================
            SENSOR
        ===================================================== */}

        <section className="evidence-package-card">

          <div className="eyebrow">
            ENVIRONMENTAL EVIDENCE
          </div>

          <h2>
            <Thermometer size={19} />
            Sensor records
          </h2>


          {sensors.length > 0 ? (

            <div className="evidence-list">

              {sensors.map((item, index) => (

                <div key={index}>

                  <b>
                    {item?.reading_id ||
                      item?.id ||
                      `Reading ${index + 1}`}
                  </b>

                  <span>
                    {item?.source ||
                      "Unknown source"}
                    {" · "}
                    {item?.temperature != null
                      ? `${item.temperature}°C`
                      : "—"}
                    {" · "}
                    {item?.humidity != null
                      ? `${item.humidity}% RH`
                      : "—"}
                  </span>

                </div>

              ))}

            </div>

          ) : (

            <p className="muted">
              No sensor reference is stored.
            </p>

          )}

        </section>


        {/* ====================================================
            TEMPORAL
        ===================================================== */}

        <section className="evidence-package-card">

          <div className="eyebrow">
            TEMPORAL CONTEXT
          </div>

          <h2>
            <Activity size={19} />
            Field history
          </h2>

          <pre className="evidence-json">
            {JSON.stringify(
              event.temporal_context || {},
              null,
              2
            )}
          </pre>

        </section>


        {/* ====================================================
            SPATIAL
        ===================================================== */}

        <section className="evidence-package-card">

          <div className="eyebrow">
            SPATIAL CONTEXT
          </div>

          <h2>
            <MapPin size={19} />
            Field location
          </h2>

          <pre className="evidence-json">
            {JSON.stringify(
              event.spatial_context || {},
              null,
              2
            )}
          </pre>

        </section>

      </div>


      {/* ======================================================
          LIFECYCLE
      ======================================================= */}

      <section className="evidence-lifecycle-card">

        <div className="eyebrow">
          EVENT LIFECYCLE
        </div>

        <div className="evidence-lifecycle">

          {lifecycle.map(([label, value]) => (

            <div
              key={label}
              className={value ? "active" : ""}
            >

              <span>
                {label}
              </span>

              <b>
                {value
                  ? "RECORDED"
                  : "PENDING"}
              </b>

            </div>

          ))}

        </div>

      </section>


      {/* ======================================================
          INTEGRITY
      ======================================================= */}

      <section className="evidence-integrity-card">

        <div>

          <div className="eyebrow">
            INTEGRITY RECORD
          </div>

          <h2>
            <Fingerprint size={20} />
            Evidence record hash
          </h2>

          <code>
            {event.integrity_hash}
          </code>

        </div>

        <ShieldCheck size={30} />

      </section>


      {verification && (

        <section
          className={
            verification.valid
              ? "evidence-verification success"
              : "evidence-verification failure"
          }
        >

          {verification.valid ? (
            <ShieldCheck size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}

          <div>

            <b>
              {verification.valid
                ? "Integrity verified"
                : "Integrity verification failed"}
            </b>

            <p>
              {verification.reason ||
                "Stored and computed integrity values were compared."}
            </p>

          </div>

        </section>

      )}


      <div className="evidence-disclaimer">

        This package supports traceable documentation
        of the recorded event. The integrity hash verifies
        record integrity; it does not independently prove
        the truth of the underlying observations or determine
        insurance payout.

      </div>

    </div>
  );
}
