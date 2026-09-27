import React, {
  useRef,
  useState
} from "react";

import {
  Button,
  Card,
  Eyebrow,
  Icon
} from "../components/common/UI";


function SelectField({
  label,
  value,
  onChange,
  children
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        {children}
      </select>
    </label>
  );
}


export default function Observe({
  form,
  setForm,
  file,
  setFile,
  preview,
  quality,
  adaptive,
  running,
  error,
  runAnalysis,
  acquireSensor,
  acquisitionState,
  onIntel
}) {

  /*
   * ONE ref only.
   *
   * This is used by:
   * - Take photo button
   * - Replace button
   * - Dropzone click
   */
  const inputRef = useRef(null);


  const [
    drag,
    setDrag
  ] = useState(false);


  /*
   * ============================================================
   * FILE HANDLER
   *
   * App.jsx passes:
   *
   * setFile={handleFileSelected}
   *
   * Therefore calling setFile(f) does BOTH:
   *
   * 1. Shows the preview
   * 2. Automatically starts CRAI analysis
   *
   * This is the phone-camera → CRAI connection.
   * ============================================================
   */

  const choose = (f) => {

    if (!f) {
      return;
    }


    /*
     * Accept only image files.
     */

    if (
      !f.type ||
      !f.type.startsWith("image/")
    ) {

      return;
    }


    setFile(f);

  };


  /*
   * ============================================================
   * ADAPTIVE SENSOR STATE
   *
   * We check both possible locations because backend responses
   * can contain adaptive evidence at different levels.
   * ============================================================
   */

  const adaptiveAction =
    String(
      adaptive?.action ||
      adaptive?.adaptive_action ||
      ""
    ).toUpperCase();


  const sensorNeeded =
    adaptiveAction ===
      "REQUEST_SENSOR" ||

    adaptiveAction ===
      "REQUEST_FRESH_SENSOR" ||

    adaptiveAction.includes(
      "SENSOR"
    );


  /*
   * ============================================================
   * OPEN CAMERA
   * ============================================================
   */

  const openCamera = (event) => {

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    inputRef.current?.click();

  };


  return (

    <main className="content">


      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-head">

        <div>

          <Eyebrow>
            OBSERVE · SMARTPHONE VISION
          </Eyebrow>

          <h1>
            Create a field observation
          </h1>

          <p>
            Start with a crop image.
            CRAI validates quality,
            evaluates disease evidence,
            then asks only for what
            is missing.
          </p>

        </div>


        <div className="page-actions">

          <Button
            type="button"
            variant="secondary"
            onClick={openCamera}
            disabled={running}
          >

            <Icon
              name="camera"
            />

            {running
              ? "Analyzing…"
              : "Take photo"}

          </Button>

        </div>

      </div>


      {/* ======================================================
          PHONE CAMERA / FILE INPUT
          
          IMPORTANT:
          
          capture="environment"
          
          tells supported mobile browsers to prefer the
          rear camera.
          
          On laptop it will behave as a normal file picker.
      ====================================================== */}

      <input

        ref={inputRef}

        type="file"

        accept="image/*"

        capture="environment"

        hidden

        onChange={(event) => {

          const selected =
            event.target.files?.[0];


          if (selected) {

            choose(
              selected
            );

          }


          /*
           * Clear input so the SAME image can be selected
           * again later if necessary.
           */

          event.target.value = "";

        }}

      />


      {/* ======================================================
          MAIN OBSERVATION AREA
      ====================================================== */}

      <div className="observe-layout">


        {/* ====================================================
            CAPTURE CARD
        ==================================================== */}

        <Card className="capture-card">


          <div

            className={`
              dropzone
              ${drag ? "drag" : ""}
              ${preview ? "has-image" : ""}
            `}

            onDragOver={(event) => {

              event.preventDefault();

              setDrag(true);

            }}

            onDragLeave={() => {

              setDrag(false);

            }}

            onDrop={(event) => {

              event.preventDefault();

              setDrag(false);


              const droppedFile =
                event
                  .dataTransfer
                  .files?.[0];


              if (droppedFile) {

                choose(
                  droppedFile
                );

              }

            }}

            onClick={(event) => {

              /*
               * Do not reopen the camera when an image
               * is already displayed.
               */

              if (!preview) {

                openCamera(
                  event
                );

              }

            }}

          >


            {/* =================================================
                SELECTED IMAGE
            ================================================= */}

            {preview ? (

              <>

                <img

                  src={preview}

                  alt="Selected crop"

                />


                <div className="image-overlay">

                  <span>
                    Selected crop
                  </span>


                  <button

                    type="button"

                    onClick={(event) => {

                      event.preventDefault();

                      event.stopPropagation();

                      openCamera(
                        event
                      );

                    }}

                  >

                    Replace

                  </button>

                </div>

              </>

            ) : (

              /* =================================================
                 EMPTY CAMERA STATE
              ================================================= */

              <>

                <div className="upload-icon">

                  <Icon
                    name="camera"
                    size={32}
                  />

                </div>


                <strong>
                  Take or drop crop image
                </strong>


                <span>
                  Use your phone camera
                  or choose a photo
                </span>


                <small>
                  JPG or PNG · minimum
                  160 × 160 px
                </small>

              </>

            )}

          </div>


          {/* ==================================================
              CAPTURE STATUS
          ================================================== */}

          <div className="capture-meta">

            <span>

              <i className="live-dot" />

              SMARTPHONE VISION

            </span>


            <b>

              {running
                ? "ANALYZING"
                : file
                  ? "READY"
                  : "WAITING"}

            </b>

          </div>


          {/* ==================================================
              FORM FIELDS
          ================================================== */}

          <div className="capture-fields">


            <SelectField

              label="Zone"

              value={
                form.zoneId
              }

              onChange={(value) =>
                setForm({
                  ...form,
                  zoneId: value
                })
              }

            >

              {[
                "A1",
                "A2",
                "A3",
                "B1"
              ].map((zone) => (

                <option
                  key={zone}
                  value={zone}
                >
                  {zone}
                </option>

              ))}

            </SelectField>


            <SelectField

              label="Crop"

              value={
                form.crop
              }

              onChange={(value) =>
                setForm({
                  ...form,
                  crop: value
                })
              }

            >

              <option value="Tomato">
                Tomato
              </option>

              <option value="Potato">
                Potato
              </option>

              <option value="Chilli">
                Chilli
              </option>

            </SelectField>


            <SelectField

              label="Growth stage"

              value={
                form.growthStage
              }

              onChange={(value) =>
                setForm({
                  ...form,
                  growthStage: value
                })
              }

            >

              <option value="Vegetative">
                Vegetative
              </option>

              <option value="Flowering">
                Flowering
              </option>

              <option value="Fruiting">
                Fruiting
              </option>

            </SelectField>


            <SelectField

              label="Advisory language"

              value={
                form.advisoryLanguage
              }

              onChange={(value) =>
                setForm({
                  ...form,
                  advisoryLanguage: value
                })
              }

            >

              <option value="English">
                English
              </option>

              <option value="Tamil">
                Tamil
              </option>

              <option value="Hindi">
                Hindi
              </option>

            </SelectField>

          </div>


          {/* ==================================================
              MANUAL CRAI BUTTON
              
              This remains available for laptop testing.
              
              Phone:
              capture → automatic analysis
              
              Laptop:
              choose image → automatic analysis
              
              Manual:
              Run CRAI analysis
          ================================================== */}

          <Button

            className="full big-action"

            type="button"

            disabled={
              !file ||
              running
            }

            loading={
              running
            }

            onClick={(event) => {

              event.preventDefault();

              runAnalysis();

            }}

          >

            {running
              ? "Running CRAI analysis…"
              : "Run CRAI analysis →"}

          </Button>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="error-banner">

              <b>
                Analysis could not continue
              </b>


              <span>
                {error}
              </span>


              <button

                type="button"

                onClick={(event) => {

                  event.preventDefault();

                  runAnalysis();

                }}

              >

                Retry

              </button>

            </div>

          )}

        </Card>


        {/* ====================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="observe-side">


          {/* ==================================================
              IMAGE QUALITY
          ================================================== */}

          <Card>

            <div className="card-title-row">

              <div>

                <Eyebrow>
                  IMAGE QUALITY
                </Eyebrow>

                <h2>
                  Capture readiness
                </h2>

              </div>


              <span

                className={`
                  quality-badge
                  ${
                    (
                      quality?.status ||
                      "pending"
                    ).toLowerCase()
                  }
                `}

              >

                {quality?.status ||
                  "PENDING"}

              </span>

            </div>


            <div className="quality-grid">


              <Metric

                label="Resolution"

                value={
                  quality?.width
                    ? `${quality.width} × ${quality.height}`
                    : "Pending"
                }

              />


              <Metric

                label="Brightness"

                value={
                  quality?.brightness != null
                    ? Number(
                        quality.brightness
                      ).toFixed(2)
                    : "—"
                }

              />


              <Metric

                label="Contrast"

                value={
                  quality?.contrast != null
                    ? Number(
                        quality.contrast
                      ).toFixed(2)
                    : "—"
                }

              />


              <Metric

                label="Sharpness"

                value={
                  quality?.sharpness != null
                    ? Number(
                        quality.sharpness
                      ).toFixed(2)
                    : "—"
                }

              />

            </div>


            <p className="muted-note">

              Low-quality images are
              stopped before disease
              confidence is used for
              field intelligence.

            </p>

          </Card>


          {/* ==================================================
              ADAPTIVE EVIDENCE
          ================================================== */}

          <Card>

            <div className="card-title-row">

              <div>

                <Eyebrow>
                  ADAPTIVE EVIDENCE
                </Eyebrow>

                <h2>
                  Sense what matters
                </h2>

              </div>


              <span

                className={`
                  state-pill
                  ${
                    sensorNeeded
                      ? "attention"
                      : "good"
                  }
                `}

              >

                {sensorNeeded
                  ? "ACTION REQUIRED"
                  : "DECISION PATH"}

              </span>

            </div>


            <div className="evidence-stack">


              <Evidence

                label="Visual"

                status={
                  quality?.status ||
                  "WAITING"
                }

                good={
                  !!quality
                }

              />


              <Evidence

                label="Environment"

                status={
                  sensorNeeded
                    ? "FRESH READING REQUIRED"
                    : "FRESH / AVAILABLE"
                }

                good={
                  !sensorNeeded
                }

              />


              <Evidence

                label="Spatial"

                status="FIELD MEMORY"

                good

              />


              <Evidence

                label="Temporal"

                status="FIELD MEMORY"

                good

              />

            </div>


            {/* =================================================
                ESP32 REQUEST
            ================================================= */}

            {sensorNeeded && (

              <div className="adaptive-request">


                <div className="request-icon">

                  <Icon
                    name="chip"
                  />

                </div>


                <div>

                  <b>
                    CRAI needs one more
                    piece of evidence
                  </b>


                  <span>

                    Environmental evidence
                    must be fresh under the
                    15-minute policy.

                  </span>


                  <small>

                    Source · CRAI-ESP32-01 ·{" "}
                    {form.zoneId}

                  </small>

                </div>


                <Button

                  type="button"

                  onClick={(event) => {

                    event.preventDefault();

                    acquireSensor();

                  }}

                  loading={
                    acquisitionState ===
                    "loading"
                  }

                >

                  {acquisitionState ===
                  "loading"

                    ? "Waiting for ESP32…"

                    : "Acquire fresh ESP32 reading"}

                </Button>

              </div>

            )}


            {/* =================================================
                SENSOR SUCCESS
            ================================================= */}

            {acquisitionState ===
              "done" && (

              <div className="success-banner">

                <b>

                  Fresh REAL sensor
                  reading received.

                </b>


                <span>

                  CRAI is ready to use the
                  refreshed environmental
                  evidence.

                </span>

              </div>

            )}


            {/* =================================================
                SENSOR ERROR
            ================================================= */}

            {acquisitionState ===
              "error" && (

              <div className="error-banner">

                <b>
                  ESP32 acquisition failed
                </b>


                <span>
                  Check the physical ESP32
                  node and try again.
                </span>

              </div>

            )}

          </Card>

        </div>

      </div>


      {/* ======================================================
          CRAI PIPELINE
      ====================================================== */}

      <Card className="pipeline-card">

        <div className="card-title-row">

          <div>

            <Eyebrow>
              CRAI DECISION PIPELINE
            </Eyebrow>

            <h2>
              Evidence becomes a decision
            </h2>

          </div>


          <span className="version-pill">
            FUSION V1.5
          </span>

        </div>


        <div className="pipeline">


          {[
            "Image quality",
            "Disease AI",
            "Evidence gate",
            "Adaptive sensing",
            "Fusion V1.5",
            "Decision"
          ].map((item, index) => (

            <React.Fragment
              key={item}
            >

              <div

                className={`
                  pipeline-step
                  ${
                    quality &&
                    index < 2
                      ? "done"
                      : ""
                  }
                `}

              >

                <b>
                  0{index + 1}
                </b>


                <span>
                  {item}
                </span>

              </div>


              {index < 5 && (

                <i>
                  →
                </i>

              )}

            </React.Fragment>

          ))}

        </div>

      </Card>

    </main>

  );

}


/* ============================================================
   METRIC
============================================================ */

function Metric({
  label,
  value
}) {

  return (

    <div className="metric">

      <small>
        {label}
      </small>


      <strong>
        {value}
      </strong>

    </div>

  );

}


/* ============================================================
   EVIDENCE
============================================================ */

function Evidence({
  label,
  status,
  good
}) {

  return (

    <div className="evidence-line">

      <span
        className={
          good
            ? "check"
            : "wait"
        }
      >

        {good
          ? "✓"
          : "!"}

      </span>


      <div>

        <b>
          {label}
        </b>


        <small>
          {status}
        </small>

      </div>

    </div>

  );

}