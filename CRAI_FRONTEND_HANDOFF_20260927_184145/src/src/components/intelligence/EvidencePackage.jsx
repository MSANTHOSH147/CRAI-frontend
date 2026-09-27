import {
  CheckCircle2,
  FileCheck2,
  Printer,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  fetchEvidencePackage,
  verifyEvidencePackage,
} from "../../services/craiData.js";


function value(v) {
  return v === null ||
    v === undefined ||
    v === ""
    ? "Not available"
    : String(v);
}


export default function EvidencePackage({
  event,
  open = false,
  onClose,
}) {

  const [
    packageData,
    setPackageData,
  ] = useState(null);

  const [
    verification,
    setVerification,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const eventId =
    event?.eventId ||
    event?.event_id ||
    event?.id;

  useEffect(() => {

    if(!open || !eventId) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setVerification(null);

    fetchEvidencePackage(eventId)
      .then((data) => {
        if(!cancelled) {
          setPackageData(data);
        }
      })
      .catch(() => {
        if(!cancelled) {
          setPackageData(null);
        }
      })
      .finally(() => {
        if(!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };

  }, [open, eventId]);


  if(!open) {
    return null;
  }


  const pkg =
    packageData?.package ||
    packageData?.evidence_package ||
    packageData ||
    {};

  const integrityHash =
    packageData?.integrity_hash ||
    pkg?.integrity_hash ||
    event?.integrity?.hash ||
    null;


  async function verify() {

    if(!eventId) {
      return;
    }

    setVerifying(true);

    try {
      const result =
        await verifyEvidencePackage(
          eventId
        );

      setVerification(result);

    } catch(error) {

      setVerification({
        valid: false,
        reason:
          error?.message ||
          "Verification failed.",
      });

    } finally {
      setVerifying(false);
    }
  }


  return (
    <div
      className="evidence-modal-backdrop"
      onClick={onClose}
    >
      <section
        className="evidence-modal"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="evidence-modal-head">

          <div>
            <div className="eyebrow">
              CLAIM-SUPPORT RECORD
            </div>

            <h2>
              CRAI Farm Evidence Package
            </h2>

            <p>
              A traceable record of the
              field event and the evidence
              available to CRAI.
            </p>
          </div>

          <button
            className="soft-button"
            onClick={onClose}
          >
            <X size={16}/>
          </button>

        </div>


        {loading ? (

          <div className="empty-inline">
            Loading evidence package…
          </div>

        ) : (

          <>

            <div className="evidence-document">

              <div className="evidence-document-title">
                <FileCheck2 size={20}/>
                Evidence Record
              </div>


              <div className="evidence-document-grid">

                <div>
                  <span>Event ID</span>
                  <b>{value(eventId)}</b>
                </div>

                <div>
                  <span>Crop</span>
                  <b>
                    {value(
                      event?.crop
                    )}
                  </b>
                </div>

                <div>
                  <span>Zone</span>
                  <b>
                    {value(
                      event?.zoneId
                    )}
                  </b>
                </div>

                <div>
                  <span>Risk</span>
                  <b>
                    {event?.riskScore != null
                      ? `${Math.round(event.riskScore)}/100`
                      : "Not available"}
                  </b>
                </div>

                <div>
                  <span>Risk level</span>
                  <b>
                    {value(
                      event?.riskLevel
                    )}
                  </b>
                </div>

                <div>
                  <span>Lifecycle</span>
                  <b>
                    {value(
                      event?.lifecycleStage ||
                      event?.stage ||
                      event?.status
                    )}
                  </b>
                </div>

              </div>


              <div className="evidence-section">

                <h3>Evidence sources</h3>

                <div className="evidence-source-grid">

                  {[
                    [
                      "Visual",
                      event?.evidence?.visual,
                    ],
                    [
                      "Environment",
                      event?.evidence?.environment ||
                      event?.evidence?.environmental,
                    ],
                    [
                      "Temporal",
                      event?.evidence?.temporal,
                    ],
                    [
                      "Spatial",
                      event?.evidence?.spatial,
                    ],
                  ].map(([label, item]) => (

                    <div
                      className="evidence-source"
                      key={label}
                    >
                      <ShieldCheck size={16}/>

                      <div>
                        <b>{label}</b>

                        <span>
                          {item?.available
                            ? "Available"
                            : "Not available"}
                        </span>
                      </div>
                    </div>

                  ))}

                </div>

              </div>


              <div className="evidence-section">

                <h3>
                  Integrity
                </h3>

                <div className="integrity-box">

                  <div>
                    <span>
                      SHA-256 record hash
                    </span>

                    <code>
                      {value(
                        integrityHash
                      )}
                    </code>
                  </div>

                  {verification && (
                    <div
                      className={
                        verification.valid
                          ? "verification-ok"
                          : "verification-bad"
                      }
                    >
                      <CheckCircle2 size={16}/>

                      {verification.valid
                        ? "Integrity verified"
                        : "Integrity verification failed"}
                    </div>
                  )}

                </div>

              </div>


              <div className="evidence-disclaimer">
                This package supports traceable
                documentation of the evidence
                recorded by CRAI. Integrity
                verification confirms the record
                has not changed; it does not by
                itself prove the underlying facts
                or determine an insurance payout.
              </div>

            </div>


            <div className="evidence-actions">

              <button
                className="soft-button"
                onClick={verify}
                disabled={verifying}
              >
                <ShieldCheck size={16}/>
                {verifying
                  ? "Verifying…"
                  : "Verify Integrity"}
              </button>

              <button
                className="soft-button primary"
                onClick={() => window.print()}
              >
                <Printer size={16}/>
                Print / Save PDF
              </button>

            </div>

          </>

        )}

      </section>
    </div>
  );
}
