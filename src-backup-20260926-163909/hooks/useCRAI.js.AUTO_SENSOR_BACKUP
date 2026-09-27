import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { api } from "../services/api";

import {
  ageMinutes,
  getHistory,
  normalizeResult,
  normalizeObservation,
  saveHistory,
  parseTimestamp,
} from "../utils/crai";


const RESULT_KEY =
  "crai.latest.v4";

const SENSOR_DEVICE =
  "CRAI-ESP32-01";


const POLL_MS =
  2000;

const POLL_TIMEOUT_MS =
  90000;

const ANALYSIS_TIMEOUT_MS =
  150000;

const HEALTH_POLL_MS =
  5000;

const LIVE_POLL_MS =
  2000;


/* ============================================================
   STORED RESULT
============================================================ */

function readStoredResult() {

  try {

    return normalizeResult(
      JSON.parse(
        localStorage.getItem(
          RESULT_KEY
        ) || "null"
      )
    );

  } catch {

    return null;

  }

}


/* ============================================================
   HELPERS
============================================================ */

function isReal(reading) {

  return (
    String(
      reading?.source || ""
    ).toUpperCase() ===
    "REAL"
  );

}


function sameZone(
  reading,
  zoneId
) {

  return (
    String(
      reading?.zone_id ||
      "A1"
    ).toUpperCase() ===

    String(
      zoneId ||
      "A1"
    ).toUpperCase()
  );

}


function tsMs(value) {

  const date =
    parseTimestamp(value);

  return date
    ? date.getTime()
    : NaN;

}


function readingFingerprint(
  reading
) {

  if (!reading) {
    return "";
  }

  return [
    reading.reading_id || "",
    reading.timestamp || "",
    reading.device_id || "",
    reading.zone_id || "",
    reading.soil_moisture ?? "",
    reading.temperature ?? "",
    reading.humidity ?? "",
  ].join("|");

}


function withTimeout(
  promise,
  ms,
  message
) {

  let timer;

  const timeout =
    new Promise(
      (_, reject) => {

        timer =
          setTimeout(
            () =>
              reject(
                new Error(
                  message
                )
              ),
            ms
          );

      }
    );


  return Promise
    .race([
      promise,
      timeout,
    ])
    .finally(() => {
      clearTimeout(timer);
    });

}


/* ============================================================
   LIVE SIGNATURE
============================================================ */

function liveSignature(
  live
) {

  if (!live) {
    return "";
  }

  const analysis =
    live.analysis || {};

  const decision =
    analysis.decision ||
    live.decision ||
    {};

  const risk =
    analysis.risk ||
    live.risk ||
    null;

  const sensor =
    analysis.sensor ||
    live.sensor ||
    {};

  return [
    live.filename || "",
    live.zone_id || "",
    live.status || "",

    decision.action || "",

    risk?.risk_score ?? "",
    risk?.risk_level ?? "",

    sensor.timestamp || "",

    analysis.status || "",
  ].join("|");

}


/* ============================================================
   HOOK
============================================================ */

