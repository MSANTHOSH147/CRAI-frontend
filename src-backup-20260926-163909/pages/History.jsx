import React, { useMemo } from "react";
import {
  Button,
  Card,
  Eyebrow,
  Icon,
  RiskBadge,
} from "../components/common/UI";

function parseTime(value) {
  if (!value) return null;

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? null : d;
}

function getTimestamp(item) {
  return (
    item?.timestamp ||
    item?.observed_at ||
    item?.created_at ||
    item?.createdAt ||
    null
  );
}

function fmtTime(value) {
  const d = parseTime(value);
  if (!d) return "—";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(value) {
  const d = parseTime(value);
  if (!d) return "—";

  return d.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

function fmtDateTime(value) {
  const d = parseTime(value);
  if (!d) return "Time unavailable";

  return d.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function diseaseName(value) {
  return String(value || "Unknown")
    .replaceAll("_", " ")
    .replace(/^Tomato /i, "")
    .replace(/^Potato /i, "");
}

function getScore(item) {
  const candidates = [
    item?.risk?.score,
    item?.risk_score,
    item?.field_risk,
  ];

  for (const value of candidates) {
    const n = Number(value);

    if (Number.isFinite(n)) {
      return Math.max(0, Math.min(100, n));
    }
  }

  return null;
}

function getLevel(item, score) {
  const level =
    item?.risk?.level ||
    item?.risk_level;

  if (level) {
    return String(level).toUpperCase();
  }

  if (score === null) return "UNKNOWN";
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 30) return "MODERATE";

  return "LOW";
}

export default function History({
  history = [],
  onObserve,
  onSelect,
}) {
  /*
   * Only completed observations with valid numeric
   * risk are displayed in the history.
   */
  const completed = useMemo(() => {
    return (Array.isArray(history) ? history : [])
      .map((item) => ({
        item,
        timestamp: parseTime(
          getTimestamp(item)
        ),
        score: getScore(item),
      }))
      .filter(
        (entry) =>
          entry.timestamp &&
          entry.score !== null
      )
      .sort(
        (a, b) =>
          a.timestamp.getTime() -
          b.timestamp.getTime()
      );
  }, [history]);


  /*
   * IMPORTANT:
   * Show only the latest 12 observations in the
   * visual trend. All records remain available below.
   */
  const chartData = useMemo(() => {
    return completed.slice(-12);
  }, [completed]);


  /*
   * Clean SVG chart.
   *
   * X = actual observation time
   * Y = risk 0–100
   */
  const chart = useMemo(() => {
    if (!chartData.length) {
      return {
        points: "",
        circles: [],
        labels: [],
      };
    }

    const firstTime =
      chartData[0].timestamp.getTime();

    const lastTime =
      chartData[
        chartData.length - 1
      ].timestamp.getTime();

    const timeRange =
      lastTime - firstTime || 1;

    const points = chartData
      .map((entry, index) => {
        const timestamp =
          entry.timestamp.getTime();

        const x =
          chartData.length === 1
            ? 50
            : ((timestamp - firstTime) /
                timeRange) *
              100;

        const y =
          100 - entry.score;

        return `${x},${y}`;
      })
      .join(" ");


    const circles = chartData.map(
      (entry, index) => {
        const timestamp =
          entry.timestamp.getTime();

        const x =
          chartData.length === 1
            ? 50
            : ((timestamp - firstTime) /
                timeRange) *
              100;

        const y =
          100 - entry.score;

        return {
          key:
            entry.item?.id ||
            entry.item?.observation_id ||
            `${timestamp}-${index}`,
          x,
          y,
          score: entry.score,
          time: fmtDateTime(
            getTimestamp(entry.item)
          ),
        };
      }
    );


    /*
     * Maximum 4 labels.
     * Prevents the old crowded/ugly axis.
     */
    const labelCount = Math.min(
      4,
      chartData.length
    );

    const labels = [];

    for (
      let i = 0;
      i < labelCount;
      i++
    ) {
      const index =
        labelCount === 1
          ? 0
          : Math.round(
              (i /
                (labelCount - 1)) *
                (chartData.length - 1)
            );

      labels.push(
        fmtTime(
          getTimestamp(
            chartData[index].item
          )
        )
      );
    }

    return {
      points,
      circles,
      labels,
    };
  }, [chartData]);


  const recent = useMemo(() => {
    return [...completed].reverse();
  }, [completed]);


  const latest =
    completed.length
      ? completed[
          completed.length - 1
        ]
      : null;


  const averageRisk =
    completed.length
      ? completed.reduce(
          (sum, entry) =>
            sum + entry.score,
          0
        ) / completed.length
      : null;


  const previous =
    completed.length >= 2
      ? completed[
          completed.length - 2
        ]
      : null;


  const riskChange =
    latest && previous
      ? latest.score -
        previous.score
      : null;


  return (
    <main className="content">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="page-head">

        <div>
          <Eyebrow>
            FIELD MEMORY · SERVER FIELD MEMORY
          </Eyebrow>

          <h1>
            Observation history
          </h1>

          <p>
            Completed observations persisted by
            CRAI, connecting disease signals,
            field risk and decisions over time.
          </p>
        </div>

        <div className="page-actions">
          <Button
            onClick={onObserve}
          >
            <Icon name="camera" />
            New observation
          </Button>
        </div>

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,minmax(0,1fr))",
          gap: "12px",
          marginBottom: "16px",
        }}
      >

        <Card>
          <Eyebrow>
            STORED OBSERVATIONS
          </Eyebrow>

          <div
            style={{
              marginTop: "8px",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {completed.length}
          </div>

          <p
            style={{
              marginTop: "5px",
              color: "#71827a",
              fontSize: "11px",
            }}
          >
            Completed CRAI decisions
          </p>
        </Card>


        <Card>
          <Eyebrow>
            LATEST FIELD RISK
          </Eyebrow>

          <div
            style={{
              marginTop: "8px",
              display: "flex",
              alignItems: "baseline",
              gap: "5px",
            }}
          >
            <strong
              style={{
                fontSize: "30px",
                letterSpacing: "-0.04em",
              }}
            >
              {latest
                ? latest.score.toFixed(1)
                : "—"}
            </strong>

            {latest && (
              <span
                style={{
                  color: "#7b8b84",
                  fontSize: "11px",
                }}
              >
                /100
              </span>
            )}
          </div>

          <p
            style={{
              marginTop: "5px",
              color: "#71827a",
              fontSize: "11px",
            }}
          >
            {latest
              ? getLevel(
                  latest.item,
                  latest.score
                )
              : "Awaiting observation"}
          </p>
        </Card>


        <Card>
          <Eyebrow>
            AVERAGE RISK
          </Eyebrow>

          <div
            style={{
              marginTop: "8px",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {averageRisk !== null
              ? averageRisk.toFixed(1)
              : "—"}
          </div>

          <p
            style={{
              marginTop: "5px",
              color: "#71827a",
              fontSize: "11px",
            }}
          >
            Across completed observations
          </p>
        </Card>


        <Card>
          <Eyebrow>
            RISK MOVEMENT
          </Eyebrow>

          <div
            style={{
              marginTop: "8px",
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {riskChange === null
              ? "—"
              : `${
                  riskChange >= 0
                    ? "+"
                    : ""
                }${riskChange.toFixed(1)}`}
          </div>

          <p
            style={{
              marginTop: "5px",
              color: "#71827a",
              fontSize: "11px",
            }}
          >
            Versus previous observation
          </p>
        </Card>

      </div>


      {/* =====================================================
          TREND + TIMELINE
      ====================================================== */}

      <div className="history-grid">


        {/* ===================================================
            RISK TREND
        ==================================================== */}

        <Card className="trend-card">

          <div className="card-title-row">

            <div>
              <Eyebrow>
                RISK TREND
              </Eyebrow>

              <h2>
                Field risk over time
              </h2>
            </div>

            <span className="version-pill">
              {chartData.length} RECENT
            </span>

          </div>


          <div
            className="trend-chart"
            style={{
              height: "320px",
              padding:
                "16px 20px 8px",
              position: "relative",
            }}
          >

            {chartData.length > 0 ? (
              <>

                {/* Horizontal grid */}

                <div
                  style={{
                    position: "absolute",
                    left: "52px",
                    right: "18px",
                    top: "32px",
                    bottom: "45px",
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "space-between",
                    pointerEvents: "none",
                  }}
                >
                  {[100,75,50,25,0].map(
                    (value) => (
                      <div
                        key={value}
                        style={{
                          borderTop:
                            "1px solid #e7eee9",
                          width: "100%",
                        }}
                      />
                    )
                  )}
                </div>


                {/* SVG */}

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-label="CRAI field risk trend"
                  style={{
                    position:
                      "absolute",
                    left: "52px",
                    right: "18px",
                    top: "32px",
                    width:
                      "calc(100% - 70px)",
                    height: "235px",
                    overflow:
                      "visible",
                    color: "#08783f",
                  }}
                >

                  <polyline
                    points={chart.points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chart.circles.map(
                    (point) => (
                      <circle
                        key={point.key}
                        cx={point.x}
                        cy={point.y}
                        r="2"
                        fill="white"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      >
                        <title>
                          {point.score.toFixed(
                            1
                          )}
                          {" risk · "}
                          {point.time}
                        </title>
                      </circle>
                    )
                  )}

                </svg>


                {/* Y labels */}

                <div
                  style={{
                    position:
                      "absolute",
                    left: "14px",
                    top: "28px",
                    bottom: "40px",
                    display: "flex",
                    flexDirection:
                      "column",
                    justifyContent:
                      "space-between",
                    color: "#91a098",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>


                {/* X labels */}

                <div
                  style={{
                    position:
                      "absolute",
                    left: "52px",
                    right: "18px",
                    bottom: "14px",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    color: "#91a098",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {chart.labels.map(
                    (label, index) => (
                      <span key={index}>
                        {label}
                      </span>
                    )
                  )}
                </div>

              </>
            ) : (

              <div className="table-empty">
                Your first completed CRAI
                observation will appear here.
              </div>

            )}

          </div>


          {/* Latest observation */}

          {latest && (
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "12px",
                padding:
                  "4px 20px 20px",
              }}
            >

              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "14px",
                  background:
                    "#edf7f1",
                  color: "#08783f",
                  display: "grid",
                  placeItems:
                    "center",
                  fontSize: "18px",
                  fontWeight: 900,
                }}
              >
                {latest.score.toFixed(1)}
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "13px",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {latest.item?.context
                    ?.zone_id ||
                    latest.item
                      ?.zone_id ||
                    "A1"}
                  {" · "}
                  {diseaseName(
                    latest.item?.visual
                      ?.disease ||
                      latest.item
                        ?.prediction
                  )}
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "4px",
                    color: "#7a8b83",
                    fontSize: "10px",
                  }}
                >
                  Latest completed observation ·{" "}
                  {fmtDateTime(
                    getTimestamp(
                      latest.item
                    )
                  )}
                </span>
              </div>

              <RiskBadge
                level={getLevel(
                  latest.item,
                  latest.score
                )}
              />

            </div>
          )}

        </Card>


        {/* ===================================================
            RECENT ACTIVITY
        ==================================================== */}

        <Card className="timeline-card">

          <div className="card-title-row">

            <div>
              <Eyebrow>
                RECENT ACTIVITY
              </Eyebrow>

              <h2>
                Analysis timeline
              </h2>
            </div>

            <span className="version-pill">
              {Math.min(
                recent.length,
                10
              )} RECENT
            </span>

          </div>


          <div className="timeline">

            {recent
              .slice(0, 10)
              .map((entry, index) => {

                const item =
                  entry.item;

                const timestamp =
                  getTimestamp(item);

                const score =
                  entry.score;

                const level =
                  getLevel(
                    item,
                    score
                  );

                return (
                  <button
                    key={
                      item?.id ||
                      item?.observation_id ||
                      `${timestamp}-${index}`
                    }
                    onClick={() =>
                      onSelect?.(item)
                    }
                    className="timeline-item"
                    type="button"
                  >

                    <span>
                      {fmtTime(timestamp)}
                    </span>

                    <div className="timeline-dot" />

                    <div>

                      <b>
                        {item?.context
                          ?.zone_id ||
                          item?.zone_id ||
                          "A1"}
                        {" · "}
                        {diseaseName(
                          item?.visual
                            ?.disease ||
                            item?.prediction
                        )}
                      </b>

                      <small>

                        <RiskBadge
                          level={level}
                        />

                        <em>
                          {score.toFixed(
                            1
                          )}
                          {" risk"}
                        </em>

                      </small>

                    </div>

                  </button>
                );
              })}

            {!recent.length && (
              <div className="table-empty">
                No completed CRAI observations yet.
              </div>
            )}

          </div>

        </Card>

      </div>


      {/* =====================================================
          FIELD MEMORY
      ====================================================== */}

      <Card>

        <div className="card-title-row">

          <div>
            <Eyebrow>
              FIELD MEMORY
            </Eyebrow>

            <h2>
              Observation records
            </h2>
          </div>

          <span className="version-pill">
            {completed.length} STORED
          </span>

        </div>


        <div className="history-records">

          {recent.map(
            (entry, index) => {

              const item =
                entry.item;

              const timestamp =
                getTimestamp(item);

              const zone =
                item?.context?.zone_id ||
                item?.zone_id ||
                "A1";

              const disease =
                diseaseName(
                  item?.visual
                    ?.disease ||
                    item?.prediction
                );

              const score =
                entry.score;

              const level =
                getLevel(
                  item,
                  score
                );

              return (
                <button
                  key={
                    item?.id ||
                    item?.observation_id ||
                    `${timestamp}-${index}`
                  }
                  onClick={() =>
                    onSelect?.(item)
                  }
                  className="history-record"
                  type="button"
                >

                  <div>
                    <b>
                      {zone}
                    </b>

                    <span>
                      {disease}
                    </span>
                  </div>


                  <div>

                    <RiskBadge
                      level={level}
                    />

                    <strong>
                      {score.toFixed(1)}
                    </strong>

                  </div>


                  <small>
                    {fmtDate(timestamp)}
                    {" · "}
                    {fmtTime(timestamp)}
                  </small>


                  <Icon
                    name="history"
                    size={17}
                  />

                </button>
              );
            }
          )}


          {!completed.length && (
            <div className="table-empty">
              No completed CRAI observations yet.
            </div>
          )}

        </div>

      </Card>

    </main>
  );
}