export default function useCRAI() {

  const [
  backend,
  setBackend,
] = useState(null);

  const [
    ai,
    setAi,
  ] = useState(false);

  const [
    readings,
    setReadings,
  ] = useState([]);

  const [
    result,
    setResult,
  ] = useState(
    readStoredResult
  );

  const [
    history,
    setHistory,
  ] = useState(
    getHistory
  );

  const [
    liveObservation,
    setLiveObservation,
  ] = useState(null);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    running,
    setRunning,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    adaptive,
    setAdaptive,
  ] = useState(null);

  const [
    quality,
    setQuality,
  ] = useState(null);

  const [
    acquisitionState,
    setAcquisitionState,
  ] = useState("idle");


  /*
   * Prevent processing the exact same live
   * observation repeatedly every 2 seconds.
   */

  const lastLiveSignature =
    useRef("");


  /* ==========================================================
     PERSIST COMPLETED RESULT
  ========================================================== */

  const persistResult =
    useCallback(
      (raw) => {

        const normalized =
          normalizeResult(
            raw
          );


        if (!normalized) {
          return null;
        }


        setResult(
          normalized
        );


        try {

          localStorage.setItem(
            RESULT_KEY,
            JSON.stringify(
              normalized
            )
          );

        } catch {}


        return normalized;

      },
      []
    );


  /* ==========================================================
     READINGS
  ========================================================== */

  const refreshReadings =
    useCallback(
      async () => {

        try {

          const data =
            await api.readings();


          const array =
            (
              Array.isArray(data)
                ? data
                : (
                    data?.value ||
                    data?.items ||
                    data?.readings ||
                    data?.data ||
                    []
                  )
            )
              .filter(Boolean)
              .sort(
                (a, b) =>
                  ageMinutes(
                    a.timestamp
                  ) -
                  ageMinutes(
                    b.timestamp
                  )
              );


          setReadings(
            array
          );

          setBackend(
            true
          );


          return array;

        } catch {

          return [];

        }

      },
      []
    );


  /* ==========================================================
     REFRESH EVERYTHING
  ========================================================== */

  const refreshAll =
    useCallback(
      async () => {

        setRefreshing(
          true
        );


        await Promise.allSettled([

          withTimeout(
            api.health(),
            8000,
            "Backend health check timed out"
          )
            .then(() =>
              setBackend(true)
            )
            .catch(() => {
  // Ignore a temporary health-check failure.
  // Keep the last known backend state.
}),


          api
            .aiStatus()
            .then(() =>
              setAi(true)
            )
            .catch(() =>
              setAi(false)
            ),


          refreshReadings(),


          api
            .observations({
              farmId: 1,
              limit: 40,
            })
            .then((data) => {

              const rows =
                Array.isArray(data)
                  ? data
                  : (
                      data?.value ||
                      data?.items ||
                      data?.observations ||
                      data?.data ||
                      []
                    );


              const normalized =
                rows
                  .map(
                    normalizeObservation
                  )
                  .filter(Boolean);


              if (
                normalized.length
              ) {

                setHistory(
                  normalized
                );

              } else {

                setHistory(
                  getHistory()
                );

              }

            })
            .catch(() =>
              setHistory(
                getHistory()
              )
            ),

        ]);


        /*
         * Recover the most recently completed
         * locally persisted result.
         */

        setResult(
          readStoredResult()
        );


        setRefreshing(
          false
        );

      },
      [
        refreshReadings,
      ]
    );


  /* ==========================================================
     INITIAL + HEALTH POLLING
  ========================================================== */

  useEffect(() => {

    refreshAll();


    const timer =
  setInterval(() => {

    withTimeout(
      api.health(),
      5000,
      "Backend health check timed out"
    )
      .then(() => {
        setBackend(true);
      })
      .catch(() => {
        // Do NOT immediately show Backend offline.
        // A temporary health-check failure can happen
        // while CRAI is running local inference.
      });

  }, HEALTH_POLL_MS);


    return () =>
      clearInterval(
        timer
      );

  }, [
    refreshAll,
  ]);


  /* ==========================================================
     LIVE PHONE → LAPTOP
     
     This is the important synchronization loop.
     
     Phone:
       /api/analysis/image
     
     Backend:
       /api/live/latest
     
     Laptop:
       polls every 2 seconds
     
     When a NEW live analysis arrives:
       - update liveObservation
       - update CRAI result
       - update quality
       - update adaptive evidence
  ========================================================== */

  useEffect(() => {

    let stopped = false;


    const pollLive =
      async () => {

        try {

          const live =
            await api.liveLatest();


          if (
            stopped ||
            !live?.available
          ) {

            return;
          }


          setLiveObservation(
            live
          );


          const signature =
            liveSignature(
              live
            );


          /*
           * Ignore duplicate polling responses.
           */

          if (
            signature ===
            lastLiveSignature.current
          ) {

            return;

          }


          lastLiveSignature.current =
            signature;


          const analysis =
            live.analysis &&
            typeof live.analysis ===
              "object"
              ? live.analysis
              : live;


          /*
           * Update quality information.
           */

          const q =
            live.image_quality ||
            live.quality ||
            analysis.image_quality ||
            analysis.quality;


          if (q) {

            setQuality({
              status:
                q.status ||
                q.quality_status ||
                q.quality ||
                "GOOD",

              ...q,
            });

          }


          /*
           * Update adaptive evidence.
           */

          const ad =
            live.adaptive_evidence ||
            live.adaptive ||
            analysis.adaptive_evidence ||
            analysis.adaptive ||
            analysis.evidence?.adaptive;


          if (ad) {

            setAdaptive(
              ad
            );

          }


          /*
           * IMPORTANT:
           *
           * The laptop should receive the live CRAI
           * result even if risk is still null.
           *
           * A gated result is valid CRAI state.
           */

          const normalized =
            normalizeResult(
              live
            );


          if (normalized) {

            setResult(
              normalized
            );

          }


          /*
           * If a completed result arrives,
           * persist it locally.
           *
           * Gated results are intentionally NOT
           * written to history.
           */

          const completedRisk =
            analysis?.risk ||
            live?.risk;


          if (
            completedRisk
          ) {

            try {

              localStorage.setItem(
                RESULT_KEY,
                JSON.stringify(
                  normalized ||
                  live
                )
              );

            } catch {}

          }

        } catch {}

      };


    pollLive();


    const timer =
      setInterval(
        pollLive,
        LIVE_POLL_MS
      );


    return () => {

      stopped = true;

      clearInterval(
        timer
      );

    };

  }, []);


  /* ==========================================================
     SENSOR ONLINE
  ========================================================== */

  const sensorOnline =
    useMemo(
      () =>
        readings.some(
          (reading) =>
            isReal(reading) &&

            String(
              reading?.device_id ||
              ""
            ).toUpperCase() ===
              SENSOR_DEVICE &&

            ageMinutes(
              reading.timestamp
            ) <= 15
        ),
      [
        readings,
      ]
    );


  /* ==========================================================
     IMAGE ANALYSIS
  ========================================================== */

  async function analyze(
    form,
    file,
    options = {}
  ) {

    if (!file) {

      throw new Error(
        "Choose a crop image before running CRAI analysis."
      );

    }


    const persist =
      options.persistHistory !== false;


    setRunning(
      true
    );

    setError("");

    setAdaptive(
      null
    );


    try {

      const raw =
        await withTimeout(
          api.analyzeImage({
            file,
            ...form,
          }),

          ANALYSIS_TIMEOUT_MS,

          "CRAI analysis timed out after 150 seconds. Check the FastAPI terminal."
        );


      setBackend(
        true
      );


      const analysis =
        raw?.analysis &&
        typeof raw.analysis ===
          "object"
          ? raw.analysis
          : raw;


      /* ========================================================
         IMAGE QUALITY
      ======================================================== */

      const q =
        raw?.image_quality ||
        raw?.quality ||
        raw?.image?.quality ||
        analysis?.image_quality ||
        analysis?.quality ||
        analysis?.image?.quality;


      if (q) {

        setQuality({
          status:
            q.status ||
            q.quality_status ||
            q.quality ||
            "GOOD",

          ...q,
        });

      }


      /* ========================================================
         ADAPTIVE EVIDENCE
      ======================================================== */

      const ad =
        raw?.adaptive_evidence ||
        raw?.adaptive ||
        raw?.evidence?.adaptive ||
        analysis?.adaptive_evidence ||
        analysis?.adaptive ||
        analysis?.evidence?.adaptive;


      if (ad) {

        setAdaptive(
          ad
        );

      }


      /* ========================================================
         DECISION-FIRST GATE
         
         The deterministic decision is authoritative.
      ======================================================== */

      const decisionAction =
        String(
          analysis?.decision?.action ||
          raw?.decision?.action ||
          ""
        ).toUpperCase();


      const adaptiveAction =
        String(
          analysis?.adaptive_evidence?.action ||
          raw?.adaptive_evidence?.action ||
          analysis?.adaptive?.action ||
          raw?.adaptive?.action ||
          ""
        ).toUpperCase();


      const requestedEvidence = [

        ...(Array.isArray(
          analysis?.decision
            ?.requested_evidence
        )
          ? analysis.decision
              .requested_evidence
          : []),

        ...(Array.isArray(
          raw?.decision
            ?.requested_evidence
        )
          ? raw.decision
              .requested_evidence
          : []),

      ]
        .map(
          (x) =>
            String(x).toUpperCase()
        );


      const needsFreshSensor =
        decisionAction ===
          "COLLECT_ADDITIONAL_EVIDENCE" &&
        (
          requestedEvidence.some(
            (x) =>
              x.includes("SENSOR") ||
              x.includes("ENVIRONMENT")
          ) ||

          String(
            analysis?.decision
              ?.reason ||
            raw?.decision?.reason ||
            ""
          )
            .toUpperCase()
            .includes(
              "ENVIRONMENT"
            )
        );


      const completed =
        Boolean(
          raw?.risk ||
          analysis?.risk
        );


      /* ========================================================
         SENSOR-GATED RESULT
         
         DO NOT save to history.
         DO NOT invent risk.
      ======================================================== */

      if (
        needsFreshSensor ||
        (
          adaptiveAction ===
          "REQUEST_SENSOR" &&
          !completed
        )
      ) {

        setAdaptive(
          ad ||
          {
            action:
              "REQUEST_SENSOR",
          }
        );


        /*
         * Return the real gated backend response.
         */

        return raw;

      }


      /* ========================================================
         COMPLETED RESULT
      ======================================================== */

      const normalized =
        persistResult(
          raw
        );


      if (
        normalized &&
        persist
      ) {

        const item = {

          ...normalized,

          timestamp:
            new Date().toISOString(),

          id:
            `obs-${Date.now()}`,

        };


        saveHistory(
          item
        );

      }


      /* ========================================================
         REFRESH SENSOR DATA
      ======================================================== */

      await refreshReadings();


      /* ========================================================
         REFRESH DATABASE OBSERVATIONS
      ======================================================== */

      try {

        const data =
          await api.observations({
            farmId: 1,
            limit: 40,
          });


        const rows =
          Array.isArray(data)
            ? data
            : (
                data?.value ||
                data?.items ||
                data?.observations ||
                data?.data ||
                []
              );


        const normalizedHistory =
          rows
            .map(
              normalizeObservation
            )
            .filter(Boolean);


        if (
          normalizedHistory.length
        ) {

          setHistory(
            normalizedHistory
          );

        }

      } catch {}


      return normalized;

    } catch (e) {

      const message =
        e?.message ||
        "Unable to reach the CRAI analysis service.";


      setError(
        message
      );


      throw e;

    } finally {

      setRunning(
        false
      );

    }

  }


  /* ==========================================================
     AUTOMATIC SENSOR ACQUISITION
  ========================================================== */

  async function acquireSensor(
    zoneId,
    onReceived
  ) {

    setAcquisitionState(
      "loading"
    );

    setError("");


    const targetZone =
      String(
        zoneId ||
        "A1"
      ).toUpperCase();


    try {

      /* ========================================================
         SNAPSHOT BEFORE REQUEST
      ======================================================== */

      const before =
        await refreshReadings();


      const beforeFingerprints =
        new Set(
          before
            .map(
              readingFingerprint
            )
            .filter(Boolean)
        );


      /* ========================================================
         CREATE REAL SENSOR REQUEST
      ======================================================== */

      await api.createSensorRequest({

        farm_id: 1,

        zone_id:
          targetZone,

        device_id:
          SENSOR_DEVICE,

        source:
          "REAL",

        requested_evidence:
          "FRESH_ENVIRONMENTAL",

        reason:
          "Decision requires fresh environmental evidence under 15-minute policy.",

        priority:
          "HIGH",

      });


      /* ========================================================
         ACCEPT ONLY A NEW REAL ESP32 READING
      ======================================================== */

      const accept =
        (array) => {

          const candidates =
            array
              .filter(
                (reading) =>

                  isReal(
                    reading
                  ) &&

                  sameZone(
                    reading,
                    targetZone
                  ) &&

                  String(
                    reading?.device_id ||
                    ""
                  ).toUpperCase() ===
                    SENSOR_DEVICE &&

                  ageMinutes(
                    reading.timestamp
                  ) <= 15
              )
              .sort(
                (a, b) =>
                  tsMs(
                    b.timestamp
                  ) -
                  tsMs(
                    a.timestamp
                  )
              );


          return (
            candidates.find(
              (reading) => {

                const fp =
                  readingFingerprint(
                    reading
                  );


                return (
                  fp &&
                  !beforeFingerprints.has(
                    fp
                  )
                );

              }
            ) ||
            null
          );

        };


      /* ========================================================
         CHECK IMMEDIATELY
      ======================================================== */

      let array =
        await refreshReadings();


      let found =
        accept(array);


      if (found) {

        setAcquisitionState(
          "done"
        );


        if (onReceived) {

          const completed =
            await onReceived(
              found
            );


          /*
           * If the callback produced a completed
           * deterministic result, return it.
           */

          return (
            completed ||
            found
          );

        }


        return found;

      }


      /* ========================================================
         POLL FOR 90 SECONDS
      ======================================================== */

      const deadline =
        Date.now() +
        POLL_TIMEOUT_MS;


      while (
        Date.now() <
        deadline
      ) {

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              POLL_MS
            )
        );


        array =
          await refreshReadings();


        found =
          accept(array);


        if (found) {

          setAcquisitionState(
            "done"
          );


          if (onReceived) {

            const completed =
              await onReceived(
                found
              );


            return (
              completed ||
              found
            );

          }


          return found;

        }

      }


      throw new Error(
        "No fresh REAL ESP32 reading was available within 90 seconds. Check that the ESP32 is connected and sending source REAL data for zone " +
          targetZone +
          "."
      );

    } catch (e) {

      setAcquisitionState(
        "error"
      );


      const message =
        e?.message ||
        "Sensor acquisition failed.";


      setError(
        message
      );


      throw e;

    }

  }


  /* ==========================================================
     SIMULATED SENSOR
  ========================================================== */

  async function simulateSensor(
    zoneId
  ) {

    setError("");


    try {

      const payload = {

        device_id:
          "CRAI-SIM-01",

        farm_id:
          1,

        zone_id:
          zoneId,

        source:
          "SIMULATED",

        soil_moisture:
          24.5,

        temperature:
          33.8,

        humidity:
          76.4,

        timestamp:
          new Date().toISOString(),

      };


      const response =
        await api.postSensorReading(
          payload
        );


      const array =
        await refreshReadings();


      return (
        response ||

        array.find(
          (reading) =>
            String(
              reading.source ||
              ""
            ).toUpperCase() ===
              "SIMULATED" &&

            sameZone(
              reading,
              zoneId
            )
        ) ||

        payload
      );

    } catch (e) {

      const message =
        e?.message ||
        "Simulation failed.";


      setError(
        message
      );


      throw e;

    }

  }


  /* ==========================================================
     ADVISORY
  ========================================================== */

  async function regenerateAdvisory(
    form,
    file
  ) {

    if (!file) {

      throw new Error(
        "The observation image is no longer available. Start a new observation."
      );

    }


    return analyze(
      form,
      file,
      {
        persistHistory:
          false,
      }
    );

  }


  /* ==========================================================
     SELECT HISTORY RESULT
  ========================================================== */

  function selectResult(
    item
  ) {

    if (!item) {
      return;
    }


    const normalized =
      persistResult(
        item
      );


    if (normalized) {

      setResult(
        normalized
      );

    }

  }


  /* ==========================================================
     RETURN
  ========================================================== */

  return {

    backend,

    ai,

    readings,

    result,

    history,

    refreshing,

    running,

    error,

    liveObservation,

    adaptive,

    quality,

    acquisitionState,

    sensorOnline,

    refreshAll,

    analyze,

    regenerateAdvisory,

    acquireSensor,

    simulateSensor,

    selectResult,

    setError,

  };

}